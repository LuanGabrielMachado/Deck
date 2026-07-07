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
