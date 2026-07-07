---
name: code-architecture
description: Verifica arquitetura de código para conformidade SOLID, DI, e padrões do projeto. Use durante code review, criação de classes, design de módulos, ou análise de solução.
requires_review: false
---

# Code Architecture

## PRIORIDADE DE FONTES (OBRIGATÓRIO)

Para **qualquer** solicitação de análise arquitetural, code review, criação de classes, ou design de módulos:

1. **Primeiro** ler `docs/wiki/index.md`
2. **Encontrar** páginas wiki relevantes e estudá-las
3. **Usar wiki como fonte primária** de regras arquiteturais, padrões, e convenções
4. **Apenas se** wiki não tiver informação necessária — ler arquivos do projeto
5. **Após** análise — fornecer review com achados específicos e recomendações

**Wiki é a fonte primária de conhecimento.**

---

## Propósito da Skill

Esta skill é o **revisor arquitetural**. Avalia código para conformidade com princípios SOLID, padrões do projeto, padrões DI, e arquitetura tRPC.

**Quando usar:**
- Code review
- Avaliando decisões arquiteturais antes da implementação
- Verificando corretude de configuração DI
- Analisando relacionamentos entre componentes

**Quando NÃO usar:**
- Para escrever novo código → use `code-contributor`
- Para correções de bugs → use `code-contributor`
- Para validação de regras absolutas → use `rule-enforcer`

---

## Critérios de Revisão

### Arquitetura tRPC

- [ ] Routers organizados por domínio (post, user, admin, etc.)
- [ ] Procedures com inputs validados via Zod
- [ ] Tipos inferidos do Drizzle (type-safe)
- [ ] Contexto compartilhado via `createTRPCContext`

### Repositórios (Drizzle ORM)

- [ ] Queries tipadas com schema Drizzle
- [ ] Relacionamentos definidos em `relations.ts`
- [ ] Índices apropriados para performance
- [ ] Shadow ban filter em queries de leitura

### Componentes React

- [ ] Separação de responsabilidades (header, content, actions)
- [ ] Hooks customizados para lógica reutilizável
- [ ] Glassmorphism consistente (Tailwind classes)
- [ ] Page transitions com Framer Motion

### Padrões de Design

- [ ] Padrões documentados em [[CodePatterns]] seguidos
- [ ] Naming conventions consistentes
- [ ] Tratamento de erros padronizado

---

## Integração com Rule-Enforcer

Se a revisão arquitetural identificar questões de regras absolutas:

1. Documentar preocupação no review
2. Acionar `rule-enforcer` para validação
3. Não aprovar PR até `rule_review: approved`
