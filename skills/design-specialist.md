---
name: design-specialist
description: Especialista em Design — todos os padrões, definições e tudo que estiver na UI, UX para manter o app com a alma que já existe. Atenção especial ao sistema de carrossel de fundo (Louvre Mechanics) onde imagens de fundo alternam entre obras de arte clássicas.
requires_review: true
design_domains: [Glassmorphism, LouvreCarousel, PhysicsParticles, HapticFeedback, PageTransitions, TelegramTheme, Animations]
---

# Design Specialist

## 🎯 PROPÓSITO DA SKILL

Esta skill é o **guardião da identidade visual e experiência do usuário** do Deck. Preserva a "alma" do projeto através de padrões de design consistentes.

**Responsabilidades:**
1. Manter glassmorphism consistente em todos componentes
2. Preservar mecânica Louvre (carrossel de obras de arte clássicas)
3. Garantir física de partículas newtoniana em emojis
4. Aplicar haptic feedback apropriado por contexto
5. Manter page transitions suaves com Framer Motion
6. Sincronizar com tema dinâmico do Telegram
7. Preservar animações 60fps
8. Manter consistência visual em todas páginas

**Quando usar:**
- Criar novos componentes UI
- Modificar layouts existentes
- Implementar animações
- Adicionar feedback tátil/visual
- Revisar consistência visual
- Planejar novas features visuais

**Quando NÃO usar:**
- Para lógica de negócio → use `code-contributor`
- Para decisões arquiteturais → use `deck-specialist`
- Para validação de regras → use `rule-enforcer`

---

## 🎨 SISTEMA DE DESIGN MARACUTÁIA

### 1. Louvre Carousel (Carrossel de Obras de Arte)

**Característica única do Deck:** O nome "Louvre" refere-se à mecânica de fundo que alterna entre obras de arte clássicas, criando uma experiência museológica digital.

#### Filosofia de Design

> *"Cada navegação é uma visita ao museu — o usuário nunca sabe qual obra clássica verá, mas sempre será algo belo e inspirador."*

**Princípios:**
- ✅ **Surpresa e encantamento:** Troca aleatória por navegação
- ✅ **Arte clássica:** Obras que remetem ao acervo do Louvre
- ✅ **Performance:** Troca instantânea, sem loading
- ✅ **Identidade:** Deck = arte + tecnologia

#### Mecânica de Funcionamento

**Arquivo:** `src/hooks/use-page-background.ts`

```typescript
/**
 * Sorteia uma imagem de fundo aleatória para a página ao montar.
 * Troca a cada navegação (remontagem do componente), sem timer nem loop.
 *
 * Pré-carrega todas as imagens do array em background para que
 * as próximas visitas sejam instantâneas (browser cache + immutable headers).
 */
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
      if (src === chosen) return; // já está carregando/carregada
      const img = new window.Image();
      img.src = src;
    });
  }, []);

  return chosen;
}
```

**Fluxo:**
1. Usuário navega para página (ex: `/follow`)
2. Componente monta → `useMemo` sorteia índice aleatório
3. Imagem escolhida é aplicada como background
4. Demais imagens são pré-carregadas em background
5. Próxima navegação → novo sorteio → nova obra

#### Configuração de Imagens

**Arquivo:** `src/constants/images.ts`

```typescript
export const IMAGE_VERSION = 'v5';
const v = IMAGE_VERSION;

export const PAGE_BACKGROUNDS = {
  seguir: [
    `/images/seguir/seguir-1.jpg?${v}`,  // Mona Lisa style
    `/images/seguir/seguir-2.jpg?${v}`,  // Venus de Milo style
    `/images/seguir/seguir-3.jpg?${v}`,  // Liberty Leading style
    `/images/seguir/seguir-4.jpg?${v}`,  // Raft of Medusa style
    `/images/seguir/seguir-5.jpg?${v}`,  // Wedding at Cana style
    `/images/seguir/seguir-6.jpg?${v}`,  // Psyche and Cupid style
    `/images/seguir/seguir-7.jpg?${v}`,  // Napoleon Coronation style
    `/images/seguir/seguir-8.jpg?${v}`,  // Peasant Wedding style
    `/images/seguir/seguir-9.jpg?${v}`,  // Girl with Pearl style
    `/images/seguir/seguir-10.jpg?${v}`, // Birth of Venus style
  ],
  perfil: [
    `/images/perfil/perfil-1.jpg?${v}`,  // Obra clássica 1
    `/images/perfil/perfil-2.jpg?${v}`,  // Obra clássica 2
    // ... até 10 obras
  ],
  post: [
    `/images/post/post-1.jpg?${v}`,  // Obra clássica 1
    `/images/post/post-2.jpg?${v}`,  // Obra clássica 2
    // ... até 10 obras
  ],
  ferramentas: [`/images/ferramentas/ferramentas-1.jpg?${v}`],
};
```

**Como Adicionar Novas Obras:**
1. Coloque arquivo em `/public/images/<pasta>/`
2. Nomeie em sequência: `seguir-11.jpg`, `perfil-11.jpg`, etc.
3. Adicione caminho no array correspondente em `images.ts`
4. Incremente `IMAGE_VERSION` se quiser forçar recarregamento global

**Headers de Cache (next.config.ts):**
```typescript
headers: async () => [
  {
    source: '/images/:path*',
    headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
  },
]
```

**Por Que Immutable:**
- ✅ URLs versionadas (`?v5`) mudam apenas quando há atualização
- ✅ Browser cacheia permanentemente até versão mudar
- ✅ Pré-carregamento é eficiente (uma vez por lifetime)

---

### 2. Glassmorphism System

**Glassmorphism é a assinatura visual do Deck.**

#### Classes Tailwind Obrigatórias

```typescript
// Card base
className="glass-card backdrop-blur-sm bg-white/10 border border-white/20"

// Variações
bg-black/20        // Dark mode
bg-white/5         // Mais sutil
backdrop-blur-md   // Blur médio (12px)
backdrop-blur-xl   // Blur forte (24px)
border-white/10    // Border mais sutil
border-white/30    // Border mais forte
```

#### CSS Global (globals.css)

```css
.glass-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px); /* Safari */
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
}

/* Dark mode */
@media (prefers-color-scheme: dark) {
  .glass-card {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}
```

#### Exemplo: Post Card

```tsx
// src/components/post-card.tsx
<div className={cn(
  'mb-2.5 flex flex-col rounded-3xl p-2.5 glass-card',
  'transition-shadow duration-300 ease-out',
  'hover:shadow-lg hover:shadow-white/5',
)}>
  {/* Header */}
  <div className="flex items-center gap-2">
    {/* Avatar, nome, timestamp */}
  </div>

  {/* Content */}
  <div className="mt-2 text-base leading-relaxed">
    {content}
  </div>

  {/* Actions */}
  <div className="mt-3 flex items-center justify-between">
    {/* Reactions, reply, share */}
  </div>
</div>
```

#### Princípios Glassmorphism

| Propriedade | Valor | Efeito |
|-------------|-------|--------|
| **Background** | `rgba(255, 255, 255, 0.1)` | Transparência 10% |
| **Backdrop Filter** | `blur(10px)` | Desfoque do fundo |
| **Border** | `1px solid rgba(255, 255, 255, 0.2)` | Borda sutil |
| **Box Shadow** | `0 4px 30px rgba(0, 0, 0, 0.1)` | Profundidade |
| **Saturate** | `saturate-200` | Cores vibrantes atrás |

---

### 3. Física de Partículas (Emojis)

**Emojis de reações usam física newtoniana real.**

#### Características

| Feature | Descrição | Implementação |
|---------|-----------|---------------|
| **Sequência de Halton** | Distribuição quasi-aleatória uniforme | Evita aglomerações iniciais |
| **Colisão elástica** | Partículas colidem e transferem energia | Conservação de momento |
| **Repulsão** | Partículas próximas se repelem | Força proporcional à sobreposição |
| **Bounce** | Partículas quicam nas bordas | Inversão de velocidade |
| **Damping** | Atrito constante (0.994/frame) | Desaceleração gradual |
| **Thermal noise** | Movimento perpétuo | Injeta força quando parado |
| **Zero re-renders** | Escrita direta no DOM | Performance 60fps |

#### Arquivo: `src/hooks/use-physics-particles.ts`

```typescript
export function usePhysicsParticles(
  count: number,
  containerRef: React.RefObject<HTMLElement | null>,
  particleRefs: React.RefObject<(HTMLElement | null)[]>,
  options: PhysicsOptions = {},
) {
  const {
    collisionRadius = 14,
    repulsionStrength = 1.4,
    maxSpeed = 1.2,
    damping = 0.994,
    minSpeed = 0.08,
    noiseStrength = 0.012,
  } = options

  // ... inicialização com Halton sequence

  const tick = () => {
    // 1. Repulsão entre partículas
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x
        const dy = pts[j].y - pts[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01

        if (dist < collisionRadius * 2) {
          const force = (repulsionStrength * (collisionRadius * 2 - dist)) / dist
          pts[i].vx -= dx * force
          pts[i].vy -= dy * force
          pts[j].vx += dx * force
          pts[j].vy += dy * force
        }
      }
    }

    // 2. Atualizar posição + bounce + thermal noise
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]

      // Damping (atrito)
      p.vx *= damping
      p.vy *= damping

      // Thermal noise (movimento perpétuo)
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      if (speed < minSpeed) {
        p.vx += smoothNoise(p.noiseSeed, t) * noiseStrength
        p.vy += smoothNoise(p.noiseSeed + 50, t) * noiseStrength
      }

      // Clamp velocidade máxima
      const speedAfter = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
      if (speedAfter > maxSpeed) {
        p.vx = (p.vx / speedAfter) * maxSpeed
        p.vy = (p.vy / speedAfter) * maxSpeed
      }

      // Atualizar posição
      p.x += p.vx
      p.y += p.vy

      // Bounce nas bordas
      if (p.x < margin) { p.x = margin; p.vx = Math.abs(p.vx) }
      if (p.x > cw - margin) { p.x = cw - margin; p.vx = -Math.abs(p.vx) }
      if (p.y < margin) { p.y = margin; p.vy = Math.abs(p.vy) }
      if (p.y > ch - margin) { p.y = ch - margin; p.vy = -Math.abs(p.vy) }

      // Escreve direto no DOM (zero re-renders)
      const el = particleRefs.current?.[i]
      if (el) {
        el.style.left = `${p.x}px`
        el.style.top = `${p.y}px`
      }
    }

    rafRef.current = requestAnimationFrame(tick)
  }
}
```

---

### 4. Haptic Feedback por Emoji

**Cada emoji tem padrão de vibração único.**

#### Mapeamento de Vibração

```typescript
const REACTION_VIBRATION: Record<string, number | number[]> = {
  '💀': 400,                    // Vibração longa (morte)
  '😂': [80, 60, 80],           // 3 pulsos (risada)
  '😱': [200, 100, 200],        // 2 pulsos fortes (shock)
  '❤️': [60, 40, 60],           // Batimento cardíaco
  '🔥': [40, 30, 40, 30, 40],   // 5 pulsos rápidos (fogo)
  '👍': 60,                     // Curto e simples
  '🎉': [100, 50, 100, 50, 100], // Celebração
  '😍': [80, 40, 80],           // Amor (3 pulsos suaves)
  '🤔': 120,                    // Pensativo (médio)
  '😢': [150, 100],             // Triste (2 pulsos lentos)
};
```

#### Implementação

```typescript
export function vibrateReaction(emoji: string): void {
  const pattern = REACTION_VIBRATION[emoji] ?? 60

  // Web Vibration API (Android - mais expressivo)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern)
      return
    } catch { /* fallback */ }
  }

  // Fallback: Telegram HapticFeedback (iOS)
  hapticImpact('medium')
}
```

---

### 5. Page Transitions (Framer Motion)

**Todas navegações usam transições suaves.**

#### Padrão Base

```tsx
// src/components/page-transition.tsx
import { motion, AnimatePresence } from 'framer-motion'

export function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{
          duration: 0.25,  // 250ms
          ease: [0.22, 1, 0.36, 1],  // cubic-bezier custom
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

#### Configurações

| Propriedade | Valor | Descrição |
|-------------|-------|-----------|
| **duration** | `0.25` | 250ms (rápido mas suave) |
| **ease** | `[0.22, 1, 0.36, 1]` | Cubic-bezier custom |
| **y** | `8px` | Slide vertical sutil |
| **opacity** | `0 → 1` | Fade in/out |
| **mode** | `popLayout` | Evita layout shift |

#### Shared Element Transitions (layoutId)

```tsx
// Thumbnail na timeline
<motion.div layoutId={`post-${postId}`}>
  <img src={thumbnail} />
</motion.div>

// Mesma imagem na página de detalhes
<motion.div layoutId={`post-${postId}`}>
  <img src={fullImage} />
</motion.div>
```

---

### 6. Telegram Theme Sync

**Cores sincronizadas com tema do Telegram.**

#### CSS Variables

```css
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-button-color: #007AFF;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #F2F2F7;
  --tg-theme-hint-color: #8E8E93;
  --tg-theme-link-color: #007AFF;
  --tg-theme-section-separator-color: #C6C6C8;
}

@media (prefers-color-scheme: dark) {
  :root {
    --tg-theme-bg-color: #000000;
    --tg-theme-text-color: #ffffff;
    --tg-theme-button-color: #0A84FF;
    --tg-theme-button-text-color: #ffffff;
    --tg-theme-secondary-bg-color: #1C1C1E;
    --tg-theme-hint-color: #8E8E93;
    --tg-theme-link-color: #0A84FF;
    --tg-theme-section-separator-color: #38383A;
  }
}
```

#### Hook de Tema

```typescript
export function useTelegramTheme() {
  const [theme, setTheme] = useState<ThemeParams>({})

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return

    setTheme(tg.themeParams)

    const handler = () => setTheme(tg.themeParams)
    tg.onEvent('themeChanged', handler)

    return () => tg.offEvent('themeChanged', handler)
  }, [])

  return theme
}
```

---

## ✅ CHECKLIST DE DESIGN

Ao criar ou modificar componentes:

- [ ] **Louvre Carousel:** Background usa `usePageBackground()`?
- [ ] **Glassmorphism:** Classes `backdrop-blur`, `bg-white/10`, `border-white/20` aplicadas?
- [ ] **Page Transitions:** Componente envolvido em `AnimatePresence`?
- [ ] **Física de Partículas:** Emojis usam `usePhysicsParticles()`?
- [ ] **Haptic Feedback:** Vibração apropriada por emoji/ação?
- [ ] **Tema Telegram:** Cores usam CSS variables (`var(--tg-theme-*)`)?
- [ ] **Animações 60fps:** `requestAnimationFrame` para animações contínuas?
- [ ] **Imagens Versionadas:** URLs incluem `?v5` (IMAGE_VERSION)?

---

## 🔗 LINKS RELACIONADOS

- [[CodePatterns]] — Convenções de código
- [[TelegramIntegration]] — Integração Telegram
- [[Components]] — Componentes React
- `src/hooks/use-page-background.ts` — Louvre Carousel
- `src/hooks/use-physics-particles.ts` — Física de Partículas
- `src/constants/images.ts` — Configuração de Imagens
- `src/lib/telegram-utils.ts` — Haptic Feedback

---

*Design Specialist — Guardião da alma artística do Deck.*
