'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { trpc } from '@/lib/trpc';
import { isTelegramWebView, showTelegramPopup as showPopup, hapticSelection } from '@/lib/telegram-utils';
import { Spinner } from '@/components/ui/spinner';
import type { User as DbUser } from '@/drizzle/schema';
import { usePageBackground } from '@/hooks/use-page-background';

type UserItem = DbUser;

const BUBBLE_SIZES = [72, 64, 80, 68, 76, 60, 74, 66, 78, 70];

// ── Bolha de usuário — reutilizada em sugestões e resultados de busca ────────
interface UserBubbleProps {
  item: UserItem;
  index: number;
  disabled: boolean;
  onClick: (item: UserItem) => void;
}

function UserBubble({ item, index, disabled, onClick }: UserBubbleProps) {
  const size = BUBBLE_SIZES[index % BUBBLE_SIZES.length];
  return (
    <motion.button
      type="button"
      onClick={() => onClick(item)}
      disabled={disabled}
      initial={{ opacity: 0, scale: 0.6, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col items-center"
      style={{ width: size + 16 }}
    >
      <div
        className="relative overflow-hidden rounded-full border border-white/50 shadow-md bubble-float transition-opacity group-active:opacity-70"
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
          src={item.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name || 'U')}&background=0a7ea4&color=fff`}
          alt={item.name || 'Usuário'}
          fill
          className="object-cover"
        />
      </div>
      <p className="mt-1.5 line-clamp-1 text-center text-xs font-semibold text-white" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
        {item.name || 'Usuário'}
      </p>
    </motion.button>
  );
}

// ── Página ───────────────────────────────────────────────────────────────────
export default function FollowPage() {
  const { user: authUser, isLoading: isAuthLoading, errorMessage } = useAuth();
  const bg = usePageBackground('seguir');

  // ── Estado de busca ───────────────────────────────────────────────
  const [searchOpen, setSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef    = useRef<HTMLInputElement>(null);
  const searchTrimmed = searchQuery.trim();
  const isSearching   = searchOpen && searchTrimmed.length >= 1;

  const searchResult = trpc.users.search.useQuery(
    { query: searchTrimmed, limit: 20 },
    { enabled: !!authUser && isSearching, staleTime: 30 * 1000 }
  );

  const handleOpenSearch = useCallback(() => {
    setSearchOpen(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, []);

  // ── Queries de sugestões / seguindo ──────────────────────────────
  const suggestedQuery = trpc.users.suggested.useQuery(
    { limit: 20 },
    { enabled: !!authUser, staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, refetchOnMount: 'always' }
  );

  const followingQuery = trpc.follows.following.useQuery(
    { telegramId: authUser?.id ?? 0 },
    { enabled: !!authUser, staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000, refetchOnMount: 'always' }
  );

  const followMutation = trpc.follows.follow.useMutation();

  const followingIds = useMemo(
    () => new Set((followingQuery.data ?? []).map((u) => u.telegramId)),
    [followingQuery.data]
  );

  const suggestedUsers = useMemo(
    () => (suggestedQuery.data ?? []).filter((u) => !followingIds.has(u.telegramId)),
    [suggestedQuery.data, followingIds]
  );

  const searchUsers = useMemo(
    () => (searchResult.data ?? []).filter((u) => u.telegramId !== authUser?.id) as UserItem[],
    [searchResult.data, authUser?.id]
  );

  // ── Follow ────────────────────────────────────────────────────────
  const handleFollow = useCallback(async (userToFollow: UserItem) => {
    if (!authUser || authUser.id === userToFollow.telegramId) return;
    if (isTelegramWebView()) hapticSelection();

    const name = userToFollow.name || 'este usuário';
    const confirmed = await new Promise<boolean>((resolve) => {
      if (isTelegramWebView()) {
        showPopup(
          {
            title: 'Confirmar',
            message: `Deseja seguir ${name}?`,
            buttons: [
              { id: 'no',  type: 'cancel',  text: 'Não' },
              { id: 'yes', type: 'default', text: 'Sim' },
            ],
          },
          (btn) => resolve(btn === 'yes')
        );
        return;
      }
      resolve(window.confirm(`Deseja seguir ${name}?`));
    });

    if (!confirmed) return;

    try {
      await followMutation.mutateAsync({ followerId: authUser.id, followingId: userToFollow.telegramId });
      await Promise.all([followingQuery.refetch(), suggestedQuery.refetch()]);
    } catch {
      // Falha silenciosa
    }
  }, [authUser, followMutation, followingQuery, suggestedQuery]);

  const isLoading = isAuthLoading || suggestedQuery.isLoading || followingQuery.isLoading;

  // ── Erro de autenticação ──────────────────────────────────────────
  if (!isAuthLoading && !authUser) {
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed' }} />
        <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <h1 className="mb-2 text-2xl font-bold text-foreground">🎭 Maracutáia</h1>
          <p className="text-center text-muted">Clica nos três pontinhos do canto e depois Recarregar Página</p>
          {errorMessage && <p className="mt-3 text-center text-xs text-error">{errorMessage}</p>}
        </div>
      </>
    );
  }

  return (
    <>
      <div className="fixed inset-0 -z-10 bg-cover bg-center" style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed' }} />

      <div className="min-h-screen pt-[120px]">

        {/* Header fixo */}
        <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-center" style={{ height: '120px', paddingTop: '40px', paddingLeft: '11px' }}>
          <div className="rounded-2xl glass-card px-5 py-2 text-center">
            <p className="text-xs font-bold text-white text-center text-shadow-dark">
              Vem seguir a amiga fofoqueira aqui
            </p>
          </div>
        </div>

        {/* Caixa de busca flutuante glass */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              key="search-box"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-[130px] left-4 right-4 z-40"
            >
              <div className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-2xl saturate-150 shadow-lg">
                <span className="text-base">🔍</span>
                <input
                  ref={inputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar pessoas..."
                  className="flex-1 bg-transparent text-sm font-medium text-white placeholder:text-white/50 outline-none"
                />
                <button type="button" onClick={handleCloseSearch} className="text-white/60 hover:text-white transition-colors text-sm font-semibold">
                  Fechar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid de bolhas */}
        {isLoading ? (
          <div className="flex flex-1 items-center justify-center pb-24 pt-20">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="px-4 pb-24 pt-4">
            <div className="flex flex-wrap items-center justify-center gap-4">

              {/* Bolha 🔍 */}
              <motion.button
                type="button"
                onClick={handleOpenSearch}
                initial={{ opacity: 0, scale: 0.6, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="group flex flex-col items-center"
                style={{ width: 96 }}
              >
                <div
                  className="relative overflow-hidden rounded-full border border-white/50 shadow-md bubble-float transition-opacity group-active:opacity-70 flex items-center justify-center glass-card"
                  style={{
                    width: 80, height: 80,
                    ['--float-x' as string]: '2px',
                    ['--float-y' as string]: '-3px',
                    ['--float-duration' as string]: '6s',
                    ['--float-delay' as string]: '0s',
                  }}
                >
                  <span className="text-4xl select-none">🔍</span>
                </div>
                <p className="mt-1.5 text-center text-xs font-semibold text-white" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                  Buscar
                </p>
              </motion.button>

              {/* Resultados de busca */}
              {isSearching ? (
                searchResult.isLoading ? (
                  <div className="flex w-full justify-center py-8"><Spinner size="md" /></div>
                ) : searchUsers.length === 0 ? (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full text-center text-sm text-white/70 py-8 text-shadow-dark">
                    Ninguém com esse nome 🤔
                  </motion.p>
                ) : searchUsers.map((item, i) => (
                  <UserBubble key={item.telegramId} item={item} index={i} disabled={followMutation.isPending} onClick={handleFollow} />
                ))
              ) : (
                /* Sugestões */
                suggestedUsers.length === 0 ? (
                  <div className="flex w-full flex-col items-center justify-center px-6 pb-24 pt-16">
                    <p className="mb-4 text-6xl">🧶</p>
                    <h2 className="mb-2 text-xl font-bold text-white text-shadow-dark">Vish flopou será?</h2>
                    <p className="text-center text-white/80 text-shadow-dark">As queridas vão aparecer aqui, quando elas descobrirem 🤔</p>
                  </div>
                ) : suggestedUsers.map((item, i) => (
                  <UserBubble key={item.telegramId} item={item} index={i + 1} disabled={followMutation.isPending} onClick={handleFollow} />
                ))
              )}

            </div>
          </div>
        )}
      </div>
    </>
  );
}
