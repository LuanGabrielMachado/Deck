'use client';

import { useEffect } from 'react';

/**
 * Solicita permissão para DeviceMotion no iOS no primeiro toque do usuário.
 * Android não precisa — já ativa automaticamente no hook.
 * Silencioso: não mostra nenhum UI, aproveita o primeiro toque como gesto.
 */
export function DeviceMotionPermission() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) return;

    // Só pede se a API existir e ainda não tiver permissão
    const requestFn = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
    if (typeof requestFn !== 'function') return;

    let requested = false;
    const handleFirstTouch = async () => {
      if (requested) return;
      requested = true;
      try {
        await requestFn();
      } catch { /* silencioso */ }
      window.removeEventListener('touchstart', handleFirstTouch);
    };

    window.addEventListener('touchstart', handleFirstTouch, { once: true, passive: true });
    return () => window.removeEventListener('touchstart', handleFirstTouch);
  }, []);

  return null;
}
