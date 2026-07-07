'use client';

import { useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Colors, type ColorScheme } from '@/constants/theme';

type TelegramThemeParams = {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  button_color?: string;
  button_text_color?: string;
  link_color?: string;
};

function applyPalette(scheme: ColorScheme, params: TelegramThemeParams | null) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.dataset.theme = scheme;
  root.classList.toggle('dark', scheme === 'dark');

  const base = Colors[scheme];
  const palette = {
    ...base,
    primary:              params?.button_color       || base.primary,
    'primary-foreground': params?.button_text_color  || base['primary-foreground'],
    accent:               params?.link_color         || base.accent,
  };
  Object.entries(palette).forEach(([token, value]) => {
    root.style.setProperty(`--color-${token}`, value);
  });
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const init = useCallback(() => {
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    if (!tg) return;

    const params = tg.themeParams;
    const isDark = params?.bg_color?.startsWith('#')
      && parseInt(params.bg_color.slice(1), 16) < 0x888888;

    applyPalette(isDark ? 'dark' : 'light', params);
  }, []);

  useEffect(() => {
    init();
    const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
    if (!tg) return;

    const handleChange = () => {
      const p = tg.themeParams;
      const isDark = p?.bg_color?.startsWith('#')
        && parseInt(p.bg_color.slice(1), 16) < 0x888888;
      applyPalette(isDark ? 'dark' : 'light', p);
    };

    tg.onEvent?.('themeChanged', handleChange);
    return () => tg.offEvent?.('themeChanged', handleChange);
  }, [init]);

  return <>{children}</>;
}
