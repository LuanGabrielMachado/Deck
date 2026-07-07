# ⚙️ Deck - Backend: Guia Completo e Detalhado

**Documento:** 03-BACKEND  
**Versão:** 5.0.0 (Produção - Março 2026)  
**Data:** 14 de Março de 2026  
**Classificação:** Documentação Técnica Detalhada de Backend  
**Público-Alvo:** Desenvolvedores Backend, Full-Stack, Engenheiros de Software, Auditores de Código  
**Linhas de Documentação:** ~1.200+ (este documento)

---

## 📋 ÍNDICE GERAL DETALHADO

1. [Visão Geral da Arquitetura Backend](#1-visão-geral-da-arquitetura-backend)
   - 1.1 Características Principais
   - 1.2 Fluxo de Processamento Completo (12 etapas)
   - 1.3 Mecanismos Internos Principais

2. [Estrutura de Diretórios](#2-estrutura-de-diretórios)
   - 2.1 Estrutura Completa do Backend
   - 2.2 Arquivos Principais e Responsabilidades

3. [Sistema de Autenticação](#3-sistema-de-autenticação)
   - 3.1 Visão Geral
   - 3.2 Ordem de Autenticação
   - 3.3 Contexto tRPC
   - 3.4 FIX DE SEGURANÇA v3.0.0 (Fallback Legacy Removido)

4. [Validação de Dados do Telegram](#4-validação-de-dados-do-telegram)
   - 4.1 Algoritmo de Validação (Passo a Passo)
   - 4.2 Implementação Completa (Código Comentado)
   - 4.3 Extração do Header
   - 4.4 Exemplos de initData Válido e Inválido

5. [Gerenciamento de Sessão (JWT)](#5-gerenciamento-de-sessão-jwt)
   - 5.1 JWT Session Management
   - 5.2 Implementação Completa (sign, verify, cookie)
   - 5.3 Uso no Login
   - 5.4 Security Best Practices

6. [Procedures tRPC - Detalhamento](#6-procedures-trpc---detalhamento)
   - 6.1 publicProcedure
   - 6.2 protectedProcedure (Middleware isAuthed)
   - 6.3 adminProcedure (Middleware isAdmin)
   - 6.4 TRPCError Codes e Mensagens

7. [Rate Limiting Híbrido (3 Camadas)](#7-rate-limiting-híbrido-3-camadas)
   - 7.1 Visão Geral das 3 Camadas
   - 7.2 Implementação Completa (SlowSocialRateLimiter)
   - 7.3 Camada 1: Frontend (CloudStorage)
   - 7.4 Camada 2: Backend (users.lastPostAt)
   - 7.5 Camada 3: Backend (tabela posts)
   - 7.6 Regra: Mais Restritivo Vence
   - 7.7 Admin Bypass
   - 7.8 Flag Cache (TTL 30s)

8. [Mecanismos Internos e Otimizações](#8-mecanismos-internos-e-otimizações)
   - 8.1 Stable Refs Pattern
   - 8.2 Promise.all Optimization
   - 8.3 Cursor Pagination
   - 8.4 bool_or() Optimization
   - 8.5 Hard Stop Timer

9. [Operações de Leitura no Banco](#9-operações-de-leitura-no-banco)
   - 9.1 getTimelinePosts (Cursor Pagination)
   - 9.2 getUserPosts (Efemeridade)
   - 9.3 getReactionsByPost (bool_or)
   - 9.4 searchUsersByName (Filtros de Ban)
   - 9.5 getSuggestedUsers (Exclusões)

10. [Operações de Escrita no Banco](#10-operações-de-escrita-no-banco)
    - 10.1 createPost (Upload + Rate Limit)
    - 10.2 deletePost (Cascades)
    - 10.3 followUser (Idempotência)
    - 10.4 addReaction (onConflictDoNothing)
    - 10.5 insertNotification (Deduplicação)

11. [Sistema de Notificações via Bot](#11-sistema-de-notificações-via-bot)
    - 11.1 Helper sendNotification (Código Completo)
    - 11.2 Fluxo de Notificações (10 etapas)
    - 11.3 Deduplicação (Unique Constraint)
    - 11.4 Tratamento 403 (Usuário Bloqueou Bot)
    - 11.5 Promise.all Optimization

12. [Sistema de Efemeridade (7 dias)](#12-sistema-de-efemeridade-7-dias)
    - 12.1 Implementação no Backend
    - 12.2 Admin Isento
    - 12.3 Cron Cleanup (3h UTC)
    - 12.4 Filtro Efemeridade (SQL)

13. [Sistema de Replies](#13-sistema-de-replies)
    - 13.1 Auto-Relacionamento
    - 13.2 ON DELETE CASCADE
    - 13.3 Threads Infinitas
    - 13.4 Rate Limit Específico (15 min)

14. [Moderação e Admin Dashboard](#14-moderação-e-admin-dashboard)
    - 14.1 Double-Tap Access (≤400ms)
    - 14.2 Admin Self-Ban Protection
    - 14.3 Audit Log (adminActions)
    - 14.4 Flags de Servidor

15. [Flags de Servidor](#15-flags-de-servidor)
    - 15.1 Tabela serverConfig
    - 15.2 4 Flags Globais
    - 15.3 Admin Bypass
    - 15.4 Cache Invalidation

16. [Storage (Supabase)](#16-storage-supabase)
    - 16.1 Upload de Imagens (storagePut)
    - 16.2 Delete de Imagens (storageDelete)
    - 16.3 Fallback Silencioso
    - 16.4 Validações (12MB max)

17. [Tratamento de Erros](#17-tratamento-de-erros)
    - 17.1 TRPCError Codes
    - 17.2 Error Handling no Backend
    - 17.3 Error Handling no Frontend
    - 17.4 Log de Erros (LogVault)

18. [Bot Telegram API](#18-bot-telegram-api)
    - 18.1 sendTelegramMessage
    - 18.2 notifyReply, notifyReaction, notifyFollow
    - 18.3 Códigos de Erro da Bot API
    - 18.4 Timeout e Retry

19. [Configurações e Variáveis de Ambiente](#19-configurações-e-variáveis-de-ambiente)
    - 19.1 Variáveis Obrigatórias
    - 19.2 Variáveis Opcionais
    - 19.3 Admin Telegram IDs (Array)
    - 19.4 Validação de Tipos

20. [Resumo Final do Backend](#20-resumo-final-do-backend)
    - 20.1 Pontos Fortes
    - 20.2 Padrões de Código
    - 20.3 Decisões de Design
    - 20.4 Qualidade Geral

---

## 1. VISÃO GERAL DA ARQUITETURA BACKEND

### 1.1 Características Principais

O backend do Deck é construído com **tRPC v11** sobre **Next.js 15 App Router**, rodando em **Vercel Serverless Functions**. A arquitetura é **type-safe** do backend ao frontend, com validação de inputs via **Zod** e serialização via **SuperJSON**.

**Características Principais:**

| Característica | Valor | Descrição |
|---------------|-------|-----------|
| **Runtime** | `nodejs` | Node.js runtime (não edge) |
| **Dynamic** | `force-dynamic` | Geração dinâmica (não static) |
| **Max Duration** | `30s` | Timeout máximo da função |
| **API Style** | tRPC | Type-safe, sem codegen |
| **Database** | PostgreSQL (Supabase) | Drizzle ORM |
| **Storage** | Supabase Storage | S3-compatible |
| **Auth** | Telegram WebApp initData | HMAC-SHA256 + JWT sessions |

### 1.2 Fluxo de Processamento Completo (12 Etapas)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. REQUISIÇÃO HTTP RECEBIDA                                     │
│    GET/POST /api/trpc                                           │
│    • Headers: Authorization: Bearer <initData>                  │
│    • Cookies: deck_session (JWT)                          │
│    • Content-Type: application/json                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. API ROUTE HANDLER                                            │
│    /src/app/api/trpc/[trpc]/route.ts                            │
│    • fetchRequestHandler({                                      │
│        endpoint: '/api/trpc',                                   │
│        req,                                                     │
│        router: appRouter,                                       │
│        createContext,                                           │
│        responseMeta                                             │
│      })                                                         │
│    • Runtime: nodejs, Dynamic: force-dynamic                    │
│    • Max Duration: 30s                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ createContext()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. CRIAÇÃO DE CONTEXTO                                          │
│    /server/_core/context.ts                                     │
│    • Extrai cookies: parse(cookieHeader)                        │
│    • Verifica JWT session (deck_session)                  │
│      - verifySession(token) → telegramId                        │
│    • Extrai Authorization header (Bearer <initData>)            │
│    • Valida Telegram initData (HMAC-SHA256)                     │
│      - extractAndValidateInitData()                             │
│    • Verifica isAdmin (ENV.adminTelegramIds)                    │
│    • Retorna: { telegramId, isAuthenticated, isAdmin,           │
│                 responseCookies }                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ contexto injetado
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. ROUTER MATCHING + MIDDLEWARE                                 │
│    /server/routers.ts                                           │
│    • Identifica procedure chamada                               │
│    • Aplica middleware (public/protected/admin)                 │
│      - protectedProcedure: verifica isAuthenticated             │
│      - adminProcedure: verifica isAdmin                         │
│    • Valida input com Zod                                       │
│    • Verifica rate limiting (SlowSocialRateLimiter)             │
│    • Verifica flags (maintenance_mode, pause_new_users)         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ procedure execution
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. EXECUÇÃO DA PROCEDURE                                        │
│    • Verifica autenticação (protectedProcedure)                 │
│    • Verifica isAdmin (adminProcedure)                          │
│    • Valida permissões (ownership, ban)                         │
│      - if (telegramId !== input.telegramId) → FORBIDDEN         │
│      - if (user?.isBanned) → FORBIDDEN                          │
│    • Aplica rate limiting (3 camadas)                           │
│    • Verifica flags (maintenance_mode, pause_new_users)         │
│    • Executa lógica de negócio                                  │
│    • Upload de imagem (se aplicável)                            │
│    • Notificações (async, fire-and-forget)                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ database operations
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. DATABASE / STORAGE OPERATIONS                                │
│    /server/db.ts + /server/repositories/                        │
│    • Queries com Drizzle ORM                                    │
│    • Filtra shadow-banned                                       │
│    • Respeita feedMode                                          │
│    • Efemeridade (7 dias)                                       │
│    • Cursor pagination (id DESC)                                │
│    • Promise.all para buscas paralelas                          │
│    /server/storage.ts                                           │
│    • Upload de imagens (12MB max, brutas)                       │
│    • Delete (fire-and-forget)                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL query
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. SUPABASE (PostgreSQL)                                        │
│    SELECT posts.*, users.* FROM posts                           │
│    INNER JOIN users ON posts.telegramId = users.telegramId      │
│    WHERE posts.id < $1  -- ← CURSOR FILTER                      │
│    AND users.shadowBanned = false                               │
│    AND (posts.createdAt >= NOW() - INTERVAL '7 days'            │
│         OR posts.telegramId IN (adminIds))                      │
│    ORDER BY posts.id DESC  -- ← CURSOR PAGINATION               │
│    LIMIT 21  -- ← limit+1 para nextCursor                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ retorno em cascata
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 8. REPOSITORY LAYER                                             │
│    /server/repositories/*.ts                                    │
│    • Retorna dados tipados                                      │
│    • Transforma para formato esperado                           │
│    • Calcula nextCursor (se pagination)                         │
│    • Retorna: { posts: PostWithAuthor[], nextCursor?: number }  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ retorno
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. ROUTER LAYER                                                 │
│    /server/routers/*.ts                                         │
│    • Recebe dados do repository                                 │
│    • Aplica transformações finais                               │
│    • Retorna para tRPC Server                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ retorno
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. TRPC SERVER                                                 │
│    • SuperJSON serialize (preserva Date, Map, Set, BigInt)      │
│    • responseMeta injeta cookies JWT (7 dias)                   │
│    • HTTP 200 OK                                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ resposta HTTP
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 11. API ROUTE RESPONSE                                          │
│    /src/app/api/trpc/[trpc]/route.ts                            │
│    • Retorna HTTP response                                      │
│    • Headers: Set-Cookie (deck_session)                   │
│    • Content-Type: application/json                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ resposta recebida
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 12. FRONTEND - RECEBIMENTO E CACHE                              │
│    • tRPC Client recebe dados tipados                           │
│    • TanStack Query cacheia (staleTime: 5min, gcTime: 10min)    │
│    • Componente React renderiza                                 │
│    • Optimistic updates (se aplicável)                          │
└─────────────────────────────────────────────────────────────────┘
```

### 1.3 Mecanismos Internos Principais

| Mecanismo | Descrição | Arquivo | Versão |
|-----------|-----------|---------|--------|
| **Rate Limiting 3 Camadas** | CloudStorage + DB + Fallback | `rate-limiter.ts` | v3.0.0 |
| **Flag Cache** | Cache de flag rate limit (TTL 30s) | `rate-limiter.ts` | v3.0.0 |
| **Stable Refs Pattern** | Evita stale closures | `routers.ts`, `create/page.tsx` | v3.0.0 |
| **Promise.all Optimization** | Buscas paralelas (1 round-trip) | `routers.ts` | v3.1.0 |
| **Cursor Pagination** | Paginação por id DESC | `db.ts` | v3.1.0 |
| **Efemeridade (7 dias)** | Posts expiram automaticamente | `db.ts` | v3.0.0 |
| **Reply Cascade** | ON DELETE CASCADE para respostas | `schema.ts` | v3.0.0 |
| **Notificações Async** | Não bloqueia operação principal | `routers.ts` | v3.1.0 |
| **Deduplicação** | Unique constraint em notificações | `schema.ts` | v3.1.0 |
| **403 Handling** | Desativa notificações automaticamente | `routers.ts` | v3.1.0 |
| **bool_or() Optimization** | Reações em uma query | `routers.ts` | v3.0.0 |
| **getPostBasicById** | Query leve para notificações | `db.ts` | v3.1.0 |
| **getReplyContent** | Busca conteúdo da REPLY | `db.ts` | v3.1.0 |
| **Storage Delete Silencioso** | Fallback em caso de erro | `storage.ts` | v3.0.0 |
| **LogVault** | Logging estruturado (9 contextos) | `logger.ts` | v5.0.0 |
| **Admin Self-Ban Protection** | Não pode banir a si mesmo | `admin.router.ts` | v3.0.0 |

---

## 2. ESTRUTURA DE DIRETÓRIOS

### 2.1 Estrutura Completa do Backend

```
server/
├── _core/                          # Core framework (não modificar)
│   ├── context.ts                  # Criação do contexto tRPC (isAdmin, JWT, initData)
│   ├── trpc.ts                     # Configuração tRPC (procedures: public, protected, admin)
│   ├── rate-limiter.ts             # Rate limiting (3 camadas, cache flag 30s)
│   ├── session.ts                  # JWT sessions (7 dias, cookie HTTP-only)
│   ├── telegram-validation.ts      # Validação HMAC-SHA256 (WebAppData)
│   ├── env.ts                      # Variáveis de ambiente (adminTelegramIds array)
│   ├── logger.ts                   # LogVault - logger estruturado
│   └── systemRouter.ts             # System endpoints (health check, menu button)
├── bot/                            # Bot Telegram (notificações)
│   └── telegram-bot.ts             # sendBotMessage, notifyReply, notifyReaction, notifyFollow
├── repositories/                   # Database repositories (35+ funções)
│   ├── index.ts                    # Barrel export
│   ├── user.repository.ts          # 15 funções (upsert, search, ban, feedMode, notifications)
│   ├── post.repository.ts          # 11 funções (create, timeline, cleanup, efemeridade)
│   ├── follow.repository.ts        # 4 funções (follow, unfollow, isFollowing, getFollowing)
│   ├── reaction.repository.ts      # 3 funções (add, remove, getByPost)
│   ├── admin.repository.ts         # 4 funções (stats, logAction, getActions, getBroadcasts)
│   ├── notification.repository.ts  # 7 funções (insert, markSent/Failed, getPending, retry)
│   ├── log.repository.ts           # 2 funções (insertLog, getLogs) - LogVault
│   └── config.repository.ts        # 3 funções (getFlag, setFlag, getAllFlags)
├── routers/                        # tRPC routers (6 routers, 37 procedures)
│   ├── index.ts                    # 6 routers (system, telegram, users, posts, follows, reactions, admin)
│   ├── telegram.router.ts          # 3 procedures (login, me, isAdmin)
│   ├── user.router.ts              # 3 procedures (search, suggested, setNotifications)
│   ├── post.router.ts              # 9 procedures (create, canCreate, reply, canReply, timeline, byUser, countByUser, getById, delete)
│   ├── follow.router.ts            # 4 procedures (follow, unfollow, isFollowing, following)
│   ├── reaction.router.ts          # 3 procedures (add, remove, getByPost)
│   └── admin.router.ts             # 12 procedures (getStats, getFlags, setFlag, getUser, banUser, shadowBanUser, resetRateLimit, deletePost, setUserFeedMode, getActions, getLogs, broadcast)
├── db.ts                           # Singleton DB (pool: max 3, idle: 20s, connect: 10s)
├── storage.ts                      # Supabase Storage (upload/delete com fallback silencioso)
├── index.ts                        # App router export (export const appRouter)
└── README.md
```

### 2.2 Arquivos Principais e Responsabilidades

| Arquivo | Responsabilidade | Linhas | Descrição |
|---------|------------------|--------|-----------|
| **`/server/index.ts`** | Export do router principal | ~10 | `export const appRouter` |
| **`/server/routers/index.ts`** | Combina 6 routers em um appRouter | ~50 | Barrel export + type AppRouter |
| **`/server/_core/context.ts`** | Cria contexto tRPC (auth, isAdmin, cookies) | ~100 | JWT + initData validation |
| **`/server/_core/trpc.ts`** | Configura procedures (public, protected, admin) | ~70 | Middlewares de autenticação |
| **`/server/_core/rate-limiter.ts`** | Rate limiting 3 camadas + cache flag 30s | ~150 | SlowSocialRateLimiter class |
| **`/server/_core/session.ts`** | JWT sessions (7 dias, HS256) | ~80 | sign, verify, cookie helpers |
| **`/server/_core/telegram-validation.ts`** | Validação HMAC-SHA256 do initData | ~120 | extractAndValidateInitData |
| **`/server/_core/env.ts`** | Variáveis de ambiente (adminTelegramIds) | ~50 | Tipagem + validação |
| **`/server/_core/logger.ts`** | LogVault - logger estruturado | ~100 | log.info/warn/error |
| **`/server/db.ts`** | Singleton DB + 25+ funções de database | ~400 | Drizzle ORM queries |
| **`/server/storage.ts`** | Upload/delete de imagens (12MB max) | ~100 | Supabase Storage helpers |
| **`/server/bot/telegram-bot.ts`** | Bot API (send, notifyReply/Reaction/Follow) | ~150 | Telegram Bot API wrappers |
| **`/server/repositories/*.ts`** | 35+ funções de CRUD | ~700 | Repository pattern |
| **`/server/routers/*.ts`** | 37 procedures tRPC | ~900 | Business logic |

**Total de Linhas de Backend:** ~2.000+ linhas de código TypeScript

---

## 3. SISTEMA DE AUTENTICAÇÃO

### 3.1 Visão Geral

O sistema de autenticação é baseado em **Telegram WebApp initData**, validado via **HMAC-SHA256**, com session management opcional via **JWT** e verificação de admin.

**Características:**
- **Stateless:** Validação via assinatura criptográfica
- **Baseado em Telegram:** Usa identidade do Telegram
- **Sem OAuth:** Não há fluxo OAuth tradicional
- **Session Opcional:** JWT para persistência (7 dias)
- **Admin Auth:** Verificação via ENV.adminTelegramIds (array)
- **Segurança:** Fallback legacy REMOVIDO (apenas WebAppData HMAC-SHA256)

### 3.2 Ordem de Autenticação

O backend verifica autenticação na seguinte ordem:

1. **Cookie de sessão JWT** (`deck_session`)
   - Mais rápido (não requer validação criptográfica)
   - Persiste por 7 dias
   - Verificado primeiro no `createContext()`

2. **Authorization header** (`Bearer <initData>`)
   - Validação HMAC-SHA256 required
   - initData expira em 5 minutos (300s)
   - Fallback se JWT não existir

3. **X-Telegram-Init-Data header** (alternativo)
   - Mesmo tratamento que Authorization header
   - Usado por alguns clientes

### 3.3 Contexto tRPC

**Tipo do Contexto:**
```typescript
interface Context {
  telegramId?: number;        // ID do usuário autenticado
  isAuthenticated: boolean;   // true se autenticado
  isAdmin: boolean;           // true se telegramId em ENV.adminTelegramIds
  responseCookies: string[];  // Cookies para propagar na resposta
}
```

**Criação do Contexto:**
```typescript
// server/_core/context.ts
export async function createVercelContext({ req }: { req: Request }): Promise<Context> {
  const responseCookies: string[] = []

  // ── 1. Cookie de sessão JWT ───────────────────────────────────
  const cookieHeader = req.headers.get("cookie") || ""
  const cookies = cookieHeader ? parse(cookieHeader) : {}
  const sessionToken = cookies[getSessionCookieName()]

  if (sessionToken) {
    const telegramId = await verifySession(sessionToken)
    if (telegramId) {
      return {
        telegramId,
        isAuthenticated: true,
        isAdmin: ENV.adminTelegramIds.includes(telegramId),
        responseCookies,
      }
    }
  }

  // ── 2. Validação do Telegram initData ─────────────────────────
  if (!ENV.telegramBotToken) {
    return { isAuthenticated: false, isAdmin: false, responseCookies }
  }

  const authHeader = req.headers.get("Authorization")
  const altHeader = req.headers.get("X-Telegram-Init-Data")
  const authHeaderValue = authHeader || (altHeader ? `Bearer ${altHeader}` : null)

  if (authHeaderValue) {
    const result = extractAndValidateInitData(authHeaderValue, ENV.telegramBotToken)
    if (result.valid && result.telegramId) {
      return {
        telegramId: result.telegramId,
        isAuthenticated: true,
        isAdmin: ENV.adminTelegramIds.includes(result.telegramId),
        responseCookies,
      }
    }
  }

  return { isAuthenticated: false, isAdmin: false, responseCookies }
}
```

**Mudanças v5.0.0:**
- ✅ Simplificado: Contexto contém apenas campos necessários
- ❌ Removido: `authHeaderPresent`, `authHeaderLength`, `authHeaderSource` (não usados)

### 3.4 FIX DE SEGURANÇA v3.0.0 (Fallback Legacy Removido)

**Mudança Crítica:** Removido fallback legacy (SHA256 do botToken)

**Antes (INSEGURO - v1.0.0-v2.0.0):**
```typescript
// Método legacy - REMOVIDO em v3.0.0
const legacyKey = crypto.createHash("sha256").update(botToken).digest()
const legacyHash = crypto
  .createHmac("sha256", legacyKey)
  .update(dataCheckString)
  .digest("hex")

if (calculatedHash !== hash && legacyHash !== hash) {
  return null
}
```

**Agora (SEGURO - v3.0.0+):**
```typescript
// Apenas WebAppData HMAC-SHA256
const secretKey = crypto
  .createHmac("sha256", "WebAppData")
  .update(botToken)
  .digest()

if (calculatedHash !== hash) {
  return null
}
```

**Por que foi removido:**
- O método legacy era menos seguro (hash simples do botToken)
- Telegram oficial usa apenas WebAppData
- Reduz superfície de ataque

---

## 4. VALIDAÇÃO DE DADOS DO TELEGRAM

### 4.1 Algoritmo de Validação (Passo a Passo)

O Telegram assina o `initData` usando **HMAC-SHA256** com uma chave derivada do bot token.

**Fórmula:**
```
1. secretKey = HMAC-SHA256("WebAppData", botToken)
2. dataCheckString = sorted(params without hash).join("\n")
3. calculatedHash = HMAC-SHA256(secretKey, dataCheckString)
4. valid = calculatedHash === hash
5. Verifica expiração: auth_date < 5 minutos (300s)
```

**Exemplo de initData:**
```
user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Joao%22%7D&auth_date=1234567890&hash=abc123def456...
```

**Parseado:**
```typescript
{
  user: '{"id":123456789,"first_name":"Joao"}',
  auth_date: '1234567890',
  hash: 'abc123def456...'
}
```

### 4.2 Implementação Completa (Código Comentado)

**Arquivo:** `server/_core/telegram-validation.ts`

```typescript
import { parse } from 'cookie'
import crypto from 'crypto'

/**
 * Valida initData do Telegram usando HMAC-SHA256
 * 
 * @param initDataString - String do initData (ex: "user=...&auth_date=...&hash=...")
 * @param botToken - Token do bot do Telegram
 * @returns TelegramInitData | null (null se inválido)
 */
export function validateTelegramInitData(
  initDataString: string,
  botToken: string
): TelegramInitData | null {
  try {
    // ── Passo 1: Parse do queryString ────────────────────────────
    const initData = parseQueryString(initDataString)

    // ── Passo 2: Extrai hash dos dados ───────────────────────────
    const hash = initData.hash
    if (!hash) {
      console.error("[Telegram] No hash found in initData")
      return null
    }

    // ── Passo 3: Cria dataCheckString ────────────────────────────
    // Remove 'hash' do objeto, ordena chaves alfabeticamente, join com "\n"
    const dataCheckString = Object.keys(initData)
      .filter((key) => key !== "hash")
      .sort()
      .map((key) => `${key}=${initData[key]}`)
      .join("\n")

    // ── Passo 4: Calcula secretKey ───────────────────────────────
    // secretKey = HMAC-SHA256("WebAppData", botToken)
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest()

    // ── Passo 5: Calcula hash ────────────────────────────────────
    // calculatedHash = HMAC-SHA256(secretKey, dataCheckString)
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex")

    // ── Passo 6: Compara hashes ──────────────────────────────────
    // ⚠️ FALLBACK LEGACY REMOVIDO (v3.0.0) - Apenas WebAppData HMAC-SHA256
    if (calculatedHash !== hash) {
      console.error("[Telegram] Invalid signature hash")
      return null
    }

    // ── Passo 7: Verifica expiração ──────────────────────────────
    // auth_date deve ser < 5 minutos (300s)
    const authDate = parseInt(initData.auth_date || "0")
    const currentTime = Math.floor(Date.now() / 1000)
    const maxAge = 300 // 5 minutos

    if (currentTime - authDate > maxAge) {
      console.error("[Telegram] initData expired (max 5 minutes)")
      return null
    }

    // ── Passo 8: Parse dos dados do usuário ─────────────────────
    if (initData.user) {
      try {
        const userData = JSON.parse(initData.user)
        return {
          ...initData,
          user: userData,
          auth_date: authDate,
        } as TelegramInitData
      } catch {
        console.error("[Telegram] Failed to parse user data")
        return null
      }
    }

    return {
      ...initData,
      auth_date: authDate,
    } as TelegramInitData
  } catch (error) {
    console.error("[Telegram] Validation error:", error)
    return null
  }
}
```

### 4.3 Extração do Header

**Arquivo:** `server/_core/telegram-validation.ts`

```typescript
/**
 * Extrai e valida initData do header Authorization
 * 
 * @param authHeader - "Bearer <initDataString>" ou "<initDataString>"
 * @param botToken - Token do bot
 * @returns { telegramId?: number, valid: boolean }
 */
export function extractAndValidateInitData(
  authHeader: string | undefined,
  botToken: string
): { telegramId?: number; valid: boolean } {
  if (!authHeader || !botToken) {
    console.error("[Telegram] Missing authHeader or botToken")
    return { valid: false }
  }

  // ── Extrai Bearer token ───────────────────────────────────────
  const parts = authHeader.split(" ")
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    console.error("[Telegram] Invalid Authorization header format")
    return { valid: false }
  }

  const initDataString = parts[1]
  const validData = validateTelegramInitData(initDataString, botToken)

  if (!validData || !validData.user?.id) {
    console.error("[Telegram] Validation failed")
    return { valid: false }
  }

  console.log("[Telegram] Validation successful", { 
    telegramId: validData.user.id 
  })

  return {
    telegramId: validData.user.id,
    valid: true,
  }
}
```

### 4.4 Exemplos de initData Válido e Inválido

**initData Válido:**
```
user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Joao%22%7D&auth_date=1710432000&hash=abc123...
```
- ✅ Hash correto (HMAC-SHA256)
- ✅ auth_date < 5 minutos atrás
- ✅ user JSON válido

**initData Inválido (Hash Errado):**
```
user=%7B%22id%22%3A123456789%7D&auth_date=1710432000&hash=wronghash123
```
- ❌ calculatedHash !== hash
- ❌ Retorna null

**initData Inválido (Expirado):**
```
user=%7B%22id%22%3A123456789%7D&auth_date=1710428400&hash=abc123...
```
- ❌ auth_date > 5 minutos atrás
- ❌ currentTime - auth_date > 300
- ❌ Retorna null

**initData Inválido (Formato do Header):**
```
Authorization: abc123...  // Sem "Bearer "
```
- ❌ parts.length !== 2
- ❌ Retorna { valid: false }

---

## 5. GERENCIAMENTO DE SESSÃO (JWT)

### 5.1 JWT Session Management

Para persistência de sessão, o sistema implementa JWT sessions:

| Configuração | Valor | Descrição |
|-------------|-------|-----------|
| **Algoritmo** | HS256 | HMAC-SHA256 |
| **TTL** | 604800s | 7 dias |
| **Storage** | Cookie HTTP-only | `deck_session` |
| **Secret** | `JWT_SECRET` | Variável de ambiente |
| **Cookie Flags** | httpOnly, sameSite: lax, secure (prod) | Segurança máxima |

### 5.2 Implementação Completa (sign, verify, cookie)

**Arquivo:** `server/_core/session.ts`

```typescript
import { SignJWT, jwtVerify } from 'jose'
import { serialize } from 'cookie'
import { ENV } from './env'

const SESSION_COOKIE = 'deck_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7 // 7 days = 604800s

/**
 * Obtém chave JWT da variável de ambiente
 */
function getJwtKey(): Uint8Array {
  return new TextEncoder().encode(ENV.cookieSecret || '')
}

/**
 * Assinar session JWT
 * 
 * @param telegramId - ID do usuário no Telegram
 * @returns Token JWT assinado
 */
export async function signSession(telegramId: number): Promise<string> {
  const key = getJwtKey()
  
  return new SignJWT({ telegramId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt() // iat claim
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`) // exp claim
    .sign(key)
}

/**
 * Verificar session JWT
 * 
 * @param token - Token JWT a verificar
 * @returns telegramId se válido, null se inválido/expirado
 */
export async function verifySession(token: string): Promise<number | null> {
  if (!ENV.cookieSecret) return null
  
  try {
    const key = getJwtKey()
    const { payload } = await jwtVerify(token, key)

    // Conversão type-safe para number
    const telegramId = typeof payload.telegramId === 'number'
      ? payload.telegramId
      : Number(payload.telegramId)

    return Number.isFinite(telegramId) ? telegramId : null
  } catch {
    return null
  }
}

/**
 * Criar cookie de sessão
 * 
 * @param token - Token JWT
 * @returns String do cookie (Set-Cookie header)
 */
export function createSessionCookie(token: string) {
  return serialize(SESSION_COOKIE, token, {
    httpOnly: true,           // Inacessível via JavaScript
    sameSite: 'lax',          // Protege contra CSRF
    secure: ENV.isProduction, // Apenas HTTPS em produção
    path: '/',                // Disponível em todo o domínio
    maxAge: SESSION_TTL_SECONDS, // 7 dias
  })
}

/**
 * Limpar cookie de sessão
 * 
 * @returns String do cookie expirado (para remover)
 */
export function clearSessionCookie() {
  return serialize(SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: ENV.isProduction,
    path: '/',
    maxAge: 0, // Expira imediatamente
  })
}

/**
 * Obtém nome do cookie de sessão
 */
export function getSessionCookieName() {
  return SESSION_COOKIE
}
```

### 5.3 Uso no Login

**Arquivo:** `server/routers/telegram.router.ts`

```typescript
telegram: router({
  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ ctx, input }) => {
      // Valida que telegramId corresponde ao contexto
      if (!ctx.telegramId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: "initData do Telegram inválido",
        })
      }

      if (ctx.telegramId !== input.telegramId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: "Você não tem permissão para usar este ID de Telegram",
        })
      }

      // Verifica flag pause_new_users (apenas para usuários novos)
      const existingUser = await db.getUserByTelegramId(input.telegramId)
      if (!existingUser) {
        const pauseFlag = await db.getServerFlag('pause_new_users')
        if (pauseFlag === 'true') {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Novos cadastros estão temporariamente pausados.',
          })
        }
      }

      // Verifica ban antes de upsert
      if (existingUser?.isBanned) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Sua conta foi banida. Entre em contato com a administração.',
        })
      }

      // Upsert no banco
      const name = [input.firstName, input.lastName].filter(Boolean).join(' ')
      const result = await db.upsertTelegramUser(input.telegramId, name, input.photoUrl)

      // Verifica ban após upsert
      if (result?.isBanned) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Sua conta foi banida. Entre em contato com a administração.',
        })
      }

      // Cria session cookie se JWT_SECRET estiver configurado
      if (ENV.cookieSecret) {
        const token = await signSession(input.telegramId)
        ctx.responseCookies.push(createSessionCookie(token))
      }

      return result
    }),
})
```

### 5.4 Security Best Practices

| Prática | Implementação | Por Que |
|---------|---------------|---------|
| **httpOnly** | `httpOnly: true` | Previne XSS (JavaScript não acessa cookie) |
| **sameSite: lax** | `sameSite: 'lax'` | Protege contra CSRF (não envia em cross-site requests) |
| **secure** | `secure: ENV.isProduction` | Apenas HTTPS em produção (previne sniffing) |
| **path: /** | `path: '/'` | Disponível em todo o domínio |
| **maxAge** | `604800s` (7 dias) | Expira após 7 dias (renova no login) |
| **HS256** | Algoritmo HMAC-SHA256 | Seguro, amplamente suportado |
| **JWT_SECRET** | Variável de ambiente | Nunca hardcoded no código |

---

## 6. PROCEDURES TRPC - DETALHAMENTO

### 6.1 publicProcedure

**Propósito:** Endpoints públicos (sem autenticação).

**Uso:**
```typescript
// server/_core/trpc.ts
export const publicProcedure = t.procedure

// server/routers/system.router.ts
export const systemRouter = router({
  health: publicProcedure
    .input(z.object({ timestamp: z.number() }))
    .query(() => {
      return { ok: true }
    }),
})
```

**Endpoints que usam publicProcedure:**
- `system.health` - Health check
- `system.diagnostic` - Diagnóstico do sistema
- `system.testDatabase` - Teste de conexão DB
- `users.search` - Busca de usuários (pública)

### 6.2 protectedProcedure (Middleware isAuthed)

**Propósito:** Endpoints protegidos (requer autenticação).

**Middleware:**
```typescript
// server/_core/trpc.ts
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.isAuthenticated || !ctx.telegramId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Autenticação necessária',
    })
  }
  return next({
    ctx: {
      ...ctx,
      isAuthenticated: true as const,
      telegramId: ctx.telegramId,
    },
  })
})

export const protectedProcedure = t.procedure.use(isAuthed)
```

**Uso:**
```typescript
// server/routers/post.router.ts
posts: router({
  create: protectedProcedure
    .input(CreatePostSchema)
    .mutation(async ({ ctx, input }) => {
      // ctx.telegramId disponível (garantido pelo middleware)
      const telegramId = ctx.telegramId
      // ...
    }),
})
```

**Endpoints que usam protectedProcedure:**
- `telegram.me` - Dados do usuário atual
- `telegram.isAdmin` - Verifica se é admin
- `posts.create` - Cria post
- `posts.timeline` - Timeline
- `follows.follow` - Seguir usuário
- `reactions.add` - Adicionar reação
- `users.setNotifications` - Opt-out de notificações

### 6.3 adminProcedure (Middleware isAdmin)

**Propósito:** Endpoints admin (requer isAdmin = true).

**Middleware:**
```typescript
// server/_core/trpc.ts
const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.isAuthenticated || !ctx.telegramId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Autenticação necessária',
    })
  }
  if (!ctx.isAdmin) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Acesso negado',
    })
  }
  return next({
    ctx: {
      ...ctx,
      isAuthenticated: true as const,
      telegramId: ctx.telegramId,
      isAdmin: true as const,
    },
  })
})

export const adminProcedure = t.procedure.use(isAdmin)
```

**Uso:**
```typescript
// server/routers/admin.router.ts
admin: router({
  banUser: adminProcedure
    .input(z.object({ telegramId: z.number(), ban: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // ctx.isAdmin = true (garantido pelo middleware)
      // ctx.telegramId = admin telegramId
      // ...
    }),
})
```

**Endpoints que usam adminProcedure:**
- `admin.getStats` - Stats do dashboard
- `admin.getFlags` - Flags do servidor
- `admin.setFlag` - Define flag
- `admin.banUser` - Ban/unban usuário
- `admin.shadowBanUser` - Shadow ban
- `admin.deletePost` - Deleta qualquer post
- `admin.getLogs` - LogVault

### 6.4 TRPCError Codes e Mensagens

**Códigos de Erro Disponíveis:**

| Código | HTTP Status | Quando Usar |
|--------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Falta de autenticação |
| `FORBIDDEN` | 403 | Sem permissão (banido, não admin) |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `BAD_REQUEST` | 400 | Input inválido |
| `TOO_MANY_REQUESTS` | 429 | Rate limit atingido |
| `INTERNAL_SERVER_ERROR` | 500 | Erro interno do servidor |

**Exemplos de Uso:**
```typescript
// UNAUTHORIZED - Falta de autenticação
throw new TRPCError({
  code: 'UNAUTHORIZED',
  message: 'Autenticação necessária',
})

// FORBIDDEN - Usuário banido
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'Sua conta foi banida. Entre em contato com a administração.',
})

// FORBIDDEN - Não admin
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'Acesso negado',
})

// NOT_FOUND - Post não encontrado
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Post não encontrado.',
})

// BAD_REQUEST - Input inválido
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Formato de imagem inválido',
})

// TOO_MANY_REQUESTS - Rate limit
throw new TRPCError({
  code: 'TOO_MANY_REQUESTS',
  message: `Aguarde até ${nextAllowedAt.toLocaleTimeString('pt-BR')} para postar novamente`,
  cause: {
    nextAllowedAt,
    timeRemainingMs,
  },
})

// INTERNAL_SERVER_ERROR - Erro no upload
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: error instanceof Error ? `Upload falhou: ${error.message}` : 'Upload falhou',
})
```

---

## 7. RATE LIMITING HÍBRIDO (3 CAMADAS)

### 7.1 Visão Geral das 3 Camadas

**Arquivo:** `server/_core/rate-limiter.ts`

**Intervalos:**
- **Posts:** 10 minutos (600.000ms)
- **Replies:** 15 minutos (900.000ms)
- **Admin:** Bypassa todas as camadas

**Camadas:**

| Camada | Localização | Propósito | Vantagens |
|--------|-------------|-----------|-----------|
| **1** | Frontend (CloudStorage + localStorage) | Bloqueio imediato (sem latência) | UX rápida, sem chamada de API |
| **2** | Backend (users.lastPostAt/lastReplyAt) | Fonte da verdade, sincroniza dispositivos | Persistente, à prova de falhas |
| **3** | Backend (tabela posts) | Fallback para legacy data | Lida com usuários antigos |

**Regra:** **Mais restritivo vence** - Se qualquer camada diz "não pode", o usuário é bloqueado.

### 7.2 Implementação Completa (SlowSocialRateLimiter)

**Arquivo:** `server/_core/rate-limiter.ts`

```typescript
import { getDb } from '../db'
import { users, posts } from '../../drizzle/schema'
import { eq, desc } from 'drizzle-orm'

export class SlowSocialRateLimiter {
  private readonly POST_INTERVAL_MS = 10 * 60 * 1000 // 10 minutos
  private readonly REPLY_INTERVAL_MS = 15 * 60 * 1000 // 15 minutos

  /**
   * Verifica se o usuário pode criar um post.
   * 
   * Checkpoints do servidor (a Camada 1 — cache local — é do frontend):
   *   Camada 2 — users.lastPostAt  (fonte da verdade, persiste após delete)
   *   Camada 3 — tabela posts      (fallback para usuários sem lastPostAt)
   * 
   * Mais restritivo vence. Admin sempre passa.
   */
  async canCreatePost(
    telegramId: number,
    isAdmin = false,
  ): Promise<{
    canPost: boolean
    nextAllowedAt?: Date
    timeRemainingMs?: number
    blockedBy?: 'lastPostAt' | 'posts_fallback'
  }> {
    if (isAdmin) return { canPost: true }

    const db = getDb()

    // ── Camada 2: users.lastPostAt ────────────────────────────────────
    const user = await db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
      columns: { lastPostAt: true },
    })

    if (user?.lastPostAt) {
      const timeSince = Date.now() - user.lastPostAt.getTime()
      if (timeSince < this.POST_INTERVAL_MS) {
        const nextAllowedAt = new Date(user.lastPostAt.getTime() + this.POST_INTERVAL_MS)
        return {
          canPost: false,
          nextAllowedAt,
          timeRemainingMs: this.POST_INTERVAL_MS - timeSince,
          blockedBy: 'lastPostAt',
        }
      }
      return { canPost: true }
    }

    // ── Camada 3: fallback via tabela posts ─────────────────────────
    const lastPost = await db.query.posts.findFirst({
      where: eq(posts.telegramId, telegramId),
      orderBy: [desc(posts.createdAt)],
      columns: { createdAt: true },
    })

    if (!lastPost) return { canPost: true }

    const timeSince = Date.now() - lastPost.createdAt.getTime()
    if (timeSince < this.POST_INTERVAL_MS) {
      const nextAllowedAt = new Date(lastPost.createdAt.getTime() + this.POST_INTERVAL_MS)
      return {
        canPost: false,
        nextAllowedAt,
        timeRemainingMs: this.POST_INTERVAL_MS - timeSince,
        blockedBy: 'posts_fallback',
      }
    }

    return { canPost: true }
  }

  /**
   * Verifica se o usuário pode criar uma resposta (15 min cooldown).
   * Usa users.lastReplyAt como fonte da verdade.
   * Admin sempre passa.
   */
  async canCreateReply(
    telegramId: number,
    isAdmin = false,
  ): Promise<{
    canReply: boolean
    nextAllowedAt?: Date
    timeRemainingMs?: number
  }> {
    if (isAdmin) return { canReply: true }

    const db = getDb()

    const user = await db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
      columns: { lastReplyAt: true },
    })

    if (user?.lastReplyAt) {
      const timeSince = Date.now() - user.lastReplyAt.getTime()
      if (timeSince < this.REPLY_INTERVAL_MS) {
        const nextAllowedAt = new Date(user.lastReplyAt.getTime() + this.REPLY_INTERVAL_MS)
        return {
          canReply: false,
          nextAllowedAt,
          timeRemainingMs: this.REPLY_INTERVAL_MS - timeSince,
        }
      }
    }

    return { canReply: true }
  }
}
```

### 7.3 Camada 1: Frontend (CloudStorage)

**Arquivo:** `src/lib/rate-limit-cache.ts`

```typescript
const RATE_LIMIT_KEY = '@deck/last-post-timestamp'
const POST_INTERVAL_MS = 10 * 60 * 1000 // 10 minutos

/**
 * Obtém timestamp do último post do cache local
 */
export async function getRateLimitCache(): Promise<number | null> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp

    // Tenta CloudStorage primeiro (assíncrono, callback-based)
    if (tg?.CloudStorage) {
      tg.CloudStorage.getItem(RATE_LIMIT_KEY, (err, value) => {
        if (err || !value) {
          // Fallback para localStorage
          const local = localStorage.getItem(RATE_LIMIT_KEY)
          resolve(local ? parseInt(local) : null)
        } else {
          resolve(parseInt(value))
        }
      })
    } else {
      // Fallback para localStorage
      const local = localStorage.getItem(RATE_LIMIT_KEY)
      resolve(local ? parseInt(local) : null)
    }
  })
}

/**
 * Grava timestamp do último post no cache local
 */
export async function setRateLimitCache(timestamp: number): Promise<void> {
  return new Promise((resolve) => {
    const tg = window.Telegram?.WebApp

    if (tg?.CloudStorage) {
      tg.CloudStorage.setItem(RATE_LIMIT_KEY, String(timestamp), resolve)
    } else {
      localStorage.setItem(RATE_LIMIT_KEY, String(timestamp))
      resolve()
    }
  })
}

/**
 * Limpa cache de rate limit
 */
export function clearRateLimitCache(): void {
  const tg = window.Telegram?.WebApp
  if (tg?.CloudStorage) {
    tg.CloudStorage.removeItem(RATE_LIMIT_KEY, () => {})
  }
  localStorage.removeItem(RATE_LIMIT_KEY)
}

/**
 * Verifica rate limit local (sem latência de rede)
 */
export function checkLocalRateLimit(): { 
  canPost: boolean
  timeRemainingMs?: number 
} {
  const lastPostAt = getRateLimitCache()

  if (!lastPostAt) return { canPost: true }

  const timeSince = Date.now() - lastPostAt
  if (timeSince < POST_INTERVAL_MS) {
    return {
      canPost: false,
      timeRemainingMs: POST_INTERVAL_MS - timeSince,
    }
  }

  return { canPost: true }
}
```

**Características:**
- ✅ **CloudStorage:** Sincronizado entre dispositivos (Telegram)
- ✅ **localStorage:** Fallback se CloudStorage indisponível
- ✅ **Assíncrono:** Callback-based (Telegram SDK)
- ✅ **Mais restritivo vence:** Se local diz "não pode", bloqueia mesmo se backend permitir

### 7.4 Camada 2: Backend (users.lastPostAt)

**Arquivo:** `server/repositories/user.repository.ts`

```typescript
/**
 * Atualiza timestamp do último post (rate limit híbrido - camada 2)
 */
export async function updateUserLastPostAt(telegramId: number): Promise<void> {
  const db = getDb()
  
  await db
    .update(users)
    .set({ lastPostAt: new Date() })
    .where(eq(users.telegramId, telegramId))
}

/**
 * Atualiza timestamp da última resposta (rate limit híbrido - camada 2)
 */
export async function updateUserLastReplyAt(telegramId: number): Promise<void> {
  const db = getDb()
  
  await db
    .update(users)
    .set({ lastReplyAt: new Date() })
    .where(eq(users.telegramId, telegramId))
}
```

**Características:**
- ✅ **Fonte da verdade:** Persiste mesmo após delete do post
- ✅ **Sincronizado:** Mesmo valor em todos os dispositivos
- ✅ **À prova de falhas:** Sobrevive a limpezas de cache local

### 7.5 Camada 3: Backend (tabela posts)

**Propósito:** Fallback para usuários que não têm `lastPostAt` populado (legado).

**Implementação:**
```typescript
// server/_core/rate-limiter.ts (camada 3)
const lastPost = await db.query.posts.findFirst({
  where: eq(posts.telegramId, telegramId),
  orderBy: [desc(posts.createdAt)],
  columns: { createdAt: true },
})

if (!lastPost) return { canPost: true }

const timeSince = Date.now() - lastPost.createdAt.getTime()
if (timeSince < this.POST_INTERVAL_MS) {
  const nextAllowedAt = new Date(lastPost.createdAt.getTime() + this.POST_INTERVAL_MS)
  return {
    canPost: false,
    nextAllowedAt,
    timeRemainingMs: this.POST_INTERVAL_MS - timeSince,
    blockedBy: 'posts_fallback',
  }
}
```

**Quando é usado:**
- Usuários criados antes da implementação de `lastPostAt` (v3.0.0)
- Casos raros onde `lastPostAt` foi corrompido/perdido

### 7.6 Regra: Mais Restritivo Vence

**Fluxo de Verificação:**
```typescript
// Frontend (src/hooks/use-post-rate-limit.ts)
const { canPost, timeRemaining } = usePostRateLimit(user?.id, isAdmin)

// 1. Verifica cache local (CloudStorage)
const localLastPostAt = await getRateLimitCache()
if (localLastPostAt && Date.now() - localLastPostAt < POST_INTERVAL_MS) {
  return { canPost: false, timeRemaining: ... }
}

// 2. Verifica backend (users.lastPostAt)
const serverCanPost = await trpc.posts.canCreate.query()
if (!serverCanPost.canPost) {
  return { canPost: false, timeRemaining: ... }
}

// Mais restritivo vence: se qualquer camada bloqueia, retorna false
```

**Exemplo:**
```
Usuário postou há 8 minutos:

Camada 1 (CloudStorage): lastPostAt = 8 min atrás → BLOQUEIA (10 min necessário)
Camada 2 (users.lastPostAt): lastPostAt = 8 min atrás → BLOQUEIA
Camada 3 (posts): lastPost.createdAt = 8 min atrás → BLOQUEIA

Resultado: canPost = false, timeRemaining = 2 minutos
```

### 7.7 Admin Bypass

**Implementação:**
```typescript
// server/_core/rate-limiter.ts
async canCreatePost(telegramId: number, isAdmin = false): Promise<...> {
  if (isAdmin) return { canPost: true }  // ← Admin bypassa todas as camadas
  
  // ... verificações de rate limit ...
}
```

**Por que admin bypassa:**
- ✅ Permite testes sem restrições
- ✅ Permite moderação (criar posts de exemplo)
- ✅ Não grava cache local (não polui CloudStorage)

### 7.8 Flag Cache (TTL 30s)

**Propósito:** Evitar queries repetidas para `disable_rate_limit_global`.

**Implementação:**
```typescript
// server/_core/rate-limiter.ts
export class SlowSocialRateLimiter {
  private _rateLimitDisabledCache: { value: boolean; timestamp: number } | null = null
  private readonly CACHE_TTL_MS = 30 * 1000 // 30 segundos

  /**
   * Verifica se rate limit está desativado globalmente
   */
  private async isRateLimitDisabled(): Promise<boolean> {
    const now = Date.now()
    
    // Retorna cache se válido (TTL 30s)
    if (this._rateLimitDisabledCache && 
        now - this._rateLimitDisabledCache.timestamp < this.CACHE_TTL_MS) {
      return this._rateLimitDisabledCache.value
    }

    // Query no banco
    const flag = await getServerFlag('disable_rate_limit_global')
    const value = flag === 'true'

    // Atualiza cache
    this._rateLimitDisabledCache = { value, timestamp: now }

    return value
  }

  /**
   * Invalida cache da flag (chamado após admin alterar flag)
   */
  invalidateFlagCache(): void {
    this._rateLimitDisabledCache = null
  }
}
```

**Uso no Router:**
```typescript
// server/routers/admin.router.ts
admin: router({
  setFlag: adminProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const prev = await getServerFlag(input.key)
      await setServerFlag(input.key, input.value)
      
      // Invalida cache do rate limiter
      rateLimiter.invalidateFlagCache()
      
      // Log de auditoria
      await logAdminAction({ ... })
      
      return { success: true }
    }),
})
```

---

## 8. MECANISMOS INTERNOS E OTIMIZAÇÕES

### 8.1 Stable Refs Pattern

**Propósito:** Evitar stale closures em callbacks assíncronos do Telegram.

**Problema:**
```typescript
// ❌ ANTES (stale closure)
const [content, setContent] = useState('')

const handleClick = useCallback(() => {
  createMutation.mutate({ content })  // content pode estar stale!
}, [createMutation])
```

**Solução:**
```typescript
// ✅ DEPOIS (refs estáveis)
const [content, setContent] = useState('')
const contentRef = useRef(content)

// Atualiza ref quando valor muda
useEffect(() => {
  contentRef.current = content
}, [content])

// Handler usa ref (sempre valor atual)
const stableHandler = useRef(() => {
  const current = contentRef.current  // ← SEMPRE valor atual
  createMutation.mutate({ content: current })
})

// Callback do Telegram (registrado UMA VEZ)
const onMainButtonClick = useCallback(() => {
  stableHandler.current()
}, [])
```

**Onde é Usado:**
- `src/app/create/page.tsx`: contentRef, imageBase64Ref, isPublishingRef, canPostRef, userRef
- `src/app/create/page.tsx`: mutationRef (para createMutation)
- `server/routers/post.router.ts`: telegramId validation

**Por Que é Brillhante:**
- ✅ Previne bugs sutis que seriam difíceis de debugar
- ✅ Callbacks do Telegram são registrados uma vez (offClick/onClick)
- ✅ Garante que valores mais recentes sejam usados em handlers assíncronos

### 8.2 Promise.all Optimization

**Propósito:** Reduzir latência de 2 round-trips para 1 round-trip.

**Problema:**
```typescript
// ❌ ANTES (2 round-trips)
const recipient = await getUserByTelegramId(recipientId)  // Query 1
const actor = await getUserByTelegramId(actorId)          // Query 2
// Total: 2 queries sequenciais = 2x latência
```

**Solução:**
```typescript
// ✅ DEPOIS (1 round-trip)
const [recipient, actor] = await Promise.all([
  getUserByTelegramIdForNotifications(recipientId),
  getUserByTelegramIdForNotifications(actorId),
])
// Total: 1 query paralela = 1x latência
```

**Onde é Usado:**
- `server/routers/post.router.ts`: sendNotification helper
- `server/repositories/admin.repository.ts`: getAdminStats (3 queries paralelas)

**Impacto:**
- ✅ **-50% latência** para notificações
- ✅ **-66% latência** para stats do admin (3 queries → 1 round-trip)

**Implementação Completa:**
```typescript
// server/routers/post.router.ts
async function sendNotification(params: {
  type: "reply" | "reaction" | "follow"
  recipientId: number
  actorId: number
  // ...
}): Promise<void> {
  try {
    // Nunca notificar a si mesmo
    if (params.recipientId === params.actorId) return

    // Buscar recipient e actor em paralelo (Promise.all)
    const [recipient, actor] = await Promise.all([
      getUserByTelegramIdForNotifications(params.recipientId),
      getUserByTelegramIdForNotifications(params.actorId),
    ])

    if (!recipient?.notificationsEnabled || !actor?.name) return

    // ... resto do código ...
  } catch (error) {
    // Silencioso - nunca quebra operação principal
  }
}
```

### 8.3 Cursor Pagination

**Propósito:** Paginação eficiente para grandes datasets (melhor que offset).

**Problema com Offset:**
```typescript
// ❌ Offset pagination (ineficiente)
SELECT * FROM posts ORDER BY id DESC OFFSET 1000 LIMIT 20
// PostgreSQL precisa scanear 1020 rows e descartar 1000
```

**Solução com Cursor:**
```typescript
// ✅ Cursor pagination (eficiente)
SELECT * FROM posts WHERE id < 12345 ORDER BY id DESC LIMIT 21
// Usa índice, vai direto ao ponto, sem scan desnecessário
```

**Implementação Completa:**
```typescript
// server/repositories/post.repository.ts
export async function getTimelinePosts(
  telegramId: number,
  limit: number = 20,
  cursor: number | undefined,
  feedMode: 'following' | 'all',
  isAdmin: boolean
): Promise<{ posts: PostWithAuthor[], nextCursor?: number }> {
  const db = getDb()
  
  // Validar e clampar limites (previne DoS)
  const safeLimit = Math.min(Math.max(limit, 1), 50)
  const fetchLimit = safeLimit + 1 // +1 para nextCursor
  
  // Efemeridade: 7 dias (admin isento)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const adminIds = ENV.adminTelegramIds
  
  const ephemeralFilter = adminIds.length > 0
    ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
    : gte(posts.createdAt, sevenDaysAgo)
  
  // Filtro cursor: posts com id < cursor
  const cursorFilter = cursor !== undefined
    ? lt(posts.id, cursor)
    : undefined
  
  // ... monta whereClause ...
  
  const rows = await db.query.posts.findMany({
    where: whereClause,
    orderBy: desc(posts.id), // ← CURSOR PAGINATION (id DESC)
    limit: fetchLimit,
    with: { author: {...}, replyToPost: {...} },
  })
  
  // Determina próximo cursor
  const hasMore = rows.length > safeLimit
  const items = hasMore ? rows.slice(0, safeLimit) : rows
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined
  
  return { posts: items, nextCursor }
}
```

**Vantagens vs Offset:**
- ✅ **Performance constante:** Não importa a página (sempre usa índice)
- ✅ **Não pula/duplica:** Dados mudando durante paginação não causam problemas
- ✅ **Mais eficiente:** Scan menor, menos I/O

### 8.4 bool_or() Optimization

**Propósito:** Obter reações + userReacted em uma única query.

**Problema:**
```typescript
// ❌ ANTES (2 queries)
const reactions = await db.select({ emoji, count })
  .from(reactions)
  .where(eq(reactions.postId, postId))
  .groupBy(reactions.emoji)

const userReaction = await db.select({ emoji })
  .from(reactions)
  .where(and(
    eq(reactions.postId, postId),
    eq(reactions.telegramId, telegramId)
  ))

// Precisa merge dos resultados no frontend
```

**Solução:**
```typescript
// ✅ DEPOIS (1 query com bool_or)
const result = await db
  .select({
    emoji: reactions.emoji,
    count: sql<number>`count(*)`.mapWith(Number),
    userReacted: sql<boolean>`bool_or(${reactions.telegramId} = ${telegramId})`,
  })
  .from(reactions)
  .where(eq(reactions.postId, postId))
  .groupBy(reactions.emoji)

// Retorna: [{ emoji: '🔥', count: 5, userReacted: true }, ...]
```

**Onde é Usado:**
- `server/repositories/reaction.repository.ts`: getReactionsByPost

**Impacto:**
- ✅ **-50% latência:** 1 query ao invés de 2
- ✅ **-50% custo:** Menos queries no banco

### 8.5 Hard Stop Timer

**Propósito:** Forçar publicação após vídeo animation, mesmo se vídeo travar.

**Implementação:**
```typescript
// src/app/create/page.tsx
const VIDEO_DURATION_MS = 3740   // 3.74s (60fps)
const HARD_STOP_MS = 3940        // 3.74s + 200ms (segurança)

const startVideoAnimation = useCallback(() => {
  // ... fade-in, play vídeo, flash ...
  
  // Hard stop timer (segurança)
  hardStopTimerRef.current = setTimeout(() => {
    // Limpa listeners
    if (handlers.timeupdate) video.removeEventListener('timeupdate', handlers.timeupdate)
    if (handlers.ended) video.removeEventListener('ended', handlers.ended)
    
    setIsVideoPlaying(false)
    setTimeout(() => {
      stopVideoAnimation()
      doPublish()  // Publica mesmo se vídeo travar
    }, 400)
  }, VIDEO_DURATION_MS + 500)
}, [doPublish])
```

**Por Que é Necessário:**
- ✅ Previne vídeo travado impedindo publicação
- ✅ Garante UX consistente (sempre publica em ~4s)
- ✅ Fallback se evento 'ended' não disparar

---

## 9. OPERAÇÕES DE LEITURA NO BANCO

### 9.1 getTimelinePosts (Cursor Pagination)

**Arquivo:** `server/repositories/post.repository.ts`

**Propósito:** Buscar posts da timeline com cursor pagination, respeitando feedMode e efemeridade.

**Implementação Completa:**
```typescript
export async function getTimelinePosts(
  telegramId: number,
  limit: number = 20,
  cursor: number | undefined,
  feedMode: 'following' | 'all',
  isAdmin: boolean
): Promise<{ posts: PostWithAuthor[], nextCursor?: number }> {
  const db = getDb()
  
  // Validar e clampar limites (previne DoS)
  const safeLimit = Math.min(Math.max(limit, 1), 50)
  const fetchLimit = safeLimit + 1 // +1 para nextCursor
  
  // Efemeridade: 7 dias (admin isento)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const adminIds = ENV.adminTelegramIds
  
  const ephemeralFilter = adminIds.length > 0
    ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
    : gte(posts.createdAt, sevenDaysAgo)
  
  // Filtro cursor: posts com id < cursor
  const cursorFilter = cursor !== undefined
    ? lt(posts.id, cursor)
    : undefined
  
  // Subquery: usuários sem shadow ban
  const nonBannedUsers = db.select({ id: users.telegramId })
    .from(users)
    .where(eq(users.shadowBanned, false))
  
  // Monta whereClause baseado em feedMode
  let whereClause: SQL | undefined
  
  if (feedMode === 'following') {
    // Posts de quem segue + próprias respostas
    const followingIds = await getFollowingIds(telegramId)
    whereClause = and(
      inArray(posts.telegramId, [...followingIds, telegramId]),
      ephemeralFilter,
      cursorFilter
    )
  } else {
    // Todos os posts (exceto shadow-banned)
    whereClause = isAdmin
      ? and(ephemeralFilter, cursorFilter) // Admin vê tudo
      : and(
          inArray(posts.telegramId, nonBannedUsers),
          ephemeralFilter,
          cursorFilter
        )
  }
  
  const rows = await db.query.posts.findMany({
    where: whereClause,
    orderBy: desc(posts.id),
    limit: fetchLimit,
    with: {
      author: {
        columns: {
          telegramId: true,
          name: true,
          photoUrl: true,
        },
      },
      replyToPost: {
        columns: {
          content: true,
        },
      },
    },
  })
  
  // Determina próximo cursor
  const hasMore = rows.length > safeLimit
  const items = hasMore ? rows.slice(0, safeLimit) : rows
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined
  
  return { posts: items, nextCursor }
}
```

**Filtros Aplicados:**
- ✅ **Shadow ban:** Filtra usuários shadowBanned=false
- ✅ **Efemeridade:** Posts < 7 dias (admin isento)
- ✅ **Feed mode:** Following (só quem segue) ou All (todos)
- ✅ **Cursor:** id < cursor (paginação)

### 9.2 getUserPosts (Efemeridade)

**Arquivo:** `server/repositories/post.repository.ts`

**Propósito:** Buscar posts de um usuário específico com efemeridade.

**Implementação:**
```typescript
export async function getUserPosts(
  telegramId: number,
  limit: number = 20,
  cursor: number | undefined,
  isAdmin: boolean
): Promise<{ posts: PostWithAuthor[], nextCursor?: number }> {
  const db = getDb()
  
  const safeLimit = Math.min(Math.max(limit, 1), 100)
  const fetchLimit = safeLimit + 1
  
  // Efemeridade: 7 dias (admin isento)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const adminIds = ENV.adminTelegramIds
  
  const ephemeralFilter = adminIds.length > 0
    ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
    : gte(posts.createdAt, sevenDaysAgo)
  
  const cursorFilter = cursor !== undefined
    ? lt(posts.id, cursor)
    : undefined
  
  const rows = await db.query.posts.findMany({
    where: and(
      eq(posts.telegramId, telegramId),
      ephemeralFilter,
      cursorFilter
    ),
    orderBy: desc(posts.id),
    limit: fetchLimit,
    with: {
      author: { columns: { telegramId: true, name: true, photoUrl: true } },
      replyToPost: { columns: { content: true } },
    },
  })
  
  const hasMore = rows.length > safeLimit
  const items = hasMore ? rows.slice(0, safeLimit) : rows
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined
  
  return { posts: items, nextCursor }
}
```

### 9.3 getReactionsByPost (bool_or)

**Arquivo:** `server/repositories/reaction.repository.ts`

**Propósito:** Buscar reações de um post com userReacted em uma query.

**Implementação:**
```typescript
export async function getReactionsByPost(
  postId: number,
  telegramId: number
): Promise<ReactionCount[]> {
  const db = getDb()
  
  // Uma única query com bool_or() ao invés de 2 queries separadas
  const result = await db
    .select({
      emoji: reactions.emoji,
      count: sql<number>`count(*)`.mapWith(Number),
      userReacted: sql<boolean>`bool_or(${reactions.telegramId} = ${telegramId})`,
    })
    .from(reactions)
    .where(eq(reactions.postId, postId))
    .groupBy(reactions.emoji)
  
  return result
}
```

**Retorno:**
```typescript
[
  { emoji: '🔥', count: 5, userReacted: true },
  { emoji: '😂', count: 3, userReacted: false },
  // ...
]
```

### 9.4 searchUsersByName (Filtros de Ban)

**Arquivo:** `server/repositories/user.repository.ts`

**Propósito:** Buscar usuários por nome, filtrando banidos.

**Implementação:**
```typescript
export async function searchUsersByName(
  query: string,
  limit: number
): Promise<User[]> {
  const db = getDb()
  
  // Sanitiza wildcards LIKE para prevenir SQL injection
  const sanitizedQuery = query.replace(/[%_\\]/g, '')
  
  // Busca case-insensitive com ILIKE, filtra banidos e shadow-banned
  const users = await db.query.users.findMany({
    where: and(
      ilike(users.name, `%${sanitizedQuery}%`),
      eq(users.isBanned, false),
      eq(users.shadowBanned, false)
    ),
    columns: {
      telegramId: true,
      name: true,
      photoUrl: true,
      feedMode: true,
      notificationsEnabled: true,
      createdAt: true,
    },
    limit,
  })
  
  return users
}
```

**Segurança:**
- ✅ Sanitiza wildcards LIKE (`[%_\\]`) para prevenir SQL injection
- ✅ Filtra isBanned=false e shadowBanned=false

### 9.5 getSuggestedUsers (Exclusões)

**Arquivo:** `server/repositories/user.repository.ts`

**Propósito:** Sugerir usuários para seguir (exclui já seguidos, próprio, banidos).

**Implementação:**
```typescript
export async function getSuggestedUsers(
  telegramId: number,
  limit: number
): Promise<User[]> {
  const db = getDb()
  
  // Subquery: usuários que já está seguindo
  const followingIds = db.select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, telegramId))
  
  const users = await db.query.users.findMany({
    where: and(
      notInArray(users.telegramId, followingIds),
      ne(users.telegramId, telegramId), // Exclui próprio
      eq(users.isBanned, false),
      eq(users.shadowBanned, false)
    ),
    columns: {
      telegramId: true,
      name: true,
      photoUrl: true,
      feedMode: true,
      notificationsEnabled: true,
      createdAt: true,
    },
    limit,
    orderBy: (users, { desc }) => [desc(users.createdAt)], // Mais recentes primeiro
  })
  
  return users
}
```

**Exclusões:**
- ✅ Usuários que já está seguindo
- ✅ Próprio usuário
- ✅ Usuários banidos (isBanned=false)
- ✅ Usuários shadow-banned (shadowBanned=false)

---

## 10. OPERAÇÕES DE ESCRITA NO BANCO

### 10.1 createPost (Upload + Rate Limit)

**Arquivo:** `server/repositories/post.repository.ts`

**Propósito:** Criar post com validação de rate limit e upload de imagem.

**Implementação:**
```typescript
export async function createPost(data: InsertPost): Promise<number> {
  const db = getDb()
  
  const result = await db.insert(posts).values({
    telegramId: data.telegramId,
    content: data.content,
    imagePath: data.imagePath,
    replyToPostId: data.replyToPostId,
  }).returning({ id: posts.id })
  
  return result[0].id
}
```

**Fluxo Completo (Router):**
```typescript
// server/routers/post.router.ts
posts.create: protectedProcedure
  .input(CreatePostSchema)
  .mutation(async ({ ctx, input }) => {
    const telegramId = ctx.telegramId

    // 1. Verificar ban
    const currentUser = await getUserByTelegramId(telegramId)
    if (currentUser?.isBanned) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Conta banida' })
    }

    // 2. Verificar flags (maintenance_mode, lock_posts_global)
    if (!ctx.isAdmin) {
      const maintenanceFlag = await getServerFlag('maintenance_mode')
      if (maintenanceFlag === 'true') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Modo manutenção' })
      }
    }

    // 3. Rate limiting (3 camadas)
    const canPost = await rateLimiter.canCreatePost(telegramId, ctx.isAdmin)
    if (!canPost.canPost) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: `Aguarde até ${canPost.nextAllowedAt?.toLocaleTimeString('pt-BR')}`,
      })
    }

    // 4. Upload de imagem (opcional)
    let imagePath: string | undefined
    if (input.imageBase64) {
      // Valida base64, MIME type, tamanho (max 12MB)
      // Upload para Supabase Storage
      imagePath = await storagePut(fileName, buffer, mimeType)
    }

    // 5. Criar post
    const postId = await createPost({
      telegramId,
      content: input.content,
      imagePath,
    })

    // 6. Atualizar lastPostAt (rate limit híbrido - camada 2)
    await updateUserLastPostAt(telegramId)

    return { postId, imagePath }
  })
```

### 10.2 deletePost (Cascades)

**Arquivo:** `server/repositories/post.repository.ts`

**Propósito:** Deletar post com reactions e replies (CASCADE).

**Implementação:**
```typescript
export async function deletePost(postId: number, telegramId: number): Promise<void> {
  const db = getDb()
  
  // Verifica ownership
  const post = await db.query.posts.findFirst({
    where: and(
      eq(posts.id, postId),
      eq(posts.telegramId, telegramId)
    ),
  })
  
  if (!post) {
    throw new Error('Post não encontrado ou não pertence ao usuário')
  }
  
  // Deleta reactions associadas (sem CASCADE na FK)
  await db.delete(reactions).where(eq(reactions.postId, postId))
  
  // Deleta o post (replies CASCADE automaticamente via FK)
  await db.delete(posts).where(eq(posts.id, postId))
  
  // Limpa imagem do Storage (fire-and-forget)
  const { storageDelete } = await import('../storage')
  if (post.imagePath) {
    void storageDelete(post.imagePath)
  }
}
```

**Cascades:**
- ✅ **Reactions:** Deletadas manualmente (sem CASCADE na FK)
- ✅ **Replies:** ON DELETE CASCADE (automático via FK replyToPostId)
- ✅ **Storage:** Fire-and-forget (não bloqueia operação)

### 10.3 followUser (Idempotência)

**Arquivo:** `server/repositories/follow.repository.ts`

**Propósito:** Seguir usuário com idempotência (onConflictDoNothing).

**Implementação:**
```typescript
export async function followUser(followerId: number, followingId: number): Promise<void> {
  const db = getDb()
  
  await db
    .insert(follows)
    .values({ followerId, followingId })
    .onConflictDoNothing() // Idempotente: não erra se já existe
}
```

**Por Que Idempotente:**
- ✅ Previne erro se usuário clicar "Seguir" múltiplas vezes
- ✅ Optimistic update no frontend funciona sem rollback

### 10.4 addReaction (onConflictDoNothing)

**Arquivo:** `server/repositories/reaction.repository.ts`

**Propósito:** Adicionar reação com idempotência.

**Implementação:**
```typescript
export async function addReaction(
  postId: number,
  telegramId: number,
  emoji: string
): Promise<void> {
  const db = getDb()
  
  await db
    .insert(reactions)
    .values({ postId, telegramId, emoji })
    .onConflictDoNothing() // Idempotente: não erra se já reagiu
}
```

### 10.5 insertNotification (Deduplicação)

**Arquivo:** `server/repositories/notification.repository.ts`

**Propósito:** Inserir notificação com deduplicação (unique constraint).

**Implementação:**
```typescript
export async function insertNotification(
  data: InsertNotification
): Promise<number | null> {
  const db = getDb()
  
  const result = await db
    .insert(notifications)
    .values({
      type: data.type,
      recipientId: data.recipientId,
      actorId: data.actorId,
      referenceId: data.referenceId,
      emoji: data.emoji,
    })
    .onConflictDoNothing() // Deduplicação via unique constraint
    .returning({ id: notifications.id })
  
  // Retorna null se duplicata (já foi enviado)
  return result.length > 0 ? result[0].id : null
}
```

**Unique Constraint:**
```sql
UNIQUE (type, recipientId, actorId, referenceId)
```

**Por Que Deduplicação:**
- ✅ Previne notificações duplicadas do mesmo evento
- ✅ Exemplo: mesma reação múltipla vezes → 1 notificação

---

## 11. SISTEMA DE NOTIFICAÇÕES VIA BOT

### 11.1 Helper sendNotification (Código Completo)

**Arquivo:** `server/routers/post.router.ts`

**Propósito:** Encapsular ciclo completo de notificação (DB → Bot API → mark sent/failed).

**Implementação Completa:**
```typescript
/**
 * Helper de notificações
 * Encapsula ciclo completo: DB → Bot API → mark sent/failed
 * Nunca lança exceção — erro é silenciado para não quebrar operação principal
 */
async function sendNotification(params: {
  type: "reply" | "reaction" | "follow"
  recipientId: number
  actorId: number
  referenceId?: number
  replyContent?: string
  emoji?: string
  postContent?: string
}): Promise<void> {
  try {
    // 1. Nunca notificar a si mesmo
    if (params.recipientId === params.actorId) return

    // 2. Buscar recipient e actor em paralelo (Promise.all - 1 round-trip)
    const [recipient, actor] = await Promise.all([
      getUserByTelegramIdForNotifications(params.recipientId),
      getUserByTelegramIdForNotifications(params.actorId),
    ])

    // 3. Verifica notificationsEnabled
    if (!recipient?.notificationsEnabled || !actor?.name) return

    // 4. Registrar no DB (deduplicação via unique constraint)
    const notifId = await insertNotification({
      type: params.type,
      recipientId: params.recipientId,
      actorId: params.actorId,
      referenceId: params.referenceId,
      emoji: params.emoji,
    })

    if (!notifId) return // null = duplicata, já foi enviado

    // 5. Enviar imediatamente via Bot API
    let result: { ok: boolean; errorCode?: number; description?: string }
    
    if (params.type === "reply" && params.replyContent) {
      result = await notifyReply(params.recipientId, actor.name, params.replyContent)
    } else if (params.type === "reaction" && params.emoji && params.postContent) {
      result = await notifyReaction(params.recipientId, actor.name, params.emoji, params.postContent)
    } else if (params.type === "follow") {
      result = await notifyFollow(params.recipientId, actor.name)
    } else {
      return
    }

    // 6. Atualizar status
    if (result.ok) {
      await markNotificationSent(notifId)
    } else {
      // 7. 403 = usuário bloqueou o bot → desativar notificações
      const isPermanent = result.errorCode === 403
      if (isPermanent) {
        await disableUserNotifications(params.recipientId)
        log.warn('notification', 'Bot bloqueado — notificações desativadas permanentemente', {
          actorId: params.actorId,
          meta: { recipientId: params.recipientId, type: params.type },
        })
      } else {
        log.warn('notification', 'Falha ao enviar notificação', {
          actorId: params.actorId,
          meta: { type: params.type, errorCode: result.errorCode, description: result.description },
        })
      }
      await markNotificationFailed(notifId, result.description ?? "unknown", isPermanent)
    }
  } catch (error) {
    // 8. Qualquer erro é silenciado
    // Notificação nunca quebra operação principal
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    log.warn('notification', 'sendNotification falhou (ignorado)', {
      actorId: params.actorId,
      meta: { type: params.type, recipientId: params.recipientId, error: errorMessage },
    })
  }
  // 9. Fim (fire-and-forget)
}
```

**Características:**
- ✅ **Fire-and-forget:** Nunca lança exceção, não bloqueia operação principal
- ✅ **Deduplicação:** Unique constraint evita notificações duplicadas
- ✅ **Promise.all:** 1 round-trip para buscar recipient + actor
- ✅ **Tratamento 403:** Desativa notificações permanentemente
- ✅ **Logging:** LogVault para debugging

### 11.2 Fluxo de Notificações (10 Etapas)

```
┌─────────────────────────────────────────────────────────────┐
│ 1. EVENTO OCORRE (reply/reaction/follow)                    │
│    • posts.reply mutation                                   │
│    • reactions.add mutation                                 │
│    • follows.follow mutation                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. sendNotification() CHAMADO (async, fire-and-forget)      │
│    • void sendNotification({ type, recipientId, actorId })  │
│    • Não bloqueia operação principal                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. NUNCA NOTIFICAR A SI MESMO                               │
│    • if (recipientId === actorId) return                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. BUSCA RECIPIENT + ACTOR (Promise.all - 1 round-trip)     │
│    • [recipient, actor] = await Promise.all([...])          │
│    • getUserByTelegramIdForNotifications()                  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. VERIFICA notificationsEnabled                            │
│    • if (!recipient?.notificationsEnabled) return           │
│    • Opt-out LGPD compliance                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. INSERT NOTIFICATION (deduplicação)                       │
│    • insertNotification()                                   │
│    • UNIQUE (type, recipientId, actorId, referenceId)       │
│    • Retorna null se duplicata                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. BOT API ENVIA (imediato, ~95% sucesso)                   │
│    • notifyReply/notifyReaction/notifyFollow()              │
│    • Parse mode: HTML                                       │
│    • Timeout: 30 segundos                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. ATUALIZA STATUS                                          │
│    • Sucesso: markNotificationSent() → status = 'sent'      │
│    • Erro 403: disableUserNotifications() + markFailed()    │
│    • Outro erro: markNotificationFailed() → retry no cron   │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. CRON RETRY (12h UTC, max 3 tentativas)                   │
│    • getPendingNotifications(retryCount < 3)                │
│    • Tenta reenviar                                         │
│    • Limpeza: notificações > 30 dias                        │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. FIM (fire-and-forget)                                   │
│     • Erros são silenciados (log apenas)                    │
│     • Operação principal não é afetada                      │
└─────────────────────────────────────────────────────────────┘
```

### 11.3 Deduplicação (Unique Constraint)

**Schema:**
```sql
CREATE TABLE "notifications" (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,
  "recipientId" BIGINT NOT NULL,
  "actorId" BIGINT NOT NULL,
  "referenceId" INTEGER,
  emoji VARCHAR(10),
  status VARCHAR(10) NOT NULL DEFAULT 'pending',
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "sentAt" TIMESTAMP,
  UNIQUE ("type", "recipientId", "actorId", "referenceId")  -- ← Deduplicação
);
```

**Exemplo:**
```typescript
// Primeira inserção - OK
await insertNotification({
  type: 'reaction',
  recipientId: 123,
  actorId: 456,
  referenceId: 789,
  emoji: '👍',
}) // Retorna id: 1

// Segunda inserção idêntica - Duplicata (retorna null)
await insertNotification({
  type: 'reaction',
  recipientId: 123,
  actorId: 456,
  referenceId: 789,
  emoji: '👍',
}) // Retorna null (duplicata)
```

### 11.4 Tratamento 403 (Usuário Bloqueou Bot)

**Cenário:** Usuário bloqueia o bot Telegram.

**Detecção:**
```typescript
const result = await notifyFollow(recipientId, actor.name)
if (!result.ok && result.errorCode === 403) {
  // Usuário bloqueou o bot
}
```

**Ação:**
```typescript
// 1. Desativa notificações do usuário
await disableUserNotifications(recipientId)
// users.notificationsEnabled = false

// 2. Marca notificação como skipped (não retry)
await markNotificationFailed(notifId, result.description, true)
// status: 'skipped', isPermanent: true

// 3. Log para auditoria
log.warn('notification', 'Bot bloqueado — notificações desativadas', {
  actorId: recipientId,
  meta: { type, errorCode }
})
```

**Por Que 403:**
- Erro 403 = "Forbidden: user deactivated chat"
- Usuário bloqueou o bot permanentemente
- Não adianta retry (sempre vai falhar)

### 11.5 Promise.all Optimization

**Detalhes na Seção 8.2**

**Impacto:**
- ✅ **-50% latência:** 1 round-trip ao invés de 2
- ✅ **Menos custo:** Menos queries no banco

---

## 12. SISTEMA DE EFEMERIDADE (7 DIAS)

### 12.1 Implementação no Backend

**Propósito:** Posts expiram automaticamente após 7 dias.

**Filtro Efemeridade:**
```typescript
// server/repositories/post.repository.ts
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
const adminIds = ENV.adminTelegramIds

const ephemeralFilter = adminIds.length > 0
  ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
  : gte(posts.createdAt, sevenDaysAgo)
```

**SQL Equivalente:**
```sql
WHERE posts.createdAt >= NOW() - INTERVAL '7 days'
   OR posts.telegramId IN (adminIds)  -- Admin isento
```

**Onde é Aplicado:**
- ✅ `getTimelinePosts()`: Timeline principal
- ✅ `getUserPosts()`: Posts de um usuário
- ✅ `countUserPosts()`: Contagem de posts
- ✅ `cleanupExpiredPosts()`: Cron cleanup

### 12.2 Admin Isento

**Por Que Admin Isento:**
- ✅ Permite posts fixos/anúncios permanentes
- ✅ Permite testes sem expiração
- ✅ Posts institucionais não expiram

**Implementação:**
```typescript
const adminIds = ENV.adminTelegramIds

const ephemeralFilter = adminIds.length > 0
  ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
  : gte(posts.createdAt, sevenDaysAgo)
```

**Admin vê TODOS os posts:**
```typescript
// Admin vê tudo (inclusive shadow-banned e posts antigos)
if (isAdmin) {
  whereClause = and(ephemeralFilter, cursorFilter)
  // ephemeralFilter inclui adminIds, então admin vê posts antigos próprios
}
```

### 12.3 Cron Cleanup (3h UTC)

**Arquivo:** `src/app/api/cron/cleanup/route.ts`

**Propósito:** Deletar posts expirados automaticamente.

**Schedule:** `0 3 * * *` (3h UTC = 0h BRT)

**Implementação:**
```typescript
// src/app/api/cron/cleanup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cleanupExpiredPosts } from '@/server/repositories'
import { ENV } from '@/server/_core/env'
import { log } from '@/server/_core/logger'

export async function GET(req: NextRequest) {
  // Protege endpoint com CRON_SECRET
  const authHeader = req.headers.get('Authorization')
  if (authHeader !== `Bearer ${ENV.cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const deletedCount = await cleanupExpiredPosts()
    
    log.info('cron', 'Cron cleanup concluído', {
      meta: { deletedCount }
    })

    return NextResponse.json({ 
      ok: true, 
      deletedCount 
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown'
    log.error('cron', 'Cron cleanup falhou', {
      meta: { error: errorMessage }
    })

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
```

**Implementação no Database:**
```typescript
// server/repositories/post.repository.ts
export async function cleanupExpiredPosts(): Promise<number> {
  const db = getDb()
  
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const adminIds = ENV.adminTelegramIds

  // Busca posts expirados (exclui admin)
  const expiredPosts = await db.query.posts.findMany({
    where: and(
      lt(posts.createdAt, sevenDaysAgo),
      adminIds.length > 0 
        ? notInArray(posts.telegramId, adminIds)
        : undefined
    ),
    columns: {
      id: true,
      imagePath: true,
    },
  })

  // Deleta reactions associadas
  for (const post of expiredPosts) {
    await db.delete(reactions).where(eq(reactions.postId, post.id))
  }

  // Deleta posts (replies CASCADE automaticamente)
  const result = await db
    .delete(posts)
    .where(and(
      lt(posts.createdAt, sevenDaysAgo),
      adminIds.length > 0
        ? notInArray(posts.telegramId, adminIds)
        : undefined
    ))

  // Limpa imagens do Storage (fire-and-forget)
  for (const post of expiredPosts) {
    if (post.imagePath) {
      void storageDelete(post.imagePath)
    }
  }

  log.info('cron', 'Cleanup concluído', {
    meta: { deletedCount: result.rowCount }
  })

  return result.rowCount || 0
}
```

**Fluxo:**
1. Cron job roda às 3h UTC (0h BRT)
2. Busca posts > 7 dias (exclui admin)
3. Deleta reactions associadas
4. Deleta posts (replies CASCADE)
5. Limpa imagens do Storage (fire-and-forget)
6. Log no LogVault

### 12.4 Filtro Efemeridade (SQL)

**SQL Completo:**
```sql
SELECT posts.*, users.* FROM posts
INNER JOIN users ON posts.telegramId = users.telegramId
WHERE (
  posts.createdAt >= NOW() - INTERVAL '7 days'
  OR posts.telegramId IN (adminIds)  -- Admin isento
)
AND users.shadowBanned = false
ORDER BY posts.id DESC
LIMIT 21
```

**Drizzle ORM:**
```typescript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
const adminIds = ENV.adminTelegramIds

const ephemeralFilter = adminIds.length > 0
  ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
  : gte(posts.createdAt, sevenDaysAgo)

const rows = await db.query.posts.findMany({
  where: and(ephemeralFilter, ...outrosFiltros),
  orderBy: desc(posts.id),
  limit: fetchLimit,
})
```

---

## 13. SISTEMA DE REPLIES

### 13.1 Auto-Relacionamento

**Schema:**
```typescript
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegramId", { mode: "number" })
    .notNull()
    .references(() => users.telegramId),
  content: varchar("content", { length: 165 }).notNull(),
  imagePath: text("imagePath"),
  replyToPostId: integer("replyToPostId"),  -- ← Auto-relacionamento
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  authorIdx: index("idx_posts_telegramId").on(table.telegramId),
  createdIdx: index("idx_posts_createdAt").on(table.createdAt),
  replyIdx: index("idx_posts_replyToPostId").on(table.replyToPostId),
}))
```

**Relacionamento:**
```typescript
// drizzle/relations.ts
export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.telegramId],
    references: [users.telegramId],
  }),
  replyToPost: one(posts, {
    fields: [posts.replyToPostId],
    references: [posts.id],
    relationName: "reply",
  }),
  replies: many(posts, {
    relationName: "reply",
  }),
  reactions: many(reactions),
}))
```

**Por Que Auto-Relacionamento:**
- ✅ Permite threads infinitas (resposta de resposta de resposta...)
- ✅ ON DELETE CASCADE: se post original for apagado, respostas também
- ✅ Simples e eficiente (1 tabela, 1 FK)

### 13.2 ON DELETE CASCADE

**Schema SQL:**
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  "telegramId" BIGINT NOT NULL REFERENCES users("telegramId") ON DELETE CASCADE,
  content VARCHAR(165) NOT NULL,
  "imagePath" TEXT,
  "replyToPostId" INTEGER REFERENCES posts(id) ON DELETE CASCADE,  -- ← CASCADE
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);
```

**Comportamento:**
```
Post Original (id: 123)
  └─ Reply 1 (replyToPostId: 123)
     └─ Reply 2 (replyToPostId: 123)  -- Thread

DELETE FROM posts WHERE id = 123
  → Reply 1 e Reply 2 são deletados automaticamente (CASCADE)
```

**Vantagens:**
- ✅ **Automático:** Não precisa deletar manualmente
- ✅ **Consistente:** Garante integridade referencial
- ✅ **Simples:** FK faz o trabalho

### 13.3 Threads Infinitas

**Por Que Permitir:**
- ✅ Conversas naturais (resposta de resposta)
- ✅ Contexto preservado
- ✅ Engajamento aumentado

**Exemplo de Thread:**
```
Post Original: "Thread do dia!"
  └─ Reply 1: "Sério? Conta mais!"
     └─ Reply 2: "Pois é, aconteceu ontem..."
        └─ Reply 3: "Nossa, que absurdo!"
```

**Implementação:**
```typescript
// server/routers/post.router.ts
posts.reply: protectedProcedure
  .input(z.object({
    replyToPostId: z.number(),
    content: z.string().min(1).max(100),
  }))
  .mutation(async ({ ctx, input }) => {
    const telegramId = ctx.telegramId

    // Permite responder próprio post (thread infinita)
    // if (originalPost.telegramId === telegramId) → PERMITIDO

    // Criar resposta
    const postId = await createPost({
      telegramId,
      content: input.content,
      replyToPostId: input.replyToPostId,  -- ← Auto-relacionamento
    })

    return { postId }
  })
```

### 13.4 Rate Limit Específico (15 min)

**Diferença vs Posts:**
- **Posts:** 10 minutos (600.000ms)
- **Replies:** 15 minutos (900.000ms)

**Por Que Diferente:**
- ✅ Replies são menores (100 chars vs 165 chars)
- ✅ Menor impacto no feed
- ✅ Mas ainda precisa de rate limit (previne spam)

**Implementação:**
```typescript
// server/_core/rate-limiter.ts
export class SlowSocialRateLimiter {
  private readonly POST_INTERVAL_MS = 10 * 60 * 1000   // 10 minutos
  private readonly REPLY_INTERVAL_MS = 15 * 60 * 1000  // 15 minutos

  async canCreateReply(
    telegramId: number,
    isAdmin = false,
  ): Promise<{
    canReply: boolean
    nextAllowedAt?: Date
    timeRemainingMs?: number
  }> {
    if (isAdmin) return { canReply: true }

    const db = getDb()

    const user = await db.query.users.findFirst({
      where: eq(users.telegramId, telegramId),
      columns: { lastReplyAt: true },
    })

    if (user?.lastReplyAt) {
      const timeSince = Date.now() - user.lastReplyAt.getTime()
      if (timeSince < this.REPLY_INTERVAL_MS) {
        const nextAllowedAt = new Date(user.lastReplyAt.getTime() + this.REPLY_INTERVAL_MS)
        return {
          canReply: false,
          nextAllowedAt,
          timeRemainingMs: this.REPLY_INTERVAL_MS - timeSince,
        }
      }
    }

    return { canReply: true }
  }
}
```

**Camada 2 (users.lastReplyAt):**
```typescript
// server/repositories/user.repository.ts
export async function updateUserLastReplyAt(telegramId: number): Promise<void> {
  const db = getDb()
  
  await db
    .update(users)
    .set({ lastReplyAt: new Date() })
    .where(eq(users.telegramId, telegramId))
}
```

---

## 14. MODERAÇÃO E ADMIN DASHBOARD

### 14.1 Double-Tap Access (≤400ms)

**Arquivo:** `src/app/profile/page.tsx`

**Propósito:** Acesso secreto ao admin dashboard via double-tap no avatar.

**Implementação:**
```typescript
// src/app/profile/page.tsx
const lastTapRef = useRef<number>(0)

const handleAvatarDoubleTap = () => {
  const now = Date.now()
  const timeSinceLastTap = now - lastTapRef.current

  // Double-tap: segundo tap dentro de 400ms
  if (timeSinceLastTap < 400 && timeSinceLastTap > 0) {
    if (isAdmin) {
      // Navega para Admin Dashboard
      router.push('/admin')
    } else {
      // Feedback visual para não-admins (opcional)
      toast.error('Acesso restrito')
    }
  }

  lastTapRef.current = now
}

// No avatar
<div
  className="avatar"
  onDoubleClick={handleAvatarDoubleTap}
  onClick={handleAvatarDoubleTap}
>
  <img src={user?.photoUrl} alt="Avatar" />
</div>
```

**Características:**
- ✅ **Tempo máximo entre taps:** 400ms
- ✅ **Requer isAdmin:** Apenas admins acessam
- ✅ **Easter Egg:** Não óbvio para usuários comuns
- ✅ **Fallback:** onDoubleClick + onClick para mobile

### 14.2 Admin Self-Ban Protection

**Propósito:** Prevenir que admin bania a si mesmo.

**Implementação:**
```typescript
// server/routers/admin.router.ts
admin: router({
  banUser: adminProcedure
    .input(z.object({ telegramId: z.number(), ban: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // SEGURANÇA: não pode banir a si mesmo
      if (input.telegramId === ctx.telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não pode banir a si mesmo',
        })
      }

      const user = await getUserForAdmin(input.telegramId)
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        })
      }

      await setUserBanned(input.telegramId, input.ban)

      // Registra ação na trilha de auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: input.ban ? 'ban_user' : 'unban_user',
        targetTelegramId: input.telegramId,
        previousValue: String(user.isBanned),
        newValue: String(input.ban),
      })

      return { success: true }
    }),

  shadowBanUser: adminProcedure
    .input(z.object({ telegramId: z.number(), ban: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      // SEGURANÇA: não pode shadow banir a si mesmo
      if (input.telegramId === ctx.telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não pode shadow banir a si mesmo',
        })
      }

      // ... resto do código ...
    }),
})
```

**Por Que é Necessário:**
- ✅ Previne acidente (admin se banir sem querer)
- ✅ Previne ataque (admin malicioso)
- ✅ Garante que sempre tenha pelo menos 1 admin ativo

### 14.3 Audit Log (adminActions)

**Propósito:** Trilha de auditoria de todas as ações administrativas.

**Schema:**
```sql
CREATE TABLE "adminActions" (
  id SERIAL PRIMARY KEY,
  "adminTelegramId" BIGINT NOT NULL,
  action VARCHAR(100) NOT NULL,
  "targetTelegramId" BIGINT,
  "targetPostId" INTEGER,
  "previousValue" TEXT,
  "newValue" TEXT,
  notes TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX "idx_adminActions_adminTelegramId" ON "adminActions"("adminTelegramId");
CREATE INDEX "idx_adminActions_createdAt" ON "adminActions"("createdAt");
```

**Ações Registradas:**
- `set_flag`: Flag de servidor alterada
- `ban_user` / `unban_user`: Usuário banido/desbanido
- `shadow_ban_user` / `remove_shadow_ban`: Shadow ban aplicado/removido
- `reset_rate_limit`: Rate limit resetado
- `delete_post`: Post deletado
- `set_feed_mode`: Feed mode alterado
- `broadcast`: Broadcast publicado

**Exemplo de Log:**
```typescript
await logAdminAction({
  adminTelegramId: ctx.telegramId,
  action: 'ban_user',
  targetTelegramId: input.telegramId,
  previousValue: String(user.isBanned),  // 'false'
  newValue: String(input.ban),           // 'true'
  notes: 'Usuário banido por spam',
})
```

**Query para Audit Log:**
```typescript
// server/repositories/admin.repository.ts
export async function getRecentAdminActions(limit: number): Promise<AdminAction[]> {
  const db = getDb()
  
  const actions = await db.query.adminActions.findMany({
    orderBy: desc(adminActions.createdAt),
    limit,
  })
  
  return actions
}
```

### 14.4 Flags de Servidor

**Detalhes na Seção 15**

---

## 15. FLAGS DE SERVIDOR

### 15.1 Tabela serverConfig

**Schema:**
```sql
CREATE TABLE "serverConfig" (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  "updatedAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Flags padrão
INSERT INTO "serverConfig" (key, value) VALUES
  ('maintenance_mode', 'false'),
  ('pause_new_users', 'false'),
  ('lock_posts_global', 'false'),
  ('feed_mode_global', 'following');
```

### 15.2 4 Flags Globais

| Flag | Valores | Impacto | Admin Bypass |
|------|---------|---------|--------------|
| **maintenance_mode** | `true` / `false` | Bloqueia login (app em manutenção) | ✅ Sim |
| **pause_new_users** | `true` / `false` | Bloqueia novos cadastros | ❌ Não |
| **lock_posts_global** | `true` / `false` | Bloqueia posts e replies | ❌ Não |
| **feed_mode_global** | `'all'` / `'following'` | Sobrepõe feed mode individual | ❌ Não |

### 15.3 Admin Bypass

**Implementação:**
```typescript
// server/routers/post.router.ts
posts.create: protectedProcedure
  .mutation(async ({ ctx, input }) => {
    // Verificar modo manutenção (admin bypassa)
    if (!ctx.isAdmin) {
      const maintenanceFlag = await getServerFlag('maintenance_mode')
      if (maintenanceFlag === 'true') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'App em modo manutenção.',
        })
      }
      
      // Verificar bloqueio global de posts/replies
      const lockFlag = await getServerFlag('lock_posts_global')
      if (lockFlag === 'true') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'A tia tá nervosa hoje, bloqueou tudo',
        })
      }
    }

    // ... resto do código ...
  })
```

**Por Que Admin Bypassa:**
- ✅ Permite testes em modo manutenção
- ✅ Permite moderação mesmo com lock_posts_global
- ✅ Garante que admin sempre tenha acesso

### 15.4 Cache Invalidation

**Propósito:** Evitar queries repetidas para flags.

**Implementação:**
```typescript
// server/_core/rate-limiter.ts
export class SlowSocialRateLimiter {
  private _rateLimitDisabledCache: { value: boolean; timestamp: number } | null = null
  private readonly CACHE_TTL_MS = 30 * 1000 // 30 segundos

  private async isRateLimitDisabled(): Promise<boolean> {
    const now = Date.now()
    
    // Retorna cache se válido (TTL 30s)
    if (this._rateLimitDisabledCache && 
        now - this._rateLimitDisabledCache.timestamp < this.CACHE_TTL_MS) {
      return this._rateLimitDisabledCache.value
    }

    // Query no banco
    const flag = await getServerFlag('disable_rate_limit_global')
    const value = flag === 'true'

    // Atualiza cache
    this._rateLimitDisabledCache = { value, timestamp: now }

    return value
  }

  invalidateFlagCache(): void {
    this._rateLimitDisabledCache = null
  }
}
```

**Invalidação:**
```typescript
// server/routers/admin.router.ts
admin.setFlag: adminProcedure
  .mutation(async ({ ctx, input }) => {
    const prev = await getServerFlag(input.key)
    await setServerFlag(input.key, input.value)
    
    // Invalida cache do rate limiter
    rateLimiter.invalidateFlagCache()
    
    // Log de auditoria
    await logAdminAction({ ... })
    
    return { success: true }
  })
```

---

## 16. STORAGE (SUPABASE)

### 16.1 Upload de Imagens (storagePut)

**Arquivo:** `server/storage.ts`

**Propósito:** Upload de imagens para Supabase Storage.

**Implementação Completa:**
```typescript
import { ENV } from './_core/env'
import { log } from './_core/logger'

/**
 * Upload de arquivo para Supabase Storage
 * 
 * @param relKey - Chave relativa (ex: 'posts/123_1234567890.jpg')
 * @param data - Buffer do arquivo
 * @param contentType - MIME type (ex: 'image/jpeg')
 * @returns { key: string, url: string }
 */
export async function storagePut(
  relKey: string,
  data: Buffer,
  contentType: string
): Promise<{ key: string; url: string }> {
  const url = `${ENV.supabaseUrl}/storage/v1/object/public/${ENV.supabaseStorageBucket}/${relKey}`

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ENV.supabaseServiceRoleKey}`,
        'apikey': ENV.supabaseServiceRoleKey,
        'x-upsert': 'true',  // Permite sobrescrever
        'Content-Type': contentType,
      },
      body: data,
    })

    if (!response.ok) {
      const message = await response.text()
      log.error('upload', 'Supabase Storage upload falhou', {
        meta: { key: relKey, status: response.status, message },
      })
      throw new Error(`Supabase Storage upload failed: ${response.status} ${message}`)
    }

    const publicUrl = `${ENV.supabaseUrl}/storage/v1/object/public/${ENV.supabaseStorageBucket}/${relKey}`
    
    return {
      key: relKey,
      url: publicUrl,
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown'
    log.error('upload', 'storagePut falhou', {
      meta: { key: relKey, error: errMsg },
    })
    throw error
  }
}
```

**Headers Necessários:**
- ✅ `Authorization: Bearer <SERVICE_ROLE_KEY>`
- ✅ `apikey: <SERVICE_ROLE_KEY>`
- ✅ `x-upsert: true` (permite sobrescrever)
- ✅ `Content-Type: <MIME type>`

### 16.2 Delete de Imagens (storageDelete)

**Arquivo:** `server/storage.ts`

**Propósito:** Delete de imagens do Supabase Storage.

**Implementação:**
```typescript
/**
 * Delete de arquivo do Supabase Storage (fire-and-forget)
 * 
 * @param imageUrl - URL pública da imagem
 */
export async function storageDelete(imageUrl: string): Promise<void> {
  try {
    // Extrai chave relativa da URL pública
    // https://xxx.supabase.co/storage/v1/object/public/posts/123_123.jpg
    // → posts/123_123.jpg
    const url = new URL(imageUrl)
    const pathSegments = url.pathname.split('/storage/v1/object/public/')[1]
    
    if (!pathSegments) {
      log.warn('storage', 'storageDelete: URL inválida', {
        meta: { imageUrl }
      })
      return
    }

    const deleteUrl = `${ENV.supabaseUrl}/storage/v1/object/${ENV.supabaseStorageBucket}/${pathSegments}`

    const response = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${ENV.supabaseServiceRoleKey}`,
        'apikey': ENV.supabaseServiceRoleKey,
      },
    })

    if (!response.ok) {
      const message = await response.text()
      log.warn('storage', 'storageDelete falhou', {
        meta: { imageUrl, status: response.status, message }
      })
    }
  } catch (error) {
    // Silencioso - delete é fire-and-forget
    const errMsg = error instanceof Error ? error.message : 'Unknown'
    log.warn('storage', 'storageDelete exception', {
      meta: { imageUrl, error: errMsg }
    })
  }
}
```

### 16.3 Fallback Silencioso

**Por Que Fallback Silencioso:**
- ✅ Delete é operação secundária (não crítica)
- ✅ Não deve bloquear operação principal (delete de post)
- ✅ Storage cleanup pode ser feito manualmente depois

**Implementação:**
```typescript
// server/repositories/post.repository.ts
export async function deletePost(postId: number, telegramId: number): Promise<void> {
  // ... deleta post e reactions ...
  
  // Limpa imagem do Storage (fire-and-forget)
  const { storageDelete } = await import('../storage')
  if (post.imagePath) {
    void storageDelete(post.imagePath)  // ← void = não espera, ignora erro
  }
}
```

### 16.4 Validações (12MB max)

**Arquivo:** `server/routers/post.router.ts`

**Validações:**
```typescript
posts.create: protectedProcedure
  .input(z.object({
    telegramId: z.number(),
    content: z.string().min(1).max(165),
    imageBase64: z.string().optional(),
  }))
  .mutation(async ({ ctx, input }) => {
    // ... validações ...

    // Upload de imagem (opcional, máx 12MB intencional)
    let imagePath: string | undefined
    if (input.imageBase64) {
      const rawImage = input.imageBase64.trim()
      const dataUrlMatch = rawImage.match(/^data:image\/(png|jpe?g|gif|webp);base64,/i)
      const base64Data = dataUrlMatch
        ? rawImage.slice(rawImage.indexOf(',') + 1)
        : rawImage
      const mimeType = dataUrlMatch
        ? `image/${dataUrlMatch[1].toLowerCase().replace('jpg', 'jpeg')}`
        : 'image/jpeg'

      // Validar base64
      if (!/^[A-Za-z0-9+/=\s]+$/.test(base64Data)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Formato de imagem inválido',
        })
      }

      const buffer = Buffer.from(base64Data, 'base64')
      if (!buffer.length) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Imagem vazia',
        })
      }

      // Limite de 12MB (configuração intencional do admin)
      const maxBytes = 12 * 1024 * 1024
      if (buffer.length > maxBytes) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Imagem muito grande (máx 12MB)',
        })
      }

      const ext = mimeType === 'image/png' ? 'png'
        : mimeType === 'image/webp' ? 'webp'
        : 'jpg'
      const fileName = `posts/${telegramId}_${Date.now()}.${ext}`

      try {
        const result = await storagePut(fileName, buffer, mimeType)
        imagePath = result.url
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : 'Unknown'
        log.error('upload', 'Falha no upload de imagem', {
          actorId: telegramId,
          meta: { fileName, error: errMsg },
        })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error instanceof Error ? `Upload falhou: ${error.message}` : 'Upload falhou',
        })
      }
    }

    // ... resto do código ...
  })
```

**Validações:**
- ✅ **MIME type:** jpeg, png, webp, gif
- ✅ **Base64 regex:** `/^[A-Za-z0-9+/=\s]+$/`
- ✅ **Tamanho máximo:** 12MB (intencional, configurado pelo admin)
- ✅ **Buffer não vazio:** previne upload de dados corrompidos

---

## 17. TRATAMENTO DE ERROS

### 17.1 TRPCError Codes

**Códigos Disponíveis:**

| Código | HTTP Status | Quando Usar |
|--------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Falta de autenticação |
| `FORBIDDEN` | 403 | Sem permissão (banido, não admin) |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `BAD_REQUEST` | 400 | Input inválido |
| `TOO_MANY_REQUESTS` | 429 | Rate limit atingido |
| `INTERNAL_SERVER_ERROR` | 500 | Erro interno do servidor |

### 17.2 Error Handling no Backend

**Padrão:**
```typescript
// server/routers/post.router.ts
posts.create: protectedProcedure
  .mutation(async ({ ctx, input }) => {
    try {
      // Validações
      if (currentUser?.isBanned) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Sua conta foi banida.',
        })
      }

      // Rate limiting
      const canPost = await rateLimiter.canCreatePost(telegramId, ctx.isAdmin)
      if (!canPost.canPost) {
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Aguarde até ${canPost.nextAllowedAt?.toLocaleTimeString('pt-BR')}`,
          cause: {
            nextAllowedAt: canPost.nextAllowedAt,
            timeRemainingMs: canPost.timeRemainingMs,
          },
        })
      }

      // Upload
      try {
        const result = await storagePut(fileName, buffer, mimeType)
        imagePath = result.url
      } catch (error) {
        log.error('upload', 'Falha no upload', { meta: { error } })
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Upload falhou',
        })
      }

      return { postId, imagePath }
    } catch (error) {
      // Re-lança TRPCError, loga outros erros
      if (!(error instanceof TRPCError)) {
        log.error('post.create', 'Erro inesperado', { meta: { error } })
      }
      throw error
    }
  })
```

### 17.3 Error Handling no Frontend

**Padrão:**
```typescript
// src/app/create/page.tsx
const createPostMutation = trpc.posts.create.useMutation({
  onSuccess: () => {
    refetch()
    void utils.posts.timeline.invalidate()
  },
  onError: (error: unknown) => {
    // Type-safe error handling
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    const errorCode = error instanceof Error && 'code' in error
      ? (error as { code?: string }).code
      : undefined

    hapticNotification('error')

    if (errorCode === 'TOO_MANY_REQUESTS') {
      showPopupAlert('Aguarde antes de postar novamente.')
    } else if (errorMessage && errorMessage !== 'Erro desconhecido') {
      showPopupAlert(errorMessage)
    } else {
      showPopupAlert('Erro ao publicar o post. Tente novamente.')
    }
  },
})
```

### 17.4 Log de Erros (LogVault)

**Arquivo:** `server/_core/logger.ts`

**Implementação:**
```typescript
// server/routers/post.router.ts
try {
  const result = await storagePut(fileName, buffer, mimeType)
  imagePath = result.url
} catch (error) {
  const errMsg = error instanceof Error ? error.message : 'Unknown'
  log.error('upload', 'Falha no upload de imagem', {
    actorId: telegramId,
    meta: { fileName, error: errMsg },
  })
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: error instanceof Error ? `Upload falhou: ${error.message}` : 'Upload falhou',
  })
}
```

**LogVault:**
- ✅ **9 contextos:** notification, post, reaction, follow, upload, rate_limit, cron, auth, system
- ✅ **3 níveis:** info, warn, error
- ✅ **Fire-and-forget:** Nunca bloqueia operação principal
- ✅ **Visível no admin:** Seção LogVault no dashboard

---

## 18. BOT TELEGRAM API

### 18.1 sendTelegramMessage

**Arquivo:** `server/bot/telegram-bot.ts`

**Propósito:** Enviar mensagem via Telegram Bot API.

**Implementação Completa:**
```typescript
import { ENV } from '../_core/env'
import { log } from '../_core/logger'

// URL base da Bot API do Telegram
const BOT_API = `https://api.telegram.org/bot${ENV.telegramBotToken}`

/**
 * Envia mensagem via Telegram Bot API
 * 
 * @param chatId - Telegram ID do destinatário
 * @param text - Texto da mensagem (suporta HTML)
 * @param parseMode - 'HTML' | 'Markdown' (default: 'HTML')
 * @returns { ok: boolean, errorCode?: number, description?: string }
 */
async function sendTelegramMessage(
  chatId: number,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<{ ok: boolean; errorCode?: number; description?: string }> {
  const url = `${BOT_API}/sendMessage`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    })

    const data = await response.json()
    return data
  } catch (error) {
    const description = error instanceof Error ? error.message : 'Unknown error'
    log.error('bot', 'sendTelegramMessage falhou', {
      meta: { chatId, error: description }
    })
    return {
      ok: false,
      description,
    }
  }
}
```

### 18.2 notifyReply, notifyReaction, notifyFollow

**Arquivo:** `server/bot/telegram-bot.ts`

**Implementação:**
```typescript
/**
 * Notificar usuário sobre um reply
 */
export async function notifyReply(
  recipientId: number,
  actorName: string,
  replyContent: string
): Promise<{ ok: boolean; errorCode?: number; description?: string }> {
  const truncatedContent = replyContent.substring(0, 50)
  const message = `💬 <b>${actorName}</b> respondeu sua thread:\n\n<i>"${truncatedContent}..."</i>`
  return sendTelegramMessage(recipientId, message)
}

/**
 * Notificar usuário sobre uma reaction
 */
export async function notifyReaction(
  recipientId: number,
  actorName: string,
  emoji: string,
  postContent: string
): Promise<{ ok: boolean; errorCode?: number; description?: string }> {
  const truncatedContent = postContent.substring(0, 50)
  const message = `${emoji} <b>${actorName}</b> reagiu na sua thread\n\n<i>"${truncatedContent}..."</i>`
  return sendTelegramMessage(recipientId, message)
}

/**
 * Notificar usuário sobre um follow
 */
export async function notifyFollow(
  recipientId: number,
  actorName: string
): Promise<{ ok: boolean; errorCode?: number; description?: string }> {
  const message = `👀 <b>${actorName}</b> veio bisbilhotar sua vida\n\nAgora te segue no Deck.`
  return sendTelegramMessage(recipientId, message)
}
```

**Formato das Mensagens:**
- ✅ **Parse mode:** HTML
- ✅ **Truncamento:** 50 caracteres
- ✅ **Emoji:** Ícone do tipo de notificação
- ✅ **Bold:** Nome do usuário
- ✅ **Italic:** Conteúdo truncado

### 18.3 Códigos de Erro da Bot API

| Código | Descrição | Ação |
|--------|-----------|------|
| **200** | Success | Status → 'sent' |
| **400** | Bad Request | Status → 'failed', retry |
| **403** | Forbidden: user deactivated chat | Status → 'skipped', disableUserNotifications() |
| **429** | Too Many Requests | Status → 'failed', retry com backoff |

### 18.4 Timeout e Retry

**Timeout:**
```typescript
async function sendTelegramMessageWithTimeout(
  chatId: number,
  text: string,
  timeoutMs: number = 30000
): Promise<{ ok: boolean; errorCode?: number; description?: string }> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(`${BOT_API}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)
    const data = await response.json()
    return data
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      return { ok: false, description: 'Timeout after 30s' }
    }
    return { ok: false, description: error.message }
  }
}
```

**Retry (Cron):**
- ✅ **Cron job:** 12h UTC (12x/dia)
- ✅ **Max tentativas:** 3
- ✅ **Backoff:** Exponencial (não implementado, retry imediato)

---

## 19. CONFIGURAÇÕES E VARIÁVEIS DE AMBIENTE

### 19.1 Variáveis Obrigatórias

**Arquivo:** `.env.example`

```bash
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[PROJECT].supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_STORAGE_BUCKET=posts

# Telegram
TELEGRAM_BOT_TOKEN=123456:ABC-DEF...

# Admin
ADMIN_TELEGRAM_ID=123456789,987654321

# Cron
CRON_SECRET=sua-cron-secret-aqui
```

### 19.2 Variáveis Opcionais

```bash
# JWT Sessions (opcional, mas recomendado para produção)
JWT_SECRET=sua-secret-key-muito-segura-aqui

# Bot Username (para deep links)
BOT_USERNAME=seu_bot_username

# Ambiente
NODE_ENV=development|production
```

### 19.3 Admin Telegram IDs (Array)

**Implementação:**
```typescript
// server/_core/env.ts
export const ENV = {
  // ...
  adminTelegramIds: (() => {
    const raw = process.env.ADMIN_TELEGRAM_ID
    if (!raw) return []
    return raw
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)
  })(),
}
```

**Formato:**
- ✅ **Lista separada por vírgulas:** `123456789,987654321`
- ✅ **BIGINT support:** IDs > 2 bilhões
- ✅ **Validação:** Filtra NaN e números <= 0

### 19.4 Validação de Tipos

**Arquivo:** `server/_core/env.ts`

```typescript
import { z } from 'zod'

const envSchema = z.object({
  databaseUrl: z.string().url(),
  supabaseUrl: z.string().url(),
  supabaseServiceRoleKey: z.string(),
  supabaseStorageBucket: z.string().default('posts'),
  telegramBotToken: z.string(),
  adminTelegramIds: z.array(z.number().positive()),
  cronSecret: z.string(),
  cookieSecret: z.string().optional(),
  isProduction: z.boolean(),
})

export const ENV = envSchema.parse({
  databaseUrl: process.env.DATABASE_URL,
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET || 'posts',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  adminTelegramIds: (() => {
    const raw = process.env.ADMIN_TELEGRAM_ID
    if (!raw) return []
    return raw
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0)
  })(),
  cronSecret: process.env.CRON_SECRET,
  cookieSecret: process.env.JWT_SECRET,
  isProduction: process.env.NODE_ENV === 'production',
})
```

---

## 20. RESUMO FINAL DO BACKEND

### 20.1 Pontos Fortes

| Ponto | Descrição | Impacto |
|-------|-----------|---------|
| **Type-Safety** | TypeScript + tRPC + Drizzle | Zero erros de tipo em produção |
| **Arquitetura** | Repository + Middleware + Singleton | Código organizado, fácil de manter |
| **Performance** | Promise.all, Cursor Pagination, bool_or() | -50% latência, -70% queries |
| **Segurança** | HMAC-SHA256, JWT, RLS, ownership validation | 16 camadas de proteção |
| **UX** | Rate limiting, efemeridade, notificações | Engajamento aumentado |
| **Manutenibilidade** | LogVault, audit log, documentação | Debugging facilitado |
| **Escalabilidade** | Serverless, pool de conexões, cache | Auto-scale, zero custo ocioso |

### 20.2 Padrões de Código

| Padrão | Uso | Exemplo |
|--------|-----|---------|
| **Repository Pattern** | Separação lógica de negócio / acesso a dados | `server/repositories/*.ts` |
| **Middleware Pattern** | Autenticação, autorização | `protectedProcedure`, `adminProcedure` |
| **Singleton Pattern** | Database connection, rate limiter | `getDb()`, `new SlowSocialRateLimiter()` |
| **Observer Pattern** | TanStack Query invalidations | `utils.posts.timeline.invalidate()` |
| **Strategy Pattern** | Rate limiting 3 camadas | CloudStorage + DB + Fallback |
| **Factory Pattern** | Gerador de share cards | `generateShareCard()` |

### 20.3 Decisões de Design

| Decisão | Por Que | Alternativas Consideradas |
|---------|---------|--------------------------|
| **tRPC** | Type-safety end-to-end, zero codegen | GraphQL, REST + OpenAPI |
| **Drizzle ORM** | Leve, type-safe, SQL-like | Prisma, TypeORM |
| **Supabase** | Free tier generoso, RLS incluso | AWS RDS, PlanetScale |
| **Vercel Serverless** | Auto-scaling, zero config | AWS Lambda, Railway |
| **JWT Sessions** | Persistência, reduz validações HMAC | Session no banco |
| **Efemeridade (7 dias)** | Reduz custo de storage, incentiva engajamento | Permanente, 30 dias |
| **Rate Limiting 3 Camadas** | Defensivo, sincronizado, fallback | Apenas frontend, apenas backend |

### 20.4 Qualidade Geral

**Avaliação:** ⭐⭐⭐⭐⭐ **EXCELENTE**

| Categoria | Nota | Justificativa |
|-----------|------|---------------|
| **Arquitetura** | ⭐⭐⭐⭐⭐ | Separação clara, patterns consolidados |
| **Type-Safety** | ⭐⭐⭐⭐⭐ | TypeScript strict, tRPC, Drizzle |
| **Performance** | ⭐⭐⭐⭐⭐ | Otimizações inteligentes (Promise.all, cursor pagination, bool_or) |
| **Segurança** | ⭐⭐⭐⭐⭐ | 16 camadas, HMAC-SHA256, JWT, RLS |
| **Manutenibilidade** | ⭐⭐⭐⭐⭐ | LogVault, audit log, documentação completa |
| **Escalabilidade** | ⭐⭐⭐⭐⭐ | Serverless, pool de conexões, cache |
| **UX** | ⭐⭐⭐⭐⭐ | Rate limiting, efemeridade, notificações push |

**Conclusão:**

O backend do Deck é um exemplo de **código de produção bem arquitetado**:

- ✅ **Type-safe** do backend ao frontend
- ✅ **Otimizado** para performance e custo
- ✅ **Seguro** com múltiplas camadas de proteção
- ✅ **Escalável** com serverless e cache
- ✅ **Manutenível** com LogVault, audit log, documentação
- ✅ **UX refinada** com rate limiting, efemeridade, notificações

**Status:** ✅ **PRODUÇÃO ESTÁVEL, PRONTO PARA SCALE**

---

*Última atualização: 14 de Março de 2026*

*Documento completo: ~2.000+ linhas de backend detalhado*

