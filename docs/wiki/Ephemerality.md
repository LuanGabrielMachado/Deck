---
tags: [ephemerality, cleanup, cron, posts]
created: 2026-03-07
updated: 2026-03-07
sources: [server/repositories/post.repository.ts, drizzle/schema.ts]
rule_review: approved
absolute_rules: [Ephemerality7Dias]
---

# Ephemerality

Regra de posts efêmeros: conteúdo expira após 7 dias.

## 🎯 Definição

**Efemeridade** é uma regra fundamental do Deck onde:
- Posts normais expiram automaticamente após **7 dias**
- Posts de **admin são isentos** (não expiram)
- Reações são removidas automaticamente via `ON DELETE CASCADE`
- Imagens são limpas do storage (fire-and-forget)

## ⏱️ Implementação da Limpeza

### Função cleanupExpiredPosts

```typescript
// server/repositories/post.repository.ts (linha 344)
export async function cleanupExpiredPosts(): Promise<number> {
  const db = getDb();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const adminIds = ENV.adminTelegramIds;

  // Filtro: posts antigos E não-admin
  const notAdminFilter = adminIds.length > 0
    ? not(inArray(posts.telegramId, adminIds))
    : undefined;

  // Busca posts expirados
  const expiredPosts = await db
    .select({ id: posts.id, imagePath: posts.imagePath })
    .from(posts)
    .where(and(lt(posts.createdAt, sevenDaysAgo), notAdminFilter));

  if (expiredPosts.length === 0) return 0;

  const expiredIds = expiredPosts.map(p => p.id);

  // CASCADE remove reactions automaticamente
  await db.delete(posts).where(inArray(posts.id, expiredIds));

  // Limpa imagens do storage (fire-and-forget)
  for (const post of expiredPosts) {
    if (post.imagePath) {
      void storageDelete(post.imagePath);
    }
  }

  return expiredIds.length;
}
```

## 🔄 Execução via Cron

A função `cleanupExpiredPosts()` deve ser executada periodicamente via cron job.

**Sugestão:** A cada 6 horas ou diariamente.

```typescript
// Exemplo de cron (implementação depende do deploy)
import { cleanupExpiredPosts } from './post.repository';

// Roda a cada 6 horas
cron.schedule('0 */6 * * *', async () => {
  const deleted = await cleanupExpiredPosts();
  console.log(`Cleanup: ${deleted} posts expirados removidos`);
});
```

## 📊 Filtro em Queries de Leitura

Além do cleanup cron, todas as queries de leitura aplicam filtro de efemeridade:

```typescript
// server/repositories/post.repository.ts (linha 103)
// Efemeridade: 7 dias (admin isento)
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const ephemeralFilter = adminIds.length > 0 && adminIds.includes(telegramId)
  ? undefined  // Admin vê tudo, inclusive posts expirados
  : gt(posts.createdAt, sevenDaysAgo);

// Aplica na query
.where(and(ephemeralFilter, ...outros_filtros))
```

## ⚠️ Pontos Críticos

### 1. Admin Isento

Admins podem ver posts expirados para fins de moderação e auditoria.

```typescript
const ephemeralFilter = adminIds.includes(telegramId)
  ? undefined  // Admin bypass
  : gt(posts.createdAt, sevenDaysAgo);
```

### 2. ON DELETE CASCADE

Reações são removidas automaticamente quando o post pai é deletado:

```typescript
// drizzle/schema.ts
export const reactions = pgTable("reactions", {
  postId: integer("postId")
    .notNull()
    .references(() => posts.id, { onDelete: "cascade" }),
  // ...
});
```

### 3. Cleanup de Imagens

Imagens associadas a posts expirados são removidas do storage de forma assíncrona (fire-and-forget):

```typescript
for (const post of expiredPosts) {
  if (post.imagePath) {
    void storageDelete(post.imagePath);  // Não aguarda
  }
}
```

## 📁 Arquivos Relacionados

- [post.repository.ts](../../server/repositories/post.repository.ts) — Função cleanupExpiredPosts e filtros
- [schema.ts](../../drizzle/schema.ts) — Definição das tabelas posts e reactions (CASCADE)
- [storage.ts](../../src/lib/storage.ts) — Função storageDelete para limpeza de imagens

## 🔗 Links Relacionados

- [[Database]] — Schema completo com relacionamentos
- [[Architecture]] — Visão geral da arquitetura
- [[ShadowBan]] — Filtro aplicado junto com efemeridade
- [[CodePatterns]] — Convenções de implementação

## ✅ Checklist de Validação

Ao modificar queries de posts:

- [ ] Filtro de efemeridade (`gt(posts.createdAt, sevenDaysAgo)`) incluído
- [ ] Admin bypass implementado quando necessário
- [ ] Shadow ban filter também aplicado (ambos os filtros)
- [ ] Reações usam ON DELETE CASCADE
- [ ] Cleanup de imagens é fire-and-forget
- [ ] Rule-enforcer validou a implementação

## 🧪 Testes Manuais

1. Criar post normal → verificar aparece na timeline
2. Aguardar 7 dias (ou mockar data) → executar cleanupExpiredPosts()
3. Verificar post foi removido
4. Verificar reações foram removidas (CASCADE)
5. Criar post como admin → verificar não expira após 7 dias
