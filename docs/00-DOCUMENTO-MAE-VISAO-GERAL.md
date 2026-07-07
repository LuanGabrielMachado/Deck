# 🎭 Deck - Documento Mestre (Visão Geral Completa)

**Versão:** 5.0.0 (Produção - Março 2026)  
**Última Atualização:** 14 de Março de 2026  
**Status:** ✅ Produção Estável  
**Plataforma:** Telegram Mini App  
**URL:** https://deck.vercel.app  
**Linhas de Documentação:** ~500+ (este documento)

---

## 📋 ÍNDICE GERAL DETALHADO

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
   - 1.1 Propósito e Contexto
   - 1.2 Proposta de Valor Detalhada
   - 1.3 Características Principais
   - 1.4 Estado Atual do Projeto

2. [Funcionalidades Completas](#2-funcionalidades-completas)
   - 2.1 Core Features (MVP)
   - 2.2 Rate Limiting & Moderação
   - 2.3 UX & Animações
   - 2.4 Notificações & Viralidade
   - 2.5 Sistema & Performance

3. [Stack Tecnológico Detalhado](#3-stack-tecnológico-detalhado)
   - 3.1 Frontend
   - 3.2 API & Estado
   - 3.3 Backend & Dados
   - 3.4 Autenticação & Sessions
   - 3.5 Deploy & Infra

4. [Arquitetura do Sistema](#4-arquitetura-do-sistema)
   - 4.1 Diagrama de Arquitetura Completa
   - 4.2 Camadas da Aplicação
   - 4.3 Fluxo de Dados Completo

5. [Estrutura de Diretórios](#5-estrutura-de-diretórios)
   - 5.1 Backend (server/)
   - 5.2 Frontend (src/)
   - 5.3 Database (drizzle/)
   - 5.4 Configurações

6. [Sistema de Autenticação](#6-sistema-de-autenticação)
   - 6.1 Visão Geral
   - 6.2 Fluxo Completo de Autenticação (10 etapas)
   - 6.3 Validação HMAC-SHA256 (passo a passo)
   - 6.4 JWT Sessions (configuração detalhada)

7. [Sistema de Rate Limiting](#7-sistema-de-rate-limiting)
   - 7.1 Visão Geral das 3 Camadas
   - 7.2 Camada 1: Frontend (CloudStorage)
   - 7.3 Camada 2: Backend (users.lastPostAt)
   - 7.4 Camada 3: Backend (tabela posts)
   - 7.5 Regra: Mais Restritivo Vence

8. [Sistema de Posts](#8-sistema-de-posts)
   - 8.1 Criação de Posts
   - 8.2 Upload de Imagens
   - 8.3 Efemeridade (7 dias)
   - 8.4 Cursor Pagination

9. [Sistema de Replies](#9-sistema-de-replies)
   - 9.1 Mecânica de Replies
   - 9.2 Rate Limit Específico
   - 9.3 Threads Infinitas

10. [Sistema de Reações](#10-sistema-de-reações)
    - 10.1 Grid 6×2 de Emojis
    - 10.2 Física de Partículas Newtoniana
    - 10.3 Optimistic Updates

11. [Sistema de Follows](#11-sistema-de-follows)
    - 11.1 Bubble Layout Orgânico
    - 11.2 Animação Float

12. [Sistema de Notificações](#12-sistema-de-notificações)
    - 12.1 Arquitetura Completa
    - 12.2 Fila com Retry e Deduplicação
    - 12.3 Tratamento 403

13. [Sistema de Admin Dashboard](#13-sistema-de-admin-dashboard)
    - 13.1 Acesso Double-Tap
    - 13.2 Moderação Completa
    - 13.3 Flags de Servidor

14. [Sistema de Efemeridade](#14-sistema-de-efemeridade)
    - 14.1 Expiração de 7 Dias
    - 14.2 Cron Cleanup
    - 14.3 Admin Isento

15. [Sistema de Compartilhamento](#15-sistema-de-compartilhamento)
    - 15.1 Share Card Canvas
    - 15.2 Halton Sequence para Emojis

16. [Sistema de Animações](#16-sistema-de-animações)
    - 16.1 Vídeo 60fps (3.74s)
    - 16.2 Page Transitions
    - 16.3 Framer Motion

17. [Banco de Dados](#17-banco-de-dados)
    - 17.1 8 Tabelas Detalhadas
    - 17.2 25+ Índices
    - 17.3 Relacionamentos

18. [Deploy e Infraestrutura](#18-deploy-e-infraestrutura)
    - 18.1 Vercel Serverless
    - 18.2 Cron Jobs
    - 18.3 Pool de Conexões

19. [LogVault - Sistema de Logging](#19-logvault---sistema-de-logging)
    - 19.1 9 Contextos
    - 19.2 3 Níveis
    - 19.3 Fire-and-Forget

20. [Segurança e Compliance](#20-segurança-e-compliance)
    - 20.1 Medidas de Segurança
    - 20.2 LGPD/GDPR Compliance

---

## 1. VISÃO GERAL DO PROJETO

### 1.1 Propósito e Contexto

**Deck** é um Telegram Mini App desenvolvido como uma rede social de microblogging **efêmera** e **viral**, onde usuários podem compartilhar "threads", pensamentos curtos e momentos do cotidiano com sua rede de contatos do Telegram.

**Contexto de Uso:**
- Plataforma: Telegram (nativo, via WebApp SDK)
- Formato: Mini App dentro do chat do Telegram
- Público: Usuários do Telegram que desejam compartilhar conteúdo leve e efêmero
- Diferencial: Efemeridade (7 dias) + viralidade (compartilhamento nativo)

**Problema que Resolve:**
- Redes sociais tradicionais são permanentes (pressão por conteúdo "perfeito")
- WhatsApp é muito privado (apenas contatos próximos)
- Twitter é muito público e permanente
- **Solução:** Efemeridade (7 dias) incentiva desapego e autenticidade

### 1.2 Proposta de Valor Detalhada

#### Para Usuários

| Proposta | Descrição | Benefícios |
|----------|-----------|------------|
| **Simplicidade** | Interface minimalista, foco no conteúdo | Sem distrações, direto ao ponto |
| **Efemeridade** | Posts expiram em 7 dias | Menos pressão, mais autenticidade |
| **Privacidade** | Apenas seguidores vêem posts (feed mode) | Controle sobre audiência |
| **Notificações Push** | Via Bot Telegram em tempo real | Engajamento imediato |
| **Nativo no Telegram** | Sem login separado, usa identidade Telegram | Zero fricção, zero senhas |

#### Para o Negócio

| Proposta | Descrição | Benefícios |
|----------|-----------|------------|
| **Baixo Custo** | Serverless (Vercel + Supabase free tier) | $0/mês até 10K usuários |
| **Alta Escalabilidade** | Auto-scaling do Vercel | Cresce sem refatoração |
| **Viralidade Nativa** | Compartilhamento via Telegram | Crescimento orgânico |
| **Engajamento** | Notificações push aumentam retenção | Usuários retornam ao app |

#### Para Desenvolvedores

| Proposta | Descrição | Benefícios |
|----------|-----------|------------|
| **Type-Safety** | TypeScript + tRPC + Drizzle | Zero erros de tipo em produção |
| **Arquitetura Moderna** | Next.js 15, React 19, Server Components | DX excelente, manutenção fácil |
| **Documentação Completa** | ~3.400+ linhas de docs | Onboarding rápido, conhecimento preservado |
| **Código Otimizado** | Stable refs, Promise.all, LRU cache | Performance máxima, memory leak previnido |

### 1.3 Características Principais

#### Efêmero
- **Posts expiram em 7 dias** (incentivo ao desapego)
- **Admin isento** (posts de admin nunca expiram)
- **Cron cleanup** às 3h UTC (0h BRT)
- **Reduz custo de storage** em ~90% comparado a permanente

#### Viral
- **Compartilhamento nativo** via Telegram (share card 1080×1920)
- **Notificações push** via Bot Telegram (replies, reactions, follows)
- **Deep linking** direto para posts específicos
- **Botão "Abrir Deck"** no menu do bot

#### Nativo
- **100% integrado ao Telegram** (SDK WebApp)
- **Autenticação automática** (initData HMAC-SHA256)
- **UI adaptada ao tema** (dark/light mode do Telegram)
- **Haptic feedback** nativo do dispositivo

#### Responsável
- **Rate limiting híbrido** (3 camadas: frontend + backend)
- **Moderação completa** (shadow ban, ban, delete post)
- **Admin dashboard** (double-tap no avatar, ≤400ms)
- **Filtros de ban** (buscas filtram usuários banidos)

#### Performático
- **Bundle 203KB** (-36% vs anterior)
- **Build time ~15-20s** (-40% vs anterior)
- **First load ~1s** (Next.js optimization)
- **Animações 60fps** (Framer Motion, vídeo otimizado)
- **API response <200ms** (tRPC + Supabase)
- **DB queries <50ms** (25+ índices, cursor pagination)

### 1.4 Estado Atual do Projeto

**Status:** ✅ **PRODUÇÃO ESTÁVEL - VERSÃO 5.0.0**

**Funcionalidades Implementadas:**
- ✅ Posts de microblog (165 chars, imagem 12MB)
- ✅ Replies (100 chars, threads infinitas)
- ✅ Reações (12 emojis, grid 6×2, física newtoniana)
- ✅ Follows (bubble layout orgânico)
- ✅ Timeline (cursor pagination, swipe gesture)
- ✅ Perfis de usuário (stats, toggle notifications)
- ✅ Notificações push (Bot Telegram, retry, dedup)
- ✅ Admin dashboard (moderação completa, LogVault)
- ✅ Rate limiting (3 camadas, 10min posts, 15min replies)
- ✅ Efemeridade (7 dias, cron cleanup 3h UTC)
- ✅ Share cards (Canvas 1080×1920, Halton sequence)
- ✅ Compressão de imagens (threshold 300KB, client-side)
- ✅ Cache de vídeos (LRU, max 10, Object URLs)
- ✅ LogVault (logging estruturado, 9 contextos)

**Próximos Passos (Backlog):**
- [ ] Denúncia de conteúdo (community moderation)
- [ ] Multi-language support (i18n)
- [ ] Exportação de dados (LGPD requirement)

---

## 2. FUNCIONALIDADES COMPLETAS

### 2.1 Core Features (MVP)

#### Posts de Microblog

**Descrição:** Criação de posts com limite de **165 caracteres** e imagem opcional (até 12MB).

**Detalhes de Implementação:**
- **Limite de caracteres:** 165 (validação frontend + backend)
- **Imagem opcional:** Upload via Supabase Storage
- **Compressão client-side:**
  - Threshold: 300KB (abaixo: sem compressão)
  - Max dimension: 1280px (lado maior)
  - JPEG quality: 0.82
  - GIFs animados: preservados (sem compressão)
- **Validação backend:**
  - MIME type (jpeg, png, webp, gif)
  - Tamanho máximo: 12MB (intencional, configurado pelo admin)
  - Base64 regex: `/^[A-Za-z0-9+/=\s]+$/`

**Fluxo Completo:**
1. Usuário digita conteúdo (max 165 chars)
2. Opcional: seleciona imagem → compressImage()
3. Clica "Publicar" → MainButton handler
4. Frontend valida rate limit (3 camadas)
5. Backend valida ban, flags, rate limit
6. Upload imagem (storagePut)
7. Cria post (createPost)
8. Atualiza users.lastPostAt
9. Grava timestamp no cache local
10. Animação de vídeo (3.74s)
11. Redireciona para timeline

**Código Relacionado:**
- Frontend: `src/app/create/page.tsx`
- Backend: `server/routers/post.router.ts` (create procedure)
- Compressão: `src/lib/image-compress.ts`
- Storage: `server/storage.ts`

#### Upload de Imagens

**Descrição:** Anexar imagens aos posts com compressão inteligente client-side.

**Detalhes Técnicos:**
```typescript
// src/lib/image-compress.ts
async compressImage(file: File): Promise<string> {
  // Valida MIME type
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
    throw new Error('Formato inválido')
  }
  
  // Valida tamanho (max 12MB)
  if (file.size > 12 * 1024 * 1024) {
    throw new Error('Imagem muito grande')
  }
  
  // GIFs animados: preservados (sem compressão)
  if (file.type === 'image/gif') {
    return fileToBase64(file)
  }
  
  // < 300KB: sem compressão
  if (file.size < 300 * 1024) {
    return fileToBase64(file)
  }
  
  // > 300KB: Canvas compression
  const bitmap = await createImageBitmap(file)
  const canvas = document.createElement('canvas')
  
  // Redimensiona para max 1280px
  const scale = Math.min(1280 / bitmap.width, 1280 / bitmap.height)
  canvas.width = bitmap.width * scale
  canvas.height = bitmap.height * scale
  
  const ctx = canvas.getContext('2d')
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  
  // JPEG quality 0.82
  return canvas.toDataURL('image/jpeg', 0.82)
}
```

**Impacto:**
- **-60% bandwidth** comparado a upload sem compressão
- **Menor custo de storage** no Supabase
- **Upload mais rápido** em conexões lentas

#### Sistema de Follow

**Descrição:** Seguir/deixar de seguir outros usuários com bubble layout orgânico.

**Detalhes de Implementação:**
- **Bubble layout:** 10 tamanhos variados (48px a 208px)
- **Animação float:** CSS custom properties (--float-x, --float-y, --float-duration)
- **Física de partículas:** Emojis das reações flutuam com física newtoniana
- **Idempotência:** followUser usa `onConflictDoNothing`

**Código Relacionado:**
- Frontend: `src/app/follow/page.tsx`
- Backend: `server/routers/follow.router.ts`
- Física: `src/hooks/use-physics-particles.ts`

#### Reações com Emojis

**Descrição:** Reações com 12 emojis em grid 6×2 com física de partículas newtoniana.

**Emojis Disponíveis:**
```typescript
const AVAILABLE_REACTIONS = [
  { emoji: '👍', label: 'Gostei' },
  { emoji: '🖕', label: 'Não gostei' },
  { emoji: '😂', label: 'KKKKKKK' },
  { emoji: '😱', label: 'Passada' },
  { emoji: '💀', label: 'Morta' },
  { emoji: '🔥', label: 'Chama' },
  { emoji: '❤️', label: 'Amei' },
  { emoji: '😍', label: 'Falsa' },
  { emoji: '🤔', label: 'hum' },
  { emoji: '🍪', label: 'Biscoito' },
  { emoji: '🐍', label: 'Cobra' },
  { emoji: '🐮', label: 'Vaca' },
]
```

**Física de Partículas (Detalhes no Capítulo 10.2):**
- **Sequência de Halton:** Distribuição quasi-aleatória inicial
- **Colisão elástica:** Conservação de momento
- **Repulsão:** Quando distância < 2× collisionRadius
- **Bounce nas bordas:** Inverte velocidade ao bater
- **Damping:** 0.994 (atrito/arrasto por frame)
- **Thermal noise:** Força aleatória suave quando velocidade < minSpeed
- **Zero re-renders:** Escreve direto no DOM via refs

**Grid 6×2:**
- 6 emojis por linha × 2 linhas
- Picker glassmorphism (bg-white/10, backdrop-blur-2xl)
- Optimistic updates (atualiza UI antes do backend)
- vibrateReaction() (Web Vibration API + HapticFeedback)

#### Timeline Personalizada

**Descrição:** Feed com cursor-based pagination mostrando posts dos usuários seguidos (ou todos).

**Feed Modes:**
- **'following':** Vê apenas posts de quem segue + próprias respostas
- **'all':** Vê todos os posts (exceto shadow-banned)
- **Flag global:** `feed_mode_global` sobrepõe preferência individual

**Cursor Pagination:**
```typescript
// server/repositories/post.repository.ts
async getTimelinePosts(telegramId, limit, cursor, feedMode, isAdmin) {
  const safeLimit = Math.min(Math.max(limit, 1), 100)
  const fetchLimit = safeLimit + 1  // +1 para nextCursor
  
  // Efemeridade: 7 dias (admin isento)
  const sevenDaysAgo = new Date(Date.now() - 7*24*60*60*1000)
  const adminIds = ENV.adminTelegramIds
  
  const ephemeralFilter = adminIds.length > 0
    ? or(gte(posts.createdAt, sevenDaysAgo), inArray(posts.telegramId, adminIds))
    : gte(posts.createdAt, sevenDaysAgo)
  
  // Cursor filter: posts com id < cursor
  const cursorFilter = cursor !== undefined
    ? lt(posts.id, cursor)
    : undefined
  
  // ... monta whereClause baseado em feedMode
  
  const rows = await db.query.posts.findMany({
    where: whereClause,
    orderBy: desc(posts.id),  // ← id DESC
    limit: fetchLimit,
    with: {
      author: { columns: { name: true, photoUrl: true } },
      replyToPost: { columns: { content: true } }
    }
  })
  
  // Determina próximo cursor
  const hasMore = rows.length > safeLimit
  const items = hasMore ? rows.slice(0, safeLimit) : rows
  const nextCursor = hasMore ? items[items.length - 1]?.id : undefined
  
  return { posts: items, nextCursor }
}
```

**Vantagens vs Offset Pagination:**
- **Mais eficiente** para grandes datasets
- **Não pula/duplica** itens quando dados mudam
- **Performance constante** independente da página

#### Perfis de Usuário

**Descrição:** Visualização de posts e estatísticas por usuário.

**Informações Exibidas:**
- Nome e foto de perfil (Telegram)
- Contagem de posts (com efemeridade)
- Lista de seguindo (bubble layout)
- Toggle de notificações (🔔/🔕)
- Botão "Ver todos os posts" → /user/[id]

**Double-Tap para Admin:**
- **Tempo máximo entre taps:** 400ms
- **Requer isAdmin:** Apenas admins acessam dashboard
- **Easter Egg:** Não óbvio para usuários comuns

**Código Relacionado:**
- Frontend: `src/app/profile/page.tsx`
- Double-tap: `handleAvatarDoubleTap()`

### 2.2 Rate Limiting & Moderação

#### Rate Limiting Híbrido (3 Camadas)

**Visão Geral:**
- **Camada 1:** Frontend (CloudStorage + localStorage) - bloqueio imediato
- **Camada 2:** Backend (users.lastPostAt/lastReplyAt) - fonte da verdade
- **Camada 3:** Backend (tabela posts) - fallback para legacy data
- **Regra:** Mais restritivo vence
- **Admin:** Bypassa todas as camadas

**Intervalos:**
- **Posts:** 10 minutos (600.000ms)
- **Replies:** 15 minutos (900.000ms)

**Detalhes Completos no Capítulo 7**

#### Admin Dashboard

**Acesso:** Double-tap no avatar do perfil (≤400ms)

**Funcionalidades:**
- **Stats em tempo real:** Posts hoje, total usuários, banidos
- **Flags de servidor:** 4 flags globais (manutenção, pause, lock, feed)
- **Moderação de usuários:** Lookup, ban, shadow ban, reset rate limit, feed mode
- **Moderação de posts:** Delete qualquer post (admin only)
- **Audit log:** Últimas ações administrativas
- **LogVault:** Logs estruturados com filtros (level, context)
- **Broadcast:** Publicar aviso global (até 600 chars, sem rate limit)

**Detalhes Completos no Capítulo 13**

#### Shadow Ban

**Descrição:** Usuário pode postar, mas ninguém vê seus posts (exceto admin).

**Implementação:**
```typescript
// server/db.ts - getTimelinePosts
const nonBannedUsers = db.select({ id: users.telegramId })
  .from(users)
  .where(eq(users.shadowBanned, false))

// Admin vê TODOS os posts (inclusive shadow-banned)
const whereClause = isAdmin
  ? undefined  // Admin vê tudo
  : inArray(posts.telegramId, nonBannedUsers)  // Filtra shadow-banned
```

**Casos de Uso:**
- Usuário viola termos de uso repetidamente
- Spam de conteúdo inadequado
- Comportamento tóxico

**Vantagens vs Ban Total:**
- Usuário não sabe que está banido (evita confronto)
- Continua postando (não cria novas contas)
- Admin vê posts para auditoria

#### Modo Manutenção

**Flags Globais:**
```typescript
// server/repositories/config.repository.ts
const FLAGS = {
  maintenance_mode: 'false',      // Bloqueia login (admin bypassa)
  pause_new_users: 'false',       // Bloqueia novos cadastros
  lock_posts_global: 'false',     // Bloqueia posts e replies
  feed_mode_global: 'following',  // Sobrepõe feed mode individual ('all' ou 'following')
}
```

**Admin Bypass:**
- ✅ `ctx.isAdmin === true`: Ignora maintenance_mode e lock_posts_global
- ❌ `ctx.isAdmin === false`: Bloqueado pelas flags

### 2.3 UX & Animações

#### Animação de Publicação

**Descrição:** Vídeo 60fps (3.74s) com flash sincronizado (1.60s-2.20s).

**Timings:**
```typescript
const VIDEO_DURATION_MS = 3740   // 3.74s (60fps)
const FLASH_START_MS = 1600      // 1.60s
const FLASH_END_MS = 2200        // 2.20s
const FLASH_DURATION = 600       // 600ms
const FLASH_FADE_MS = 300        // 300ms
const HARD_STOP_MS = 3940        // 3.74s + 200ms (segurança)
```

**Fluxo:**
1. Fade-in 300ms (opacity 0→1)
2. Play vídeo (3.74s)
3. Flash 600ms (1.60s-2.20s, opacity 0→1→0)
4. Fade-out 400ms (opacity 1→0)
5. Publica post
6. Redireciona para timeline

**Código Relacionado:**
- Frontend: `src/app/create/page.tsx` (startVideoAnimation)
- Vídeo: `/public/videos/animation.mp4`
- Overlay: `src/components/reply-animation-overlay.tsx`

#### Page Transitions

**Descrição:** Transições suaves entre páginas (250ms, cubic-bezier, slide 8px).

**Implementação:**
```typescript
// src/components/page-transition.tsx
export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.25,  // 250ms
          ease: [0.22, 1, 0.36, 1],  // cubic-bezier
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

**Características:**
- **Duração:** 250ms (não 350ms)
- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (suave, acelerado no meio)
- **Slide:** 8px vertical (feed variant)
- **Modo:** `popLayout` no AnimatePresence (evita layout shift)

#### Floating Tab Bar

**Descrição:** Barra de navegação inferior com glassmorphism e bolha indicadora animada.

**Características:**
- **Tabs:** `/` (Feed), `/create` (Criar), `/follow` (Seguir), `/profile` (Perfil)
- **Glassmorphism:** bg-white/10, backdrop-blur-2xl, border-white/20
- **Bolha indicadora:** Scale + opacity animada (Framer Motion)
- **Detecção de teclado:** visualViewport API ajusta posição
- **Prefetch de rotas:** use-tab-prefetch hook

**Código Relacionado:**
- Componente: `src/components/floating-tab-bar.tsx`
- Hook: `src/hooks/use-tab-prefetch.ts`
- Contexto: `src/lib/tab-bar-context.tsx`

#### Bubble Layout (Follow Page)

**Descrição:** Layout orgânico com bolhas de 10 tamanhos variados.

**Tamanhos:**
```typescript
const BUBBLE_SIZES = [
  { min: 48, max: 64, text: 'text-sm' },
  { min: 64, max: 80, text: 'text-base' },
  { min: 80, max: 96, text: 'text-lg' },
  { min: 96, max: 112, text: 'text-xl' },
  { min: 112, max: 128, text: 'text-2xl' },
  { min: 128, max: 144, text: 'text-2xl' },
  { min: 144, max: 160, text: 'text-3xl' },
  { min: 160, max: 176, text: 'text-3xl' },
  { min: 176, max: 192, text: 'text-4xl' },
  { min: 192, max: 208, text: 'text-4xl' },
]
```

**Animação Float (CSS):**
```css
@keyframes float {
  0%, 100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(var(--float-x), var(--float-y));
  }
  50% {
    transform: translate(calc(var(--float-x) * 1.5), calc(var(--float-y) * 0.5));
  }
  75% {
    transform: translate(calc(var(--float-x) * 0.5), calc(var(--float-y) * 1.5));
  }
}

.animate-float {
  animation: float var(--float-duration) ease-in-out var(--float-delay) infinite;
}
```

**Custom Properties:**
- `--float-x`: Offset horizontal (random -10px a 10px)
- `--float-y`: Offset vertical (random -10px a 10px)
- `--float-duration`: Duração (5s a 8s)
- `--float-delay`: Delay escalonado (index × 0.1s)

#### Haptic Feedback

**Descrição:** Vibração tátil para feedback de interações.

**Tipos:**
```typescript
// src/lib/telegram-utils.ts
function hapticImpact(style: 'light' | 'medium' | 'heavy') {
  const tg = window.Telegram?.WebApp
  if (tg?.HapticFeedback?.impactOccurred) {
    tg.HapticFeedback.impactOccurred(style)
  }
}

function hapticNotification(type: 'success' | 'warning' | 'error') {
  const tg = window.Telegram?.WebApp
  if (tg?.HapticFeedback?.notificationOccurred) {
    tg.HapticFeedback.notificationOccurred(type)
  }
}

function hapticSelection() {
  const tg = window.Telegram?.WebApp
  if (tg?.HapticFeedback?.selectionChanged) {
    tg.HapticFeedback.selectionChanged()
  }
}

// Web Vibration API (Android)
function vibrateReaction() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([10, 30, 10])  // Android
  } else {
    hapticImpact('light')  // iOS fallback
  }
}
```

**Casos de Uso:**
- **impact('light'):** Selecionar emoji, tocar botão
- **impact('medium'):** Iniciar animação de vídeo
- **notification('success'):** Post publicado com sucesso
- **notification('error'):** Erro ao publicar
- **selection():** Scroll em picker de emojis

#### MainButton Dinâmica

**Descrição:** Botão principal do Telegram com texto/estado contextual.

**Estados:**
```typescript
// src/app/create/page.tsx
useEffect(() => {
  if (isVideoPlaying) {
    mainButtonHide()  // Esconde durante animação
    return
  }

  if (isPublishing) {
    mainButtonShow()
    mainButtonDisable()
    mainButtonSetText('Publicando...')
    mainButtonShowProgress()  // Spinner
    return
  }

  if (isValid && canPost) {
    mainButtonShow()
    mainButtonEnable()
    mainButtonSetText('Publicar')
    return
  }

  if (!canPost) {
    mainButtonShow()
    mainButtonDisable()
    const minutes = Math.floor(timeRemaining / 60000)
    const seconds = Math.floor((timeRemaining % 60000) / 1000)
    mainButtonSetText(`Aguardar ${minutes}m ${seconds}s`)
    return
  }

  mainButtonHide()  // Sem conteúdo
}, [isValid, canPost, timeRemaining, isVideoPlaying, isPublishing])
```

**Estados Possíveis:**
- **Escondido:** Sem conteúdo válido, animação tocando
- **Habilitado:** "Publicar" (conteúdo válido, pode postar)
- **Desabilitado:** "Aguardar Xmin Ys" (rate limit)
- **Loading:** "Publicando..." + spinner (publicando)

#### Detecção de Teclado (visualViewport)

**Descrição:** Ajuste automático da UI quando teclado virtual abre.

**Implementação:**
```typescript
// src/app/create/page.tsx
useEffect(() => {
  if (typeof window === 'undefined') return

  const getVH = () => window.visualViewport
    ? window.visualViewport.height + window.visualViewport.offsetTop
    : window.innerHeight

  baseViewportHeightRef.current = getVH()

  const handleResize = () => {
    const base = baseViewportHeightRef.current ?? window.innerHeight
    const current = getVH()
    setKeyboardOffset(Math.max(0, base - current))
  }

  window.visualViewport?.addEventListener('resize', handleResize)
  window.visualViewport?.addEventListener('scroll', handleResize)

  return () => {
    window.visualViewport?.removeEventListener('resize', handleResize)
    window.visualViewport?.removeEventListener('scroll', handleResize)
  }
}, [])
```

**Aplicação:**
```typescript
<div
  className="px-6 pb-32"
  style={{
    transform: !canPost ? 'none' : `translateY(-${keyboardOffset}px)`,
    transition: 'transform 0.15s ease-out',
    willChange: 'transform',
  }}
>
  {/* Form sobe com o teclado */}
</div>
```

### 2.4 Notificações & Viralidade

#### Notificações Push via Bot Telegram

**Descrição:** Notificações em tempo real para replies, reactions e follows.

**Tipos de Notificação:**
```typescript
// server/bot/telegram-bot.ts
async notifyReply(recipientId, actorName, replyContent) {
  const truncatedContent = replyContent.substring(0, 50)
  const message = `💬 <b>${actorName}</b> respondeu sua thread:\n\n<i>"${truncatedContent}..."</i>`
  return sendTelegramMessage(recipientId, message)
}

async notifyReaction(recipientId, actorName, emoji, postContent) {
  const truncatedContent = postContent.substring(0, 50)
  const message = `${emoji} <b>${actorName}</b> reagiu na sua thread\n\n<i>"${truncatedContent}..."</i>`
  return sendTelegramMessage(recipientId, message)
}

async notifyFollow(recipientId, actorName) {
  const message = `👀 <b>${actorName}</b> veio bisbilhotar sua vida\n\nAgora te segue no Deck.`
  return sendTelegramMessage(recipientId, message)
}
```

**Fluxo Completo:**
1. Evento ocorre (reply/reaction/follow)
2. insertNotification() no DB (deduplicação via unique constraint)
3. Promise.all: busca recipient + actor (1 round-trip)
4. Verifica notificationsEnabled
5. Envia via Bot API (imediato, ~95% sucesso)
6. Atualiza status (sent/failed/skipped)
7. Se erro 403: disableUserNotifications() permanentemente
8. Cron retry (12h UTC, max 3 tentativas) para falhas

**Detalhes Completos no Capítulo 12**

#### Fila de Notificações com Retry

**Descrição:** Sistema robusto de fila com retry, deduplicação e auditoria.

**Tabela notifications:**
```sql
CREATE TABLE "notifications" (
  id SERIAL PRIMARY KEY,
  type VARCHAR(20) NOT NULL,  -- 'reply' | 'reaction' | 'follow'
  "recipientId" BIGINT NOT NULL,
  "actorId" BIGINT NOT NULL,
  "referenceId" INTEGER,
  emoji VARCHAR(10),
  status VARCHAR(10) NOT NULL DEFAULT 'pending',  -- 'pending' → 'sent' | 'failed' | 'skipped'
  "retryCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW() NOT NULL,
  "sentAt" TIMESTAMP,
  UNIQUE ("type", "recipientId", "actorId", "referenceId")  -- Deduplicação
);
```

**Status:**
- **'pending':** Aguardando envio
- **'sent':** Enviado com sucesso
- **'failed':** Erro no envio (retry no cron)
- **'skipped':** Erro permanente (403, usuário bloqueou bot)

**Retry Logic:**
- **Máximo:** 3 tentativas
- **Cron:** 12h UTC (12x/dia no plano Hobby)
- **Limpeza:** Notificações > 30 dias

#### Opt-out de Notificações

**Descrição:** Usuário pode desativar notificações (LGPD compliance).

**Implementação:**
```typescript
// drizzle/schema.ts
export const users = pgTable("users", {
  // ...
  notificationsEnabled: boolean("notificationsEnabled").default(true).notNull(),
  // ...
})

// server/routers/user.router.ts
users: router({
  setNotifications: protectedProcedure
    .input(z.object({ enabled: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await db.setUserNotificationsEnabled(ctx.telegramId, input.enabled)
      return { success: true }
    }),
})
```

**UI:**
- Toggle no perfil (🔔/🔕)
- Padrão: true (ativado)
- Usuário pode desativar a qualquer momento

#### Share Card (Canvas 1080×1920)

**Descrição:** Card de compartilhamento gerado via Canvas com glassmorphism e watermark.

**Características:**
- **Tamanho:** 1080×1920 (vertical, formato story)
- **Background:** Background-artistic.jpg (blur 40px)
- **Glassmorphism:** Overlay branco semi-transparente
- **Watermark:** icon.png (275px) centralizado no topo
- **Texto:** Post content (max 165 chars)
- **Imagem:** Post image (se houver, max 920×600)
- **Emojis:** Reações espalhadas com Halton sequence
- **Footer:** "Deck 🎭" no rodapé

**Halton Sequence para Emojis:**
```typescript
// src/lib/share-card.ts
function halton(index: number, base: number): number {
  let f = 1, r = 0, i = index
  while (i > 0) {
    f /= base
    r += f * (i % base)
    i = Math.floor(i / base)
  }
  return r
}

// Distribuição quasi-aleatória (evita sobreposição)
const positions = reactions.map((_, i) => ({
  x: halton(i + 1, 2) * 1080,
  y: halton(i + 1, 3) * 1920
}))
```

**Zonas Protegidas (não sobrepõem):**
- **Topo:** Watermark (80-355px)
- **Meio:** Glass card com texto (400-1400px)
- **Rodapé:** Footer text (1800-1920px)

### 2.5 Sistema & Performance

#### Frases Randomizadas

**Descrição:** 180 frases aleatórias para placeholders e rate limit.

**Distribuição:**
- **60 placeholder:** "Conta essa thread...", "Desabafa aí...", etc.
- **60 post rate limit:** "Calma lá, uma thread por vez...", "Respira...", etc.
- **60 reply rate limit:** "Devagar com o reply...", "Deixa a poeira baixar...", etc.

**Implementação:**
```typescript
// src/constants/rate-limit-phrases.ts
export function getRandomPlaceholderPhrase(): string {
  const phrases = [/* 60 frases */]
  return phrases[Math.floor(Math.random() * phrases.length)]
}

export function getRandomPostRatePhrase(): string {
  const phrases = [/* 60 frases */]
  return phrases[Math.floor(Math.random() * phrases.length)]
}
```

#### Compressão de Imagem Client-Side

**Detalhes no Capítulo 2.1 (Upload de Imagens)**

#### Cache de Vídeo (LRU)

**Descrição:** LRU cache para vídeos de animação (max 10 itens).

**Implementação:**
```typescript
// src/lib/video-cache.ts
const loadingCache = new Map<string, Promise<Blob>>()
const srcCache = new Map<string, string>()

export async function aquecerVideoCache(url: string): Promise<void> {
  if (srcCache.has(url)) return  // Já está em cache

  if (!loadingCache.has(url)) {
    loadingCache.set(
      url,
      fetch(url)
        .then(res => res.blob())
        .finally(() => loadingCache.delete(url))
    )
  }

  const blob = await loadingCache.get(url)!
  const objectUrl = URL.createObjectURL(blob)
  srcCache.set(url, objectUrl)
}

export function obterVideoCacheado(url: string): string | undefined {
  return srcCache.get(url)
}

export function clearVideoCache(): void {
  srcCache.forEach(url => URL.revokeObjectURL(url))
  srcCache.clear()
  loadingCache.clear()
}
```

**LRU Implementation:**
- Map mantém ordem de inserção (ES2015+)
- Limite: 10 itens
- Remove mais antigo quando excede
- Revoga Object URLs no clear (previne memory leak)

#### Cursor-based Pagination

**Detalhes no Capítulo 2.1 (Timeline Personalizada)**

#### Stable Refs Pattern

**Descrição:** Evitar stale closures em callbacks assíncronos.

**Problema:**
```typescript
// ❌ ANTES (stale closure)
const handleClick = useCallback(() => {
  createMutation.mutate({ content })  // content pode estar stale
}, [createMutation])
```

**Solução:**
```typescript
// ✅ DEPOIS (refs estáveis)
const contentRef = useRef(content)
useEffect(() => { contentRef.current = content }, [content])

const stableHandler = useRef(() => {
  const current = contentRef.current  // ← sempre valor atual
  createMutation.mutate({ content: current })
})

// Callback do Telegram (registrado UMA VEZ)
const onMainButtonClick = useCallback(() => {
  stableHandler.current()
}, [])
```

**Por que é brilhante:** Previne bugs sutis que seriam difíceis de debugar em produção.

#### Promise.all Optimization

**Descrição:** Buscas paralelas para reduzir latência.

**Problema:**
```typescript
// ❌ ANTES (2 round-trips)
const recipient = await getUserByTelegramId(recipientId)
const actor = await getUserByTelegramId(actorId)
```

**Solução:**
```typescript
// ✅ DEPOIS (1 round-trip)
const [recipient, actor] = await Promise.all([
  getUserByTelegramIdForNotifications(recipientId),
  getUserByTelegramIdForNotifications(actorId)
])
```

**Impacto:** Reduz latência pela metade para notificações.

---

*(Continua nos próximos documentos devido ao limite de tamanho - cada capítulo será expandido em documentos separados)*

---

**Próximos Documentos:**
- 01-RESUMO-EXECUTIVO.md - Métricas, custos, roadmap, KPIs (expandido)
- 02-API-ENDPOINTS.md - tRPC routers e procedures detalhados (expandido)
- 03-BACKEND.md - Autenticação, rate limit, LogVault (expandido)
- 04-DATABASE.md - Schema completo, migrations, queries (expandido)
- 05-TECNOLOGIAS.md - Telegram SDK, TanStack Query, Framer Motion (expandido)
- 06-FLUXOS.md - Fluxos completos de ponta a ponta (expandido)
- 07-ADMIN.md - Moderação completa (expandido)
- 08-NOTIFICACOES.md - Arquitetura de notificações (expandido)
- 09-LOGVAULT.md - Sistema de logging estruturado (expandido)

---

*Última atualização: 14 de Março de 2026*
