/**
 * Config Repository - Flags de configuração do servidor.
 */

import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { serverConfig } from "../../drizzle/schema";

// Cache em memória com TTL de 30s (conforme documentado)
const FLAG_CACHE_TTL_MS = 30 * 1000;
const flagCache = new Map<string, { value: string | null; expiresAt: number }>();

/**
 * Retorna valor de uma flag do servidor.
 * Cache em memória com TTL de 30s — evita round-trips ao banco em chamadas consecutivas.
 */
export async function getServerFlag(key: string): Promise<string | null> {
  const cached = flagCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const db = getDb();
  const row = await db.query.serverConfig.findFirst({
    where: eq(serverConfig.key, key),
  });
  const value = row?.value ?? null;

  flagCache.set(key, { value, expiresAt: Date.now() + FLAG_CACHE_TTL_MS });
  return value;
}

/**
 * Define ou atualiza uma flag do servidor.
 * Invalida o cache da flag alterada imediatamente.
 */
export async function setServerFlag(key: string, value: string): Promise<void> {
  // Invalida cache antes de escrever — próxima leitura reflete o novo valor
  flagCache.delete(key);

  const db = getDb();
  const now = new Date();
  await db
    .insert(serverConfig)
    .values({ key, value, updatedAt: now })
    .onConflictDoUpdate({
      target: serverConfig.key,
      set: { value, updatedAt: now },
    });
}

/**
 * Retorna todas as flags do servidor.
 */
export async function getAllServerFlags() {
  const db = getDb();
  return db.query.serverConfig.findMany();
}
