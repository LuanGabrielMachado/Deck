-- ============================================
-- MARACUTÁIA - Setup Database PostgreSQL
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Tabela de Usuários (Telegram ID como PK)
CREATE TABLE IF NOT EXISTS users (
  "telegramId" INTEGER PRIMARY KEY,
  name TEXT,
  "photoUrl" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índice para busca por nome
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

-- ============================================
-- Tabela de Posts (microblog de 165 caracteres)
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  "telegramId" INTEGER NOT NULL REFERENCES users("telegramId") ON DELETE CASCADE,
  content TEXT NOT NULL,
  "imagePath" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_posts_telegramId ON posts("telegramId");
CREATE INDEX IF NOT EXISTS idx_posts_createdAt ON posts("createdAt" DESC);

-- ============================================

-- Tabela de Seguidores (relacionamento many-to-many)
CREATE TABLE IF NOT EXISTS follows (
  "followerId" INTEGER NOT NULL REFERENCES users("telegramId") ON DELETE CASCADE,
  "followingId" INTEGER NOT NULL REFERENCES users("telegramId") ON DELETE CASCADE,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  PRIMARY KEY ("followerId", "followingId")
);

-- Índices para queries de seguindo/seguidores
CREATE INDEX IF NOT EXISTS idx_follows_followerId ON follows("followerId");
CREATE INDEX IF NOT EXISTS idx_follows_followingId ON follows("followingId");

-- Previne auto-follow
ALTER TABLE follows ADD CONSTRAINT check_no_self_follow 
  CHECK ("followerId" != "followingId");

-- ============================================

-- Tabela de Reações (emojis nos posts)
CREATE TABLE IF NOT EXISTS reactions (
  "postId" INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  "telegramId" INTEGER NOT NULL REFERENCES users("telegramId") ON DELETE CASCADE,
  emoji VARCHAR(10) NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  PRIMARY KEY ("postId", "telegramId", emoji)
);

-- Índices para contagem de reações
CREATE INDEX IF NOT EXISTS idx_reactions_postId ON reactions("postId");
CREATE INDEX IF NOT EXISTS idx_reactions_telegramId ON reactions("telegramId");

-- ============================================
-- Políticas de RLS (Row Level Security) - OPCIONAL
-- Descomente se quiser usar RLS do Supabase
-- ============================================

-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler
-- CREATE POLICY "Public read access" ON users FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON posts FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON follows FOR SELECT USING (true);
-- CREATE POLICY "Public read access" ON reactions FOR SELECT USING (true);

-- ============================================
-- Dados de Teste (OPCIONAL)
-- ============================================

-- Inserir usuário de teste
-- INSERT INTO users ("telegramId", name, "photoUrl") 
-- VALUES (123456789, 'User Teste', 'https://ui-avatars.com/api/?name=Teste')
-- ON CONFLICT ("telegramId") DO NOTHING;

-- ============================================
-- DONE! Database pronta para usar
-- ============================================
