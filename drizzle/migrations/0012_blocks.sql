-- Migration 0012: tabela de bloqueios entre usuários
-- blockerId bloqueia blockedId — efeito bidirecional no feed

CREATE TABLE IF NOT EXISTS "blocks" (
  "blockerId" BIGINT NOT NULL REFERENCES "users"("telegramId") ON DELETE CASCADE,
  "blockedId" BIGINT NOT NULL REFERENCES "users"("telegramId") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT "blocks_pkey" PRIMARY KEY ("blockerId", "blockedId")
);

CREATE INDEX IF NOT EXISTS "idx_blocks_blockerId" ON "blocks" ("blockerId");
CREATE INDEX IF NOT EXISTS "idx_blocks_blockedId" ON "blocks" ("blockedId");
