/**
 * Follow Repository - Operações de follow/unfollow.
 */

import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { follows, users } from "../../drizzle/schema";
import type { User } from "../../drizzle/schema";

/**
 * Segue um usuário (idempotente - onConflictDoNothing).
 */
export async function followUser(followerId: number, followingId: number): Promise<void> {
  const db = getDb();
  await db.insert(follows).values({ followerId, followingId }).onConflictDoNothing();
}

/**
 * Deixa de seguir um usuário.
 */
export async function unfollowUser(followerId: number, followingId: number): Promise<void> {
  const db = getDb();
  await db
    .delete(follows)
    .where(and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)));
}

/**
 * Verifica se está seguindo um usuário.
 */
export async function isFollowing(followerId: number, followingId: number): Promise<boolean> {
  const db = getDb();
  const result = await db.query.follows.findFirst({
    where: and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
  });
  return !!result;
}

/**
 * Retorna lista de usuários que o usuário segue.
 */
export async function getFollowing(telegramId: number): Promise<User[]> {
  const db = getDb();
  const result = await db
    .select({ user: users })
    .from(follows)
    .innerJoin(users, eq(follows.followingId, users.telegramId))
    .where(eq(follows.followerId, telegramId));

  return result.map((r) => r.user);
}
