# Wiki Log

Diário cronológico de todas as mudanças na wiki.

---

## [2026-03-07] setup | Inicialização da Wiki

**Tipo:** setup
**Autor:** AI agent

### Descrição

Estrutura inicial da wiki criada para projeto Deck.

### Arquivos criados

- `docs/wiki/index.md` — catálogo de páginas wiki
- `docs/wiki/log.md` — log de mudanças
- `docs/wiki/Wiki Format.md` — guia de formatação de páginas

### Regras Absolutas Aplicadas

- BIGINT para telegramIds em todas as tabelas
- Rate limiting híbrido (3 camadas) documentado
- Shadow ban filter especificado para queries de leitura
- Efemeridade de posts (7 dias) com admin isento
- Auditoria admin via LogVault obrigatória
- Glassmorphism e page transitions preservados
- Type-safety tRPC end-to-end mantido

## [2026-03-07] ingest | Initial Ingest - Páginas Base Criadas

**Tipo:** ingest
**Autor:** AI agent

### Descrição

Páginas wiki iniciais criadas após análise do código fonte do projeto.

### Arquivos criados

- `docs/wiki/Architecture.md` — Arquitetura tRPC + Drizzle ORM
- `docs/wiki/index.md` — Catálogo de páginas (atualizado)
- `docs/wiki/Wiki Format.md` — Guia de formatação
- `docs/wiki/log.md` — Este arquivo

### Fontes analisadas

- `drizzle/schema.ts` — Schema do banco de dados
- `server/routers/` — Routers tRPC
- `server/repositories/` — Repositórios Drizzle
- `src/app/` — Estrutura de páginas Next.js
- `src/components/` — Componentes React
- `src/hooks/` — Hooks customizados
- `src/lib/` — Utilitários e integração Telegram

### Próximos passos

- Criar página Database.md com schema detalhado
- Criar página RateLimiting.md com 3 camadas documentadas
- Criar página ShadowBan.md com filtro especificado
- Criar página Ephemerality.md com regra de 7 dias
- Criar página CodePatterns.md com convenções
- Acionar rule-enforcer para validação das regras absolutas


## [2026-03-07] ingest | Páginas de Regras de Negócio Criadas

**Tipo:** ingest
**Autor:** AI agent

### Descrição

Páginas wiki detalhando regras absolutas do projeto criadas após análise completa do código fonte.

### Arquivos criados

- `docs/wiki/Database.md` — Schema completo com todas tabelas, índices e relacionamentos
- `docs/wiki/RateLimiting.md` — Sistema híbrido de 3 camadas documentado
- `docs/wiki/ShadowBan.md` — Filtro shadow ban em todas queries de leitura
- `docs/wiki/Ephemerality.md` — Regra de posts efêmeros (7 dias) com admin isento
- `docs/wiki/CodePatterns.md` — Convenções BIGINT, glassmorphism, page transitions, type-safety

### Fontes analisadas

- `drizzle/schema.ts` — Todas tabelas com BIGINT confirmadas
- `server/repositories/post.repository.ts` — Shadow ban filter (linhas 111, 398, 445), cleanupExpiredPosts (linha 344)
- `server/repositories/user.repository.ts` — lastPostAt/lastReplyAt para rate limiting (linhas 189-219)
- `server/repositories/admin.repository.ts` — Auditoria via adminActions (linhas 7, 46, 55)
- `src/lib/rate-limit-cache.ts` — Camada 1 CloudStorage
- `src/components/post-card.tsx` — Glassmorphism (linha 333)
- `src/app/follow/page.tsx` — AnimatePresence (linhas 4, 184, 209)

### Regras Absolutas Validadas

| Regra | Status no Código | Localização |
|-------|------------------|-------------|
| BIGINT para telegramIds | ✅ Confirmado | schema.ts (todas tabelas) |
| Rate limiting 3 camadas | ✅ Confirmado | CloudStorage → users.lastPostAt → post count |
| Shadow ban filter | ✅ Confirmado | post.repository.ts (3 queries) |
| Posts efêmeros 7 dias | ✅ Confirmado | cleanupExpiredPosts() + filtros |
| Auditoria admin | ✅ Confirmado | adminActions.insert em cada mutation |
| Glassmorphism | ✅ Confirmado | post-card.tsx glass-card class |
| Page transitions | ✅ Confirmado | follow/page.tsx AnimatePresence |
| Type-safety tRPC | ✅ Confirmado | Zod schemas + tipos inferidos |

### Próximos passos

- Sistema wiki-first completo e operacional
- Todas skills em `.qwen/skills/` configuradas
- QWEN.md na raiz com regras wiki-first
- .qwen removido do .gitignore conforme solicitado
- Wiki pronta para uso: qualquer agente deve seguir fluxo Wiki → Código → Atualizar Wiki

## [2026-03-14] ingest | AI Skills Especializadas Criadas

**Tipo:** ingest
**Autor:** AI agent

### Descrição

Três novas AI Skills especializadas foram criadas para auxiliar no desenvolvimento do projeto, focadas em diferentes domínios de conhecimento.

### Skills Criadas

1. **Deck Specialist** (`skills/deck-specialist.md`)
   - Especialista geral em arquitetura, design, convenções e padrões do projeto
   - Domínios: tRPC + Drizzle, SOLID, BIGINT, glassmorphism, rate limiting, efemeridade, shadow ban
   
2. **Telegram Specialist** (`skills/telegram-specialist.md`)
   - Especialista em integração Telegram completa
   - Recursos: CloudStorage, HapticFeedback, BiometricManager, MainButton, ThemeParams, Popup, Alert, Confirm
   
3. **Design Specialist** (`skills/design-specialist.md`)
   - Guardião da identidade visual e UX do projeto
   - Domínios: Louvre Carousel (obras de arte clássicas), Glassmorphism, Física de Partículas, Page Transitions

### Mecânica Louvre (Destaque)

A skill **Design Specialist** dá atenção especial ao sistema de carrossel de fundo chamado "Louvre":

- **Nome:** Referencia o museu Louvre — obras de arte clássicas
- **Mecânica:** Sorteia imagem aleatória por navegação (montagem de componente)
- **Performance:** Pré-carregamento em background, troca instantânea
- **Cache:** Headers `immutable` com versionamento (`?v5`)
- **Filosofia:** *"Cada navegação é uma visita ao museu"*

### Arquivos Criados

- `skills/deck-specialist.md` — Skill especialista geral
- `skills/telegram-specialist.md` — Skill especialista Telegram
- `skills/design-specialist.md` — Skill especialista Design
- `skills/README.md` — Documentação organizada de todas skills
- `docs/wiki/SkillsOverview.md` — Página wiki sobre sistema de skills

### Arquivos Atualizados

- `docs/wiki/index.md` — Adicionada seção "AI Skills do Projeto" e link para [[SkillsOverview]]
- `docs/wiki/log.md` — Esta entrada

### Skills Existentes Preservadas

As 5 skills originais foram copiadas para `/skills/`:
- `code-architecture.md`
- `code-contributor.md`
- `rule-enforcer.md`
- `telegram-integration.md`
- `wiki-workflow.md`

### Hierarquia de Uso

```
Deck Specialist (visão geral)
    ├── Design Specialist (UI/UX, Louvre Carousel)
    ├── Telegram Specialist (integração nativa)
    └── Code Contributor (implementação)
            ↓
        Rule Enforcer (validação final)
```

### Fontes Analisadas

- `src/hooks/use-page-background.ts` — Implementação Louvre Carousel
- `src/constants/images.ts` — Configuração PAGE_BACKGROUNDS
- `src/hooks/use-physics-particles.ts` — Física de partículas
- `src/lib/telegram-utils.ts` — Haptic Feedback, botões nativos
- `docs/05-TECNOLOGIAS.md` — Stack tecnológico completo
- `docs/wiki/CodePatterns.md` — Regras absolutas
- `docs/wiki/Architecture.md` — Arquitetura do projeto

### Próximos Passos

- Skills disponíveis em `/skills/` para consulta
- Wiki atualizada com seção de AI Skills
- Documentação completa em `skills/README.md`
- Nova página wiki [[SkillsOverview]] criada
