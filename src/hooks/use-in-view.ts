/**
 * Hook leve de Intersection Observer.
 * Retorna true uma única vez quando o elemento entra na viewport.
 * Depois se desconecta — zero custo contínuo.
 *
 * NOTA: Não inclui `threshold` no dep array para evitar re-criação
 * do observer quando o caller passa um objeto literal inline.
 * O valor é estável por design — sempre lido na montagem inicial.
 */

import { useEffect, useRef, useState } from 'react';

export function useInView(threshold = 0.1): {
  ref: React.RefObject<HTMLDivElement | null>;
  inView: boolean;
} {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect(); // dispara só uma vez
      }
    }, { threshold });

    observer.observe(el);
    return () => observer.disconnect();
  // threshold é um primitivo — safe no dep array
  }, [threshold]);

  return { ref, inView };
}
