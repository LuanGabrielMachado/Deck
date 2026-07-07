# Skills do Projeto Deck

Esta pasta contém todas as **AI Skills** usadas para auxiliar no desenvolvimento e manutenção do projeto Deck.

## 📚 Skills Disponíveis

### Skills Originais (.qwen/skills/)

As skills originais estão em `.qwen/skills/` e são usadas pelo Qwen AI diretamente.

### Skills Organizadas (skills/)

Esta pasta (`/skills/`) contém cópias organizadas de todas as skills, incluindo as 3 novas skills especializadas criadas para o projeto.

---

## 🔹 Skills Existentes (Originais)

| Skill | Arquivo | Descrição |
|-------|---------|-----------|
| **Code Architecture** | `code-architecture.md` | Verifica arquitetura de código para conformidade SOLID, DI, e padrões do projeto |
| **Code Contributor** | `code-contributor.md` | Ajuda a adicionar e modificar código conforme padrões estabelecidos |
| **Rule Enforcer** | `rule-enforcer.md` | Realiza validação de regras absolutas do projeto (BIGINT, rate limiting, shadow ban, etc.) |
| **Telegram Integration** | `telegram-integration.md` | Especialista em Telegram WebApp SDK — MainButton, HapticFeedback, CloudStorage, etc. |
| **Wiki Workflow** | `wiki-workflow.md` | Gerencia o sistema wiki do projeto — operações ingest, query, lint |

---

## ✨ Novas Skills Criadas

### 1. Deck Specialist

**Arquivo:** `deck-specialist.md`

**Descrição:** Especialista em Deck — decisões de design, arquitetura, convenções, padrões, e todo conhecimento necessário sobre o projeto para melhor uso da estrutura.

**Domínios de Conhecimento:**
- Arquitetura tRPC + Drizzle ORM + Next.js 15
- Design Patterns (SOLID, DI, Repository Pattern)
- Convenções (BIGINT, glassmorphism, page transitions, type-safety)
- Regras de Negócio (rate limiting, efemeridade, shadow ban)
- Telegram Integration (WebApp SDK, recursos nativos)
- UI/UX (física de partículas, animações 60fps, haptic feedback)

**Quando usar:**
- Tomar decisões arquiteturais
- Avaliar trade-offs de implementação
- Entender contexto completo do projeto
- Revisar código com visão sistêmica
- Planejar novas features

---

### 2. Telegram Specialist

**Arquivo:** `telegram-specialist.md`

**Descrição:** Especialista em Telegram — integração e desenvolvimento específico do Telegram, com exemplos de como usar integrações, funções (CloudStorage, Haptic Feedback, Botões integrados, tudo que pode ser integrado nativamente pelo Telegram).

**Recursos Telegram Cobertos:**
- **MainButton, BackButton, SecondaryButton** — UI nativa dinâmica
- **HapticFeedback** — Vibração por emoji, clicks, selections
- **CloudStorage** — Rate limiting camada 1, persistência sincronizada
- **BiometricManager** — Face ID, Touch ID, Fingerprint
- **ThemeParams** — Cores dinâmicas (dark/light mode)
- **Popup, Alert, Confirm** — Diálogos nativos
- **switchInlineQuery, openLink, close** — Navegação
- **initData** — Autenticação HMAC-SHA256
- **Fullscreen, lockOrientation** — Controle de tela

**Quando usar:**
- Implementar features nativas do Telegram
- Integrar Bot API para notificações
- Usar CloudStorage para persistência
- Implementar biometria
- Criar popups, alerts, confirms nativos
- Gerenciar tema (dark/light mode)

---

### 3. Design Specialist

**Arquivo:** `design-specialist.md`

**Descrição:** Especialista em Design — todos os padrões, definições e tudo que estiver na UI, UX para manter o app com a alma que já existe. Atenção especial ao sistema de carrossel de fundo (**Louvre Mechanics**) onde imagens de fundo alternam entre obras de arte clássicas.

**Domínios de Design:**
- **Louvre Carousel** — Carrossel de obras de arte clássicas (sorteio por navegação, pré-carregamento)
- **Glassmorphism** — Sistema visual consistente (backdrop-blur, bg-white/10, border-white/20)
- **Física de Partículas** — Emojis com física newtoniana real (Halton sequence, colisão elástica, thermal noise)
- **Haptic Feedback por Emoji** — Vibração única para cada emoji
- **Page Transitions** — Transições suaves com Framer Motion (250ms, cubic-bezier)
- **Telegram Theme Sync** — Cores sincronizadas com tema dinâmico

**Mecânica Louvre (Destaque Especial):**
> *"Cada navegação é uma visita ao museu — o usuário nunca sabe qual obra clássica verá, mas sempre será algo belo e inspirador."*

- Sorteia imagem aleatória por montagem de componente
- Pré-carrega demais imagens em background
- Troca instantânea, sem loading
- Cache persistente com headers `immutable`
- Identidade visual: Deck = arte + tecnologia

**Quando usar:**
- Criar novos componentes UI
- Modificar layouts existentes
- Implementar animações
- Adicionar feedback tátil/visual
- Revisar consistência visual
- Preservar a "alma" do projeto

---

## 📋 Hierarquia de Uso

```
┌─────────────────────────────────────────┐
│         Deck Specialist           │ ← Visão geral, decisões arquiteturais
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

---

## 🔗 Links Relacionados

- **Wiki do Projeto:** `docs/wiki/index.md`
- **Documentação Técnica:** `docs/00-DOCUMENTO-MAE-VISAO-GERAL.md` a `docs/10-FUNCIONAMENTO.md`
- **Skills Originais:** `.qwen/skills/`
- **Regras Absolutas:** `docs/wiki/CodePatterns.md`

---

*Skills organizadas para melhor desenvolvimento do Deck.*
