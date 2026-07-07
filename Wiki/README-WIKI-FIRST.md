# Assistentes de IA — Abordagem Wiki-First para Deck

Em projetos de desenvolvimento ágil como o Deck, onde a base de código cresce rapidamente e features são entregues continuamente, os assistentes de IA tornaram-se parte integrante do fluxo de desenvolvimento. Sem uma fonte única de verdade, cada desenvolvedor (e cada agente de IA) é forçado a aprender o projeto do zero, desperdiçando limites de janela de contexto, tempo e recursos. A abordagem **wiki-first** resolve esse problema transformando a documentação em um centro de conhecimento vivo e automaticamente mantido que dita como humanos e IAs operam.

> 📌 **Nota:** Todos os exemplos estruturais, nomes de arquivos (`QWEN.md`, `.qwen/skills/`), e workflows neste artigo são fornecidos para o ecossistema **QWEN**. A metodologia é universal e pode ser adaptada para qualquer agente de IA capaz de trabalhar com instruções em Markdown.

> 🎭 **Contexto do Projeto:** Deck é um Telegram Mini App de microblogging efêmero (posts expiram em 7 dias) com arquitetura tRPC + Drizzle ORM, rate limiting híbrido em 3 camadas, shadow ban filter, e sistema de moderação hierárquica (Deusa + Moderador).

---

## 🔍 O Que É Wiki-First?

**Wiki-first** é uma metodologia onde, antes de qualquer trabalho com o código (escrever features, revisar, refatorar, tomar decisões arquiteturais), o desenvolvedor ou agente de IA **deve** primeiro estudar a documentação wiki do projeto (`docs/`).

Princípio chave:
> `Wiki = visão geral e padrões, Código = detalhes de implementação`

A wiki armazena conhecimento condensado e estruturado: arquitetura do sistema, padrões aceitos, dependências de serviços, convenções de nomenclatura, regras de negócio (efemeridade, rate limits, shadow ban), e regras de DI. Assinaturas específicas de métodos, queries SQL, ou asserções de teste são consultadas diretamente no código se a wiki não cobrir a tarefa específica.

### Por Que Wiki-First é Crítico para Deck?

| Aspecto | Sem Wiki-First | Com Wiki-First |
|---------|---------------|----------------|
| **Arquitetura tRPC** | Risco de quebrar type-safety end-to-end | Wiki documenta procedures e tipos canônicos |
| **Rate Limiting Híbrido** | Implementação inconsistente das 3 camadas | Wiki especifica regra "mais restritivo vence" |
| **Efemeridade (7 dias)** | Posts podem não expirar corretamente | Wiki define cron cleanup e admin isento |
| **Shadow Ban Filter** | Queries de leitura podem vazar posts | Wiki lista todas as queries que precisam do filtro |
| **BIGINT para TelegramIds** | Desenvolvedores usam integer por engano | Wiki reforça padrão obrigatório |
| **Glassmorphism** | Inconsistência visual entre componentes | Wiki documenta padrões de UI |
| **Page Transitions** | Animações quebradas ou faltando | Wiki especifica Framer Motion patterns |
| **Auditoria Admin** | Ações sem log no LogVault | Wiki lista contextos obrigatórios de log |
| **Onboarding** | Novos levam dias para entender regras | Wiki explica arquitetura em 30 minutos |

---

## 🚀 Benefícios da Abordagem

| Aspecto | Sem Wiki-First | Com Wiki-First |
|--------|----------------|--------------|
| **Onboarding do Projeto** | Todos aprendem o código do zero | Visão geral pronta em 5 minutos |
| **Armazenamento de Conhecimento** | Conhecimento fica na cabeça dos devs | Conhecimento centralizado na wiki (`docs/`) |
| **Onboarding** | Novatos passam dias decifrando código | Novatos leem wiki → horas em vez de dias |
| **Fluxo de Agente de IA** | Desperdiça contexto escaneando milhares de linhas | Lê páginas wiki concisas, economizando tokens e tempo |
| **Atualidade da Documentação** | Wiki fica desatualizada, rapidamente obsoleta | Wiki é atualizada automaticamente após cada mudança |
| **Conformidade de Padrões** | Desenvolvedores violam padrões por ignorância | IA e humanos seguem regras unificadas da wiki |
| **Regras de Negócio** | Efemeridade, rate limits aplicados inconsistentemente | Wiki registra regras com justificativas de produto |

---

## 🛠 Como Configurar Wiki-First no Projeto Deck

Para configuração rápida e correta, use o template [`WIKI_FIRST_TEMPLATE_DECK.md`](WIKI_FIRST_TEMPLATE_DECK.md). Ele foi projetado **para execução por um agente de IA**, que criará automaticamente toda a infraestrutura de conhecimento e skills.

### Passo 1: Preparar Parâmetros

O template já está pré-configurado com os parâmetros do Deck:

| Parâmetro | Valor |
|----------|-------|
| `project_name` | `Deck` |
| `project_description` | `Telegram Mini App de microblogging efêmero com tRPC + Drizzle ORM, rate limiting híbrido (3 camadas), shadow ban, posts efêmeros (7 dias), e moderação hierárquica` |
| `tech_stack` | `Next.js 15, React 19, TypeScript, tRPC 11, Drizzle ORM, PostgreSQL, Supabase, Framer Motion, TailwindCSS, Telegram WebApp SDK, Zod` |
| `docs_path` | `docs/` |
| `wiki_path` | `docs/wiki/` |
| `skills_path` | `.qwen/skills/` |
| `source_dirs` | `server/, src/, drizzle/` |
| `absolute_rules` | `BIGINT para telegramIds, Rate limiting 3 camadas, Shadow ban em todas queries de leitura, Posts efêmeros 7 dias (admin isento), Auditoria admin sempre logar, Glassmorphism + Page transitions, Type-safety end-to-end tRPC` |

### Passo 2: Lançar o Agente de IA

Passe o arquivo preenchido para seu assistente de IA com o seguinte prompt:

> "Execute as instruções do `WIKI_FIRST_TEMPLATE_DECK.md` estritamente passo a passo. Crie a estrutura wiki, skills de IA, e o arquivo de regras principais. Não modifique o código existente do projeto. Após criar a estrutura, execute o Initial Ingest (Passo 6)."

O agente irá automaticamente:

1. Criar o diretório `docs/wiki/` e três arquivos base:
   - `index.md` — catálogo de todas as páginas wiki
   - `log.md` — log de mudanças (append-only)
   - `Wiki Format.md` — guia de formatação de páginas

2. Gerar quatro skills especializados de IA em `.qwen/skills/`:
   - `wiki-workflow` — gerenciamento de conhecimento (ingest, query, lint, post-change lint)
   - `code-contributor` — escrita e modificação de código conforme padrões
   - `code-architecture` — revisão arquitetural (SOLID, DI, arquitetura tRPC)
   - `rule-enforcer` — **NOVO** validação de regras absolutas do projeto

3. Criar `QWEN.md` na raiz do projeto com regra wiki-first estrita e hierarquia de fontes: `docs/ > Código do projeto`.

### Passo 3: Análise Inicial do Projeto (Initial Ingest)

Após criar a estrutura, o agente executará o **Passo 6** do template:

- Escaneia os diretórios de código-fonte (`server/`, `src/`, `drizzle/`)
- Gera páginas wiki iniciais: `Architecture.md`, `Components.md`, `Database.md`, `RateLimiting.md`, `Ephemerality.md`, `ShadowBan.md`, `CodePatterns.md`, `Testing.md`
- Atualiza `index.md`, adicionando novas páginas ao catálogo
- Adiciona entrada em `log.md` sobre o carregamento inicial de conhecimento
- ⚠️ **Importante:** A wiki contém apenas visões gerais e links relativos para arquivos. Copiar código de arquivos `.ts`, `.tsx`, ou `.sql` é **proibido** (exceto snippets mínimos de 1-3 linhas para ilustrar padrões).

### Passo 4: Verificar Instalação

Após o agente terminar, verifique o resultado usando o checklist:

- [ ] `QWEN.md` contém a regra wiki-first e prioridade de fontes
- [ ] `docs/wiki/` contém `index.md`, `log.md`, `Wiki Format.md`
- [ ] `.qwen/skills/` contém 4 arquivos `SKILL.md` (incluindo `rule-enforcer`)
- [ ] Todas as skills declaram explicitamente: `wiki > código`
- [ ] Páginas wiki base para arquitetura, componentes, banco de dados, rate limiting e efemeridade foram geradas
- [ ] `index.md` contém links para todas as páginas criadas
- [ ] `log.md` contém entrada sobre o primeiro ingest com data e descrição
- [ ] `rule-enforcer` inclui todas as regras absolutas (BIGINT, 3 camadas RL, shadow ban, 7 dias, auditoria, glassmorphism, page transitions, type-safety)

---

## 🔄 Como Trabalhar com Wiki-First Após Configuração

| Papel | Regra |
|------|---------|
| **Desenvolvedor** | Antes de tarefa → abrir `docs/wiki/index.md`. Após commit → atualizar wiki + adicionar entrada em `log.md`. |
| **Agente de IA** | Qualquer requisição → wiki primeiro. Após mudanças de código → post-change lint. Detalhes faltantes → ler código. |
| **Revisão de Código** | Se PR não atualizou wiki → solicitar mudanças. Wiki não pode divergir do código. |
| **Validação de Regras** | Toda alteração → validação obrigatória contra regras absolutas via `rule-enforcer`. |

Fluxo de trabalho típico de agente de IA:

1. `Wiki-first` → lê `index.md` → encontra páginas relevantes
2. `Query/Ingest` → esclarece detalhes no código se necessário
3. `Code` → escreve feature/fix conforme padrões wiki
4. `Rule Check` → valida contra regras absolutas (skill `rule-enforcer`)
5. `Post-Change Lint` → atualiza wiki e `log.md`
6. `Verify` → verifica links, frontmatter, alinhamento com código

---

## 📱 Skill Especial: Telegram Integration

### Visão Geral

O Deck é um **Telegram Mini App** nativo, o que significa que ele não é apenas um website embedado, mas uma aplicação que aproveita recursos exclusivos do ecossistema Telegram. Esta skill especializada documenta padrões, APIs, e melhores práticas para integração profunda com o Telegram.

### Recursos do Telegram Disponíveis

| Categoria | Recursos | Arquivo |
|-----------|----------|---------|
| **UI Nativa** | MainButton, BackButton, SecondaryButton, Popup, Alert, Confirm | `telegram-utils.ts` |
| **Haptic Feedback** | Impact, Notification, Selection, Vibração por emoji | `telegram-utils.ts` |
| **Armazenamento** | CloudStorage (sincronizado entre dispositivos) | `rate-limit-cache.ts`, `use-biometric-lock.ts` |
| **Biometria** | BiometricManager (Face ID, Touch ID, Fingerprint) | `use-biometric-lock.ts` |
| **Tema** | Cores dinâmicas, dark/light mode automático | `theme-provider.tsx` |
| **Navegação** | switchInlineQuery, openLink, close | `telegram-utils.ts` |
| **Fullscreen** | expand(), requestFullscreen(), lockOrientation() | `telegram-utils.ts` |
| **Identidade** | initData, initDataUnsafe, TelegramUser | `telegram.d.ts` |

### Padrões de Implementação

#### 1. Inicialização Segura (SSR-Safe)

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

#### 2. MainButton Dinâmica

```typescript
// Exemplo: Create Post Page
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

#### 3. Haptic Feedback por Emoji

```typescript
// Padrões de vibração específicos por reação
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

#### 4. CloudStorage para Rate Limiting

```typescript
// Camada 1 do rate limiting híbrido
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

#### 5. BiometricManager para Lock

```typescript
// Hook use-biometric-lock.ts
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

### Documentação Oficial do Telegram

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

### Dicas de Integração

#### ✅ DO

- **Sempre verificar disponibilidade:** `if (window.Telegram?.WebApp)` antes de usar qualquer feature
- **Usar callbacks assíncronos:** CloudStorage e BiometricManager são callback-based
- **Fallback para localStorage:** CloudStorage pode falhar, sempre ter fallback
- **Inicializar no layout.tsx:** Carregar SDK antes de qualquer componente
- **Respeitar portrait lock:** App desenhado para vertical, usar `lockOrientation()`
- **Header branco:** `setHeaderColor('#ffffff')` para ícones escuros na status bar
- **Expandir automaticamente:** `tg.expand()` no inicialização
- **Haptic sutil:** Usar `light` ou `soft` para feedbacks frequentes

#### ❌ NÃO

- **Não assumir que Telegram está disponível:** Pode rodar em browser externo
- **Não bloquear thread principal:** Callbacks do Telegram podem ser lentos
- **Não ignorar fallbacks:** Sempre prover alternativa se Telegram SDK falhar
- **Não usar integer para telegramId:** Usar BIGINT (`mode: "number"`)
- **Não esquecer cleanup:** Remover event listeners com `offEvent`, `offClick`

### Exemplos de Uso Real no Projeto

| Feature | Arquivo | Recursos Telegram Usados |
|---------|---------|-------------------------|
| **Create Post** | `src/app/create/page.tsx` | MainButton dinâmica, HapticFeedback |
| **Profile Lock** | `src/hooks/use-biometric-lock.ts` | BiometricManager, CloudStorage |
| **Rate Limiting** | `src/lib/rate-limit-cache.ts` | CloudStorage + localStorage |
| **Theme Sync** | `src/lib/theme-provider.tsx` | themeParams, colorScheme |
| **Reactions** | `src/components/reaction-picker.tsx` | vibrateReaction (Haptic + Web Vibration) |
| **Desktop Gate** | `src/components/desktop-gate.tsx` | Bloqueia fora do Telegram WebView |
| **Navigation** | `src/app/layout.tsx` | BackButton, expand(), requestFullscreen() |

### Referências Cruzadas

- [[Architecture]] — Arquitetura geral do Mini App
- [[Components]] — Componentes que usam Telegram SDK
- [[CodePatterns]] — Padrões de código Telegram-safe
- [[RateLimiting]] — CloudStorage como camada 1
- [[Security]] — initData para autenticação HMAC

---

## 🔒 Skill de Rule Enforcer — Regras Absolutas do Projeto

### Por Que Uma Skill Dedicada de Validação de Regras?

Em projetos com regras de negócio e arquitetura rígidas como o Deck, violações de padrões podem comprometer a consistência do sistema, performance, e experiência do usuário. A skill `rule-enforcer` foi adicionada para:

1. **Validar tipos de dados** — BIGINT para todos os telegramIds
2. **Verificar rate limiting** — 3 camadas implementadas corretamente
3. **Auditar shadow ban** — todas as queries de leitura filtram shadow banned
4. **Garantir efemeridade** — posts expiram em 7 dias, admin isento
5. **Log de auditoria** — ações admin sempre registradas no LogVault
6. **UI consistente** — glassmorphism e page transitions preservados
7. **Type-safety** — tRPC mantém tipos end-to-end

### Regras Absolutas Obrigatórias

A skill `rule-enforcer` consulta as seguintes regras antes de aprovar alterações:

| Regra | Aplicação | Verificação |
|-------|-----------|-------------|
| **BIGINT para telegramIds** | Todas as colunas telegramId | Drizzle schema, repositórios, routers |
| **Rate limiting 3 camadas** | Posts e replies | Frontend CloudStorage → DB users.lastPostAt → DB posts count |
| **Shadow ban filter** | Todas queries de leitura | `getTimelinePosts`, `getUserPosts`, `search`, `thread` |
| **Posts efêmeros 7 dias** | Cleanup cron + queries | `cleanupExpiredPosts`, admin bypass |
| **Auditoria admin** | Todas ações no dashboard | `adminActions.insert` em cada mutation |
| **Glassmorphism** | Componentes UI | Classes Tailwind: `backdrop-blur`, `bg-white/10` |
| **Page transitions** | Navegação entre páginas | Framer Motion `AnimatePresence`, `layoutId` |
| **Type-safety tRPC** | Procedures e inputs | Zod schemas, tipos inferidos, sem `as any` |

### Processo de Validação

Toda sugestão ou alteração deve seguir:

```
1. Pesquisa → Consultar wiki para regras aplicáveis
2. Coesão → Verificar consistência com código existente
3. Estrutura → Garantir que implementação segue padrões estabelecidos
4. Validação → Rule-enforcer valida contra regras absolutas
5. Documentação → Atualizar wiki com justificativa se necessário
```

### Exemplo: Validação de Nova Procedure

**Cenário:** Desenvolvedor propõe adicionar procedure `users.search`.

**Processo de Review:**

1. `rule-enforcer` consulta wiki ([[Database]], [[ShadowBan]])
2. Verifica que procedure usa BIGINT para telegramId nos tipos
3. Identifica que query de leitura precisa filtrar shadow banned
4. Confirma que retorna tipo inferido do Drizzle (type-safe)
5. Exige atualização da wiki se procedure for adicionada

---

## 🔄 Ciclo de Vida da Wiki: Manutenção, Consistência e Evolução de Skills

Configurar wiki-first não é uma configuração única, mas o lançamento de um processo vivo. Documentação deixada sem atenção rapidamente torna-se um "cemitério de conhecimento". Para garantir que a abordagem entregue valor a longo prazo, a wiki deve ser continuamente atualizada, e o agente de IA deve atuar como o principal guardião de sua consistência e completude.

### 🤖 Agente como Guardião da Integridade

Após a configuração inicial, a responsabilidade pela atualidade da wiki recai sobre o agente de IA. A cada mudança de código, o agente deve automaticamente executar um **post-change lint**: verificar se páginas existentes contradizem a nova implementação, atualizar descrições de componentes afetados, e registrar mudanças em `log.md`.

Exija confirmação explícita de sincronização do agente. Se um commit afeta arquitetura, configuração, ou adiciona novos módulos, o agente não deve apenas corrigir o código, mas também atualizar a wiki. Isso transforma a documentação de um "fardo extra" para uma parte integral do ciclo de desenvolvimento. Sem este passo, a wiki rapidamente divergirá do código, e a regra `wiki > código` perderá o significado.

### 📖 Documentando Cenários Complexos

O verdadeiro poder do wiki-first emerge quando não apenas descrições estáticas, mas também **workflows específicos do projeto** são adicionados à base de conhecimento.

Por exemplo, adicionar uma nova feature no Deck pode exigir mudanças em múltiplos lugares: router tRPC, repositório Drizzle, schema do banco, componente React, e hook customizado. Em vez de explicar isso ao agente do zero toda vez, documente este cenário uma vez como uma página wiki separada ou uma seção em `CodePatterns.md`.

Uma vez que um cenário complexo é documentado na wiki, o agente começa a executá-lo **com confiança, sem alucinações ou passos perdidos**. Quando perguntado "Adicionar nova procedure", o agente:

1. Encontra a instrução na wiki via `index.md`
2. Segue estritamente a sequência descrita de mudanças
3. Automaticamente atualiza a wiki se o cenário precisar de adaptação a novas realidades

Quanto mais cenários "rotineiros" e "facilmente esquecidos" você formalizar na wiki, menos tempo é gasto em microgerenciamento do agente, e maior a estabilidade dos resultados.

### 🧠 Natureza Específica de Modelos para Wiki

Diferentes modelos LLM estruturam pensamentos, escolhem prioridades e formulam instruções de maneira diferente. Isso **não é um bug, mas uma feature**. Quando um agente gera ou curadoria a wiki durante análise inicial (`Initial Ingest`) ou atualizações subsequentes, a documentação naturalmente "se adapta" à sua lógica interna, tokenização e padrões de atenção.

Um modelo seguirá uma wiki que ele mesmo gerou ou curou muito mais precisamente e com confiança do que documentação escrita por outro modelo ou humano "para si mesmo". Portanto, não busque estilística "humana" perfeita nos estágios iniciais. O principal é que a estrutura seja inequívoca, links funcionem, e a lógica de atualização seja mantida. Com o tempo, você notará que a wiki se torna a "língua nativa" de seu agente: ele encontra contexto mais rápido, alucina menos, e executa tarefas complexas com mais precisão.

### 🛠 Evolução de Skills e Regras

As `skills` criadas durante a configuração não estão definidas de forma imutável. À medida que o projeto cresce e a experiência com o agente acumula, elas devem ser adaptadas:

- Se o agente frequentemente perde uma certa verificação, adicione a regra correspondente a `rule-enforcer` ou `wiki-workflow`.
- Se novas stacks tecnológicas ou padrões emergirem, expanda `code-contributor` com exemplos e convenções.
- Se a estrutura wiki tornar-se muito volumosa, refatore `index.md`, introduza tags, ou divida páginas monolíticas em blocos temáticos.

Os próprios arquivos `QWEN.md` e `SKILL.md` fazem parte do ecossistema wiki. Eles podem e devem ser refactorados para manter instruções precisas, minimizar consumo de contexto, e corresponder ao estágio atual de maturidade do projeto.

### 💡 Princípio Central: Wiki é um Organismo Vivo

A ideia chave da abordagem é esta: **você não pode apenas criar uma wiki, você deve continuamente desenvolvê-la**.

- **Manter atualidade:** toda mudança de código → mudança wiki + entrada em `log.md`.
- **Enriquecer contexto:** transformar acordos verbais, trackers de bugs, e procedimentos manuais complexos em instruções wiki formalizadas.
- **Evoluir o agente:** adaptar skills, esclarecer prioridades, e refinar prompts para tarefas reais do projeto.

Quando a wiki torna-se a fonte única de verdade, e o agente atua como seu curador ativo, a equipe obtém um sistema de conhecimento escalável. Ele não "murcha" com o tempo, mas ganha força: quanto mais você investe nele, mais rápido, preciso e confiante a IA trabalha, reduzindo tempo gasto em onboarding, revisões de código, e correção de bugs.

---

## 📋 Estrutura de Diretórios Proposta para Deck

```
/workspace/
├── QWEN.md                          # Regras principais (wiki-first + rule-enforcer)
├── .qwen/
│   └── skills/
│       ├── wiki-workflow/
│       │   └── SKILL.md             # Skill de gerenciamento wiki
│       ├── code-contributor/
│       │   └── SKILL.md             # Skill de escrita de código
│       ├── code-architecture/
│       │   └── SKILL.md             # Skill de revisão arquitetural
│       └── rule-enforcer/           # NOVO: Skill de validação de regras absolutas
│           └── SKILL.md
├── docs/
│   ├── wiki/                        # Wiki do projeto (fonte primária)
│   │   ├── index.md                 # Catálogo de páginas
│   │   ├── log.md                   # Log de mudanças (append-only)
│   │   ├── Wiki Format.md           # Guia de formatação
│   │   ├── Architecture.md          # Arquitetura tRPC + Drizzle
│   │   ├── Components.md            # Componentes React e hooks
│   │   ├── Database.md              # Schema Drizzle e migrations
│   │   ├── RateLimiting.md          # 3 camadas de rate limit
│   │   ├── Ephemerality.md          # Posts de 7 dias, admin isento
│   │   ├── ShadowBan.md             # Filtro em queries de leitura
│   │   ├── CodePatterns.md          # Convenções e padrões
│   │   └── Testing.md               # Estratégia de testes (Vitest)
│   ├── 00-DOCUMENTO-MAE-VISAO-GERAL.md
│   ├── 01-RESUMO-EXECUTIVO.md
│   ├── ... (documentação técnica existente)
├── server/                          # Backend tRPC
│   ├── _core/                       # Core: trpc, rate-limiter, context
│   ├── routers/                     # Routers: post, user, admin, etc.
│   ├── repositories/                # Repositórios Drizzle
│   └── bot/                         # Telegram Bot API
├── src/                             # Frontend Next.js
│   ├── app/                         # Páginas (App Router)
│   ├── components/                  # Componentes React
│   ├── hooks/                       # Hooks customizados
│   └── lib/                         # Utilitários
├── drizzle/                         # Migrations e schema
│   ├── schema.ts                    # Schema Drizzle canônico
│   └── migrations/                  # Migrations SQL
└── CHANGELOG-COMPLETO.md            # Histórico completo do projeto
```

---

## 📊 Integração com Documentação Existente

O projeto Deck já possui ~28.000+ linhas de documentação técnica distribuídas em 10 documentos na pasta `docs/`. A abordagem wiki-first **não substitui** esta documentação, mas cria uma camada de abstração superior:

| Tipo de Documento | Propósito | Localização |
|-------------------|-----------|-------------|
| **Documentação Técnica Detalhada** | Especificações completas, endpoints, fluxos | `docs/00-*.md` a `docs/10-*.md` |
| **Wiki-First (Visão Geral)** | Catálogo navegável, padrões, regras | `docs/wiki/` |
| **CHANGELOG** | Histórico de versões e mudanças | `CHANGELOG-COMPLETO.md` |
| **Skills de IA** | Instruções operacionais para agentes | `.qwen/skills/` |

A wiki (`docs/wiki/index.md`) deve conter links para a documentação detalhada existente, criando uma teia de conhecimento interconectada:

```markdown
## 📋 Visão Geral

| Categoria | Página | Descrição |
|-----------|--------|-------------|
| overview | [[Architecture]] | Arquitetura tRPC + Drizzle ORM |
| database | [[Database]] | Schema, migrations, relacionamentos |
| business | [[RateLimiting]] | 3 camadas, regra "mais restritivo vence" |
| business | [[Ephemerality]] | Posts expiram em 7 dias, admin isento |
| security | [[ShadowBan]] | Filtro em todas queries de leitura |
| patterns | [[CodePatterns]] | Convenções, BIGINT, glassmorphism |

## 📚 Documentação Técnica Completa

| Documento | Descrição | Link |
|-----------|-----------|------|
| Documento Mestre | Visão geral completa do projeto | [00-DOCUMENTO-MAE](../00-DOCUMENTO-MAE-VISAO-GERAL.md) |
| Resumo Executivo | Funcionalidades e stack | [01-RESUMO](../01-RESUMO-EXECUTIVO.md) |
| API Endpoints | Especificação tRPC completa | [02-API](../02-API-ENDPOINTS.md) |
| Backend | Implementação server-side | [03-BACKEND](../03-BACKEND.md) |
| Database | Schema e migrations detalhados | [04-DATABASE](../04-DATABASE.md) |
| ... | ... | ... |
```

---

## ✅ Checklist de Implementação Wiki-First

### Fase 1: Configuração Inicial

- [ ] Executar template `WIKI_FIRST_TEMPLATE_DECK.md` via agente de IA
- [ ] Verificar criação de `docs/wiki/` com 3 arquivos base
- [ ] Verificar criação de `.qwen/skills/` com 4 skills
- [ ] Verificar criação de `QWEN.md` na raiz
- [ ] Executar Initial Ingest para gerar páginas wiki iniciais

### Fase 2: Validação

- [ ] Todas as skills declaram `wiki > código`
- [ ] `rule-enforcer` inclui todas as 8 regras absolutas
- [ ] `index.md` contém links para todas as páginas wiki
- [ ] `log.md` contém entrada de setup inicial
- [ ] Páginas wiki linkam para documentação técnica existente

### Fase 3: Operação Contínua

- [ ] Agente executa post-change lint após cada mudança de código
- [ ] Entrada em `log.md` adicionada automaticamente
- [ ] Wiki atualizada reflete estado atual do código
- [ ] Rule-enforcer valida todas as PRs antes de merge

---

**Status:** ✅ Metodologia Adaptada para Deck  
**Versão:** 1.0.0  
**Data:** Março 2026  
**Baseado em:** README-WIKI-FIRST-SHIELD.md (adaptado)
