---
tags: [shadow-ban, security, filter, moderation]
created: 2026-03-07
updated: 2026-03-07
sources: [server/repositories/post.repository.ts, server/repositories/user.repository.ts, drizzle/schema.ts]
rule_review: approved
absolute_rules: [ShadowBan]
---

# Shadow Ban

Filtro de shadow ban aplicado em todas as queries de leitura de posts.

## 🎯 Definição

**Shadow ban** é um mecanismo de moderação onde:
- Usuário shadow banned **pode criar posts normalmente**
- Posts do usuário shadow banned **são invisíveis para todos** (exceto admin quando necessário)
- Usuário **não é notificado** sobre o shadow ban

## 🔍 Implementação no Schema

```typescript
// drizzle/schema.ts
export const users = pgTable("users", {
  // ...
  shadowBanned: boolean("shadowBanned").default(false).notNull(),
  // ...
}, (table) => ({
  // Índice otimizado para filtro shadow ban
  shadowBannedIdx: index("idx_users_shadowBanned").on(table.shadowBanned),
}));
```

## 📝 Filtro em Todas Queries de Leitura

### Post Repository — getTimelinePosts

```typescript
// server/repositories/post.repository.ts (linha 111)
const shadowBanFilter = eq(users.shadowBanned, false);

const query = db
  .select({...})
  .from(posts)
  .leftJoin(users, eq(posts.telegramId, users.telegramId))
  .where(and(shadowBanFilter, ...outros_filtros));
```

### Post Repository — getUserPosts

```typescript
// server/repositories/post.repository.ts (linha 398)
.where(eq(users.shadowBanned, false))
```

### Post Repository — search

```typescript
// server/repositories/post.repository.ts (linha 445)
.where(eq(users.shadowBanned, false))
```

### Thread (Respostas)

Todas as queries que buscam respostas também aplicam o filtro.

## 🛡️ Admin Bypass

Admin pode ver posts shadow banned quando necessário para moderação:

```typescript
const ephemeralFilter = adminIds.length > 0 && adminIds.includes(telegramId)
  ? undefined  // Admin vê tudo
  : and(gt(posts.createdAt, sevenDaysAgo), eq(users.shadowBanned, false));
```

## ⚠️ Pontos Críticos

### 1. NUNCA Esquecer o Filtro

**Obrigatório em:**
- ✅ `getTimelinePosts` — timeline principal
- ✅ `getUserPosts` — perfil de usuário
- ✅ `search` — busca de posts
- ✅ `thread` — respostas a posts
- ✅ `getReactions` — reações (se incluir dados do usuário)

**Verificação automática:** A skill `rule-enforcer` valida toda nova query.

### 2. Shadow Ban vs Is Banned

| Campo | Efeito |
|-------|--------|
| `shadowBanned` | Posts invisíveis, usuário ainda loga e posta |
| `isBanned` | Usuário não consegue logar nem acessar o app |

### 3. Reações e Metadados

Reações de usuários shadow banned também devem ser filtradas indiretamente, já que o post pai é invisível.

## 📁 Arquivos Relacionados

- [post.repository.ts](../../server/repositories/post.repository.ts) — Todas queries com filtro shadow ban
- [user.repository.ts](../../server/repositories/user.repository.ts) — CRUD de shadow ban
- [schema.ts](../../drizzle/schema.ts) — Definição do campo shadowBanned
- [admin.repository.ts](../../server/repositories/admin.repository.ts) — Ação administrativa de shadow ban

## 🔗 Links Relacionados

- [[Database]] — Schema completo
- [[Architecture]] — Visão geral da arquitetura
- [[CodePatterns]] — Convenções de implementação

## ✅ Checklist de Validação

Ao criar nova query de leitura:

- [ ] Filtro `eq(users.shadowBanned, false)` incluído
- [ ] Índice `idx_users_shadowBanned` será usado (se aplicável)
- [ ] Admin bypass implementado quando necessário
- [ ] Teste manual: criar usuário shadow banned → verificar posts invisíveis
- [ ] Rule-enforcer validou a implementação
