/**
 * Configuração de variáveis de ambiente.
 *
 * Nota: Os módulos LLM, voice transcription e image generation foram removidos
 * da base de código (Prioridade 4 - Higiene). Se no futuro precisar reativá-los,
 * consulte o histórico do git pelos arquivos llm.ts, voiceTranscription.ts,
 * imageGeneration.ts.
 */

export const ENV = {
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  isProduction: process.env.NODE_ENV === "production",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  supabaseStorageBucket: process.env.SUPABASE_STORAGE_BUCKET ?? "posts",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN ?? "",
  botUsername: process.env.BOT_USERNAME ?? "",
  /**
   * IDs do Telegram dos administradores/moderadores.
   * Definido em .env como lista separada por vírgula, nunca commitado.
   */
  adminTelegramIds: (() => {
    const raw = process.env.ADMIN_TELEGRAM_ID;
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  })(),
  /**
   * IDs do Telegram dos moderadores (acesso parcial ao painel).
   * Podem deletar posts e bypassar rate limit, mas não moderam usuários nem flags.
   * Definido em .env como MODERATOR_TELEGRAM_IDS, separado por vírgula.
   */
  moderatorTelegramIds: (() => {
    const raw = process.env.MODERATOR_TELEGRAM_IDS;
    if (!raw) return [];
    return raw
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => !isNaN(n) && n > 0);
  })(),
};
