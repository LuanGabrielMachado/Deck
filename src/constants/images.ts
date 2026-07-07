/**
 * Constantes de imagens estáticas.
 *
 * Imagens fixas (feed, create): um único arquivo.
 * Imagens com carrossel (follow, profile, post, admin): arrays por página.
 *   → Uma imagem é sorteada aleatoriamente por montagem do componente,
 *     via usePageBackground(). Troca a cada navegação, sem custo de CPU.
 *
 * Para forçar recarregamento global após atualização, incremente IMAGE_VERSION.
 * Headers de /images/* usam `immutable` — mudar a versão gera URL nova.
 *
 * ── Como adicionar novas imagens ────────────────────────────────────────────
 * 1. Coloque o arquivo em /public/images/<pasta>/
 * 2. Nomeie em sequência: seguir-2.jpg, seguir-3.jpg, etc.
 * 3. Adicione o caminho no array correspondente abaixo — só isso.
 */
export const IMAGE_VERSION = 'v5';

const v = IMAGE_VERSION;

// ── Imagens fixas ────────────────────────────────────────────────────────────
export const IMAGES = {
  feed:       `/images/feed.jpg?${v}`,
  bgArtistic: `/images/Background-artistic.jpg?${v}`,
  icon:       '/images/icon.png',  // sem versão — referenciado por Canvas
} as const;

// ── Imagens com carrossel — adicione mais entradas à vontade ─────────────────
export const PAGE_BACKGROUNDS = {
  seguir: [
    `/images/seguir/seguir-1.jpg?${v}`,
    `/images/seguir/seguir-2.jpg?${v}`,
    `/images/seguir/seguir-3.jpg?${v}`,
    `/images/seguir/seguir-4.jpg?${v}`,
    `/images/seguir/seguir-5.jpg?${v}`,
    `/images/seguir/seguir-6.jpg?${v}`,
    `/images/seguir/seguir-7.jpg?${v}`,
    `/images/seguir/seguir-8.jpg?${v}`,
    `/images/seguir/seguir-9.jpg?${v}`,
    `/images/seguir/seguir-10.jpg?${v}`,
  ],
  perfil: [
    `/images/perfil/perfil-1.jpg?${v}`,
    `/images/perfil/perfil-2.jpg?${v}`,
    `/images/perfil/perfil-3.jpg?${v}`,
    `/images/perfil/perfil-4.jpg?${v}`,
    `/images/perfil/perfil-5.jpg?${v}`,
    `/images/perfil/perfil-6.jpg?${v}`,
    `/images/perfil/perfil-7.jpg?${v}`,
    `/images/perfil/perfil-8.jpg?${v}`,
    `/images/perfil/perfil-9.jpg?${v}`,
    `/images/perfil/perfil-10.jpg?${v}`,
  ],
  post: [
    `/images/post/post-1.jpg?${v}`,
    `/images/post/post-2.jpg?${v}`,
    `/images/post/post-3.jpg?${v}`,
    `/images/post/post-4.jpg?${v}`,
    `/images/post/post-5.jpg?${v}`,
    `/images/post/post-6.jpg?${v}`,
    `/images/post/post-7.jpg?${v}`,
    `/images/post/post-8.jpg?${v}`,
    `/images/post/post-9.jpg?${v}`,
    `/images/post/post-10.jpg?${v}`,
  ],
  ferramentas: [`/images/ferramentas/ferramentas-1.jpg?${v}`],
} as const satisfies Record<string, string[]>;

export type PageBackgroundKey = keyof typeof PAGE_BACKGROUNDS;
