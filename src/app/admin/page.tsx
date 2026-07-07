'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePageBackground } from '@/hooks/use-page-background';
import { trpc } from '@/lib/trpc';
import { clearRateLimitCache } from '@/lib/rate-limit-cache';
import { FadeInWhenVisible } from '@/components/fade-in-when-visible';
import { Spinner } from '@/components/ui/spinner';
import {
  isTelegramWebView,
  mainButtonShow, mainButtonHide,
  mainButtonSetText, mainButtonEnable,
  mainButtonOnClick, mainButtonOffClick,
  hapticNotification,
} from '@/lib/telegram-utils';

import { AdminStats }    from './_components/AdminStats';
import { AdminFlags }    from './_components/AdminFlags';
import { AdminUserMod }  from './_components/AdminUserMod';
import { AdminPostMod }  from './_components/AdminPostMod';
import { AdminCache }    from './_components/AdminCache';
import { AdminAuditLog } from './_components/AdminAuditLog';
import { AdminBroadcast } from './_components/AdminBroadcast';
import { AdminLogVault } from './_components/AdminLogVault';

type ServerFlagKey = 'maintenance_mode' | 'pause_new_users' | 'feed_mode_global' | 'lock_posts_global';

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isModerator, role, isLoading: authLoading } = useAuth();
  const bg = usePageBackground('ferramentas');

  // ── Estado local ─────────────────────────────────────────────────────────
  const [userInput,     setUserInput]     = useState('');
  const [postInput,     setPostInput]     = useState('');
  const [broadcastText, setBroadcastText] = useState('');
  const [logLevel,      setLogLevel]      = useState<'info' | 'warn' | 'error' | ''>('');
  const [userInfo, setUserInfo] = useState<{
    telegramId: number; name: string | null;
    isBanned: boolean; shadowBanned: boolean;
    feedMode: string; lastPostAt: string | null;
  } | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Queries ──────────────────────────────────────────────────────────────
  const statsQuery   = trpc.admin.getStats.useQuery(undefined, { enabled: false });
  const flagsQuery   = trpc.admin.getFlags.useQuery(undefined, { enabled: false, staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000 });
  const actionsQuery = trpc.admin.getActions.useQuery({ limit: 20 }, { enabled: false, staleTime: 10 * 60 * 1000, gcTime: 30 * 60 * 1000 });
  const getUserQuery = trpc.admin.getUser.useQuery({ telegramId: Number(userInput) }, { enabled: false });
  const logsQuery    = trpc.admin.getLogs.useQuery({ level: logLevel || undefined, limit: 100 }, { enabled: false, staleTime: 30 * 1000 });

  // ── Mutations ─────────────────────────────────────────────────────────────
  const setFlagMut       = trpc.admin.setFlag.useMutation();
  const banUserMut       = trpc.admin.banUser.useMutation();
  const shadowBanMut     = trpc.admin.shadowBanUser.useMutation();
  const resetRLMut       = trpc.admin.resetRateLimit.useMutation();
  const deletePostMut    = trpc.admin.deletePost.useMutation();
  const setFeedModeMut   = trpc.admin.setUserFeedMode.useMutation();
  const broadcastMut     = trpc.admin.broadcast.useMutation({
    onSuccess: () => { setBroadcastText(''); void broadcastsQuery.refetch(); showFeedback('ok', 'Broadcast publicado!'); },
    onError:   (e) => showFeedback('err', e.message),
  });
  const broadcastsQuery  = trpc.admin.getBroadcasts.useQuery({ limit: 20 }, { enabled: false, staleTime: 60 * 1000 });
  const deleteBroadcastMut = trpc.admin.deletePost.useMutation({
    onSuccess: () => void broadcastsQuery.refetch(),
  });

  // ── MainButton para broadcast ─────────────────────────────────────────────
  const handleBroadcastPublish = useCallback(() => {
    const text = broadcastText.trim();
    if (!text || broadcastMut.isPending) return;
    if (isTelegramWebView()) hapticNotification('success');
    broadcastMut.mutate({ content: text });
  }, [broadcastText, broadcastMut]);

  useEffect(() => {
    if (!isTelegramWebView()) return;
    if (!broadcastText.trim() || broadcastMut.isPending) { mainButtonHide(); return; }
    mainButtonSetText('📢 Publicar Broadcast');
    mainButtonEnable();
    mainButtonShow();
    mainButtonOnClick(handleBroadcastPublish);
    return () => { mainButtonOffClick(handleBroadcastPublish); mainButtonHide(); };
  }, [broadcastText, broadcastMut.isPending, handleBroadcastPublish]);

  // ── Cleanup do timer de feedback no unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  // ── Carrega dados ao confirmar acesso ────────────────────────────────────
  useEffect(() => {
    if (isAdmin || isModerator) {
      void statsQuery.refetch();
      if (isAdmin) {
        void flagsQuery.refetch();
      }
      void actionsQuery.refetch();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isModerator]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  // feedbackTimerRef garante que apenas 1 timer de auto-dismiss está ativo —
  // limpa o anterior antes de criar novo (chamadas rápidas consecutivas)
  const showFeedback = useCallback((type: 'ok' | 'err', msg: string) => {
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    setFeedback({ type, msg });
    feedbackTimerRef.current = setTimeout(() => {
      setFeedback(null);
      feedbackTimerRef.current = null;
    }, 3500);
  }, []);

  // ── Handlers de flags ─────────────────────────────────────────────────────
  const handleToggleFlag = useCallback(async (key: string, newValue: boolean) => {
    try {
      await setFlagMut.mutateAsync({ key: key as ServerFlagKey, value: newValue ? 'true' : 'false' });
      await flagsQuery.refetch();
      showFeedback('ok', `Flag "${key}" atualizada`);
    } catch { showFeedback('err', 'Erro ao atualizar a flag'); }
  }, [setFlagMut, flagsQuery, showFeedback]);

  const handleToggleFeedGlobal = useCallback(async (_key: string, newValue: boolean) => {
    try {
      await setFlagMut.mutateAsync({ key: 'feed_mode_global', value: newValue ? 'all' : 'following' });
      await flagsQuery.refetch();
      showFeedback('ok', newValue ? 'Feed global: Todos ativado' : 'Feed global: Seguindo restaurado');
    } catch { showFeedback('err', 'Erro ao alterar modo de feed global'); }
  }, [setFlagMut, flagsQuery, showFeedback]);

  // ── Handlers de usuário ───────────────────────────────────────────────────
  const handleLookupUser = useCallback(async () => {
    const id = Number(userInput);
    if (!id || isNaN(id)) { showFeedback('err', 'ID inválido'); return; }
    try {
      const result = await getUserQuery.refetch();
      if (result.data) {
        setUserInfo({
          telegramId:  result.data.telegramId,
          name:        result.data.name,
          isBanned:    result.data.isBanned,
          shadowBanned:result.data.shadowBanned,
          feedMode:    result.data.feedMode,
          lastPostAt:  result.data.lastPostAt
            ? new Date(result.data.lastPostAt).toLocaleString('pt-BR')
            : null,
        });
      } else {
        showFeedback('err', 'Usuário não encontrado');
      }
    } catch { showFeedback('err', 'Usuário não encontrado'); }
  }, [userInput, getUserQuery, showFeedback]);

  const handleBan = useCallback(async (ban: boolean) => {
    if (!userInfo) return;
    try {
      await banUserMut.mutateAsync({ telegramId: userInfo.telegramId, ban });
      await statsQuery.refetch(); await actionsQuery.refetch();
      setUserInfo(prev => prev ? { ...prev, isBanned: ban } : null);
      showFeedback('ok', ban ? 'Usuário banido' : 'Ban removido');
    } catch { showFeedback('err', 'Erro ao alterar ban'); }
  }, [userInfo, banUserMut, statsQuery, actionsQuery, showFeedback]);

  const handleShadowBan = useCallback(async (ban: boolean) => {
    if (!userInfo) return;
    try {
      await shadowBanMut.mutateAsync({ telegramId: userInfo.telegramId, ban });
      await actionsQuery.refetch();
      setUserInfo(prev => prev ? { ...prev, shadowBanned: ban } : null);
      showFeedback('ok', ban ? 'Shadow ban aplicado' : 'Shadow ban removido');
    } catch { showFeedback('err', 'Erro ao alterar shadow ban'); }
  }, [userInfo, shadowBanMut, actionsQuery, showFeedback]);

  const handleResetRL = useCallback(async () => {
    if (!userInfo) return;
    try {
      await resetRLMut.mutateAsync({ telegramId: userInfo.telegramId });
      await actionsQuery.refetch();
      showFeedback('ok', 'Rate limit resetado');
    } catch { showFeedback('err', 'Erro ao resetar rate limit'); }
  }, [userInfo, resetRLMut, actionsQuery, showFeedback]);

  const handleSetFeedMode = useCallback(async (mode: 'following' | 'all') => {
    if (!userInfo) return;
    try {
      await setFeedModeMut.mutateAsync({ telegramId: userInfo.telegramId, feedMode: mode });
      await actionsQuery.refetch();
      setUserInfo(prev => prev ? { ...prev, feedMode: mode } : null);
      showFeedback('ok', `Feed alterado para "${mode === 'all' ? 'todos os posts' : 'só quem segue'}"`);
    } catch { showFeedback('err', 'Erro ao alterar feed do usuário'); }
  }, [userInfo, setFeedModeMut, actionsQuery, showFeedback]);

  // ── Handler de post ───────────────────────────────────────────────────────
  const handleDeletePost = useCallback(async () => {
    const id = Number(postInput);
    if (!id || isNaN(id)) { showFeedback('err', 'ID inválido'); return; }
    try {
      await deletePostMut.mutateAsync({ postId: id });
      await actionsQuery.refetch();
      setPostInput('');
      showFeedback('ok', `Post #${id} deletado`);
    } catch { showFeedback('err', 'Post não encontrado'); }
  }, [postInput, deletePostMut, actionsQuery, showFeedback]);

  // ── Guards ────────────────────────────────────────────────────────────────
  if (authLoading) {
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${bg})` }} />
        <div className="flex min-h-screen items-center justify-center"><Spinner size="lg" /></div>
      </>
    );
  }

  if (!isAdmin && !isModerator) {
    void router.replace('/');
    return null;
  }

  const roleLabel = role === 'deusa' ? '👑 Deusa' : role === 'mod' ? '🛡️ Moderadora' : '';

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed' }} />

      {/* Toast de feedback */}
      {feedback && (
        <div className={`fixed inset-x-4 top-4 z-50 rounded-2xl px-4 py-3 text-center text-sm font-semibold text-white shadow-lg transition-all ${
          feedback.type === 'ok' ? 'bg-primary' : 'bg-error'
        }`}>
          {feedback.msg}
        </div>
      )}

      <div className="min-h-screen pt-[88px] pb-32">
        <div className="mx-auto max-w-lg space-y-6 px-4">

          {/* Título de papel */}
          {roleLabel && (
            <div className="flex justify-center">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-2 backdrop-blur-xl saturate-150">
                <p className="text-center text-sm font-bold text-white text-shadow-dark">{roleLabel}</p>
              </div>
            </div>
          )}

          <FadeInWhenVisible><AdminStats stats={statsQuery.data} isLoading={statsQuery.isLoading} /></FadeInWhenVisible>

          {/* Flags — só deusa */}
          {isAdmin && (
            <FadeInWhenVisible><AdminFlags
              flags={flagsQuery.data}
              isLoading={flagsQuery.isLoading}
              isMutating={setFlagMut.isPending}
              onToggleFlag={handleToggleFlag}
              onToggleFeedGlobal={handleToggleFeedGlobal}
            /></FadeInWhenVisible>
          )}

          {/* Moderação de usuário — só deusa */}
          {isAdmin && (
            <FadeInWhenVisible><AdminUserMod
              userInput={userInput}
              userInfo={userInfo}
              onUserInputChange={(v) => { setUserInput(v); setUserInfo(null); }}
              onLookup={handleLookupUser}
              onBan={handleBan}
              onShadowBan={handleShadowBan}
              onResetRL={handleResetRL}
              onSetFeedMode={handleSetFeedMode}
              isLookingUp={getUserQuery.isFetching}
              isBanning={banUserMut.isPending}
              isShadowBanning={shadowBanMut.isPending}
              isResettingRL={resetRLMut.isPending}
              isSettingFeedMode={setFeedModeMut.isPending}
            /></FadeInWhenVisible>
          )}

          <FadeInWhenVisible><AdminPostMod
            postInput={postInput}
            onPostInputChange={setPostInput}
            onDelete={handleDeletePost}
            isDeleting={deletePostMut.isPending}
          /></FadeInWhenVisible>

          <FadeInWhenVisible><AdminCache onClear={() => { clearRateLimitCache(); showFeedback('ok', 'Cache local limpo'); }} /></FadeInWhenVisible>

          <FadeInWhenVisible><AdminAuditLog
            actions={actionsQuery.data}
            isLoading={actionsQuery.isLoading}
            isFetching={actionsQuery.isFetching}
            onRefresh={() => void actionsQuery.refetch()}
          /></FadeInWhenVisible>

          <FadeInWhenVisible><AdminBroadcast
            text={broadcastText}
            onTextChange={setBroadcastText}
            broadcasts={broadcastsQuery.data}
            isLoadingBroadcasts={broadcastsQuery.isFetching}
            isDeleting={deleteBroadcastMut.isPending}
            onLoadBroadcasts={() => void broadcastsQuery.refetch()}
            onDelete={(id) => deleteBroadcastMut.mutate({ postId: id })}
          /></FadeInWhenVisible>

          <FadeInWhenVisible><AdminLogVault
            logs={logsQuery.data}
            level={logLevel}
            isLoading={logsQuery.isLoading}
            isFetching={logsQuery.isFetching}
            onLevelChange={setLogLevel}
            onRefresh={() => void logsQuery.refetch()}
          /></FadeInWhenVisible>

        </div>
      </div>
    </>
  );
}
