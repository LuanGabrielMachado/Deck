/**
 * Singleton do giroscópio — um único listener DeviceMotion para todo o app.
 *
 * Pipeline simples e robusto:
 *   rawX → deadzone → sinal → EMA → decay ao parar → clamp → fx
 *
 * SEM calibração de bias — a calibração era a causa da deriva direcional:
 * se o celular se movia durante a coleta das amostras, o biasX ficava
 * errado e criava um offset constante que sempre empurrava para um lado.
 *
 * A deadzone (0.4 m/s²) filtra tremor de mão e ruído do sensor sem precisar
 * de calibração. O decay agressivo garante que fx/fy voltam a zero assim que
 * o celular para de se mover.
 */

import type { ExternalForce } from '@/hooks/use-physics-particles';

export const deviceMotionForce: ExternalForce = { fx: 0, fy: 0 };

const EMA_ALPHA   = 0.18;  // suavização do sinal ativo
const DECAY       = 0.80;  // decay quando em repouso — volta a zero rápido
const SENSITIVITY = 0.010; // px/frame por m/s²
const MAX_FORCE   = 0.022; // teto de força por frame
const DEADZONE    = 0.4;   // m/s² — abaixo = repouso (tremor de mão/ruído)
const EPSILON     = 0.0005; // abaixo disso zera hard

const ema = { x: 0, y: 0 };
let listenerActive = false;

function clamp(v: number) {
  return Math.max(-MAX_FORCE, Math.min(MAX_FORCE, v));
}

function handleMotion(e: DeviceMotionEvent) {
  const acc = e.acceleration;
  if (!acc) return;

  const rawX = acc.x ?? 0;
  const rawY = acc.y ?? 0;

  // Deadzone: abaixo do limiar → decai para zero
  // Acima → converte para força e aplica EMA
  const inDeadzoneX = Math.abs(rawX) <= DEADZONE;
  const inDeadzoneY = Math.abs(rawY) <= DEADZONE;

  if (inDeadzoneX) {
    ema.x *= DECAY;
  } else {
    // Eixo X: negativo = direita no Android, por isso inverte
    const target = -(rawX) * SENSITIVITY;
    ema.x = EMA_ALPHA * target + (1 - EMA_ALPHA) * ema.x;
  }

  if (inDeadzoneY) {
    ema.y *= DECAY;
  } else {
    const target = (rawY) * SENSITIVITY;
    ema.y = EMA_ALPHA * target + (1 - EMA_ALPHA) * ema.y;
  }

  // Hard zero para evitar drift residual
  if (Math.abs(ema.x) < EPSILON) ema.x = 0;
  if (Math.abs(ema.y) < EPSILON) ema.y = 0;

  deviceMotionForce.fx = clamp(ema.x);
  deviceMotionForce.fy = clamp(ema.y);
}

export function startDeviceMotion(): void {
  if (typeof window === 'undefined' || listenerActive) return;
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) return;
  if (!('DeviceMotionEvent' in window)) return;

  ema.x = 0; ema.y = 0;
  deviceMotionForce.fx = 0; deviceMotionForce.fy = 0;
  window.addEventListener('devicemotion', handleMotion, { passive: true });
  listenerActive = true;
}

export async function requestDeviceMotionPermission(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  if (listenerActive) return true;

  const reqFn = (DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> }).requestPermission;
  if (typeof reqFn === 'function') {
    try {
      const result = await reqFn();
      if (result !== 'granted') return false;
    } catch {
      return false;
    }
  }

  ema.x = 0; ema.y = 0;
  deviceMotionForce.fx = 0; deviceMotionForce.fy = 0;
  window.addEventListener('devicemotion', handleMotion, { passive: true });
  listenerActive = true;
  return true;
}
