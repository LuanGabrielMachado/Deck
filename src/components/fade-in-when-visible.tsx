'use client';

import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface FadeInWhenVisibleProps {
  children: ReactNode;
  className?: string;
  /** Delay em ms antes de animar (para efeito cascata em listas) */
  delay?: number;
}

/**
 * Wrapper que faz fade-in suave quando o elemento entra na viewport.
 * Usa IntersectionObserver — dispara uma vez e se desconecta.
 * Não usa transform para não quebrar backdrop-filter dos filhos glass.
 */
export function FadeInWhenVisible({ children, className, delay = 0 }: FadeInWhenVisibleProps) {
  const { ref, inView } = useInView(0.05);

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: inView ? 1 : 0,
        transition: `opacity 0.35s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
