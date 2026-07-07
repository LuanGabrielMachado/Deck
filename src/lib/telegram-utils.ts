// lib/telegram-utils.ts

import type { TelegramWebApp } from '@/types/telegram';

// Wrapper seguro para o SDK do Telegram que evita erros de SSR
let tg: TelegramWebApp | null = null;
let isInitializing = false;

function ensureTelegramWebApp() {
  if (!tg) {
    initTelegramWebApp();
  }
  return tg;
}

// Função para inicializar o SDK do Telegram de forma segura
export function initTelegramWebApp() {
  if (typeof window !== "undefined" && !tg && !isInitializing) {
    isInitializing = true;
    try {
      if (window.Telegram?.WebApp) {
        tg = window.Telegram.WebApp;

        // ⚠️ EXPANDIR E SOLICITAR FULLSCREEN (necessário para Menu Button)
        try { tg.expand(); } catch { /* ignore */ }
        try { tg.requestFullscreen(); } catch { /* ignore */ }

        // Trava em portrait — app desenhado só para vertical
        try { (tg as unknown as { lockOrientation?: () => void }).lockOrientation?.(); } catch { /* ignore */ }

        // Marca como pronto
        tg.ready();

        // Header branco = ícones da status bar ficam pretos
        try { tg.setHeaderColor('#ffffff'); } catch { /* ignore */ }
        try { tg.setBackgroundColor('#ffffff'); } catch { /* ignore */ }
      }
    } catch {
      // SDK do Telegram não disponível - silencioso para não poluir logs
    } finally {
      isInitializing = false;
    }
  }
  return tg;
}

// Função para obter o usuário do Telegram
export function getTelegramUser() {
  const instance = ensureTelegramWebApp();
  if (instance?.initDataUnsafe?.user) {
    return instance.initDataUnsafe.user;
  }
  return null;
}

// Função para verificar se está no WebView do Telegram
export function isTelegramWebView() {
  if (!tg) {
    initTelegramWebApp();
  }
  return !!tg;
}

// Funções auxiliares para usar o SDK de forma segura
export function closeTelegramApp() {
  const instance = ensureTelegramWebApp();
  if (instance) instance.close();
}

export type PopupButtonType = "default" | "ok" | "close" | "cancel" | "destructive";
export type PopupButton = { id?: string; type?: PopupButtonType; text?: string };
export type PopupParams = { title?: string; message: string; buttons?: PopupButton[] };

export function showTelegramPopup(params: PopupParams, callback?: (buttonId: string | null) => void) {
  const instance = ensureTelegramWebApp();
  if (!instance?.showPopup) return;
  instance.showPopup(params, callback);
}

export type HapticImpactStyle = "light" | "medium" | "heavy" | "rigid" | "soft";
export type HapticNotificationType = "success" | "warning" | "error";

export function hapticImpact(style: HapticImpactStyle = "light") {
  const instance = ensureTelegramWebApp();
  if (instance?.HapticFeedback?.impactOccurred) {
    instance.HapticFeedback.impactOccurred(style);
  }
}

export function hapticNotification(type: HapticNotificationType = "success") {
  const instance = ensureTelegramWebApp();
  if (instance?.HapticFeedback?.notificationOccurred) {
    instance.HapticFeedback.notificationOccurred(type);
  }
}

export function hapticSelection() {
  const instance = ensureTelegramWebApp();
  if (instance?.HapticFeedback?.selectionChanged) {
    instance.HapticFeedback.selectionChanged();
  }
}

export function mainButtonSetText(text: string) {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton) {
    instance.MainButton.setText(text);
  }
}

export function mainButtonShow() {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton) {
    instance.MainButton.show();
  }
}

export function mainButtonHide() {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton) {
    instance.MainButton.hide();
  }
}

export function mainButtonEnable() {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton) {
    instance.MainButton.enable();
  }
}

export function mainButtonDisable() {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton) {
    instance.MainButton.disable();
  }
}

export function mainButtonShowProgress() {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton) {
    instance.MainButton.showProgress();
  }
}

export function mainButtonHideProgress() {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton) {
    instance.MainButton.hideProgress();
  }
}

export function mainButtonOnClick(handler: () => void) {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton) {
    instance.MainButton.onClick(handler);
  }
}

export function mainButtonOffClick(handler: () => void) {
  const instance = ensureTelegramWebApp();
  if (instance?.MainButton?.offClick) {
    instance.MainButton.offClick(handler);
  }
}

export function backButtonShow() {
  const instance = ensureTelegramWebApp();
  if (instance?.BackButton) {
    instance.BackButton.show();
  }
}

export function backButtonHide() {
  const instance = ensureTelegramWebApp();
  if (instance?.BackButton) {
    instance.BackButton.hide();
  }
}

export function backButtonOnClick(handler: () => void) {
  const instance = ensureTelegramWebApp();
  if (instance?.BackButton) {
    instance.BackButton.onClick(handler);
  }
}

export function backButtonOffClick(handler: () => void) {
  const instance = ensureTelegramWebApp();
  if (instance?.BackButton?.offClick) {
    instance.BackButton.offClick(handler);
  }
}

export function expandTelegramApp() {
  const instance = ensureTelegramWebApp();
  if (instance?.expand) {
    instance.expand();
  }
}

export function getTelegramInitDataFromUrl(): string {
  if (typeof window === "undefined") return "";

  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  const search = window.location.search.startsWith("?")
    ? window.location.search.slice(1)
    : window.location.search;

  const hashParams = new URLSearchParams(hash);
  const searchParams = new URLSearchParams(search);

  return (
    hashParams.get("tgWebAppData") ||
    searchParams.get("tgWebAppData") ||
    ""
  );
}

export function getTelegramInitData(): string {
  const instance = ensureTelegramWebApp();
  return instance?.initData || getTelegramInitDataFromUrl() || "";
}
// ─── Web Vibration API ────────────────────────────────────────────────────────
// Padrões de vibração por emoji — Android direto, iOS não suporta a API
const REACTION_VIBRATION: Record<string, number | number[]> = {
  '💀': 400,
  '😂': [80, 60, 80],
  '😱': [200, 100, 200],
  '❤️': [60, 40, 60],
  '🔥': [40, 30, 40, 30, 40],
  '🖕': 300,
  '👍': 60,
  '😍': [60, 40, 60],
  '🤔': 80,
  '🍪': [50, 50, 50],
  '🐍': [100, 80, 100, 80, 100],
  '🐮': [80, 60, 120],
};

/**
 * Vibra o dispositivo com padrão específico para cada emoji de reação.
 * Usa Web Vibration API (Android) ou Telegram HapticFeedback (iOS).
 * Silencioso se nenhum estiver disponível.
 */
export function vibrateReaction(emoji: string): void {
  const pattern = REACTION_VIBRATION[emoji] ?? 60;

  // Tenta Web Vibration API primeiro (Android — mais expressivo)
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
      return;
    } catch { /* fallback */ }
  }

  // Fallback: Telegram HapticFeedback (iOS)
  const instance = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;
  if (instance?.HapticFeedback?.impactOccurred) {
    instance.HapticFeedback.impactOccurred('medium');
  }
}

// ─── Closing Confirmation ─────────────────────────────────────────────────────

/**
 * Ativa confirmação antes de fechar o app (popup nativo do Telegram).
 * Use quando o usuário tem trabalho não salvo (ex: texto digitado).
 */
export function enableClosingConfirmation(): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as { enableClosingConfirmation?: () => void })?.enableClosingConfirmation?.();
  } catch { /* ignore */ }
}

/**
 * Desativa a confirmação de fechamento.
 */
export function disableClosingConfirmation(): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as { disableClosingConfirmation?: () => void })?.disableClosingConfirmation?.();
  } catch { /* ignore */ }
}

// ─── Secondary Button ─────────────────────────────────────────────────────────

export function secondaryButtonShow(): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as { SecondaryButton?: { show: () => void } })?.SecondaryButton?.show();
  } catch { /* ignore */ }
}

export function secondaryButtonHide(): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as { SecondaryButton?: { hide: () => void } })?.SecondaryButton?.hide();
  } catch { /* ignore */ }
}

export function secondaryButtonSetText(text: string): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as { SecondaryButton?: { setText: (t: string) => void } })?.SecondaryButton?.setText(text);
  } catch { /* ignore */ }
}

export function secondaryButtonEnable(): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as { SecondaryButton?: { enable: () => void } })?.SecondaryButton?.enable();
  } catch { /* ignore */ }
}

export function secondaryButtonOnClick(handler: () => void): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as { SecondaryButton?: { onClick: (h: () => void) => void } })?.SecondaryButton?.onClick(handler);
  } catch { /* ignore */ }
}

export function secondaryButtonOffClick(handler: () => void): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as { SecondaryButton?: { offClick: (h: () => void) => void } })?.SecondaryButton?.offClick(handler);
  } catch { /* ignore */ }
}

// ─── switchInlineQuery ────────────────────────────────────────────────────────

/**
 * Abre uma inline query no chat do usuário com o bot.
 * Permite convidar amigos para o app diretamente de dentro do mini app.
 * @param query  Texto da query inline (aparece na caixa de texto do Telegram)
 * @param targets  Quais tipos de chat mostrar: 'users' | 'groups' | 'channels' | 'bots'
 */
export function switchInlineQuery(
  query: string,
  targets: Array<'users' | 'groups' | 'channels' | 'bots'> = ['users', 'groups'],
): void {
  const instance = ensureTelegramWebApp();
  try {
    (instance as unknown as {
      switchInlineQuery?: (q: string, t: string[]) => void;
    })?.switchInlineQuery?.(query, targets);
  } catch { /* ignore */ }
}

// ─── BiometricManager ─────────────────────────────────────────────────────────

type BiometricType = 'finger' | 'face' | 'unknown';
type BiometricRequestAccessParams = { reason?: string };
type BiometricAuthenticateParams = { reason?: string };

interface BiometricManager {
  isInited: boolean;
  isBiometricAvailable: boolean;
  biometricType: BiometricType;
  isAccessRequested: boolean;
  isAccessGranted: boolean;
  isBiometricTokenSaved: boolean;
  init: (cb?: () => void) => BiometricManager;
  requestAccess: (params: BiometricRequestAccessParams, cb: (granted: boolean) => void) => BiometricManager;
  authenticate: (params: BiometricAuthenticateParams, cb: (success: boolean, token?: string) => void) => BiometricManager;
  updateBiometricToken: (token: string, cb?: (success: boolean) => void) => BiometricManager;
  openSettings: () => BiometricManager;
}

function getBiometricManager(): BiometricManager | null {
  if (typeof window === 'undefined') return null;
  return (window.Telegram?.WebApp as unknown as { BiometricManager?: BiometricManager })?.BiometricManager ?? null;
}

/**
 * Inicializa o BiometricManager e retorna informações de disponibilidade.
 * Deve ser chamado antes de qualquer operação biométrica.
 */
export function biometricInit(cb?: (available: boolean, type: BiometricType) => void): void {
  const bm = getBiometricManager();
  if (!bm) { cb?.(false, 'unknown'); return; }
  bm.init(() => {
    cb?.(bm.isBiometricAvailable, bm.biometricType);
  });
}

/**
 * Solicita permissão de acesso à biometria ao usuário.
 * Deve ser chamado uma vez, idealmente a partir de um gesto do usuário.
 */
export function biometricRequestAccess(
  reason: string,
  cb: (granted: boolean) => void,
): void {
  const bm = getBiometricManager();
  if (!bm) { cb(false); return; }
  bm.requestAccess({ reason }, cb);
}

/**
 * Autentica o usuário via biometria (Face ID / Touch ID / Fingerprint).
 * Retorna sucesso e o token salvo (se houver).
 */
export function biometricAuthenticate(
  reason: string,
  cb: (success: boolean, token?: string) => void,
): void {
  const bm = getBiometricManager();
  if (!bm) { cb(false); return; }
  bm.authenticate({ reason }, cb);
}

/**
 * Salva um token no armazenamento biométrico seguro do Telegram.
 * O token é retornado quando a autenticação for bem-sucedida.
 */
export function biometricUpdateToken(token: string, cb?: (success: boolean) => void): void {
  const bm = getBiometricManager();
  if (!bm) { cb?.(false); return; }
  bm.updateBiometricToken(token, cb);
}

/**
 * Abre as configurações de biometria do app no Telegram.
 */
export function biometricOpenSettings(): void {
  const bm = getBiometricManager();
  bm?.openSettings();
}

/**
 * Verifica se biometria está disponível e já teve acesso concedido.
 */
export function biometricIsReady(): boolean {
  const bm = getBiometricManager();
  if (!bm?.isInited) return false;
  return bm.isBiometricAvailable && bm.isAccessGranted;
}

/**
 * Retorna true se o token de lock foi salvo pelo usuário.
 * Diferente de biometricIsReady() — indica se o lock ESTÁ ATIVADO,
 * independente de o usuário já ter autenticado nesta sessão.
 */
export function biometricIsTokenSaved(): boolean {
  const bm = getBiometricManager();
  if (!bm?.isInited) return false;
  return bm.isBiometricTokenSaved;
}
