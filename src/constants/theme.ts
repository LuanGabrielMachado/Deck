export type ColorScheme = 'light' | 'dark';

// Tokens base de cor — usados pelo ThemeProvider para aplicar CSS vars
const baseTokens = {
  primary:              '#3b82f6',
  'primary-foreground': '#ffffff',
  accent:               '#6366f1',
  background:           '#ffffff',
  foreground:           '#0f172a',
  error:                '#ef4444',
  success:              '#22c55e',
  warning:              '#f59e0b',
  muted:                '#64748b',
  border:               '#e2e8f0',
};

const darkTokens = {
  ...baseTokens,
  background: '#0f172a',
  foreground: '#f8fafc',
  border:     '#1e293b',
  muted:      '#94a3b8',
};

// Colors[scheme] retorna o mapa de tokens para o esquema dado
export const Colors: Record<ColorScheme, Record<string, string>> = {
  light: baseTokens,
  dark:  darkTokens,
};
