/**
 * User Repository - Operações de banco de dados para usuários.
 * 
 * Responsável por todas as operações na tabela `users`.
 * Mantém coerência com arquitetura tRPC + Drizzle ORM.
 */

import { eq, and, sql, not, inArray, or } from "drizzle-orm";
import { getDb } from "../db";
import { users, follows, posts, reactions, notifications, blocks, ghostings, logs } from "../../drizzle/schema";
import type { User, InsertUser } from "../../drizzle/schema";

// ─────────────────────────────────────────────────────────────────────────────
// CRUD Operations
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Cria ou atualiza usuário no banco (upsert).
 * Usado no login via Telegram.
 */
export async function upsertTelegramUser(
  telegramId: number,
  name: string,
  photoUrl?: string | null
): Promise<User | null> {
  const db = getDb();
  await db
    .insert(users)
    .values({ telegramId, name, photoUrl })
    .onConflictDoUpdate({
      target: users.telegramId,
      set: { name, photoUrl },
    });
  return getUserByTelegramId(telegramId);
}

/**
 * Busca usuário por telegramId.
 */
export async function getUserByTelegramId(telegramId: number): Promise<User | null> {
  const db = getDb();
  const result = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });
  return result ?? null;
}

/**
 * Busca usuário por telegramId (apenas campos para notificações).
 * Otimização: retorna apenas campos necessários.
 */
export async function getUserByTelegramIdForNotifications(telegramId: number) {
  const db = getDb();
  const result = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
    columns: {
      telegramId: true,
      name: true,
      notificationsEnabled: true,
    },
  });
  return result ?? null;
}

/**
 * Busca usuário para moderação (admin).
 */
export async function getUserForAdmin(telegramId: number) {
  const db = getDb();
  const result = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
    columns: {
      telegramId: true,
      name: true,
      photoUrl: true,
      lastPostAt: true,
      isBanned: true,
      shadowBanned: true,
      feedMode: true,
      createdAt: true,
    },
  });
  return result ?? null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Search & Suggestions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Busca usuários por nome (case-insensitive, sanitizado).
 * Filtra banidos e shadow-banned.
 */
export async function searchUsersByName(query: string, limit: number = 20): Promise<User[]> {
  const db = getDb();
  // Sanitiza wildcards LIKE para evitar pattern matching não intencional
  const sanitizedQuery = query.toLowerCase().replace(/[%_\\]/g, '\\$&');
  return db.query.users.findMany({
    where: and(
      sql`lower(${users.name}) like ${'%' + sanitizedQuery + '%'}`,
      eq(users.isBanned, false),
      eq(users.shadowBanned, false),
    ),
    limit,
  });
}

/**
 * Sugere usuários para seguir.
 * Exclui: já seguidos, próprio usuário, banidos, shadow-banned.
 */
export async function getSuggestedUsers(telegramId: number, limit: number = 20): Promise<User[]> {
  const db = getDb();
  const followedUsersQuery = db
    .select({ id: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, telegramId));

  return db.query.users.findMany({
    where: and(
      not(inArray(users.telegramId, followedUsersQuery)),
      not(eq(users.telegramId, telegramId)),
      eq(users.isBanned, false),
      eq(users.shadowBanned, false),
    ),
    limit,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// User Settings
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Ativa ou desativa notificações do usuário (opt-out).
 */
export async function setUserNotificationsEnabled(
  telegramId: number,
  enabled: boolean
): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({ notificationsEnabled: enabled })
    .where(eq(users.telegramId, telegramId));
}

/**
 * Desativa notificações permanentemente (403 - usuário bloqueou bot).
 */
export async function disableUserNotifications(telegramId: number): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({ notificationsEnabled: false })
    .where(eq(users.telegramId, telegramId));
}

/**
 * Retorna feedMode atual do usuário.
 */
export async function getUserFeedMode(telegramId: number): Promise<'following' | 'all'> {
  const db = getDb();
  const result = await db
    .select({ feedMode: users.feedMode })
    .from(users)
    .where(eq(users.telegramId, telegramId))
    .limit(1);
  const mode = result[0]?.feedMode;
  return mode === 'all' ? 'all' : 'following';
}

/**
 * Atualiza feed mode do usuário.
 */
export async function setUserFeedMode(telegramId: number, feedMode: 'following' | 'all'): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({ feedMode })
    .where(eq(users.telegramId, telegramId));
}

// ─────────────────────────────────────────────────────────────────────────────
// Rate Limit Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Atualiza users.lastPostAt — chave do rate limit híbrido (posts).
 * Deve ser chamada imediatamente após cada post criado com sucesso.
 */
export async function updateUserLastPostAt(telegramId: number, timestamp: Date = new Date()): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({ lastPostAt: timestamp })
    .where(eq(users.telegramId, telegramId));
}

/**
 * Atualiza users.lastReplyAt — chave do rate limit híbrido (replies).
 * Deve ser chamada imediatamente após cada resposta criada com sucesso.
 */
export async function updateUserLastReplyAt(telegramId: number, timestamp: Date = new Date()): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({ lastReplyAt: timestamp })
    .where(eq(users.telegramId, telegramId));
}

/**
 * Reseta rate limit de um usuário — zera lastPostAt E lastReplyAt.
 */
export async function resetUserRateLimit(telegramId: number): Promise<void> {
  const db = getDb();
  await db
    .update(users)
    .set({ lastPostAt: null, lastReplyAt: null })
    .where(eq(users.telegramId, telegramId));
}

// ─────────────────────────────────────────────────────────────────────────────
// Moderation
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bane ou desbane um usuário.
 */
export async function setUserBanned(telegramId: number, banned: boolean): Promise<void> {
  const db = getDb();
  await db.update(users).set({ isBanned: banned }).where(eq(users.telegramId, telegramId));
}

/**
 * Aplica ou remove shadow ban.
 */
export async function setUserShadowBanned(telegramId: number, shadowBanned: boolean): Promise<void> {
  const db = getDb();
  await db.update(users).set({ shadowBanned }).where(eq(users.telegramId, telegramId));
}

/**
 * Busca dados básicos de múltiplos usuários por telegramId (para snapshot de menções).
 * Retorna apenas telegramId, name e photoUrl — sem dados sensíveis.
 */
export async function getUsersByTelegramIds(
  telegramIds: number[]
): Promise<{ telegramId: number; name: string | null; photoUrl: string | null }[]> {
  if (telegramIds.length === 0) return [];
  const db = getDb();
  return db
    .select({ telegramId: users.telegramId, name: users.name, photoUrl: users.photoUrl })
    .from(users)
    .where(inArray(users.telegramId, telegramIds));
}

/**
 * Exclui permanentemente a conta do usuário e todos os seus dados (LGPD Art. 18, VI).
 *
 * Ordem de deleção (respeita FKs):
 *   1. ghostings (bloqueador ou bloqueado)
 *   2. blocks (bloqueador ou bloqueado)
 *   3. notifications (ator ou destinatário)
 *   4. reactions (autor)
 *   5. posts (autor) — CASCADE apaga replies filhas automaticamente
 *   6. follows (seguidor ou seguido)
 *   7. users (registro principal)
 *
 * Retorna a lista de imagePaths dos posts do usuário para que o caller
 * possa limpar o Storage (fire-and-forget, não bloqueia a deleção do registro).
 */
export async function deleteAccount(telegramId: number): Promise<string[]> {
  const db = getDb();

  // Busca imagePaths antes da transação (apenas SELECT — não precisa ser atômico com os DELETEs)
  const userPosts = await db
    .select({ imagePath: posts.imagePath })
    .from(posts)
    .where(eq(posts.telegramId, telegramId));

  const imagePaths = userPosts
    .map((p) => p.imagePath)
    .filter((p): p is string => p !== null);

  // Deleção em transação atômica — garante que nenhum dado fique parcialmente removido
  // em caso de falha no meio do processo (ex: queda de conexão, timeout, FK violation)
  await db.transaction(async (tx) => {
    // Deleção em ordem (FKs sem CASCADE precisam ser limpas antes do usuário)
    await tx.delete(ghostings).where(
      or(eq(ghostings.ghosterId, telegramId), eq(ghostings.ghostedId, telegramId))
    );
    await tx.delete(blocks).where(
      or(eq(blocks.blockerId, telegramId), eq(blocks.blockedId, telegramId))
    );
    await tx.delete(notifications).where(
      or(eq(notifications.recipientId, telegramId), eq(notifications.actorId, telegramId))
    );
    await tx.delete(reactions).where(eq(reactions.telegramId, telegramId));
    await tx.delete(posts).where(eq(posts.telegramId, telegramId)); // CASCADE apaga replies
    await tx.delete(follows).where(
      or(eq(follows.followerId, telegramId), eq(follows.followingId, telegramId))
    );
    // LGPD Art. 18, VI: remove logs do usuário antes de apagar o registro principal
    await tx.delete(logs).where(eq(logs.actorId, telegramId));
    await tx.delete(users).where(eq(users.telegramId, telegramId));
  });

  return imagePaths;
}

