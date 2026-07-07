---
tags: [rate-limiting, security, hybrid, telegram]
created: 2026-03-07
updated: 2026-03-07
sources: [src/lib/rate-limit-cache.ts, server/repositories/user.repository.ts, server/repositories/post.repository.ts, src/hooks/use-post-rate-limit.ts]
rule_review: approved
absolute_rules: [RateLimiting3Camadas]
---

# Rate Limiting

Sistema híbrido de rate limiting em 3 camadas para posts e replies.

## 🎯 Regra Fundamental

**"O mais restritivo vence"** — Se qualquer camada bloquear, o usuário não pode postar.

---

## 📊 As 3 Camadas

### Camada 1: Frontend (CloudStorage + localStorage)

**Local:** `src/lib/rate-limit-cache.ts`

**Funcionamento:**
- Armazena timestamp do último post no **CloudStorage do Telegram** (sincronizado entre dispositivos)
- Fallback imediato para **localStorage** se CloudStorage falhar
- Verificação síncrona no frontend para UX responsiva

```typescript
// Chave usada
const RATE_LIMIT_KEY = '@deck/last-post-timestamp';

// Leitura (assíncrono com fallback)
export async function getRateLimitCache(): Promise<number | null> {
  const cloudStorage = window.Telegram?.WebApp?.CloudStorage;
  // Tenta CloudStorage primeiro, fallback para localStorage
}

// Escrita (fire-and-forget)
export async function setRateLimitCache(timestamp: number): Promise<void> {
  // Salva em CloudStorage + localStorage simultaneamente
}
```

**Vantagens:**
- Persiste entre dispositivos (CloudStorage)
- Resposta imediata (sem round-trip ao servidor)
- Funciona offline (localStorage fallback)

### Camada 2: Database (users.lastPostAt / users.lastReplyAt)

**Local:** `server/repositories/user.repository.ts`

**Funcionamento:**
- Timestamp persistido no banco de dados
- Separate limits para posts e replies
- Fonte da verdade definitiva (não pode ser burlado)

```typescript
// Atualiza lastPostAt após criar post
export async function updateUserLastPostAt(
  telegramId: number,
  timestamp: Date
): Promise<void> {
  await db.update(users).set({ lastPostAt: timestamp }).where(eq(users.telegramId, telegramId));
}

// Atualiza lastReplyAt após responder
export async function updateUserLastReplyAt(
  telegramId: number,
  timestamp: Date
): Promise<void> {
  await db.update(users).set({ lastReplyAt: timestamp }).where(eq(users.telegramId, telegramId));
}

// Reset (admin apenas)
export async function resetUserRateLimit(telegramId: number): Promise<void> {
  await db.update(users).set({ lastPostAt: null, lastReplyAt: null });
}
```

**Limites:**
- Posts: 1 por 3 minutos (180.000ms)
- Replies: 1 por 30 segundos (configurável)

### Camada 3: Contagem de Posts (janela deslizante)

**Local:** `server/repositories/post.repository.ts`

**Funcionamento:**
- Conta posts nas últimas X horas
- Previne spam mesmo com timestamps válidos
- Admin isento desta verificação

```typescript
// Exemplo: máximo 10 posts nas últimas 24 horas
const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
const postCount = await db
  .select({ count: count() })
  .from(posts)
  .where(and(
    eq(posts.telegramId, telegramId),
    gt(posts.createdAt, twentyFourHoursAgo),
    eq(users.shadowBanned, false) // shadow ban filter também aplicado
  ));
```

---

## 🔄 Fluxo Completo de Postagem

```
┌─────────────────────┐
│   Usuário clica     │
│   "Publicar"        │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Camada 1: Frontend │
│  CloudStorage check │
│  ✅ ou ❌           │
└──────────┬──────────┘
           │ ✅
┌──────────▼──────────┐
│  tRPC Mutation      │
│  (createPost)       │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│  Camada 2: DB Check │
│  users.lastPostAt   │
│  ✅ ou ❌           │
└──────────┬──────────┘
           │ ✅
┌──────────▼──────────┐
│  Camada 3: Count    │
│  posts nas últimas  │
│  X horas            │
│  ✅ ou ❌           │
└──────────┬──────────┘
           │ ✅
┌──────────▼──────────┐
│  INSERT post        │
│  UPDATE lastPostAt  │
│  CloudStorage async │
└─────────────────────┘
```

---

## ⏱️ Limites Atuais

| Ação | Limite | Janela | Camadas Aplicadas |
|------|--------|--------|-------------------|
| **Post normal** | 1 | 3 minutos | 1 + 2 + 3 |
| **Reply** | 1 | 30 segundos | 1 + 2 |
| **Admin post** | Ilimitado | N/A | Isento (apenas log) |

---

## 🛡️ Tratamento de Edge Cases

### Race Conditions

**Problema:** Dois requests simultâneos podem passar pela camada 1.

**Solução:** Camada 2 (DB) é a fonte da verdade. Mesmo que frontend permita, o servidor rejeita se `lastPostAt` estiver dentro da janela.

### CloudStorage Indisponível

**Cenário:** Telegram SDK não carrega ou CloudStorage falha.

**Fallback:**
1. Usa localStorage imediatamente
2. Continua funcionando normalmente
3. CloudStorage tenta salvar em background (fire-and-forget)

### Time Skew (Relógio do Cliente)

**Problema:** Usuário altera relógio do dispositivo.

**Solução:** Servidor usa seu próprio timestamp (`Date.now()`), nunca confia no cliente.

---

## 📁 Arquivos Relacionados

- [rate-limit-cache.ts](../../src/lib/rate-limit-cache.ts) — Camada 1 (CloudStorage)
- [user.repository.ts](../../server/repositories/user.repository.ts) — Camada 2 (lastPostAt/lastReplyAt)
- [post.repository.ts](../../server/repositories/post.repository.ts) — Camada 3 (contagem)
- [use-post-rate-limit.ts](../../src/hooks/use-post-rate-limit.ts) — Hook React com countdown

---

## 🔗 Links Relacionados

- [[Architecture]] — Visão geral da arquitetura
- [[ShadowBan]] — Filtro de shadow ban (aplicado em todas queries)
- [[Database]] — Schema das tabelas users e posts
- [[CodePatterns]] — Convenções de implementação

---

## ✅ Checklist de Implementação

Ao adicionar nova feature que cria conteúdo:

- [ ] Camada 1: CloudStorage check no frontend
- [ ] Camada 2: lastPostAt ou lastReplyAt no repository
- [ ] Camada 3: Contagem em janela deslizante (se aplicável)
- [ ] Regra "mais restritivo vence" aplicada
- [ ] Admin bypass quando apropriado
- [ ] Mensagens de erro claras para o usuário
- [ ] Countdown timer na UI (MainButton dinâmica)
