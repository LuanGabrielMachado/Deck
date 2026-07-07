import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { Context } from "./context";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.isAuthenticated || !ctx.telegramId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Autenticação necessária",
      });
    }

    return next({
      ctx: {
        ...ctx,
        isAuthenticated: true,
        telegramId: ctx.telegramId,
      },
    });
  }),
);

/** Procedure exclusiva para a administradora — verifica isAdmin no contexto */
export const adminProcedure = t.procedure.use(
  t.middleware(async ({ ctx, next }) => {
    if (!ctx.isAuthenticated || !ctx.telegramId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Autenticação necessária",
      });
    }
    if (!ctx.isAdmin && !ctx.isModerator) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Acesso negado",
      });
    }
    return next({
      ctx: {
        ...ctx,
        isAuthenticated: true as const,
        telegramId: ctx.telegramId,
        isAdmin: ctx.isAdmin,
        isModerator: ctx.isModerator,
      },
    });
  }),
);
