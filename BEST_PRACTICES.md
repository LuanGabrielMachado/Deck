# 📖 Boas Práticas de Desenvolvimento - Deck

Este documento descreve as boas práticas de desenvolvimento adotadas no projeto Deck. Siga estas diretrizes para manter a qualidade, consistência e sustentabilidade do código.

---

## 📋 Índice

1. [Princípios Fundamentais](#princípios-fundamentais)
2. [TypeScript & Type Safety](#typescript--type-safety)
3. [Arquitetura tRPC](#arquitetura-trpc)
4. [Drizzle ORM & Database](#drizzle-orm--database)
5. [React & Componentes](#react--componentes)
6. [Performance](#performance)
7. [Segurança](#segurança)
8. [Testes](#testes)
9. [Git & Versionamento](#git--versionamento)
10. [Documentação](#documentação)

---

## 🎯 Princípios Fundamentais

### Wiki-First Approach

**Regra de Ouro:** Sempre consulte a wiki antes de escrever código.

```markdown
1. Ler `docs/wiki/index.md`
2. Encontrar páginas relevantes
3. Usar wiki como fonte primária
4. Atualizar wiki após mudanças
```

### Regras Absolutas

Estas regras **NÃO PODEM** ser violadas:

| # | Regra | Por Quê |
|---|-------|---------|
| 1 | BIGINT para telegramIds | IDs do Telegram podem exceder 2 bilhões |
| 2 | Rate limiting 3 camadas | Prevenir abuso e sobrecarga do sistema |
| 3 | Shadow ban filter | Moderação transparente e eficaz |
| 4 | Posts efêmeros 7 dias | Filosofia do produto + redução de custos |
| 5 | Auditoria admin | Accountability e compliance |
| 6 | Glassmorphism | Identidade visual consistente |
| 7 | Page transitions | UX fluida e profissional |
| 8 | Type-safety tRPC | Prevenir bugs em produção |

---

## 🔷 TypeScript & Type Safety

### Use Tipos Estritos

```typescript
// ✅ CORRETO
interface CreatePostInput {
  content: string;
  imagePath?: string;
  videoUrl?: string;
}

// ❌ ERRADO
interface CreatePostInput {
  content: any; // Nunca use any!
  imagePath: any;
}
```

### Zod para Validação

```typescript
import { z } from 'zod';

// Schema de validação
const createPostSchema = z.object({
  content: z.string().min(1).max(165),
  imagePath: z.string().url().optional(),
  videoUrl: z.string().url().optional(),
});

// Inferir tipo
type CreatePostInput = z.infer<typeof createPostSchema>;
```

### Evite Type Assertions

```typescript
// ❌ ERRADO
const user = data as User;

// ✅ CORRETO
const user = validateUser(data); // Função que valida e retorna User tipado

// ✅ ACEITÁVEL (quando necessário)
const element = ref.current as HTMLDivElement; // Apenas quando você TEM certeza
```

---

## 🔌 Arquitetura tRPC

### Procedures Type-Safe

```typescript
// server/routers/post.router.ts

import { router, protectedProcedure } from '../trpc';
import { z } from 'zod';

export const postRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1).max(165),
        imagePath: z.string().optional(),
        videoUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Tipos inferidos automaticamente
      const post = await postRepository.create({
        content: input.content,
        imagePath: input.imagePath,
        videoUrl: input.videoUrl,
        telegramId: ctx.user.telegramId,
      });
      
      return post; // Tipo Post inferido
    }),
});
```

### Separação de Responsabilidades

```
server/
├── routers/          # Definição de procedures tRPC
├── repositories/     # Acesso ao banco de dados
└── utils/            # Funções utilitárias
```

```typescript
// ✅ CORRETO: Router delega para repository
// post.router.ts
async mutation({ input, ctx }) {
  return await postRepository.create(input, ctx.user);
}

// post.repository.ts
async create(input: CreatePostInput, user: User) {
  // Lógica de database aqui
}
```

---

## 🗄️ Drizzle ORM & Database

### BIGINT para Telegram IDs

```typescript
// drizzle/schema.ts

// ✅ CORRETO
export const users = pgTable("users", {
  telegramId: bigint("telegramId", { mode: "number" }).primaryKey(),
});

// ❌ ERRADO
export const users = pgTable("users", {
  telegramId: integer("telegramId"), // Overflow!
});
```

### Shadow Ban Filter

```typescript
// ✅ CORRETO: Sempre filtrar shadow banned em queries de leitura
const posts = await db
  .select()
  .from(posts)
  .leftJoin(users, eq(posts.telegramId, users.telegramId))
  .where(
    and(
      eq(users.shadowBanned, false), // Filtro obrigatório
      // ...outros filtros
    )
  );
```

### Cascade Delete

```typescript
// Configurar cascade para limpeza automática
export const posts = pgTable("posts", {
  id: uuid("id").primaryKey(),
  telegramId: bigint("telegramId", { mode: "number" })
    .notNull()
    .references(() => users.telegramId, { onDelete: 'cascade' }),
});
```

### Índices para Performance

```typescript
// Adicionar índices em colunas frequentemente consultadas
index: idx => ({
  telegramIdIdx: on(idx.telegramId),
  createdAtIdx: on(idx.createdAt),
  expiresAtIdx: on(idx.expiresAt),
}),
```

---

## ⚛️ React & Componentes

### Glassmorphism Obrigatório

```tsx
// ✅ CORRETO
<div className="glass-card backdrop-blur bg-white/10 border border-white/20">
  {/* conteúdo */}
</div>

// CSS (globals.css)
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
```

### Page Transitions com Framer Motion

```tsx
import { motion, AnimatePresence } from 'framer-motion';

function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

### Shared Element Transitions

```tsx
// Página de origem
<motion.div layoutId={`post-${postId}`}>
  {/* thumbnail */}
</motion.div>

// Página de destino
<motion.div layoutId={`post-${postId}`}>
  {/* conteúdo expandido */}
</motion.div>
```

### Hooks Customizados

```tsx
// src/hooks/use-auth.ts
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  
  return context;
}

// Uso
function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  // ...
}
```

### Componentes Pequenos e Focados

```tsx
// ✅ CORRETO: Componente focado em uma responsabilidade
function PostCard({ post }: { post: Post }) {
  return (
    <div className="glass-card">
      <PostHeader user={post.author} />
      <PostContent content={post.content} />
      <PostActions post={post} />
      <PostFooter post={post} />
    </div>
  );
}

// ❌ ERRADO: Componente monolítico
function PostCard({ post }) {
  // 200 linhas de código misturando lógica e UI
}
```

---

## ⚡ Performance

### Zero Rerenders Desnecessários

```tsx
// ✅ CORRETO: Memoização estratégica
const PostList = memo(function PostList({ posts }) {
  return posts.map(post => <PostCard key={post.id} post={post} />);
});

// ✅ CORRETO: useCallback para funções passadas como props
const handlePost = useCallback(async (content: string) => {
  await trpc.post.create.mutate({ content });
}, [trpc.post.create]);
```

### Lazy Loading

```tsx
// Carregar componentes pesados sob demanda
const PhysicsEngine = dynamic(() => import('../lib/physics'), {
  ssr: false,
  loading: () => <Skeleton />,
});
```

### Otimização de Imagens

```tsx
// Usar next/image para otimização automática
import Image from 'next/image';

<Image
  src={imageUrl}
  alt={alt}
  width={300}
  height={300}
  loading="lazy"
  quality={75}
/>
```

### Bundle Size

```bash
# Analisar bundle
pnpm analyze

# Manter bundle inicial < 300KB
# Code split por rota
```

---

## 🔒 Segurança

### Rate Limiting

```typescript
// 3 camadas de rate limiting

// 1. Frontend (CloudStorage)
if (lastPostTime < NOW - 10min) {
  throw new RateLimitError();
}

// 2. Database (users.lastPostAt)
await db.update(users)
  .set({ lastPostAt: now })
  .where(eq(users.telegramId, telegramId));

// 3. Database (count posts)
const count = await db.select({ count: count() })
  .from(posts)
  .where(and(
    eq(posts.telegramId, telegramId),
    gte(posts.createdAt, now - 1h)
  ));
  
if (count > MAX_PER_HOUR) {
  throw new RateLimitError();
}
```

### Validação de Input

```typescript
// Sempre validar inputs no backend
const schema = z.object({
  content: z.string().min(1).max(165),
  telegramId: z.number().int().positive(),
});

const validated = schema.parse(input); // Lança erro se inválido
```

### Sanitização

```typescript
// Escapar HTML para prevenir XSS
function sanitizeHtml(input: string): string {
  return input.replace(/[<>]/g, '');
}

// Validar URLs
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
```

### JWT HTTP-Only

```typescript
// Cookies HTTP-only para sessions
res.setHeader('Set-Cookie', serialize('session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7, // 7 dias
}));
```

---

## 🧪 Testes

### Escreva Testes Unitários

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('post.repository', () => {
  beforeEach(async () => {
    // Setup: limpar banco de testes
    await cleanupTestDb();
  });

  it('deve criar post com conteúdo válido', async () => {
    // Arrange
    const content = 'Thread do dia';
    const telegramId = 123456789n;

    // Act
    const post = await postRepository.create({
      content,
      telegramId,
    });

    // Assert
    expect(post).toBeDefined();
    expect(post.content).toBe(content);
    expect(post.expiresAt).toBeDefined();
  });

  it('deve filtrar posts de usuários shadow banned', async () => {
    // Arrange
    await createUser({ telegramId: 111n, shadowBanned: true });
    await createPost({ telegramId: 111n, content: 'Spam' });

    // Act
    const posts = await postRepository.getTimeline();

    // Assert
    expect(posts.length).toBe(0);
  });
});
```

### Cobertura Mínima

| Tipo de Código | Cobertura Mínima |
|----------------|------------------|
| Core logic | 100% |
| Repositories | 90% |
| Routers | 85% |
| Components | 80% |
| Utils | 95% |

### Testes de Integração

```typescript
describe('tRPC posts API', () => {
  it('deve criar post via tRPC', async () => {
    const { client, user } = await createTestClient();
    
    const post = await client.post.create.mutate({
      content: 'Test post',
    });
    
    expect(post.content).toBe('Test post');
  });
});
```

---

## 📦 Git & Versionamento

### Commit Messages (Conventional Commits)

```
feat: adicionar sistema de menções @usuario
fix: corrigir overflow de telegramId para BIGINT
docs: atualizar wiki com padrões de rate limiting
chore: atualizar dependências do pacote
test: adicionar testes para post.repository
perf: otimizar queries de timeline
refactor: extrair lógica de validação para utils
style: corrigir formatação Tailwind
ci: configurar GitHub Actions
build: ajustar configuração Webpack
```

### Branch Naming

```bash
# Features
feature/mencoes-usuario
feature/exportacao-lgpd

# Bug fixes
fix/overflow-telegram-id
fix/shadow-ban-filter

# Documentation
docs/atualizar-wiki-rate-limit
docs/adicionar-exemplos

# Refactoring
refactor/extrair-repository-pattern
```

### Pull Requests

**Tamanho Ideal:** < 400 linhas de código mudadas

**Checklist de PR:**

- [ ] Wiki consultada e atualizada
- [ ] Regras absolutas respeitadas
- [ ] Testes escritos e passando
- [ ] Lint e type-check passando
- [ ] Documentação atualizada
- [ ] Descrição clara das mudanças
- [ ] Screenshots (se aplicável)

---

## 📚 Documentação

### Wiki-First

Sempre atualize a wiki após mudanças significativas:

```markdown
## [2026-03-16] update | Adicionar documentação de rate limiting

**Tipo:** update

### Descrição
Adicionada página [[RateLimiting]] com detalhes das 3 camadas.

### Fontes
- `server/repositories/post.repository.ts`
- `src/lib/rate-limit-cache.ts`

### O que mudou
| Antes | Depois |
|-------|--------|
| Sem docs | Wiki completa |

### Revisão de Regras Absolutas
- [x] Rate limiting 3 camadas verificado
```

### Comentários no Código

```typescript
/**
 * Cria um novo post com rate limiting e auditoria.
 * 
 * @param content - Conteúdo do post (máx 165 chars)
 * @param telegramId - ID do usuário no Telegram
 * @returns Post criado com metadata
 * 
 * @throws RateLimitError - Se usuário excedeu limite
 * @throws ValidationError - Se conteúdo inválido
 */
async function createPost(content: string, telegramId: number): Promise<Post> {
  // Implementação
}
```

### README.md

Mantenha o README atualizado com:

- Badge de status
- Descrição clara do projeto
- Stack tecnológico
- Funcionalidades principais
- Instruções de setup
- Links para documentação

---

## 🎨 Estilo de Código

### Prettier & ESLint

```bash
# Formatar código
pnpm prettier --write .

# Lint
pnpm lint

# Verificar tipos
pnpm type-check
```

### Tailwind CSS

```tsx
// ✅ CORRETO: Ordenar classes
className="flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"

// Usar clsx/tailwind-merge para classes condicionais
import { cn } from '@/lib/utils';

className={cn(
  'base-classes',
  isActive && 'active-classes',
  className
)}
```

---

## 📊 Métricas de Qualidade

### Code Review Checklist

- [ ] Segue princípios SOLID?
- [ ] DRY (Don't Repeat Yourself)?
- [ ] KISS (Keep It Simple, Stupid)?
- [ ] YAGNI (You Ain't Gonna Need It)?
- [ ] Testes adequados?
- [ ] Documentação atualizada?
- [ ] Performance considerada?
- [ ] Segurança verificada?

### Débito Técnico

Evite:

- TODOs sem issue relacionada
- Código comentado (delete ou explique)
- Console.log em produção
- Variáveis não utilizadas
- Imports desnecessários

---

## 🔗 Recursos

### Documentação Oficial

- [Next.js](https://nextjs.org/docs)
- [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org/docs)
- [tRPC](https://trpc.io/docs)
- [Drizzle ORM](https://orm.drizzle.team/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)

### Wiki do Projeto

- [[Architecture]](docs/wiki/Architecture.md)
- [[CodePatterns]](docs/wiki/CodePatterns.md)
- [[Database]](docs/wiki/Database.md)
- [[RateLimiting]](docs/wiki/RateLimiting.md)
- [[Ephemerality]](docs/wiki/Ephemerality.md)
- [[ShadowBan]](docs/wiki/ShadowBan.md)

---

**Versão:** 1.0.0  
**Última Atualização:** Março 2026
