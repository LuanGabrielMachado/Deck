/**
 * Notification Repository - Fila de notificações via Bot.
 */

import { eq, and, isNull, sql, lt, desc } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getDb } from "../db";
import { notifications, users, posts } from "../../drizzle/schema";

// Aliases corretos para o self-join: mesmo schema, nomes distintos
const actorUser     = alias(users, "actor");
const recipientUser = alias(users, "recipient");

/**
 * Cria registro de notificação pendente.
 * Retorna null se era duplicata (unique constraint).
 */
export async function insertNotification(data: {
  type: "reply" | "reaction" | "follow" | "mention";
  recipientId: number;
  actorId: number;
  referenceId?: number | null;
  emoji?: string;
}): Promise<number | null> {
  const db = getDb();
  try {
    // Para notificações sem referenceId (ex: follow), o unique constraint
    // (type, recipientId, actorId, referenceId) não deduplicará corretamente
    // porque PostgreSQL trata NULL != NULL em unique indexes.
    // Solução: verificação atômica via INSERT ... ON CONFLICT DO UPDATE retornando apenas se inseriu.
    // Para o caso NULL, usamos uma query de deduplicação prévia protegida por try/catch de race.
    if (data.referenceId == null) {
      // Tenta inserir; se já existir exatamente esse registro (type + recipient + actor + NULL ref),
      // ON CONFLICT não cobre NULLs — mas o catch captura qualquer violação de unique parcial.
      const existing = await db
        .select({ id: notifications.id })
        .from(notifications)
        .where(
          and(
            eq(notifications.type, data.type),
            eq(notifications.recipientId, data.recipientId),
            eq(notifications.actorId, data.actorId),
            isNull(notifications.referenceId),
            // Só considera notificações recentes (últimas 24h) para evitar bloquear re-follows
            sql`${notifications.createdAt} > NOW() - INTERVAL '24 hours'`,
          )
        )
        .limit(1);
      if (existing.length > 0) return null; // duplicata recente
    }

    const result = await db
      .insert(notifications)
      .values({
        type: data.type,
        recipientId: data.recipientId,
        actorId: data.actorId,
        referenceId: data.referenceId ?? null,
        emoji: data.emoji,
        status: "pending",
      })
      .onConflictDoNothing()
      .returning({ id: notifications.id });

    return result[0]?.id ?? null;
  } catch {
    // Captura qualquer violação de constraint (inclusive race conditions)
    return null;
  }
}

/**
 * Atualiza notificação para "sent".
 */
export async function markNotificationSent(id: number): Promise<void> {
  const db = getDb();
  await db
    .update(notifications)
    .set({ status: "sent", sentAt: new Date() })
    .where(eq(notifications.id, id));
}

/**
 * Atualiza notificação com erro e incrementa retryCount.
 * permanent=true → status "skipped" (erro definitivo, sem retry)
 * permanent=false → status "pending" (tentará novamente no cron)
 */
export async function markNotificationFailed(
  id: number,
  errorMessage: string,
  permanent = false
): Promise<void> {
  const db = getDb();
  await db
    .update(notifications)
    .set({
      status: permanent ? "skipped" : "pending",
      errorMessage,
      retryCount: sql`${notifications.retryCount} + 1`,
    })
    .where(eq(notifications.id, id));
}

/**
 * Retorna notificações pendentes para retry (máx 3 tentativas).
 * Usa alias() do Drizzle para self-join correto na tabela users.
 */
export async function getPendingNotifications(limit = 50) {
  const db = getDb();

  return db
    .select({
      id: notifications.id,
      type: notifications.type,
      recipientId: notifications.recipientId,
      actorId: notifications.actorId,
      referenceId: notifications.referenceId,
      emoji: notifications.emoji,
      retryCount: notifications.retryCount,
      actorName: actorUser.name,
      recipientNotificationsEnabled: recipientUser.notificationsEnabled,
    })
    .from(notifications)
    .leftJoin(actorUser, eq(actorUser.telegramId, notifications.actorId))
    .leftJoin(recipientUser, eq(recipientUser.telegramId, notifications.recipientId))
    .where(
      and(
        eq(notifications.status, "pending"),
        lt(notifications.retryCount, 3),
      )
    )
    .limit(limit);
}

/**
 * Busca conteúdo de reply para notificação.
 */
export async function getReplyContent(
  originalPostId: number,
  authorTelegramId: number,
): Promise<string | null> {
  const db = getDb();
  const reply = await db.query.posts.findFirst({
    where: and(
      eq(posts.replyToPostId, originalPostId),
      eq(posts.telegramId, authorTelegramId),
    ),
    columns: { content: true },
    orderBy: desc(posts.createdAt),
  });
  return reply?.content ?? null;
}
