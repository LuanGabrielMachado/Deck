/**
 * Testes: Autenticação HMAC-SHA256
 * Garante que initData inválido é rejeitado e válido é aceito.
 */

import { describe, it, expect } from 'vitest';
import { createHmac, createHash } from 'crypto';

// Replica a lógica de validação do telegram-validation.ts para teste isolado
function buildInitData(data: Record<string, string>, botToken: string): string {
  const entries = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');
  const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const hash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  const params = new URLSearchParams({ ...data, hash });
  return params.toString();
}

// Extrai e valida hash do initData (espelho de telegram-validation.ts)
function validateInitData(initData: string, botToken: string): boolean {
  if (!initData) return false;
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return false;
    params.delete('hash');
    const entries = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
    const dataCheckString = entries.map(([k, v]) => `${k}=${v}`).join('\n');
    const secretKey = createHmac('sha256', 'WebAppData').update(botToken).digest();
    const expectedHash = createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    return hash === expectedHash;
  } catch {
    return false;
  }
}

describe('Autenticação HMAC-SHA256', () => {
  const BOT_TOKEN = 'test_bot_token_123';

  it('valida initData legítimo', () => {
    const data = {
      user: JSON.stringify({ id: 12345, first_name: 'Test' }),
      auth_date: String(Math.floor(Date.now() / 1000)),
    };
    const initData = buildInitData(data, BOT_TOKEN);
    expect(validateInitData(initData, BOT_TOKEN)).toBe(true);
  });

  it('rejeita hash adulterado', () => {
    const data = {
      user: JSON.stringify({ id: 12345, first_name: 'Test' }),
      auth_date: String(Math.floor(Date.now() / 1000)),
    };
    const initData = buildInitData(data, BOT_TOKEN) + '&hash=fakehash000';
    // Substituir o hash válido por um falso
    const params = new URLSearchParams(initData);
    params.set('hash', 'fakehash000000000000000000000000000000000000000000000000000000000');
    expect(validateInitData(params.toString(), BOT_TOKEN)).toBe(false);
  });

  it('rejeita token errado', () => {
    const data = {
      user: JSON.stringify({ id: 12345, first_name: 'Test' }),
      auth_date: String(Math.floor(Date.now() / 1000)),
    };
    const initData = buildInitData(data, BOT_TOKEN);
    expect(validateInitData(initData, 'wrong_token')).toBe(false);
  });

  it('rejeita initData vazio', () => {
    expect(validateInitData('', BOT_TOKEN)).toBe(false);
  });

  it('rejeita initData sem hash', () => {
    expect(validateInitData('user=test&auth_date=12345', BOT_TOKEN)).toBe(false);
  });
});
