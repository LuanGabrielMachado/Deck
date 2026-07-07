'use client';

import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { getRateLimitCache, checkLocalRateLimit } from '@/lib/rate-limit-cache';

/**
 * Hook de rate limit com verificação em 3 camadas:
 *
 *   Camada 1 — cache local (localStorage): bloqueia antes de chamar o servidor
 *   Camada 2 — banco (users.lastPostAt): fonte da verdade, sync entre dispositivos
 *   Camada 3 — fallback tabela posts: lida pelo backend (SlowSocialRateLimiter)
 *
 * Mais restritivo vence: se qualquer camada diz "não pode", o usuário é bloqueado.
 * Admin bypassa todas as camadas.
 */
export function usePostRateLimit(telegramId: number | undefined, isAdmin = false) {
  const [canPost, setCanPost] = useState(true); // otimista — Camada 1 ajusta no mount
  const [nextAllowedAt, setNextAllowedAt] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // ── Camada 1: verificar cache local assim que monta (sem latência) ────────
  // Admin bypassa completamente a verificação local
  useEffect(() => {
    if (isAdmin) return;
    
    // Verifica cache local (agora assíncrono por causa do CloudStorage)
    const checkCache = async () => {
      const cache = await getRateLimitCache();
      const local = checkLocalRateLimit(cache?.lastPostTimestamp ?? null);
      if (!local.canPost && local.timeRemainingMs) {
        setCanPost(false);
        setNextAllowedAt(new Date(Date.now() + local.timeRemainingMs));
        setTimeRemaining(local.timeRemainingMs);
      }
    };
    
    checkCache();
  }, [isAdmin]);

  // ── Camadas 2+3: verificar com o servidor ────────────────────────────────
  const { data, isLoading, refetch } = trpc.posts.canCreate.useQuery(undefined, {
    enabled: !!telegramId,
    refetchOnWindowFocus: false,
  });

  // Servidor é a fonte de verdade — mais restritivo vence
  // Admin sempre liberado (servidor já retorna canPost: true)
  useEffect(() => {
    if (!data) return;

    if (isAdmin) {
      // Admin bypassa tudo
      setCanPost(true);
      setNextAllowedAt(null);
      setTimeRemaining(0);
      return;
    }

    if (!data.canPost && data.nextAllowedAt) {
      // Servidor bloqueou — respeitar mesmo que cache local diga "pode"
      setCanPost(false);
      const nextAllowed = new Date(data.nextAllowedAt);
      setNextAllowedAt(nextAllowed);
    } else if (data.canPost) {
      // Servidor liberou — checar cache local também (mais restritivo vence)
      const checkCache = async () => {
        const cache = await getRateLimitCache();
        const local = checkLocalRateLimit(cache?.lastPostTimestamp ?? null);
        if (local.canPost) {
          setCanPost(true);
          setNextAllowedAt(null);
          setTimeRemaining(0);
        }
        // Se cache local ainda bloqueia, mantemos bloqueado (estado já está correto do useEffect acima)
      };
      checkCache();
    }
  }, [data, isAdmin]); // ← isAdmin adicionado nas dependências

  // ── Countdown timer ──────────────────────────────────────────────────────
  useEffect(() => {
    if (canPost || !nextAllowedAt) return;

    let timer: ReturnType<typeof setInterval> | null = null;

    const updateTimer = () => {
      const remaining = Math.max(0, nextAllowedAt.getTime() - Date.now());
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        setCanPost(true);
        setNextAllowedAt(null);
        if (timer) clearInterval(timer);
      }
    };

    updateTimer();
    timer = setInterval(updateTimer, 1000);
    return () => { if (timer) clearInterval(timer); };
  }, [canPost, nextAllowedAt]);

  return {
    canPost,
    nextAllowedAt,
    timeRemaining,
    isLoading,
    refetch,
  };
}
