import { ENV } from '../_core/env';

// URL base da Bot API do Telegram
const BOT_API = `https://api.telegram.org/bot${ENV.telegramBotToken}`;

// ─── Tipos ────────────────────────────────────────────────────────
interface SendMessageOptions {
  parseMode?: "HTML" | "Markdown";
  disableWebPagePreview?: boolean;
  replyMarkup?: InlineKeyboard;
}

interface InlineKeyboard {
  inline_keyboard: Array<Array<{
    text: string;
    url?: string;
    web_app?: { url: string };
  }>>;
}

interface BotApiResult {
  ok: boolean;
  errorCode?: number;
  description?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Trunca texto para evitar mensagens muito longas.
 */
function truncate(text: string, max: number): string {
  return text.length <= max ? text : text.slice(0, max - 3) + "...";
}

/**
 * Escapa caracteres especiais HTML para evitar erros de parse na Bot API.
 * Previne XSS ao enviar conteúdo gerado por usuários.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Botão inline padrão para abrir o mini app em FULLSCREEN.
 * Usa web_app ao invés de url para abrir dentro do Telegram em tela cheia.
 */
function openAppButton(): InlineKeyboard {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://deck.vercel.app";
  
  return {
    inline_keyboard: [[{ 
      text: "Abrir Maracutáia 🎭", 
      web_app: { url: appUrl } // ← web_app abre em fullscreen dentro do Telegram
    }]],
  };
}

/**
 * Configura o botão do menu do chat (ao lado da caixa de texto) para abrir Mini App.
 * Usa a API SetChatMenuButton do Telegram.
 * 
 * @param botToken - Token do bot
 * @param appUrl - URL do Mini App
 */
export async function setChatMenuButton(
  botToken: string,
  appUrl: string,
): Promise<{ ok: boolean; description?: string }> {
  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        menu_button: {
          type: "web_app",
          text: "Abrir Maracutáia 🎭",
          web_app: { url: appUrl },
        },
      }),
    });

    const data = await response.json() as { ok: boolean; description?: string };
    return data;
  } catch (err) {
    return {
      ok: false,
      description: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Função principal ─────────────────────────────────────────────

/**
 * Envia uma mensagem via Bot API do Telegram.
 * Retorna { ok, errorCode, description } — nunca lança exceção.
 * 
 * @param chatId - telegramId do destinatário (já é o chat_id)
 * @param text - Texto da mensagem (suporta HTML básico)
 * @param options - Opções adicionais (parseMode, replyMarkup)
 */
export async function sendBotMessage(
  chatId: number,
  text: string,
  options: SendMessageOptions = {},
): Promise<BotApiResult> {
  try {
    const body: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: options.parseMode ?? "HTML",
      disable_web_page_preview: options.disableWebPagePreview ?? true,
    };

    if (options.replyMarkup) {
      body.reply_markup = options.replyMarkup;
    }

    const response = await fetch(`${BOT_API}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await response.json() as { ok: boolean; error_code?: number; description?: string };

    return {
      ok: data.ok,
      errorCode: data.error_code,
      description: data.description,
    };
  } catch (err) {
    // Falha de rede ou parse JSON — retorna erro sem lançar
    return {
      ok: false,
      description: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Mensagens tipadas por evento ─────────────────────────────────

/**
 * Envia notificação de nova resposta ao autor do post original.
 * 
 * @param recipientId - Quem recebe (dono do post original)
 * @param actorName - Nome de quem respondeu
 * @param replyContent - Conteúdo da resposta (max 100 chars)
 */
export async function notifyReply(
  recipientId: number,
  actorName: string,
  replyContent: string,
): Promise<BotApiResult> {
  const name = escapeHtml(actorName);
  const content = escapeHtml(truncate(replyContent, 100));
  const text = `💬 <b>${name}</b> respondeu sua thread:\n\n<i>"${content}"</i>`;
  
  return sendBotMessage(recipientId, text, { replyMarkup: openAppButton() });
}

/**
 * Envia notificação de nova reação ao autor do post.
 * 
 * @param recipientId - Quem recebe (dono do post)
 * @param actorName - Nome de quem reagiu
 * @param emoji - Emoji da reação
 * @param postContent - Conteúdo do post reagido (para contexto)
 */
export async function notifyReaction(
  recipientId: number,
  actorName: string,
  emoji: string,
  postContent: string,
): Promise<BotApiResult> {
  const name = escapeHtml(actorName);
  const content = escapeHtml(truncate(postContent, 60));
  const text = `${emoji} <b>${name}</b> reagiu na sua thread\n\n<i>"${content}"</i>`;
  
  return sendBotMessage(recipientId, text, { replyMarkup: openAppButton() });
}

/**
 * Envia notificação de novo seguidor.
 * 
 * @param recipientId - Quem recebe (dono do perfil)
 * @param actorName - Nome de quem seguiu
 */
export async function notifyFollow(
  recipientId: number,
  actorName: string,
): Promise<BotApiResult> {
  const name = escapeHtml(actorName);
  const text = `👀 <b>${name}</b> veio bisbilhotar sua vida\n\nAgora te segue no Maracutáia.`;
  
  return sendBotMessage(recipientId, text, { replyMarkup: openAppButton() });
}

/**
 * Envia notificação de menção a um usuário.
 */
export async function notifyMention(
  recipientId: number,
  actorName: string,
  postContent: string,
): Promise<BotApiResult> {
  const name    = escapeHtml(actorName);
  const content = escapeHtml(truncate(postContent, 80));
  const text    = `👋 <b>${name}</b> te mencionou numa thread:\n\n<i>"${content}"</i>`;
  return sendBotMessage(recipientId, text, { replyMarkup: openAppButton() });
}

/**
 * Cada admin recebe uma mensagem individual.
 *
 * @param reporterName  - Nome de quem denunciou
 * @param reporterId    - telegramId de quem denunciou
 * @param postId        - ID do post denunciado
 * @param postContent   - Conteúdo do post
 * @param postAuthorId  - telegramId do autor do post
 */
export async function notifyReport(params: {
  reporterName: string;
  reporterId: number;
  postId: number;
  postContent: string;
  postAuthorId: number;
  adminIds: number[];
}): Promise<void> {
  const reporter = escapeHtml(params.reporterName);
  const content  = escapeHtml(truncate(params.postContent, 120));

  const text = [
    `🚨 <b>Denúncia de post</b>`,
    ``,
    `Post <b>#${params.postId}</b> de <code>${params.postAuthorId}</code>`,
    `Denunciado por <b>${reporter}</b> (<code>${params.reporterId}</code>)`,
    ``,
    `<i>"${content}"</i>`,
  ].join('\n');

  // Fire-and-forget para cada admin — falha silenciosa individual
  await Promise.allSettled(
    params.adminIds.map(adminId => sendBotMessage(adminId, text))
  );
}

/**
 * Usado para exportação de dados do usuário (LGPD).
 *
 * @param chatId    - telegramId do destinatário
 * @param filename  - Nome do arquivo (ex: "meus-dados.txt")
 * @param content   - Conteúdo do arquivo como string UTF-8
 * @param caption   - Legenda opcional exibida junto ao documento
 */
export async function sendBotDocument(
  chatId: number,
  filename: string,
  content: string,
  caption?: string,
): Promise<BotApiResult> {
  try {
    const form = new FormData();
    form.append('chat_id', String(chatId));
    form.append('document', new Blob([content], { type: 'text/plain' }), filename);
    if (caption) form.append('caption', caption);

    const response = await fetch(`${BOT_API}/sendDocument`, {
      method: 'POST',
      body: form,
    });

    const data = await response.json() as { ok: boolean; error_code?: number; description?: string };
    return { ok: data.ok, errorCode: data.error_code, description: data.description };
  } catch (err) {
    return { ok: false, description: err instanceof Error ? err.message : 'Unknown error' };
  }
}
