import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import {
  getAdminStats,
  logAdminAction,
  getRecentAdminActions,
  getServerFlag,
  setServerFlag,
  getAllServerFlags,
  getUserForAdmin,
  setUserBanned,
  setUserShadowBanned,
  resetUserRateLimit,
  deleteAnyPost,
  setUserFeedMode,
  getLogs,
  createPost,
  getBroadcastPosts,
} from "../repositories";
import type { LogLevel, LogContext } from "../repositories";
import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";
import { log } from "../_core/logger";


/**
 * Router administrativo - moderação completa e flags do servidor.
 * Todas as procedures requerem isAdmin = true.
 */
export const adminRouter = router({
  /**
   * Stats rápidos para o dashboard admin.
   * Otimização: Promise.all para 3 queries paralelas.
   */
  getStats: adminProcedure.query(async () => {
    return getAdminStats();
  }),

  /**
   * Retorna todas as flags do servidor.
   */
  getFlags: adminProcedure.query(async () => {
    return getAllServerFlags();
  }),

  /**
   * Define ou atualiza uma flag do servidor.
   */
  setFlag: adminProcedure
    .input(
      z.object({
        key: z.enum(['maintenance_mode', 'pause_new_users', 'feed_mode_global', 'lock_posts_global']),
        value: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.isModerator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Moderadores não podem alterar flags.' });
      }
      const prev = await getServerFlag(input.key);
      await setServerFlag(input.key, input.value);

      // Auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'set_flag',
        previousValue: prev ?? undefined,
        newValue: input.value,
        notes: `Flag: ${input.key}`,
      });

      return { success: true };
    }),

  /**
   * Lookup de usuário para moderação.
   */
  getUser: adminProcedure
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const user = await getUserForAdmin(input.telegramId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      }
      return user;
    }),

  /**
   * Bane ou desbane um usuário.
   * SEGURANÇA: Admin não pode banir a si mesmo.
   */
  banUser: adminProcedure
    .input(z.object({ telegramId: z.number(), ban: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.isModerator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Moderadores não podem banir usuários.' });
      }
      // SEGURANÇA: Previne auto-ban
      if (ctx.telegramId === input.telegramId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Não é possível banir a si mesmo' });
      }

      const user = await getUserForAdmin(input.telegramId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      }

      await setUserBanned(input.telegramId, input.ban);

      // Auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: input.ban ? 'ban_user' : 'unban_user',
        targetTelegramId: input.telegramId,
        previousValue: String(user.isBanned),
        newValue: String(input.ban),
      });

      return { success: true };
    }),

  /**
   * Aplica ou remove shadow ban.
   * Usuário shadow-banado posta mas ninguém vê (exceto admin).
   */
  shadowBanUser: adminProcedure
    .input(z.object({ telegramId: z.number(), ban: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.isModerator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Moderadores não podem shadow-banir usuários.' });
      }
      // SEGURANÇA: Previne auto-shadow-ban
      if (ctx.telegramId === input.telegramId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Não é possível shadow-banir a si mesmo' });
      }
      const user = await getUserForAdmin(input.telegramId);
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Usuário não encontrado' });
      }

      await setUserShadowBanned(input.telegramId, input.ban);

      // Auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: input.ban ? 'shadow_ban_user' : 'remove_shadow_ban',
        targetTelegramId: input.telegramId,
        previousValue: String(user.shadowBanned),
        newValue: String(input.ban),
      });

      return { success: true };
    }),

  /**
   * Reseta rate limit de um usuário (posts e replies).
   */
  resetRateLimit: adminProcedure
    .input(z.object({ telegramId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.isModerator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Moderadores não podem resetar rate limit.' });
      }
      await resetUserRateLimit(input.telegramId);

      // Auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'reset_rate_limit',
        targetTelegramId: input.telegramId,
        notes: 'Rate limit resetado pelo admin',
      });

      return { success: true };
    }),

  /**
   * Deleta qualquer post (admin only).
   * NÃO reseta rate limit do autor.
   */
  deletePost: adminProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const deleted = await deleteAnyPost(input.postId);
      if (!deleted) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post não encontrado' });
      }

      // Auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'delete_post',
        targetPostId: input.postId,
        notes: 'Post deletado pelo admin',
      });

      return { success: true };
    }),

  /**
   * Altera feed mode de um usuário.
   * 'following' = vê apenas quem segue
   * 'all' = vê posts de todos
   */
  setUserFeedMode: adminProcedure
    .input(z.object({ telegramId: z.number(), feedMode: z.enum(['following', 'all']) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.isModerator) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Moderadores não podem alterar o feed mode.' });
      }
      await setUserFeedMode(input.telegramId, input.feedMode);

      // Auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'set_feed_mode',
        targetTelegramId: input.telegramId,
        newValue: input.feedMode,
      });

      return { success: true };
    }),

  /**
   * Retorna últimas ações administrativas (audit log).
   */
  getActions: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(100).default(30) }))
    .query(async ({ input }) => {
      return getRecentAdminActions(input.limit);
    }),

  /**
   * LogVault — logs estruturados do sistema.
   */
  getLogs: adminProcedure
    .input(z.object({
      level:   z.enum(['info', 'warn', 'error']).optional(),
      context: z.enum([
        'notification', 'post', 'reaction', 'follow',
        'upload', 'rate_limit', 'cron', 'auth', 'system',
      ]).optional(),
      since:   z.string().datetime().optional(),
      limit:   z.number().min(1).max(200).default(100),
      offset:  z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      return getLogs({
        level:   input.level   as LogLevel   | undefined,
        context: input.context as LogContext | undefined,
        since:   input.since ? new Date(input.since) : undefined,
        limit:   input.limit,
        offset:  input.offset,
      });
    }),

  /**
   * Broadcast — publica um aviso/changelog para todos os usuários.
   * Sem rate limit, sem restrições. Usa o telegramId do admin.
   * Conteúdo até 999 caracteres.
   */
  broadcast: adminProcedure
    .input(z.object({ content: z.string().min(1).max(999).trim() }))
    .mutation(async ({ ctx, input }) => {
      // Broadcast sempre publicado sob o telegramId do admin principal
      // para garantir alcance total (sem efemeridade, visível a todos).
      // Se quem publicou é moderadora, o admin principal "assina" o post.
      const mainAdminId = ENV.adminTelegramIds[0] ?? ctx.telegramId;
      const postId = await createPost({
        telegramId: mainAdminId,
        content: input.content,
      });

      await logAdminAction({
        adminTelegramId: ctx.telegramId, // quem realmente publicou
        action: 'broadcast_post',
        targetPostId: postId,
        notes: `Broadcast: ${input.content.slice(0, 80)}${input.content.length > 80 ? '…' : ''}`,
      });

      log.info('post', 'Broadcast publicado pelo admin', {
        actorId: ctx.telegramId,
        meta: { postId, length: input.content.length, publishedAs: mainAdminId },
      });

      return { success: true, postId };
    }),

  /**
   * Lista os broadcasts publicados pelo admin (para gerenciar na UI).
   */
  getBroadcasts: adminProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ ctx, input }) => {
      // Broadcasts são publicados sempre sob o admin principal — moderadores veem a mesma lista
      const broadcastAuthorId = ENV.adminTelegramIds[0] ?? ctx.telegramId;
      return getBroadcastPosts(broadcastAuthorId, input.limit);
    }),
});
