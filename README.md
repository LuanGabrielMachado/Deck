# 🎭 Deck

**Um deck de threads efêmero dentro do Telegram.**

![Status](https://img.shields.io/badge/status-production-brightgreen?style=for-the-badge&logo=telegram&logoColor=white)
![Platform](https://img.shields.io/badge/platform-Telegram-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)
![Type](https://img.shields.io/badge/type-Social%20Network-ff69b4?style=for-the-badge)
![Messages](https://img.shields.io/badge/messages-ephemeral-blueviolet?style=for-the-badge&logo=snapchat&logoColor=white)

![Privacy](https://img.shields.io/badge/privacy-first-brightgreen?style=for-the-badge&logo=privateinternetaccess&logoColor=white)
![NoTracking](https://img.shields.io/badge/tracking-none-brightgreen?style=for-the-badge)
![NoAds](https://img.shields.io/badge/ads-zero-brightgreen?style=for-the-badge)
![DataOwner](https://img.shields.io/badge/seus%20dados-são%20seus-009c3b?style=for-the-badge)

![LGPD](https://img.shields.io/badge/LGPD-Compliant-009c3b?style=for-the-badge)
![MadeInBrazil](https://img.shields.io/badge/Feito%20no-Brasil-FFDF00?style=for-the-badge&logo=googlemaps&logoColor=009c3b)
![IndieBuilt](https://img.shields.io/badge/built%20by-no%20dev%20independente-ff69b4?style=for-the-badge)
![License](https://img.shields.io/badge/license-GPL--3.0-blue?style=for-the-badge)
![OpenSource](https://img.shields.io/badge/open%20source-yes-brightgreen?style=for-the-badge)
![Contributions](https://img.shields.io/badge/contributions-welcome-orange?style=for-the-badge)

![PhysicsEngine](https://img.shields.io/badge/Physics%20Engine-Hadron/%20Próprio-FF6B35?style=for-the-badge&logo=atom&logoColor=white)
![Particles](https://img.shields.io/badge/Particles-Newtonian%20Physics-FF6B35?style=for-the-badge)
![Gyroscope](https://img.shields.io/badge/Gyroscope-Force%20Input-FF4500?style=for-the-badge&logo=android&logoColor=white)
![ThermalNoise](https://img.shields.io/badge/Thermal%20Noise-Eternal%20Motion-8B0000?style=for-the-badge)
![Halton](https://img.shields.io/badge/Distribution-Halton%20Sequence-DC143C?style=for-the-badge)
![Verlet](https://img.shields.io/badge/Integration-Verlet%20based-FF6B35?style=for-the-badge)
![RAF](https://img.shields.io/badge/Loop-requestAnimationFrame-FF8C00?style=for-the-badge)
![ZeroRerender](https://img.shields.io/badge/React%20Rerenders-zero-brightgreen?style=for-the-badge&logo=react&logoColor=white)

---

## 👁️ A Filosofia

> Postou? **10 minutos de castigo.**
> Quer se defender? **15 minutos.**
> Slow social intencional. Sem algoritmo. Tudo expira.

Deck é um experimento de **rede social lenta** — onde a escassez de ações cria intenção, e a efemeridade cria leveza.

---

## 🐍 O Que É

Um **Telegram Mini App** de microblogging efêmero:

- 🕰️ **Posts duram 7 dias** — depois somem, sem rastro
- ⏱️ **Slow social** — rate limits de 10-15 minutos entre ações
- 🚫 **Sem algoritmo** — você escolhe quem seguir
- 📱 **Sem app para baixar** — roda nativamente dentro do Telegram
- 🔔 **Notificações push** — via Bot Telegram
- 🧵 **Threads navegáveis** — explore conversas em pilha infinita
- 👻 **Ghosting de 48h** — pause alguém temporariamente
- 🔒 **Lock biométrico** — proteja o app com Face ID ou digital

---

## ⚡ Como Funciona

### Postou

Escreva seu thread (165 caracteres), adicione imagem ou vídeo (YouTube/Vimeo), publique.
Você tem **10 minutos** até poder postar de novo.

### Respondeu

Responda posts de quem você segue.
**15 minutos** de intervalo entre respostas.

### Threads

Posts com respostas exibem `Ver thread`. Clique para entrar — o feed vira uma pilha de conversas navegáveis. Volte nível por nível ou saia direto.

### Bloqueio e Ghosting

- **Bloquear** — efeito imediato e bidirecional no feed
- **Ghostar 48h** — a pessoa para de ver seus posts por 48 horas
- **Denunciar** — chega direto para os admins

### Menções

Digite `@nome` em posts ou respostas — autocomplete mostra quem você segue. A pessoa mencionada recebe notificação via bot.

### Expirou

Posts somem após 7 dias. Um countdown mostra o tempo restante.

---

## 🎯 Funcionalidades

| Feature             | Descrição                       | Limite             |
| ------------------- | ------------------------------- | ------------------ |
| **Posts**           | Microblog de texto              | 165 chars          |
| **Imagens**         | Upload opcional                 | 12MB               |
| **Vídeos**          | Embed YouTube / Vimeo           | URL no texto       |
| **Respostas**       | Reply a posts                   | 100 chars          |
| **Threads**         | Navegação em pilha infinita     | Ilimitado          |
| **Reações**         | 12 emojis com física newtoniana | Por post           |
| **Follow**          | Siga usuários                   | Ilimitado          |
| **Menções**         | @usuario com autocomplete       | Máx 3 por post     |
| **Busca**           | Encontre pessoas por nome       | Global             |
| **Bloqueio**        | Efeito bidirecional no feed     | Permanente         |
| **Ghosting**        | Pausa temporária                | 48h, renovável     |
| **Notificações**    | Push via Bot Telegram           | Opt-out disponível |
| **Efemeridade**     | Expiração automática + cascade  | 7 dias             |
| **Rate Limit**      | Slow social                     | 10-15 min          |
| **Lock Biométrico** | Face ID / Digital               | Via Telegram SDK   |
| **Exportação LGPD** | Seus dados em .txt              | Via bot            |
| **Moderação**       | Shadow ban, ban, auditoria      | Admin dashboard    |

---

## 🏗️ Stack Técnico

| Camada           | Tecnologia                                     |
| ---------------- | ---------------------------------------------- |
| **Frontend**     | Next.js 15, React 19, TypeScript, Tailwind CSS |
| **API**          | tRPC v11 (type-safe end-to-end)                |
| **Estado**       | TanStack Query                                 |
| **Backend**      | Next.js API Routes (Serverless)                |
| **Database**     | PostgreSQL via Supabase                        |
| **ORM**          | Drizzle ORM                                    |
| **Storage**      | Supabase Storage                               |
| **Autenticação** | Telegram WebApp SDK (HMAC-SHA256) + JWT        |
| **Animações**    | Framer Motion                                  |
| **Física**       | Motor próprio (RAF, DOM direto, 60fps)         |
| **Deploy**       | Vercel (Serverless + Edge + Cron Jobs)         |

---

## 🎨 Conceito Visual

- **Glassmorphism** — transparências e blur sobre backgrounds coloridos por página
- **Partículas com física** — emojis de reação flutuam com colisão, repulsão e giroscópio real
- **Animação de publicação** — vídeo 60fps (3.74s) com flash em 1.6-2.2s
- **Haptic Feedback** — vibração tátil em cada ação
- **Page Transitions** — fade + slide suave entre rotas
- **Floating Tab Bar** — navegação com indicador animado

---

## 🔒 Segurança

- ✅ **Autenticação:** HMAC-SHA256 via Telegram WebApp SDK
- ✅ **Sessions:** JWT HTTP-only (7 dias)
- ✅ **Rate Limiting:** 3 camadas (CloudStorage → DB → fallback)
- ✅ **Moderação:** Shadow ban, ban, auditoria completa
- ✅ **LGPD:** Exportação de dados, opt-out de notificações, dados mínimos
- ✅ **Cascade:** Delete em cadeia — posts, replies, reações, imagens

---

## 📊 Métricas (v7.0.0)

| Métrica                      | Valor                 |
| ---------------------------- | --------------------- |
| **Status**                   | ✅ Produção            |
| **Tempo de Desenvolvimento** | ~7 semanas            |
| **Versões Lançadas**         | 12                    |
| **Arquivos TS/TSX**          | 117                   |
| **Componentes React**        | 25+                   |
| **Hooks Customizados**       | 13                    |
| **Procedures tRPC**          | 48                    |
| **Tabelas no Banco**         | 10                    |
| **Migrations**               | 14                    |
| **Contextos LogVault**       | 9 (100% de cobertura) |

---

## 🚀 Acesso

```
Telegram → Buscar @deckbot → Abrir
```

Ou acesse diretamente: **https://t.me/deckbot**

---

## 📄 Licença

Este projeto está licenciado sob a [GNU General Public License v3.0](LICENSE) - uma licença copyleft que garante que:

- ✅ Você pode usar, modificar e distribuir o software
- ✅ Qualquer modificação deve ser disponibilizada sob a mesma licença (GPL-3.0)
- ✅ O código-fonte deve estar disponível para todos os derivados
- ✅ Seu trabalho contribui de volta para a comunidade open source

**"Se você pegar, você compartilha."** - Esta é a essência do copyleft.

### Por Que GPL-3.0?

O Deck foi desenvolvido com muito esforço e dedicação. Ao escolher a GPL-3.0:

1. **Protejo meu trabalho** - Ninguém pode fechar o código e lucrar sem contribuir de volta
2. **Apoio a comunidade** - Melhorias feitas por outros beneficiam a todos
3. **Mantenho controle** - Derivados devem seguir as mesmas regras de liberdade
4. **Garanto perpetuidade** - O projeto permanecerá open source para sempre

Para mais detalhes sobre como contribuir, consulte nosso [Guia de Contribuição](CONTRIBUTING.md), [Código de Conduta](CODE_OF_CONDUCT.md) e [Boas Práticas](BEST_PRACTICES.md).

---

**Versão:** 7.0.0 — Social Complete Release  
**Última Atualização:** 16 de Março de 2026  
**Licença:** GPL-3.0 (Open Source)
