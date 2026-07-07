/**
 * Log Repository — LogVault.
 * Operações de escrita e leitura na tabela `logs`.
 */

import { desc, eq, gte, and, type SQL } from "drizzle-orm";
import { getDb } from "../db";
import { logs } from "../../drizzle/schema";
import type { InsertLog } from "../../drizzle/schema";

export type LogLevel   = 'info' | 'warn' | 'error';
export type LogContext =
  | 'notification'
  | 'post'
  | 'reaction'
  | 'follow'
  | 'upload'
  | 'rate_limit'
  | 'cron'
  | 'auth'
  | 'system';

/**
 * Insere um log. Fire-and-forget — não lança exceção.
 */
export async function insertLog(data: {
  level: LogLevel;
  context: LogContext;
  message: string;
  meta?: Record<string, unknown> | null;
  actorId?: number | null;
}): Promise<void> {
  try {
    const db = getDb();
    const row: InsertLog = {
      level:   data.level,
      context: data.context,
      message: data.message,
      meta:    data.meta ? JSON.stringify(data.meta) : null,
      actorId: data.actorId ?? null,
    };
    await db.insert(logs).values(row);
  } catch {
    // Log nunca quebra a operação principal — falha silenciosa
    // (evita loop: erro ao logar → tenta logar o erro → loop)
  }
}

/**
 * Retorna logs paginados com filtros opcionais.
 */
export async function getLogs(opts: {
  level?:   LogLevel;
  context?: LogContext;
  since?:   Date;
  limit?:   number;
  offset?:  number;
} = {}) {
  const db = getDb();
  const { level, context, since, limit = 100, offset = 0 } = opts;

  const conditions: SQL[] = [];
  if (level)   conditions.push(eq(logs.level,   level));
  if (context) conditions.push(eq(logs.context, context));
  if (since)   conditions.push(gte(logs.createdAt, since));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db
    .select()
    .from(logs)
    .where(where)
    .orderBy(desc(logs.createdAt))
    .limit(limit)
    .offset(offset);
}
