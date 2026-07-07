/**
 * Admin Repository - Operações administrativas e auditoria.
 */

import { desc, sql, gte, eq } from "drizzle-orm";
import { getDb } from "../db";
import { users, posts, adminActions } from "../../drizzle/schema";
import type { InsertAdminAction } from "../../drizzle/schema";

/**
 * Stats rápidos para admin dashboard.
 * Otimização: Promise.all para 3 queries paralelas.
 */
export async function getAdminStats(): Promise<{
  postsToday: number;
  totalUsers: number;
  bannedUsers: number;
}> {
  const db = getDb();
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [postsToday, totalUsers, bannedUsers] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(posts)
      .where(gte(posts.createdAt, oneDayAgo)),
    db.select({ count: sql<number>`count(*)`.mapWith(Number) }).from(users),
    db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(users)
      .where(eq(users.isBanned, true)),
  ]);

  return {
    postsToday: postsToday[0]?.count ?? 0,
    totalUsers: totalUsers[0]?.count ?? 0,
    bannedUsers: bannedUsers[0]?.count ?? 0,
  };
}

/**
 * Registra ação administrativa na trilha de auditoria.
 */
export async function logAdminAction(data: InsertAdminAction) {
  const db = getDb();
  const result = await db.insert(adminActions).values(data).returning();
  return result[0];
}

/**
 * Retorna últimas ações administrativas.
 */
export async function getRecentAdminActions(limit: number = 20) {
  const db = getDb();
  return db.query.adminActions.findMany({
    orderBy: desc(adminActions.createdAt),
    limit,
  });
}
