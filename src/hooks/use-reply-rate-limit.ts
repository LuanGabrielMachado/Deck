/**
 * Hook para verificar rate limit de RESPOSTAS (15 minutos).
 *
 * Camada 1: CloudStorage + localStorage (frontend) - REMOVIDO para evitar falsos positivos
 * Camada 2: users.lastReplyAt (banco - fonte da verdade)
 *
 * Admin bypassa todas as camadas.
 */

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';


interface UseReplyRateLimitResult {
  canReply: boolean;
  timeRemaining: number;
  refetch: () => void;
}

export function useReplyRateLimit(
  telegramId?: number,
  isAdmin = false
): UseReplyRateLimitResult {
  const [canReply, setCanReply] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Camada 2: Backend (users.lastReplyAt) - ÚNICA fonte da verdade
  const { data, refetch } = trpc.posts.canReply.useQuery(undefined, {
    enabled: !!telegramId && !isAdmin, // Admin não consulta
    staleTime: 1000, // 1 segundo - atualiza rápido
    gcTime: 5 * 60 * 1000, // 5 minutos
  });

  // Backend é fonte da verdade - sem cache local para evitar falsos positivos
  useEffect(() => {
    // Admin sempre pode
    if (isAdmin) {
      setCanReply(true);
      setTimeRemaining(0);
      return;
    }

    // Backend é fonte da verdade
    if (data) {
      if (!data.canReply && data.timeRemainingMs) {
        // Backend bloqueou
        setCanReply(false);
        setTimeRemaining(data.timeRemainingMs);

        // Countdown
        const timer = setInterval(() => {
          setTimeRemaining((prev) => {
            if (prev <= 1000) {
              clearInterval(timer);
              setCanReply(true);
              return 0;
            }
            return prev - 1000;
          });
        }, 1000);

        return () => clearInterval(timer);
      }

      // Backend liberou
      setCanReply(true);
      setTimeRemaining(0);
    }
  }, [data, isAdmin]);

  return { canReply, timeRemaining, refetch };
}
