import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserByTelegramId,
  getUserByTelegramIdForNotifications,
  getUsersByTelegramIds,
  getServerFlag,
  getUserFeedMode,
  createPost,
  updateUserLastPostAt,
  getTimelinePosts,
  getUserPosts,
  countUserPosts,
  getPostById,
  deletePost,
  deleteAnyPost,
  updateUserLastReplyAt,
  getPostBasicById,
  insertNotification,
  markNotificationSent,
  markNotificationFailed,
  disableUserNotifications,
  logAdminAction,
  isGhosting,
  getThreadReplies,
  getReplyCount,
  getFollowing,
} from "../repositories";
import { notifyReply, notifyReaction, notifyFollow, notifyMention } from "../bot/telegram-bot";
import { storagePut } from "../storage";
import { TRPCError } from "@trpc/server";
import { SlowSocialRateLimiter } from "../_core/rate-limiter";
import { log } from "../_core/logger";

// ─── Singleton RateLimiter ────────────────────────────────────────
const rateLimiter = new SlowSocialRateLimiter();

// ─── Validação de Magic Bytes ─────────────────────────────────────
// Verifica assinatura binária real do arquivo, independente do MIME declarado pelo cliente
function hasValidImageMagicBytes(buffer: Buffer): boolean {
  if (buffer.length < 12) return false;
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
  // GIF87a / GIF89a: 47 49 46 38
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38) return true;
  // WebP: RIFF (52 49 46 46) nos primeiros 4 bytes + WEBP (57 45 42 50) no offset 8
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) return true;
  return false;
}

// ─── Helper de notificações ───────────────────────────────────────
// Encapsula ciclo completo: DB → Bot API → mark sent/failed
// Nunca lança exceção — erro é silenciado para não quebrar operação principal
async function sendNotification(params: {
  type: "reply" | "reaction" | "follow" | "mention";
  recipientId: number;
  actorId: number;
  referenceId?: number;
  replyContent?: string;
  emoji?: string;
  postContent?: string;
}): Promise<void> {
  try {
    // Nunca notificar a si mesmo
    if (params.recipientId === params.actorId) return;

    // Buscar recipient e actor em paralelo (1 round-trip)
    const [recipient, actor] = await Promise.all([
      getUserByTelegramIdForNotifications(params.recipientId),
      getUserByTelegramIdForNotifications(params.actorId),
    ]);

    if (!recipient?.notificationsEnabled || !actor?.name) return;

    // Registrar no DB (deduplicação via unique constraint)
    const notifId = await insertNotification({
      type: params.type,
      recipientId: params.recipientId,
      actorId: params.actorId,
      referenceId: params.referenceId,
      emoji: params.emoji,
    });

    if (!notifId) return; // null = duplicata, já foi enviado

    // Enviar imediatamente via Bot API
    let result: { ok: boolean; errorCode?: number; description?: string };
    if (params.type === "reply" && params.replyContent) {
      result = await notifyReply(params.recipientId, actor.name, params.replyContent);
    } else if (params.type === "reaction" && params.emoji && params.postContent) {
      result = await notifyReaction(params.recipientId, actor.name, params.emoji, params.postContent);
    } else if (params.type === "follow") {
      result = await notifyFollow(params.recipientId, actor.name);
    } else if (params.type === "mention" && params.postContent) {
      result = await notifyMention(params.recipientId, actor.name, params.postContent);
    } else {
      return;
    }

    // Atualizar status
    if (result.ok) {
      await markNotificationSent(notifId);
    } else {
      const isPermanent = result.errorCode === 403;
      if (isPermanent) {
        await disableUserNotifications(params.recipientId);
        log.warn('notification', 'Bot bloqueado — notificações desativadas permanentemente', {
          actorId: params.actorId,
          meta: { recipientId: params.recipientId, type: params.type },
        });
      } else {
        log.warn('notification', 'Falha ao enviar notificação', {
          actorId: params.actorId,
          meta: { type: params.type, errorCode: result.errorCode, description: result.description },
        });
      }
      await markNotificationFailed(notifId, result.description ?? "unknown", isPermanent);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    log.warn('notification', 'sendNotification falhou (ignorado)', {
      actorId: params.actorId,
      meta: { type: params.type, recipientId: params.recipientId, error: errorMessage },
    });
  }
}

// ─── Router Principal ─────────────────────────────────────────────
export const postRouter = router({
  /**
   * Cria um novo post com conteúdo e imagem opcional.
   * Rate limit: 10 minutos (admin bypassa).
   */
  create: protectedProcedure
    .input(
      z.object({
        telegramId: z.number(),
        content: z.string().min(1).max(165),
        imageBase64: z.string().optional(),
        mentionedIds: z.array(z.number()).max(3).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId;

      // Verificar ban (protege contra JWT válido pós-ban)
      const currentUser = await getUserByTelegramId(telegramId);
      if (currentUser?.isBanned) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi banida.' });
      }

      // Verificar modo manutenção (admin bypassa)
      if (!ctx.isAdmin) {
        const maintenanceFlag = await getServerFlag('maintenance_mode');
        if (maintenanceFlag === 'true') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'App em modo manutenção.' });
        }
        // Verificar bloqueio global de posts/replies
        const lockFlag = await getServerFlag('lock_posts_global');
        if (lockFlag === 'true') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'A tia tá nervosa hoje, bloqueou tudo' });
        }
      }

      // Rate limiting (3 camadas, admin bypassa)
      const canPost = await rateLimiter.canCreatePost(telegramId, ctx.isAdmin);
      if (!canPost.canPost) {
        log.info('rate_limit', 'Post bloqueado por rate limit', {
          actorId: telegramId,
          meta: { nextAllowedAt: canPost.nextAllowedAt?.toISOString(), timeRemainingMs: canPost.timeRemainingMs },
        });
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Aguarde até ${canPost.nextAllowedAt?.toLocaleTimeString('pt-BR')} para postar novamente`,
          cause: {
            nextAllowedAt: canPost.nextAllowedAt,
            timeRemainingMs: canPost.timeRemainingMs,
          },
        });
      }

      // Upload de imagem (opcional, máx 12MB intencional)
      let imagePath: string | undefined;
      if (input.imageBase64) {
        const rawImage = input.imageBase64.trim();
        const dataUrlMatch = rawImage.match(/^data:image\/(png|jpe?g|gif|webp);base64,/i);
        const base64Data = dataUrlMatch
          ? rawImage.slice(rawImage.indexOf(',') + 1)
          : rawImage;
        const mimeType = dataUrlMatch
          ? `image/${dataUrlMatch[1].toLowerCase().replace('jpg', 'jpeg')}`
          : 'image/jpeg';

        // Validar base64
        if (!/^[A-Za-z0-9+/=\s]+$/.test(base64Data)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Formato de imagem inválido' });
        }

        const buffer = Buffer.from(base64Data, 'base64');
        if (!buffer.length) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Imagem vazia' });
        }

        // Validar magic bytes — garante que o conteúdo é realmente uma imagem
        if (!hasValidImageMagicBytes(buffer)) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Arquivo não é uma imagem válida (JPEG, PNG, GIF ou WebP)' });
        }

        // Limite de 12MB (configuração intencional do admin)
        const maxBytes = 12 * 1024 * 1024;
        if (buffer.length > maxBytes) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Imagem muito grande (máx 12MB)' });
        }

        const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
        const fileName = `posts/${telegramId}_${Date.now()}.${ext}`;

        try {
          const result = await storagePut(fileName, buffer, mimeType);
          imagePath = result.url;
        } catch (error) {
          const errMsg = error instanceof Error ? error.message : 'Unknown';
          log.error('upload', 'Falha no upload de imagem', {
            actorId: telegramId,
            meta: { fileName, error: errMsg },
          });
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: error instanceof Error ? `Upload falhou: ${error.message}` : 'Upload falhou',
          });
        }
      }

      // Resolver snapshot dos usuários mencionados (server-side — não confia em dados do cliente)
      const uniqueMentionIds = [...new Set(input.mentionedIds ?? [])];
      const resolvedMentions = uniqueMentionIds.length > 0
        ? await getUsersByTelegramIds(uniqueMentionIds)
        : [];

      // Criar post no banco
      const postId = await createPost({
        telegramId,
        content: input.content,
        imagePath,
        mentionedUsersJson: resolvedMentions.length > 0 ? JSON.stringify(resolvedMentions) : null,
      });

      // Atualizar lastPostAt (rate limit híbrido - camada 2)
      await updateUserLastPostAt(telegramId);

      // Processar menções via chips — IDs já resolvidos no frontend (anti-spam garantido)
      if (uniqueMentionIds.length > 0) {
        const mentionedIds = uniqueMentionIds;
        void (async () => {
          try {
            const following = await getFollowing(telegramId);
            const followingIds = new Set(following.map((u) => u.telegramId));
            for (const recipientId of mentionedIds) {
              // Só notifica quem realmente é seguido (dupla validação)
              if (!followingIds.has(recipientId)) continue;
              void sendNotification({
                type: 'mention',
                recipientId,
                actorId: telegramId,
                referenceId: postId,
                postContent: input.content,
              });
            }
          } catch {
            // Silencioso — menções nunca quebram o post
          }
        })();
      }

      return { postId, imagePath };
    }),

  /**
   * Verifica se o usuário pode criar post (rate limit check).
   */
  canCreate: protectedProcedure.query(async ({ ctx }) => {
    return await rateLimiter.canCreatePost(ctx.telegramId, ctx.isAdmin);
  }),

  /**
   * Timeline com cursor-based pagination (id DESC).
   * Respeita feedMode do usuário (following/all).
   * Admin vê TODOS os posts (inclusive shadow-ban).
   */
  timeline: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(50).optional(),
        cursor: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      let feedMode: 'following' | 'all';
      if (ctx.isAdmin) {
        feedMode = 'all';
      } else {
        // flag global sobrepõe o modo individual — 'following' = desativada (null ou ausente)
        const globalFeedFlag = await getServerFlag('feed_mode_global');
        if (globalFeedFlag === 'all') {
          feedMode = 'all';
        } else {
          feedMode = await getUserFeedMode(ctx.telegramId);
        }
      }

      return getTimelinePosts(
        ctx.telegramId,
        input.limit,
        input.cursor,
        feedMode,
        ctx.isAdmin
      );
    }),

  /**
   * Posts de um usuário específico (com efemeridade: 7 dias).
   * Cursor-based pagination (id DESC) para performance.
   */
  byUser: protectedProcedure
    .input(
      z.object({
        telegramId: z.number(),
        limit: z.number().min(1).max(100).optional(),
        cursor: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return getUserPosts(input.telegramId, input.limit, input.cursor, ctx.isAdmin);
    }),

  /**
   * Contagem de posts de um usuário (com efemeridade).
   */
  countByUser: protectedProcedure
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ ctx, input }) => {
      const count = await countUserPosts(input.telegramId, ctx.isAdmin);
      return { count };
    }),

  /**
   * Busca post por ID (com author e replyToPost).
   */
  getById: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      return getPostById(input.postId);
    }),

  /**
   * Cria uma resposta a um post existente (pode ser seu próprio post).
   * Rate limit: 15 minutos (separado do post).
   */
  reply: protectedProcedure
    .input(
      z.object({
        replyToPostId: z.number(),
        content: z.string().min(1).max(100),
        mentionedIds: z.array(z.number()).max(3).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId;

      // Verificar ban
      const currentUser = await getUserByTelegramId(telegramId);
      if (currentUser?.isBanned) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi banida.' });
      }

      // Verificar modo manutenção
      if (!ctx.isAdmin) {
        const maintenanceFlag = await getServerFlag('maintenance_mode');
        if (maintenanceFlag === 'true') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'App em modo manutenção.' });
        }
        // Verificar bloqueio global de posts/replies
        const lockFlag = await getServerFlag('lock_posts_global');
        if (lockFlag === 'true') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'A tia tá nervosa hoje, bloqueou tudo' });
        }
      }

      // Rate limit para replies (15 min)
      const canReply = await rateLimiter.canCreateReply(telegramId, ctx.isAdmin);
      if (!canReply.canReply) {
        log.info('rate_limit', 'Reply bloqueada por rate limit', {
          actorId: telegramId,
          meta: { nextAllowedAt: canReply.nextAllowedAt?.toISOString(), timeRemainingMs: canReply.timeRemainingMs },
        });
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Você já respondeu recentemente. Aguarde um pouco.',
          cause: {
            nextAllowedAt: canReply.nextAllowedAt,
            timeRemainingMs: canReply.timeRemainingMs,
          },
        });
      }

      // Verificar post original
      const originalPost = await getPostById(input.replyToPostId);
      if (!originalPost) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post original não encontrado.' });
      }

      // Ghosting: não pode responder se estiver ghostando o autor do post
      if (!ctx.isAdmin && originalPost.telegramId !== telegramId) {
        const ghosting = await isGhosting(telegramId, originalPost.telegramId);
        if (ghosting) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Você está em modo ghosting com esta pessoa. 👻',
          });
        }
      }

      // Resolver snapshot dos usuários mencionados (server-side)
      const uniqueReplyMentionIds = [...new Set(input.mentionedIds ?? [])];
      const resolvedReplyMentions = uniqueReplyMentionIds.length > 0
        ? await getUsersByTelegramIds(uniqueReplyMentionIds)
        : [];

      // Criar resposta
      const postId = await createPost({
        telegramId,
        content: input.content,
        replyToPostId: input.replyToPostId,
        mentionedUsersJson: resolvedReplyMentions.length > 0 ? JSON.stringify(resolvedReplyMentions) : null,
      });

      // Atualizar lastReplyAt
      await updateUserLastReplyAt(telegramId);

      // Notificar autor do post original (async, não bloqueia)
      void sendNotification({
        type: "reply",
        recipientId: originalPost.telegramId,
        actorId: telegramId,
        referenceId: input.replyToPostId,
        replyContent: input.content,
      });

      // Processar menções via chips (mentionedIds) ou fallback para texto
      void (async () => {
        try {
          const ids = uniqueReplyMentionIds;
          if (ids.length === 0) return;
          const following = await getFollowing(telegramId);
          const followingIds = new Set(following.map((u) => u.telegramId));
          for (const recipientId of ids) {
            // Dupla validação: deve ser seguido e não pode ser o autor original (já notificado)
            if (!followingIds.has(recipientId)) continue;
            if (recipientId === originalPost.telegramId) continue;
            void sendNotification({
              type: 'mention',
              recipientId,
              actorId: telegramId,
              referenceId: postId,
              postContent: input.content,
            });
          }
        } catch {
          // Silencioso — menções nunca quebram a reply
        }
      })();

      return { postId };
    }),

  /**
   * Verifica se o usuário pode responder (rate limit check).
   */
  canReply: protectedProcedure.query(async ({ ctx }) => {
    return await rateLimiter.canCreateReply(ctx.telegramId, ctx.isAdmin);
  }),

  /**
   * Retorna respostas diretas a um post (thread — uma camada).
   */
  thread: protectedProcedure
    .input(z.object({
      postId:  z.number(),
      limit:   z.number().min(1).max(50).optional(),
      cursor:  z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return getThreadReplies(input.postId, ctx.telegramId, input.limit, input.cursor, ctx.isAdmin);
    }),

  /**
   * Conta respostas diretas a um post — usado para exibir o badge "Ver thread".
   */
  replyCount: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      const count = await getReplyCount(input.postId, ctx.isAdmin);
      return { count };
    }),

  /**
   * Deleta post (próprio ou admin).
   * NÃO reseta rate limit do autor.
   */
  delete: protectedProcedure
    .input(z.object({ postId: z.number(), telegramId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId;

      // Admin pode deletar qualquer post
      if (ctx.isAdmin) {
        await deleteAnyPost(input.postId);
        await logAdminAction({
          adminTelegramId: telegramId,
          action: 'delete_post',
          targetPostId: input.postId,
          notes: 'Post deletado pelo admin',
        });
        return { success: true };
      }

      // Usuário comum só pode deletar o próprio
      if (telegramId !== input.telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Você não tem permissão para deletar este post",
        });
      }

      await deletePost(input.postId, telegramId);
      // ⚠️ lastPostAt NÃO é alterado — rate limit persiste após delete
      return { success: true };
    }),
});
