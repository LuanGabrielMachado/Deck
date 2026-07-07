'use client';

/**
 * Hook que gerencia a pilha de navegação de threads.
 *
 * threadStack vazio = feed normal
 * threadStack = [postId] = thread do post original
 * threadStack = [postId, replyId] = thread de uma resposta
 * etc.
 *
 * Entrar: push(postId) — empilha
 * Sair:   pop()        — desempilha (volta ao anterior ou ao feed)
 */

import { useCallback, useState } from 'react';

export function useThreadStack() {
  const [threadStack, setThreadStack] = useState<number[]>([]);

  /** ID do post atual sendo exibido em thread (topo da pilha). */
  const currentThreadPostId = threadStack.length > 0
    ? threadStack[threadStack.length - 1]
    : null;

  const isInThread = threadStack.length > 0;

  /** Entra na thread de um post. */
  const pushThread = useCallback((postId: number) => {
    setThreadStack(prev => [...prev, postId]);
  }, []);

  /** Sai da thread atual (volta ao anterior ou ao feed). */
  const popThread = useCallback(() => {
    setThreadStack(prev => prev.slice(0, -1));
  }, []);

  /** Volta direto para o feed. */
  const clearThread = useCallback(() => {
    setThreadStack([]);
  }, []);

  return {
    threadStack,
    currentThreadPostId,
    isInThread,
    pushThread,
    popThread,
    clearThread,
  };
}
