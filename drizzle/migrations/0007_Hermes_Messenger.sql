-- Migration: Sistema de notificações via bot
-- Hermes: mensageiro dos deuses — notificações em tempo real
-- Date: 2026-03-07

-- 1. Coluna de preferência de notificações nos usuários
ALTER TABLE users
ADD COLUMN "notificationsEnabled" BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Tabela de notificações (queue + log + retry)
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL, -- reply | reaction | follow
  "recipientId" BIGINT NOT NULL REFERENCES users("telegramId") ON DELETE CASCADE,
  "actorId" BIGINT NOT NULL REFERENCES users("telegramId") ON DELETE CASCADE,
  "referenceId" INTEGER, -- postId (reply/reaction) ou NULL (follow)
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "sentAt" TIMESTAMP
);

-- 3. Índices para performance
CREATE INDEX idx_notifications_recipientId ON notifications("recipientId");
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_createdAt ON notifications("createdAt");

-- 4. Constraint de deduplicação
-- Evita duplicatas quando referenceId NÃO é NULL (reply/reaction)
CREATE UNIQUE INDEX idx_notifications_dedup
ON notifications(type, "recipientId", "actorId", "referenceId")
WHERE "referenceId" IS NOT NULL;

-- Migration complete! ✅
