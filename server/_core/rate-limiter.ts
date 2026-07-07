import { getDb } from '../db';
import { users, posts } from '../../drizzle/schema';
import { eq, desc, isNull, and } from 'drizzle-orm';

export class SlowSocialRateLimiter {
  private readonly POST_INTERVAL_MS = 10 * 60 * 1000; // 10 minutos
  private readonly REPLY_INTERVAL_MS = 15 * 60 * 1000; // 15 minutos

  /**
   * Verifica se o usuário pode criar um post.
   *
   * Checkpoints do servidor (a Camada 1 — cache local — é do frontend):
   *   Camada 2 — users.lastPostAt  (fonte da verdade, persiste após delete)
   *   Camada 3 — tabela posts      (fallback para usuários sem lastPostAt)
   *
   * Mais restritivo vence. Admin sempre passa.
   */
  async canCreatePost(
    telegramId: number,
    isAdmin = false,
  ): Promise<{
    canPost: boolean;
    nextAllowedAt?: Date;
    timeRemainingMs?: number;
    blockedBy?: 'lastPostAt' | 'posts_fallback';
  }> {
    if (isAdmin) return { canPost: true };

    const db = getDb();

    // ── Camada 2: users.lastPostAt ────────────────────────────────────
    const user = await db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
      columns: { lastPostAt: true },
    });

    if (user?.lastPostAt) {
      const timeSince = Date.now() - user.lastPostAt.getTime();
      if (timeSince < this.POST_INTERVAL_MS) {
        const nextAllowedAt = new Date(user.lastPostAt.getTime() + this.POST_INTERVAL_MS);
        return {
          canPost: false,
          nextAllowedAt,
          timeRemainingMs: this.POST_INTERVAL_MS - timeSince,
          blockedBy: 'lastPostAt',
        };
      }
      return { canPost: true };
    }

    // ── Camada 3: fallback via tabela posts ─────────────────────────
    // Filtra apenas posts raiz (replyToPostId IS NULL) para não confundir com replies
    const lastPost = await db.query.posts.findFirst({
      where: and(eq(posts.telegramId, telegramId), isNull(posts.replyToPostId)),
      orderBy: [desc(posts.createdAt)],
      columns: { createdAt: true },
    });

    if (!lastPost) return { canPost: true };

    const timeSince = Date.now() - lastPost.createdAt.getTime();
    if (timeSince < this.POST_INTERVAL_MS) {
      const nextAllowedAt = new Date(lastPost.createdAt.getTime() + this.POST_INTERVAL_MS);
      return {
        canPost: false,
        nextAllowedAt,
        timeRemainingMs: this.POST_INTERVAL_MS - timeSince,
        blockedBy: 'posts_fallback',
      };
    }

    return { canPost: true };
  }

  /**
   * Verifica se o usuário pode criar uma resposta (15 min cooldown).
   * Usa users.lastReplyAt como fonte da verdade.
   * Admin sempre passa.
   */
  async canCreateReply(
    telegramId: number,
    isAdmin = false,
  ): Promise<{
    canReply: boolean;
    nextAllowedAt?: Date;
    timeRemainingMs?: number;
  }> {
    if (isAdmin) return { canReply: true };

    const db = getDb();

    const user = await db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
      columns: { lastReplyAt: true },
    });

    if (user?.lastReplyAt) {
      const timeSince = Date.now() - user.lastReplyAt.getTime();
      if (timeSince < this.REPLY_INTERVAL_MS) {
        const nextAllowedAt = new Date(user.lastReplyAt.getTime() + this.REPLY_INTERVAL_MS);
        return {
          canReply: false,
          nextAllowedAt,
          timeRemainingMs: this.REPLY_INTERVAL_MS - timeSince,
        };
      }
    }

    return { canReply: true };
  }
}
