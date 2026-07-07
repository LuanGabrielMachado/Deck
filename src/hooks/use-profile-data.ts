/**
 * Hook que encapsula os dados e queries da página de perfil.
 *
 * - Merge de dados Telegram SDK ↔ banco de dados (DB tem prioridade)
 * - Queries de me, postsCount, following
 * - Invalidação automática ao montar e ao voltar ao app
 */

import { useMemo, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import type { User as DbUser } from '@/drizzle/schema';
import type { TelegramUser } from '@/types/telegram';

type UnifiedUserData = {
  fullName: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
};

/** Merge priorizado: DB > Telegram SDK > fallback */
function mergeUserData(data: DbUser | TelegramUser | null): UnifiedUserData {
  if (!data) return { fullName: 'Usuário', firstName: 'User' };

  if ('telegramId' in data) {
    const db = data as DbUser;
    const parts = (db.name || '').split(' ');
    return {
      fullName:  db.name || 'Usuário',
      firstName: parts[0] || 'Usuário',
      lastName:  parts.slice(1).join(' ') || undefined,
      photoUrl:  db.photoUrl || undefined,
    };
  }

  const tg = data as TelegramUser;
  return {
    fullName:  [tg.first_name, tg.last_name].filter(Boolean).join(' ') || 'Usuário',
    firstName: tg.first_name,
    lastName:  tg.last_name,
    photoUrl:  tg.photo_url,
  };
}

export function useProfileData(telegramId: number | undefined) {
  const utils = trpc.useUtils();
  const enabled = !!telegramId;

  // ── Queries ──────────────────────────────────────────────────────────────

  const meQuery = trpc.telegram.me.useQuery(
    { telegramId: telegramId ?? 0 },
    { enabled, staleTime: 5 * 60 * 1000, gcTime: 30 * 60 * 1000, refetchOnMount: 'always' }
  );

  const postsCountQuery = trpc.posts.countByUser.useQuery(
    { telegramId: telegramId ?? 0 },
    { enabled, staleTime: 2 * 60 * 1000, gcTime: 10 * 60 * 1000, refetchOnMount: 'always' }
  );

  const followingQuery = trpc.follows.following.useQuery(
    { telegramId: telegramId ?? 0 },
    { enabled, staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, refetchOnMount: 'always' }
  );

  // ── Mutations ─────────────────────────────────────────────────────────────

  const unfollowMutation = trpc.follows.unfollow.useMutation({
    onSuccess: () => { void followingQuery.refetch(); },
  });

  const setNotificationsMutation = trpc.users.setNotifications.useMutation({
    onSuccess: () => { void meQuery.refetch(); },
  });

  // ── Invalidação ao montar e ao voltar ao app ──────────────────────────────

  useEffect(() => {
    if (!telegramId) return;
    void utils.posts.countByUser.invalidate({ telegramId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!telegramId) return;
    const id = telegramId;
    const handle = () => {
      if (document.visibilityState === 'visible') {
        void utils.posts.countByUser.invalidate({ telegramId: id });
      }
    };
    document.addEventListener('visibilitychange', handle);
    return () => document.removeEventListener('visibilitychange', handle);
  }, [utils, telegramId]);

  // ── Dados derivados ───────────────────────────────────────────────────────

  const userData = useMemo(
    () => mergeUserData(meQuery.data ?? null),
    [meQuery.data]
  );

  const postCount = postsCountQuery.data?.count ?? 0;
  const notificationsEnabled = meQuery.data?.notificationsEnabled ?? true;

  return {
    followingQuery,
    unfollowMutation,
    setNotificationsMutation,
    userData,
    postCount,
    notificationsEnabled,
  };
}
