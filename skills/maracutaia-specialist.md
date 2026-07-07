---
name: deck-specialist
description: Especialista em Deck — decisões de design, arquitetura, convenções, padrões, e todo conhecimento necessário sobre o projeto para melhor uso da estrutura. Fonte primária: wiki-first.
requires_review: true
knowledge_domains: [Architecture, Database, CodePatterns, RateLimiting, Ephemerality, ShadowBan, TelegramIntegration, Components, Testing]
---

# Deck Specialist

## 🎯 PROPÓSITO DA SKILL

Esta skill é o **especialista geral do projeto Deck**. Contém conhecimento completo sobre:

1. **Arquitetura** — tRPC + Drizzle ORM + Next.js 15
2. **Design Patterns** — SOLID, DI, Repository Pattern
3. **Convenções** — BIGINT, glassmorphism, page transitions, type-safety
4. **Regras de Negócio** — rate limiting, efemeridade, shadow ban
5. **Telegram Integration** — WebApp SDK, recursos nativos
6. **UI/UX** — física de partículas, animações 60fps, haptic feedback

**Quando usar:**
- Tomar decisões arquiteturais
- Avaliar trade-offs de implementação
- Entender contexto completo do projeto
- Revisar código com visão sistêmica
- Planejar novas features

**Quando NÃO usar:**
- Para escrever código → use `code-contributor`
- Para revisão arquitetural específica → use `code-architecture`
- Para validação de regras absolutas → use `rule-enforcer`
- Para gerenciamento wiki → use `wiki-workflow`

---

## 📚 FONTES DE CONHECIMENTO (PRIORIDADE OBRIGATÓRIA)

### Hierarquia de Fontes

| Nível | Fonte | Prioridade | Descrição |
|-------|--------|----------|-------------|
| 1 | `docs/wiki/index.md` | **Mais alta** | Visão geral de arquitetura, padrões, componentes |
| 2 | `docs/wiki/*.md` | **Alta** | Páginas específicas (RateLimiting, Ephemerality, etc.) |
| 3 | `docs/00-*.md` a `docs/10-*.md` | **Média** | Documentação técnica detalhada |
| 4 | Código do projeto | **Secundária** | Apenas se wiki não tiver informação necessária |

### Wiki = Visão Geral, Código = Detalhes

**Regra absoluta:** Wiki contém visão geral e links para arquivos. Detalhes de implementação estão no código.

| Wiki contém | Código contém |
|---------------|---------------|
| Quais componentes existem | Implementação de cada método |
| Padrões e convenções | Exemplos de uso específicos |
| Visão geral de dependências | Assinaturas de interface |
| Regras de negócio | Implementação específica |
| Links para arquivos | Detalhes de algoritmos |

---

## 🏗️ ARQUITETURA DO PROJETO

### Stack Tecnológico

| Camada | Tecnologia | Versão | Propósito |
|--------|------------|--------|-----------|
| **Framework Web** | Next.js | 15.1.0 | App Router, SSR, Server Components |
| **Biblioteca UI** | React | 19.0.0 | Actions, use() hook, SSR |
| **Linguagem** | TypeScript | 5.9.3 | Type-safety end-to-end |
| **Estilização** | Tailwind CSS | 3.4.17 | Glassmorphism, utilities |
| **API** | tRPC | 11.0.0 | RPC type-safe sem codegen |
| **Estado** | TanStack Query | 5.90.0 | Cache, infinite queries |
| **ORM** | Drizzle ORM | 0.44.0 | Queries type-safe |
| **Banco** | PostgreSQL | 15+ (Supabase) | RDBMS confiável |
| **Animações** | Framer Motion | 11.11.0 | Animações 60fps |
| **Platform** | Telegram WebApp SDK | - | Mini App nativo |

### Estrutura de Pastas

```
/workspace/
├── drizzle/              # Schema e migrations
│   ├── schema.ts         # BIGINT definido em todas tabelas
│   ├── relations.ts      # Relacionamentos entre tabelas
│   └── meta/             # Migration metadata
├── server/               # Backend tRPC
│   ├── routers/          # tRPC routers (post, user, admin, follow, reaction)
│   ├── repositories/     # Drizzle repositories com shadow ban filter
│   ├── bot/              # Telegram Bot API
│   └── lib/              # Utils server-side
├── src/                  # Frontend Next.js
│   ├── app/              # App Router pages
│   ├── components/       # React components (glassmorphism)
│   ├── hooks/            # Custom hooks (usePageBackground, etc.)
│   ├── constants/        # Imagens, theme, rate-limit-phrases
│   └── lib/              # Utils client-side (telegram-utils, etc.)
├── docs/                 # Documentação
│   └── wiki/             # Wiki-first knowledge
├── skills/               # AI skills (esta pasta)
└── .qwen/skills/         # Skills originais (backup)
```

### Fluxo de Dados

```
┌─────────────────────────────────────┐
│        Telegram WebApp SDK          │
│  MainButton, HapticFeedback, etc.   │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│         Frontend (Next.js)          │
│   React 19 + TypeScript + tRPC      │
│   + Framer Motion + TailwindCSS     │
└─────────────────┬───────────────────┘
                  │ tRPC calls (type-safe)
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

## 🔒 REGRAS ABSOLUTAS DO PROJETO

### 1. BIGINT para telegramIds

**Regra:** Todas as colunas `telegramId` devem usar BIGINT.

**Por Que:** IDs do Telegram podem exceder 2 bilhões (limite do integer).

**Implementação:**
```typescript
// drizzle/schema.ts
export const users = pgTable("users", {
  telegramId: bigint("telegramId", { mode: "number" }).primaryKey(),
});
```

### 2. Rate Limiting 3 Camadas

**Regra:** Posts e replies usam 3 camadas de rate limiting.

**Camadas:**
1. **Frontend CloudStorage** — Camada 1 (sincronizado entre dispositivos)
2. **DB users.lastPostAt** — Camada 2 (timestamp último post)
3. **DB posts count** — Camada 3 (contagem posts nas últimas X horas)

**Regra:** "Mais restritivo vence" — se qualquer camada bloquear, bloqueia.

### 3. Shadow Ban Filter

**Regra:** Todas queries de leitura filtram `users.shadowBanned = false`.

**Exceção:** Admin vê posts shadow banned (bypass quando apropriado).

**Implementação:**
```typescript
const shadowBanFilter = eq(users.shadowBanned, false);

// Em todas queries de leitura
.select().where(and(...conditions, shadowBanFilter));
```

### 4. Efemeridade 7 Dias

**Regra:** Posts expiram em 7 dias. Admin isento.

**Implementação:**
- **Cron job:** `cleanupExpiredPosts()` roda 2x/dia (3h UTC)
- **Admin bypass:** Posts de admin não expiram

### 5. Auditoria Admin

**Regra:** Toda ação no dashboard registra em `adminActions`.

**Log inclui:** adminId, action, targetId, previousValue, newValue, timestamp

### 6. Glassmorphism

**Regra:** Componentes UI usam glassmorphism.

**Classes Tailwind obrigatórias:**
```typescript
className="glass-card backdrop-blur bg-white/10 border-white/20"
```

### 7. Page Transitions

**Regra:** Navegação entre páginas usa Framer Motion.

**Padrão:**
```typescript
<AnimatePresence mode="popLayout">
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
</AnimatePresence>
```

### 8. Type-Safety tRPC

**Regra:** Manter type-safety end-to-end.

**Obrigatório:**
- ✅ Zod schemas para inputs
- ✅ Tipos inferidos do Drizzle
- ✅ Sem `as any` ou type casting inseguro

---

## 🎨 SISTEMA DE DESIGN

### Background Carrossel (Louvre Mechanics)

**Característica única do Deck:** As imagens de fundo alternam entre obras de arte clássicas, inspiradas no acervo do Louvre.

**Mecânica:**
- **Sorteio por navegação:** Cada vez que o usuário navega para uma página, uma imagem é sorteada aleatoriamente
- **Pré-carregamento:** Imagens não selecionadas são pré-carregadas em background para troca instantânea na próxima visita
- **Zero custo de CPU:** Troca ocorre apenas na montagem do componente (remontagem = nova imagem)
- **Cache persistente:** Browser cache + headers `immutable` garantem carregamento rápido após primeira visita

**Implementação:**
```typescript
// src/hooks/use-page-background.ts
export function usePageBackground(page: PageBackgroundKey): string {
  const images = PAGE_BACKGROUNDS[page];

  // Sorteia UMA vez por montagem — estável durante a visita
  const chosen = useMemo(() => {
    const idx = Math.floor(Math.random() * images.length);
    return images[idx];
  }, []);

  // Pré-carrega as demais em background (fire-and-forget)
  useEffect(() => {
    images.forEach((src) => {
      if (src === chosen) return;
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return chosen;
}
```

**Configuração de Imagens:**
```typescript
// src/constants/images.ts
export const PAGE_BACKGROUNDS = {
  seguir: [
    `/images/seguir/seguir-1.jpg?v5`,  // Obra clássica 1
    `/images/seguir/seguir-2.jpg?v5`,  // Obra clássica 2
    // ... até 10 obras diferentes
  ],
  perfil: [
    `/images/perfil/perfil-1.jpg?v5`,  // Obra clássica 1
    `/images/perfil/perfil-2.jpg?v5`,  // Obra clássica 2
    // ... até 10 obras diferentes
  ],
  post: [
    `/images/post/post-1.jpg?v5`,  // Obra clássica 1
    `/images/post/post-2.jpg?v5`,  // Obra clássica 2
    // ... até 10 obras diferentes
  ],
};
```

**Como Adicionar Novas Imagens:**
1. Coloque arquivo em `/public/images/<pasta>/`
2. Nomeie em sequência: `seguir-11.jpg`, `perfil-11.jpg`, etc.
3. Adicione caminho no array correspondente em `images.ts`
4. Incremente `IMAGE_VERSION` se quiser forçar recarregamento global

**Filosofia de Design:**
- ✅ **Alma artística:** Cada navegação revela uma nova obra clássica
- ✅ **Surpresa e encantamento:** Usuário nunca sabe qual obra verá
- ✅ **Performance:** Troca instantânea, sem loading
- ✅ **Identidade visual:** Deck = arte + tecnologia

### Física de Partículas

**Característica única:** Emojis de reações usam física newtoniana real.

**Implementação:**
- **Sequência de Halton:** Distribuição quasi-aleatória uniforme
- **Colisão elástica:** Partículas colidem e transferem energia
- **Repulsão:** Partículas próximas se repelem
- **Bounce:** Partículas quicam nas bordas
- **Damping:** Atrito constante (0.994 por frame)
- **Thermal noise:** Movimento perpétuo (injeta força suave quando parado)
- **Zero re-renders:** Escrita direta no DOM via refs

**Ver:** `src/hooks/use-physics-particles.ts`

### Haptic Feedback por Emoji

**Cada emoji tem padrão de vibração único:**
```typescript
const REACTION_VIBRATION: Record<string, number | number[]> = {
  '💀': 400,           // Vibração longa (morte)
  '😂': [80, 60, 80],  // Risada (3 pulsos)
  '😱': [200, 100, 200], // Shock (2 pulsos fortes)
  '❤️': [60, 40, 60],  // Amor (batimento cardíaco)
  '🔥': [40, 30, 40, 30, 40], // Fogo (5 pulsos rápidos)
  '👍': 60,            // Curto e simples
};
```

### Glassmorphism System

**Classes obrigatórias:**
```typescript
bg-white/10        // Background branco 10% opacity
backdrop-blur-sm   // Blur de fundo (10px)
border-white/20    // Border branco 20% opacity
saturate-200       // Saturação 200%
```

**CSS Class:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}
```

---

## 🔧 COMPONENTES E HOOKS PRINCIPAIS

### Componentes Principais

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| PostCard | `src/components/post-card.tsx` | Card completo com header, conteúdo, ações |
| PostCardReactions | `src/components/post-card-reactions.tsx` | Reações com física de partículas |
| SwipeableFeed | `src/components/swipeable-feed.tsx` | Feed com swipe gesture |
| FloatingTabBar | `src/components/floating-tab-bar.tsx` | Navegação inferior flutuante |
| BiometricGate | `src/components/biometric-gate.tsx` | Lock biométrico (Face ID, Touch ID) |
| PageTransition | `src/components/page-transition.tsx` | Wrapper para transições de página |
| AssetPreloader | `src/components/asset-preloader.tsx` | Pré-carrega imagens e vídeos |

### Hooks Customizados

| Hook | Arquivo | Descrição |
|------|---------|-----------|
| useAuth | `src/hooks/use-auth.ts` | Autenticação via Telegram initData |
| useBiometricLock | `src/hooks/use-biometric-lock.ts` | BiometricManager do Telegram |
| usePostRateLimit | `src/hooks/use-post-rate-limit.ts` | Rate limiting frontend |
| usePageBackground | `src/hooks/use-page-background.ts` | Background aleatório (carrossel) |
| useSwipeGesture | `src/hooks/use-swipe-gesture.ts` | Detecção de swipe |
| usePhysicsParticles | `src/hooks/use-physics-particles.ts` | Física de partículas para emojis |
| useWakeLock | `src/hooks/use-wake-lock.ts` | Previne tela de apagar |
| useThreadStack | `src/hooks/use-thread-stack.ts` | Navegação em threads de replies |

---

## 📊 DATABASE SCHEMA

### Tabelas Principais

| Tabela | Descrição | Colunas Chave |
|--------|-----------|---------------|
| users | Usuários do Telegram | telegramId (BIGINT), shadowBanned, lastPostAt |
| posts | Posts efêmeros | id, telegramId (BIGINT), content, createdAt |
| reactions | Reações em posts | postId, emoji, telegramId (BIGINT) |
| follows | Relacionamentos | followerId, followedId (BIGINT) |
| notifications | Fila de notificações | userId, type, payload, retryCount |
| adminActions | Log de auditoria admin | adminId, action, targetId, previousValue, newValue |

**Ver:** `drizzle/schema.ts`, `docs/wiki/Database.md`

---

## 🤖 TELEGRAM INTEGRATION

### Recursos Nativos Utilizados

| Recurso | Uso no Projeto |
|---------|----------------|
| **MainButton** | Publicação dinâmica (texto, progresso, disable) |
| **BackButton** | Navegação voltada ao topo |
| **HapticFeedback** | Vibração por emoji, clicks, selections |
| **CloudStorage** | Rate limiting camada 1 (sincronizado) |
| **BiometricManager** | Lock biométrico (Face ID, Touch ID) |
| **themeParams** | Cores dinâmicas (dark/light mode) |
| **showPopup** | Confirmações, alerts nativos |
| **switchInlineQuery** | Convite a amigos via inline query |
| **initData** | Autenticação HMAC-SHA256 |

**Ver:** `skills/telegram-integration.md`, `docs/05-TECNOLOGIAS.md`

---

## ✅ CHECKLIST DE REVISÃO

Ao revisar código ou tomar decisões:

- [ ] Wiki consultada primeiro (`docs/wiki/index.md`)
- [ ] BIGINT usado para todos telegramIds
- [ ] Shadow ban filter em queries de leitura
- [ ] Rate limiting 3 camadas implementado (se aplicável)
- [ ] Efemeridade aplicada (posts expiram em 7 dias)
- [ ] Auditoria admin registrada (se ação administrativa)
- [ ] Glassmorphism aplicado em componentes UI
- [ ] Page transitions com Framer Motion
- [ ] Type-safety mantido (sem `as any`)
- [ ] Background carrossel respeitado (usePageBackground)
- [ ] Física de partículas preservada (emojis)
- [ ] Haptic feedback apropriado

---

## 🔗 LINKS RELACIONADOS

- [[Architecture]] — Arquitetura detalhada
- [[Database]] — Schema completo
- [[CodePatterns]] — Convenções e padrões
- [[RateLimiting]] — Sistema de rate limiting
- [[Ephemerality]] — Posts efêmeros
- [[ShadowBan]] — Filtro shadow ban
- [[TelegramIntegration]] — Integração Telegram
- [[Components]] — Componentes e hooks

---

*Especialista Deck — Conhecimento completo do projeto para melhores decisões de design e arquitetura.*
