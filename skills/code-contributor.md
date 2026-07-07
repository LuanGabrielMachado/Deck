---
name: code-contributor
description: Ajuda a adicionar e modificar código do projeto conforme padrões estabelecidos. Use ao criar features, corrigir bugs, refatorar, ou escrever documentação.
requires_review: true
---

# Code Contributor

## PRIORIDADE DE FONTES (OBRIGATÓRIO)

Para **qualquer** solicitação de escrever código, refatorar, corrigir bugs, ou criar features:

1. **Primeiro** ler `docs/wiki/index.md`
2. **Encontrar** páginas wiki relevantes e estudar seu conteúdo
3. **Usar wiki como fonte primária** de decisões arquiteturais, padrões, e convenções
4. **Apenas se** wiki não tiver informação necessária — ler arquivos do projeto
5. **Após** estudar código do projeto — atualizar wiki se nova ou alterada informação for encontrada

**Wiki é a fonte primária de conhecimento, não o código do projeto.**

### Wiki vs Código — Onde Encontrar O Quê

| Tipo de informação | Onde procurar |
|------------------|---------------|
| Arquitetura, padrões, convenções | **Wiki** — visão geral e links |
| Detalhes de implementação | **Código** — arquivos fonte |
| Quais testes existem | **Wiki** |
| O que cada método de teste testa | **Código** — arquivos de teste |
| Regras absolutas | **Wiki** ([[CodePatterns]]) |
| Implementação de procedures tRPC | **Código** — routers |

---

## Propósito da Skill

Esta skill é a **bancada de trabalho do desenvolvedor**. Contém regras para escrever código conforme padrões do projeto.

**Quando usar:**
- Criar novas features ou services
- Corrigir bugs
- Refatorar código existente
- Escrever documentação do projeto

**Quando NÃO usar:**
- Para revisão arquitetural → use `code-architecture`
- Para gerenciamento wiki → use `wiki-workflow`
- Para validação de regras → use `rule-enforcer`

---

## Antes de Começar o Trabalho

Determine o tipo de tarefa e leia as páginas wiki relevantes:

| Tipo de tarefa | Ler em wiki |
|-----------|-------------|
| Novo componente | Architecture, Components |
| Mudança de código | CodePatterns |
| Trabalho com banco de dados | Database, Repository patterns |
| Contrato de API | Architecture (tRPC procedures) |
| **Rate limiting** | **RateLimiting** |
| **Efemeridade** | **Ephemerality** |
| **Shadow ban** | **ShadowBan** |

---

## Regras Absolutas Obrigatórias

Ao trabalhar com código do Deck:

1. **BIGINT para telegramIds** — nunca usar integer ou number simples
2. **Rate limiting 3 camadas** — frontend CloudStorage → DB users.lastPostAt → DB posts count
3. **Shadow ban filter** — todas queries de leitura filtram `users.shadowBanned = false`
4. **Efemeridade 7 dias** — posts expiram, admin isento (via `cleanupExpiredPosts`)
5. **Auditoria admin** — toda ação no dashboard registra em `adminActions`
6. **Glassmorphism** — componentes UI usam `backdrop-blur`, `bg-white/10`, `glass-card`
7. **Page transitions** — navegação usa Framer Motion `AnimatePresence`, `layoutId`
8. **Type-safety tRPC** — Zod schemas, tipos inferidos, nunca `as any`

---

## Checklist de Validação (Pré-Commit)

Antes de considerar uma tarefa completa:

- [ ] Wiki consultada primeiro
- [ ] Regras absolutas seguidas (se aplicável)
- [ ] BIGINT usado para telegramIds
- [ ] Shadow ban filter aplicado (queries de leitura)
- [ ] Rate limiting implementado (3 camadas se necessário)
- [ ] `rule-enforcer` acionado para validação
- [ ] Wiki atualizada com mudanças
- [ ] Entrada adicionada em `log.md`
