'use client';

import { memo } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Spinner } from '@/components/ui/spinner';

/** Tamanhos variados para aspecto orgânico */
const BUBBLE_SIZES = [72, 64, 80, 68, 76, 60, 74, 66, 78, 70];

interface FollowingUser {
  telegramId: number;
  name: string | null;
  photoUrl: string | null;
}

interface ProfileBubblesProps {
  users: FollowingUser[];
  isLoading: boolean;
  isPending: boolean;
  onUnfollow: (id: number, name: string) => void;
}

/**
 * Grid de bolhas flutuantes dos usuários seguidos.
 * Extrai ~60 linhas de JSX repetitivo do profile/page.tsx.
 */
export const ProfileBubbles = memo(function ProfileBubbles({
  users,
  isLoading,
  isPending,
  onUnfollow,
}: ProfileBubblesProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <Spinner />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-xl saturate-150">
        <p className="text-center text-white/70 text-shadow-dark">Você é chata, segue alguém.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      {users.map((user, index) => {
        const size = BUBBLE_SIZES[index % BUBBLE_SIZES.length];
        return (
          <motion.button
            key={user.telegramId}
            type="button"
            onClick={() => onUnfollow(user.telegramId, user.name || 'este usuário')}
            disabled={isPending}
            initial={{ opacity: 0, scale: 0.6, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="group flex flex-col items-center"
            style={{ width: size + 16 }}
          >
            <div
              className="relative overflow-hidden rounded-full border border-white/50 shadow-md profile-bubble-float transition-opacity group-active:opacity-70"
              style={{
                width: size,
                height: size,
                ['--float-x' as string]: `${(index % 3) * 2 - 2}px`,
                ['--float-y' as string]: `${(index % 5) * 2 - 4}px`,
                ['--float-duration' as string]: `${5 + (index % 4)}s`,
                ['--float-delay' as string]: `${(index % 6) * 0.3}s`,
              }}
            >
              <Image
                src={user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}`}
                alt={user.name || 'User'}
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-1.5 line-clamp-1 text-center text-xs font-semibold sr-only">
              {user.name || 'Usuário'}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
});
