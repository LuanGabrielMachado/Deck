import { adminProcedure, publicProcedure, router } from "./trpc";
import { ENV } from "./env";
import { setChatMenuButton } from "../bot/telegram-bot";

export const systemRouter = router({
  /** Health check simples — sem input, retorna ok: true */
  health: publicProcedure.query(() => ({ ok: true })),

  /**
   * Configura o botão do menu do chat para abrir o Mini App.
   * Apenas admin pode executar.
   */
  setMenuButton: adminProcedure.mutation(async () => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://deck.vercel.app";
    const result = await setChatMenuButton(ENV.telegramBotToken, appUrl);

    if (!result.ok) {
      throw new Error(`Falha ao configurar botão: ${result.description}`);
    }

    return { success: true, message: "Botão do menu configurado com sucesso!" };
  }),
});
