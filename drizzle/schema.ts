import {
  bigint,
  integer,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
  index,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

/**
 * Tabela de usuários simplificada, usando o ID do Telegram como chave primária.
 */
export const users = pgTable("users", {
  /**
   * ID do Telegram do usuário. Usado como chave primária.
   * BIGINT para suportar IDs grandes do Telegram (acima de 2 bilhões)
   */
  telegramId: bigint("telegramId", { mode: "number" }).primaryKey(),
  name: text("name"),
  photoUrl: text("photoUrl"),
  /** Timestamp do último post — persiste após delete (fonte da verdade do rate limit) */
  lastPostAt: timestamp("lastPostAt"),
  /** Timestamp da última resposta — rate limit separado de 30 min */
  lastReplyAt: timestamp("lastReplyAt"),
  /** Usuário banido: não pode logar nem criar posts */
  isBanned: boolean("isBanned").default(false).notNull(),
  /** Shadow ban: usuário pode postar mas ninguém vê seus posts */
  shadowBanned: boolean("shadowBanned").default(false).notNull(),
  /** Modo do feed: 'following' = só vê quem segue, 'all' = vê todos os posts */
  feedMode: varchar("feedMode", { length: 20 }).default('following').notNull(),
  /** Notificações via bot: true = recebe, false = optou por não receber */
  notificationsEnabled: boolean("notificationsEnabled").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => {
  return {
    nameIdx: index("idx_users_name").on(table.name),
    /** Índice para subquery de shadow ban nas queries de timeline */
    shadowBannedIdx: index("idx_users_shadowBanned").on(table.shadowBanned),
  };
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Posts table - armazena posts de microblog e broadcasts do admin.
 * O limite de 165 chars para posts normais é validado pelo Zod no router (post.router.ts).
 * O broadcast do admin pode ter até 999 chars — por isso a coluna é text sem limite fixo.
 */
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegramId", { mode: "number" })
    .notNull()
    .references(() => users.telegramId),
  content: text("content").notNull(),
  imagePath: text("imagePath"),
  /** ID do post original sendo respondido (nullable). ON DELETE CASCADE: apagar o original apaga as respostas. */
  replyToPostId: integer("replyToPostId"),
  /** JSON snapshot dos usuários mencionados via chip: [{telegramId, name, photoUrl}] */
  mentionedUsers: text("mentionedUsers"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => {
  return {
    authorIdx: index("idx_posts_telegramId").on(table.telegramId),
    createdIdx: index("idx_posts_createdAt").on(table.createdAt),
    replyIdx: index("idx_posts_replyToPostId").on(table.replyToPostId),
    /** Índice composto para timeline (author + created DESC) */
    authorCreatedIdx: index("idx_posts_telegramId_createdAt").on(table.telegramId, table.createdAt),
    /** Índice para efemeridade + author */
    ephemeralIdx: index("idx_posts_createdAt_telegramId").on(table.createdAt, table.telegramId),
  };
});

export type Post = typeof posts.$inferSelect;
export type InsertPost = typeof posts.$inferInsert;

/**
 * Follows table - relacionamento de seguidores
 */
export const follows = pgTable(
  "follows",
  {
    followerId: bigint("followerId", { mode: "number" })
      .notNull()
      .references(() => users.telegramId),
    followingId: bigint("followingId", { mode: "number" })
      .notNull()
      .references(() => users.telegramId),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.followerId, table.followingId] }),
      followerIdx: index("idx_follows_followerId").on(table.followerId),
      followingIdx: index("idx_follows_followingId").on(table.followingId),
    };
  }
);

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = typeof follows.$inferInsert;

/**
 * Reactions table - reações com stickers/emojis nos posts
 */
export const reactions = pgTable(
  "reactions",
  {
    postId: integer("postId")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    telegramId: bigint("telegramId", { mode: "number" })
      .notNull()
      .references(() => users.telegramId),
    emoji: varchar("emoji", { length: 10 }).notNull(), // Emoji ou sticker ID do Telegram
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.postId, table.telegramId, table.emoji] }),
      postIdx: index("idx_reactions_postId").on(table.postId),
      userIdx: index("idx_reactions_telegramId").on(table.telegramId),
    };
  }
);

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = typeof reactions.$inferInsert;


/**
 * ServerConfig table - flags globais do servidor (ex: modo manutenção, rate limit desativado)
 */
export const serverConfig = pgTable("serverConfig", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ServerConfig = typeof serverConfig.$inferSelect;

/**
 * AdminActions table - trilha de auditoria de todas as ações administrativas
 */
export const adminActions = pgTable("adminActions", {
  id: serial("id").primaryKey(),
  adminTelegramId: bigint("adminTelegramId", { mode: "number" }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  targetTelegramId: bigint("targetTelegramId", { mode: "number" }),
  targetPostId: integer("targetPostId"),
  previousValue: text("previousValue"),
  newValue: text("newValue"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => {
  return {
    adminIdx: index("idx_adminActions_adminTelegramId").on(table.adminTelegramId),
    createdIdx: index("idx_adminActions_createdAt").on(table.createdAt),
  };
});

export type AdminAction = typeof adminActions.$inferSelect;
export type InsertAdminAction = typeof adminActions.$inferInsert;

/**
 * Notifications table - fila de notificações via Bot API
 * Serve como queue, log de auditoria e mecanismo de retry.
 */
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  /** Tipo do evento: reply | reaction | follow */
  type: varchar("type", { length: 20 }).notNull(),
  /** Quem recebe a notificação (dono do post/perfil) */
  recipientId: bigint("recipientId", { mode: "number" })
    .notNull()
    .references(() => users.telegramId, { onDelete: "cascade" }),
  /** Quem gerou o evento */
  actorId: bigint("actorId", { mode: "number" })
    .notNull()
    .references(() => users.telegramId, { onDelete: "cascade" }),
  /** ID do post (reply/reaction) ou null (follow) */
  referenceId: integer("referenceId"),
  /** Emoji da reação (apenas para type = "reaction") */
  emoji: varchar("emoji", { length: 10 }),
  /** pending → sent | failed | skipped */
  status: varchar("status", { length: 10 }).notNull().default("pending"),
  retryCount: integer("retryCount").notNull().default(0),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  sentAt: timestamp("sentAt"),
}, (table) => ({
  recipientIdx: index("idx_notifications_recipientId").on(table.recipientId),
  statusIdx: index("idx_notifications_status").on(table.status),
  createdIdx: index("idx_notifications_createdAt").on(table.createdAt),
  /** Deduplicação: mesmo tipo + recipient + actor + referência = 1 notificação */
  dedupIdx: uniqueIndex("idx_notifications_dedup").on(
    table.type, table.recipientId, table.actorId, table.referenceId
  ),
  /** Índice composto para retry (status + retryCount) */
  retryIdx: index("idx_notifications_status_retry").on(table.status, table.retryCount),
  /** Índice para busca por tipo + status */
  typeStatusIdx: index("idx_notifications_type_status").on(table.type, table.status),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Logs table — LogVault: registro estruturado de eventos do sistema.
 * Fire-and-forget: nunca bloqueia operações principais.
 * Níveis: info | warn | error
 * Contextos: notification | post | reaction | follow | upload | rate_limit | cron | auth | system
 */
export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  level:   varchar("level",   { length: 10  }).notNull(), // 'info' | 'warn' | 'error'
  context: varchar("context", { length: 50  }).notNull(), // domínio do evento
  message: text("message").notNull(),
  /** Dados estruturados opcionais (JSON serializado) */
  meta:    text("meta"),
  /** ID do usuário relacionado (opcional) */
  actorId: bigint("actorId", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  levelIdx:   index("idx_logs_level").on(table.level),
  contextIdx: index("idx_logs_context").on(table.context),
  createdIdx: index("idx_logs_createdAt").on(table.createdAt),
  actorIdx:   index("idx_logs_actorId").on(table.actorId),
}));

export type Log = typeof logs.$inferSelect;
export type InsertLog = typeof logs.$inferInsert;

/**
 * Blocks table — bloqueios entre usuários.
 * blockerId bloqueia blockedId:
 *   - blockedId para de ver qualquer post de blockerId no feed
 *   - blockerId para de ver qualquer post de blockedId no feed
 * Efeito é imediato e bidirecional no feed.
 */
export const blocks = pgTable(
  "blocks",
  {
    blockerId: bigint("blockerId", { mode: "number" })
      .notNull()
      .references(() => users.telegramId, { onDelete: "cascade" }),
    blockedId: bigint("blockedId", { mode: "number" })
      .notNull()
      .references(() => users.telegramId, { onDelete: "cascade" }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    pk:         primaryKey({ columns: [table.blockerId, table.blockedId] }),
    blockerIdx: index("idx_blocks_blockerId").on(table.blockerId),
    blockedIdx: index("idx_blocks_blockedId").on(table.blockedId),
  })
);

export type Block = typeof blocks.$inferSelect;

/**
 * Ghostings table — ghosting temporário (48h).
 * ghosterId ghosta ghostedId:
 *   - ghostedId para de ver posts de ghosterId por 48h
 *   - ghosterId ainda vê posts de ghostedId
 *   - ghosterId não pode responder posts de ghostedId enquanto o ghosting estiver ativo
 * Bidirecional: se A ghosta B E B ghosta A, nenhum vê o outro.
 */
export const ghostings = pgTable(
  "ghostings",
  {
    ghosterId: bigint("ghosterId", { mode: "number" })
      .notNull()
      .references(() => users.telegramId, { onDelete: "cascade" }),
    ghostedId: bigint("ghostedId", { mode: "number" })
      .notNull()
      .references(() => users.telegramId, { onDelete: "cascade" }),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    pk:         primaryKey({ columns: [table.ghosterId, table.ghostedId] }),
    ghosterIdx: index("idx_ghostings_ghosterId").on(table.ghosterId),
    ghostedIdx: index("idx_ghostings_ghostedId").on(table.ghostedId),
    expiresIdx: index("idx_ghostings_expiresAt").on(table.expiresAt),
  })
);

export type Ghosting = typeof ghostings.$inferSelect;
