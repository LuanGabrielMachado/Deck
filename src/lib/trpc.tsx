'use client';

import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import superjson from 'superjson';
import type { AppRouter } from '../../server';
import { useEffect, useState, type ReactNode } from 'react';
import { getTelegramInitData } from '@/lib/telegram-utils';

export const trpc = createTRPCReact<AppRouter>();

export function TRPCProvider({ children }: { children: ReactNode }) {
  // Inicializa Telegram SDK em background (20 tentativas de 200ms = max 4s)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      attempts += 1;
      const initData = getTelegramInitData();
      if (initData || attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutos
            gcTime: 10 * 60 * 1000, // 10 minutos
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  const [trpcClient] = useState(() => {
    const fallbackBaseUrl = 'https://deck.vercel.app';
    const envBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '';
    const windowBaseUrl = typeof window !== 'undefined' ? window.location?.origin : '';
    const baseUrl = envBaseUrl || windowBaseUrl || fallbackBaseUrl;
    const apiUrl = new URL('/api/trpc', baseUrl).toString();

    return trpc.createClient({
      links: [
        httpBatchLink({
          url: apiUrl,
          transformer: superjson,
          headers() {
            // Obtém initData sincronamente ou usa fallback
            const initData = getTelegramInitData();
            if (!initData) {
              return {};
            }
            return {
              Authorization: `Bearer ${initData}`,
              'X-Telegram-Init-Data': initData,
            };
          },
          fetch(url, options) {
            return fetch(url, {
              ...options,
              credentials: 'include',
            });
          },
        }),
      ],
    });
  });

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
