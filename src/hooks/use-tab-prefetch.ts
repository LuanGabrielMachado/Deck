/**
 * Hook que encapsula a lógica de pré-carregamento de assets por rota.
 *
 * - LRU cache de 20 itens com limpeza a cada 10 minutos
 * - Pré-carrega imagens e aquece cache de vídeo ao navegar
 */

import { useCallback } from 'react';
import { aquecerVideoCache } from '@/lib/video-cache';
import { IMAGES, PAGE_BACKGROUNDS } from '@/constants/images';

const ROUTE_ASSETS: Record<string, string[]> = {
  '/':        [IMAGES.feed,            IMAGES.icon],
  '/create':  [IMAGES.bgArtistic,      IMAGES.icon],
  '/follow':  [...PAGE_BACKGROUNDS.seguir,  IMAGES.icon],
  '/profile': [...PAGE_BACKGROUNDS.perfil,  IMAGES.icon],
  '/admin':   [...PAGE_BACKGROUNDS.ferramentas],
};

// ── LRU cache singleton de módulo ────────────────────────────────────────────
const MAX_CACHE_SIZE = 20;
const prefetchedAssets = new Map<string, number>(); // src → timestamp

// Limpeza periódica a cada 10 minutos — previne memory leak
if (typeof window !== 'undefined') {
  setInterval(() => prefetchedAssets.clear(), 10 * 60 * 1000);
}

function prefetchAsset(src: string): void {
  if (typeof window === 'undefined') return;

  if (prefetchedAssets.has(src)) {
    // Atualiza timestamp (move para o fim — mais recente)
    prefetchedAssets.delete(src);
  } else if (prefetchedAssets.size >= MAX_CACHE_SIZE) {
    // Remove o mais antigo (primeira entrada do Map)
    const oldest = prefetchedAssets.keys().next().value;
    if (oldest) prefetchedAssets.delete(oldest);
  }

  prefetchedAssets.set(src, Date.now());
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}

export function useTabPrefetch() {
  const prefetchRoute = useCallback((route: string): void => {
    const assets = ROUTE_ASSETS[route] ?? [];
    assets.forEach(prefetchAsset);

    // Aquece o cache de vídeo ao pré-carregar a rota de criação
    if (route === '/create') {
      aquecerVideoCache('/videos/animation.mp4');
    }
  }, []);

  return { prefetchRoute, ROUTE_ASSETS };
}
