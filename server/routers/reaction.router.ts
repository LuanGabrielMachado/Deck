import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserByTelegramId,
  getUserByTelegramIdForNotifications,
  getPostBasicById,
  insertNotification,
  markNotificationSent,
  markNotificationFailed,
  disableUserNotifications,
  addReaction,
  removeReaction,
} from "../repositories";
import { getReactionsByPost } from "../repositories/reaction.repository";
import { notifyReaction } from "../bot/telegram-bot";
import { TRPCError } from "@trpc/server";
import { log } from "../_core/logger";

// Emojis permitidos — whitelist fixa dos 12 emojis do produto
const ALLOWED_EMOJIS = ['👍', '🖕', '😂', '😱', '💀', '🔥', '❤️', '😍', '🤔', '🍪', '🐍', '🐮'] as const;
const allowedEmojiSchema = z.enum(ALLOWED_EMOJIS);

/**
 * Helper de notificação de reaction.
 * Encapsula ciclo completo: DB → Bot API → mark sent/failed.
 * Nunca lança exceção — silencioso para não quebrar a operação principal.
 */
async function sendReactionNotification(
  recipientId: number,
  actorId: number,
  actorName: string,
  postId: number,
  emoji: string,
  postContent: string
): Promise<void> {
  try {
    if (recipientId === actorId) return;

    const notifId = await insertNotification({
      type: "reaction",
      recipientId,
      actorId,
      referenceId: postId,
      emoji,
    });

    if (!notifId) return; // duplicata — unique constraint

    const result = await notifyReaction(recipientId, actorName, emoji, postContent);

    if (result.ok) {
      await markNotificationSent(notifId);
    } else {
      const isPermanent = result.errorCode === 403;
      if (isPermanent) {
        await disableUserNotifications(recipientId);
        log.warn('notification', 'Bot bloqueado na reação — notificações desativadas', {
          actorId,
          meta: { recipientId, emoji },
        });
      }
      await markNotificationFailed(notifId, result.description ?? "unknown", isPermanent);
    }
  } catch {
    // Silencioso — nunca quebra a operação principal
  }
}

/**
 * Router de reações - adicionar/remover/listar em posts.
 */
export const reactionRouter = router({
  /**
   * Adiciona reação a um post (idempotente via onConflictDoNothing).
   * Optimistic update no frontend.
   */
  add: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        telegramId: z.number(),
        emoji: allowedEmojiSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId;

      // Verificar ban
      const currentUser = await getUserByTelegramId(telegramId);
      if (currentUser?.isBanned) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi banida.' });
      }

      // Garantir que telegramId do input corresponde ao usuário autenticado
      if (telegramId !== input.telegramId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: "Você só pode reagir em sua própria conta" });
      }

      await addReaction(input.postId, telegramId, input.emoji);

      log.info('reaction', 'Reação adicionada', {
        actorId: telegramId,
        meta: { postId: input.postId, emoji: input.emoji },
      });

      // Notificar autor do post (async, fire-and-forget)
      const post = await getPostBasicById(input.postId);
      if (post) {
        const actor = await getUserByTelegramIdForNotifications(telegramId);
        if (actor) {
          void sendReactionNotification(
            post.telegramId,
            telegramId,
            actor.name || 'Usuário',
            input.postId,
            input.emoji,
            post.content
          );
        }
      }

      return { success: true };
    }),

  /**
   * Remove reação de um post.
   */
  remove: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        telegramId: z.number(),
        emoji: allowedEmojiSchema,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId;

      if (telegramId !== input.telegramId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: "Você só pode remover suas próprias reações" });
      }

      await removeReaction(input.postId, telegramId, input.emoji);

      log.info('reaction', 'Reação removida', {
        actorId: telegramId,
        meta: { postId: input.postId, emoji: input.emoji },
      });

      return { success: true };
    }),

  /**
   * Lista reações de um post com contagem e userReacted.
   * Otimização: bool_or em uma única query no repositório.
   */
  getByPost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getReactionsByPost(input.postId, ctx.telegramId);
    }),
});
