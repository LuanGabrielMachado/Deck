# WIKI-FIRST TEMPLATE — Deck (Telegram Mini App)

> **Propósito:** Este documento é uma tarefa para um agente de IA (Code Agent) configurar um sistema wiki-first em um projeto de rede social Telegram Mini App.
> Copie este arquivo em seu projeto, preencha os parâmetros, e entregue ao agente de IA para execução.

> 🎭 **Contexto do Projeto:** Deck é um Telegram Mini App de microblogging efêmero com arquitetura tRPC + Drizzle ORM, rate limiting híbrido (3 camadas), shadow ban filter, posts efêmeros (7 dias), e moderação hierárquica (Deusa + Moderador). Qualquer alteração deve seguir as **Regras Absolutas** do projeto.

---

## DADOS DE ENTRADA (PRÉ-PREENCHIDOS PARA MARACUTÁIA)

| Parâmetro | Valor |
|-----------|-------|
| `project_name` | `Deck` |
| `project_description` | `Telegram Mini App de microblogging efêmero com tRPC + Drizzle ORM, rate limiting híbrido (3 camadas), shadow ban, posts efêmeros (7 dias), e moderação hierárquica` |
| `tech_stack` | `Next.js 15, React 19, TypeScript, tRPC 11, Drizzle ORM, PostgreSQL, Supabase, Framer Motion, TailwindCSS, Telegram WebApp SDK, Zod, Vitest` |
| `docs_path` | `docs/` |
| `wiki_path` | `docs/wiki/` |
| `skills_path` | `.qwen/skills/` |
| `source_dirs` | `server/, src/, drizzle/` |
| `absolute_rules` | `BIGINT para telegramIds, Rate limiting 3 camadas, Shadow ban em todas queries de leitura, Posts efêmeros 7 dias (admin isento), Auditoria admin sempre logar, Glassmorphism + Page transitions, Type-safety end-to-end tRPC` |

---

## TAREFA PARA O AGENTE DE IA

### Objetivo

Criar um **sistema wiki-first** para o projeto Deck — um conjunto de páginas wiki, skills, e instruções que fornecerão:

1. **Fonte única de verdade** sobre o projeto em `docs/wiki/`
2. **Regra wiki-first** — todas as skills de IA começam com wiki antes de ler código
3. **Atualidade automática** — wiki é atualizada sempre que o código muda
4. **Economia de contexto** — agente de IA lê wiki (visão geral), não código (detalhes)
5. **Rule-enforcer obrigatório** — toda alteração valida contra regras absolutas

---

### Passo 1: Criar Estrutura Wiki

**Tarefa:** Criar diretório wiki e arquivos iniciais.

**Ações:**

```bash
mkdir -p {wiki_path}
```

**Criar 3 arquivos:**

| Arquivo | Propósito |
|---------|-----------|
| `{wiki_path}index.md` | Catálogo de todas as páginas wiki (navegação) |
| `{wiki_path}log.md` | Log de mudanças da wiki (append-only) |
| `{wiki_path}Wiki Format.md` | Guia de formatação de páginas |

Abaixo está o conteúdo para cada arquivo.

---

#### Arquivo 1: `wiki/log.md`

```markdown
# Wiki Log

Diário cronológico de todas as mudanças na wiki.

---

## [YYYY-MM-DD] setup | Inicialização da Wiki

**Tipo:** setup
**Autor:** AI agent

### Descrição

Estrutura inicial da wiki criada para projeto {project_name}.

### Arquivos criados

- `{wiki_path}index.md` — catálogo de páginas wiki
- `{wiki_path}log.md` — log de mudanças
- `{wiki_path}Wiki Format.md` — guia de formatação de páginas

### Regras Absolutas Aplicadas

- BIGINT para telegramIds em todas as tabelas
- Rate limiting híbrido (3 camadas) documentado
- Shadow ban filter especificado para queries de leitura
- Efemeridade de posts (7 dias) com admin isento
- Auditoria admin via LogVault obrigatória
- Glassmorphism e page transitions preservados
- Type-safety tRPC end-to-end mantido
```

---

#### Arquivo 2: `wiki/index.md`

```markdown
# Wiki Index

Catálogo de todas as páginas wiki para projeto {project_name}.

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
```

---

#### Arquivo 3: `wiki/Wiki Format.md`

Este arquivo contém o guia de formato de páginas wiki. Crie-o com o seguinte conteúdo:

    ---
    tags: [wiki, format, instructions]
    created: YYYY-MM-DD
    updated: YYYY-MM-DD
    sources: [.qwen/skills/wiki-workflow/SKILL.md, .qwen/skills/rule-enforcer/SKILL.md]
    ---

    # Wiki Format

    Guia de formatos de páginas wiki, links, e logs.

    > 🎭 **Nota:** Páginas relacionadas a regras de negócio devem incluir campo `rule_review: approved | pending` no frontmatter.

    ---

    ## Frontmatter

    Cada página wiki começa com um frontmatter YAML:

        ---
        tags: [categoria, tag]
        created: YYYY-MM-DD
        updated: YYYY-MM-DD
        sources: [caminho/para/arquivo1, caminho/para/arquivo2]
        rule_review: approved | pending | required
        absolute_rules: [BIGINT, RateLimiting3Camadas, ShadowBan, Ephemerality7Dias]
        ---

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

        [[Architecture]] — arquitetura geral do sistema
        [[Database]] — schema e migrations
        [[RateLimiting]] — sistema de rate limiting híbrido

    ---

    ## Links para arquivos do projeto

    Caminhos relativos a partir da página wiki:

        [post.router.ts](../../server/routers/post.router.ts)
        [schema.ts](../../drizzle/schema.ts)

    ---

    ## Citação de Código

    Ao referenciar código, especifique o arquivo e contexto:

        De `post.repository.ts`:
        ```typescript
        // Filtro shadow ban aplicado em todas as queries de leitura
        const shadowBanFilter = eq(users.shadowBanned, false);
        ```

    ---

    ## Formato log.md

    Cada entrada em `wiki/log.md`:

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

        # Wiki Index

        ## 📋 Visão Geral

        | Categoria | Página | Descrição |
        |-----------|--------|-------------|
        | overview | [[Página]] | Descrição |

    **Regras:**
    - Agrupar por categorias
    - Usar emoji para separação visual
    - Toda página deve estar no catálogo
    - Breve descrição para cada página
    - Incluir seção de regras absolutas aplicáveis

---

### Passo 2: Criar Skill wiki-workflow

**Tarefa:** Criar uma skill de IA para gerenciamento wiki.

**Arquivo:** `{skills_path}wiki-workflow/SKILL.md`

Crie o arquivo com o seguinte conteúdo:

    ---
    name: wiki-workflow
    description: Gerencia o sistema wiki do projeto — operações ingest, query, lint com docs/wiki/. Use para aprender o projeto, atualizar conhecimento, ou verificar integridade.
    ---

    # Wiki Workflow

    ## Propósito da Skill

    Esta skill é o **gerente do sistema wiki**. Gerencia conhecimento do projeto:
    - Ingest — extraindo conhecimento do código para wiki
    - Query — buscando e sintetizando conhecimento da wiki
    - Lint — verificando integridade wiki
    - Post-Change Lint — atualizando wiki após mudanças de código

    **Quando usar:**
    - "Atualizar wiki" ou "estudar X" → operação **Ingest**
    - "Como X funciona?" ou "me conte sobre Y" → operação **Query**
    - "Verificar wiki" ou "encontrar problemas wiki" → operação **Lint**
    - Após qualquer mudança de código → **Post-Change Lint** (obrigatório)

    **Quando NÃO usar:**
    - Para escrever código → use `code-contributor`
    - Para revisão arquitetural → use `code-architecture`
    - Para validação de regras → use `rule-enforcer`

    ---

    ## PRIORIDADE DE FONTES (OBRIGATÓRIO)

    Esta skill é o **gerente do sistema wiki**. Todas as outras skills devem consultar wiki antes de ler código do projeto.

    ### Hierarquia de fontes

    | Nível | Fonte | Prioridade | Descrição |
    |-------|--------|----------|-------------|
    | 1 | `docs/wiki/` | **Mais alta** | Conhecimento concreto do projeto. Regras atuais do projeto. |
    | 2 | Código do projeto | **Secundária** | Arquivos fonte — apenas se wiki for insuficiente. |

    **Regra:** Se wiki descreve uma coisa e código mostra outra, wiki reflete o estado atual. Código é fonte de detalhes, wiki é fonte de visão geral.

    ### Wiki = visão geral, Código = detalhes

    Páginas wiki contêm **visão geral** de estrutura, padrões, e componentes. Informações detalhadas estão no código:

    | Wiki contém | Código contém |
    |---------------|---------------|
    | Quais componentes existem | Implementação de cada método |
    | Padrões e convenções | Exemplos de uso |
    | Visão geral de dependências | Assinaturas de interface |
    | Regras de negócio (rate limit, efemeridade) | Implementação específica |

    **Ao fazer ingest:** não copie detalhes do código para wiki. Wiki = visão geral + link para arquivo.
    **Ao fazer query:** se wiki não tem detalhes — leia o código.

    ---

    ## Operações da Skill

    ### 1. Ingest — Adicionando Conhecimento

    **Gatilhos:** "analisar X", "estudar Y", "atualizar wiki", "adicionar conhecimento sobre Z"

    **Algoritmo:**

    1. Determinar escopo de análise (quais partes do projeto estudar)
    2. Ler arquivos relevantes do projeto
    3. Extrair informações chave:
       - Arquitetura e padrões
       - Dependências e interfaces
       - Decisões e mudanças
       - **Regras de negócio aplicáveis (rate limit, efemeridade, shadow ban)**
    4. Criar ou atualizar páginas wiki em docs/wiki/
    5. Atualizar wiki/index.md (adicionar novas páginas ao catálogo)
    6. Adicionar entrada em wiki/log.md
    7. **Marcar páginas de regras para review (`rule_review: pending`)**

    ### 2. Query — Recuperação de Conhecimento

    **Gatilhos:** "como X funciona", "me conte sobre Y", "o que Z faz", perguntas sobre projeto

    **Algoritmo:**

    1. Ler wiki/index.md para navegação
    2. Encontrar páginas wiki relevantes
    3. Se necessário, ler arquivos do projeto para esclarecimento
    4. Sintetizar resposta com citações e links para arquivos
    5. Se informação estiver faltando — executar Ingest para criá-la

    ### 3. Lint — Verificação de Saúde Wiki

    **Gatilhos:** "verificar wiki", "encontrar problemas", "verificar integridade"

    **Algoritmo:**

    1. Ler todas as páginas wiki
    2. Verificar por:
       - Contradições entre páginas
       - Afirmações desatualizadas (comparar com código do projeto)
       - Links quebrados de páginas wiki [[Página]]
       - Links quebrados de arquivos do projeto
       - Referências cruzadas faltantes entre tópicos relacionados
       - Páginas sem frontmatter
       - Entradas faltantes em log.md
       - **Páginas de regras sem `rule_review: approved`**
    3. Propor correções
    4. Após confirmação — aplicar correções

    ### 4. Post-Change Lint — Verificação Após Mudanças de Código

    **Gatilhos:** Executa após **qualquer** criação, modificação, ou deleção de arquivos de código.

    **Algoritmo:**

    1. Determinar quais páginas wiki podem conter informações desatualizadas
    2. Ler páginas wiki relevantes
    3. Ler arquivos de código alterados
    4. Verificar:
       - Descrições wiki correspondem ao código atual
       - Interfaces, métodos, DTOs não mudaram
       - Novos arquivos/classes estão refletidos na wiki
       - Arquivos deletados são removidos de descrições
       - **Alterações seguem regras absolutas**
    5. Atualizar páginas wiki se necessário
    6. Adicionar entrada em wiki/log.md
    7. **Se alteração envolve regras absolutas → acionar `rule-enforcer`**

    ---

    ## Proibições

    - NÃO modificar arquivos do projeto através de operações wiki
    - NÃO deletar páginas wiki sem confirmação do usuário
    - NÃO limpar `wiki/log.md` (append-only)
    - NÃO renomear páginas wiki sem atualizar todos os links
    - NÃO aprovar revisões de regras — isso é papel da `rule-enforcer`

---

### Passo 3: Criar Skill code-contributor

**Tarefa:** Criar uma skill de IA para escrever código com regra wiki-first.

**Arquivo:** `{skills_path}code-contributor/SKILL.md`

Crie o arquivo com o seguinte conteúdo:

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

---

### Passo 4: Criar Skill code-architecture

**Tarefa:** Criar uma skill de IA para revisão arquitetural com regra wiki-first.

**Arquivo:** `{skills_path}code-architecture/SKILL.md`

Crie o arquivo com o seguinte conteúdo:

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

---

### Passo 4.5: Criar Skill telegram-integration (NOVA)

**Tarefa:** Criar uma skill de IA especializada em integração com Telegram WebApp SDK, recursos nativos do Telegram, e padrões específicos para Mini Apps.

**Arquivo:** `{skills_path}telegram-integration/SKILL.md`

Crie o arquivo com o seguinte conteúdo:

    ---
    name: telegram-integration
    description: Especialista em Telegram WebApp SDK — MainButton, BackButton, HapticFeedback, CloudStorage, BiometricManager, themeParams, e todos os recursos nativos do Telegram para Mini Apps.
    requires_double_check: true
    telegram_features: [MainButton, BackButton, SecondaryButton, HapticFeedback, CloudStorage, BiometricManager, ThemeParams, Popup, Alert, switchInlineQuery, initData]
    ---

    # Telegram Integration Specialist

    ## 🎯 PROPÓSITO DA SKILL

    Esta skill é o **especialista em integração com Telegram** para o Deck. Garante que todas as features do Telegram WebApp SDK sejam usadas corretamente, de forma SSR-safe, com fallbacks apropriados e seguindo padrões estabelecidos.

    **Responsabilidades:**
    1. Implementar UI nativa do Telegram (MainButton, BackButton, SecondaryButton)
    2. Gerenciar HapticFeedback e vibração por emoji
    3. Integrar CloudStorage para rate limiting e persistência
    4. Implementar BiometricManager para lock biométrico
    5. Sincronizar tema com Telegram themeParams
    6. Gerenciar navegação (switchInlineQuery, openLink, close)
    7. Garantir inicialização SSR-safe do SDK
    8. Validar uso correto de initData para autenticação

    ---

    ## RECURSOS DO TELEGRAM DISPONÍVEIS

    ### UI Nativa

    | Recurso | Arquivo | Descrição |
    |---------|---------|-----------|
    | `MainButton` | `telegram-utils.ts` | Botão principal dinâmico (texto, cor, progresso) |
    | `BackButton` | `telegram-utils.ts` | Navegação voltada ao topo |
    | `SecondaryButton` | `telegram-utils.ts` | Botão secundário (suporte básico) |
    | `showPopup` | `telegram-utils.ts` | Popup nativo com botões customizados |
    | `showAlert` | `telegram-utils.ts` | Alerta simples nativo |
    | `showConfirm` | `telegram-utils.ts` | Confirmação sim/não nativa |

    ### Haptic Feedback

    | Método | Tipo | Uso no Projeto |
    |--------|------|----------------|
    | `impactOccurred` | light/medium/heavy/rigid/soft | Clicks, selections |
    | `notificationOccurred` | success/warning/error | Notificações de ação |
    | `selectionChanged` | — | Picker de reações |
    | `vibrateReaction` | Padrões por emoji | Reações com vibração específica |

    ### Armazenamento

    | Recurso | Arquivo | Descrição |
    |---------|---------|-----------|
    | `CloudStorage` | `rate-limit-cache.ts` | Rate limiting camada 1 (sincronizado) |
    | `localStorage` | `rate-limit-cache.ts` | Fallback se CloudStorage indisponível |

    ### Biometria

    | Recurso | Arquivo | Descrição |
    |---------|---------|-----------|
    | `BiometricManager` | `use-biometric-lock.ts` | Face ID, Touch ID, Fingerprint |
    | `biometricInit` | `use-biometric-lock.ts` | Inicializa e verifica disponibilidade |
    | `biometricAuthenticate` | `use-biometric-lock.ts` | Autentica e retorna token |
    | `biometricUpdateToken` | `use-biometric-lock.ts` | Salva token no armazenamento seguro |

    ### Tema e Cores

    | Recurso | Arquivo | Descrição |
    |---------|---------|-----------|
    | `themeParams` | `theme-provider.tsx` | Cores dinâmicas do Telegram |
    | `colorScheme` | `theme-provider.tsx` | light/dark mode automático |
    | `setHeaderColor` | `telegram-utils.ts` | Cor da status bar (#ffffff) |
    | `setBackgroundColor` | `telegram-utils.ts` | Cor de fundo do app |

    ### Navegação e Fullscreen

    | Recurso | Arquivo | Descrição |
    |---------|---------|-----------|
    | `expand()` | `telegram-utils.ts` | Expande para fullscreen |
    | `requestFullscreen()` | `telegram-utils.ts` | Solicita fullscreen explícito |
    | `lockOrientation()` | `telegram-utils.ts` | Trava em portrait |
    | `switchInlineQuery` | `telegram-utils.ts` | Convite a amigos via inline query |
    | `openLink` | `telegram-utils.ts` | Abre link externo |
    | `close()` | `telegram-utils.ts` | Fecha o Mini App |

    ### Identidade e Auth

    | Recurso | Arquivo | Descrição |
    |---------|---------|-----------|
    | `initData` | `telegram.d.ts` | String assinada para autenticação |
    | `initDataUnsafe` | `telegram.d.ts` | Dados do usuário (não verificados) |
    | `TelegramUser` | `telegram.d.ts` | Interface do usuário do Telegram |

    ---

    ## PADRÕES DE IMPLEMENTAÇÃO

    ### 1. Inicialização SSR-Safe (OBRIGATÓRIO)

    ```typescript
    // SEMPRE usar wrapper seguro para evitar erros de SSR
    let tg: TelegramWebApp | null = null;
    let isInitializing = false;

    export function initTelegramWebApp() {
      if (typeof window !== "undefined" && !tg && !isInitializing) {
        isInitializing = true;
        try {
          if (window.Telegram?.WebApp) {
            tg = window.Telegram.WebApp;
            tg.expand();
            tg.requestFullscreen();
            tg.ready();
            tg.setHeaderColor('#ffffff');
          }
        } catch {
          // Silencioso para não poluir logs
        } finally {
          isInitializing = false;
        }
      }
      return tg;
    }
    ```

    **Regras:**
    - ✅ Verificar `typeof window !== "undefined"` antes de acessar
    - ✅ Usar flag `isInitializing` para evitar race conditions
    - ✅ Try-catch silencioso para não quebrar em browsers sem Telegram
    - ✅ Chamar `ready()` após inicialização
    - ✅ Configurar header branco (`#ffffff`) para ícones escuros

    ### 2. MainButton Dinâmica

    ```typescript
    useEffect(() => {
      if (isVideoPlaying) {
        mainButtonHide();
        return;
      }

      if (isPublishing) {
        mainButtonShow();
        mainButtonDisable();
        mainButtonSetText('Publicando...');
        mainButtonShowProgress();
        return;
      }

      if (isValid && canPost) {
        mainButtonShow();
        mainButtonEnable();
        mainButtonSetText('Publicar');
        return;
      }

      if (!canPost) {
        mainButtonShow();
        mainButtonDisable();
        const minutes = Math.floor(timeRemaining / 60000);
        const seconds = Math.floor((timeRemaining % 60000) / 1000);
        mainButtonSetText(`Aguardar ${minutes}m ${seconds}s`);
        return;
      }

      mainButtonHide();
    }, [isValid, canPost, timeRemaining, isVideoPlaying, isPublishing]);
    ```

    **Regras:**
    - ✅ Esconder quando não relevante (vídeo playing)
    - ✅ Mostrar progresso durante operações assíncronas
    - ✅ Desabilitar quando validação falha ou rate limit ativo
    - ✅ Texto dinâmico reflete estado atual
    - ✅ Cleanup com `mainButtonOffClick` em useEffect

    ### 3. Haptic Feedback por Emoji

    ```typescript
    const REACTION_VIBRATION: Record<string, number | number[]> = {
      '💀': 400,
      '😂': [80, 60, 80],
      '😱': [200, 100, 200],
      '❤️': [60, 40, 60],
      '🔥': [40, 30, 40, 30, 40],
      '👍': 60,
    };

    export function vibrateReaction(emoji: string): void {
      const pattern = REACTION_VIBRATION[emoji] ?? 60;

      // Web Vibration API (Android — mais expressivo)
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(pattern);
          return;
        } catch { /* fallback */ }
      }

      // Fallback: Telegram HapticFeedback (iOS)
      hapticImpact('medium');
    }
    ```

    **Regras:**
    - ✅ Preferir Web Vibration API no Android (padrões complexos)
    - ✅ Fallback para HapticFeedback no iOS
    - ✅ Padrões específicos por emoji para feedback tátil rico
    - ✅ Silencioso se nenhum disponível

    ### 4. CloudStorage para Rate Limiting

    ```typescript
    const RATE_LIMIT_KEY = '@deck/last-post-timestamp';

    export async function getRateLimitCache(): Promise<number | null> {
      return new Promise((resolve) => {
        const tg = window.Telegram?.WebApp;
        
        if (tg?.CloudStorage) {
          tg.CloudStorage.getItem(RATE_LIMIT_KEY, (err, value) => {
            if (err || !value) {
              const local = localStorage.getItem(RATE_LIMIT_KEY);
              resolve(local ? parseInt(local) : null);
            } else {
              resolve(parseInt(value));
            }
          });
        } else {
          const local = localStorage.getItem(RATE_LIMIT_KEY);
          resolve(local ? parseInt(local) : null);
        }
      });
    }
    ```

    **Regras:**
    - ✅ CloudStorage como fonte primária (sincronizado entre dispositivos)
    - ✅ localStorage como fallback imediato
    - ✅ Callback-based (Telegram SDK é assíncrono)
    - ✅ Regra "mais restritivo vence" no rate limiting híbrido

    ### 5. BiometricManager para Lock

    ```typescript
    export function biometricInit(cb?: (available: boolean, type: BiometricType) => void): void {
      const bm = getBiometricManager();
      if (!bm) { cb?.(false, 'unknown'); return; }
      bm.init(() => {
        cb?.(bm.isBiometricAvailable, bm.biometricType);
      });
    }

    export function biometricAuthenticate(
      reason: string,
      cb: (success: boolean, token?: string) => void,
    ): void {
      const bm = getBiometricManager();
      if (!bm) { cb(false); return; }
      bm.authenticate({ reason }, cb);
    }
    ```

    **Regras:**
    - ✅ Sempre chamar `biometricInit` antes de qualquer operação
    - ✅ Passar `reason` descritivo para popup de autenticação
    - ✅ Token retornado na autenticação bem-sucedida
    - ✅ Graceful fallback se BiometricManager indisponível

    ---

    ## DOCUMENTAÇÃO OFICIAL DO TELEGRAM

    | Recurso | Link Oficial | Status no Deck |
    |---------|--------------|---------------------|
    | **WebApp SDK** | https://core.telegram.org/bots/webapps | ✅ Implementado |
    | **CloudStorage** | https://core.telegram.org/bots/webapps#cloudstorage | ✅ Rate limiting camada 1 |
    | **BiometricManager** | https://core.telegram.org/bots/webapps#biometricmanager | ✅ Lock biométrico |
    | **MainButton** | https://core.telegram.org/bots/webapps#mainbutton | ✅ Dinâmica |
    | **BackButton** | https://core.telegram.org/bots/webapps#backbutton | ✅ Navegação |
    | **SecondaryButton** | https://core.telegram.org/bots/webapps#secondarybutton | ✅ Suporte básico |
    | **HapticFeedback** | https://core.telegram.org/bots/webapps#hapticfeedback | ✅ + Web Vibration API |
    | **Popup/Alert** | https://core.telegram.org/bots/webapps#popup | ✅ showTelegramPopup |
    | **switchInlineQuery** | https://core.telegram.org/bots/webapps#switchinlinequery | ✅ Convite a amigos |
    | **ThemeParams** | https://core.telegram.org/bots/webapps#themeparams | ✅ theme-provider.tsx |

    ---

    ## ✅ DO — Melhores Práticas

    - **Sempre verificar disponibilidade:** `if (window.Telegram?.WebApp)` antes de usar qualquer feature
    - **Usar callbacks assíncronos:** CloudStorage e BiometricManager são callback-based
    - **Fallback para localStorage:** CloudStorage pode falhar, sempre ter fallback
    - **Inicializar no layout.tsx:** Carregar SDK antes de qualquer componente
    - **Respeitar portrait lock:** App desenhado para vertical, usar `lockOrientation()`
    - **Header branco:** `setHeaderColor('#ffffff')` para ícones escuros na status bar
    - **Expandir automaticamente:** `tg.expand()` na inicialização
    - **Haptic sutil:** Usar `light` ou `soft` para feedbacks frequentes
    - **Cleanup de listeners:** Sempre usar `offEvent`, `offClick` em useEffect cleanup
    - **SSR-safe:** Todo acesso ao Telegram SDK dentro de `typeof window !== "undefined"`

    ---

    ## ❌ NÃO — Anti-Padrões

    - **Não assumir que Telegram está disponível:** Pode rodar em browser externo
    - **Não bloquear thread principal:** Callbacks do Telegram podem ser lentos
    - **Não ignorar fallbacks:** Sempre prover alternativa se Telegram SDK falhar
    - **Não usar integer para telegramId:** Usar BIGINT (`mode: "number"`)
    - **Não esquecer cleanup:** Remover event listeners com `offEvent`, `offClick`
    - **Não acessar diretamente `window.Telegram`:** Usar wrappers de `telegram-utils.ts`
    - **Não usar em SSR:** Todo código Telegram apenas em client-side (useEffect, etc.)

    ---

    ## EXEMPLOS DE USO REAL NO PROJETO

    | Feature | Arquivo | Recursos Telegram Usados |
    |---------|---------|-------------------------|
    | **Create Post** | `src/app/create/page.tsx` | MainButton dinâmica, HapticFeedback |
    | **Profile Lock** | `src/hooks/use-biometric-lock.ts` | BiometricManager, CloudStorage |
    | **Rate Limiting** | `src/lib/rate-limit-cache.ts` | CloudStorage + localStorage |
    | **Theme Sync** | `src/lib/theme-provider.tsx` | themeParams, colorScheme |
    | **Reactions** | `src/components/reaction-picker.tsx` | vibrateReaction (Haptic + Web Vibration) |
    | **Desktop Gate** | `src/components/desktop-gate.tsx` | Bloqueia fora do Telegram WebView |
    | **Navigation** | `src/app/layout.tsx` | BackButton, expand(), requestFullscreen() |

    ---

    ## INTEGRAÇÃO COM OUTRAS SKILLS

    ### wiki-workflow

    - Documentar novos recursos Telegram na wiki ([[Components]], [[CodePatterns]])
    - Atualizar log.md após mudanças em telegram-utils.ts
    - Manter links para documentação oficial do Telegram

    ### code-contributor

    - Fornecer templates de implementação Telegram-safe
    - Validar SSR-safety de novo código
    - Garantir fallbacks apropriados

    ### rule-enforcer

    - Validar BIGINT para telegramIds (regra absoluta)
    - Verificar shadow ban filter em queries que usam initData
    - Confirmar type-safety em wrappers do Telegram SDK

    ### code-architecture

    - Revisar arquitetura de integração Telegram
    - Garantir separação de concerns (wrappers vs business logic)
    - Validar patterns de inicialização e cleanup

    ---

    ## CHECKLIST DE VALIDAÇÃO

    Ao revisar código que usa Telegram SDK:

    - [ ] Verificação de disponibilidade (`if (window.Telegram?.WebApp)`)
    - [ ] SSR-safe (`typeof window !== "undefined"`)
    - [ ] Fallbacks implementados (CloudStorage → localStorage)
    - [ ] Cleanup de listeners em useEffect
    - [ ] BIGINT usado para telegramIds
    - [ ] Type-safety mantido (sem `as any`)
    - [ ] Haptic feedback apropriado (não excessivo)
    - [ ] MainButton limpa estados anteriores
    - [ ] Inicialização no momento correto (layout.tsx ou primeiro uso)

---

### Passo 5: Criar Skill rule-enforcer (EXISTENTE)

**Tarefa:** Criar uma skill de IA dedicada a validação de regras absolutas do projeto.

**Arquivo:** `{skills_path}rule-enforcer/SKILL.md`

Crie o arquivo com o seguinte conteúdo:

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

    ## EXEMPLOS DE VALIDAÇÃO

    ### Exemplo 1: Nova Procedure `users.search`

    **Cenário:** Desenvolvedor adiciona procedure de busca de usuários.

    **Processo de Review:**

    1. **Identificação:** Procedure de leitura, retorna lista de usuários
    2. **Regras Aplicáveis:** BIGINT, Shadow Ban, Type-Safety
    3. **Validação:**
       - [ ] BIGINT: `telegramId` retornado como number (bigint mode) ✅
       - [ ] Shadow Ban: Query filtra `shadowBanned = false` ✅
       - [ ] Type-Safety: Retorna `User[]` inferido do Drizzle ✅
    4. **Decisão:** ✅ APROVAR
    5. **Documentação:** Atualizar [[Database]] com nova procedure

    ### Exemplo 2: Componente de Post Card

    **Cenário:** Novo componente `post-card-custom.tsx` criado.

    **Processo de Review:**

    1. **Identificação:** Componente UI de feed
    2. **Regras Aplicáveis:** Glassmorphism, Page Transitions, Type-Safety
    3. **Validação:**
       - [ ] Glassmorphism: Usa `backdrop-blur-sm`, `bg-white/10`? ❌
       - [ ] Page Transitions: Animação de entrada presente? ❌
       - [ ] Type-Safety: Props tipadas corretamente? ✅
    4. **Decisão:** ❌ REPROVAR até correção
    5. **Correção Requerida:**
       ```tsx
       // Adicionar glassmorphism
       className="glass-card backdrop-blur-sm bg-white/10"
       
       // Adicionar page transition
       <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
       ```

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

    ## ATUALIZAÇÃO CONTÍNUA DE REGRAS

    Esta skill DEVE ser atualizada quando:

    1. Novas regras absolutas são definidas
    2. Regras existentes são modificadas
    3. Violações recorrentes são detectadas
    4. Melhores práticas emergem do projeto

    **Responsabilidade:** Manter `absolute_rules` no frontmatter atualizado.

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

---

### Passo 6: Criar QWEN.md na Raiz do Projeto

**Tarefa:** Criar o arquivo de regras principais para o agente de IA com regra wiki-first e rule-enforcer.

**Arquivo:** `QWEN.md` (raiz do projeto)

Crie o arquivo com o seguinte conteúdo:

    # Qwen Code — Regras do Projeto Deck

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

    Quatro skills disponíveis em `{skills_path}/` — todas contêm regra wiki-first:

    | Skill | Propósito | Quando Usar |
    |-------|---------|-------------|
    | `code-contributor` | Escrever e modificar código conforme padrões | Criar features, correções de bugs, refatoração |
    | `code-architecture` | Revisão de arquitetura para SOLID, DI, padrões | Revisão de código, avaliação de design, design de módulos |
    | `wiki-workflow` | Gerenciamento wiki — ingest, query, lint | Atualizar wiki, encontrar informação, checks de integridade |
    | **`rule-enforcer`** | **Validação de regras absolutas** | **Qualquer alteração que toque regras do projeto** |

    **Divisão de responsabilidade:**
    - `code-contributor` — **escreve** código
    - `code-architecture` — **revisa** arquitetura
    - `wiki-workflow` — **gerencia** wiki
    - `rule-enforcer` — **aprova** regras absolutas
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

    ---

    ## Integração com Documentação Existente

    O projeto possui ~28.000+ linhas de documentação técnica em `docs/00-*.md` a `docs/10-*.md`.

    A wiki (`docs/wiki/`) é uma **camada de abstração superior** que:
    - Fornece visão geral navegável
    - Centraliza regras e padrões
    - Linka para documentação detalhada existente
    - Mantém-se atualizada automaticamente

    **Fluxo:** Wiki (visão geral) → Documentação Técnica (detalhes) → Código (implementação)

---

### Passo 7: Initial Ingest — Análise do Projeto

**Tarefa:** Estudar o código existente do projeto e criar páginas wiki iniciais.

**O que fazer:**

1. **Ler** todos os arquivos fonte do projeto (estrutura, dependências, padrões)
2. **Criar** páginas wiki:

    | Página | Conteúdo | Rule Review |
    |--------|----------|-------------|
    | `Architecture.md` | Arquitetura tRPC + Drizzle, routers, repositories | Standard |
    | `Components.md` | Componentes React, hooks, glassmorphism | Standard |
    | `Database.md` | Schema Drizzle, migrations, relacionamentos | Required |
    | `RateLimiting.md` | 3 camadas, regra "mais restritivo vence" | Required |
    | `Ephemerality.md` | Posts 7 dias, cron cleanup, admin isento | Required |
    | `ShadowBan.md` | Filtro em queries de leitura | Required |
    | `CodePatterns.md` | Convenções, BIGINT, naming, glassmorphism | Required |
    | `Testing.md` | Estratégia Vitest, suites existentes | Standard |

3. **Atualizar** `wiki/index.md` com links para novas páginas
4. **Adicionar** entrada em `wiki/log.md` sobre o ingest inicial
5. **Acionar** `rule-enforcer` para validar páginas marcadas como `Required`

---

### Passo 8: Verificação Final

Após completar todos os passos, execute este checklist:

- [ ] `docs/wiki/` existe com 3 arquivos base (index.md, log.md, Wiki Format.md)
- [ ] `.qwen/skills/` existe com 4 skills (wiki-workflow, code-contributor, code-architecture, rule-enforcer)
- [ ] `QWEN.md` existe na raiz do projeto
- [ ] Todas as skills declaram `wiki > código`
- [ ] `rule-enforcer` inclui todas as 8 regras absolutas
- [ ] Páginas wiki iniciais criadas (Architecture, Components, Database, etc.)
- [ ] `index.md` contém links para todas as páginas wiki
- [ ] `log.md` contém entrada de setup inicial e ingest
- [ ] Wiki linka para documentação técnica existente (`docs/00-*.md` a `docs/10-*.md`)

---

## ANEXO: CHECKLIST DE IMPLEMENTAÇÃO

### Configuração Inicial

- [ ] Passo 1: Estrutura wiki criada
- [ ] Passo 2: Skill wiki-workflow criada
- [ ] Passo 3: Skill code-contributor criada
- [ ] Passo 4: Skill code-architecture criada
- [ ] Passo 5: Skill rule-enforcer criada
- [ ] Passo 6: QWEN.md criado na raiz
- [ ] Passo 7: Initial Ingest executado
- [ ] Passo 8: Verificação final passada

### Validação de Qualidade

- [ ] Todas as skills têm frontmatter YAML válido
- [ ] Todas as skills declaram prioridade wiki-first
- [ ] `rule-enforcer` tem checklist para cada regra absoluta
- [ ] Wiki index linka para documentação existente
- [ ] Log.md tem entradas de setup e ingest
- [ ] QWEN.md tem hierarquia de decisão clara

---

**Template Adaptado Para:** Deck  
**Baseado Em:** WIKI_FIRST_TEMPLATE_SHIELD.md  
**Versão:** 1.0.0  
**Data:** Março 2026  
**Status:** ✅ Pronto para Execução por Agente de IA
