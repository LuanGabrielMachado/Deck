/**
 * Utilitários de detecção e embed de vídeo.
 *
 * Plataformas suportadas:
 *   YouTube — youtube.com/watch, youtu.be, youtube.com/shorts, youtube.com/embed
 *   Vimeo   — vimeo.com/ID (vídeos públicos)
 *
 * X/Twitter e TikTok foram avaliados e descartados:
 *   - Twitter embeds requerem carregar twitter.com/widgets.js (externo, pesado, bloqueado em Telegram)
 *   - TikTok iframes não funcionam de forma confiável fora do app nativo
 */

export type EmbedPlatform = 'youtube' | 'vimeo';

export interface VideoEmbed {
  platform: EmbedPlatform;
  id: string;
  /** Nome legível para exibição no chip da página de criar */
  label: string;
}

// ── Padrões de detecção ───────────────────────────────────────────────────────

const PATTERNS: Array<{
  platform: EmbedPlatform;
  label: string;
  re: RegExp;
}> = [
  {
    platform: 'youtube',
    label: 'YouTube',
    // Cobre: watch?v=, youtu.be/, /shorts/, /embed/
    re: /(?:youtube\.com\/(?:watch\?(?:[^&\s]*&)*v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  },
  {
    platform: 'vimeo',
    label: 'Vimeo',
    // Cobre: vimeo.com/ID — exclui /channels/, /groups/, /user
    re: /vimeo\.com\/(?!channels\/|groups\/|user)(\d{5,12})(?:[/?#]|$)/,
  },
];

// Regex de remoção — remove qualquer URL das plataformas suportadas do texto
const STRIP_RE = new RegExp(
  [
    // YouTube
    'https?:\\/\\/(?:www\\.)?(?:youtube\\.com\\/(?:watch\\?[^\\s]*|shorts\\/[A-Za-z0-9_-]+|embed\\/[A-Za-z0-9_-]+)|youtu\\.be\\/[A-Za-z0-9_-]+)[^\\s]*',
    // Vimeo
    'https?:\\/\\/(?:www\\.)?vimeo\\.com\\/\\d+[^\\s]*',
  ].join('|'),
  'g',
);

// ── Funções públicas ──────────────────────────────────────────────────────────

/**
 * Detecta a primeira URL de vídeo suportada no texto.
 * Retorna null se não houver nenhuma.
 */
export function detectVideoEmbed(text: string): VideoEmbed | null {
  for (const { platform, label, re } of PATTERNS) {
    const m = text.match(re);
    if (m?.[1]) return { platform, id: m[1], label };
  }
  return null;
}

/**
 * Remove URLs de vídeo suportadas do texto e limpa quebras de linha extras.
 */
export function stripVideoUrl(text: string): string {
  return text.replace(STRIP_RE, '').replace(/\n{3,}/g, '\n\n').trim();
}

/**
 * Extrai a URL bruta de vídeo suportada do texto.
 * Retorna null se não encontrar nenhuma.
 */
export function extractVideoUrl(text: string): string | null {
  const m = text.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/(?:watch\?[^\s]*|shorts\/[A-Za-z0-9_-]+|embed\/[A-Za-z0-9_-]+)|youtu\.be\/[A-Za-z0-9_-]+|vimeo\.com\/\d+)[^\s]*/
  );
  return m?.[0] ?? null;
}

export function getEmbedUrl(embed: VideoEmbed): string {
  if (embed.platform === 'youtube') {
    return `https://www.youtube.com/embed/${embed.id}?autoplay=1&rel=0`;
  }
  // Vimeo: autoplay=1, dnt=1 (não rastreia)
  return `https://player.vimeo.com/video/${embed.id}?autoplay=1&dnt=1`;
}

/**
 * Retorna a URL da thumbnail, se disponível via CDN público.
 * YouTube tem CDN público. Vimeo requer chamada de API — retorna null.
 */
export function getThumbnailUrl(embed: VideoEmbed): string | null {
  if (embed.platform === 'youtube') {
    return `https://img.youtube.com/vi/${embed.id}/hqdefault.jpg`;
  }
  return null; // Vimeo não tem CDN público de thumbnails
}
