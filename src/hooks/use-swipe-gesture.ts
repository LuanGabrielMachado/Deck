/**
 * Hook que encapsula a lógica de detecção de swipe por toque.
 *
 * Retorna handlers de touchstart/touchend prontos para serem
 * aplicados em qualquer elemento. Threshold de 48px por padrão.
 */

import { useRef, useCallback } from 'react';

interface UseSwipeGestureOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Distância mínima em px para considerar um swipe (default: 48) */
  threshold?: number;
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  threshold = 48,
}: UseSwipeGestureOptions) {
  const touchStartXRef = useRef<number | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.changedTouches[0]?.clientX ?? null;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = e.changedTouches[0]?.clientX;
    touchStartXRef.current = null;

    if (startX == null || endX == null) return;

    const delta = endX - startX;
    if (Math.abs(delta) < threshold) return;

    if (delta < 0) {
      onSwipeLeft();
    } else {
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight, threshold]);

  return { handleTouchStart, handleTouchEnd };
}
