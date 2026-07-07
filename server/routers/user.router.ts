import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  searchUsersByName,
  getSuggestedUsers,
  setUserNotificationsEnabled,
  getUserByTelegramId,
  getUserPosts,
  getFollowing,
  blockUser,
  getPostById,
  ghostUser,
  unghostUser,
  isGhosting,
  deleteAccount,
} from "../repositories";
import { sendBotDocument, notifyReport } from "../bot/telegram-bot";
import { storageDelete } from "../storage";
import { log } from "../_core/logger";
import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";

// ── Formatação do arquivo de exportação ─────────────────────────────────────

function formatExportTxt(data: {
  user: { telegramId: number; name: string | null; createdAt: Date; feedMode: string; notificationsEnabled: boolean };
  posts: Array<{ id: number; content: string; imagePath: string | null; createdAt: Date; replyToPostId: number | null }>;
  following: Array<{ name: string | null }>;
  exportedAt: Date;
}): string {
  const line = '─'.repeat(48);
  const { user, posts, following, exportedAt } = data;

  const fmt = (d: Date) => d.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

  const lines: string[] = [
    '╔════════════════════════════════════════════════╗',
    '║         EXPORTAÇÃO DE DADOS — MARACUTÁIA       ║',
    '║              (LGPD — Art. 18, IV)              ║',
    '╚════════════════════════════════════════════════╝',
    '',
    `Gerado em: ${fmt(exportedAt)}`,
    '',
    line,
    '  DADOS DA CONTA',
    line,
    `Nome:                  ${user.name ?? '(sem nome)'}`,
    `Telegram ID:           ${user.telegramId}`,
    `Conta criada em:       ${fmt(user.createdAt)}`,
    `Modo de feed:          ${user.feedMode === 'all' ? 'Ver todos os posts' : 'Só quem sigo'}`,
    `Notificações:          ${user.notificationsEnabled ? 'Ativadas' : 'Desativadas'}`,
    '',
    line,
    `  POSTS (${posts.length} no total)`,
    line,
  ];

  if (posts.length === 0) {
    lines.push('  Nenhum post encontrado.');
  } else {
    for (const post of posts) {
      lines.push('');
      lines.push(`  [#${post.id}] ${fmt(post.createdAt)}`);
      if (post.replyToPostId) lines.push(`  ↩ Resposta ao post #${post.replyToPostId}`);
      lines.push(`  ${post.content}`);
      if (post.imagePath) lines.push(`  📎 Imagem: ${post.imagePath}`);
    }
  }

  lines.push('');
  lines.push(line);
  lines.push(`  SEGUINDO (${following.length})`);
  lines.push(line);

  if (following.length === 0) {
    lines.push('  Você não segue ninguém ainda.');
  } else {
    for (const u of following) lines.push(`  • ${u.name ?? '(sem nome)'}`);
  }

  lines.push('');
  lines.push(line);
  lines.push('  FIM DO ARQUIVO');
  lines.push(line);
  lines.push('');
  lines.push('Maracutáia respeita sua privacidade.');
  lines.push('Para dúvidas sobre seus dados, acesse o app.');

  return lines.join('\n');
}

/**
 * Router de usuários - busca, sugestões e exportação de dados.
 */
export const userRouter = router({
  /**
   * Busca usuários por nome (case-insensitive, sanitizado).
   */
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1).max(100),
        limit: z.number().min(1).max(50).optional(),
      })
    )
    .query(async ({ input }) => {
      return searchUsersByName(input.query, input.limit);
    }),

  /**
   * Sugere usuários para seguir (exclui já seguidos e o próprio).
   */
  suggested: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).optional() }))
    .query(async ({ ctx, input }) => {
      return getSuggestedUsers(ctx.telegramId, input.limit);
    }),

  /**
   * Ativa ou desativa notificações do usuário (opt-out).
   */
  setNotifications: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await setUserNotificationsEnabled(ctx.telegramId, input.enabled);
      return { success: true };
    }),

  /**
   * Exportação de dados do usuário (LGPD — Art. 18, IV).
   * Gera um .txt com todos os dados armazenados e envia via Bot Telegram.
   * Rate limit natural: operação pesada — o tRPC não executa duas vezes simultâneas.
   */
  exportData: protectedProcedure.mutation(async ({ ctx }) => {
    const telegramId = ctx.telegramId;

    // Busca tudo em paralelo
    // true = desativa o filtro de efemeridade para exportação completa dos dados (LGPD Art. 18, IV)
    // O usuário tem direito a todos os seus dados, independente da efemeridade do feed
    const [user, postsResult, following] = await Promise.all([
      getUserByTelegramId(telegramId),
      getUserPosts(telegramId, 500, undefined, true),
      getFollowing(telegramId),
    ]);

    if (!user) throw new Error('Usuário não encontrado');

    const txt = formatExportTxt({
      user: {
        telegramId: user.telegramId,
        name: user.name,
        createdAt: user.createdAt,
        feedMode: user.feedMode,
        notificationsEnabled: user.notificationsEnabled,
      },
      posts: postsResult.posts.map(p => ({
        id: p.id,
        content: p.content,
        imagePath: p.imagePath,
        createdAt: p.createdAt,
        replyToPostId: p.replyToPostId ?? null,
      })),
      following: following.map(u => ({ name: u.name })),
      exportedAt: new Date(),
    });

    const filename = `deck-dados-${telegramId}.txt`;
    const caption  = '📦 Seus dados do Maracutáia (LGPD)\n\nEste arquivo contém tudo que armazenamos sobre você.';

    const result = await sendBotDocument(telegramId, filename, txt, caption);

    if (!result.ok) {
      log.warn('system', 'Exportação de dados falhou ao enviar via bot', {
        actorId: telegramId,
        meta: { errorCode: result.errorCode, description: result.description },
      });
      throw new Error('Não foi possível enviar o arquivo. Verifique se o bot está ativo no seu Telegram.');
    }

    log.info('system', 'Exportação de dados concluída', { actorId: telegramId });
    return { success: true };
  }),

  /**
   * Exclui permanentemente a conta do usuário e todos os seus dados (LGPD Art. 18, VI).
   * Remove posts, replies, reações, follows, bloqueios, ghostings e notificações.
   * Imagens do Storage são limpas em background (fire-and-forget).
   */
  deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
    const telegramId = ctx.telegramId;

    const imagePaths = await deleteAccount(telegramId);

    // Limpa imagens do Storage em background — não bloqueia a resposta
    if (imagePaths.length > 0) {
      void Promise.allSettled(imagePaths.map((path) => storageDelete(path)));
    }

    log.info('system', 'Conta excluída pelo usuário (LGPD)', { actorId: telegramId });
    return { success: true };
  }),

  /**
   * Bloqueia um usuário.
   * Efeito imediato e bidirecional no feed — posts do bloqueado somem para o bloqueador e vice-versa.
   * Não pode bloquear a si mesmo.
   */
  block: protectedProcedure
    .input(z.object({ blockedId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.telegramId === input.blockedId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você não pode se bloquear.' });
      }
      const currentUser = await getUserByTelegramId(ctx.telegramId);
      if (currentUser?.isBanned) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi banida.' });
      }
      await blockUser(ctx.telegramId, input.blockedId);
      log.info('system', 'Usuário bloqueado', {
        actorId: ctx.telegramId,
        meta: { blockedId: input.blockedId },
      });
      return { success: true };
    }),

  /**
   * Ghosta um usuário por 48h.
   * ghostedId para de ver posts de ghosterId no feed.
   * ghosterId não pode responder posts de ghostedId.
   */
  ghost: protectedProcedure
    .input(z.object({ ghostedId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.telegramId === input.ghostedId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você não pode se ghostar.' });
      }
      const currentUser = await getUserByTelegramId(ctx.telegramId);
      if (currentUser?.isBanned) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi banida.' });
      }
      await ghostUser(ctx.telegramId, input.ghostedId);
      log.info('system', 'Ghosting aplicado', {
        actorId: ctx.telegramId,
        meta: { ghostedId: input.ghostedId },
      });
      return { success: true };
    }),

  /**
   * Remove ghosting imediatamente (Superada).
   */
  unghost: protectedProcedure
    .input(z.object({ ghostedId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await unghostUser(ctx.telegramId, input.ghostedId);
      log.info('system', 'Ghosting removido', {
        actorId: ctx.telegramId,
        meta: { ghostedId: input.ghostedId },
      });
      return { success: true };
    }),

  /**
   * Retorna se o usuário atual está ghostando targetId.
   * Chamado de forma lazy ao tocar no avatar — não polui o feed.
   */
  ghostStatus: protectedProcedure
    .input(z.object({ targetId: z.number() }))
    .query(async ({ ctx, input }) => {
      const ghosting = await isGhosting(ctx.telegramId, input.targetId);
      return { isGhosting: ghosting };
    }),

  /**
   * Denuncia um post — envia para todos os admins via bot.
   * Não expõe o conteúdo do reporter além do nome.
   */
  report: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const [reporter, post] = await Promise.all([
        getUserByTelegramId(ctx.telegramId),
        getPostById(input.postId),
      ]);

      // Ban check — aproveita o fetch já feito acima
      if (reporter?.isBanned) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi banida.' });
      }

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post não encontrado.' });
      }

      // Não denuncia post próprio
      if (post.telegramId === ctx.telegramId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: 'Você não pode denunciar seu próprio post.' });
      }

      void notifyReport({
        reporterName: reporter?.name ?? 'Anônimo',
        reporterId:   ctx.telegramId,
        postId:       input.postId,
        postContent:  post.content,
        postAuthorId: post.telegramId,
        adminIds:     ENV.adminTelegramIds,
      });

      log.info('system', 'Post denunciado', {
        actorId: ctx.telegramId,
        meta: { postId: input.postId, postAuthorId: post.telegramId },
      });
      return { success: true };
    }),
});
