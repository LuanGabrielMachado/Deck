-- Adiciona coluna de menções ao posts para exibir fotos flutuantes nos post cards.
-- Armazena snapshot JSON dos usuários mencionados: [{telegramId, name, photoUrl}]
-- Nullable — posts existentes sem menções ficam NULL (sem efeito visual).
ALTER TABLE "posts" ADD COLUMN "mentionedUsers" text;
