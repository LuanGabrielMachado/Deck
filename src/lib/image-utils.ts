/** Limite de 12 MB (configuração intencional) */
const MAX_IMAGE_BYTES = 12 * 1024 * 1024; // 12MB

/**
 * Valida tamanho de arquivo (máx 12MB)
 */
export function validateImageSize(sizeInBytes: number): boolean {
  return sizeInBytes <= MAX_IMAGE_BYTES;
}

/**
 * Cria URL de preview para uma imagem
 */
export function createImagePreviewUrl(file: File | Blob): string {
  return URL.createObjectURL(file);
}

/**
 * Revoga URL de preview para liberar memória
 */
export function revokeImagePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
