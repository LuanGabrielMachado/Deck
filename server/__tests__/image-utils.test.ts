/**
 * Testes: Utilitários de imagem
 * Garante que validação de tamanho e URLs funcionam.
 */

import { describe, it, expect } from 'vitest';
import { validateImageSize } from '../../src/lib/image-utils';

describe('validateImageSize', () => {
  const MAX = 12 * 1024 * 1024; // 12MB

  it('aceita imagem exatamente em 12MB', () => {
    expect(validateImageSize(MAX)).toBe(true);
  });

  it('aceita imagem menor que 12MB', () => {
    expect(validateImageSize(1 * 1024 * 1024)).toBe(true);
    expect(validateImageSize(300 * 1024)).toBe(true);
  });

  it('rejeita imagem maior que 12MB', () => {
    expect(validateImageSize(MAX + 1)).toBe(false);
    expect(validateImageSize(20 * 1024 * 1024)).toBe(false);
  });

  it('aceita 0 bytes', () => {
    expect(validateImageSize(0)).toBe(true);
  });
});
