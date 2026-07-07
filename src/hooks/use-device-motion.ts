/**
 * Hook que retorna uma ref para a força do giroscópio singleton.
 *
 * O singleton (device-motion-singleton.ts) mantém UM único listener
 * DeviceMotionEvent para todo o app — independente de quantos componentes
 * usam este hook. Elimina o N× de listeners que existia antes.
 *
 * - Android: ativa automaticamente via startDeviceMotion()
 * - iOS 13+: requer gesto do usuário → requestDeviceMotionPermission()
 */

import { useEffect, useRef } from 'react';
import {
  deviceMotionForce,
  startDeviceMotion,
} from '@/lib/device-motion-singleton';
import type { ExternalForce } from './use-physics-particles';

export function useDeviceMotion() {
  // Ref estável que aponta sempre para o objeto singleton
  // O motor de física lê .current a cada frame — sem overhead
  const motionRef = useRef<ExternalForce>(deviceMotionForce);

  useEffect(() => {
    // Garante que o listener está ativo (idempotente — seguro chamar N vezes)
    startDeviceMotion();
    // motionRef.current sempre aponta para o mesmo objeto singleton
    // Não há cleanup necessário — o singleton vive enquanto o app viver
  }, []);

  return motionRef;
}
