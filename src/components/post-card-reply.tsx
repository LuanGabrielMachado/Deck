'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Textarea } from './ui/textarea';
import { cn } from '@/lib/utils';
import {
  isTelegramWebView,
  mainButtonSetText,
  mainButtonShow,
  mainButtonHide,
  mainButtonEnable,
  mainButtonOnClick,
  mainButtonOffClick,
} from '@/lib/telegram-utils';
import { usePhysicsParticles } from '@/hooks/use-physics-particles';
import { useDeviceMotion } from '@/hooks/use-device-motion';
import { trpc } from '@/lib/trpc';
import type { MentionedUser } from '@/types/mention';

interface FloatingReaction {
  emoji: string;
  count: number;
  userReacted?: boolean;
}

interface PostCardReplyProps {
  postId: number;
  isReplyOpen: boolean;
  replyText: string;
  canReply: boolean;
  onReplyTextChange: (value: string) => void;
  onSendReply: (replyToPostId: number, content: string, mentionedIds?: number[]) => void;
  rateLimitPhrase?: string;
  className?: string;
  reactions?: FloatingReaction[];
  currentTelegramId?: number;
}

export const PostCardReply = memo(function PostCardReply({
  postId,
  isReplyOpen,
  replyText,
  canReply,
  onReplyTextChange,
  onSendReply,
  rateLimitPhrase,
  className,
  reactions = [],
  currentTelegramId,
}: PostCardReplyProps) {
  const replyInputRef = useRef<HTMLTextAreaElement>(null);
  const containerRef  = useRef<HTMLDivElement>(null);
  const particleRefs  = useRef<(HTMLElement | null)[]>([]);

  const deviceMotion = useDeviceMotion();

  usePhysicsParticles(
    isReplyOpen ? reactions.length : 0,
    containerRef,
    particleRefs,
    {
      collisionRadius: 8,
      repulsionStrength: 1.2,
      maxSpeed: 1.4,
      damping: 0.990,
      noiseStrength: 0.018,
      externalForceRef: deviceMotion,
    },
  );

  const setParticleRef = useMemo(
    () => reactions.map((_, i) => (el: HTMLDivElement | null) => { particleRefs.current[i] = el; }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactions.length]
  );

  // ── Menções como fotos inline ──────────────────────────────────
  const [mentionedUsers, setMentionedUsers] = useState<MentionedUser[]>([]);
  const [mentionQuery, setMentionQuery]     = useState<string | null>(null);

  const followingQuery = trpc.follows.following.useQuery(
    { telegramId: currentTelegramId ?? 0 },
    { enabled: !!currentTelegramId, staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 }
  );

  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null || !followingQuery.data) return [];
    const q = mentionQuery.toLowerCase();
    const added = new Set(mentionedUsers.map((u) => u.telegramId));
    return followingQuery.data
      .filter((u) => u.name && u.name.toLowerCase().includes(q) && !added.has(u.telegramId))
      .slice(0, 5);
  }, [mentionQuery, followingQuery.data, mentionedUsers]);

  const handleTextChange = useCallback((value: string) => {
    onReplyTextChange(value.slice(0, 100));
    const atIdx = value.lastIndexOf('@');
    if (atIdx !== -1) {
      const afterAt = value.slice(atIdx + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionQuery(afterAt);
        return;
      }
    }
    setMentionQuery(null);
  }, [onReplyTextChange]);

  const handleMentionSelect = useCallback((u: MentionedUser) => {
    if (mentionedUsers.length >= 3) return;
    // Remove o @parcial do texto
    const atIdx = replyText.lastIndexOf('@');
    if (atIdx !== -1) onReplyTextChange(replyText.slice(0, atIdx));
    setMentionedUsers((prev) => [...prev, u]);
    setMentionQuery(null);
  }, [replyText, mentionedUsers, onReplyTextChange]);

  const handleMentionRemove = useCallback((telegramId: number) => {
    setMentionedUsers((prev) => prev.filter((u) => u.telegramId !== telegramId));
  }, []);

  // ── Envio ──────────────────────────────────────────────────────
  const handleSendReply = useCallback(() => {
    const trimmed = replyText.trim();
    if (trimmed.length === 0 || trimmed.length > 100) return;
    if (!canReply) return;
    const ids = mentionedUsers.map((u) => u.telegramId);
    setMentionQuery(null);
    setMentionedUsers([]);
    onSendReply(postId, trimmed, ids.length > 0 ? ids : undefined);
  }, [replyText, canReply, postId, mentionedUsers, onSendReply]);

  useEffect(() => {
    if (!isTelegramWebView()) return;
    if (isReplyOpen && replyText.trim().length > 0 && canReply) {
      mainButtonSetText('Responder');
      mainButtonEnable();
      mainButtonShow();
      mainButtonOnClick(handleSendReply);
    } else {
      mainButtonHide();
    }
    return () => { mainButtonOffClick(handleSendReply); };
  }, [isReplyOpen, replyText, canReply, handleSendReply]);

  useEffect(() => {
    if (isReplyOpen && replyInputRef.current) {
      setTimeout(() => replyInputRef.current?.focus(), 200);
    }
  }, [isReplyOpen]);

  // Limpa estado ao fechar
  useEffect(() => {
    if (!isReplyOpen) {
      setMentionQuery(null);
      setMentionedUsers([]);
    }
  }, [isReplyOpen]);

  if (!isReplyOpen) return null;

  return (
    <div className={cn('mb-3', className)}>

      {/* Dropdown de sugestões — acima do container da textarea */}
      {mentionQuery !== null && mentionSuggestions.length > 0 && mentionedUsers.length < 3 && (
        <div className="mb-2 overflow-hidden rounded-2xl border border-white/20 bg-black/60 backdrop-blur-xl shadow-lg">
          {mentionSuggestions.map((u) => (
            <button
              key={u.telegramId}
              type="button"
              onClick={() => handleMentionSelect({ telegramId: u.telegramId, name: u.name ?? '', photoUrl: u.photoUrl })}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors active:bg-white/10"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&size=64&background=0a7ea4&color=fff`}
                alt={u.name ?? ''}
                className="h-7 w-7 rounded-full object-cover"
              />
              <span className="text-sm font-semibold text-white">{u.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Container da textarea — física confinada aqui */}
      <div ref={containerRef} className="relative rounded-2xl overflow-hidden">

        {/* Partículas de reação flutuantes (fundo) */}
        <div className="absolute inset-0 z-0 pointer-events-none" aria-hidden="true">
          {reactions.map((reaction, index) => (
            <motion.div
              key={reaction.emoji}
              ref={setParticleRef[index]}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 0.4, scale: 1 }}
              transition={{ delay: index * 0.04, duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
              className="absolute flex flex-col items-center gap-[4px]"
              style={{ transform: 'translate(-50%, -50%)' }}
            >
              <span className="text-[3px] font-bold leading-none text-white">
                {reaction.count > 0 ? reaction.count : ''}
              </span>
              <span className="text-[12px] leading-none">{reaction.emoji}</span>
            </motion.div>
          ))}
        </div>

        {/* Textarea + fotos de menção sobrepostas */}
        <div className="relative z-10">
          <Textarea
            ref={replyInputRef}
            value={replyText}
            onChange={(e) => handleTextChange(e.target.value)}
            placeholder={rateLimitPhrase ? `${rateLimitPhrase}...` : 'Responder...'}
            maxLength={100}
            rows={2}
            className="glass-card resize-none rounded-2xl text-white placeholder:text-white/50 pr-12 bg-transparent"
          />

          {/* Fotos das menções — topo direito, horizontal, cresce para a esquerda */}
          {mentionedUsers.length > 0 && (
            <div className="absolute top-2 right-3 flex flex-row-reverse items-center gap-1 pointer-events-none">
              {mentionedUsers.map((u) => (
                <button
                  key={u.telegramId}
                  type="button"
                  onClick={() => handleMentionRemove(u.telegramId)}
                  title={`Remover @${u.name}`}
                  className="pointer-events-auto transition-opacity active:opacity-50 hover:opacity-70"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || 'U')}&size=64&background=0a7ea4&color=fff`}
                    alt={u.name}
                    className="h-6 w-6 rounded-full object-cover ring-1 ring-white/40 shadow-md"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Contador de caracteres */}
          <span className="absolute bottom-3 right-3 text-xs font-medium text-white pointer-events-none">
            {replyText.length}/100
          </span>
        </div>
      </div>
    </div>
  );
});
