-- =====================================================
-- SECURITY POLICIES - Fala Comigo (Deck)
-- =====================================================
-- Este script habilita RLS e cria policies para todas as tabelas.
-- Execute no Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. POLICIES PARA TABELA 'users'
-- =====================================================

-- Permitir que o service_role (backend) faça tudo
CREATE POLICY "Service role can do everything on users"
ON users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Qualquer um autenticado pode ler usuários (para busca e perfis)
CREATE POLICY "Anyone can read users"
ON users
FOR SELECT
TO authenticated, anon
USING (true);

-- =====================================================
-- 3. POLICIES PARA TABELA 'posts'
-- =====================================================

-- Service role pode fazer tudo
CREATE POLICY "Service role can do everything on posts"
ON posts
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Qualquer um pode ler posts (feed público)
CREATE POLICY "Anyone can read posts"
ON posts
FOR SELECT
TO authenticated, anon
USING (true);

-- =====================================================
-- 4. POLICIES PARA TABELA 'reactions'
-- =====================================================

-- Service role pode fazer tudo
CREATE POLICY "Service role can do everything on reactions"
ON reactions
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Qualquer um pode ler reações
CREATE POLICY "Anyone can read reactions"
ON reactions
FOR SELECT
TO authenticated, anon
USING (true);

-- =====================================================
-- 5. POLICIES PARA TABELA 'follows'
-- =====================================================

-- Service role pode fazer tudo
CREATE POLICY "Service role can do everything on follows"
ON follows
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Qualquer um pode ler follows (para mostrar contagens)
CREATE POLICY "Anyone can read follows"
ON follows
FOR SELECT
TO authenticated, anon
USING (true);

-- =====================================================
-- 6. VERIFICAR SE ESTÁ FUNCIONANDO
-- =====================================================

-- Execute estas queries para verificar:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';
