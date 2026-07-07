'use client';

/**
 * Hook que encapsula as ações sociais de um post:
 *   - Ghosting (48h) / Unghost
 *   - Bloqueio permanente
 *   - Denúncia
 *
 * Chamado no PostCard apenas quando o autor é outra pessoa.
 * O popup nativo do Telegram abre após buscar o status de ghosting (lazy).
 */

import { useCallback } from 'react';
import { trpc } from '@/lib/trpc';
import {
  showTelegramPopup as showPopup,
  isTelegramWebView,
  hapticImpact,
  hapticNotification,
} from '@/lib/telegram-utils';

interface UsePostSocialActionsParams {
  postId: number;
  postAuthorId: number;
  postAuthorName: string | null | undefined;
  currentTelegramId: number | undefined;
  isAdmin: boolean;
}

export function usePostSocialActions({
  postId,
  postAuthorId,
  postAuthorName,
  currentTelegramId,
  isAdmin,
}: UsePostSocialActionsParams) {
  const utils = trpc.useUtils();

  const blockMutation = trpc.users.block.useMutation({
    onSuccess: () => {
      if (isTelegramWebView()) hapticNotification('success');
      void utils.posts.timeline.invalidate();
    },
  });

  const reportMutation = trpc.users.report.useMutation();

  const ghostMutation = trpc.users.ghost.useMutation({
    onSuccess: () => void utils.posts.timeline.invalidate(),
  });

  const unghostMutation = trpc.users.unghost.useMutation({
    onSuccess: () => void utils.posts.timeline.invalidate(),
  });

  const ghostStatusQuery = trpc.users.ghostStatus.useQuery(
    { targetId: postAuthorId },
    { enabled: false },
  );

  const handleAvatarPress = useCallback(() => {
    if (!currentTelegramId || postAuthorId === currentTelegramId || isAdmin) return;
    if (isTelegramWebView()) hapticImpact('light');

    // Busca status de ghosting lazy — popup só abre quando resolve
    ghostStatusQuery.refetch().then((result) => {
      const ghosting = result.data?.isGhosting ?? false;
      showPopup(
        {
          message: postAuthorName ?? 'Usuário',
          buttons: [
            {
              id: 'ghost',
              type: 'default',
              text: ghosting ? '🤡 Superei o vacilo, próximo' : '👻 Ghosting insano de 48h',
            },
            { id: 'block',  type: 'destructive', text: '🚫 Bloquear, vacilão demais' },
            { id: 'report', type: 'destructive', text: '🚨 Denunciar post de m*rda' },
          ],
        },
        (btn) => {
          if (btn === 'report') {
            reportMutation.mutate({ postId });
          } else if (btn === 'ghost') {
            if (ghosting) {
              unghostMutation.mutate({ ghostedId: postAuthorId });
            } else {
              ghostMutation.mutate({ ghostedId: postAuthorId });
            }
          } else if (btn === 'block') {
            blockMutation.mutate({ blockedId: postAuthorId });
          }
        },
      );
    });
  }, [
    currentTelegramId, postAuthorId, postAuthorName, isAdmin, postId,
    blockMutation, reportMutation, ghostMutation, unghostMutation, ghostStatusQuery,
  ]);

  return { handleAvatarPress };
}
