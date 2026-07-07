'use client';

import { useEffect } from 'react';

/**
 * Inicializa o Telegram Mini Apps Analytics SDK via window.telegramAnalytics.
 *
 * - Não coleta dados pessoais — eventos são anônimos e GDPR-compliant.
 * - Exigido para publicação no catálogo do Telegram.
 * - Token configurado via NEXT_PUBLIC_TG_ANALYTICS_TOKEN no Vercel.
 * - O script é carregado via <Script> no layout.tsx.
 */

type TgAnalytics = { init: (opts: { token: string; appName: string }) => void };

export function TelegramAnalyticsProvider() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_TG_ANALYTICS_TOKEN;
    if (!token) return;

    const tryInit = (): boolean => {
      const analytics = (window as Window & { telegramAnalytics?: TgAnalytics }).telegramAnalytics;
      if (analytics?.init) {
        analytics.init({ token, appName: 'deck' });
        return true;
      }
      return false;
    };

    // Tenta imediatamente; se o script ainda não carregou faz polling curto
    if (!tryInit()) {
      const interval = setInterval(() => {
        if (tryInit()) clearInterval(interval);
      }, 100);
      setTimeout(() => clearInterval(interval), 10_000);
    }
  }, []);

  return null;
}
