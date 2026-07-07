'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  showTelegramPopup as showPopup,
  isTelegramWebView,
  hapticImpact,
  hapticNotification,
  vibrateReaction,
  hapticSelection,
  mainButtonHide,
  mainButtonShowProgress,
  mainButtonHideProgress,
  mainButtonEnable,
  mainButtonDisable,
} from '@/lib/telegram-utils';
import { trpc } from '@/lib/trpc';
import { cn } from '@/lib/utils';
import { PostCardHeader } from './post-card-header';
import { PostCardContent } from './post-card-content';
import { PostCardReactions } from './post-card-reactions';
import { PostCardReply } from './post-card-reply';
import { useReplyRateLimit } from '@/hooks/use-reply-rate-limit';
import { usePostSocialActions } from '@/hooks/use-post-social-actions';
import { getRandomReplyRatePhrase } from '@/constants/rate-limit-phrases';
import { generateShareCardForPost } from '@/lib/share-card';

export type PostAuthor = {
  telegramId: number;
  name: string | null;
  photoUrl: string | null;
};

export type ReplyToPost = {
  id: number;
  content: string;
  telegramId: number;
  author: {
    name: string | null;
  } | null;
} | null;

export type Post = {
  id: number;
  telegramId: number;
  content: string;
  imagePath: string | null;
  createdAt: Date | string;
  replyToPostId?: number | null;
  replyToPost?: ReplyToPost;
  author: PostAuthor | null;
  /** JSON snapshot dos usuários mencionados — parseado no componente */
  mentionedUsers?: string | null;
};

interface PostCardProps {
  post: Post;
  currentTelegramId?: number;
  onDelete?: (postId: number) => void;
  isAdmin?: boolean;
  className?: string;
  uniformHeight?: boolean;
  onOpenOriginal?: (postId: number) => void;
  onReplySubmit?: (replyToPostId: number, content: string, mentionedIds?: number[]) => void;
  feedVariant?: boolean;
  hideReplyButton?: boolean;
  showDeleteButton?: boolean;
  /** Callback para entrar na thread deste post */
  onViewThread?: (postId: number) => void;
  /** Profundidade atual na pilha de threads (0 = feed normal) */
  threadDepth?: number;
  onExitThread?: () => void;
  onClearThread?: () => void;
}

export const PostCard = memo(function PostCard({
  post,
  currentTelegramId,
  onDelete,
  isAdmin = false,
  className,
  uniformHeight = false,
  onOpenOriginal,
  onReplySubmit,
  feedVariant = false,
  hideReplyButton = false,
  showDeleteButton = false,
  onViewThread,
  threadDepth = 0,
  onExitThread,
  onClearThread,
}: PostCardProps) {
  const { canReply } = useReplyRateLimit(currentTelegramId, isAdmin);

  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const [shareBlob, setShareBlob] = useState<Blob | null>(null);

  // Memoizar timeAgo para evitar re-render desnecessário
  const timeAgo = useMemo(
    () =>
      formatDistanceToNow(
        typeof post.createdAt === 'string' ? new Date(post.createdAt) : post.createdAt,
        { addSuffix: true, locale: ptBR }
      ),
    [post.createdAt]
  );

  // Memoizar author data para evitar recriação
  const authorData = useMemo(
    () => ({
      telegramId: post.author?.telegramId ?? 0,
      name: post.author?.name || 'Usuário',
      photoUrl: post.author?.photoUrl ?? null,
    }),
    [post.author?.telegramId, post.author?.name, post.author?.photoUrl]
  );

  // Parsear snapshot de menções (JSON string → array tipado)
  const mentionParticles = useMemo(() => {
    if (!post.mentionedUsers) return undefined;
    try {
      return JSON.parse(post.mentionedUsers) as { telegramId: number; name: string | null; photoUrl: string | null }[];
    } catch {
      return undefined;
    }
  }, [post.mentionedUsers]);

  const reactionsQuery = trpc.reactions.getByPost.useQuery(
    { postId: post.id },
    { enabled: !!post.id, staleTime: 2 * 60 * 1000, gcTime: 5 * 60 * 1000 }
  );

  const replyCountQuery = trpc.posts.replyCount.useQuery(
    { postId: post.id },
    {
      enabled: !!post.id && !!onViewThread,
      staleTime: 30 * 1000,
      gcTime:    2 * 60 * 1000,
    }
  );

  const utils = trpc.useUtils();

  const addReactionMutation = trpc.reactions.add.useMutation({
    onMutate: async ({ postId, emoji }) => {
      await utils.reactions.getByPost.cancel({ postId });
      const prev = utils.reactions.getByPost.getData({ postId });
      utils.reactions.getByPost.setData({ postId }, (old) => {
        if (!old) return old;
        const existing = old.find((r) => r.emoji === emoji);
        if (existing) {
          return old.map((r) =>
            r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r
          );
        }
        return [...old, { emoji, count: 1, userReacted: true }];
      });
      return { prev };
    },
    onError: (_err, { postId }, ctx) => {
      if (ctx?.prev !== undefined) utils.reactions.getByPost.setData({ postId }, ctx.prev);
    },
    onSettled: (_data, _err, { postId }) => {
      void utils.reactions.getByPost.invalidate({ postId });
    },
  });

  const removeReactionMutation = trpc.reactions.remove.useMutation({
    onMutate: async ({ postId, emoji }) => {
      await utils.reactions.getByPost.cancel({ postId });
      const prev = utils.reactions.getByPost.getData({ postId });
      utils.reactions.getByPost.setData({ postId }, (old) => {
        if (!old) return old;
        return old
          .map((r) =>
            r.emoji === emoji ? { ...r, count: Math.max(0, r.count - 1), userReacted: false } : r
          )
          .filter((r) => r.count > 0);
      });
      return { prev };
    },
    onError: (_err, { postId }, ctx) => {
      if (ctx?.prev !== undefined) utils.reactions.getByPost.setData({ postId }, ctx.prev);
    },
    onSettled: (_data, _err, { postId }) => {
      void utils.reactions.getByPost.invalidate({ postId });
    },
  });

  const { handleAvatarPress } = usePostSocialActions({
    postId:        post.id,
    postAuthorId:  post.telegramId,
    postAuthorName: post.author?.name,
    currentTelegramId,
    isAdmin,
  });

  const replyMutation = trpc.posts.reply.useMutation({
    onSuccess: () => {
      setReplyText('');
      setIsReplyOpen(false);
      if (isTelegramWebView()) {
        hapticNotification('success');
        mainButtonHide();
      }
      // Cache local REMOVIDO - backend é única fonte da verdade
    },
    onError: () => {
      if (isTelegramWebView()) {
        hapticNotification('error');
        mainButtonHideProgress();
        mainButtonEnable();
      }
      const phrase = getRandomReplyRatePhrase();
      showPopup({
        title: 'Ops!',
        message: phrase,
        buttons: [{ id: 'ok', type: 'ok', text: 'Ok' }],
      });
    },
  });

  const handleSendReply = useCallback((replyToPostId: number, trimmed: string, mentionedIds?: number[]) => {
    if (!trimmed || !currentTelegramId) return;
    if (!canReply) return;
    if (onReplySubmit) {
      setReplyText('');
      setIsReplyOpen(false);
      if (isTelegramWebView()) mainButtonHide();
      onReplySubmit(replyToPostId, trimmed, mentionedIds);
      return;
    }
    if (isTelegramWebView()) {
      mainButtonShowProgress();
      mainButtonDisable();
    }
    replyMutation.mutate({ replyToPostId, content: trimmed, mentionedIds });
  }, [currentTelegramId, canReply, replyMutation, onReplySubmit]);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    if (isTelegramWebView()) hapticImpact('light');
    setIsSharing(true);
    try {
      const result = await generateShareCardForPost({
        content: post.content,
        authorName: post.author?.name || 'Usuário',
        imagePath: post.imagePath,
        replyToPost: post.replyToPost
          ? {
              authorName: post.replyToPost.author?.name || 'Usuário',
              content: post.replyToPost.content,
            }
          : undefined,
        reactions: (reactionsQuery.data ?? []).filter(r => r.count > 0),
      });
      if (result) {
        setShareImageUrl(result.dataUrl);
        setShareBlob(result.blob);
      }
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, post.content, post.imagePath, post.author?.name, post.replyToPost, reactionsQuery.data]);

  const handleCloseShareModal = useCallback(() => {
    setShareImageUrl(null);
    setShareBlob(null);
  }, []);

  const handleReactionAdd = useCallback(
    (emoji: string) => {
      if (!currentTelegramId) return;
      vibrateReaction(emoji);
      addReactionMutation.mutate({ postId: post.id, telegramId: currentTelegramId, emoji: emoji as Parameters<typeof addReactionMutation.mutate>[0]['emoji'] });
    },
    [currentTelegramId, post.id, addReactionMutation]
  );

  const handleReactionRemove = useCallback(
    (emoji: string) => {
      if (!currentTelegramId) return;
      removeReactionMutation.mutate({ postId: post.id, telegramId: currentTelegramId, emoji: emoji as Parameters<typeof removeReactionMutation.mutate>[0]['emoji'] });
    },
    [currentTelegramId, post.id, removeReactionMutation]
  );

  const handleToggleReply = useCallback(() => {
    if (isTelegramWebView()) hapticSelection();
    setIsReplyOpen((prev) => {
      if (!prev) setTimeout(() => document.querySelector('textarea')?.focus(), 200);
      else if (isTelegramWebView()) mainButtonHide();
      return !prev;
    });
  }, []);

  const handleReplyReferenceClick = useCallback(() => {
    if (post.replyToPost?.id && onOpenOriginal) {
      if (isTelegramWebView()) hapticImpact('light');
      onOpenOriginal(post.replyToPost.id);
    }
  }, [post.replyToPost?.id, onOpenOriginal]);

  const handleDelete = useCallback(() => {
    if (!onDelete) return;
    if (isTelegramWebView()) hapticImpact('light');
    showPopup(
      {
        title: 'Confirmar exclusão',
        message: 'Tem certeza que deseja apagar este post? Esta ação não pode ser desfeita.',
        buttons: [
          { id: 'cancel', type: 'cancel', text: 'Cancelar' },
          { id: 'delete', type: 'destructive', text: 'Apagar' },
        ],
      },
      (buttonId) => {
        if (buttonId === 'delete') {
          if (isTelegramWebView()) hapticNotification('warning');
          onDelete(post.id);
        }
      }
    );
  }, [onDelete, post.id]);

  return (
    <div
      className={cn(
        'mb-2.5 flex flex-col rounded-3xl p-2.5 glass-card transition-shadow duration-300 ease-out',
        uniformHeight && 'h-full min-h-[420px] sm:min-h-[445px]', // +120px área de conteúdo
        'relative',
        className
      )}
    >
      {/* Botão de deletar - alinhado com o nome do usuário
          - Admin: vê em QUALQUER página (independe de showDeleteButton)
          - Usuário comum: vê apenas em user/[id]/page (feedVariant = true && showDeleteButton = true) */}
      {(isAdmin || (currentTelegramId === post.telegramId && feedVariant && showDeleteButton)) && onDelete && (
        <div className="absolute right-4 top-4 z-10">
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-lg bg-error/10 px-3 py-1.5 text-xs font-semibold text-error transition-colors hover:bg-error/20"
          >
            Apagar Post
          </button>
        </div>
      )}

      {post.replyToPost && (
        <button
          type="button"
          onClick={handleReplyReferenceClick}
          className="mb-3 rounded-xl border border-white/10 bg-black/5 px-3 py-2 text-left transition-opacity active:opacity-70"
        >
          <p className="text-[11px] font-medium text-white/80 text-shadow-dark">
            ↩ Respondendo a {post.replyToPost.author?.name || 'Usuário'}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-white/60 text-shadow-dark">
            {post.replyToPost.content}
          </p>
        </button>
      )}

      <PostCardHeader
        author={authorData}
        timeAgo={timeAgo}
        currentTelegramId={currentTelegramId}
        onAvatarPress={
          currentTelegramId && post.telegramId !== currentTelegramId && !isAdmin
            ? handleAvatarPress
            : undefined
        }
      />

      <PostCardContent
        content={post.content}
        imagePath={post.imagePath}
        uniformHeight={uniformHeight}
        mentionedUsers={mentionParticles}
      />

      {/* Rodapé com reações, botões e contador */}
      <div className="pt-0">
        <PostCardReactions
          postId={post.id}
          createdAt={post.createdAt}
          reactions={reactionsQuery.data || []}
          onReactionAdd={handleReactionAdd}
          onReactionRemove={handleReactionRemove}
          onToggleReply={handleToggleReply}
          isReplyOpen={isReplyOpen}
          hideReplyButton={hideReplyButton}
          isSharing={isSharing}
          shareImageUrl={shareImageUrl}
          shareBlob={shareBlob}
          onShare={handleShare}
          onClose={handleCloseShareModal}
          hideFloatingEmojis={isReplyOpen}
          replyCount={replyCountQuery.data?.count}
          onViewThread={onViewThread ? () => onViewThread(post.id) : undefined}
          threadDepth={threadDepth}
          onExitThread={onExitThread}
          onClearThread={onClearThread}
        />

        <PostCardReply
          postId={post.id}
          isReplyOpen={isReplyOpen}
          replyText={replyText}
          canReply={canReply}
          onReplyTextChange={setReplyText}
          onSendReply={handleSendReply}
          rateLimitPhrase={feedVariant ? 'Se defenda...' : 'Escreva sua resposta...'}
          reactions={reactionsQuery.data || []}
          currentTelegramId={currentTelegramId}
        />
      </div>
    </div>
  );
});
