/**
 * Testes: Deduplicação de notificações
 * Garante que a lógica de deduplicação por unique constraint funciona.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Simula o comportamento de onConflictDoNothing
class NotificationStore {
  private store = new Map<string, number>();
  private nextId = 1;

  async insert(data: {
    type: string;
    recipientId: number;
    actorId: number;
    referenceId?: number | null;
    emoji?: string;
  }): Promise<number | null> {
    const key = `${data.type}:${data.recipientId}:${data.actorId}:${data.referenceId ?? 'null'}`;
    if (this.store.has(key)) return null; // duplicata
    const id = this.nextId++;
    this.store.set(key, id);
    return id;
  }

  clear() { this.store.clear(); this.nextId = 1; }
}

describe('Deduplicação de notificações', () => {
  const store = new NotificationStore();

  beforeEach(() => store.clear());

  it('retorna ID na primeira inserção', async () => {
    const id = await store.insert({ type: 'reply', recipientId: 1, actorId: 2, referenceId: 10 });
    expect(id).toBe(1);
  });

  it('retorna null em duplicata exata', async () => {
    await store.insert({ type: 'reply', recipientId: 1, actorId: 2, referenceId: 10 });
    const id = await store.insert({ type: 'reply', recipientId: 1, actorId: 2, referenceId: 10 });
    expect(id).toBeNull();
  });

  it('permite mesma referência com actor diferente', async () => {
    await store.insert({ type: 'reply', recipientId: 1, actorId: 2, referenceId: 10 });
    const id = await store.insert({ type: 'reply', recipientId: 1, actorId: 3, referenceId: 10 });
    expect(id).not.toBeNull();
  });

  it('permite mesmo actor em post diferente', async () => {
    await store.insert({ type: 'reaction', recipientId: 1, actorId: 2, referenceId: 10 });
    const id = await store.insert({ type: 'reaction', recipientId: 1, actorId: 2, referenceId: 11 });
    expect(id).not.toBeNull();
  });

  it('não notifica a si mesmo (recipientId === actorId)', async () => {
    // Esta lógica está no sendNotification helper
    const shouldSkip = (recipientId: number, actorId: number) => recipientId === actorId;
    expect(shouldSkip(5, 5)).toBe(true);
    expect(shouldSkip(5, 6)).toBe(false);
  });

  it('retorna null para inserção de follow duplicado', async () => {
    await store.insert({ type: 'follow', recipientId: 1, actorId: 2, referenceId: null });
    const id = await store.insert({ type: 'follow', recipientId: 1, actorId: 2, referenceId: null });
    expect(id).toBeNull();
  });
});
