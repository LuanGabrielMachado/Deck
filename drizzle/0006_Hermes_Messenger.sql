-- =============================================================================
-- Migration 0006 — Hermes Messenger
-- Sistema de Notificações via Bot do Telegram
-- Data: Março 2026
-- =============================================================================
-- Execute manualmente no Supabase SQL Editor (ou via psql) caso não tenha
-- rodado pnpm drizzle-kit generate && pnpm drizzle-kit migrate localmente.
-- =============================================================================

-- 1. COLUNA notificationsEnabled na tabela users
-- Controla se o usuário recebe notificações do bot

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS "notificationsEnabled" BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN users."notificationsEnabled" IS
  'Controla se o usuário recebe notificações via Bot API do Telegram';

-- =============================================================================
-- 2. TABELA notifications
-- Fila de notificações + log de auditoria + mecanismo de retry
-- =============================================================================

CREATE TABLE IF NOT EXISTS "notifications" (
  "id"          SERIAL PRIMARY KEY,

  -- Tipo do evento: reply | reaction | follow
  "type"        VARCHAR(20)  NOT NULL,

  -- Destinatário: quem recebe a notificação (dono do post/perfil)
  "recipientId" BIGINT       NOT NULL
    REFERENCES users("telegramId") ON DELETE CASCADE,

  -- Ator: quem gerou o evento
  "actorId"     BIGINT       NOT NULL
    REFERENCES users("telegramId") ON DELETE CASCADE,

  -- Referência: postId para reply/reaction, NULL para follow
  "referenceId" INTEGER,

  -- Emoji da reação (apenas type='reaction')
  "emoji"       VARCHAR(10),

  -- Fluxo: pending → sent | failed | skipped
  "status"      VARCHAR(10)  NOT NULL DEFAULT 'pending',

  "retryCount"  INTEGER      NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "createdAt"   TIMESTAMP    NOT NULL DEFAULT NOW(),
  "sentAt"      TIMESTAMP
);

-- Índices para queries do cron (busca por status + createdAt)
CREATE INDEX IF NOT EXISTS "idx_notifications_recipientId"
  ON "notifications"("recipientId");

CREATE INDEX IF NOT EXISTS "idx_notifications_status"
  ON "notifications"("status");

CREATE INDEX IF NOT EXISTS "idx_notifications_createdAt"
  ON "notifications"("createdAt");

-- Unique constraint para deduplicação
-- Garante que onConflictDoNothing() em insertNotification() funcione de verdade.
-- Impede que o mesmo ator gere duas notificações idênticas para o mesmo destinatário.
-- NOTA: referenceId NULL (follows) — dois follows do mesmo par são impossíveis
-- pela PRIMARY KEY da tabela follows, então é seguro incluir NULL nesta constraint.
CREATE UNIQUE INDEX IF NOT EXISTS "uq_notifications_dedup"
  ON "notifications"("type", "recipientId", "actorId", "referenceId");

COMMENT ON TABLE "notifications" IS
  'Fila de notificações via Bot API — queue + log de auditoria + retry automático';

-- RLS (Supabase)
ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role full access on notifications"
  ON "notifications" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =============================================================================
-- ✅ Migration completa!
-- Próximo passo: configurar BOT_USERNAME nas variáveis de ambiente da Vercel.
-- =============================================================================
