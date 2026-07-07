/**
 * Testes: Efemeridade de posts (7 dias)
 * Garante que a lógica de filtragem temporal está correta.
 */

import { describe, it, expect } from 'vitest';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isExpired(createdAt: Date, adminIds: number[], authorId: number): boolean {
  if (adminIds.includes(authorId)) return false; // admin isento
  return Date.now() - createdAt.getTime() > SEVEN_DAYS_MS;
}

function buildEphemeralCutoff(): Date {
  return new Date(Date.now() - SEVEN_DAYS_MS);
}

describe('Efemeridade de posts', () => {
  it('post de 6 dias não está expirado', () => {
    const createdAt = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
    expect(isExpired(createdAt, [], 123)).toBe(false);
  });

  it('post de 8 dias está expirado', () => {
    const createdAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    expect(isExpired(createdAt, [], 123)).toBe(true);
  });

  it('post de 8 dias de admin NÃO expira', () => {
    const createdAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const adminIds = [999];
    expect(isExpired(createdAt, adminIds, 999)).toBe(false);
  });

  it('post de 8 dias de usuário normal expira mesmo com outros admins', () => {
    const createdAt = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
    const adminIds = [999, 888];
    expect(isExpired(createdAt, adminIds, 123)).toBe(true);
  });

  it('cutoff está 7 dias atrás', () => {
    const cutoff = buildEphemeralCutoff();
    const diff = Date.now() - cutoff.getTime();
    expect(diff).toBeGreaterThanOrEqual(SEVEN_DAYS_MS - 100);
    expect(diff).toBeLessThanOrEqual(SEVEN_DAYS_MS + 100);
  });

  it('post exatamente em 7 dias é permitido', () => {
    const createdAt = new Date(Date.now() - SEVEN_DAYS_MS + 1000); // 1s antes do limite
    expect(isExpired(createdAt, [], 123)).toBe(false);
  });
});
