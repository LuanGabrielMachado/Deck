-- Remove telegraphUrl da tabela posts (Telegraph removido)
ALTER TABLE "posts" DROP COLUMN IF EXISTS "telegraphUrl";
