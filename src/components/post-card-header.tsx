'use client';

import { memo, useMemo } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PostCardHeaderProps {
  author: {
    telegramId: number;
    name: string | null;
    photoUrl: string | null;
  } | null;
  timeAgo: string;
  className?: string;
  onAvatarPress?: () => void;
  currentTelegramId?: number;
}

export const PostCardHeader = memo(function PostCardHeader({
  author,
  timeAgo,
  className,
  onAvatarPress,
  currentTelegramId,
}: PostCardHeaderProps) {
  const isOwn = !!currentTelegramId && author?.telegramId === currentTelegramId;
  const authorName = isOwn ? 'Você' : (author?.name || 'Usuário');

  const avatarUrl = useMemo(() =>
    author?.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=0a7ea4&color=fff&size=128`,
    [author?.photoUrl, authorName]
  );

  return (
    <div className={cn('mb-3 flex items-center gap-3', className)}>
      <div
        className={cn(
          'relative h-10 w-10 overflow-hidden rounded-full border-2 border-white/20 shadow-lg',
          onAvatarPress && 'cursor-pointer active:opacity-70 transition-opacity',
        )}
        onClick={onAvatarPress}
      >
        <Image
          src={avatarUrl}
          alt={authorName}
          fill
          className="object-cover"
          sizes="40px"
        />
      </div>

      <div className="flex flex-1 items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white text-shadow-dark">
            {authorName}
          </span>
          <span className="text-xs text-white/70 text-shadow-dark">
            {timeAgo}
          </span>
        </div>
      </div>
    </div>
  );
});
