import type { inferAsyncReturnType } from "@trpc/server";
import { parse } from "cookie";
import { extractAndValidateInitData } from "./telegram-validation";
import { ENV } from "./env";
import { getSessionCookieName, verifySession } from "./session";

/**
 * Define o tipo do contexto para requisições tRPC.
 * Carrega o usuário autenticado a partir do Telegram initData validado
 * ou de um cookie de sessão JWT existente.
 */
interface InnerContext {
  telegramId?: number;
  isAuthenticated: boolean;
  /** true apenas quando telegramId consta em ENV.adminTelegramIds */
  isAdmin: boolean;
  /** true quando é moderador (acesso parcial ao painel, sem moderar usuários/flags) */
  isModerator: boolean;
  responseCookies: string[];
}

/**
 * Cria o contexto para requisições tRPC.
 * Ordem de autenticação:
 *   1. Cookie de sessão JWT (persistência entre requisições)
 *   2. Header Authorization: Bearer <initData>
 *   3. Header X-Telegram-Init-Data: <initData>
 */
export async function createVercelContext({
  req,
}: {
  req: Request;
}): Promise<InnerContext> {
  const responseCookies: string[] = [];

  // ── 1. Cookie de sessão ───────────────────────────────────────
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const sessionToken = cookies[getSessionCookieName()];

  if (sessionToken) {
    const telegramId = await verifySession(sessionToken);
    if (telegramId) {
      const isAdmin = ENV.adminTelegramIds.includes(telegramId);
      const isModerator = !isAdmin && ENV.moderatorTelegramIds.includes(telegramId);
      return {
        telegramId,
        isAuthenticated: true,
        isAdmin,
        isModerator,
        responseCookies,
      };
    }
  }

  // ── 2 & 3. initData via header ────────────────────────────────
  if (!ENV.telegramBotToken) {
    return { isAuthenticated: false, isAdmin: false, isModerator: false, responseCookies };
  }

  const authHeader = req.headers.get("Authorization");
  const altHeader = req.headers.get("X-Telegram-Init-Data");
  const authHeaderValue = authHeader || (altHeader ? `Bearer ${altHeader}` : null);

  if (authHeaderValue) {
    const result = extractAndValidateInitData(authHeaderValue, ENV.telegramBotToken);
    if (result.valid && result.telegramId) {
      const isAdmin = ENV.adminTelegramIds.includes(result.telegramId);
      const isModerator = !isAdmin && ENV.moderatorTelegramIds.includes(result.telegramId);
      return {
        telegramId: result.telegramId,
        isAuthenticated: true,
        isAdmin,
        isModerator,
        responseCookies,
      };
    }
  }

  return { isAuthenticated: false, isAdmin: false, isModerator: false, responseCookies };
}

// Alias usado pelo handler do tRPC no Next.js
export const createContext = createVercelContext;

export type Context = inferAsyncReturnType<typeof createVercelContext>;
