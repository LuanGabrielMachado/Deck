/**
 * Testes: SlowSocialRateLimiter
 * Cobre as 3 camadas do sistema de rate limit híbrido.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock do banco ─────────────────────────────────────────────────────────────
const mockFindFirst = vi.fn();

vi.mock('../db', () => ({
  getDb: () => ({
    query: {
      users: { findFirst: mockFindFirst },
      posts: { findFirst: mockFindFirst },
    },
  }),
}));

vi.mock('../../drizzle/schema', () => ({
  users: { telegramId: 'telegramId', lastPostAt: 'lastPostAt', lastReplyAt: 'lastReplyAt' },
  posts: { telegramId: 'telegramId', createdAt: 'createdAt' },
  serverConfig: { key: 'key', value: 'value' },
}));

vi.mock('drizzle-orm', () => ({
  eq: (a: unknown, b: unknown) => ({ eq: [a, b] }),
  desc: (a: unknown) => ({ desc: a }),
}));

import { SlowSocialRateLimiter } from '../_core/rate-limiter';

const POST_INTERVAL_MS = 10 * 60 * 1000;
const REPLY_INTERVAL_MS = 15 * 60 * 1000;

describe('SlowSocialRateLimiter', () => {
  let limiter: SlowSocialRateLimiter;

  beforeEach(() => {
    limiter = new SlowSocialRateLimiter();
    vi.clearAllMocks();
  });

  // ── canCreatePost ────────────────────────────────────────────────────────

  describe('canCreatePost', () => {
    it('admin sempre pode postar', async () => {
      const result = await limiter.canCreatePost(123, true);
      expect(result.canPost).toBe(true);
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('permite post quando lastPostAt é null', async () => {
      mockFindFirst.mockResolvedValueOnce({ lastPostAt: null });
      const result = await limiter.canCreatePost(456);
      expect(result.canPost).toBe(true);
    });

    it('bloqueia quando lastPostAt está dentro do intervalo', async () => {
      const lastPostAt = new Date(Date.now() - 5 * 60 * 1000); // 5 min atrás
      mockFindFirst.mockResolvedValueOnce({ lastPostAt });
      const result = await limiter.canCreatePost(456);
      expect(result.canPost).toBe(false);
      expect(result.blockedBy).toBe('lastPostAt');
      expect(result.timeRemainingMs).toBeGreaterThan(0);
      expect(result.timeRemainingMs).toBeLessThan(POST_INTERVAL_MS);
    });

    it('permite quando lastPostAt passou do intervalo', async () => {
      const lastPostAt = new Date(Date.now() - 11 * 60 * 1000); // 11 min atrás
      mockFindFirst.mockResolvedValueOnce({ lastPostAt });
      const result = await limiter.canCreatePost(456);
      expect(result.canPost).toBe(true);
    });

    it('fallback: bloqueia via tabela posts quando sem lastPostAt', async () => {
      mockFindFirst
        .mockResolvedValueOnce({ lastPostAt: null }) // users query
        .mockResolvedValueOnce({ createdAt: new Date(Date.now() - 3 * 60 * 1000) }); // posts query
      const result = await limiter.canCreatePost(789);
      expect(result.canPost).toBe(false);
      expect(result.blockedBy).toBe('posts_fallback');
    });

    it('fallback: permite quando sem posts no banco', async () => {
      mockFindFirst
        .mockResolvedValueOnce({ lastPostAt: null })
        .mockResolvedValueOnce(null);
      const result = await limiter.canCreatePost(789);
      expect(result.canPost).toBe(true);
    });
  });

  // ── canCreateReply ───────────────────────────────────────────────────────

  describe('canCreateReply', () => {
    it('admin sempre pode responder', async () => {
      const result = await limiter.canCreateReply(123, true);
      expect(result.canReply).toBe(true);
      expect(mockFindFirst).not.toHaveBeenCalled();
    });

    it('bloqueia quando lastReplyAt está dentro do intervalo', async () => {
      const lastReplyAt = new Date(Date.now() - 5 * 60 * 1000); // 5 min atrás
      mockFindFirst.mockResolvedValueOnce({ lastReplyAt });
      const result = await limiter.canCreateReply(456);
      expect(result.canReply).toBe(false);
      expect(result.timeRemainingMs).toBeGreaterThan(0);
      expect(result.timeRemainingMs).toBeLessThan(REPLY_INTERVAL_MS);
    });

    it('permite quando lastReplyAt passou do intervalo', async () => {
      const lastReplyAt = new Date(Date.now() - 20 * 60 * 1000); // 20 min atrás
      mockFindFirst.mockResolvedValueOnce({ lastReplyAt });
      const result = await limiter.canCreateReply(456);
      expect(result.canReply).toBe(true);
    });

    it('permite quando nunca respondeu', async () => {
      mockFindFirst.mockResolvedValueOnce({ lastReplyAt: null });
      const result = await limiter.canCreateReply(456);
      expect(result.canReply).toBe(true);
    });
  });
});
