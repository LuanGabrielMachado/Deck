import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "../_core/trpc";
import {
  getUserByTelegramId,
  getServerFlag,
  upsertTelegramUser,
} from "../repositories";
import { createSessionCookie, signSession } from "../_core/session";
import { ENV } from "../_core/env";
import { TRPCError } from "@trpc/server";

/**
 * Router de autenticação e gerenciamento de usuários do Telegram.
 */
export const telegramRouter = router({
  /**
   * Registra/atualiza usuário no banco a partir dos dados do Telegram.
   */
  login: publicProcedure
    .input(
      z.object({
        telegramId: z.number(),
        firstName: z.string(),
        lastName: z.string().optional(),
        username: z.string().optional(),
        photoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Validação do initData já foi feita no contexto
      if (!ctx.telegramId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: "initData inválido" });
      }

      // Valida correspondência do telegramId
      if (ctx.telegramId !== input.telegramId) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: "ID não corresponde" });
      }

      const name = [input.firstName, input.lastName].filter(Boolean).join(" ");
      const existingUser = await getUserByTelegramId(input.telegramId);

      // SEGURANÇA: Verificar ban antes do upsert
      if (existingUser?.isBanned) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Sua conta foi banida.' });
      }

      // Verificar modo manutenção — admin bypassa sempre
      const isAdminUser = ENV.adminTelegramIds.includes(input.telegramId);
      if (!isAdminUser) {
        const maintenanceFlag = await getServerFlag('maintenance_mode');
        if (maintenanceFlag === 'true') {
          throw new TRPCError({ code: 'PRECONDITION_FAILED', message: 'O app está em manutenção. Volte em breve! 🔧' });
        }
      }

      // Verificar flag de pause para novos usuários
      if (!existingUser) {
        const pauseFlag = await getServerFlag('pause_new_users');
        if (pauseFlag === 'true') {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Novos cadastros estão pausados.' });
        }
      }

      const result = await upsertTelegramUser(input.telegramId, name, input.photoUrl);

      // Criar session cookie se JWT_SECRET estiver configurado
      if (ENV.cookieSecret) {
        const token = await signSession(input.telegramId);
        ctx.responseCookies.push(createSessionCookie(token));
      }

      return result;
    }),

  /**
   * Retorna dados do usuário autenticado.
   */
  me: protectedProcedure
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.telegramId !== input.telegramId) {
        throw new TRPCError({ code: 'FORBIDDEN', message: "Você não tem permissão para acessar este usuário" });
      }
      return getUserByTelegramId(ctx.telegramId);
    }),

  /**
   * Verifica se o usuário autenticado tem privilégios de admin ou moderador.
   * Retorna role: 'deusa' | 'mod' | 'user'
   */
  isAdmin: protectedProcedure
    .query(({ ctx }) => ({
      isAdmin: ctx.isAdmin,
      isModerator: ctx.isModerator,
      role: (ctx.isAdmin ? 'deusa' : ctx.isModerator ? 'mod' : 'user') as 'deusa' | 'mod' | 'user',
    })),
});
