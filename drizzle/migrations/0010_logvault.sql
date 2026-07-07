-- LogVault: tabela de logs estruturados do sistema
-- Nível: info | warn | error
-- Contexto: notification | post | reaction | follow | upload | rate_limit | cron | auth | system

CREATE TABLE IF NOT EXISTS "logs" (
  "id"        serial PRIMARY KEY,
  "level"     varchar(10)  NOT NULL,
  "context"   varchar(50)  NOT NULL,
  "message"   text         NOT NULL,
  "meta"      text,
  "actorId"   bigint,
  "createdAt" timestamp    DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_logs_level"     ON "logs" ("level");
CREATE INDEX IF NOT EXISTS "idx_logs_context"   ON "logs" ("context");
CREATE INDEX IF NOT EXISTS "idx_logs_createdAt" ON "logs" ("createdAt");
CREATE INDEX IF NOT EXISTS "idx_logs_actorId"   ON "logs" ("actorId");
