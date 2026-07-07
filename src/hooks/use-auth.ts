'use client';

import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import type { TelegramUser } from '@/types/telegram';

/**
 * Hook para autenticação e gerenciamento de dados do usuário do Telegram.
 *
 * 1. Pega os dados do usuário do Telegram Mini App SDK.
 * 2. Chama a mutação `telegram.login` para garantir que o usuário
 *    esteja registrado/atualizado no banco de dados do app.
 * 3. Retorna o objeto do usuário, o status de carregamento e se é admin.
 */
export function useAuth() {
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [role, setRole] = useState<'deusa' | 'mod' | 'user'>('user');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastTelegramId, setLastTelegramId] = useState<number | null>(null);
  const loginMutation = trpc.telegram.login.useMutation();
  const isAdminQuery = trpc.telegram.isAdmin.useQuery(undefined, {
    enabled: false, // executado manualmente após login
  });

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);

      let telegramUser: TelegramUser | null = null;
      let getTelegramInitDataFn: (() => string | null) | null = null;
      let getTelegramUserFn: (() => TelegramUser | null) | null = null;

      // Apenas tentar obter dados do Telegram se estivermos no cliente
      if (typeof window !== 'undefined') {
        try {
          // Carregar o SDK do Telegram dinamicamente apenas no cliente
          const { getTelegramUser, initTelegramWebApp, getTelegramInitData } = await import(
            '@/lib/telegram-utils'
          );
          initTelegramWebApp();
          getTelegramInitDataFn = getTelegramInitData;
          getTelegramUserFn = getTelegramUser;

          // Loop UNICO para obter user E initData juntos (max 4s no total - 20 tentativas de 200ms)
          for (let attempt = 0; attempt < 20; attempt += 1) {
            const tgUser = getTelegramUserFn?.();
            const initData = getTelegramInitDataFn?.();

            // Se tem user mas nao tem initData, espera mais um pouco
            if (tgUser && !initData) {
              await new Promise((resolve) => setTimeout(resolve, 200));
              continue;
            }

            // Se tem ambos, usa
            if (tgUser && initData) {
              telegramUser = tgUser;
              break;
            }

            // Se nao tem user, espera e tenta de novo
            await new Promise((resolve) => setTimeout(resolve, 200));
          }
        } catch {
          // SDK do Telegram não disponível - silencioso
        }
      }

      // Verifica se o usuário mudou no Telegram (permite re-autenticação)
      if (telegramUser && telegramUser.id !== lastTelegramId) {
        try {
          // Efetua o "login" no nosso backend para criar/atualizar o usuário
          const initData = getTelegramInitDataFn?.();
          if (!initData) {
            setUser(null);
            setIsLoading(false);
            setErrorMessage('initData nao disponivel');
            return;
          }

          await loginMutation.mutateAsync({
            telegramId: telegramUser.id,
            firstName: telegramUser.first_name,
            lastName: telegramUser.last_name,
            username: telegramUser.username,
            photoUrl: telegramUser.photo_url,
          });
          
          setUser(telegramUser);
          setLastTelegramId(telegramUser.id);
          setErrorMessage(null);
          
          // Verifica role logo após o login
          const adminResult = await isAdminQuery.refetch();
          setIsAdmin(adminResult.data?.isAdmin ?? false);
          setIsModerator(adminResult.data?.isModerator ?? false);
          setRole((adminResult.data?.role ?? 'user') as 'deusa' | 'mod' | 'user');
        } catch (err: unknown) {
          // Falha ao sincronizar com backend - manter desautenticado
          setUser(null);
          // Extrai mensagem de erro do tRPC para exibir ao usuário
          const message = (err as { message?: string })?.message;
          setErrorMessage(message || 'Falha ao autenticar');
        }
      } else if (!telegramUser) {
        setUser(null);
        setErrorMessage('Usuario do Telegram indisponivel');
      }

      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Roda apenas uma vez na montagem

  return { user, isLoading, isAdmin, isModerator, role, errorMessage };
}
