/**
 * Mantém a tela acesa usando a Screen Wake Lock API.
 * Solicita o lock ao montar, libera ao desmontar.
 * Re-adquire automaticamente se a visibilidade da página muda
 * (o lock é liberado automaticamente quando o app vai para background).
 *
 * Silencioso: sem UI, sem avisos — funciona nos bastidores.
 * Suporte: Chrome/Edge Android, Safari iOS 16.4+. Ignora silenciosamente se não disponível.
 */

import { useEffect, useRef } from 'react';

export function useWakeLock() {
  const lockRef = useRef<WakeLockSentinel | null>(null);

  const acquire = async () => {
    if (typeof navigator === 'undefined' || !('wakeLock' in navigator)) return;
    try {
      lockRef.current = await navigator.wakeLock.request('screen');
    } catch { /* silencioso — bateria baixa ou não suportado */ }
  };

  const release = () => {
    lockRef.current?.release().catch(() => {});
    lockRef.current = null;
  };

  useEffect(() => {
    void acquire();

    // Re-adquire quando o usuário volta para o app (lock é perdido em background)
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') void acquire();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      release();
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
