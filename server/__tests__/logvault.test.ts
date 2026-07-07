/**
 * Testes: LogVault (log.repository + logger)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock do DB
const mockInsert = vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

vi.mock('../db', () => ({
  getDb: () => ({ insert: mockInsert }),
}));

vi.mock('../../drizzle/schema', () => ({
  logs: { id: 'id', level: 'level', context: 'context', message: 'message', meta: 'meta', actorId: 'actorId', createdAt: 'createdAt' },
}));

// Mock ENV para simular produção
vi.mock('../_core/env', () => ({
  ENV: { isProduction: true },
}));

import { insertLog } from '../repositories/log.repository';

describe('insertLog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('chama db.insert com os campos corretos', async () => {
    const valuesRef = { fn: vi.fn().mockResolvedValue(undefined) };
    mockInsert.mockReturnValue({ values: valuesRef.fn });

    await insertLog({ level: 'info', context: 'post', message: 'Test message' });

    expect(mockInsert).toHaveBeenCalledOnce();
    expect(valuesRef.fn).toHaveBeenCalledWith(expect.objectContaining({
      level: 'info',
      context: 'post',
      message: 'Test message',
      meta: null,
      actorId: null,
    }));
  });

  it('serializa meta como JSON', async () => {
    const valuesRef = { fn: vi.fn().mockResolvedValue(undefined) };
    mockInsert.mockReturnValue({ values: valuesRef.fn });

    await insertLog({
      level: 'warn',
      context: 'notification',
      message: 'Bot blocked',
      meta: { code: 403 },
      actorId: 12345,
    });

    expect(valuesRef.fn).toHaveBeenCalledWith(expect.objectContaining({
      meta: JSON.stringify({ code: 403 }),
      actorId: 12345,
    }));
  });

  it('não lança exceção quando o DB falha', async () => {
    mockInsert.mockReturnValue({ values: vi.fn().mockRejectedValue(new Error('DB error')) });
    // Deve ser silencioso
    await expect(insertLog({ level: 'error', context: 'system', message: 'Test' })).resolves.toBeUndefined();
  });
});
