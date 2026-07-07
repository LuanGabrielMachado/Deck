/**
 * Sorteia uma imagem de fundo aleatória para a página ao montar.
 * Troca a cada navegação (remontagem do componente), sem timer nem loop.
 *
 * Pré-carrega todas as imagens do array em background para que
 * as próximas visitas sejam instantâneas (browser cache + immutable headers).
 *
 * @example
 * const bg = usePageBackground('seguir');
 * // bg = '/images/seguir/seguir-2.jpg?v5'  ← aleatório por visita
 */

import { useMemo, useEffect } from 'react';
import { PAGE_BACKGROUNDS, type PageBackgroundKey } from '@/constants/images';

export function usePageBackground(page: PageBackgroundKey): string {
  const images = PAGE_BACKGROUNDS[page];

  // Sorteia UMA vez por montagem — estável durante a visita
  const chosen = useMemo(() => {
    const idx = Math.floor(Math.random() * images.length);
    return images[idx];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pré-carrega as demais em background (fire-and-forget)
  useEffect(() => {
    images.forEach((src) => {
      if (src === chosen) return; // já está carregando/carregada
      const img = new window.Image();
      img.src = src;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return chosen;
}
