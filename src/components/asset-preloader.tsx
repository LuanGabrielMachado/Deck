'use client';

import { useEffect } from 'react';
import { IMAGES } from '@/constants/images';
import { startDeviceMotion, requestDeviceMotionPermission } from '@/lib/device-motion-singleton';

/**
 * AssetPreloader — pré-carrega imagens em background e inicializa o
 * singleton do giroscópio.
 *
 * - Android: ativa o listener devicemotion direto (sem permissão)
 * - iOS 13+: aguarda o primeiro toque para pedir permissão (requisito do Safari)
 *
 * Colocado no layout.tsx para garantir execução única no ciclo de vida do app.
 */
export function AssetPreloader() {
  useEffect(() => {
    // ── Giroscópio ──────────────────────────────────────────────────────────
    // Android: ativa direto (startDeviceMotion é idempotente)
    startDeviceMotion();

    // iOS: pede permissão no primeiro toque do usuário
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      const reqFn = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
      if (typeof reqFn === 'function') {
        const handleFirstTouch = () => {
          void requestDeviceMotionPermission();
          window.removeEventListener('touchstart', handleFirstTouch);
        };
        window.addEventListener('touchstart', handleFirstTouch, { once: true, passive: true });
        return () => window.removeEventListener('touchstart', handleFirstTouch);
      }
    }

    // ── Preload de imagens ──────────────────────────────────────────────────
    const agendar = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback
      : (cb: () => void) => setTimeout(cb, 3000);

    const id = agendar(() => {
      Object.values(IMAGES).forEach((src) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = src;
      });
    });

    return () => {
      if (typeof cancelIdleCallback !== 'undefined' && typeof id === 'number') {
        cancelIdleCallback(id);
      }
    };
  }, []);

  return null;
}
