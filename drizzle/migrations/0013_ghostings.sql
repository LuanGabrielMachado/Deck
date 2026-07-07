-- Migration 0013: tabela de ghostings temporários (48h)

CREATE TABLE IF NOT EXISTS "ghostings" (
  "ghosterId" BIGINT NOT NULL REFERENCES "users"("telegramId") ON DELETE CASCADE,
  "ghostedId" BIGINT NOT NULL REFERENCES "users"("telegramId") ON DELETE CASCADE,
  "expiresAt" TIMESTAMP NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  CONSTRAINT "ghostings_pkey" PRIMARY KEY ("ghosterId", "ghostedId")
);

CREATE INDEX IF NOT EXISTS "idx_ghostings_ghosterId" ON "ghostings" ("ghosterId");
CREATE INDEX IF NOT EXISTS "idx_ghostings_ghostedId" ON "ghostings" ("ghostedId");
CREATE INDEX IF NOT EXISTS "idx_ghostings_expiresAt" ON "ghostings" ("expiresAt");
