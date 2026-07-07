-- Migration: Change telegramId columns from integer to bigint
-- Purpose: Support large Telegram IDs (above 2 billion)
-- Bug #1: telegramId integer overflow
-- Date: 2026-02-25

-- ⚠️ IMPORTANT: This migration changes column types from INTEGER to BIGINT
-- The Drizzle schema uses { mode: 'number' } to maintain TypeScript compatibility

-- Drop foreign keys before altering column types
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_telegramId_fkey;
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_followerId_fkey;
ALTER TABLE follows DROP CONSTRAINT IF EXISTS follows_followingId_fkey;
ALTER TABLE reactions DROP CONSTRAINT IF EXISTS reactions_telegramId_fkey;
ALTER TABLE "debugLogs" DROP CONSTRAINT IF EXISTS "debugLogs_telegramId_fkey";

-- Alter column types from integer to bigint
ALTER TABLE users ALTER COLUMN "telegramId" TYPE BIGINT;
ALTER TABLE posts ALTER COLUMN "telegramId" TYPE BIGINT;
ALTER TABLE follows ALTER COLUMN "followerId" TYPE BIGINT;
ALTER TABLE follows ALTER COLUMN "followingId" TYPE BIGINT;
ALTER TABLE reactions ALTER COLUMN "telegramId" TYPE BIGINT;
ALTER TABLE "debugLogs" ALTER COLUMN "telegramId" TYPE BIGINT;

-- Recreate foreign keys with ON DELETE CASCADE
ALTER TABLE posts ADD CONSTRAINT posts_telegramId_fkey
  FOREIGN KEY ("telegramId") REFERENCES users("telegramId") ON DELETE CASCADE;

ALTER TABLE follows ADD CONSTRAINT follows_followerId_fkey
  FOREIGN KEY ("followerId") REFERENCES users("telegramId") ON DELETE CASCADE;

ALTER TABLE follows ADD CONSTRAINT follows_followingId_fkey
  FOREIGN KEY ("followingId") REFERENCES users("telegramId") ON DELETE CASCADE;

ALTER TABLE reactions ADD CONSTRAINT reactions_telegramId_fkey
  FOREIGN KEY ("telegramId") REFERENCES users("telegramId") ON DELETE CASCADE;

ALTER TABLE "debugLogs" ADD CONSTRAINT "debugLogs_telegramId_fkey"
  FOREIGN KEY ("telegramId") REFERENCES users("telegramId");

-- ✅ Migration complete!
-- System now supports Telegram IDs up to 9,223,372,036,854,775,807
