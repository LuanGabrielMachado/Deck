import { relations } from "drizzle-orm";
import { users, posts, follows, reactions, notifications, blocks, ghostings } from "./schema";

// ─── Users ────────────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  reactions: many(reactions),
  following: many(follows, { relationName: 'follower' }),
  followers: many(follows, { relationName: 'following' }),
  notificationsReceived: many(notifications, { relationName: 'recipient' }),
  notificationsSent: many(notifications, { relationName: 'actor' }),
  blocksCreated: many(blocks, { relationName: 'blocker' }),
  blocksReceived: many(blocks, { relationName: 'blocked' }),
}));

// ─── Blocks ───────────────────────────────────────────────────────────────────
export const blocksRelations = relations(blocks, ({ one }) => ({
  blocker: one(users, {
    fields: [blocks.blockerId],
    references: [users.telegramId],
    relationName: 'blocker',
  }),
  blocked: one(users, {
    fields: [blocks.blockedId],
    references: [users.telegramId],
    relationName: 'blocked',
  }),
}));

// ─── Ghostings ────────────────────────────────────────────────────────────────
export const ghostingsRelations = relations(ghostings, ({ one }) => ({
  ghoster: one(users, {
    fields: [ghostings.ghosterId],
    references: [users.telegramId],
    relationName: 'ghoster',
  }),
  ghosted: one(users, {
    fields: [ghostings.ghostedId],
    references: [users.telegramId],
    relationName: 'ghosted',
  }),
}));

// ─── Posts ────────────────────────────────────────────────────────────────────
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.telegramId],
    references: [users.telegramId],
  }),
  reactions: many(reactions),
  /** Post original sendo respondido (nullable) */
  replyToPost: one(posts, {
    fields: [posts.replyToPostId],
    references: [posts.id],
    relationName: "reply",
  }),
  /** Respostas a este post */
  replies: many(posts, { relationName: "reply" }),
}));

// ─── Follows ──────────────────────────────────────────────────────────────────
export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.telegramId],
    relationName: "follower",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.telegramId],
    relationName: "following",
  }),
}));

// ─── Reactions ────────────────────────────────────────────────────────────────
export const reactionsRelations = relations(reactions, ({ one }) => ({
  post: one(posts, {
    fields: [reactions.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [reactions.telegramId],
    references: [users.telegramId],
  }),
}));

// ─── Notifications ────────────────────────────────────────────────────────────
export const notificationsRelations = relations(notifications, ({ one }) => ({
  recipient: one(users, {
    fields: [notifications.recipientId],
    references: [users.telegramId],
    relationName: 'recipient',
  }),
  actor: one(users, {
    fields: [notifications.actorId],
    references: [users.telegramId],
    relationName: 'actor',
  }),
}));
