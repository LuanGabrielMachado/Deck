/**
 * Compressão de imagem client-side via Canvas API.
 *
 * Estratégia:
 *  - GIFs animados são preservados (sem compressão para manter animação)
 *  - Imagens < 300 KB são devolvidas sem alteração (não vale o custo do Canvas)
 *  - Imagens maiores são redimensionadas para no máximo 1280px (lado maior)
 *  - Saída: JPEG com qualidade 0.82 — bom equilíbrio tamanho × qualidade
 *  - Valida MIME type antes de processar (previne arquivos maliciosos)
 *
 * Compatibilidade: todos os WebViews modernos (Chrome, Safari iOS 14+, WebView Telegram)
 */

const MAX_DIMENSION_PX  = 1280;
const JPEG_QUALITY      = 0.82;
const SKIP_THRESHOLD_BYTES = 300 * 1024; // 300 KB - threshold para compressão
const MAX_FILE_SIZE_BYTES = 12 * 1024 * 1024; // 12 MB - limite máximo do backend

// MIME types válidos para imagens
const VALID_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Valida se o arquivo é uma imagem válida pelo MIME type.
 */
function isValidImageMime(file: File): boolean {
  return VALID_IMAGE_MIME_TYPES.includes(file.type);
}

/**
 * Verifica se é GIF animado (preserva animação).
 * GIFs não são comprimidos para manter a animação.
 */
function isAnimatedGif(file: File): boolean {
  return file.type === 'image/gif';
}

/**
 * Comprime um File de imagem, retornando uma nova data-URL base64.
 *
 * @param file  Arquivo de imagem original (PNG, JPEG, WebP, GIF…)
 * @returns     data-URL `data:image/jpeg;base64,...` ou GIF original preservado
 * @throws      Se o Canvas não conseguir ler a imagem ou o browser não suportar
 *
 * NOTA: GIFs são preservados sem compressão para manter a animação.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    // Valida MIME type (previne arquivos maliciosos)
    if (!isValidImageMime(file)) {
      reject(new Error('Tipo de arquivo inválido. Envie apenas imagens (JPEG, PNG, WebP, GIF).'));
      return;
    }

    // Valida tamanho máximo (12MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      reject(new Error('Imagem muito grande (máx 12MB)'));
      return;
    }

    // GIF: preserva animação (sem compressão)
    if (isAnimatedGif(file)) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (!result || result.length < 50) {
          reject(new Error('Leitura do arquivo falhou (resultado vazio)'));
          return;
        }
        resolve(result);
      };
      reader.onerror = () => reject(new Error('FileReader falhou'));
      reader.readAsDataURL(file);
      return;
    }

    // Imagens pequenas: lê direto sem passar pelo Canvas
    if (file.size <= SKIP_THRESHOLD_BYTES) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (!result || result.length < 50) {
          reject(new Error('Leitura do arquivo falhou (resultado vazio)'));
          return;
        }
        resolve(result);
      };
      reader.onerror = () => reject(new Error('FileReader falhou'));
      reader.readAsDataURL(file);
      return;
    }

    // Imagens grandes: redimensiona + converte para JPEG via Canvas
    const objectUrl = URL.createObjectURL(file);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Redimensiona mantendo proporção se algum lado ultrapassar MAX_DIMENSION_PX
      if (width > MAX_DIMENSION_PX || height > MAX_DIMENSION_PX) {
        if (width >= height) {
          height = Math.round((height / width) * MAX_DIMENSION_PX);
          width  = MAX_DIMENSION_PX;
        } else {
          width  = Math.round((width / height) * MAX_DIMENSION_PX);
          height = MAX_DIMENSION_PX;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width  = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D não disponível'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
      if (!dataUrl || dataUrl === 'data:,') {
        reject(new Error('Canvas toDataURL retornou vazio'));
        return;
      }

      resolve(dataUrl);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Falha ao carregar imagem no Canvas'));
    };

    img.src = objectUrl;
  });
}
