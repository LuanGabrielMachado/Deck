# Qwen Code — Regras do Projeto Maracutáia

## REGRA WIKI-FIRST

Para **qualquer** trabalho com o projeto (codificação, review, refatoração, novas features, correções de bugs) o agente **deve** começar estudando a wiki.

### Procedimento

0. **Escolher uma skill** — determinar tipo de tarefa e usar skill correspondente:

   | Situação | Skill |
   |-----------|-------|
   | Escrever novo código, feature, bug fix | `code-contributor` |
   | Revisão de PR, check de arquitetura, avaliação de design | `code-architecture` |
   | Atualizar wiki, encontrar informação do projeto | `wiki-workflow` |
   | **Validação de regras absolutas** | **`rule-enforcer`** |

1. **Wiki** — primeiro ler `docs/wiki/index.md`, encontrar páginas relevantes, e usá-las como fonte **primária** de conhecimento sobre o projeto.
2. **Código** — apenas se wiki for insuficiente, ler arquivos fonte, documentação, configuração.
3. **Rule-Check** — se alteração toca em regras absolutas → acionar `rule-enforcer`.
4. **Atualizar wiki** — após trabalhar com código, atualizar páginas wiki relevantes e adicionar entrada em `docs/wiki/log.md`.

### Por Que

A wiki contém conhecimento condensado e estruturado do projeto. Sem wiki-first, o agente estuda código do zero toda vez, desperdiçando contexto e tempo.

---

## REGRAS ABSOLUTAS DO PROJETO

Estas regras **NÃO PODEM** ser violadas:

| # | Regra | Descrição |
|---|-------|-----------|
| 1 | **BIGINT para telegramIds** | Todas as colunas telegramId devem usar BIGINT (modo number) |
| 2 | **Rate limiting 3 camadas** | Frontend CloudStorage → DB users.lastPostAt → DB posts count |
| 3 | **Shadow ban filter** | Todas queries de leitura filtram `users.shadowBanned = false` |
| 4 | **Posts efêmeros 7 dias** | Posts expiram em 7 dias, admin isento via cleanup cron |
| 5 | **Auditoria admin** | Toda ação no dashboard registra em `adminActions` e LogVault |
| 6 | **Glassmorphism** | Componentes UI usam `backdrop-blur`, `bg-white/10`, `glass-card` |
| 7 | **Page transitions** | Navegação usa Framer Motion `AnimatePresence`, `layoutId` |
| 8 | **Type-safety tRPC** | Zod schemas, tipos inferidos, nunca `as any` ou casts inseguros |

**Regra:** Sem `rule_review: approved` na wiki → NÃO MERGE.

---

## VERIFICAÇÃO DE CÓDIGO

Após escrever ou modificar código, o agente **deve** abrir páginas wiki relevantes e verificar o resultado contra regras e convenções descritas lá.

---

## Skills do Projeto

Quatro skills disponíveis em `.qwen/skills/` — todas contêm regra wiki-first:

| Skill | Propósito | Quando Usar |
|-------|---------|-------------|
| `code-contributor` | Escrever e modificar código conforme padrões | Criar features, correções de bugs, refatoração |
| `code-architecture` | Revisão de arquitetura para SOLID, DI, padrões | Revisão de código, avaliação de design, design de módulos |
| `wiki-workflow` | Gerenciamento wiki — ingest, query, lint | Atualizar wiki, encontrar informação, checks de integridade |
| **`rule-enforcer`** | **Validação de regras absolutas** | **Qualquer alteração que toque regras do projeto** |
| `telegram-integration` | **Especialista Telegram WebApp SDK** | **MainButton, HapticFeedback, CloudStorage, BiometricManager** |

**Divisão de responsabilidade:**
- `code-contributor` — **escreve** código
- `code-architecture` — **revisa** arquitetura
- `wiki-workflow` — **gerencia** wiki
- `rule-enforcer` — **aprova** regras absolutas
- `telegram-integration` — **valida** integração com Telegram
- `code-contributor` referencia `code-architecture` para regras arquiteturais
- `code-contributor` referencia `wiki-workflow` para formato de páginas wiki
- **`code-contributor` DEVE acionar `rule-enforcer` para alterações que tocam regras absolutas**

**Não usar skills fora de seu propósito pretendido.**

---

## Hierarquia de Decisão

Em caso de conflito entre conveniência e regras:

1. **Regras Absolutas** — NUNCA negociar
2. **Corretude** (funcionalidade correta) — Sempre validar
3. **Performance** — Otimizar apenas após 1 e 2 garantidos
4. **Conveniência** — Último a considerar

---

## Wiki

Instruções para trabalhar com wiki estão nas skills.

Estrutura wiki:

```
docs/
└── wiki/
    ├── index.md         # Catálogo
    ├── log.md           # Log de mudanças
    ├── Wiki Format.md   # Guia de formato
    ├── Architecture.md  # Arquitetura tRPC + Drizzle
    ├── Components.md    # Componentes React e hooks
    ├── Database.md      # Schema e migrations
    ├── RateLimiting.md  # 3 camadas de rate limit
    ├── Ephemerality.md  # Posts de 7 dias, admin isento
    ├── ShadowBan.md     # Filtro em queries de leitura
    └── CodePatterns.md  # Convenções e padrões
```

---

## Integração com Documentação Existente

O projeto possui ~28.000+ linhas de documentação técnica em `docs/00-*.md` a `docs/10-*.md`.

A wiki (`docs/wiki/`) é uma **camada de abstração superior** que:
- Fornece visão geral navegável
- Centraliza regras e padrões
- Linka para documentação detalhada existente
- Mantém-se atualizada automaticamente

**Fluxo:** Wiki (visão geral) → Documentação Técnica (detalhes) → Código (implementação)
