---
tags: [wiki, format, instructions]
created: 2026-03-07
updated: 2026-03-07
sources: [.qwen/skills/wiki-workflow/SKILL.md, .qwen/skills/rule-enforcer/SKILL.md]
---

# Wiki Format

Guia de formatos de páginas wiki, links, e logs.

> 🎭 **Nota:** Páginas relacionadas a regras de negócio devem incluir campo `rule_review: approved | pending` no frontmatter.

---

## Frontmatter

Cada página wiki começa com um frontmatter YAML:

```yaml
---
tags: [categoria, tag]
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [caminho/para/arquivo1, caminho/para/arquivo2]
rule_review: approved | pending | required
absolute_rules: [BIGINT, RateLimiting3Camadas, ShadowBan, Ephemerality7Dias]
---
```

**Campos:**

| Campo | Descrição | Formato |
|-------|-------------|---------|
| `tags` | Categorias da página | Array de tags |
| `created` | Data de criação | YYYY-MM-DD |
| `updated` | Data da última atualização | YYYY-MM-DD |
| `sources` | Fontes de informação | Array de caminhos |
| `rule_review` | Status de revisão de regras | `approved` \| `pending` \| `required` |
| `absolute_rules` | Regras absolutas aplicáveis | Array de nomes de regras |

---

## Links para páginas wiki

Use colchetes duplos:

```markdown
[[Architecture]] — arquitetura geral do sistema
[[Database]] — schema e migrations
[[RateLimiting]] — sistema de rate limiting híbrido
```

---

## Links para arquivos do projeto

Caminhos relativos a partir da página wiki:

```markdown
[post.router.ts](../../server/routers/post.router.ts)
[schema.ts](../../drizzle/schema.ts)
```

---

## Citação de Código

Ao referenciar código, especifique o arquivo e contexto:

```markdown
De `post.repository.ts`:
```typescript
// Filtro shadow ban aplicado em todas as queries de leitura
const shadowBanFilter = eq(users.shadowBanned, false);
```
```

---

## Formato log.md

Cada entrada em `wiki/log.md`:

```markdown
## [YYYY-MM-DD] tipo | Breve descrição

**Tipo:** ingest | update | setup | lint | rule-review

### Descrição

O que foi feito.

### Fontes

- `caminho/para/arquivo1.ts`
- `caminho/para/arquivo2.md`

### O que mudou

| Antes | Depois |
|-------|--------|
| antigo | novo |

### Revisão de Regras Absolutas

- [ ] BIGINT para telegramIds validado
- [ ] Rate limiting 3 camadas verificado
- [ ] Shadow ban filter aplicado
- [ ] Efemeridade 7 dias mantida
```

**Tipos de entrada:**

| Tipo | Descrição |
|------|-------------|
| `setup` | Configuração inicial |
| `ingest` | Adicionando novo conhecimento |
| `update` | Atualizando páginas existentes |
| `lint` | Corrigindo problemas wiki |
| `rule-review` | Validação contra regras absolutas |

---

## Formato index.md

Catálogo de páginas wiki com categorias:

```markdown
# Wiki Index

## 📋 Visão Geral

| Categoria | Página | Descrição |
|-----------|--------|-------------|
| overview | [[Página]] | Descrição |
```

**Regras:**
- Agrupar por categorias
- Usar emoji para separação visual
- Toda página deve estar no catálogo
- Breve descrição para cada página
- Incluir seção de regras absolutas aplicáveis
