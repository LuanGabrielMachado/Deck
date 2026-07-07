/**
 * Ghost Repository — ghosting temporário de 48h entre usuários.
 *
 * ghosterId ghosta ghostedId:
 *   - ghostedId para de ver posts de ghosterId no feed (por 48h)
 *   - ghosterId ainda vê posts de ghostedId normalmente
 *   - ghosterId não pode responder posts de ghostedId enquanto ativo
 *
 * Expiração: checada on-the-fly via expiresAt — sem necessidade de cron.
 */

import { eq, and, gt, or } from "drizzle-orm";
import { getDb } from "../db";
import { ghostings } from "../../drizzle/schema";

const GHOST_DURATION_MS = 48 * 60 * 60 * 1000; // 48 horas

/**
 * Cria ou renova um ghosting por 48h.
 * Se já existe, atualiza o expiresAt (renova os 48h).
 */
export async function ghostUser(ghosterId: number, ghostedId: number): Promise<void> {
  const db = getDb();
  const expiresAt = new Date(Date.now() + GHOST_DURATION_MS);

  await db
    .insert(ghostings)
    .values({ ghosterId, ghostedId, expiresAt })
    .onConflictDoUpdate({
      target: [ghostings.ghosterId, ghostings.ghostedId],
      set: { expiresAt, createdAt: new Date() },
    });
}

/**
 * Remove ghosting imediatamente (Superada).
 */
export async function unghostUser(ghosterId: number, ghostedId: number): Promise<void> {
  const db = getDb();
  await db
    .delete(ghostings)
    .where(and(eq(ghostings.ghosterId, ghosterId), eq(ghostings.ghostedId, ghostedId)));
}

/**
 * Verifica se ghosterId está ghostando ghostedId ativamente (não expirado).
 */
export async function isGhosting(ghosterId: number, ghostedId: number): Promise<boolean> {
  const db = getDb();
  const result = await db.query.ghostings.findFirst({
    where: and(
      eq(ghostings.ghosterId, ghosterId),
      eq(ghostings.ghostedId, ghostedId),
      gt(ghostings.expiresAt, new Date()),
    ),
  });
  return !!result;
}

/**
 * Retorna subquery com IDs de autores cujos posts devem ser ocultados do viewer.
 * Lógica: autor que ghostou o viewer (autor.ghosterId = post.telegramId, ghostedId = viewer).
 * Usado no feed para ocultar posts de quem te ghostou.
 */
export function getGhostedAuthorsSubquery(viewerTelegramId: number) {
  const db = getDb();
  const now = new Date();
  // Retorna IDs de quem ghostou o viewer e ainda não expirou
  return db
    .select({ id: ghostings.ghosterId })
    .from(ghostings)
    .where(
      and(
        eq(ghostings.ghostedId, viewerTelegramId),
        gt(ghostings.expiresAt, now),
      )
    );
}
