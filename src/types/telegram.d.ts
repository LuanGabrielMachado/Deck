// Telegram WebApp SDK types
// Referência: https://core.telegram.org/bots/webapps#initializing-mini-apps

/** Tipos para o showPopup */
export interface TelegramPopupButton {
  id?: string;
  type?: 'default' | 'ok' | 'close' | 'cancel' | 'destructive';
  text?: string;
}

export interface TelegramPopupParams {
  title?: string;
  message: string;
  buttons?: TelegramPopupButton[];
}

export interface TelegramUser {
  id: number;
  is_bot?: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  added_to_attachment_menu?: boolean;
  allows_write_to_pm?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  // ─── Dados de inicialização ─────────────────────────────────
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    auth_date?: number;
    hash?: string;
  };

  // ─── Propriedades do app ────────────────────────────────────
  platform: string;
  version: string;
  colorScheme: 'light' | 'dark';
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;

  themeParams: {
    bg_color?: string;
    secondary_bg_color?: string;
    text_color?: string;
    hint_color?: string;
    button_color?: string;
    button_text_color?: string;
    link_color?: string;
    section_separator_color?: string;
  };

  // ─── Métodos principais ─────────────────────────────────────
  ready: () => void;
  expand: () => void;
  requestFullscreen: () => void;
  close: () => void;
  openLink: (url: string) => void;
  openTelegramLink: (url: string) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback: (confirmed: boolean) => void) => void;
  showPopup: (params: TelegramPopupParams, callback?: (buttonId: string | null) => void) => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;

  // ─── Eventos ────────────────────────────────────────────────
  onEvent: (event: string, callback: () => void) => void;
  offEvent: (event: string, callback: () => void) => void;

  // ─── CloudStorage ───────────────────────────────────────────
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (err: Error | null) => void) => void;
    getItem: (key: string, callback: (err: Error | null, value?: string) => void) => void;
    removeItem: (key: string, callback?: (err: Error | null) => void) => void;
    getKeys: (callback: (err: Error | null, keys?: string[]) => void) => void;
  };

  // ─── Botões ─────────────────────────────────────────────────
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    setText: (text: string) => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
    onClick: (handler: () => void) => void;
    offClick: (handler: () => void) => void;
  };

  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (handler: () => void) => void;
    offClick: (handler: () => void) => void;
  };

  // ─── Haptic Feedback ────────────────────────────────────────
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'success' | 'warning' | 'error') => void;
    selectionChanged: () => void;
  };
}

export interface Telegram {
  WebApp: TelegramWebApp;
}

declare global {
  interface Window {
    Telegram?: Telegram;
  }
}
