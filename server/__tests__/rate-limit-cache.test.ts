/**
 * Testes: Rate Limit Cache (frontend, Camada 1)
 * Garante que a lógica de checkLocalRateLimit funciona corretamente.
 */

import { describe, it, expect } from 'vitest';
import { checkLocalRateLimit, POST_INTERVAL_MS } from '../../src/lib/rate-limit-cache';

describe('checkLocalRateLimit', () => {
  it('permite quando nunca postou (null)', () => {
    const result = checkLocalRateLimit(null);
    expect(result.canPost).toBe(true);
    expect(result.timeRemainingMs).toBeUndefined();
  });

  it('bloqueia quando postou há 5 minutos', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const result = checkLocalRateLimit(fiveMinutesAgo);
    expect(result.canPost).toBe(false);
    expect(result.timeRemainingMs).toBeGreaterThan(0);
    expect(result.timeRemainingMs).toBeLessThan(POST_INTERVAL_MS);
  });

  it('permite quando postou há 11 minutos', () => {
    const elevenMinutesAgo = Date.now() - 11 * 60 * 1000;
    const result = checkLocalRateLimit(elevenMinutesAgo);
    expect(result.canPost).toBe(true);
  });

  it('timeRemainingMs é correto', () => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const result = checkLocalRateLimit(fiveMinutesAgo);
    const expectedRemaining = POST_INTERVAL_MS - 5 * 60 * 1000;
    // tolerância de 100ms pelo tempo de execução
    expect(result.timeRemainingMs!).toBeGreaterThan(expectedRemaining - 200);
    expect(result.timeRemainingMs!).toBeLessThan(expectedRemaining + 200);
  });

  it('bloqueia quando postou agora (timestamp = now)', () => {
    const result = checkLocalRateLimit(Date.now());
    expect(result.canPost).toBe(false);
    expect(result.timeRemainingMs).toBeCloseTo(POST_INTERVAL_MS, -3);
  });

  it('POST_INTERVAL_MS é 10 minutos', () => {
    expect(POST_INTERVAL_MS).toBe(10 * 60 * 1000);
  });
});
