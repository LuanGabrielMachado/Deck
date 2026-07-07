---
tags: [database, schema, drizzle, postgresql]
created: 2026-03-07
updated: 2026-03-07
sources: [drizzle/schema.ts, drizzle/relations.ts, server/repositories/]
rule_review: approved
absolute_rules: [BIGINT, ShadowBan, Ephemerality7Dias, AuditoriaAdmin]
---

# Database

Schema do banco de dados PostgreSQL usando Drizzle ORM.

## 📊 Tabelas Principais

### users

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `telegramId` | BIGINT (mode: number) | **PK** — ID do Telegram (obrigatório BIGINT) |
| `name` | TEXT | Nome do usuário |
| `photoUrl` | TEXT | URL da foto de perfil |
| `lastPostAt` | TIMESTAMP | Timestamp do último post (rate limit camada 2) |
| `lastReplyAt` | TIMESTAMP | Timestamp da última resposta (rate limit separado) |
| `isBanned` | BOOLEAN | Usuário banido não pode logar nem criar posts |
| `shadowBanned` | BOOLEAN | Shadow ban: posts visíveis apenas para o autor |
| `feedMode` | VARCHAR(20) | 'following' ou 'all' |
| `notificationsEnabled` | BOOLEAN | Recebe notificações via bot |
| `createdAt` | TIMESTAMP | Data de criação |

**Índices:**
- `idx_users_name` — busca por nome
- `idx_users_shadowBanned` — filtro shadow ban nas queries de timeline

### posts

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | **PK** |
| `telegramId` | BIGINT (mode: number) | **FK** → users.telegramId |
| `content` | TEXT | Conteúdo do post (165 chars normal, 999 admin) |
| `imagePath` | TEXT | Caminho da imagem no storage (opcional) |
| `replyToPostId` | INTEGER | **FK** → posts.id (ON DELETE CASCADE) |
| `mentionedUsers` | TEXT | JSON snapshot de usuários mencionados |
| `createdAt` | TIMESTAMP | Data de criação |

**Índices:**
- `idx_posts_telegramId` — busca por autor
- `idx_posts_createdAt` — ordenação cronológica
- `idx_posts_replyToPostId` — respostas
- `idx_posts_telegramId_createdAt` — timeline por autor
- `idx_posts_createdAt_telegramId` — efemeridade + autor

### follows

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `followerId` | BIGINT (mode: number) | **PK, FK** → users.telegramId |
| `followingId` | BIGINT (mode: number) | **PK, FK** → users.telegramId |
| `createdAt` | TIMESTAMP | Data do follow |

**Índices:**
- `idx_follows_followerId` — quem usuário segue
- `idx_follows_followingId` — seguidores do usuário

### reactions

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `postId` | INTEGER | **PK, FK** → posts.id (ON DELETE CASCADE) |
| `telegramId` | BIGINT (mode: number) | **PK, FK** → users.telegramId |
| `emoji` | VARCHAR(10) | Emoji ou sticker ID do Telegram |
| `createdAt` | TIMESTAMP | Data da reação |

**Índices:**
- `idx_reactions_postId` — reações de um post
- `idx_reactions_telegramId` — reações de um usuário

---

## 🔒 Tabelas de Segurança e Moderação

### adminActions

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | **PK** |
| `adminTelegramId` | BIGINT (mode: number) | ID do admin que executou a ação |
| `actionType` | VARCHAR(50) | Tipo de ação (ban, shadowBan, unban, etc.) |
| `targetTelegramId` | BIGINT (mode: number) | Alvo da ação (opcional) |
| `targetPostId` | INTEGER | Post alvo (opcional) |
| `reason` | TEXT | Motivo da ação |
| `metadata` | TEXT | JSON com dados adicionais |
| `createdAt` | TIMESTAMP | Data da ação |

**Regra absoluta:** Toda ação administrativa DEVE registrar nesta tabela.

### blocks

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `blockerId` | BIGINT (mode: number) | **PK, FK** → users.telegramId |
| `blockedId` | BIGINT (mode: number) | **PK, FK** → users.telegramId |
| `createdAt` | TIMESTAMP | Data do bloqueio |

**Efeito:** Bidirecional — nenhum vê posts do outro no feed.

### ghostings

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `ghosterId` | BIGINT (mode: number) | **PK, FK** → users.telegramId |
| `ghostedId` | BIGINT (mode: number) | **PK, FK** → users.telegramId |
| `expiresAt` | TIMESTAMP | Expiração do ghosting (48h) |
| `createdAt` | TIMESTAMP | Data do ghosting |

**Efeito:** Unidirecional temporário — ghostedId não vê posts de ghosterId por 48h.

---

## 📬 Tabelas de Sistema

### notifications

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | **PK** |
| `type` | VARCHAR(50) | Tipo (like, reply, follow, mention, broadcast) |
| `recipientId` | BIGINT (mode: number) | Destinatário |
| `actorId` | BIGINT (mode: number) | Quem gerou a notificação |
| `referenceId` | INTEGER | Post ou entidade relacionada |
| `status` | VARCHAR(20) | pending | sent | failed | read |
| `retryCount` | INTEGER | Tentativas de envio |
| `payload` | TEXT | JSON com dados da notificação |
| `createdAt` | TIMESTAMP | Data de criação |
| `sentAt` | TIMESTAMP | Data de envio |

**Índices de deduplicação:**
- `idx_notifications_dedup` — evita notificações duplicadas
- `idx_notifications_status_retry` — otimiza retry queue

### logs (LogVault)

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | SERIAL | **PK** |
| `level` | VARCHAR(10) | info | warn | error |
| `context` | VARCHAR(50) | Domínio do evento |
| `message` | TEXT | Mensagem do log |
| `meta` | TEXT | JSON com dados estruturados |
| `actorId` | BIGINT (mode: number) | Usuário relacionado (opcional) |
| `createdAt` | TIMESTAMP | Data do log |

**Contextos:** notification, post, reaction, follow, upload, rate_limit, cron, auth, system

### serverConfig

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `key` | VARCHAR(100) | **PK** — chave da configuração |
| `value` | TEXT | Valor da configuração |
| `updatedAt` | TIMESTAMP | Última atualização |

---

## 🔗 Relacionamentos (drizzle/relations.ts)

```typescript
// users ↔ posts (um para muitos)
usersToPosts: oneToMany(users, posts)

// users ↔ follows (muitos para muitos auto-relacionado)
usersToFollowers: oneToMany(users, follows)
usersToFollowing: oneToMany(users, follows)

// users ↔ reactions (um para muitos)
usersToReactions: oneToMany(users, reactions)

// posts ↔ reactions (um para muitos)
postsToReactions: oneToMany(posts, reactions)

// posts ↔ replies (auto-relacionamento)
postsToReplies: oneToMany(posts, posts)
```

---

## 🎯 Regras de Negócio Implementadas no Schema

### BIGINT para telegramIds

**Obrigatório em todas as tabelas:**
```typescript
bigint("telegramId", { mode: "number" })
```

**Nunca usar:**
- `integer("telegramId")` ❌
- `number` TypeScript sem BIGINT no schema ❌

### Shadow Ban Filter

Todas as queries de leitura devem incluir:
```typescript
eq(users.shadowBanned, false)
```

**Exceção:** Admin pode ver posts shadow banned quando necessário.

### Efemeridade (7 dias)

Posts expiram após 7 dias, exceto admin:
```typescript
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
const notAdminFilter = not(inArray(posts.telegramId, adminIds));
```

**Função de cleanup:** `cleanupExpiredPosts()` no post.repository.ts

### Auditoria Admin

Toda ação administrativa registra em `adminActions`:
```typescript
await db.insert(adminActions).values({
  adminTelegramId,
  actionType,
  targetTelegramId,
  reason,
  metadata: JSON.stringify(extra),
});
```

---

## 📁 Arquivos Relacionados

- [schema.ts](../../drizzle/schema.ts) — Definição completa das tabelas
- [relations.ts](../../drizzle/relations.ts) — Relacionamentos Drizzle
- [post.repository.ts](../../server/repositories/post.repository.ts) — Queries com shadow ban e efemeridade
- [user.repository.ts](../../server/repositories/user.repository.ts) — Rate limiting e shadow ban
- [admin.repository.ts](../../server/repositories/admin.repository.ts) — Auditoria de ações

---

## 🔗 Links Relacionados

- [[Architecture]] — Visão geral da arquitetura tRPC + Drizzle
- [[RateLimiting]] — Sistema de rate limiting híbrido (3 camadas)
- [[ShadowBan]] — Filtro de shadow ban detalhado
- [[Ephemerality]] — Regra de posts efêmeros (7 dias)
- [[CodePatterns]] — Convenções de nomenclatura e tipos
