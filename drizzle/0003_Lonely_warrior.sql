-- Migration: Add debug logs table
-- Created: 2026-02-15

CREATE TABLE IF NOT EXISTS "debugLogs" (
  "id" SERIAL PRIMARY KEY,
  "telegramId" INTEGER REFERENCES "users"("telegramId"),
  "type" VARCHAR(50) NOT NULL,
  "isAuthenticated" BOOLEAN,
  "initDataLength" INTEGER,
  "userAgent" TEXT,
  "locationHref" TEXT,
  "errorMessage" TEXT,
  "stackTrace" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "idx_debugLogs_telegramId" ON "debugLogs"("telegramId");
CREATE INDEX IF NOT EXISTS "idx_debugLogs_type" ON "debugLogs"("type");
CREATE INDEX IF NOT EXISTS "idx_debugLogs_createdAt" ON "debugLogs"("createdAt");

-- Enable RLS
ALTER TABLE "debugLogs" ENABLE ROW LEVEL SECURITY;

-- Policy: Service role can do everything
CREATE POLICY "Service role can do everything on debugLogs"
ON "debugLogs"
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Policy: Anyone can read their own logs (removed - service role handles all access)
-- CREATE POLICY "Users can read their own logs"
-- ON "debugLogs"
-- FOR SELECT
-- TO authenticated, anon
-- USING ("telegramId" = (current_setting('request.jwt.claims', true)::json->>'telegramId')::integer);

COMMENT ON TABLE "debugLogs" IS 'Armazena logs de debug, diagnóstico e erros da aplicação';
