'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';
import { SwipeableFeed } from '@/components/swipeable-feed';
import { Spinner } from '@/components/ui/spinner';
import {
  initTelegramWebApp,
  isTelegramWebView,
  backButtonHide,
  backButtonOnClick,
  backButtonShow,
  backButtonOffClick,
  showTelegramPopup as showPopup,
} from '@/lib/telegram-utils';
import { usePageBackground } from '@/hooks/use-page-background';
import { useWakeLock } from '@/hooks/use-wake-lock';

export default function UserPostsPage() {
  const router = useRouter();
  const params = useParams();
  const { user: authUser, isAdmin } = useAuth();
  const bg = usePageBackground('post');
  useWakeLock();
  
  const telegramId = params.id as string;
  const telegramIdNum = telegramId ? parseInt(telegramId, 10) : 0;

  const postsQuery = trpc.posts.byUser.useInfiniteQuery(
    { telegramId: telegramIdNum, limit: 50 },
    {
      enabled: !!telegramIdNum && !!authUser,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnMount: 'always',
      refetchOnWindowFocus: true,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  // Flatten all pages into a single array
  // Otimização: useMemo com dependência granular e null safety
  const posts = useMemo(
    () => postsQuery.data?.pages?.flatMap(page => page.posts) ?? [],
    [postsQuery.data?.pages]
  );

  const hasNextPage = postsQuery.hasNextPage;
  const isFetchingNextPage = postsQuery.isFetchingNextPage;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void postsQuery.fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, postsQuery]);

  const postsCountQuery = trpc.posts.countByUser.useQuery(
    { telegramId: telegramIdNum },
    {
      enabled: !!telegramIdNum && !!authUser,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      refetchOnMount: 'always',
    }
  );

  const utils = trpc.useUtils();

  // Invalida ao montar (navegação client-side) e ao voltar para o app
  useEffect(() => {
    if (!telegramIdNum) return;
    void utils.posts.byUser.invalidate({ telegramId: telegramIdNum });
    void utils.posts.countByUser.invalidate({ telegramId: telegramIdNum });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!telegramIdNum) return;
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        void utils.posts.byUser.invalidate({ telegramId: telegramIdNum });
        void utils.posts.countByUser.invalidate({ telegramId: telegramIdNum });
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [utils, telegramIdNum]);

  const deletePostMutation = trpc.posts.delete.useMutation({
    onSuccess: () => {
      void utils.posts.byUser.invalidate({ telegramId: telegramIdNum });
      void utils.posts.countByUser.invalidate({ telegramId: telegramIdNum });
    },
  });

  useEffect(() => {
    initTelegramWebApp();
    if (!isTelegramWebView()) return;
    const handleBack = () => {
      router.back();
    };
    backButtonShow();
    backButtonOnClick(handleBack);
    return () => {
      backButtonOffClick(handleBack);
      backButtonHide();
    };
  }, [router]);

  const handleDeletePost = useCallback((postId: number) => {
    if (!authUser) return;
    deletePostMutation.mutate({ postId, telegramId: authUser.id });
  }, [authUser, deletePostMutation]);

  return (
    <>
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed' }}
      />
          <div className="min-h-screen pt-[240px]">
          {/* Header fixo */}
          <div className="fixed top-0 left-0 right-0 z-30" style={{ height: '240px' }}>
            {/* Conteúdo do header */}
            <div className="relative flex h-full items-center justify-center">
              <div className="flex flex-col items-center">
                {/* Glass card APENAS em volta de "Seus posts" + contador */}
                <div className="rounded-2xl glass-card px-5 py-2 text-center">
                  <h1 className="text-lg font-bold text-white text-shadow-dark">
                    Seus posts
                  </h1>
                  <p className="text-xs text-white/70 text-shadow-dark">
                    {postsCountQuery.data?.count ?? posts.length} posts
                  </p>
                </div>
                {/* Texto SEPARADO, abaixo do glass card — glass encapsula só o texto */}
                <div className="mt-6 rounded-2xl glass-card px-5 py-2 text-center">
                  <p className="text-xs font-bold text-center text-white text-shadow-dark">
                    🍪🍪🍪
                    <br />
                    É aqui que você vem quando posta
                    <br />
                    e se arrepende logo em seguida 💅
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Content com SwipeableFeed */}
          {postsQuery.isLoading ? (
            <div className="flex flex-1 items-center justify-center py-20">
              <Spinner size="lg" />
            </div>
          ) : (
            <>
              <SwipeableFeed
                posts={posts}
                currentTelegramId={authUser?.id}
                onDelete={handleDeletePost}
                isAdmin={isAdmin}
                showDeleteButton={true}
                onOpenOriginal={() => showPopup({
                  title: 'Nem pensar 💅',
                  message: 'Você não pode fazer isso daqui 🫵 vai se aventurar no feed 🃏',
                  buttons: [{ id: 'ok', type: 'ok', text: 'Ok' }],
                })}
                onReplySubmit={undefined}
                hideReplyButton
                onLoadMore={handleLoadMore}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
              />
              {/* Loading indicator para delete */}
              {deletePostMutation.isPending && (
                <div className="fixed bottom-4 right-4 rounded-full bg-primary p-3">
                  <Spinner className="text-white" />
                </div>
              )}
            </>
          )}
        </div>
      </>
  );
}
