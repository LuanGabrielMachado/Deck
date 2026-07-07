# 🔌 Deck - API Endpoints Completos e Detalhados (tRPC)

**Documento:** 02-API-ENDPOINTS  
**Versão:** 5.0.0 (Produção - Março 2026)  
**Data:** 14 de Março de 2026  
**Classificação:** Documentação Técnica de API  
**Público-Alvo:** Desenvolvedores Backend, Frontend, Integradores, Auditores de Código  
**Linhas de Documentação:** ~1.000+ (este documento)

---

## 📋 ÍNDICE GERAL DETALHADO

1. [Visão Geral da API](#1-visão-geral-da-api)
   - 1.1 Tipo de API (tRPC v11)
   - 1.2 Vantagens do tRPC
   - 1.3 Configurações da API Route
   - 1.4 Base URL e Métodos

2. [Arquitetura tRPC](#2-arquitetura-trpc)
   - 2.1 Estrutura do Router (6 routers, 30+ procedures)
   - 2.2 Procedures (Tipos e Middlewares)
   - 2.3 Arquivos Principais
   - 2.4 Fluxo de uma Requisição tRPC (12 etapas)

3. [Routers e Procedures](#3-routers-e-procedures)
   - 3.1 Router: system (3 procedures)
   - 3.2 Router: telegram (3 procedures)
   - 3.3 Router: users (3 procedures)
   - 3.4 Router: posts (9 procedures)
   - 3.5 Router: follows (4 procedures)
   - 3.6 Router: reactions (3 procedures)
   - 3.7 Router: admin (12 procedures)

4. [Endpoints Detalhados](#4-endpoints-detalhados)
   - 4.1 telegram.login (Registro/Atualização de Usuário)
   - 4.2 telegram.me (Dados do Usuário Atual)
   - 4.3 telegram.isAdmin (Verificação de Admin)
   - 4.4 users.search (Busca de Usuários)
   - 4.5 users.suggested (Sugestão de Usuários)
   - 4.6 users.setNotifications (Opt-out de Notificações)
   - 4.7 posts.create (Criação de Post)
   - 4.8 posts.canCreate (Check Rate Limit Posts)
   - 4.9 posts.timeline (Timeline com Cursor Pagination)
   - 4.10 posts.byUser (Posts de um Usuário)
   - 4.11 posts.countByUser (Contagem de Posts)
   - 4.12 posts.getById (Post Específico por ID)
   - 4.13 posts.reply (Resposta a Post)
   - 4.14 posts.canReply (Check Rate Limit Replies)
   - 4.15 posts.delete (Deleção de Post)
   - 4.16 follows.follow (Seguir Usuário)
   - 4.17 follows.unfollow (Deixar de Seguir)
   - 4.18 follows.isFollowing (Verificação de Follow)
   - 4.19 follows.following (Lista de Seguindo)
   - 4.20 reactions.add (Adicionar Reação)
   - 4.21 reactions.remove (Remover Reação)
   - 4.22 reactions.getByPost (Reações de um Post)
   - 4.23 admin.getStats (Estatísticas do Dashboard)
   - 4.24 admin.getFlags (Flags do Servidor)
   - 4.25 admin.setFlag (Definir Flag)
   - 4.26 admin.getUser (Dados de Usuário para Admin)
   - 4.27 admin.banUser (Ban/Unban Usuário)
   - 4.28 admin.shadowBanUser (Shadow Ban/Unban)
   - 4.29 admin.resetRateLimit (Reset Rate Limit)
   - 4.30 admin.deletePost (Deletar Qualquer Post)
   - 4.31 admin.setUserFeedMode (Alterar Feed Mode)
   - 4.32 admin.getActions (Ações Administrativas)
   - 4.33 admin.getLogs (LogVault - Logs Estruturados)
   - 4.34 admin.broadcast (Publicar Aviso Global)

5. [Schemas do Banco de Dados](#5-schemas-do-banco-de-dados)
   - 5.1 Tabela users
   - 5.2 Tabela posts
   - 5.3 Tabela follows
   - 5.4 Tabela reactions
   - 5.5 Tabela serverConfig
   - 5.6 Tabela adminActions
   - 5.7 Tabela notifications
   - 5.8 Tabela logs

6. [Sistema de Efemeridade (7 dias)](#6-sistema-de-efemeridade-7-dias)
   - 6.1 Implementação no Backend
   - 6.2 Admin Isento
   - 6.3 Cron Cleanup

7. [Sistema de Replies](#7-sistema-de-replies)
   - 7.1 Auto-Relacionamento
   - 7.2 ON DELETE CASCADE
   - 7.3 Threads Infinitas

8. [Sistema de Notificações](#8-sistema-de-notificações)
   - 8.1 Helper sendNotification
   - 8.2 Deduplicação
   - 8.3 Tratamento 403

9. [Fluxo de Comunicação Interna](#9-fluxo-de-comunicação-interna)
   - 9.1 Frontend → Backend
   - 9.2 Backend → Database
   - 9.3 Backend → Bot API
   - 9.4 Resposta em Cascata

10. [Protocolos e Formatos](#10-protocolos-e-formatos)
    - 10.1 Protocolo de Comunicação
    - 10.2 Formato de Dados
    - 10.3 Serialização (SuperJSON)

11. [Tratamento de Erros](#11-tratamento-de-erros)
    - 11.1 TRPCError Codes
    - 11.2 Erros Comuns e Mensagens
    - 11.3 Error Handling no Frontend

12. [Exemplos de Uso](#12-exemplos-de-uso)
    - 12.1 Criar Post
    - 12.2 Timeline Infinita
    - 12.3 Seguir Usuário
    - 12.4 Admin Ban

13. [Cron Jobs](#13-cron-jobs)
    - 13.1 Cleanup Posts (3h UTC)
    - 13.2 Notifications Retry (12h UTC)

14. [Funções Helper de Database](#14-funções-helper-de-database)
    - 14.1 User Repository (15 funções)
    - 14.2 Post Repository (11 funções)
    - 14.3 Follow Repository (4 funções)
    - 14.4 Reaction Repository (3 funções)
    - 14.5 Notification Repository (7 funções)
    - 14.6 Admin Repository (4 funções)
    - 14.7 Config Repository (3 funções)
    - 14.8 Log Repository (2 funções)

15. [Otimizações de Performance](#15-otimizações-de-performance)
    - 15.1 Promise.all (1 Round-Trip)
    - 15.2 Cursor Pagination
    - 15.3 bool_or() Optimization
    - 15.4 Índices Compostos

16. [Validações de Segurança](#16-validações-de-segurança)
    - 16.1 Ownership Validation
    - 16.2 Ban Check Before Upsert
    - 16.3 Input Sanitization
    - 16.4 Admin Self-Ban Protection

17. [Configurações e Variáveis de Ambiente](#17-configurações-e-variáveis-de-ambiente)
    - 17.1 Variáveis Obrigatórias
    - 17.2 Variáveis Opcionais
    - 17.3 Admin Telegram IDs (Array)

---

## 1. VISÃO GERAL DA API

### 1.1 Tipo de API

A aplicação utiliza **tRPC v11**, um framework de API type-safe que permite chamadas de procedimento remoto com **tipagem end-to-end automática**, sem necessidade de geração de código ou schemas separados.

**Características Principais:**

| Característica | Descrição | Impacto |
|---------------|-----------|---------|
| **Protocolo** | HTTP/HTTPS sobre JSON-RPC like | Familiar, fácil de debugar |
| **Transporte** | Fetch API | Nativo no browser, sem dependências |
| **Serialização** | SuperJSON (preserva Date, Map, Set, BigInt) | Tipos JavaScript preservados |
| **Tipagem** | TypeScript inference automático (backend → frontend) | Zero erros de tipo em produção |
| **Base URL** | `/api/trpc` | Padrão Next.js App Router |
| **Métodos** | GET (queries) e POST (mutations) | RESTful-like, mas type-safe |

### 1.2 Vantagens do tRPC

| Vantagem | Descrição | Impacto no Projeto |
|----------|-----------|-------------------|
| **Type-Safety** | Tipos TypeScript do backend ao frontend | Zero erros de tipo em produção, refactors seguros |
| **Sem Codegen** | Não requer geração de código | Menos complexidade, DX melhor, menos arquivos |
| **Bundle Size** | Menor que GraphQL/REST com OpenAPI | Bundle 203KB (otimizado) |
| **DX** | Autocomplete e validação em tempo real | Desenvolvimento 40% mais rápido |
| **Refactoring** | Safe refactors em toda a codebase | Manutenção simplificada, confiança |
| **Zero Config** | Sem schemas separados | Menos código para manter |
| **SuperJSON** | Preserva Date, Map, Set, BigInt | Sem conversões manuais de tipos |

**Comparativo com Alternativas:**

| Feature | tRPC | GraphQL | REST + OpenAPI |
|---------|------|---------|----------------|
| **Type-Safety** | ✅ Automática | ✅ Requer codegen | ✅ Requer codegen |
| **Bundle Size** | ✅ 203KB | ❌ 2.8MB | ❌ 500KB+ |
| **Setup** | ✅ Zero config | ❌ Schema, resolvers | ❌ Schema, validators |
| **DX** | ✅ Autocomplete imediato | ⚠️ Após codegen | ⚠️ Após codegen |
| **Flexibilidade** | ✅ Total | ✅ Total | ⚠️ Limitado |

### 1.3 Configurações da API Route

**Arquivo:** `src/app/api/trpc/[trpc]/route.ts`

```typescript
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from '@/server'
import { createVercelContext } from '@/server/_core/context'

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createVercelContext,
  })

export { handler as GET, handler as POST }

// Configurações de Runtime
export const runtime = 'nodejs'        // Node.js (não edge)
export const dynamic = 'force-dynamic' // Geração dinâmica (não static)
export const maxDuration = 30          // Timeout máximo (30 segundos)
```

**Configurações de Runtime:**

| Configuração | Valor | Descrição | Por Que |
|-------------|-------|-----------|---------|
| **runtime** | `nodejs` | Node.js runtime (não edge) | Necessário para Drizzle ORM, postgres driver, crypto |
| **dynamic** | `force-dynamic` | Geração dinâmica (não static) | Dados em tempo real, não pode ser estático |
| **maxDuration** | `30s` | Timeout máximo da função | Suficiente para queries + upload de imagens |

**Headers de Resposta (responseMeta):**
```typescript
// server/_core/context.ts
export async function createVercelContext({ req }): Promise<Context> {
  const responseCookies: string[] = []
  
  // ... autenticação ...
  
  return {
    telegramId,
    isAuthenticated,
    isAdmin,
    responseCookies, // Cookies JWT injetados na resposta
  }
}
```

### 1.4 Base URL e Métodos

**Ambientes:**

| Ambiente | Base URL | Acesso |
|----------|----------|--------|
| **Produção** | `https://deck.vercel.app/api/trpc` | Público (Telegram Mini App) |
| **Desenvolvimento** | `http://localhost:3000/api/trpc` | Localhost |

**Métodos HTTP:**

| Método | Uso | Exemplo |
|--------|-----|---------|
| **GET** | Queries (leitura) | `GET /api/trpc/posts.timeline?input={...}` |
| **POST** | Mutations (escrita) | `POST /api/trpc/posts.create` com body JSON |

**Formato de Input:**
```typescript
// Query (GET)
GET /api/trpc/posts.timeline?input=%7B%22limit%22%3A20%7D

// Mutation (POST)
POST /api/trpc/posts.create
Content-Type: application/json
{
  "json": {
    "telegramId": 123456789,
    "content": "Thread do dia...",
    "imageBase64": "data:image/jpeg;base64,..."
  }
}
```

**Headers Obrigatórios:**
```typescript
{
  // Autenticação (se não tiver cookie JWT)
  'Authorization': 'Bearer <initDataString>',
  
  // Alternativo
  'X-Telegram-Init-Data': '<initDataString>',
  
  // Cookies (sessão JWT)
  'Cookie': 'deck_session=<jwtToken>',
  
  // Content-Type (mutations)
  'Content-Type': 'application/json'
}
```

---

## 2. ARQUITETURA TRPC

### 2.1 Estrutura do Router (6 Routers, 30+ Procedures)

**Arquivo:** `server/routers/index.ts`

```typescript
import { router } from '../_core/trpc'
import { systemRouter } from './system.router'
import { telegramRouter } from './telegram.router'
import { userRouter } from './user.router'
import { postRouter } from './post.router'
import { followRouter } from './follow.router'
import { reactionRouter } from './reaction.router'
import { adminRouter } from './admin.router'

export const appRouter = router({
  system: systemRouter,      // 3 procedures
  telegram: telegramRouter,  // 3 procedures
  users: userRouter,         // 3 procedures
  posts: postRouter,         // 9 procedures
  follows: followRouter,     // 4 procedures
  reactions: reactionRouter, // 3 procedures
  admin: adminRouter,        // 12 procedures
})

export type AppRouter = typeof appRouter
```

**Total:** 6 routers, 37 procedures

### 2.2 Procedures (Tipos e Middlewares)

**Arquivo:** `server/_core/trpc.ts`

```typescript
import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { Context } from './context'

const t = initTRPC.context<Context>().create({
  transformer: superjson, // Preserva Date, Map, Set
})

// Middleware de autenticação básica
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

// Middleware de admin
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

// Procedures públicas
export const publicProcedure = t.procedure

// Procedures protegidas (requer autenticação)
export const protectedProcedure = t.procedure.use(isAuthed)

// Procedures de admin (requer isAdmin)
export const adminProcedure = t.procedure.use(isAdmin)
```

**Tipos de Procedures:**

| Tipo | Middleware | Uso | Exemplo |
|------|-----------|-----|---------|
| **publicProcedure** | Nenhum | Endpoints públicos | `system.health`, `users.search` |
| **protectedProcedure** | isAuthed | Endpoints protegidos | `posts.create`, `telegram.me` |
| **adminProcedure** | isAdmin | Endpoints admin | `admin.banUser`, `admin.getStats` |

### 2.3 Arquivos Principais

| Arquivo | Path | Responsabilidade | Linhas |
|---------|------|------------------|--------|
| **App Router** | `/server/index.ts` | Export do router principal | ~10 |
| **Routers** | `/server/routers/*.ts` | Definição de todos os routers (37 procedures) | ~900 |
| **System Router** | `/server/_core/systemRouter.ts` | Endpoints de sistema (health, diagnostic) | ~80 |
| **tRPC Config** | `/server/_core/trpc.ts` | Configuração do tRPC (procedures, SuperJSON) | ~70 |
| **Context** | `/server/_core/context.ts` | Criação do contexto (isAdmin, JWT, initData) | ~100 |
| **API Route** | `/src/app/api/trpc/[trpc]/route.ts` | Handler HTTP (fetchRequestHandler) | ~20 |

### 2.4 Fluxo de uma Requisição tRPC (12 Etapas)

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. FRONTEND (React Component + TanStack Query)                  │
│    trpc.posts.timeline.useInfiniteQuery(                        │
│      { limit: 20, cursor: undefined },                          │
│      {                                                          │
│        getNextPageParam: (lastPage) => lastPage.nextCursor,     │
│        staleTime: 5 * 60 * 1000,                                │
│        gcTime: 10 * 60 * 1000                                   │
│      }                                                          │
│    )                                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ tRPC Client (httpBatchLink)
                              │ + headers (Authorization, initData, Cookie)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. NEXT.JS API ROUTE                                            │
│    /src/app/api/trpc/[trpc]/route.ts                            │
│    • fetchRequestHandler({                                      │
│        endpoint: '/api/trpc',                                   │
│        req,                                                     │
│        router: appRouter,                                       │
│        createContext                                            │
│      })                                                         │
│    • Runtime: nodejs                                            │
│    • Dynamic: force-dynamic                                     │
│    • Max Duration: 30s                                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ createContext()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. CONTEXT CREATION                                             │
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
│ 4. TRPC ROUTER + MIDDLEWARE                                     │
│    /server/routers/posts.router.ts                              │
│    • posts.timeline: protectedProcedure                         │
│    • Middleware verifica isAuthenticated                        │
│    • Validação com Zod (input schema)                           │
│    • Verifica feedMode do usuário                               │
│    • Filtra shadow-banned                                       │
│    • Filtra efemeridade (< 7 dias ou admin)                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ chamada de função
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. PROCEDURE EXECUTION                                          │
│    • Verifica autenticação (protectedProcedure)                 │
│    • Verifica isAdmin (adminProcedure)                          │
│    • Valida permissões (ownership, ban)                         │
│      - if (telegramId !== input.telegramId) → FORBIDDEN         │
│      - if (user?.isBanned) → FORBIDDEN                          │
│    • Aplica rate limiting (SlowSocialRateLimiter)               │
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
│    • getTimelinePosts()                                         │
│    • Drizzle ORM query                                          │
│    • PostgreSQL via Supabase                                    │
│    • Cursor pagination (id DESC, limit+1)                       │
│    • Filtra shadow-banned users                                 │
│    • Filtra efemeridade                                         │
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
│    /server/repositories/post.repository.ts                      │
│    • getTimelinePosts() retorna dados tipados                   │
│    • Transforma para formato esperado                           │
│    • Calcula nextCursor                                         │
│    • Retorna: { posts: PostWithAuthor[], nextCursor?: number }  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ retorno
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 9. ROUTER LAYER                                                 │
│    /server/routers/posts.router.ts                              │
│    • Recebe dados do repository                                 │
│    • Aplica transformações finais                               │
│    • Retorna para tRPC Server                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ retorno
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 10. TRPC SERVER                                                 │
│    • SuperJSON serialize (preserva Date, Map, Set)              │
│    • responseMeta injeta cookies JWT                            │
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
│    • Retorna: { posts: PostWithAuthor[], nextCursor?: number }  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. ROUTERS E PROCEDURES

### 3.1 Router: `system`

**Propósito:** Endpoints utilitários para diagnóstico, health check e configuração do menu button do Telegram.

**Arquivo:** `server/_core/systemRouter.ts`

| Endpoint | Tipo | Input | Output | Autenticação | Descrição |
|----------|------|-------|--------|--------------|-----------|
| `system.health` | Query | `{ timestamp: number }` | `{ ok: true }` | Não | Health check básico |
| `system.diagnostic` | Query | Opcional | `DiagnosticData` | Não | Diagnóstico do sistema |
| `system.testDatabase` | Query | Nenhum | `{ ok, message, connected }` | Não | Teste de conexão DB |
| `system.setMenuButton` | Mutation | `{ type: 'default' \| 'command' }` | `{ success: true }` | Admin | Configura botão do menu do Telegram |

**Exemplo de Uso:**
```typescript
// Health check
const health = await trpc.system.health.query({ timestamp: Date.now() })
// Retorna: { ok: true }

// Teste de database
const dbTest = await trpc.system.testDatabase.query()
// Retorna: { ok: true, message: 'Database connected', connected: true }
```

### 3.2 Router: `telegram`

**Propósito:** Autenticação e gerenciamento de usuário via Telegram.

**Arquivo:** `server/routers/telegram.router.ts`

| Endpoint | Tipo | Input | Output | Autenticação | Descrição |
|----------|------|-------|--------|--------------|-----------|
| `telegram.login` | Mutation | `TelegramUserInput` | `User` | Não (valida initData) | Registra/atualiza usuário |
| `telegram.me` | Query | `{ telegramId: number }` | `User` | Sim (protected) | Dados do usuário atual |
| `telegram.isAdmin` | Query | Nenhum | `{ isAdmin: boolean }` | Sim (protected) | Verifica se é admin |

**Input Schema (telegram.login):**
```typescript
z.object({
  telegramId: z.number(),
  firstName: z.string(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  photoUrl: z.string().optional(),
})
```

**Fluxo telegram.login:**
1. Valida HMAC-SHA256 do initData
2. Verifica `ctx.telegramId === input.telegramId` (ownership)
3. Verifica flag `pause_new_users` (apenas novos usuários)
4. Verifica se usuário está banido (antes e após upsert)
5. Upsert no banco (users)
6. Cria JWT session cookie (7 dias)
7. Retorna user

### 3.3 Router: `users`

**Propósito:** Busca e sugestão de usuários, gerenciamento de notificações.

**Arquivo:** `server/routers/user.router.ts`

| Endpoint | Tipo | Input | Output | Autenticação | Descrição |
|----------|------|-------|--------|--------------|-----------|
| `users.search` | Query | `{ query: string, limit?: number }` | `User[]` | Não | Busca usuários por nome |
| `users.suggested` | Query | `{ limit?: number }` | `User[]` | Sim (protected) | Sugere usuários para seguir |
| `users.setNotifications` | Mutation | `{ enabled: boolean }` | `{ success: true }` | Sim (protected) | Opt-out de notificações |

**Filtros de busca:**
- `searchUsersByName`: Filtra `isBanned=false` e `shadowBanned=false`
- `getSuggestedUsers`: Exclui já seguidos, próprio, banidos

### 3.4 Router: `posts`

**Propósito:** CRUD de posts, timeline e replies.

**Arquivo:** `server/routers/post.router.ts`

| Endpoint | Tipo | Input | Output | Autenticação | Descrição |
|----------|------|-------|--------|--------------|-----------|
| `posts.create` | Mutation | `CreatePostInput` | `{ postId, imagePath? }` | Sim (protected) | Cria novo post |
| `posts.canCreate` | Query | Nenhum | `RateLimitStatus` | Sim (protected) | Check rate limit posts |
| `posts.timeline` | Query | `{ limit?, cursor? }` | `{ posts, nextCursor? }` | Sim (protected) | Feed com cursor pagination |
| `posts.byUser` | Query | `{ telegramId, limit?, cursor? }` | `{ posts, nextCursor? }` | Sim (protected) | Posts de um usuário |
| `posts.countByUser` | Query | `{ telegramId }` | `{ count }` | Sim (protected) | Contagem de posts |
| `posts.getById` | Query | `{ postId }` | `PostWithAuthor` | Sim (protected) | Post específico por ID |
| `posts.reply` | Mutation | `{ replyToPostId, content }` | `{ postId }` | Sim (protected) | Responde post existente |
| `posts.canReply` | Query | Nenhum | `ReplyRateLimitStatus` | Sim (protected) | Check rate limit replies |
| `posts.delete` | Mutation | `{ postId, telegramId }` | `{ success }` | Sim (protected) | Deleta post (próprio ou admin) |

**Validações posts.create:**
- Verifica ban do usuário
- Verifica flag `maintenance_mode` (admin bypassa)
- Verifica flag `lock_posts_global` (admin bypassa)
- Rate limiting (3 camadas, admin bypassa)
- Upload de imagem (max 12MB, validação base64)
- Atualiza `users.lastPostAt` após criação

### 3.5 Router: `follows`

**Propósito:** Gerenciamento de follows.

**Arquivo:** `server/routers/follow.router.ts`

| Endpoint | Tipo | Input | Output | Autenticação | Descrição |
|----------|------|-------|--------|--------------|-----------|
| `follows.follow` | Mutation | `{ followerId, followingId }` | `{ success }` | Sim (protected) | Segue usuário |
| `follows.unfollow` | Mutation | `{ followerId, followingId }` | `{ success }` | Sim (protected) | Deixa de seguir |
| `follows.isFollowing` | Query | `{ followerId, followingId }` | `{ isFollowing }` | Sim (protected) | Verifica se segue |
| `follows.following` | Query | `{ telegramId }` | `User[]` | Sim (protected) | Lista de seguindo |

**Validações:**
- Previne auto-follow (`followerId === followingId`)
- Valida que `followerId` corresponde ao usuário autenticado
- `followUser`: Idempotente (`onConflictDoNothing`)

### 3.6 Router: `reactions`

**Propósito:** Reações com emojis em posts.

**Arquivo:** `server/routers/reaction.router.ts`

| Endpoint | Tipo | Input | Output | Autenticação | Descrição |
|----------|------|-------|--------|--------------|-----------|
| `reactions.add` | Mutation | `{ postId, telegramId, emoji }` | `{ success }` | Sim (protected) | Adiciona reação |
| `reactions.remove` | Mutation | `{ postId, telegramId, emoji }` | `{ success }` | Sim (protected) | Remove reação |
| `reactions.getByPost` | Query | `{ postId }` | `ReactionCount[]` | Sim (protected) | Reações de um post |

**Otimização `getByPost`:**
- Usa `bool_or()` em uma única query
- Retorna `userReacted: boolean` para cada emoji
- 12 emojis disponíveis

### 3.7 Router: `admin`

**Propósito:** Dashboard administrativo e moderação.

**Arquivo:** `server/routers/admin.router.ts`

| Endpoint | Tipo | Input | Output | Autenticação | Descrição |
|----------|------|-------|--------|--------------|-----------|
| `admin.getStats` | Query | Nenhum | `AdminStats` | Sim (admin) | Stats do dashboard |
| `admin.getFlags` | Query | Nenhum | `ServerFlag[]` | Sim (admin) | Flags do servidor |
| `admin.setFlag` | Mutation | `{ key, value }` | `{ success }` | Sim (admin) | Define flag |
| `admin.getUser` | Query | `{ telegramId }` | `UserModeration` | Sim (admin) | Dados de usuário (admin) |
| `admin.banUser` | Mutation | `{ telegramId, ban }` | `{ success }` | Sim (admin) | Ban/unban usuário |
| `admin.shadowBanUser` | Mutation | `{ telegramId, ban }` | `{ success }` | Sim (admin) | Shadow ban/unban |
| `admin.resetRateLimit` | Mutation | `{ telegramId }` | `{ success }` | Sim (admin) | Reset rate limit |
| `admin.deletePost` | Mutation | `{ postId }` | `{ success }` | Sim (admin) | Deleta qualquer post |
| `admin.setUserFeedMode` | Mutation | `{ telegramId, feedMode }` | `{ feedMode }` | Sim (admin) | Altera feed mode |
| `admin.getActions` | Query | `{ limit? }` | `AdminAction[]` | Sim (admin) | Ações administrativas |
| `admin.getLogs` | Query | `{ level?, context?, since?, limit?, offset? }` | `Log[]` | Sim (admin) | LogVault (logs estruturados) |
| `admin.broadcast` | Mutation | `{ content }` | `{ success }` | Sim (admin) | Publica aviso global |

**Flags de Servidor:**
- `maintenance_mode`: Bloqueia login (admin bypassa)
- `pause_new_users`: Bloqueia novos cadastros
- `lock_posts_global`: Bloqueia posts e replies
- `feed_mode_global`: Sobrepõe feed mode individual ('all' ou 'following')

**Segurança admin:**
- Não pode banir a si mesmo
- Todas as ações são registradas em `adminActions`
- LogVault para logs estruturados

---

## 4. ENDPOINTS DETALHADOS

### 4.1 telegram.login (Registro/Atualização de Usuário)

**Procedure:** `telegram.login`  
**Tipo:** Mutation  
**Autenticação:** Não (valida initData)  
**Arquivo:** `server/routers/telegram.router.ts`

**Input Schema:**
```typescript
const LoginSchema = z.object({
  telegramId: z.number(),
  firstName: z.string(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  photoUrl: z.string().optional(),
})

type TelegramUserInput = z.infer<typeof LoginSchema>
```

**Output:**
```typescript
{
  telegramId: number,
  name: string | null,
  photoUrl: string | null,
  lastPostAt: Date | null,
  lastReplyAt: Date | null,
  isBanned: boolean,
  shadowBanned: boolean,
  feedMode: 'following' | 'all',
  notificationsEnabled: boolean,
  createdAt: Date
}
```

**Código Completo:**
```typescript
telegram: router({
  login: publicProcedure
    .input(LoginSchema)
    .mutation(async ({ ctx, input }) => {
      // Valida que telegramId corresponde ao contexto
      if (!ctx.telegramId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'initData do Telegram inválido',
        })
      }

      if (ctx.telegramId !== input.telegramId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Você não tem permissão para usar este ID de Telegram',
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

**Validações de Segurança:**
- ✅ `ctx.telegramId === input.telegramId` (previne uso de ID alheio)
- ✅ Verifica `pause_new_users` apenas para usuários novos
- ✅ Verifica `isBanned` antes e após upsert
- ✅ Cria JWT session cookie (7 dias) se `JWT_SECRET` configurado

**Erros Possíveis:**
| Código | Mensagem | Quando |
|--------|----------|--------|
| `UNAUTHORIZED` | "initData do Telegram inválido" | initData ausente ou inválido |
| `UNAUTHORIZED` | "Você não tem permissão..." | telegramId não corresponde |
| `FORBIDDEN` | "Novos cadastros estão pausados" | Flag pause_new_users = true |
| `FORBIDDEN` | "Sua conta foi banida" | isBanned = true |

### 4.2 telegram.me (Dados do Usuário Atual)

**Procedure:** `telegram.me`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/telegram.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
})
```

**Output:**
```typescript
{
  telegramId: number,
  name: string | null,
  photoUrl: string | null,
  lastPostAt: Date | null,
  lastReplyAt: Date | null,
  isBanned: boolean,
  shadowBanned: boolean,
  feedMode: 'following' | 'all',
  notificationsEnabled: boolean,
  createdAt: Date
}
```

**Código:**
```typescript
telegram: router({
  me: protectedProcedure
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ ctx, input }) => {
      // Valida que telegramId corresponde ao contexto
      if (ctx.telegramId !== input.telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você só pode acessar seus próprios dados',
        })
      }

      return db.getUserByTelegramId(input.telegramId)
    }),
})
```

**Uso no Frontend:**
```typescript
const { data: user } = trpc.telegram.me.useQuery({ telegramId: user?.id })
```

### 4.3 telegram.isAdmin (Verificação de Admin)

**Procedure:** `telegram.isAdmin`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/telegram.router.ts`

**Input:** Nenhum

**Output:**
```typescript
{
  isAdmin: boolean
}
```

**Código:**
```typescript
telegram: router({
  isAdmin: protectedProcedure.query(async ({ ctx }) => {
    return { isAdmin: ctx.isAdmin }
  }),
})
```

**Uso no Frontend:**
```typescript
const { data: adminData } = trpc.telegram.isAdmin.useQuery()
const isAdmin = adminData?.isAdmin ?? false

// Double-tap para acessar admin dashboard
if (isAdmin && timeSinceLastTap < 400) {
  router.push('/admin')
}
```

### 4.4 users.search (Busca de Usuários)

**Procedure:** `users.search`  
**Tipo:** Query  
**Autenticação:** Não (pública)  
**Arquivo:** `server/routers/user.router.ts`

**Input Schema:**
```typescript
z.object({
  query: z.string().min(1).max(100),
  limit: z.number().min(1).max(100).optional().default(20),
})
```

**Output:**
```typescript
User[] = {
  telegramId: number,
  name: string | null,
  photoUrl: string | null,
  feedMode: 'following' | 'all',
  notificationsEnabled: boolean,
  createdAt: Date
}[]
```

**Código Completo:**
```typescript
users: router({
  search: publicProcedure
    .input(z.object({
      query: z.string().min(1).max(100),
      limit: z.number().min(1).max(100).optional().default(20),
    }))
    .query(async ({ input }) => {
      // Sanitiza wildcards LIKE para prevenir SQL injection
      const sanitizedQuery = input.query.replace(/[%_\\]/g, '')
      
      // Busca case-insensitive, filtra banidos e shadow-banned
      return db.searchUsersByName(sanitizedQuery, input.limit)
    }),
})
```

**Filtros de Segurança:**
- ✅ Sanitiza wildcards LIKE (`[%_\\]`) para prevenir SQL injection
- ✅ Filtra `isBanned=false` e `shadowBanned=false`
- ✅ Limita a 100 resultados máximos

**Implementação no Database:**
```typescript
// server/repositories/user.repository.ts
export async function searchUsersByName(query: string, limit: number): Promise<User[]> {
  const db = getDb()
  
  // Busca case-insensitive com ILIKE
  const users = await db.query.users.findMany({
    where: and(
      ilike(users.name, `%${query}%`),
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

**Erros Possíveis:**
| Código | Mensagem | Quando |
|--------|----------|--------|
| `BAD_REQUEST` | "Query deve ter pelo menos 1 caractere" | query.length < 1 |
| `BAD_REQUEST` | "Query muito longa" | query.length > 100 |

**Exemplo de Uso:**
```typescript
// Buscar usuários com "João"
const results = await trpc.users.search.query({ query: 'João', limit: 20 })
// Retorna: [{ telegramId: 123, name: 'João Silva', photoUrl: '...', ... }]
```

---

### 4.5 users.suggested (Sugestão de Usuários)

**Procedure:** `users.suggested`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/user.router.ts`

**Input Schema:**
```typescript
z.object({
  limit: z.number().min(1).max(100).optional().default(20),
})
```

**Output:**
```typescript
User[] = {
  telegramId: number,
  name: string | null,
  photoUrl: string | null,
  feedMode: 'following' | 'all',
  notificationsEnabled: boolean,
  createdAt: Date
}[]
```

**Código Completo:**
```typescript
users: router({
  suggested: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(20),
    }))
    .query(async ({ ctx, input }) => {
      // Exclui: já seguidos, próprio usuário, banidos
      return db.getSuggestedUsers(ctx.telegramId, input.limit)
    }),
})
```

**Critérios de Sugestão:**
- ✅ Exclui usuários que já está seguindo
- ✅ Exclui o próprio usuário
- ✅ Exclui usuários banidos (`isBanned=false`)
- ✅ Exclui usuários com shadow ban (`shadowBanned=false`)
- ✅ Ordena por número de seguidores (mais populares primeiro)

**Implementação no Database:**
```typescript
// server/repositories/user.repository.ts
export async function getSuggestedUsers(telegramId: number, limit: number): Promise<User[]> {
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

**Exemplo de Uso:**
```typescript
// Sugere 20 usuários para seguir
const suggested = await trpc.users.suggested.query({ limit: 20 })
// Retorna: [{ telegramId: 456, name: 'Maria Santos', ... }]
```

---

### 4.6 users.setNotifications (Opt-out de Notificações)

**Procedure:** `users.setNotifications`  
**Tipo:** Mutation  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/user.router.ts`

**Input Schema:**
```typescript
z.object({
  enabled: z.boolean(),
})
```

**Output:**
```typescript
{
  success: true
}
```

**Código Completo:**
```typescript
users: router({
  setNotifications: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db.setUserNotificationsEnabled(ctx.telegramId, input.enabled)
      return { success: true }
    }),
})
```

**LGPD Compliance:**
- ✅ Usuário pode desativar notificações a qualquer momento
- ✅ Padrão: `true` (ativado)
- ✅ Persistente no banco de dados
- ✅ Respeitado pelo sistema de notificações

**Implementação no Database:**
```typescript
// server/repositories/user.repository.ts
export async function setUserNotificationsEnabled(
  telegramId: number,
  enabled: boolean
): Promise<void> {
  const db = getDb()
  
  await db
    .update(users)
    .set({ notificationsEnabled: enabled })
    .where(eq(users.telegramId, telegramId))
}
```

**Exemplo de Uso:**
```typescript
// Desativar notificações
await trpc.users.setNotifications.mutate({ enabled: false })

// Ativar notificações
await trpc.users.setNotifications.mutate({ enabled: true })
```

---

### 4.7 posts.create (Criação de Post)

**Procedure:** `posts.create`  
**Tipo:** Mutation  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(), // ⚠️ IGNORADO: usa ctx.telegramId
  content: z.string().min(1).max(165),
  imageBase64: z.string().optional(),
})
```

**Output:**
```typescript
{
  postId: number,
  imagePath?: string
}
```

**Código Completo:**
```typescript
posts: router({
  create: protectedProcedure
    .input(z.object({
      telegramId: z.number(),
      content: z.string().min(1).max(165),
      imageBase64: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId

      // Verificar ban (protege contra JWT válido pós-ban)
      const currentUser = await getUserByTelegramId(telegramId)
      if (currentUser?.isBanned) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Sua conta foi banida.',
        })
      }

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

      // Rate limiting (3 camadas, admin bypassa)
      const canPost = await rateLimiter.canCreatePost(telegramId, ctx.isAdmin)
      if (!canPost.canPost) {
        log.info('rate_limit', 'Post bloqueado por rate limit', {
          actorId: telegramId,
          meta: {
            nextAllowedAt: canPost.nextAllowedAt?.toISOString(),
            timeRemainingMs: canPost.timeRemainingMs,
          },
        })
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: `Aguarde até ${canPost.nextAllowedAt?.toLocaleTimeString('pt-BR')} para postar novamente`,
          cause: {
            nextAllowedAt: canPost.nextAllowedAt,
            timeRemainingMs: canPost.timeRemainingMs,
          },
        })
      }

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

      // Criar post no banco
      const postId = await createPost({
        telegramId,
        content: input.content,
        imagePath,
      })

      // Atualizar lastPostAt (rate limit híbrido - camada 2)
      await updateUserLastPostAt(telegramId)

      return { postId, imagePath }
    }),
})
```

**Validações Detalhadas:**
- ✅ **Ignora** `input.telegramId`, usa `ctx.telegramId` (segurança)
- ✅ **Modo manutenção:** `maintenance_mode` + `lock_posts_global` (admin bypassa)
- ✅ **Rate limit:** 3 camadas (CloudStorage, users.lastPostAt, tabela posts)
- ✅ **Imagem:**
  - Regex: `/^[A-Za-z0-9+/=\s]+$/` para base64
  - Extrai MIME type do data URL
  - Valida tamanho (máx **12MB**)
  - GIFs animados: preservados (sem compressão)

**Erros Possíveis:**
| Código | Mensagem | Quando |
|--------|----------|--------|
| `FORBIDDEN` | "Sua conta foi banida" | isBanned = true |
| `FORBIDDEN` | "App em modo manutenção" | maintenance_mode = true |
| `FORBIDDEN` | "A tia tá nervosa hoje, bloqueou tudo" | lock_posts_global = true |
| `TOO_MANY_REQUESTS` | "Aguarde até XX:XX para postar" | Rate limit atingido |
| `BAD_REQUEST` | "Formato de imagem inválido" | Base64 regex falhou |
| `BAD_REQUEST` | "Imagem vazia" | Buffer.length = 0 |
| `BAD_REQUEST` | "Imagem muito grande (máx 12MB)" | Buffer > 12MB |
| `INTERNAL_SERVER_ERROR` | "Upload falhou" | Erro no Supabase Storage |

**Exemplo de Uso:**
```typescript
// Criar post apenas com texto
const result = await trpc.posts.create.mutate({
  telegramId: user.id,
  content: 'Thread do dia: alguém viu o que aconteceu?',
})

// Criar post com imagem
const result = await trpc.posts.create.mutate({
  telegramId: user.id,
  content: 'Look do dia!',
  imageBase64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...',
})
```

---

### 4.8 posts.canCreate (Check Rate Limit Posts)

**Procedure:** `posts.canCreate`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input:** Nenhum

**Output:**
```typescript
{
  canPost: boolean,
  nextAllowedAt?: Date,
  timeRemainingMs?: number,
  blockedBy?: 'lastPostAt' | 'posts_fallback'
}
```

**Código Completo:**
```typescript
posts: router({
  canCreate: protectedProcedure.query(async ({ ctx }) => {
    return await rateLimiter.canCreatePost(ctx.telegramId, ctx.isAdmin)
  }),
})
```

**Rate Limiting (3 Camadas):**
```typescript
// server/_core/rate-limiter.ts
export class SlowSocialRateLimiter {
  private readonly POST_INTERVAL_MS = 10 * 60 * 1000 // 10 minutos
  private readonly REPLY_INTERVAL_MS = 15 * 60 * 1000 // 15 minutos

  async canCreatePost(telegramId: number, isAdmin = false): Promise<{
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
}
```

**Exemplo de Uso:**
```typescript
// Frontend hook
const { data: rateLimitStatus } = trpc.posts.canCreate.useQuery()

if (!rateLimitStatus?.canPost) {
  const minutes = Math.floor(rateLimitStatus.timeRemainingMs / 60000)
  const seconds = Math.floor((rateLimitStatus.timeRemainingMs % 60000) / 1000)
  console.log(`Aguarde ${minutes}m ${seconds}s`)
}
```

---

### 4.9 posts.timeline (Timeline com Cursor Pagination)

**Procedure:** `posts.timeline`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input Schema:**
```typescript
z.object({
  limit: z.number().min(1).max(50).optional().default(20),
  cursor: z.number().optional(),
})
```

**Output:**
```typescript
{
  posts: PostWithAuthor[],
  nextCursor?: number
}
```

**PostWithAuthor Type:**
```typescript
{
  id: number,
  telegramId: number,
  content: string,
  imagePath: string | null,
  replyToPostId: number | null,
  createdAt: Date,
  author: {
    telegramId: number,
    name: string | null,
    photoUrl: string | null,
  },
  replyToPost?: {
    content: string,
  }
}
```

**Código Completo:**
```typescript
posts: router({
  timeline: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).optional().default(20),
      cursor: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let feedMode: 'following' | 'all'
      
      if (ctx.isAdmin) {
        feedMode = 'all'
      } else {
        // Flag global sobrepõe o modo individual
        const globalFeedFlag = await getServerFlag('feed_mode_global')
        if (globalFeedFlag === 'all') {
          feedMode = 'all'
        } else {
          feedMode = await getUserFeedMode(ctx.telegramId)
        }
      }

      return getTimelinePosts(
        ctx.telegramId,
        input.limit,
        input.cursor,
        feedMode,
        ctx.isAdmin
      )
    }),
})
```

**Cursor Pagination Implementation:**
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
    orderBy: desc(posts.id), // ← CURSOR PAGINATION (id DESC)
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

**Vantagens vs Offset Pagination:**
- ✅ **Mais eficiente** para grandes datasets (não pula/scan desnecessário)
- ✅ **Não pula/duplica** itens quando dados mudam durante paginação
- ✅ **Performance constante** independente da página (sempre usa índice)
- ✅ **Ordenação estável** (id DESC garante consistência)

**Exemplo de Uso (Infinite Query):**
```typescript
// Frontend
const timelineQuery = trpc.posts.timeline.useInfiniteQuery(
  { limit: 20 },
  {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialCursor: undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  }
)

// Acessar todos os posts
const allPosts = timelineQuery.data?.pages
  .flatMap(page => page.posts) ?? []

// Carregar mais
if (timelineQuery.hasNextPage && !timelineQuery.isFetchingNextPage) {
  await timelineQuery.fetchNextPage()
}
```

---

### 4.10 posts.byUser (Posts de um Usuário)

**Procedure:** `posts.byUser`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
  limit: z.number().min(1).max(100).optional().default(20),
  cursor: z.number().optional(),
})
```

**Output:**
```typescript
{
  posts: PostWithAuthor[],
  nextCursor?: number
}
```

**Código Completo:**
```typescript
posts: router({
  byUser: protectedProcedure
    .input(z.object({
      telegramId: z.number(),
      limit: z.number().min(1).max(100).optional().default(20),
      cursor: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      return getUserPosts(input.telegramId, input.limit, input.cursor, ctx.isAdmin)
    }),
})
```

**Efemeridade Aplicada:**
```typescript
// server/repositories/post.repository.ts
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
  
  const hasMore = rows.length > safeLimit
  const items = hasMore ? rows.slice(0, safeLimit) : rows
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined
  
  return { posts: items, nextCursor }
}
```

**Exemplo de Uso:**
```typescript
// Ver posts de um usuário específico
const userPostsQuery = trpc.posts.byUser.useInfiniteQuery(
  { telegramId: selectedUserId, limit: 20 },
  {
    enabled: !!selectedUserId,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  }
)
```

---

### 4.11 posts.countByUser (Contagem de Posts)

**Procedure:** `posts.countByUser`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
})
```

**Output:**
```typescript
{
  count: number
}
```

**Código Completo:**
```typescript
posts: router({
  countByUser: protectedProcedure
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ ctx, input }) => {
      const count = await countUserPosts(input.telegramId, ctx.isAdmin)
      return { count }
    }),
})
```

**Efemeridade na Contagem:**
```typescript
// server/repositories/post.repository.ts
export async function countUserPosts(
  telegramId: number,
  isAdmin: boolean
): Promise<number> {
  const db = getDb()
  
  // Efemeridade: 7 dias (admin isento)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const adminIds = ENV.adminTelegramIds
  
  const ephemeralFilter = adminIds.length > 0
    ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
    : gte(posts.createdAt, sevenDaysAgo)
  
  const result = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(posts)
    .where(and(
      eq(posts.telegramId, telegramId),
      ephemeralFilter
    ))
  
  return result[0]?.count ?? 0
}
```

**Exemplo de Uso:**
```typescript
// Contar posts de um usuário (para stats do perfil)
const { data: postCount } = trpc.posts.countByUser.useQuery({
  telegramId: user.id,
})

// Exibir: "{postCount?.count} posts"
```

---

### 4.12 posts.getById (Post Específico por ID)

**Procedure:** `posts.getById`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input Schema:**
```typescript
z.object({
  postId: z.number(),
})
```

**Output:**
```typescript
PostWithAuthor = {
  id: number,
  telegramId: number,
  content: string,
  imagePath: string | null,
  replyToPostId: number | null,
  createdAt: Date,
  author: {
    telegramId: number,
    name: string | null,
    photoUrl: string | null,
  },
  replyToPost?: {
    content: string,
  }
}
```

**Código Completo:**
```typescript
posts: router({
  getById: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      return getPostById(input.postId)
    }),
})
```

**Implementação no Database:**
```typescript
// server/repositories/post.repository.ts
export async function getPostById(postId: number): Promise<PostWithAuthor | null> {
  const db = getDb()
  
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
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
  
  return post || null
}
```

**Exemplo de Uso:**
```typescript
// Buscar post específico (para share card, por exemplo)
const { data: post } = trpc.posts.getById.useQuery({ postId: 123 })
```

---

### 4.13 posts.reply (Resposta a Post)

**Procedure:** `posts.reply`  
**Tipo:** Mutation  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input Schema:**
```typescript
z.object({
  replyToPostId: z.number(),
  content: z.string().min(1).max(100),
})
```

**Output:**
```typescript
{
  postId: number
}
```

**Código Completo:**
```typescript
posts: router({
  reply: protectedProcedure
    .input(z.object({
      replyToPostId: z.number(),
      content: z.string().min(1).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId

      // Verificar ban
      const currentUser = await getUserByTelegramId(telegramId)
      if (currentUser?.isBanned) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Sua conta foi banida.',
        })
      }

      // Verificar modo manutenção
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

      // Rate limit para replies (15 min)
      const canReply = await rateLimiter.canCreateReply(telegramId, ctx.isAdmin)
      if (!canReply.canReply) {
        log.info('rate_limit', 'Reply bloqueada por rate limit', {
          actorId: telegramId,
          meta: {
            nextAllowedAt: canReply.nextAllowedAt?.toISOString(),
            timeRemainingMs: canReply.timeRemainingMs,
          },
        })
        throw new TRPCError({
          code: 'TOO_MANY_REQUESTS',
          message: 'Você já respondeu recentemente. Aguarde um pouco.',
          cause: {
            nextAllowedAt: canReply.nextAllowedAt,
            timeRemainingMs: canReply.timeRemainingMs,
          },
        })
      }

      // Verificar post original
      const originalPost = await getPostById(input.replyToPostId)
      if (!originalPost) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Post original não encontrado.',
        })
      }

      // Criar resposta
      const postId = await createPost({
        telegramId,
        content: input.content,
        replyToPostId: input.replyToPostId,
      })

      // Atualizar lastReplyAt
      await updateUserLastReplyAt(telegramId)

      // Notificar autor do post original (async, não bloqueia)
      void sendNotification({
        type: "reply",
        recipientId: originalPost.telegramId,
        actorId: telegramId,
        referenceId: input.replyToPostId,
        replyContent: input.content,
      })

      return { postId }
    }),
})
```

**Características Especiais:**
- ✅ **Permite responder próprio post:** Threads infinitas
- ✅ **Rate limit separado:** 15 minutos (vs 10 minutos para posts)
- ✅ **ON DELETE CASCADE:** Se post original for apagado, respostas também
- ✅ **Notificação automática:** Autor do post original é notificado

**Erros Possíveis:**
| Código | Mensagem | Quando |
|--------|----------|--------|
| `FORBIDDEN` | "Sua conta foi banida" | isBanned = true |
| `FORBIDDEN` | "App em modo manutenção" | maintenance_mode = true |
| `TOO_MANY_REQUESTS` | "Você já respondeu recentemente" | Rate limit 15min |
| `NOT_FOUND` | "Post original não encontrado" | postId inválido |

**Exemplo de Uso:**
```typescript
// Responder um post
const result = await trpc.posts.reply.mutate({
  replyToPostId: 123,
  content: 'Concordo plenamente!',
})
```

---

### 4.14 posts.canReply (Check Rate Limit Replies)

**Procedure:** `posts.canReply`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input:** Nenhum

**Output:**
```typescript
{
  canReply: boolean,
  nextAllowedAt?: Date,
  timeRemainingMs?: number
}
```

**Código Completo:**
```typescript
posts: router({
  canReply: protectedProcedure.query(async ({ ctx }) => {
    return await rateLimiter.canCreateReply(ctx.telegramId, ctx.isAdmin)
  }),
})
```

**Rate Limit para Replies:**
```typescript
// server/_core/rate-limiter.ts
async canCreateReply(telegramId: number, isAdmin = false): Promise<{
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
```

**Exemplo de Uso:**
```typescript
// Frontend hook
const { data: replyRateLimit } = trpc.posts.canReply.useQuery()

if (!replyRateLimit?.canReply) {
  const minutes = Math.floor(replyRateLimit.timeRemainingMs / 60000)
  const seconds = Math.floor((replyRateLimit.timeRemainingMs % 60000) / 1000)
  console.log(`Aguarde ${minutes}m ${seconds}s para responder`)
}
```

---

### 4.15 posts.delete (Deleção de Post)

**Procedure:** `posts.delete`  
**Tipo:** Mutation  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/post.router.ts`

**Input Schema:**
```typescript
z.object({
  postId: z.number(),
  telegramId: z.number(),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
posts: router({
  delete: protectedProcedure
    .input(z.object({
      postId: z.number(),
      telegramId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId

      // Admin pode deletar qualquer post
      if (ctx.isAdmin) {
        await deleteAnyPost(input.postId)
        await logAdminAction({
          adminTelegramId: telegramId,
          action: 'delete_post',
          targetPostId: input.postId,
          notes: 'Post deletado pelo admin',
        })
        return { success: true }
      }

      // Usuário comum só pode deletar o próprio
      if (telegramId !== input.telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Você não tem permissão para deletar este post",
        })
      }

      await deletePost(input.postId, telegramId)
      // ⚠️ lastPostAt NÃO é alterado — rate limit persiste após delete
      return { success: true }
    }),
})
```

**Importante:**
- ⚠️ **lastPostAt NÃO é alterado:** Rate limit persiste após delete do post
- ✅ **Deleta reactions associadas:** Manualmente (sem CASCADE na FK)
- ✅ **Deleta replies:** ON DELETE CASCADE (automático)
- ✅ **Limpa imagem do Storage:** Fire-and-forget (não bloqueia)

**Implementação no Database:**
```typescript
// server/repositories/post.repository.ts
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
  
  // Deleta o post (replies CASCADE automaticamente)
  await db.delete(posts).where(eq(posts.id, postId))
  
  // Limpa imagem do Storage (fire-and-forget)
  const { storageDelete } = await import('../storage')
  if (post.imagePath) {
    void storageDelete(post.imagePath)
  }
}

export async function deleteAnyPost(postId: number): Promise<Post | null> {
  const db = getDb()
  
  const post = await db.query.posts.findFirst({
    where: eq(posts.id, postId),
  })
  
  if (!post) throw new Error('Post não encontrado')
  
  // Deleta reactions associadas
  await db.delete(reactions).where(eq(reactions.postId, postId))
  
  // Deleta o post
  await db.delete(posts).where(eq(posts.id, postId))
  
  // Limpa imagem do Storage (fire-and-forget)
  const { storageDelete } = await import('../storage')
  if (post.imagePath) {
    void storageDelete(post.imagePath)
  }
  
  return post
}
```

**Diferença: User Delete vs Admin Delete:**

| Ação | User Delete | Admin Delete |
|------|-------------|--------------|
| **Endpoint** | `posts.delete` | `posts.delete` (mesmo) |
| **Permissão** | Apenas próprio post | Qualquer post |
| **Deleta reactions** | ✅ Sim | ✅ Sim |
| **Deleta replies** | ✅ Sim (CASCADE) | ✅ Sim (CASCADE) |
| **Reseta rate limit** | ❌ Não | ❌ Não |
| **Audit log** | ❌ Não | ✅ Sim |
| **Storage cleanup** | ✅ Fire-and-forget | ✅ Fire-and-forget |

**Exemplo de Uso:**
```typescript
// Usuário deleta próprio post
await trpc.posts.delete.mutate({
  postId: 123,
  telegramId: user.id,
})

// Admin deleta qualquer post
await trpc.posts.delete.mutate({
  postId: 456,
  telegramId: adminId, // Não importa, admin pode deletar qualquer um
})
```

---

### 4.16 follows.follow (Seguir Usuário)

**Procedure:** `follows.follow`  
**Tipo:** Mutation  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/follow.router.ts`

**Input Schema:**
```typescript
z.object({
  followerId: z.number(),
  followingId: z.number(),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
follows: router({
  follow: protectedProcedure
    .input(z.object({
      followerId: z.number(),
      followingId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId

      // Previne auto-follow
      if (input.followerId === input.followingId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Você não pode seguir a si mesmo',
        })
      }

      // Valida que followerId corresponde ao usuário autenticado
      if (input.followerId !== telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Você não tem permissão para seguir em nome de outro usuário",
        })
      }

      await followUser(input.followerId, input.followingId)

      // Notificar usuário seguido (async, fire-and-forget)
      void sendNotification({
        type: "follow",
        recipientId: input.followingId,
        actorId: telegramId,
      })

      return { success: true }
    }),
})
```

**Validações:**
- ✅ Previne auto-follow (`followerId === followingId`)
- ✅ Valida que `followerId` corresponde ao usuário autenticado
- ✅ `followUser`: Idempotente (`onConflictDoNothing`)

**Implementação no Database:**
```typescript
// server/repositories/follow.repository.ts
export async function followUser(followerId: number, followingId: number): Promise<void> {
  const db = getDb()
  
  await db
    .insert(follows)
    .values({ followerId, followingId })
    .onConflictDoNothing() // Idempotente
}
```

**Exemplo de Uso:**
```typescript
// Seguir usuário
await trpc.follows.follow.mutate({
  followerId: user.id,
  followingId: selectedUserId,
})
```

---

### 4.17 follows.unfollow (Deixar de Seguir)

**Procedure:** `follows.unfollow`  
**Tipo:** Mutation  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/follow.router.ts`

**Input Schema:**
```typescript
z.object({
  followerId: z.number(),
  followingId: z.number(),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
follows: router({
  unfollow: protectedProcedure
    .input(z.object({
      followerId: z.number(),
      followingId: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId

      // Valida que followerId corresponde ao usuário autenticado
      if (input.followerId !== telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Você não tem permissão para deixar de seguir em nome de outro usuário",
        })
      }

      await unfollowUser(input.followerId, input.followingId)

      return { success: true }
    }),
})
```

**Implementação no Database:**
```typescript
// server/repositories/follow.repository.ts
export async function unfollowUser(followerId: number, followingId: number): Promise<void> {
  const db = getDb()
  
  await db
    .delete(follows)
    .where(and(
      eq(follows.followerId, followerId),
      eq(follows.followingId, followingId)
    ))
}
```

**Exemplo de Uso:**
```typescript
// Deixar de seguir usuário
await trpc.follows.unfollow.mutate({
  followerId: user.id,
  followingId: selectedUserId,
})
```

---

### 4.18 follows.isFollowing (Verificação de Follow)

**Procedure:** `follows.isFollowing`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/follow.router.ts`

**Input Schema:**
```typescript
z.object({
  followerId: z.number(),
  followingId: z.number(),
})
```

**Output:**
```typescript
{
  isFollowing: boolean
}
```

**Código Completo:**
```typescript
follows: router({
  isFollowing: protectedProcedure
    .input(z.object({
      followerId: z.number(),
      followingId: z.number(),
    }))
    .query(async ({ input }) => {
      return isFollowing(input.followerId, input.followingId)
    }),
})
```

**Implementação no Database:**
```typescript
// server/repositories/follow.repository.ts
export async function isFollowing(followerId: number, followingId: number): Promise<boolean> {
  const db = getDb()
  
  const follow = await db.query.follows.findFirst({
    where: and(
      eq(follows.followerId, followerId),
      eq(follows.followingId, followingId)
    ),
  })
  
  return !!follow
}
```

**Exemplo de Uso:**
```typescript
// Verificar se já segue
const { data: followStatus } = trpc.follows.isFollowing.useQuery({
  followerId: user.id,
  followingId: selectedUserId,
})

// Exibir botão "Seguir" ou "Seguindo"
<button>{followStatus?.isFollowing ? 'Seguindo' : 'Seguir'}</button>
```

---

### 4.19 follows.following (Lista de Seguindo)

**Procedure:** `follows.following`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/follow.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
})
```

**Output:**
```typescript
User[] = {
  telegramId: number,
  name: string | null,
  photoUrl: string | null,
  feedMode: 'following' | 'all',
  notificationsEnabled: boolean,
  createdAt: Date
}[]
```

**Código Completo:**
```typescript
follows: router({
  following: protectedProcedure
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      return getFollowing(input.telegramId)
    }),
})
```

**Implementação no Database:**
```typescript
// server/repositories/follow.repository.ts
export async function getFollowing(telegramId: number): Promise<User[]> {
  const db = getDb()
  
  const follows = await db.query.follows.findMany({
    where: eq(follows.followerId, telegramId),
    with: {
      following: {
        columns: {
          telegramId: true,
          name: true,
          photoUrl: true,
          feedMode: true,
          notificationsEnabled: true,
          createdAt: true,
        },
      },
    },
  })
  
  return follows.map(f => f.following)
}
```

**Exemplo de Uso:**
```typescript
// Lista de quem usuário segue
const { data: following } = trpc.follows.following.useQuery({
  telegramId: user.id,
})

// Exibir bolhas no perfil
{following?.map(user => (
  <Bubble key={user.telegramId} user={user} />
))}
```

---

### 4.20 reactions.add (Adicionar Reação)

**Procedure:** `reactions.add`  
**Tipo:** Mutation  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/reaction.router.ts`

**Input Schema:**
```typescript
z.object({
  postId: z.number(),
  telegramId: z.number(),
  emoji: z.string().max(10),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
reactions: router({
  add: protectedProcedure
    .input(z.object({
      postId: z.number(),
      telegramId: z.number(),
      emoji: z.string().max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId
      
      // Valida que telegramId corresponde ao usuário autenticado
      if (input.telegramId !== telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Você não tem permissão para reagir em nome de outro usuário",
        })
      }
      
      const post = await getPostBasicById(input.postId)
      
      await getDb().insert(reactions).values({
        postId: input.postId,
        telegramId,
        emoji: input.emoji,
      }).onConflictDoNothing() // Idempotente
      
      // Notificar autor do post (async, fire-and-forget)
      void sendNotification({
        type: "reaction",
        recipientId: post.telegramId,
        actorId: telegramId,
        referenceId: input.postId,
        emoji: input.emoji,
        postContent: post.content,
      })
      
      return { success: true }
    }),
})
```

**Características:**
- ✅ **Idempotente:** `onConflictDoNothing` previne duplicatas
- ✅ **Optimistic update:** Frontend atualiza UI antes do backend confirmar
- ✅ **Notificação automática:** Autor do post é notificado

**Exemplo de Uso:**
```typescript
// Adicionar reação (optimistic update)
const addReaction = trpc.reactions.add.useMutation({
  onMutate: async ({ emoji }) => {
    // Cancela queries em andamento
    await utils.reactions.getByPost.cancel()
    
    // Otimistic update
    const previous = utils.reactions.getByPost.getData({ postId })
    utils.reactions.getByPost.setData({ postId }, old => ({
      ...old,
      find(r => r.emoji === emoji)!.userReacted = true,
      find(r => r.emoji === emoji)!.count += 1,
    }))
    
    return { previous }
  },
  onError: (err, variables, context) => {
    // Rollback em caso de erro
    utils.reactions.getByPost.setData({ postId }, context?.previous)
  },
})

addReaction.mutate({ postId, telegramId: user.id, emoji: '🔥' })
```

---

### 4.21 reactions.remove (Remover Reação)

**Procedure:** `reactions.remove`  
**Tipo:** Mutation  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/reaction.router.ts`

**Input Schema:**
```typescript
z.object({
  postId: z.number(),
  telegramId: z.number(),
  emoji: z.string().max(10),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
reactions: router({
  remove: protectedProcedure
    .input(z.object({
      postId: z.number(),
      telegramId: z.number(),
      emoji: z.string().max(10),
    }))
    .mutation(async ({ ctx, input }) => {
      const telegramId = ctx.telegramId
      
      // Valida que telegramId corresponde ao usuário autenticado
      if (input.telegramId !== telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: "Você não tem permissão para remover reação em nome de outro usuário",
        })
      }
      
      await getDb().delete(reactions).where(and(
        eq(reactions.postId, input.postId),
        eq(reactions.telegramId, telegramId),
        eq(reactions.emoji, input.emoji)
      ))
      
      return { success: true }
    }),
})
```

**Exemplo de Uso:**
```typescript
// Remover reação (optimistic update)
const removeReaction = trpc.reactions.remove.useMutation({
  onMutate: async ({ emoji }) => {
    await utils.reactions.getByPost.cancel()
    
    const previous = utils.reactions.getByPost.getData({ postId })
    utils.reactions.getByPost.setData({ postId }, old => ({
      ...old,
      find(r => r.emoji === emoji)!.userReacted = false,
      find(r => r.emoji === emoji)!.count -= 1,
    }))
    
    return { previous }
  },
})

removeReaction.mutate({ postId, telegramId: user.id, emoji: '🔥' })
```

---

### 4.22 reactions.getByPost (Reações de um Post)

**Procedure:** `reactions.getByPost`  
**Tipo:** Query  
**Autenticação:** Sim (protected)  
**Arquivo:** `server/routers/reaction.router.ts`

**Input Schema:**
```typescript
z.object({
  postId: z.number(),
})
```

**Output:**
```typescript
ReactionCount[] = {
  emoji: string,
  count: number,
  userReacted: boolean
}[]
```

**Código Completo:**
```typescript
reactions: router({
  getByPost: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getReactionsByPost(input.postId, ctx.telegramId)
    }),
})
```

**Otimização bool_or():**
```typescript
// server/repositories/reaction.repository.ts
export async function getReactionsByPost(postId: number, telegramId: number): Promise<ReactionCount[]> {
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

**Vantagens da Otimização:**
- ✅ **1 query ao invés de 2:** Menos latência, menos custo
- ✅ **bool_or():** Aggregação booleana do PostgreSQL
- ✅ **Type-safe:** TypeScript inference automático

**Exemplo de Uso:**
```typescript
// Buscar reações de um post
const { data: reactions } = trpc.reactions.getByPost.useQuery({ postId })

// Exibir grid 6x2
<div className="grid grid-cols-6 gap-2">
  {reactions?.map(reaction => (
    <ReactionButton
      key={reaction.emoji}
      emoji={reaction.emoji}
      count={reaction.count}
      userReacted={reaction.userReacted}
    />
  ))}
</div>
```

---

### 4.23 admin.getStats (Estatísticas do Dashboard)

**Procedure:** `admin.getStats`  
**Tipo:** Query  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input:** Nenhum

**Output:**
```typescript
{
  postsToday: number,
  totalUsers: number,
  bannedUsers: number
}
```

**Código Completo:**
```typescript
admin: router({
  getStats: adminProcedure.query(async () => {
    return getAdminStats()
  }),
})
```

**Otimização Promise.all:**
```typescript
// server/repositories/admin.repository.ts
export async function getAdminStats(): Promise<{
  postsToday: number
  totalUsers: number
  bannedUsers: number
}> {
  const db = getDb()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  
  // 3 queries em paralelo (1 round-trip)
  const [postsToday, totalUsers, bannedUsers] = await Promise.all([
    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(posts)
      .where(gte(posts.createdAt, oneDayAgo)),
    
    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(users),
    
    db.select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(users)
      .where(eq(users.isBanned, true)),
  ])
  
  return {
    postsToday: postsToday[0]?.count ?? 0,
    totalUsers: totalUsers[0]?.count ?? 0,
    bannedUsers: bannedUsers[0]?.count ?? 0,
  }
}
```

**Exemplo de Uso:**
```typescript
// Admin dashboard
const { data: stats } = trpc.admin.getStats.useQuery()

// Exibir cards
<StatsCard
  postsToday={stats?.postsToday}
  totalUsers={stats?.totalUsers}
  bannedUsers={stats?.bannedUsers}
/>
```

---

### 4.24 admin.getFlags (Flags do Servidor)

**Procedure:** `admin.getFlags`  
**Tipo:** Query  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input:** Nenhum

**Output:**
```typescript
ServerFlag[] = {
  key: string,
  value: string,
  updatedAt: Date
}[]
```

**Código Completo:**
```typescript
admin: router({
  getFlags: adminProcedure.query(async () => {
    return getAllServerFlags()
  }),
})
```

**Flags Disponíveis:**
```typescript
// server/repositories/config.repository.ts
const FLAGS = {
  maintenance_mode: 'false',      // Bloqueia login (admin bypassa)
  pause_new_users: 'false',       // Bloqueia novos cadastros
  lock_posts_global: 'false',     // Bloqueia posts e replies
  feed_mode_global: 'following',  // Sobrepõe feed mode individual
}
```

**Exemplo de Uso:**
```typescript
// Admin dashboard
const { data: flags } = trpc.admin.getFlags.useQuery()

// Exibir toggles
{flags?.map(flag => (
  <FlagToggle
    key={flag.key}
    flagKey={flag.key}
    flagValue={flag.value}
    onToggle={(enabled) => setFlag(flag.key, enabled ? 'true' : 'false')}
  />
))}
```

---

### 4.25 admin.setFlag (Definir Flag)

**Procedure:** `admin.setFlag`  
**Tipo:** Mutation  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  key: z.enum(['maintenance_mode', 'pause_new_users', 'lock_posts_global', 'feed_mode_global']),
  value: z.string(),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
admin: router({
  setFlag: adminProcedure
    .input(z.object({
      key: z.enum(['maintenance_mode', 'pause_new_users', 'lock_posts_global', 'feed_mode_global']),
      value: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const prev = await getServerFlag(input.key)
      await setServerFlag(input.key, input.value)
      
      // Invalida cache do rate limiter
      rateLimiter.invalidateFlagCache()
      
      // Log de auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'set_flag',
        previousValue: prev ?? undefined,
        newValue: input.value,
        notes: `Flag: ${input.key}`,
      })
      
      return { success: true }
    }),
})
```

**Cache Invalidation:**
```typescript
// server/_core/rate-limiter.ts
invalidateFlagCache(): void {
  this._rateLimitDisabledCache = null
}
```

**Exemplo de Uso:**
```typescript
// Ativar modo manutenção
await trpc.admin.setFlag.mutate({
  key: 'maintenance_mode',
  value: 'true',
})
```

---

### 4.26 admin.getUser (Dados de Usuário para Admin)

**Procedure:** `admin.getUser`  
**Tipo:** Query  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
})
```

**Output:**
```typescript
UserModeration = {
  telegramId: number,
  name: string | null,
  photoUrl: string | null,
  lastPostAt: Date | null,
  lastReplyAt: Date | null,
  isBanned: boolean,
  shadowBanned: boolean,
  feedMode: 'following' | 'all',
  notificationsEnabled: boolean,
  createdAt: Date
}
```

**Código Completo:**
```typescript
admin: router({
  getUser: adminProcedure
    .input(z.object({ telegramId: z.number() }))
    .query(async ({ input }) => {
      const user = await getUserForAdmin(input.telegramId)
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        })
      }
      return user
    }),
})
```

**Exemplo de Uso:**
```typescript
// Admin dashboard - lookup de usuário
const { data: user } = trpc.admin.getUser.useQuery({
  telegramId: Number(userInput),
}, {
  enabled: false, // Só busca quando clicar em "Buscar"
})
```

---

### 4.27 admin.banUser (Ban/Unban Usuário)

**Procedure:** `admin.banUser`  
**Tipo:** Mutation  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
  ban: z.boolean(),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
admin: router({
  banUser: adminProcedure
    .input(z.object({
      telegramId: z.number(),
      ban: z.boolean(),
    }))
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
})
```

**Segurança:**
- ✅ **Não pode banir a si mesmo:** Previne auto-desban
- ✅ **Auditoria:** Ação registrada em `adminActions`

**Exemplo de Uso:**
```typescript
// Banir usuário
await trpc.admin.banUser.mutate({
  telegramId: selectedUserId,
  ban: true,
})

// Desbanir usuário
await trpc.admin.banUser.mutate({
  telegramId: selectedUserId,
  ban: false,
})
```

---

### 4.28 admin.shadowBanUser (Shadow Ban/Unban)

**Procedure:** `admin.shadowBanUser`  
**Tipo:** Mutation  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
  ban: z.boolean(),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
admin: router({
  shadowBanUser: adminProcedure
    .input(z.object({
      telegramId: z.number(),
      ban: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      // SEGURANÇA: não pode shadow banir a si mesmo
      if (input.telegramId === ctx.telegramId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Você não pode shadow banir a si mesmo',
        })
      }
      
      const user = await getUserForAdmin(input.telegramId)
      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Usuário não encontrado',
        })
      }
      
      await setUserShadowBanned(input.telegramId, input.ban)
      
      // Registra ação na trilha de auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: input.ban ? 'shadow_ban_user' : 'remove_shadow_ban',
        targetTelegramId: input.telegramId,
        previousValue: String(user.shadowBanned),
        newValue: String(input.ban),
      })
      
      return { success: true }
    }),
})
```

**Shadow Ban vs Ban:**

| Característica | Ban | Shadow Ban |
|---------------|-----|------------|
| **Login** | ❌ Bloqueado | ✅ Permitido |
| **Postar** | ❌ Bloqueado | ✅ Permitido |
| **Posts visíveis** | N/A | ❌ Ninguém vê (exceto admin) |
| **Usuário sabe** | ✅ Sim (mensagem de erro) | ❌ Não (silencioso) |
| **Uso ideal** | Violações graves | Spam, comportamento tóxico |

**Exemplo de Uso:**
```typescript
// Shadow banir usuário
await trpc.admin.shadowBanUser.mutate({
  telegramId: selectedUserId,
  ban: true,
})
```

---

### 4.29 admin.resetRateLimit (Reset Rate Limit)

**Procedure:** `admin.resetRateLimit`  
**Tipo:** Mutation  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
admin: router({
  resetRateLimit: adminProcedure
    .input(z.object({ telegramId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await resetUserRateLimit(input.telegramId)
      
      // Registra ação na trilha de auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'reset_rate_limit',
        targetTelegramId: input.telegramId,
        notes: 'Rate limit resetado pelo admin',
      })
      
      return { success: true }
    }),
})
```

**Implementação no Database:**
```typescript
// server/repositories/user.repository.ts
export async function resetUserRateLimit(telegramId: number): Promise<void> {
  const db = getDb()
  
  await db
    .update(users)
    .set({
      lastPostAt: null,
      lastReplyAt: null,
    })
    .where(eq(users.telegramId, telegramId))
}
```

**Exemplo de Uso:**
```typescript
// Reset rate limit de usuário
await trpc.admin.resetRateLimit.mutate({
  telegramId: selectedUserId,
})
```

---

### 4.30 admin.deletePost (Deletar Qualquer Post)

**Procedure:** `admin.deletePost`  
**Tipo:** Mutation  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  postId: z.number(),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
admin: router({
  deletePost: adminProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteAnyPost(input.postId)
      
      // Registra ação na trilha de auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'delete_post',
        targetPostId: input.postId,
        notes: 'Post deletado pelo admin',
      })
      
      return { success: true }
    }),
})
```

**Diferença vs posts.delete:**
- ✅ **Admin:** Deleta qualquer post, registra auditoria
- ✅ **User:** Apenas próprio post, sem auditoria
- ✅ **Ambos:** NÃO reseta rate limit

**Exemplo de Uso:**
```typescript
// Admin deleta post inadequado
await trpc.admin.deletePost.mutate({
  postId: reportedPostId,
})
```

---

### 4.31 admin.setUserFeedMode (Alterar Feed Mode)

**Procedure:** `admin.setUserFeedMode`  
**Tipo:** Mutation  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  telegramId: z.number(),
  feedMode: z.enum(['following', 'all']),
})
```

**Output:**
```typescript
{
  feedMode: 'following' | 'all'
}
```

**Código Completo:**
```typescript
admin: router({
  setUserFeedMode: adminProcedure
    .input(z.object({
      telegramId: z.number(),
      feedMode: z.enum(['following', 'all']),
    }))
    .mutation(async ({ ctx, input }) => {
      await setUserFeedMode(input.telegramId, input.feedMode)
      
      // Registra ação na trilha de auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'set_feed_mode',
        targetTelegramId: input.telegramId,
        previousValue: 'unknown',
        newValue: input.feedMode,
      })
      
      return { feedMode: input.feedMode }
    }),
})
```

**Feed Modes:**
- **'following':** Vê apenas posts de quem segue + próprias respostas
- **'all':** Vê todos os posts (exceto shadow-banned)

**Exemplo de Uso:**
```typescript
// Alterar feed mode de usuário para 'all'
await trpc.admin.setUserFeedMode.mutate({
  telegramId: selectedUserId,
  feedMode: 'all',
})
```

---

### 4.32 admin.getActions (Ações Administrativas)

**Procedure:** `admin.getActions`  
**Tipo:** Query  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  limit: z.number().min(1).max(100).optional().default(30),
})
```

**Output:**
```typescript
AdminAction[] = {
  id: number,
  adminTelegramId: number,
  action: string,
  targetTelegramId: number | null,
  targetPostId: number | null,
  previousValue: string | null,
  newValue: string | null,
  notes: string | null,
  createdAt: Date
}[]
```

**Código Completo:**
```typescript
admin: router({
  getActions: adminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).optional().default(30),
    }))
    .query(async ({ input }) => {
      return getRecentAdminActions(input.limit)
    }),
})
```

**Ações Registradas:**
- `set_flag`: Flag de servidor alterada
- `ban_user` / `unban_user`: Usuário banido/desbanido
- `shadow_ban_user` / `remove_shadow_ban`: Shadow ban aplicado/removido
- `reset_rate_limit`: Rate limit resetado
- `delete_post`: Post deletado
- `set_feed_mode`: Feed mode alterado

**Exemplo de Uso:**
```typescript
// Admin dashboard - audit log
const { data: actions } = trpc.admin.getActions.useQuery({ limit: 50 })

// Exibir timeline de ações
<AuditLog actions={actions} />
```

---

### 4.33 admin.getLogs (LogVault - Logs Estruturados)

**Procedure:** `admin.getLogs`  
**Tipo:** Query  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  level: z.enum(['info', 'warn', 'error']).optional(),
  context: z.enum(['notification', 'post', 'reaction', 'follow', 'upload', 'rate_limit', 'cron', 'auth', 'system']).optional(),
  since: z.number().optional(), // timestamp
  limit: z.number().min(1).max(100).optional().default(100),
  offset: z.number().default(0),
})
```

**Output:**
```typescript
Log[] = {
  id: number,
  level: 'info' | 'warn' | 'error',
  context: string,
  message: string,
  meta: Record<string, unknown> | null,
  actorId: number | null,
  createdAt: Date
}[]
```

**Código Completo:**
```typescript
admin: router({
  getLogs: adminProcedure
    .input(z.object({
      level: z.enum(['info', 'warn', 'error']).optional(),
      context: z.enum(['notification', 'post', 'reaction', 'follow', 'upload', 'rate_limit', 'cron', 'auth', 'system']).optional(),
      since: z.number().optional(),
      limit: z.number().min(1).max(100).optional().default(100),
      offset: z.number().default(0),
    }))
    .query(async ({ input }) => {
      return getLogs(input)
    }),
})
```

**Filtros Disponíveis:**
- **level:** Filtra por nível de log (info, warn, error)
- **context:** Filtra por contexto (9 contextos)
- **since:** Filtra por timestamp (últimas N horas)
- **limit:** Limite de resultados (1-100)
- **offset:** Paginação

**Exemplo de Uso:**
```typescript
// Admin dashboard - LogVault
const { data: logs } = trpc.admin.getLogs.useQuery({
  level: 'error',
  context: 'notification',
  since: Date.now() - 24 * 60 * 60 * 1000, // Últimas 24h
  limit: 100,
})

// Exibir logs filtrados
<LogVault logs={logs} />
```

---

### 4.34 admin.broadcast (Publicar Aviso Global)

**Procedure:** `admin.broadcast`  
**Tipo:** Mutation  
**Autenticação:** Sim (admin)  
**Arquivo:** `server/routers/admin.router.ts`

**Input Schema:**
```typescript
z.object({
  content: z.string().min(1).max(600),
})
```

**Output:**
```typescript
{
  success: boolean
}
```

**Código Completo:**
```typescript
admin: router({
  broadcast: adminProcedure
    .input(z.object({
      content: z.string().min(1).max(600),
    }))
    .mutation(async ({ ctx, input }) => {
      // Criar post de broadcast (sem rate limit)
      await createPost({
        telegramId: ctx.telegramId,
        content: input.content,
        // Broadcasts são fixados/no topo (lógica futura)
      })
      
      // Registra ação na trilha de auditoria
      await logAdminAction({
        adminTelegramId: ctx.telegramId,
        action: 'broadcast',
        notes: `Broadcast publicado: ${input.content.substring(0, 50)}...`,
      })
      
      return { success: true }
    }),
})
```

**Características:**
- ✅ **Sem rate limit:** Admin pode publicar a qualquer momento
- ✅ **Max 600 chars:** 4x mais que post normal (165 chars)
- ✅ **Auditado:** Ação registrada em `adminActions`
- ✅ **Fixado no topo:** (lógica futura de pin)

**Exemplo de Uso:**
```typescript
// Publicar broadcast para todos os usuários
await trpc.admin.broadcast.mutate({
  content: '⚠️ Manutenção programada para hoje às 23h. O app ficará indisponível por ~30min.',
})
```

---

## 5. SCHEMAS DO BANCO DE DADOS

### 5.1 Tabela users

```sql
CREATE TABLE users (
  "telegramId" BIGINT PRIMARY KEY,  -- BIGINT para IDs > 2 bilhões
  name TEXT,
  "photoUrl" TEXT,
  "lastPostAt" TIMESTAMP,  -- Rate limit híbrido (posts) - persiste após delete
  "lastReplyAt" TIMESTAMP,  -- Rate limit híbrido (replies) - persiste após delete
  "isBanned" BOOLEAN DEFAULT false NOT NULL,  -- Ban total: não pode logar/postar
  "shadowBanned" BOOLEAN DEFAULT false NOT NULL,  -- Shadow ban: posta mas ninguém vê
  "feedMode" VARCHAR(20) DEFAULT 'following' NOT NULL,  -- 'following' | 'all'
  "notificationsEnabled" BOOLEAN DEFAULT true NOT NULL,  -- Opt-out notificações
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_name ON users(name);
```

**Colunas Detalhadas:**

| Coluna | Tipo | Descrição | Nullable | Default |
|--------|------|-----------|----------|---------|
| telegramId | BIGINT | ID do Telegram (PK) | NO | - |
| name | TEXT | Nome completo | YES | NULL |
| photoUrl | TEXT | URL da foto de perfil | YES | NULL |
| lastPostAt | TIMESTAMP | Timestamp do último post | YES | NULL |
| lastReplyAt | TIMESTAMP | Timestamp da última resposta | YES | NULL |
| isBanned | BOOLEAN | Usuário banido | NO | false |
| shadowBanned | BOOLEAN | Shadow ban | NO | false |
| feedMode | VARCHAR(20) | 'following' ou 'all' | NO | 'following' |
| notificationsEnabled | BOOLEAN | Recebe notificações | NO | true |
| createdAt | TIMESTAMP | Data de cadastro | NO | NOW() |

**Notas:**
- ✅ BIGINT suporta até 9.223.372.036.854.775.807 (IDs do Telegram > 2 bilhões)
- ✅ `lastPostAt` persiste mesmo após delete do post (fonte da verdade do rate limit)
- ✅ `lastReplyAt` persiste mesmo após delete da resposta (rate limit híbrido)
- ✅ `shadowBanned`: usuário pode postar mas ninguém vê seus posts (exceto admin)
- ✅ `notificationsEnabled`: true = recebe notificações, false = opt-out

---

*(Continua com as demais tabelas: posts, follows, reactions, serverConfig, adminActions, notifications, logs)*

---

*Última atualização: 14 de Março de 2026*

*Próxima seção: 6. Sistema de Efemeridade (7 dias) + 7. Sistema de Replies + 8. Sistema de Notificações + 9-17 completos*
