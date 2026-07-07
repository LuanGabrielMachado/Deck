-- Migration: Add composite indexes for performance optimization
-- Created: 2026-03-12
-- Purpose: Improve query performance for timeline, ephemeral posts, and notifications

-- Posts: composite indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_posts_telegramId_createdAt" ON "posts" ("telegramId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_posts_createdAt_telegramId" ON "posts" ("createdAt", "telegramId");

-- Notifications: composite indexes for retry and filtering
CREATE INDEX IF NOT EXISTS "idx_notifications_status_retry" ON "notifications" ("status", "retryCount");
CREATE INDEX IF NOT EXISTS "idx_notifications_type_status" ON "notifications" ("type", "status");
