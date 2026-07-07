---
tags: [skills, ai, workflow, deck-specialist, telegram-specialist, design-specialist]
created: 2026-03-14
updated: 2026-03-14
sources: [skills/, .qwen/skills/]
rule_review: approved
---

# Skills Overview

Visão geral do sistema de **AI Skills** do projeto Deck.

## 🎯 Propósito

As AI Skills são assistentes especializados que auxiliam no desenvolvimento, manutenção e evolução do projeto. Cada skill tem responsabilidades específicas e domínios de conhecimento bem definidos.

## 📁 Localização

| Pasta | Descrição |
|-------|-----------|
| `/skills/` | Cópias organizadas de todas as skills (incluindo novas) |
| `.qwen/skills/` | Skills originais usadas pelo Qwen AI |

---

## 🔹 Skills Existentes (Originais)

### Code Architecture

**Arquivo:** `code-architecture.md`

**Descrição:** Verifica arquitetura de código para conformidade SOLID, DI, e padrões do projeto.

**Quando usar:**
- Code review
- Avaliando decisões arquiteturais antes da implementação
- Verificando corretude de configuração DI
- Analisando relacionamentos entre componentes

**Fontes:** Lê `docs/wiki/index.md` primeiro, depois código do projeto.

---

### Code Contributor

**Arquivo:** `code-contributor.md`

**Descrição:** Ajuda a adicionar e modificar código conforme padrões estabelecidos.

**Quando usar:**
- Criar novas features ou services
- Corrigir bugs
- Refatorar código existente
- Escrever documentação do projeto

**Regras Absolutas:**
- BIGINT para telegramIds
- Rate limiting 3 camadas
- Shadow ban filter em queries de leitura
- Efemeridade 7 dias
- Auditoria admin
- Glassmorphism
- Page transitions
- Type-safety tRPC

---

### Rule Enforcer

**Arquivo:** `rule-enforcer.md`

**Descrição:** Realiza validação de regras absolutas do projeto.

**Regras Validadas:**
1. **BIGINT para telegramIds** — Todas colunas telegramId
2. **Rate limiting 3 camadas** — Frontend → DB users → DB posts
3. **Shadow ban filter** — Todas queries de leitura
4. **Efemeridade 7 dias** — Posts expiram, admin isento
5. **Auditoria admin** — Toda ação registrada em `adminActions`
6. **Glassmorphism** — Componentes UI com backdrop-blur
7. **Page transitions** — Framer Motion AnimatePresence
8. **Type-safety tRPC** — Zod schemas, tipos inferidos

**Status:** `rule_review: approved` obrigatório antes de merge.

---

### Telegram Integration

**Arquivo:** `telegram-integration.md`

**Descrição:** Especialista em Telegram WebApp SDK.

**Recursos:**
- MainButton, BackButton, SecondaryButton
- HapticFeedback (vibração por emoji)
- CloudStorage (rate limiting camada 1)
- BiometricManager (Face ID, Touch ID)
- ThemeParams (dark/light mode)
- Popup, Alert, Confirm
- switchInlineQuery, openLink, close
- initData (autenticação)

---

### Wiki Workflow

**Arquivo:** `wiki-workflow.md`

**Descrição:** Gerencia o sistema wiki do projeto.

**Operações:**
- **Ingest** — Extrair conhecimento do código para wiki
- **Query** — Buscar e sintetizar conhecimento da wiki
- **Lint** — Verificar integridade wiki
- **Post-Change Lint** — Atualizar wiki após mudanças de código

**Prioridade:** Wiki é fonte primária de conhecimento, não o código.

---

## ✨ Novas Skills Criadas

### Deck Specialist

**Arquivo:** `deck-specialist.md`

**Descrição:** Especialista geral em Deck — decisões de design, arquitetura, convenções, padrões, e todo conhecimento necessário sobre o projeto.

**Domínios de Conhecimento:**
- Arquitetura tRPC + Drizzle ORM + Next.js 15
- Design Patterns (SOLID, DI, Repository Pattern)
- Convenções (BIGINT, glassmorphism, page transitions)
- Regras de Negócio (rate limiting, efemeridade, shadow ban)
- Telegram Integration (WebApp SDK, recursos nativos)
- UI/UX (física de partículas, animações 60fps, haptic feedback)

**Quando usar:**
- Tomar decisões arquiteturais
- Avaliar trade-offs de implementação
- Entender contexto completo do projeto
- Revisar código com visão sistêmica
- Planejar novas features

**Hierarquia:** Skill de mais alto nível, coordena outras skills especializadas.

---

### Telegram Specialist

**Arquivo:** `telegram-specialist.md`

**Descrição:** Especialista em integração e desenvolvimento específico do Telegram.

**Recursos Cobertos:**

#### UI Nativa
- **MainButton** — Botão principal dinâmico (texto, cor, progresso)
- **BackButton** — Navegação voltada ao topo
- **SecondaryButton** — Botão secundário customizado

#### Haptic Feedback
- `impactOccurred` — light/medium/heavy/rigid/soft
- `notificationOccurred` — success/warning/error
- `selectionChanged` — Picker de reações
- **Vibração por emoji** — Padrões únicos por emoji (😂, ❤️, 🔥, etc.)

#### Armazenamento
- **CloudStorage** — Rate limiting camada 1 (sincronizado entre dispositivos)
- **localStorage** — Fallback se CloudStorage indisponível

#### Biometria
- **BiometricManager** — Face ID, Touch ID, Fingerprint
- `biometricInit` — Inicializa e verifica disponibilidade
- `biometricAuthenticate` — Autentica e retorna token

#### Tema e Cores
- **themeParams** — Cores dinâmicas do Telegram
- **colorScheme** — light/dark mode automático
- `setHeaderColor` — Cor da status bar
- `setBackgroundColor` — Cor de fundo do app

#### Navegação e Fullscreen
- `expand()` — Expande para fullscreen
- `requestFullscreen()` — Solicita fullscreen explícito
- `lockOrientation()` — Trava em portrait
- `switchInlineQuery` — Convite a amigos via inline query
- `openLink` — Abre link externo
- `close()` — Fecha o Mini App

#### Identidade e Auth
- **initData** — String assinada para autenticação HMAC-SHA256
- **initDataUnsafe** — Dados do usuário (não verificados)

**Exemplos de Uso:** Incluídos na skill com código real do projeto.

---

### Design Specialist

**Arquivo:** `design-specialist.md`

**Descrição:** Especialista em Design — todos os padrões, definições e tudo que estiver na UI, UX para manter o app com a alma que já existe.

**Atenção Especial: Louvre Carousel**

O nome "Louvre" refere-se à mecânica de fundo que alterna entre **obras de arte clássicas**, criando uma experiência museológica digital.

#### Mecânica Louvre

**Funcionamento:**
1. Usuário navega para página (ex: `/follow`)
2. Componente monta → `useMemo` sorteia índice aleatório
3. Imagem escolhida é aplicada como background
4. Demais imagens são pré-carregadas em background
5. Próxima navegação → novo sorteio → nova obra

**Filosofia:**
> *"Cada navegação é uma visita ao museu — o usuário nunca sabe qual obra clássica verá, mas sempre será algo belo e inspirador."*

**Implementação:**
```typescript
// src/hooks/use-page-background.ts
export function usePageBackground(page: PageBackgroundKey): string {
  const images = PAGE_BACKGROUNDS[page];

  // Sorteia UMA vez por montagem
  const chosen = useMemo(() => {
    const idx = Math.floor(Math.random() * images.length);
    return images[idx];
  }, []);

  // Pré-carrega as demais em background
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

**Configuração:**
```typescript
// src/constants/images.ts
export const PAGE_BACKGROUNDS = {
  seguir: [
    `/images/seguir/seguir-1.jpg?v5`,  // Mona Lisa style
    `/images/seguir/seguir-2.jpg?v5`,  // Venus de Milo style
    // ... até 10 obras clássicas
  ],
  perfil: [/* 10 obras */],
  post: [/* 10 obras */],
};
```

#### Outros Domínios de Design

**Glassmorphism System:**
- Classes: `backdrop-blur-sm`, `bg-white/10`, `border-white/20`
- CSS: `.glass-card` com background translúcido e blur

**Física de Partículas:**
- Emojis usam física newtoniana real
- Sequência de Halton para distribuição uniforme
- Colisão elástica, repulsão, bounce, thermal noise
- Zero re-renders (escrita direta no DOM)

**Haptic Feedback por Emoji:**
- Cada emoji tem padrão de vibração único
- Ex: `'❤️': [60, 40, 60]` (batimento cardíaco)

**Page Transitions:**
- Framer Motion `AnimatePresence`
- Duration: 250ms, ease: cubic-bezier
- Shared element transitions com `layoutId`

**Telegram Theme Sync:**
- Cores sincronizadas com tema dinâmico
- CSS variables: `--tg-theme-bg-color`, `--tg-theme-text-color`, etc.

---

## 📊 Hierarquia de Uso

```
┌─────────────────────────────────────────┐
│     Deck Specialist               │ ← Visão geral
│     (Decisões arquiteturais)            │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
    ▼             ▼             ▼
┌─────────┐ ┌──────────┐ ┌────────────┐
│ Design  │ │ Telegram │ │   Code     │
│Specialist│ │Specialist│ │Contributor │
└─────────┘ └──────────┘ └────────────┘
    │             │             │
    └─────────────┼─────────────┘
                  │
                  ▼
         ┌────────────────┐
         │ Rule Enforcer  │ ← Validação final
         └────────────────┘
```

---

## ✅ Checklist de Seleção de Skill

| Tarefa | Skill Recomendada |
|--------|-------------------|
| Decisão arquitetural | `deck-specialist` |
| Novo componente UI | `design-specialist` + `code-contributor` |
| Feature Telegram nativa | `telegram-specialist` |
| Escrever código | `code-contributor` |
| Revisar arquitetura | `code-architecture` |
| Validar regras absolutas | `rule-enforcer` |
| Atualizar wiki | `wiki-workflow` |
| Entender projeto completo | `deck-specialist` |
| Background carrossel (Louvre) | `design-specialist` |
| Física de partículas | `design-specialist` |
| Haptic feedback | `telegram-specialist` ou `design-specialist` |
| CloudStorage | `telegram-specialist` |
| Biometria | `telegram-specialist` |

---

## 🔗 Links Relacionados

- [[Architecture]] — Arquitetura do projeto
- [[CodePatterns]] — Convenções e padrões
- [[TelegramIntegration]] — Integração Telegram
- [[Components]] — Componentes React
- `/skills/README.md` — Documentação completa das skills
- `docs/05-TECNOLOGIAS.md` — Stack tecnológico detalhado

---

*Skills Overview — Sistema de AI Skills para desenvolvimento do Deck.*
