-- Migration: Admin System + Rate Limit Fix
-- Data: 03 de Março de 2026
-- Descrição: Adiciona colunas de controle de usuário e tabelas do sistema de admin

-- =====================================================
-- 1. COLUNAS NA TABELA USERS
-- =====================================================

-- Rate limit persistente (sobrevive ao delete de posts)
ALTER TABLE users ADD COLUMN IF NOT EXISTS "lastPostAt" TIMESTAMP;

-- Controle de acesso
ALTER TABLE users ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS "shadowBanned" BOOLEAN NOT NULL DEFAULT FALSE;

-- Modo do feed: 'following' = só posts de quem segue | 'all' = posts de todos os usuários
ALTER TABLE users ADD COLUMN IF NOT EXISTS "feedMode" VARCHAR(20) NOT NULL DEFAULT 'following';

COMMENT ON COLUMN users."feedMode" IS
  'Modo de exibição do feed: following = só seguidores, all = todos os usuários do servidor';

-- Popula lastPostAt com o post mais recente de cada usuário (migração de dados)
UPDATE users
SET "lastPostAt" = (
  SELECT MAX("createdAt")
  FROM posts
  WHERE posts."telegramId" = users."telegramId"
)
WHERE "telegramId" IN (SELECT DISTINCT "telegramId" FROM posts);

COMMENT ON COLUMN users."lastPostAt" IS
  'Timestamp do último post (persiste após delete — fonte da verdade do rate limit)';
COMMENT ON COLUMN users."isBanned" IS
  'Usuário banido: não pode logar nem criar posts';
COMMENT ON COLUMN users."shadowBanned" IS
  'Shadow ban: usuário pode postar mas posts não aparecem na timeline de outros';

-- =====================================================
-- 2. TABELA serverConfig (flags globais)
-- =====================================================

CREATE TABLE IF NOT EXISTS "serverConfig" (
  "key"       VARCHAR(100) PRIMARY KEY,
  "value"     TEXT NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Seeds das flags padrão
INSERT INTO "serverConfig" ("key", "value", "updatedAt")
VALUES
  ('maintenance_mode',         'false', NOW()),
  ('pause_new_users',          'false', NOW()),
  ('disable_rate_limit_global','false', NOW())
ON CONFLICT ("key") DO NOTHING;

COMMENT ON TABLE "serverConfig" IS
  'Flags globais do servidor — alteradas via Admin Toolbox';

-- RLS
ALTER TABLE "serverConfig" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on serverConfig"
  ON "serverConfig" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- 3. TABELA adminActions (trilha de auditoria)
-- =====================================================

CREATE TABLE IF NOT EXISTS "adminActions" (
  "id"               SERIAL PRIMARY KEY,
  "adminTelegramId"  BIGINT NOT NULL,
  "action"           VARCHAR(100) NOT NULL,
  "targetTelegramId" BIGINT,
  "targetPostId"     INTEGER,
  "previousValue"    TEXT,
  "newValue"         TEXT,
  "notes"            TEXT,
  "createdAt"        TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_adminActions_adminTelegramId"
  ON "adminActions"("adminTelegramId");
CREATE INDEX IF NOT EXISTS "idx_adminActions_createdAt"
  ON "adminActions"("createdAt");

COMMENT ON TABLE "adminActions" IS
  'Trilha de auditoria de todas as ações administrativas';

-- RLS
ALTER TABLE "adminActions" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access on adminActions"
  ON "adminActions" FOR ALL TO service_role USING (true) WITH CHECK (true);

-- =====================================================
-- ✅ Migration completa!
-- =====================================================
