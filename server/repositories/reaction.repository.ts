/**
 * Reaction Repository - Operações de reações com emojis.
 */

import { eq, and, sql } from "drizzle-orm";
import { getDb } from "../db";
import { reactions } from "../../drizzle/schema";

/**
 * Adiciona reação (idempotente - onConflictDoNothing).
 */
export async function addReaction(postId: number, telegramId: number, emoji: string): Promise<void> {
  const db = getDb();
  await db.insert(reactions).values({ postId, telegramId, emoji }).onConflictDoNothing();
}

/**
 * Remove reação.
 */
export async function removeReaction(postId: number, telegramId: number, emoji: string): Promise<void> {
  const db = getDb();
  await db
    .delete(reactions)
    .where(and(eq(reactions.postId, postId), eq(reactions.telegramId, telegramId), eq(reactions.emoji, emoji)));
}

/**
 * Retorna reações de um post com contagem e userReacted.
 * Otimização: bool_or em uma única query.
 */
export async function getReactionsByPost(postId: number, telegramId: number) {
  const db = getDb();
  return db
    .select({
      emoji: reactions.emoji,
      count: sql<number>`count(${reactions.emoji})`.mapWith(Number),
      userReacted: sql<boolean>`bool_or(${reactions.telegramId} = ${telegramId})`,
    })
    .from(reactions)
    .where(eq(reactions.postId, postId))
    .groupBy(reactions.emoji);
}
