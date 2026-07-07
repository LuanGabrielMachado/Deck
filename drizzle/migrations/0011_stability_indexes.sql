-- Migration: Stability & Performance
-- Date: 2026-03-15
-- Purpose: Índice para subquery de shadow ban na timeline + ALTER coluna content para suportar broadcast

-- Índice em shadowBanned para acelerar a subquery de usuários não-banidos
-- usada em getTimelinePosts (filtra shadow-banned em todas as leituras do feed)
CREATE INDEX IF NOT EXISTS "idx_users_shadowBanned" ON "users" ("shadowBanned");

-- Amplia coluna content de VARCHAR(165) para TEXT.
-- O limite de 165 chars para posts normais é validado pelo Zod no router (post.router.ts).
-- O broadcast do admin suporta até 999 chars — VARCHAR(165) causava erro de DB ao publicar.
ALTER TABLE "posts" ALTER COLUMN "content" TYPE TEXT;

-- Nota: reactions.postId já possui ON DELETE CASCADE no banco de produção
-- (criado via database.sql). O schema Drizzle foi atualizado para refletir isso.
-- Nenhuma ação SQL necessária aqui — apenas alinhamento do schema.ts.
