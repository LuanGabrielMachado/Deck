---
name: rule-enforcer
description: Realiza validação de regras absolutas do projeto Deck. Garante conformidade com BIGINT, rate limiting, shadow ban, efemeridade, auditoria, glassmorphism, page transitions, e type-safety.
requires_double_check: true
absolute_rules: [BIGINT, RateLimiting3Camadas, ShadowBan, Ephemerality7Dias, AuditoriaAdmin, Glassmorphism, PageTransitions, TypeSafety]
---

# Rule Enforcer

## ⚠️ PROPÓSITO CRÍTICO

Esta skill é o **guardião das regras absolutas** do Deck. Nenhuma alteração pode ser aprovada sem validação desta skill contra as 8 regras absolutas.

**Responsabilidades:**
1. Validar tipos de dados — BIGINT para todos os telegramIds
2. Verificar rate limiting — 3 camadas implementadas corretamente
3. Auditar shadow ban — todas as queries de leitura filtram shadow banned
4. Garantir efemeridade — posts expiram em 7 dias, admin isento
5. Log de auditoria — ações admin sempre registradas no LogVault
6. UI consistente — glassmorphism e page transitions preservados
7. Type-safety — tRPC mantém tipos end-to-end

---

## REGRAS ABSOLUTAS OBRIGATÓRIAS

Esta skill DEVE consultar as seguintes regras antes de aprovar alterações:

| Regra | Aplicação | Verificação | Última Confirmação |
|-------|-----------|-------------|-------------------|
| **BIGINT para telegramIds** | Todas colunas telegramId | Drizzle schema, repositórios, routers | Sempre |
| **Rate limiting 3 camadas** | Posts e replies | Frontend CloudStorage → DB users.lastPostAt → DB posts count | Sempre |
| **Shadow ban filter** | Todas queries de leitura | `getTimelinePosts`, `getUserPosts`, `search`, `thread` | Sempre |
| **Posts efêmeros 7 dias** | Cleanup cron + queries | `cleanupExpiredPosts`, admin bypass | Sempre |
| **Auditoria admin** | Todas ações no dashboard | `adminActions.insert` em cada mutation | Sempre |
| **Glassmorphism** | Componentes UI | Classes Tailwind: `backdrop-blur`, `bg-white/10` | Sempre |
| **Page transitions** | Navegação entre páginas | Framer Motion `AnimatePresence`, `layoutId` | Sempre |
| **Type-safety tRPC** | Procedures e inputs | Zod schemas, tipos inferidos, sem `as any` | Sempre |

> 🎭 **Regra:** Se uma regra absoluta é violada, a alteração é REPROVADA imediatamente.

---

## PROCESSO DE VALIDAÇÃO

### Fase 1: Identificação

Antes de validar qualquer alteração:

1. Identificar tipo de alteração (nova procedure, component, repository, etc.)
2. Determinar quais regras absolutas são aplicáveis
3. Consultar wiki para contexto das regras
4. Documentar regras identificadas

### Fase 2: Validação

Verificar conformidade com cada regra aplicável:

#### BIGINT para telegramIds

- [ ] Coluna definida como `bigint("telegramId", { mode: "number" })`
- [ ] Tipos TypeScript inferidos corretamente
- [ ] Nenhum `integer` ou `number` usado para telegramId
- [ ] Repositórios usam BIGINT nas queries

#### Rate Limiting 3 Camadas

- [ ] Camada 1: Frontend CloudStorage verifica último post
- [ ] Camada 2: DB `users.lastPostAt` / `users.lastReplyAt`
- [ ] Camada 3: Contagem de posts nas últimas X horas
- [ ] Regra "mais restritivo vence" aplicada

#### Shadow Ban Filter

- [ ] Query inclui `eq(users.shadowBanned, false)` ou subquery equivalente
- [ ] Admin vê posts shadow banned (bypass quando apropriado)
- [ ] Todas procedures de leitura: `getTimelinePosts`, `getUserPosts`, `search`, `thread`

#### Efemeridade 7 Dias

- [ ] Cron `cleanupExpiredPosts` remove posts > 7 dias
- [ ] Admin isento da efemeridade
- [ ] Queries aplicam filtro de data quando necessário

#### Auditoria Admin

- [ ] Cada mutation no admin router registra em `adminActions`
- [ ] Log inclui: adminId, action, targetId, previousValue, newValue
- [ ] Contexto `system` usado no LogVault

#### Glassmorphism

- [ ] Componentes UI usam `backdrop-blur-sm` ou similar
- [ ] Cards usam `bg-white/10` ou `bg-black/20`
- [ ] Classe `glass-card` aplicada consistentemente

#### Page Transitions

- [ ] Navegação usa `AnimatePresence` do Framer Motion
- [ ] `layoutId` para transições suaves entre páginas
- [ ] `page-transition.tsx` ou padrão equivalente

#### Type-Safety tRPC

- [ ] Inputs validados com Zod schemas
- [ ] Tipos inferidos do Drizzle (`typeof posts.$inferSelect`)
- [ ] Nenhum `as any` ou type casting inseguro
- [ ] Retorno das procedures tipado corretamente

### Fase 3: Documentação

Após validação:

1. Atualizar `rule_review` no frontmatter da página wiki
2. Adicionar entrada em `log.md` com tipo `rule-review`
3. Listar regras validadas
4. Documentar quaisquer ressalvas ou condições

---

## REGRAS DE APROVAÇÃO/REPROVAÇÃO

### Aprovar Apenas Se:

1. Todos os itens do checklist aplicável marcados
2. Regras absolutas consultadas e seguidas
3. Nenhuma violação de regra detectada
4. Wiki atualizada com justificativa se necessário

### Reprovar Se:

1. Qualquer regra absoluta violada
2. BIGINT não usado para telegramIds
3. Shadow ban filter ausente em query de leitura
4. Rate limiting não implementado corretamente
5. Auditoria admin faltando
6. Glassmorphism ou page transitions quebrados
7. Type-safety comprometido (`as any`, casts inseguros)

---

## INTEGRAÇÃO COM OUTRAS SKILLS

### Com code-contributor

- `code-contributor` aciona `rule-enforcer` antes de finalizar alterações
- `rule-enforcer` fornece checklist específico para tipo de alteração
- Aprovação obrigatória antes de commit

### Com wiki-workflow

- `wiki-workflow` marca páginas com `rule_review: pending`
- `rule-enforcer` atualiza para `rule_review: approved`
- `log.md` registra entrada com tipo `rule-review`

### Com code-architecture

- `code-architecture` identifica preocupações arquiteturais
- `rule-enforcer` valida contra regras absolutas
- Ambas devem aprovar para PR merge

---

## PROIBIÇÕES ABSOLUTAS

- NUNCA aprovar integer para telegramIds — sempre BIGINT
- NUNCA permitir query de leitura sem shadow ban filter
- NUNCA aceitar rate limiting com menos de 3 camadas
- NUNCA pular validação de efemeridade
- NUNCA aprovar ação admin sem auditoria
- NUNCA permitir glassmorphism inconsistente
- NUNCA aceitar page transitions quebradas
- NUNCA aprovar type casting inseguro (`as any`)
