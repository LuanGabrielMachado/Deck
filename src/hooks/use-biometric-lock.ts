'use client';

/**
 * Hook de lock biométrico via Telegram BiometricManager.
 *
 * O SDK do Telegram não expõe API para revogar acesso biométrico programaticamente.
 * A estratégia de "desativar" usa uma flag no CloudStorage + localStorage como opt-out:
 *   - Ativado:  flag ausente → checa biometricIsReady() normalmente
 *   - Desativado: flag presente → ignora biometricIsReady(), libera sem autenticar
 *
 * Persistência de estado:
 *   BIOMETRIC_ENABLED_CACHE (localStorage) — lido de forma síncrona no useState
 *   inicial para que o botão do perfil mostre o estado correto IMEDIATAMENTE
 *   ao voltar para o app, antes mesmo do biometricInit completar.
 *
 * Fluxo de ativação:
 *   1. requestAccess → pede permissão ao Telegram
 *   2. updateBiometricToken → salva token no Secure Enclave/Keystore
 *   3. Remove flag de opt-out → escreve BIOMETRIC_ENABLED_CACHE = '1'
 *
 * Fluxo de desativação:
 *   1. biometricAuthenticate → confirma identidade antes de desativar
 *   2. Se aprovado: salva BIOMETRIC_OPT_OUT + remove BIOMETRIC_ENABLED_CACHE
 *   3. Não toca no token (SDK não permite remoção) — a flag controla tudo
 *
 * Ao abrir / voltar do background: lê opt-out. Se presente, libera sem autenticar.
 *
 * Race condition guard (isDisablingRef):
 *   O popup nativo do Telegram dispara visibilitychange → checkAndLock inicia
 *   um await readOptOut(). Se o callback do popup chegar enquanto o await está
 *   em voo, o readOptOut já leu opt-out = false (escrita ainda não aconteceu) e
 *   checkAndLock reverteria o disable com setIsEnabled(true). O isDisablingRef
 *   é setado no início de disableBiometricLock e bloqueiam checkAndLock tanto
 *   antes quanto depois do await.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  biometricInit,
  biometricRequestAccess,
  biometricAuthenticate,
  biometricUpdateToken,
  biometricIsReady,
  biometricIsTokenSaved,
  isTelegramWebView,
} from '@/lib/telegram-utils';

const BIOMETRIC_TOKEN         = 'deck_session_verified';
const BIOMETRIC_OPT_OUT       = '@deck/biometric_disabled';
// Cache síncrono de estado ativo — persiste o ícone do botão entre sessões
const BIOMETRIC_ENABLED_CACHE = '@deck/biometric_active';

// ── CloudStorage helpers ──────────────────────────────────────────────────────

function getCloudStorage() {
  if (typeof window === 'undefined') return null;
  return window.Telegram?.WebApp?.CloudStorage ?? null;
}

async function readOptOut(): Promise<boolean> {
  // Checa localStorage primeiro (síncrono, imediato)
  try {
    if (localStorage.getItem(BIOMETRIC_OPT_OUT) === '1') return true;
  } catch { /* ignore */ }

  // Depois CloudStorage (assíncrono, fonte de verdade entre dispositivos)
  const cs = getCloudStorage();
  if (cs) {
    try {
      const val = await new Promise<string | null>((resolve) => {
        cs.getItem(BIOMETRIC_OPT_OUT, (err, v) => resolve(err ? null : v ?? null));
      });
      if (val === '1') return true;
    } catch { /* ignore */ }
  }
  return false;
}

function writeOptOut(): void {
  try { localStorage.setItem(BIOMETRIC_OPT_OUT, '1'); } catch { /* ignore */ }
  const cs = getCloudStorage();
  try { cs?.setItem(BIOMETRIC_OPT_OUT, '1'); } catch { /* ignore */ }
}

function clearOptOut(): void {
  try { localStorage.removeItem(BIOMETRIC_OPT_OUT); } catch { /* ignore */ }
  const cs = getCloudStorage();
  try { cs?.removeItem(BIOMETRIC_OPT_OUT); } catch { /* ignore */ }
}

// ─────────────────────────────────────────────────────────────────────────────

export type BiometricStatus =
  | 'idle'          // ainda não inicializado
  | 'unavailable'   // biometria não disponível neste dispositivo
  | 'locked'        // disponível, aguardando autenticação
  | 'unlocked'      // autenticado com sucesso
  | 'denied';       // permissão negada pelo usuário

export function useBiometricLock() {
  const [status, setStatus]               = useState<BiometricStatus>('idle');
  const [biometricType, setBiometricType] = useState<'finger' | 'face' | 'unknown'>('unknown');
  /**
   * Inicializado de forma SÍNCRONA a partir do localStorage.
   * Garante que o ícone 🔒/🔓 esteja correto imediatamente ao montar a página,
   * sem esperar pelo callback assíncrono do biometricInit.
   */
  const [isEnabled, setIsEnabled] = useState<boolean>(() => {
    try { return localStorage.getItem(BIOMETRIC_ENABLED_CACHE) === '1'; } catch { return false; }
  });
  const initDoneRef    = useRef(false);
  const typeRef        = useRef<'finger' | 'face' | 'unknown'>('unknown');
  const isDisablingRef = useRef(false);

  // ── Autenticar imediatamente (lock screen) ───────────────────────────────
  const doAuthenticate = useCallback(() => {
    const label = typeRef.current === 'face'
      ? 'Reconhecimento facial para entrar'
      : typeRef.current === 'finger'
      ? 'Impressão digital para entrar'
      : 'Biometria para entrar';

    biometricAuthenticate(label, (success) => {
      setStatus(success ? 'unlocked' : 'locked');
    });
  }, []);

  // ── Lógica central: decide se trava ou libera ────────────────────────────
  const checkAndLock = useCallback(async () => {
    if (isDisablingRef.current) return;

    if (!biometricIsReady() || !biometricIsTokenSaved()) {
      setIsEnabled(false);
      try { localStorage.removeItem(BIOMETRIC_ENABLED_CACHE); } catch { /* ignore */ }
      setStatus('unlocked');
      return;
    }

    const optedOut = await readOptOut();

    // Re-checa guard após o await (race condition)
    if (isDisablingRef.current) return;

    if (optedOut) {
      setIsEnabled(false);
      try { localStorage.removeItem(BIOMETRIC_ENABLED_CACHE); } catch { /* ignore */ }
      setStatus('unlocked');
      return;
    }

    setIsEnabled(true);
    try { localStorage.setItem(BIOMETRIC_ENABLED_CACHE, '1'); } catch { /* ignore */ }
    setStatus('locked');
    doAuthenticate();
  }, [doAuthenticate]);

  // ── Inicializa ao montar ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isTelegramWebView() || initDoneRef.current) return;
    initDoneRef.current = true;

    biometricInit((available, type) => {
      if (!available) { setStatus('unavailable'); return; }
      typeRef.current = type;
      setBiometricType(type);
      void checkAndLock();
    });
  }, [checkAndLock]);

  // ── Re-trava ao voltar do background ────────────────────────────────────
  useEffect(() => {
    if (!isTelegramWebView()) return;
    const handle = () => {
      if (document.visibilityState === 'visible') void checkAndLock();
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [checkAndLock]);

  // ── Ativar lock ──────────────────────────────────────────────────────────
  const enableBiometricLock = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      biometricRequestAccess('Proteja sua conta com biometria', (granted) => {
        if (!granted) { setStatus('denied'); resolve(false); return; }

        biometricUpdateToken(BIOMETRIC_TOKEN, (success) => {
          if (success) {
            clearOptOut();
            setIsEnabled(true);
            try { localStorage.setItem(BIOMETRIC_ENABLED_CACHE, '1'); } catch { /* ignore */ }
            setStatus('unlocked');
            resolve(true);
          } else {
            setStatus('denied');
            resolve(false);
          }
        });
      });
    });
  }, []);

  // ── Desativar lock ────────────────────────────────────────────────────────
  /**
   * Exige autenticação biométrica antes de desativar — mesma segurança do ativar.
   * O isDisablingRef é setado logo no início para bloquear qualquer checkAndLock
   * em voo (incluindo os disparados pelo visibilitychange do prompt biométrico).
   * Se a autenticação falhar, o guard é limpo e o lock permanece ativo.
   */
  const disableBiometricLock = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      // Seta guard imediatamente — bloqueia checkAndLock durante todo o fluxo
      isDisablingRef.current = true;

      const label = typeRef.current === 'face'
        ? 'Confirme para desativar o lock'
        : typeRef.current === 'finger'
        ? 'Use sua digital para desativar'
        : 'Confirme para desativar o lock';

      biometricAuthenticate(label, (success) => {
        if (!success) {
          // Autenticação negada — cancela, restaura guard e não desativa
          isDisablingRef.current = false;
          resolve(false);
          return;
        }

        // Confirmado — desativa e mantém guard por 2s para absorver
        // os visibilitychange do prompt biométrico fechando
        setTimeout(() => { isDisablingRef.current = false; }, 2000);

        writeOptOut();
        try { localStorage.removeItem(BIOMETRIC_ENABLED_CACHE); } catch { /* ignore */ }
        setIsEnabled(false);
        setStatus('unlocked');
        resolve(true);
      });
    });
  }, []);

  // ── Autenticação manual (lock screen) ────────────────────────────────────
  const authenticate = useCallback((): Promise<boolean> => {
    return new Promise((resolve) => {
      biometricAuthenticate(
        typeRef.current === 'face' ? 'Reconhecimento facial' : 'Impressão digital',
        (success) => { setStatus(success ? 'unlocked' : 'locked'); resolve(success); }
      );
    });
  }, []);

  return {
    status,
    biometricType,
    isLocked:      status === 'locked',
    isUnlocked:    status === 'unlocked' || status === 'unavailable' || status === 'idle',
    isUnavailable: status === 'unavailable',
    isEnabled,
    enableBiometricLock,
    disableBiometricLock,
    authenticate,
  };
}
