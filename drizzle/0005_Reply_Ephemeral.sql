-- Migration: Add reply system + ephemeral posts support
-- Purpose: Posts can be replies to other posts (CASCADE delete) + users track lastReplyAt for separate rate limit
-- Date: 2026-03-04

-- 1. Add replyToPostId to posts (nullable FK with CASCADE)
ALTER TABLE posts ADD COLUMN "replyToPostId" INTEGER REFERENCES posts(id) ON DELETE CASCADE;

-- 2. Add lastReplyAt to users (separate rate limit for replies: 30 min)
ALTER TABLE users ADD COLUMN "lastReplyAt" TIMESTAMP;

-- 3. Index for efficient reply lookups
CREATE INDEX idx_posts_replyToPostId ON posts("replyToPostId");

-- ✅ Migration complete!
-- Posts now support replies (CASCADE delete) and users have separate reply rate limit tracking
