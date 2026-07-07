import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getUserByTelegramId,
  getUserByTelegramIdForNotifications,
  followUser as followUserDB,
  unfollowUser as unfollowUserDB,
  isFollowing as isFollowingDB,
  getFollowing as getFollowingDB,
  insertNotification,
  markNotificationSent,
  markNotificationFailed,
  disableUserNotifications,
} from "../repositories";
import { notifyFollow } from "../bot/telegram-bot";
import { TRPCError } from "@trpc/server";
import { log } from "../_core/logger";

/**
 * Helper de notificação de follow.
 * Isolado para evitar circular dependency.
 */
async function sendFollowNotification(
  recipientId: number,
  actorId: number,
  actorName: string
): Promise<void> {
  try {
    if (recipientId === actorId) return;

    const notifId = await insertNotification({
      type: "follow",
      recipientId,
      actorId,
    });

    if (!notifId) return; // duplicata

    const result = await notifyFollow(recipientId, actorName);

    if (result.ok) {
      await markNotificationSent(notifId);
    } else {
      const isPermanent = result.errorCode === 403;
      if (isPermanent) {
        await disableUserNotifications(recipientId);
        log.warn('notification', 'Bot bloqueado no follow — notificações desativadas', {
          actorId,
          meta: { recipientId },
        });
      }
      await markNotificationFailed(notifId, result.description ?? "unknown", isPermanent);
    }
  } catch {
    // Silencioso - não quebra operação principal
  }
}

/**
 * Router de follows - seguir/deixar de seguir usuários.
 */
export const followRouter = router({
  /**
   * Segue um usuário.
   * Previne auto-follow.
   */
  follow: protectedProcedure
    .input(z.object({ followerId: z.number(), followingId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId;

      // Verificar ban
      const currentUser = await getUserByTelegramId(telegramId);
      if (currentUser?.isBanned) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi banida.' });
      }

      // Verificar que followerId corresponde ao usuário autenticado
      if (telegramId !== input.followerId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: "Você só pode seguir em sua própria conta" });
      }

      // Impedir auto-follow
      if (input.followerId === input.followingId) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: "Você não pode seguir a si mesmo" });
      }

      await followUserDB(input.followerId, input.followingId);

      log.info('follow', 'Usuário seguido', {
        actorId: telegramId,
        meta: { followingId: input.followingId },
      });

      // Notificar usuário que foi seguido (async)
      const actor = await getUserByTelegramIdForNotifications(telegramId);
      if (actor) {
        void sendFollowNotification(input.followingId, telegramId, actor.name || 'Usuário');
      }

      return { success: true };
    }),

  /**
   * Deixa de seguir um usuário.
   */
  unfollow: protectedProcedure
    .input(z.object({ followerId: z.number(), followingId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId;

      if (telegramId !== input.followerId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: "Você só pode deixar de seguir em sua própria conta" });
      }

      await unfollowUserDB(input.followerId, input.followingId);

      log.info('follow', 'Usuário deixou de seguir', {
        actorId: telegramId,
        meta: { followingId: input.followingId },
      });

      return { success: true };
    }),

  /**
   * Verifica se está seguindo um usuário.
   */
  isFollowing: protectedProcedure
    .input(z.object({ followerId: z.number(), followingId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.telegramId !== input.followerId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: "Você só pode consultar sua própria conta" });
      }

      const isFollowing = await isFollowingDB(input.followerId, input.followingId);
      return { isFollowing };
    }),

  /**
   * Lista de usuários que o usuário segue.
   */
  following: protectedProcedure
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.telegramId !== input.telegramId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: "Você só pode consultar sua própria conta" });
      }

      return getFollowingDB(ctx.telegramId);
    }),
});
