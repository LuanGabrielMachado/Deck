---
tags: [architecture, overview, trpc, drizzle]
created: 2026-03-07
updated: 2026-03-07
sources: [server/routers/, server/repositories/, drizzle/schema.ts, src/lib/trpc.tsx]
rule_review: approved
absolute_rules: [BIGINT, TypeSafety]
---

# Architecture

Visão geral da arquitetura do Deck.

## 📐 Stack Tecnológico

| Camada | Tecnologia | Descrição |
|--------|------------|-----------|
| **Frontend** | Next.js 15 + React 19 | SSR, App Router, Server Components |
| **Linguagem** | TypeScript | Type-safety end-to-end |
| **API** | tRPC 11 | RPC type-safe sem code generation |
| **ORM** | Drizzle ORM | Queries type-safe com inferência de tipos |
| **Database** | PostgreSQL (Supabase) | Banco relacional |
| **UI** | TailwindCSS + Framer Motion | Glassmorphism + page transitions |
| **Platform** | Telegram WebApp SDK | Mini App nativo no Telegram |
| **Testing** | Vitest | Testes unitários e de integração |

---

## 🏗️ Arquitetura tRPC

### Estrutura de Routers

```
server/
├── routers/
│   ├── index.ts          # App router (combina todos os routers)
│   ├── post.router.ts    # Procedures de posts (create, getTimeline, search, etc.)
│   ├── user.router.ts    # Procedures de usuários (profile, settings, etc.)
│   ├── admin.router.ts   # Procedures administrativas (ban, shadowBan, broadcast)
│   ├── follow.router.ts  # Procedures de follow/unfollow
│   └── reaction.router.ts # Procedures de reações com emojis
```

### Fluxo de Dados

1. **Client (React)** → Chama procedure tRPC via hook (`useQuery`, `useMutation`)
2. **tRPC Router** → Valida input com Zod schema
3. **Repository** → Executa query/mutation no banco via Drizzle ORM
4. **Database** → PostgreSQL retorna dados
5. **Response** → Tipos inferidos automaticamente (type-safe)

---

## 📦 Repositórios (Drizzle ORM)

### Estrutura

```
server/repositories/
├── index.ts              # Exporta todos os repositórios
├── post.repository.ts    # CRUD de posts + timeline + search
├── user.repository.ts    # CRUD de usuários + rate limit + shadow ban
├── admin.repository.ts   # Ações administrativas
├── follow.repository.ts  # Relacionamentos follow/unfollow
├── reaction.repository.ts # Reações em posts
├── notification.repository.ts # Fila de notificações
└── log.repository.ts     # LogVault (logging estruturado)
```

### Padrão Repository

Cada repository exporta funções tipadas que:
- Usam schema Drizzle para type-safety
- Aplicam shadow ban filter em queries de leitura
- Respeitam rate limiting (3 camadas)
- Registram auditoria quando necessário

Exemplo:
```typescript
// De post.repository.ts
const shadowBanFilter = eq(users.shadowBanned, false);
```

---

## 🎭 Frontend (Next.js + React)

### Estrutura de Páginas

```
src/app/
├── layout.tsx            # Root layout com providers
├── page.tsx              # Home (timeline)
├── create/page.tsx       # Criar post
├── profile/page.tsx      # Perfil do usuário
├── follow/page.tsx       # Lista de seguindo/seguidores
├── user/[id]/page.tsx    # Perfil de outro usuário
└── admin/                # Dashboard administrativo
```

### Componentes Principais

```
src/components/
├── post-card.tsx         # Card de post completo
├── post-card-reactions.tsx # Reações com haptic feedback
├── swipeable-feed.tsx    # Feed com swipe gesture
├── floating-tab-bar.tsx  # Navegação inferior
├── biometric-gate.tsx    # Lock biométrico
└── ui/                   # Componentes básicos (button, input, etc.)
```

### Hooks Customizados

```
src/hooks/
├── use-auth.ts           # Autenticação via Telegram initData
├── use-biometric-lock.ts # BiometricManager do Telegram
├── use-post-rate-limit.ts # Rate limiting frontend
├── use-profile-data.ts   # Dados do perfil
└── use-swipe-gesture.ts  # Swipe detection
```

---

## 🔀 Fluxo de Autenticação

1. **Telegram WebApp** → Envia `initData` assinado
2. **Frontend** → Extrai `initDataUnsafe.user` (telegramId, nome, photo)
3. **tRPC Context** → Valida `initData` com bot token
4. **User Repository** → Busca ou cria usuário no banco
5. **Session** → Usuário autenticado disponível em todas procedures

---

## 📊 Diagrama de Camadas

```
┌─────────────────────────────────────┐
│        Telegram WebApp SDK          │
│  MainButton, HapticFeedback, etc.   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Frontend (Next.js)          │
│   React 19 + TypeScript + tRPC      │
└─────────────────┬───────────────────┘
                  │ tRPC calls
┌─────────────────▼───────────────────┐
│         Backend (tRPC)              │
│   Routers + Zod Validation          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Repositories (Drizzle)        │
│   Shadow Ban Filter + Rate Limit    │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│       Database (PostgreSQL)         │
│   Supabase + Row Level Security     │
└─────────────────────────────────────┘
```

---

## 🔗 Links Relacionados

- [[Database]] — Schema detalhado e migrations
- [[CodePatterns]] — Convenções e padrões de código
- [[RateLimiting]] — Sistema de rate limiting híbrido
- [[ShadowBan]] — Filtro de shadow ban
- [[Components]] — Componentes React e hooks
