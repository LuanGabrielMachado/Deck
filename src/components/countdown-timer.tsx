'use client';

import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  timeRemainingMs: number;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'warning' | 'error';
}

export function CountdownTimer({
  timeRemainingMs,
  size = 'medium',
  variant = 'error',
}: CountdownTimerProps) {
  // Calcular minutos e segundos restantes
  const minutes = Math.floor(timeRemainingMs / 60000);
  const seconds = Math.floor((timeRemainingMs % 60000) / 1000);

  // Formatar texto de contagem regressiva
  const countdownText = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <p className={cn(
      'text-center font-bold',
      {
        'text-white': variant === 'error' || variant === 'primary',
        'text-foreground': variant === 'warning' || variant === 'secondary',
        'text-sm': size === 'small',
        'text-base': size === 'medium',
        'text-xl': size === 'large',
      }
    )}>
      {countdownText}
    </p>
  );
}
