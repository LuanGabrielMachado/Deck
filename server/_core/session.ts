import { SignJWT, jwtVerify } from "jose";
import { serialize } from "cookie";
import { ENV } from "./env";

const SESSION_COOKIE = "deck_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

function getJwtKey(): Uint8Array {
  return new TextEncoder().encode(ENV.cookieSecret || "");
}

export async function signSession(telegramId: number): Promise<string> {
  const key = getJwtKey();
  return new SignJWT({ telegramId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key);
}

export async function verifySession(token: string): Promise<number | null> {
  if (!ENV.cookieSecret) return null;
  try {
    const key = getJwtKey();
    const { payload } = await jwtVerify(token, key);
    const telegramId = typeof payload.telegramId === "number"
      ? payload.telegramId
      : Number(payload.telegramId);
    return Number.isFinite(telegramId) ? telegramId : null;
  } catch {
    return null;
  }
}

export function createSessionCookie(token: string) {
  return serialize(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: ENV.isProduction,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}
