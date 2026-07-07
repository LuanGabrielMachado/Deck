/**
 * Database Connection - Singleton para conexão PostgreSQL.
 *
 * Pool otimizado para serverless (Vercel Functions) com:
 * - max: 3 conexões (limita custo em serverless)
 * - idle_timeout: 20s (libera rápido)
 * - connect_timeout: 10s (fail fast)
 *
 * @example
 * ```typescript
 * import { getDb } from '@/server/db';
 * const db = getDb();
 * ```
 */

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  users,
  posts,
  follows,
  reactions,
  serverConfig,
  adminActions,
  notifications,
  logs,
  blocks,
  ghostings,
} from "../drizzle/schema";
import {
  usersRelations,
  postsRelations,
  followsRelations,
  reactionsRelations,
  notificationsRelations,
  blocksRelations,
  ghostingsRelations,
} from "../drizzle/relations";
import { ENV } from "./_core/env";

const schema = {
  users,
  posts,
  follows,
  reactions,
  serverConfig,
  adminActions,
  notifications,
  logs,
  blocks,
  ghostings,
  usersRelations,
  postsRelations,
  followsRelations,
  reactionsRelations,
  notificationsRelations,
  blocksRelations,
  ghostingsRelations,
};

type DB = PostgresJsDatabase<typeof schema>;

let _db: DB | null = null;

declare global {
  var __dbShutdownRegistered: boolean | undefined;
}

interface DrizzleInternalClient {
  $client?: { end?: () => void };
}

function closeDbConnection() {
  if (_db) {
    const client = (_db as unknown as DrizzleInternalClient)?.$client;
    if (client && typeof client.end === 'function') {
      client.end();
    }
    _db = null;
  }
}

if (!globalThis.__dbShutdownRegistered) {
  globalThis.__dbShutdownRegistered = true;
  process.on("exit", closeDbConnection);
  process.on("SIGINT", () => {
    closeDbConnection();
    process.exit(0);
  });
  process.on("SIGTERM", () => {
    closeDbConnection();
    process.exit(0);
  });
}

/**
 * Retorna instância do banco de dados (singleton).
 */
export function getDb(): DB {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL não definida.");
    }
    const client = postgres(process.env.DATABASE_URL, {
      max: 3,
      idle_timeout: 20,
      connect_timeout: 10,
    });
    _db = drizzle(client, {
      schema,
      logger: !ENV.isProduction,
    });
  }
  return _db;
}
