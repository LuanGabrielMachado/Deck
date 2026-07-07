-- Migration: Sistema de notificações - correções
-- Adiciona coluna emoji e unique constraint para deduplicação
-- Date: 2026-03-07

-- 1. Adicionar coluna emoji na tabela notifications
ALTER TABLE notifications
ADD COLUMN emoji VARCHAR(10);

-- 2. Adicionar unique constraint para deduplicação
-- Isso faz o onConflictDoNothing() funcionar de verdade
ALTER TABLE notifications
ADD CONSTRAINT uq_notifications_dedup UNIQUE (type, "recipientId", "actorId", "referenceId");

-- Migration complete! ✅
