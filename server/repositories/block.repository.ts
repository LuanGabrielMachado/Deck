/**
 * Block Repository — bloqueios entre usuários.
 *
 * Bloquear é bidirecional no feed: A bloqueia B →
 *   - B some do feed de A
 *   - A some do feed de B
 * Mas o registro no banco é unidirecional (quem bloqueou quem).
 */

import { eq, or, and } from "drizzle-orm";
import { getDb } from "../db";
import { blocks } from "../../drizzle/schema";

/**
 * Cria um bloqueio. Idempotente — ignora se já existe.
 */
export async function blockUser(blockerId: number, blockedId: number): Promise<void> {
  const db = getDb();
  await db
    .insert(blocks)
    .values({ blockerId, blockedId })
    .onConflictDoNothing();
}

/**
 * Verifica se há bloqueio em qualquer direção entre dois usuários.
 */
export async function isBlocked(userA: number, userB: number): Promise<boolean> {
  const db = getDb();
  const result = await db.query.blocks.findFirst({
    where: or(
      and(eq(blocks.blockerId, userA), eq(blocks.blockedId, userB)),
      and(eq(blocks.blockerId, userB), eq(blocks.blockedId, userA)),
    ),
  });
  return !!result;
}

/**
 * Retorna subquery com IDs de todos os usuários bloqueados OU que bloquearam telegramId.
 * Usada como filtro no feed — exclui posts de usuários com bloqueio mútuo.
 */
export function getBlockedUsersSubquery(telegramId: number) {
  const db = getDb();
  // Retorna uma subquery de IDs — eficiente para usar em NOT IN / exclusão de feed
  return db
    .select({ id: blocks.blockedId })
    .from(blocks)
    .where(eq(blocks.blockerId, telegramId))
    .unionAll(
      db
        .select({ id: blocks.blockerId })
        .from(blocks)
        .where(eq(blocks.blockedId, telegramId))
    );
}
