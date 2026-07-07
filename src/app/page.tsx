'use client';

import Link from 'next/link';
import { useCallback, useState, useRef, useMemo, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useWakeLock } from '@/hooks/use-wake-lock';
import { useThreadStack } from '@/hooks/use-thread-stack';
import { trpc } from '@/lib/trpc';
import { type Post } from '@/components/post-card';
import { SwipeableFeed } from '@/components/swipeable-feed';
import { ReplyAnimationOverlay } from '@/components/reply-animation-overlay';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import {
  isTelegramWebView,
  hapticImpact,
  hapticNotification,
  showTelegramPopup as showPopup,
  switchInlineQuery,
} from '@/lib/telegram-utils';
import { getRandomReplyRatePhrase } from '@/constants/rate-limit-phrases';
import { IMAGES } from '@/constants/images';

const TIMELINE_PAGE_SIZE = 20;

export default function TimelinePage() {
  const { user, isAdmin, isLoading: isAuthLoading, errorMessage } = useAuth();
  useWakeLock();

  const {
    currentThreadPostId,
    isInThread,
    threadStack,
    pushThread,
    popThread,
    clearThread,
  } = useThreadStack();

  // ── Query de timeline (feed normal) ─────────────────────────────
  const timelineQuery = trpc.posts.timeline.useInfiniteQuery(
    { limit: TIMELINE_PAGE_SIZE },
    {
      enabled: !!user,
      staleTime:  30 * 1000,             // 30s — considera stale rápido
      gcTime: 2 * 60 * 1000,
      refetchOnMount: 'always',          // busca nova versão sempre que monta
      refetchOnWindowFocus: true,        // sobrepõe o false global — atualiza ao focar
      refetchInterval: 15 * 1000,
      refetchIntervalInBackground: true,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: undefined,
    }
  );

  const utils = trpc.useUtils();

  // Invalida o feed ao montar — cobre navegação client-side de volta ao feed
  useEffect(() => {
    if (!user) return;
    void utils.posts.timeline.invalidate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Invalida ao voltar para o app (Telegram minimizado / troca de aba)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void utils.posts.timeline.invalidate();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [utils]);

  // Achata todas as páginas em um array flat de posts
  const timelinePosts = useMemo<Post[]>(
    () => timelineQuery.data?.pages?.flatMap((p) => p.posts as Post[]) ?? [],
    [timelineQuery.data?.pages]
  );

  // ── Query de thread (quando em modo thread) ──────────────────────
  const threadQuery = trpc.posts.thread.useInfiniteQuery(
    { postId: currentThreadPostId ?? 0, limit: 20 },
    {
      enabled: !!user && !!currentThreadPostId,
      staleTime: 30 * 1000,
      gcTime: 2 * 60 * 1000,
      refetchOnMount: 'always',
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      initialCursor: undefined,
    }
  );

  // Post original da thread atual (para exibir no topo)
  const threadRootQuery = trpc.posts.getById.useQuery(
    { postId: currentThreadPostId ?? 0 },
    { enabled: !!currentThreadPostId, staleTime: 60 * 1000 }
  );

  const threadPosts = useMemo<Post[]>(() => {
    const replies = threadQuery.data?.pages?.flatMap((p) => p.posts as Post[]) ?? [];
    if (!currentThreadPostId) return replies;
    const root = threadRootQuery.data as Post | null | undefined;
    if (!root) return replies;
    // Post original no topo, depois as replies em ordem cronológica (reversa do cursor)
    return [root, ...replies.slice().reverse()];
  }, [threadQuery.data?.pages, threadRootQuery.data, currentThreadPostId]);

  // Feed exibido: thread ou timeline
  const posts      = isInThread ? threadPosts : timelinePosts;
  const isLoading  = isInThread
    ? (threadQuery.isLoading || threadRootQuery.isLoading)
    : timelineQuery.isLoading;
  const hasNextPage        = isInThread ? threadQuery.hasNextPage        : timelineQuery.hasNextPage;
  const isFetchingNextPage = isInThread ? threadQuery.isFetchingNextPage : timelineQuery.isFetchingNextPage;

  const handleLoadMore = useCallback(() => {
    if (isInThread) {
      if (threadQuery.hasNextPage && !threadQuery.isFetchingNextPage) void threadQuery.fetchNextPage();
    } else {
      if (timelineQuery.hasNextPage && !timelineQuery.isFetchingNextPage) void timelineQuery.fetchNextPage();
    }
  }, [isInThread, threadQuery, timelineQuery]);

  const handleViewThread = useCallback((postId: number) => {
    if (isTelegramWebView()) hapticImpact('light');
    pushThread(postId);
  }, [pushThread]);

  const handleExitThread = useCallback(() => {
    if (isTelegramWebView()) hapticImpact('light');
    popThread();
  }, [popThread]);

  const handleClearThread = useCallback(() => {
    if (isTelegramWebView()) hapticImpact('light');
    clearThread();
  }, [clearThread]);

  const deleteMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      void utils.posts.timeline.invalidate();
    },
  });

  const handleDelete = useCallback(async (postId: number) => {
    if (!user) return;
    try {
      await deleteMutation.mutateAsync({ postId, telegramId: user.id });
    } catch {
      // Erro ao deletar — silencioso no cliente
    }
  }, [user, deleteMutation]);

  // ── Animação de vídeo para respostas ──────────────────────
  const [isAnimationPlaying, setIsAnimationPlaying] = useState(false);
  const pendingReplyRef = useRef<{ replyToPostId: number; content: string; mentionedIds?: number[] } | null>(null);

  const replyMutation = trpc.posts.reply.useMutation({
    onSuccess: () => {
      if (isTelegramWebView()) hapticNotification('success');
      void utils.posts.timeline.invalidate();
    },
    onError: (_error) => {
      if (isTelegramWebView()) hapticNotification('error');
      const phrase = getRandomReplyRatePhrase();
      showPopup({
        title: 'Ops!',
        message: phrase,
        buttons: [{ id: 'ok', type: 'ok', text: 'Ok' }],
      });
    },
  });

  const handleReplySubmit = useCallback((replyToPostId: number, content: string, mentionedIds?: number[]) => {
    pendingReplyRef.current = { replyToPostId, content, mentionedIds };
    if (isTelegramWebView()) hapticImpact('medium');
    setIsAnimationPlaying(true);
  }, []);

  const handleAnimationComplete = useCallback(() => {
    setIsAnimationPlaying(false);
    const data = pendingReplyRef.current;
    if (data) {
      pendingReplyRef.current = null;
      replyMutation.mutate(data);
    }
  }, [replyMutation]);

  if (isAuthLoading) {
    return (
      <>
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.feed})`, backgroundAttachment: 'fixed' }}
        />
        <div className="flex min-h-screen flex-col items-center justify-center">
          <Spinner size="lg" />
          <p className="mt-4 text-muted">Carregando...</p>
        </div>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${IMAGES.feed})`, backgroundAttachment: 'fixed' }}
        />
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <h1 className="mb-2 text-2xl font-bold text-foreground">🎭 Maracutáia</h1>
          {errorMessage ? (
            <div className="mt-4 rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl px-6 py-4 text-center">
              <p className="text-white font-semibold text-shadow-dark">{errorMessage}</p>
            </div>
          ) : (
            <p className="text-center text-muted">
              Clica nos três pontinhos do canto e depois Recarregar Página
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${IMAGES.feed})`, backgroundAttachment: 'fixed' }}
    />
    {/* Overlay de animação para respostas */}
    <ReplyAnimationOverlay
      isPlaying={isAnimationPlaying}
      onComplete={handleAnimationComplete}
    />
    <div className="flex min-h-screen flex-col pt-[120px]">
      {/* Mensagem topo centralizada */}
      <div className="flex justify-center px-4 pb-1">
        <p className="text-xs font-bold text-center text-shadow-light" style={{ color: '#000000' }}>
          Olha quem chegou
          <br />
          Veio saber da vida alheia né {user.first_name}
        </p>
      </div>

      {/* Timeline / Thread */}
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="lg" />
        </div>
      ) : posts.length === 0 ? (
        isInThread ? (
          /* Thread vazia */
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-28">
            <p className="mb-2 text-4xl">🕳️</p>
            <h2 className="mb-2 text-xl font-bold text-shadow-dark" style={{ color: '#ffffff' }}>Ninguém respondeu</h2>
            <p className="mb-6 text-center text-shadow-dark" style={{ color: '#ffffff' }}>Esse post ainda não tem respostas.</p>
            <button
              onClick={handleExitThread}
              className="rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-xl"
            >
              ← Sair da thread
            </button>
          </div>
        ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-6 pb-28">
          <p className="mb-4 text-6xl">🕳️</p>
          <h2 className="mb-2 text-xl font-bold text-shadow-dark" style={{ color: '#ffffff' }}>Não tem nada aqui</h2>
          <p className="mb-6 text-center text-shadow-dark" style={{ color: '#ffffff' }}>
            Chama aquela amiga boca de sacola pra threadr com a gente!
          </p>
          <div className="flex flex-col items-center gap-3 w-full max-w-xs">
            <Link href="/follow" className="w-full">
              <Button variant="primary" className="w-full">Seguir Usuários</Button>
            </Link>
            {isTelegramWebView() && (
              <button
                onClick={() => switchInlineQuery('Vem threadr no Maracutáia 🎭', ['users', 'groups'])}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-xl saturate-150 transition-opacity active:opacity-70"
              >
                👯 Convidar amigos
              </button>
            )}
          </div>
        </div>
        )
      ) : (
        <SwipeableFeed
          posts={posts}
          currentTelegramId={user.id}
          onDelete={handleDelete}
          isAdmin={isAdmin}
          onReplySubmit={handleReplySubmit}
          onLoadMore={handleLoadMore}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          onViewThread={handleViewThread}
          threadDepth={threadStack.length}
          onExitThread={handleExitThread}
          onClearThread={handleClearThread}
        />
      )}
    </div>
    </>
  );
}

