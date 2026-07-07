'use client';

/**
 * BiometricGate — envolve toda a aplicação e bloqueia a UI quando o lock
 * biométrico está ativo. Renderiza uma tela de bloqueio fullscreen no lugar
 * dos filhos enquanto status === 'locked'.
 *
 * Colocado no layout.tsx, acima de todas as páginas.
 * idle / unlocked / unavailable → renderiza children normalmente.
 * locked → renderiza lock screen, chama authenticate() automaticamente.
 */

import { useBiometricLock } from '@/hooks/use-biometric-lock';
import type { ReactNode } from 'react';

export function BiometricGate({ children }: { children: ReactNode }) {
  const { isLocked, biometricType, authenticate } = useBiometricLock();

  if (!isLocked) return <>{children}</>;

  const icon     = biometricType === 'face' ? '🫧' : '🔒';
  const label    = biometricType === 'face'
    ? 'Reconhecimento facial para entrar'
    : biometricType === 'finger'
    ? 'Impressão digital para entrar'
    : 'Biometria para entrar';
  const btnLabel = biometricType === 'face' ? '🫧 Reconhecer' : '👆 Usar digital';

  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center gap-6 px-8"
      style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)' }}
    >
      <span className="text-7xl">{icon}</span>

      <div
        className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 backdrop-blur-xl text-center"
        style={{ maxWidth: 300 }}
      >
        <p className="text-lg font-bold text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
          Conta bloqueada
        </p>
        <p className="mt-1 text-sm text-white/70">{label}</p>
      </div>

      <button
        onClick={() => authenticate()}
        className="rounded-2xl border border-white/20 bg-white/10 px-8 py-3 text-base font-semibold text-white backdrop-blur-xl transition-opacity active:opacity-70"
        style={{ minWidth: 180 }}
      >
        {btnLabel}
      </button>
    </div>
  );
}
