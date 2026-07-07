# Wiki Index

Catálogo de todas as páginas wiki para projeto Deck.

## 📋 Visão Geral

| Categoria | Página | Descrição |
|-----------|--------|-------------|
| overview | [[Architecture]] | Arquitetura tRPC + Drizzle ORM |
| overview | [[Components]] | Componentes React e hooks customizados |
| database | [[Database]] | Schema Drizzle, migrations, relacionamentos |
| business | [[RateLimiting]] | 3 camadas de rate limit, regra "mais restritivo vence" |
| business | [[Ephemerality]] | Posts expiram em 7 dias, admin isento |
| security | [[ShadowBan]] | Filtro em todas queries de leitura |
| patterns | [[CodePatterns]] | Convenções, BIGINT, glassmorphism, nomenclatura |
| testing | [[Testing]] | Estratégia de testes com Vitest |
| telegram | [[TelegramIntegration]] | Telegram WebApp SDK, recursos nativos |
| skills | [[SkillsOverview]] | Visão geral das AI Skills do projeto |

## 🤖 AI Skills do Projeto

O projeto utiliza um sistema de **AI Skills** especializadas para auxiliar no desenvolvimento. As skills estão organizadas em `/skills/` (cópias organizadas) e `.qwen/skills/` (usadas pelo Qwen AI).

### Skills Existentes

| Skill | Descrição |
|-------|-----------|
| **code-architecture** | Verifica arquitetura de código para conformidade SOLID, DI, e padrões |
| **code-contributor** | Ajuda a adicionar e modificar código conforme padrões estabelecidos |
| **rule-enforcer** | Valida regras absolutas (BIGINT, rate limiting, shadow ban, etc.) |
| **telegram-integration** | Especialista em Telegram WebApp SDK |
| **wiki-workflow** | Gerencia o sistema wiki — ingest, query, lint |

### Novas Skills Criadas

| Skill | Descrição |
|-------|-----------|
| **deck-specialist** | Especialista geral — arquitetura, design, convenções, padrões do projeto |
| **telegram-specialist** | Integração Telegram completa — CloudStorage, Haptic Feedback, Botões, Biometria |
| **design-specialist** | UI/UX — Glassmorphism, Louvre Carousel (obras de arte clássicas), Física de Partículas |

**Ver:** [[SkillsOverview]] ou `/skills/README.md` para documentação completa.

## 📚 Documentação Técnica Completa

| Documento | Descrição | Link |
|-----------|-----------|------|
| Documento Mestre | Visão geral completa do projeto | [00-DOCUMENTO-MAE](../00-DOCUMENTO-MAE-VISAO-GERAL.md) |
| Resumo Executivo | Funcionalidades e stack tecnológico | [01-RESUMO](../01-RESUMO-EXECUTIVO.md) |
| API Endpoints | Especificação completa tRPC | [02-API](../02-API-ENDPOINTS.md) |
| Backend | Implementação server-side | [03-BACKEND](../03-BACKEND.md) |
| Database | Schema e migrations detalhados | [04-DATABASE](../04-DATABASE.md) |
| Tecnologias | Stack completo e versões | [05-TECNOLOGIAS](../05-TECNOLOGIAS.md) |
| Fluxos | Fluxos de usuário e sistema | [06-FLUXOS](../06-FLUXOS.md) |
| Admin | Sistema de administração | [07-ADMIN](../07-ADMIN.md) |
| Notificações | Sistema de notificações via Bot | [08-NOTIFICACOES](../08-NOTIFICACOES.md) |
| LogVault | Sistema de logging estruturado | [09-LOGVAULT](../09-LOGVAULT.md) |
| Funcionamento | Guia de funcionamento detalhado | [10-FUNCIONAMENTO](../10-FUNCIONAMENTO.md) |

## 🔒 Regras Absolutas Obrigatórias

| Regra | Status | Verificação |
|-------|--------|-------------|
| BIGINT para telegramIds | ✅ Obrigatório | Schema Drizzle, repositórios, routers |
| Rate limiting 3 camadas | ✅ Obrigatório | Frontend → DB users → DB posts |
| Shadow ban filter | ✅ Obrigatório | `getTimelinePosts`, `getUserPosts`, `search`, `thread` |
| Posts efêmeros 7 dias | ✅ Obrigatório | Cron cleanup, queries com filtro |
| Auditoria admin | ✅ Obrigatório | `adminActions.insert` em cada mutation |
| Glassmorphism | ✅ Obrigatório | `backdrop-blur`, `bg-white/10`, `glass-card` |
| Page transitions | ✅ Obrigatório | Framer Motion `AnimatePresence`, `layoutId` |
| Type-safety tRPC | ✅ Obrigatório | Zod schemas, tipos inferidos, sem `as any` |

---

> **Como usar:** Quando solicitado a analisar ou estudar partes do projeto, o LLM atualiza este index.md adicionando novas páginas nas categorias relevantes.
