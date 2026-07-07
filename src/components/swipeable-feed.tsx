'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { PostCard, type Post } from './post-card';
import { Spinner } from '@/components/ui/spinner';
import { useSwipeGesture } from '@/hooks/use-swipe-gesture';
import {
  isTelegramWebView,
  showTelegramPopup as showPopup,
  hapticImpact,
} from '@/lib/telegram-utils';

interface SwipeableFeedProps {
  posts: Post[];
  currentTelegramId?: number;
  onDelete?: (postId: number) => void;
  /** Quando true, exibe botão de apagar em todos os posts (admin only). */
  isAdmin?: boolean;
  /** Quando true, exibe botão de apagar nos posts do usuário. */
  showDeleteButton?: boolean;
  /** Callback para abrir o card de um post original (referência de resposta) */
  onOpenOriginal?: (postId: number) => void;
  /** Callback externo para enviar resposta (com animação). */
  onReplySubmit?: (replyToPostId: number, content: string) => void;
  /** Quando true, esconde o botão de responder. */
  hideReplyButton?: boolean;
  /** Callback chamado quando o usuário chega perto do fim do feed. */
  onLoadMore?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  /** Callback para entrar na thread de um post */
  onViewThread?: (postId: number) => void;
  /** Profundidade atual na pilha de threads (0 = feed normal) */
  threadDepth?: number;
  onExitThread?: () => void;
  onClearThread?: () => void;
}

export function SwipeableFeed({
  posts,
  currentTelegramId,
  onDelete,
  isAdmin = false,
  showDeleteButton = false,
  onOpenOriginal,
  onReplySubmit,
  hideReplyButton = false,
  onLoadMore,
  hasNextPage,
  isFetchingNextPage,
  onViewThread,
  threadDepth = 0,
  onExitThread,
  onClearThread,
}: SwipeableFeedProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exitDirection, setExitDirection] = useState<'left' | 'right'>('left');

  // Reset ao trocar de feed/thread (quando muda o primeiro post)
  const firstPostId = posts[0]?.id;
  useEffect(() => { setCurrentIndex(0); }, [firstPostId]);

  const currentPost = posts[currentIndex];
  const nextPost = posts[currentIndex + 1];

  const handleNextPost = useCallback(() => {
    if (currentIndex >= posts.length - 1) return;
    setCurrentIndex((prev) => prev + 1);
    // Pré-carrega próxima página quando restar ≤ 5 posts
    if (onLoadMore && hasNextPage && currentIndex >= posts.length - 5) {
      onLoadMore();
    }
  }, [currentIndex, posts.length, onLoadMore, hasNextPage]);

  const handlePrevPost = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  }, [currentIndex]);

  const handleSwipeLeft  = useCallback(() => { setExitDirection('left');  handleNextPost(); }, [handleNextPost]);
  const handleSwipeRight = useCallback(() => { setExitDirection('right'); handlePrevPost(); }, [handlePrevPost]);

  const { handleTouchStart, handleTouchEnd } = useSwipeGesture({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
  });

  const counterText = useMemo(
    () => `${currentIndex + 1} / ${posts.length}`,
    [currentIndex, posts.length]
  );

  const handleOpenOriginal = useCallback((postId: number) => {
    if (onOpenOriginal) { onOpenOriginal(postId); return; }
    // Modo thread: clicar na referência entra na thread daquele post
    if (threadDepth > 0 && onViewThread) {
      if (isTelegramWebView()) hapticImpact('light');
      onViewThread(postId);
      return;
    }
    // Feed: tenta achar no array atual
    const idx = posts.findIndex(p => p.id === postId);
    if (idx >= 0) {
      if (isTelegramWebView()) hapticImpact('light');
      setCurrentIndex(idx);
    } else {
      showPopup({
        title: 'Nem pensar 💅',
        message: 'Você não pode fazer isso daqui 🫵 vai se aventurar no feed 🃏',
        buttons: [{ id: 'ok', type: 'ok', text: 'Ok' }],
      });
    }
  }, [onOpenOriginal, posts, threadDepth, onViewThread]);

  if (posts.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted animate-fade-in">Nenhum post encontrado</p>
      </div>
    );
  }

  if (!currentPost) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center p-6 animate-fade-in">
        <p className="mb-2 text-4xl">✨</p>
        <p className="text-muted">Não há mais posts por agora</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 pb-32 pt-2">
      {isFetchingNextPage && currentIndex >= posts.length - 3 && (
        <div className="mb-1 flex justify-center">
          <Spinner size="sm" />
        </div>
      )}

      {/* Contador — escondido em modo thread */}
      {threadDepth === 0 && (
        <motion.p
          key={currentIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="mb-2 text-xs font-medium text-shadow-light"
          style={{ color: '#000000' }}
        >
          {counterText}
        </motion.p>
      )}
      {threadDepth > 0 && <div className="mb-2 h-4" />}

      <div className="relative h-[calc(100dvh-440px)] min-h-[325px] max-h-[470px] w-[94vw] max-w-[520px]">
        {/* Peek card — próximo post */}
        {nextPost && (
          <div className="absolute inset-0 z-0 flex items-center justify-center">
            <div className="h-[97%] w-[97%] rounded-3xl glass-card opacity-50" />
          </div>
        )}

        <AnimatePresence mode="popLayout" custom={exitDirection}>
          <motion.div
            key={currentPost.id}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{
              opacity: 1, scale: 1, y: 0, x: 0, rotate: 0,
              transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              x: exitDirection === 'left' ? -320 : 320,
              rotate: exitDirection === 'left' ? -8 : 8,
              transition: {
                duration: 0.35,
                ease: [0.32, 0, 0.67, 0],
                opacity: { delay: 0.12, duration: 0.23 },
              },
            }}
            className="relative z-10 h-full"
          >
            <div className="h-full feed-card-float">
              <PostCard
                post={currentPost}
                currentTelegramId={currentTelegramId}
                onDelete={onDelete}
                isAdmin={isAdmin}
                showDeleteButton={showDeleteButton}
                onOpenOriginal={handleOpenOriginal}
                onReplySubmit={onReplySubmit}
                hideReplyButton={hideReplyButton}
                onViewThread={
                  // Post original da thread (index 0 em modo thread) não mostra "Ver thread"
                  threadDepth > 0 && currentIndex === 0 ? undefined : onViewThread
                }
                threadDepth={threadDepth}
                onExitThread={onExitThread}
                onClearThread={onClearThread}
                uniformHeight
                feedVariant
                className="!mb-0 h-full"
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
