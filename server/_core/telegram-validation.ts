import crypto from "crypto";

/**
 * Validar e decodificar initData do Telegram usando HMAC-SHA256
 * Referência: https://core.telegram.org/bots/webapps#validating-data-received-from-the-web-app
 */

interface TelegramInitData {
  user?: {
    id: number;
    is_bot: boolean;
    first_name: string;
    last_name?: string;
    username?: string;
    language_code?: string;
    is_premium?: boolean;
    added_to_attachment_menu?: boolean;
    allows_write_to_pm?: boolean;
    photo_url?: string;
  };
  chat?: {
    id: number;
    type: string;
    title?: string;
    username?: string;
    photo_url?: string;
  };
  auth_date: number;
  hash: string;
  [key: string]: unknown;
}

/**
 * Parse query string parameters
 */
function parseQueryString(queryString: string): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(queryString);
  for (const [key, value] of searchParams.entries()) {
    params[key] = value;
  }
  return params;
}

/**
 * Validate Telegram initData
 *
 * @param initDataString - The full initData string from Telegram WebApp
 * @param botToken - The bot token (used as HMAC key)
 * @returns Parsed initData if valid, null if invalid
 */
export function validateTelegramInitData(
  initDataString: string,
  botToken: string
): TelegramInitData | null {
  try {
    // Parse the query string
    const initData = parseQueryString(initDataString);

    // Extract hash from data
    const hash = initData.hash;
    if (!hash) {
      // Hash não encontrado - validação falhou
      return null;
    }

    // Create a copy without hash and signature for verification
    const dataCheckString = Object.keys(initData)
      .filter((key) => key !== "hash")
      .sort()
      .map((key) => `${key}=${initData[key]}`)
      .join("\n");

    // Verify signature using HMAC-SHA256
    // Primary (WebAppData) key per Telegram docs
    const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();

    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    // SECURITY FIX: Remove legacy fallback (aceitar apenas WebAppData HMAC-SHA256)
    // O método legacy (SHA256 do botToken) é mais fraco e permite autenticação indevida
    if (calculatedHash !== hash) {
      // Assinatura inválida
      return null;
    }

    // Verifica auth_date para garantir que o initData não é muito antigo.
    // Em produção: 5 minutos (segurança máxima).
    // Em desenvolvimento: 1 hora (evita fricção com initData fixo/reutilizado).
    const authDate = parseInt(initData.auth_date || "0");
    const currentTime = Math.floor(Date.now() / 1000);
    const isDev = process.env.NODE_ENV !== "production";
    const maxAge = isDev ? 3600 : 300; // 1h em dev, 5min em prod

    if (currentTime - authDate > maxAge) {
      // initData expirado
      return null;
    }

    // Parse user data if present
    if (initData.user) {
      try {
        const userData = JSON.parse(initData.user);
        return {
          ...initData,
          user: userData,
          auth_date: authDate,
        } as TelegramInitData;
      } catch {
        // Falha ao parsear user data
        return null;
      }
    }

    return {
      ...initData,
      auth_date: authDate,
    } as TelegramInitData;
  } catch {
    // Erro na validação
    return null;
  }
}

/**
 * Extract the Authorization header value and validate it
 * Expects: "Bearer <initData>"
 */
export function extractAndValidateInitData(
  authHeader: string | undefined,
  botToken: string
): { telegramId?: number; valid: boolean } {
  if (!authHeader || !botToken) {
    // Header ou token ausentes
    return { valid: false };
  }

  // Extract Bearer token
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    // Formato inválido
    return { valid: false };
  }

  const initDataString = parts[1];
  const validData = validateTelegramInitData(initDataString, botToken);

  if (!validData || !validData.user?.id) {
    // Validação falhou
    return { valid: false };
  }

  return {
    telegramId: validData.user.id,
    valid: true,
  };
}
