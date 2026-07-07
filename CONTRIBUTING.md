# 🎭 Contribuindo com o Deck

Obrigado por se interessar em contribuir com o Deck! Este é um projeto open source de rede social efêmera dentro do Telegram, e toda ajuda é bem-vinda.

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Primeiros Passos](#primeiros-passos)
- [Fluxo de Trabalho](#fluxo-de-trabalho)
- [Padrões de Código](#padrões-de-código)
- [Submetendo Pull Requests](#submetendo-pull-requests)
- [Reportando Bugs](#reportando-bugs)
- [Sugerindo Funcionalidades](#sugerindo-funcionalidades)

---

## 🤝 Código de Conduta

Este projeto segue nosso [Código de Conduta](CODE_OF_CONDUCT.md). Por favor, leia antes de contribuir. Resumidamente: seja respeitoso, inclusivo e profissional.

---

## 🚀 Como Contribuir

### Tipos de Contribuição

| Tipo | Descrição | Onde Ajudar |
|------|-----------|-------------|
| 🐛 **Bug Fixes** | Corrigir bugs reportados ou encontrados | Issues marcadas como `bug` |
| ✨ **Novas Features** | Implementar novas funcionalidades | Issues marcadas como `enhancement` |
| 📝 **Documentação** | Melhorar docs, wiki, README | Qualquer documento |
| 🎨 **UI/UX** | Melhorias visuais, acessibilidade | Componentes React |
| ⚡ **Performance** | Otimizações de código | Profiling e benchmarks |
| 🧪 **Testes** | Escrever testes unitários/integração | Cobertura de testes |
| 🔒 **Segurança** | Reportar vulnerabilidades | Ver seção de segurança |

---

## 🎯 Primeiros Passos

### 1. Fork o Projeto

```bash
# Clone seu fork
git clone https://github.com/SEU_USUARIO/deck.git
cd deck
```

### 2. Configure o Ambiente

```bash
# Instale dependências (usando pnpm)
pnpm install

# Copie variáveis de ambiente
cp .env.example .env.local
cp .env.local.example .env.local

# Configure suas credenciais no .env.local
# - TELEGRAM_BOT_TOKEN
# - SUPABASE_URL
# - SUPABASE_ANON_KEY
# - etc.
```

### 3. Rode o Projeto

```bash
# Desenvolvimento
pnpm dev

# Build
pnpm build

# Testes
pnpm test
pnpm test:coverage
```

### 4. Crie uma Branch

```bash
# Branch para feature
git checkout -b feature/minha-nova-feature

# Branch para bugfix
git checkout -b fix/corrigir-problema-x

# Branch para documentação
git checkout -b docs/adicionar-wiki-y
```

---

## 📖 Fluxo de Trabalho

### Wiki-First Approach

**IMPORTANTE:** Este projeto segue a filosofia **Wiki-First**:

1. **Sempre** consulte `docs/wiki/index.md` primeiro
2. Use a wiki como fonte primária de conhecimento
3. Após modificar código, atualize a wiki se necessário
4. Registre mudanças em `docs/wiki/log.md`

Para mais detalhes, leia [QWEN.md](QWEN.md).

### Regras Absolutas

Estas regras **NÃO PODEM** ser violadas:

| # | Regra | Descrição |
|---|-------|-----------|
| 1 | **BIGINT para telegramIds** | Todas colunas `telegramId` usam BIGINT |
| 2 | **Rate limiting 3 camadas** | Frontend → DB users → DB posts |
| 3 | **Shadow ban filter** | Queries de leitura filtram shadow banned |
| 4 | **Posts efêmeros 7 dias** | Posts expiram automaticamente |
| 5 | **Auditoria admin** | Ações admin registradas em LogVault |
| 6 | **Glassmorphism** | UI usa backdrop-blur e glass-card |
| 7 | **Page transitions** | Navegação com Framer Motion |
| 8 | **Type-safety tRPC** | Zod schemas, sem `as any` |

Veja [[CodePatterns]](docs/wiki/CodePatterns.md) para detalhes completos.

---

## 💻 Padrões de Código

### TypeScript & Type Safety

```typescript
// ✅ CORRETO: Type-safe com Zod
const createPostSchema = z.object({
  content: z.string().min(1).max(165),
  imagePath: z.string().optional(),
});

// ❌ ERRADO: Perder type-safety
const data = input as any; // Nunca faça isso!
```

### BIGINT para Telegram IDs

```typescript
// ✅ CORRETO
export const users = pgTable("users", {
  telegramId: bigint("telegramId", { mode: "number" }).primaryKey(),
});

// ❌ ERRADO
telegramId: integer("telegramId") // Pode causar overflow!
```

### Glassmorphism

```tsx
// Componentes UI devem usar glassmorphism
<div className="glass-card backdrop-blur bg-white/10">
  {/* conteúdo */}
</div>
```

### Page Transitions

```tsx
import { motion, AnimatePresence } from 'framer-motion';

<AnimatePresence>
  <motion.div
    layoutId={`post-${postId}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
  >
    {/* conteúdo */}
  </motion.div>
</AnimatePresence>
```

### Estrutura de Arquivos

```
/workspace/
├── drizzle/              # Schema e migrations
├── server/               # Backend tRPC
│   ├── routers/          # tRPC routers
│   ├── repositories/     # Drizzle repositories
│   └── utils/
├── src/                  # Frontend Next.js
│   ├── app/              # App Router pages
│   ├── components/       # React components
│   ├── hooks/            # Custom hooks
│   └── lib/              # Utilities
├── docs/                 # Documentação
│   └── wiki/             # Wiki-first knowledge
└── .qwen/skills/         # AI skills
```

### Nomenclatura

| Tipo | Convenção | Exemplo |
|------|-----------|---------|
| Components | kebab-case.tsx | `post-card.tsx` |
| Hooks | use-*.ts | `use-auth.ts` |
| Utils | camelCase.ts | `telegram-utils.ts` |
| Routers | *.router.ts | `post.router.ts` |
| Repositories | *.repository.ts | `post.repository.ts` |

---

## 🔄 Submetendo Pull Requests

### Checklist Pré-Submit

Antes de abrir um PR, verifique:

- [ ] Seguiu o fluxo Wiki-First
- [ ] Regras absolutas respeitadas
- [ ] Código segue padrões do projeto
- [ ] Testes escritos e passando
- [ ] Documentação atualizada (wiki + docs)
- [ ] Lint e type-check passando
- [ ] Commit messages claras e descritivas

### Processo de Review

1. **Abra um PR** descrevendo claramente as mudanças
2. **Link issues** relacionadas (`Fixes #123`)
3. **Aguarde review** dos mantenedores
4. **Faça ajustes** se solicitado
5. **Aprovação** necessária para merge
6. **CI/CD** deve passar todos os checks

### Commit Messages

Use o padrão Conventional Commits:

```
feat: adicionar sistema de menções @usuario
fix: corrigir overflow de telegramId para BIGINT
docs: atualizar wiki com novos padrões de rate limiting
chore: atualizar dependências do pacote
test: adicionar testes unitários para post.repository
perf: otimizar queries de timeline com índice composto
```

---

## 🐛 Reportando Bugs

### Template de Bug Report

Ao abrir uma issue de bug, inclua:

```markdown
**Descrição:**
O que aconteceu? Qual o comportamento esperado?

**Passos para Reproduzir:**
1. Ir para página X
2. Clicar em botão Y
3. Ver erro Z

**Resultado Esperado:**
O que deveria acontecer?

**Screenshots/Vídeos:**
Se aplicável, adicione mídia.

**Ambiente:**
- Dispositivo: [ex: iPhone 13, Desktop]
- OS: [ex: iOS 16, Windows 11]
- Browser: [ex: Safari, Chrome]
- Versão do App: [ex: v7.0.0]

**Logs:**
Se disponível, cole logs relevantes.
```

### Bugs de Segurança

Para vulnerabilidades de segurança, **NÃO** abra uma issue pública. Envie um email privado para:
- **Email:** security@deck.app (ou contato do mantenedor)

Inclua detalhes completos para reprodução e possível impacto.

---

## ✨ Sugerindo Funcionalidades

### Template de Feature Request

```markdown
**Problema Relacionado:**
Existe uma issue relacionada? Descreva o problema que esta feature resolve.

**Solução Proposta:**
Descreva claramente o que você quer que aconteça.

**Alternativas Consideradas:**
Existem outras soluções? Por que esta é melhor?

**Contexto Adicional:**
Screenshots, mockups, ou exemplos de uso.
```

### Roadmap

Consulte o [Roadmap](docs/01-RESUMO-EXECUTIVO.md#8-roadmap-completo) para ver o planejamento atual.

---

## 🧪 Testes

### Rodando Testes

```bash
# Todos os testes
pnpm test

# Coverage
pnpm test:coverage

# Watch mode
pnpm test --watch
```

### Escrevendo Testes

```typescript
import { describe, it, expect } from 'vitest';

describe('post.repository', () => {
  it('deve criar post com conteúdo válido', async () => {
    // Arrange
    const content = 'Thread do dia';
    
    // Act
    const post = await createPost(content, telegramId);
    
    // Assert
    expect(post.content).toBe(content);
    expect(post.expiresAt).toBeDefined();
  });
});
```

### Cobertura Mínima

- **Novas features:** Mínimo 80% de cobertura
- **Bug fixes:** Teste que reproduz o bug
- **Core logic:** 100% de cobertura obrigatória

---

## 📚 Recursos de Aprendizado

### Documentação Principal

| Documento | Descrição |
|-----------|-----------|
| [README](README.md) | Visão geral do projeto |
| [Wiki Index](docs/wiki/index.md) | Catálogo da wiki |
| [CodePatterns](docs/wiki/CodePatterns.md) | Padrões de código |
| [Architecture](docs/wiki/Architecture.md) | Arquitetura tRPC + Drizzle |
| [Database](docs/wiki/Database.md) | Schema e migrations |
| [RateLimiting](docs/wiki/RateLimiting.md) | Sistema de rate limiting |
| [Ephemerality](docs/wiki/Ephemerality.md) | Efemeridade de 7 dias |
| [ShadowBan](docs/wiki/ShadowBan.md) | Filtro shadow ban |

### Documentação Técnica Completa

- [00-DOCUMENTO-MAE](docs/00-DOCUMENTO-MAE-VISAO-GERAL.md) — Visão geral completa
- [01-RESUMO](docs/01-RESUMO-EXECUTIVO.md) — Resumo executivo
- [02-API](docs/02-API-ENDPOINTS.md) — Especificação tRPC
- [03-BACKEND](docs/03-BACKEND.md) — Implementação backend
- [04-DATABASE](docs/04-DATABASE.md) — Schema detalhado
- [05-TECNOLOGIAS](docs/05-TECNOLOGIAS.md) — Stack completo
- [06-FLUXOS](docs/06-FLUXOS.md) — Fluxos de usuário
- [07-ADMIN](docs/07-ADMIN.md) — Dashboard admin
- [08-NOTIFICACOES](docs/08-NOTIFICACOES.md) — Notificações via Bot
- [09-LOGVAULT](docs/09-LOGVAULT.md) — Sistema de logging
- [10-FUNCIONAMENTO](docs/10-FUNCIONAMENTO.md) — Guia completo

### Skills do Projeto

As AI skills em `.qwen/skills/` contêm diretrizes avançadas:

- `code-contributor` — Escrever código conforme padrões
- `code-architecture` — Revisão arquitetural
- `wiki-workflow` — Gerenciamento da wiki
- `rule-enforcer` — Validação de regras absolutas
- `telegram-integration` — Integração com Telegram SDK

---

## 🏆 Reconhecimento

Contribuidores serão listados no [README](README.md) e no site do projeto (futuro).

### Níveis de Contribuição

| Nível | Critério | Reconhecimento |
|-------|----------|----------------|
| 🥉 Bronze | 1-2 PRs merged | Nome no README |
| 🥈 Prata | 3-5 PRs merged | Badge especial |
| 🥇 Ouro | 6+ PRs merged | Destaque no site |
| 💎 Diamante | Contribuições significativas | Co-maintainer |

---

## ❓ Dúvidas?

- **Discord/Telegram:** [Link do canal da comunidade]
- **Issues:** [GitHub Issues](https://github.com/SEU_USUARIO/deck/issues)
- **Discussões:** [GitHub Discussions](https://github.com/SEU_USUARIO/deck/discussions)

---

## 📄 Licença

Este projeto está licenciado sob [GPL-3.0](LICENSE). Ao contribuir, você concorda que suas contribuições seguirão a mesma licença.

---

**Versão:** 1.0.0  
**Última Atualização:** Março 2026
