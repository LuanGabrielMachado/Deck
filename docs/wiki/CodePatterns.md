---
tags: [patterns, conventions, bigint, glassmorphism, typescript]
created: 2026-03-07
updated: 2026-03-07
sources: [drizzle/schema.ts, src/components/, server/repositories/, src/lib/]
rule_review: approved
absolute_rules: [BIGINT, Glassmorphism, PageTransitions, TypeSafety]
---

# Code Patterns

Convenções e padrões de código do Deck.

## 🔢 BIGINT para telegramIds

**Regra absoluta:** Todas as colunas `telegramId` devem usar BIGINT.

### ✅ Correto

```typescript
// drizzle/schema.ts
export const users = pgTable("users", {
  telegramId: bigint("telegramId", { mode: "number" }).primaryKey(),
});

export const posts = pgTable("posts", {
  telegramId: bigint("telegramId", { mode: "number" })
    .notNull()
    .references(() => users.telegramId),
});
```

### ❌ Errado

```typescript
// NUNCA fazer isso
export const users = pgTable("users", {
  telegramId: integer("telegramId"),  // ❌ IDs do Telegram podem ser > 2 bilhões
});
```

### Por Que BIGINT?

IDs do Telegram podem exceder 2 bilhões (limite do integer). Usar BIGINT previne:
- Colisão de IDs
- Erros de overflow
- Perda de dados

---

## 🎨 Glassmorphism

**Regra absoluta:** Componentes UI devem usar glassmorphism.

### Padrão Visual

```typescript
// Classes Tailwind obrigatórias
className="glass-card backdrop-blur bg-white/10"
```

### Exemplo: Post Card

```tsx
// src/components/post-card.tsx (linha 333)
<div className={cn(
  'mb-2.5 flex flex-col rounded-3xl p-2.5 glass-card transition-shadow duration-300 ease-out',
  // ...outras classes
)}>
  {/* conteúdo */}
</div>
```

### CSS Glass Card (globals.css)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
```

---

## 🔄 Page Transitions

**Regra absoluta:** Navegação entre páginas usa Framer Motion.

### Padrão com AnimatePresence

```tsx
// src/app/follow/page.tsx (linha 4)
import { motion, AnimatePresence } from 'framer-motion';

// Uso típico
<AnimatePresence>
  {items.map((item) => (
    <motion.div
      key={item.id}
      layoutId={`card-${item.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* conteúdo */}
    </motion.div>
  ))}
</AnimatePresence>
```

### layoutId para Shared Element Transitions

```tsx
// Elemento na página de origem
<motion.div layoutId={`post-${postId}`}>
  {/* thumbnail */}
</motion.div>

// Mesmo layoutId na página de destino
<motion.div layoutId={`post-${postId}`}>
  {/* conteúdo expandido */}
</motion.div>
```

---

## 🔒 Type-Safety tRPC

**Regra absoluta:** Manter type-safety end-to-end.

### ✅ Correto

```typescript
// Server: Zod schema + tipos inferidos
import { z } from 'zod';

const createPostSchema = z.object({
  content: z.string().min(1).max(165),
  imagePath: z.string().optional(),
});

export const postRouter = router({
  create: protectedProcedure
    .input(createPostSchema)
    .mutation(async ({ input, ctx }) => {
      // Tipos inferidos automaticamente
      const post = await createPost(input.content, ctx.user.telegramId);
      return post; // Tipo Post inferido
    }),
});

// Client: Hook com tipos inferidos
const { mutate } = trpc.post.create.useMutation();
// input é type-safe, response é type-safe
```

### ❌ Errado

```typescript
// NUNCA fazer isso
const result = await trpc.post.create.mutate({
  content: 'test',
} as any);  // ❌ Perde type-safety
```

---

## 📝 Convenções de Nomenclatura

### Arquivos

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Components | kebab-case.tsx | `post-card.tsx` |
| Hooks | use-*.ts | `use-auth.ts` |
| Utils | camelCase.ts | `telegram-utils.ts` |
| Routers | *.router.ts | `post.router.ts` |
| Repositories | *.repository.ts | `post.repository.ts` |

### Variáveis e Funções

```typescript
// CamelCase para variáveis e funções
const telegramId = 123456789;
async function createUser() { }

// PascalCase para tipos e componentes
type CreateUserInput = { ... };
function PostCard() { }

// CONSTANT_CASE para constantes
const RATE_LIMIT_KEY = '@deck/last-post-timestamp';
const MAX_POST_LENGTH = 165;
```

---

## 🧩 Estrutura de Pastas

```
/workspace/
├── drizzle/              # Schema e migrations
│   ├── schema.ts
│   ├── relations.ts
│   └── meta/
├── server/               # Backend tRPC
│   ├── routers/          # tRPC routers
│   ├── repositories/     # Drizzle repositories
│   └── utils/
├── src/                  # Frontend Next.js
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities
├── docs/                 # Documentação
│   └── wiki/             # Wiki-first knowledge
└── .qwen/skills/         # AI skills
```

---

## 📁 Arquivos Relacionados

- [schema.ts](../../drizzle/schema.ts) — BIGINT definido em todas tabelas
- [post-card.tsx](../../src/components/post-card.tsx) — Glassmorphism example
- [follow/page.tsx](../../src/app/follow/page.tsx) — AnimatePresence example
- [post.repository.ts](../../server/repositories/post.repository.ts) — Type-safe queries
- [rate-limit-cache.ts](../../src/lib/rate-limit-cache.ts) — Constantes e convenções

## 🔗 Links Relacionados

- [[Architecture]] — Visão geral da arquitetura
- [[Database]] — Schema completo
- [[RateLimiting]] — Implementação de rate limiting
- [[ShadowBan]] — Filtro shadow ban

## ✅ Checklist de Revisão de Código

Ao revisar PR:

- [ ] BIGINT usado para todos telegramIds
- [ ] Glassmorphism aplicado em novos componentes UI
- [ ] Page transitions com Framer Motion em novas páginas
- [ ] Type-safety mantido (sem `as any`)
- [ ] Convenções de nomenclatura seguidas
- [ ] Shadow ban filter em queries de leitura
- [ ] Efemeridade aplicada quando necessário
- [ ] Rate limiting implementado (3 camadas se aplicável)
