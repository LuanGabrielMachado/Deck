'use client';

import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PostCardShare } from './post-card-share';
import { PostCardExpiry } from './post-card-expiry';
import { usePhysicsParticles } from '@/hooks/use-physics-particles';
import type { ObstacleRect } from '@/hooks/use-physics-particles';
import { useDeviceMotion } from '@/hooks/use-device-motion';
import { FlipNumber } from './flip-number';

const AVAILABLE_REACTIONS = [
  { emoji: '👍', label: 'Gostei' },
  { emoji: '🖕', label: 'Não gostei' },
  { emoji: '😂', label: 'KKKKKKK' },
  { emoji: '😱', label: 'Passada' },
  { emoji: '💀', label: 'Morta' },
  { emoji: '🔥', label: 'Chama' },
  { emoji: '❤️', label: 'Amei' },
  { emoji: '😍', label: 'Falsa' },
  { emoji: '🤔', label: 'hum' },
  { emoji: '🍪', label: 'Biscoito' },
  { emoji: '🐍', label: 'Cobra' },
  { emoji: '🐮', label: 'Vaca' },
] as const;

interface PostCardReactionsProps {
  postId: number;
  createdAt?: Date | string;
  reactions?: {
    emoji: string;
    count: number;
    userReacted?: boolean;
  }[];
  onReactionAdd?: (emoji: string) => void;
  onReactionRemove?: (emoji: string) => void;
  onToggleReply?: () => void;
  isReplyOpen?: boolean;
  hideReplyButton?: boolean;
  isSharing?: boolean;
  shareImageUrl?: string | null;
  shareBlob?: Blob | null;
  onShare?: () => void;
  onClose?: () => void;
  /** Quando true, os emojis flutuantes somem (migraram para dentro da textarea) */
  hideFloatingEmojis?: boolean;
  /** Quantas respostas diretas tem o post (undefined = não exibe badge) */
  replyCount?: number;
  /** Callback para entrar na thread deste post */
  onViewThread?: () => void;
  /**
   * Profundidade atual na pilha de threads.
   * 0 = feed normal (sem botão de voltar)
   * 1 = thread do post original ("← Sair")
   * 2+ = thread aninhada ("← Voltar" + "⤴ Sair")
   */
  threadDepth?: number;
  /** Callback para voltar um nível na thread (pop) */
  onExitThread?: () => void;
  /** Callback para sair direto pro feed (clear) — só usado em depth > 1 */
  onClearThread?: () => void;
}

export const PostCardReactions = memo(function PostCardReactions({
  reactions = [],
  onReactionAdd,
  onReactionRemove,
  createdAt,
  onToggleReply,
  isReplyOpen,
  hideReplyButton,
  isSharing,
  shareImageUrl,
  shareBlob,
  onShare,
  onClose,
  hideFloatingEmojis = false,
  replyCount,
  onViewThread,
  threadDepth = 0,
  onExitThread,
  onClearThread,
}: PostCardReactionsProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleReactionSelect = useCallback((emoji: string) => {
    const existingReaction = reactions.find((r) => r.emoji === emoji);
    if (existingReaction?.userReacted) {
      onReactionRemove?.(emoji);
    } else {
      onReactionAdd?.(emoji);
    }
    setShowReactionPicker(false);
  }, [reactions, onReactionAdd, onReactionRemove]);

  const openPicker = useCallback(() => setShowReactionPicker(true), []);
  const closePicker = useCallback(() => setShowReactionPicker(false), []);

  // Refs para o container e cada partícula — física escreve direto no DOM
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = hideFloatingEmojis ? 0 : reactions.length;

  // Obstáculos: zonas dos botões — emojis ricocheteiam neles
  const obstaclesRef = useRef<ObstacleRect[]>([
    { x: 0,  y: 0, w: 68, h: 44 },
    { x: -88, y: 0, w: 88, h: 44 },
  ]);
  const updateObstacles = useCallback(() => {
    const cw = containerRef.current?.offsetWidth ?? 0;
    if (cw > 0) {
      obstaclesRef.current = [
        { x: 0,       y: 0, w: 68, h: 44 },
        { x: cw - 88, y: 0, w: 88, h: 44 },
      ];
    }
  }, []);

  // Giroscópio: singleton — um único listener para todo o app
  const deviceMotion = useDeviceMotion();

  usePhysicsParticles(count, containerRef, particleRefs, {
    collisionRadius: 8,
    repulsionStrength: 1.2,
    maxSpeed: 1.4,
    damping: 0.990,
    noiseStrength: 0.018,
    externalForceRef: deviceMotion,
    obstaclesRef,
  });

  // Atualiza obstáculo direito quando container redimensionar
  useEffect(() => {
    updateObstacles();
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(updateObstacles);
    ro.observe(el);
    return () => ro.disconnect();
  }, [updateObstacles]);

  // Estabiliza o array de refs sem recriar a cada render
  const setParticleRef = useMemo(
    () => reactions.map((_, i) => (el: HTMLButtonElement | null) => { particleRefs.current[i] = el; }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reactions.length]
  );

  return (
    <div>
      {/* Divisória + thread nav à esquerda + expiry à direita */}
      <div className="relative mb-3 border-t border-white/20">

        {/* Esquerda: botões de thread */}
        <div className="absolute -top-5 left-0 flex items-center gap-2">
          {/* Depth 1: só Sair */}
          {threadDepth === 1 && onExitThread && (
            <button type="button" onClick={onExitThread}
              className="text-[10px] font-semibold text-white/70 hover:text-white transition-colors text-shadow-dark">
              ← Sair
            </button>
          )}
          {/* Depth 2+: Voltar (pop) + Sair (clear) */}
          {threadDepth >= 2 && onExitThread && (
            <button type="button" onClick={onExitThread}
              className="text-[10px] font-semibold text-white/70 hover:text-white transition-colors text-shadow-dark">
              ← Voltar
            </button>
          )}
          {threadDepth >= 2 && onClearThread && (
            <>
              <span className="text-[10px] text-white/30">·</span>
              <button type="button" onClick={onClearThread}
                className="text-[10px] font-semibold text-white/50 hover:text-white transition-colors text-shadow-dark">
                Sair
              </button>
            </>
          )}
          {/* Ver thread — só quando tem respostas */}
          {!!replyCount && replyCount > 0 && onViewThread && (
            <>
              {threadDepth >= 1 && <span className="text-[10px] text-white/30">·</span>}
              <button type="button" onClick={onViewThread}
                className="text-[10px] font-semibold text-white/80 hover:text-white transition-colors text-shadow-dark">
                Ver thread ({replyCount})
              </button>
            </>
          )}
        </div>

        {/* Direita: expiração */}
        <div className="absolute -top-5 right-0">
          <PostCardExpiry createdAt={createdAt ?? new Date()} className="!justify-end !pb-0" />
        </div>
      </div>

      {/* Linha do rodapé: 🍪 | [área física inset-0] | botões */}
      <div className="relative mb-3 flex items-center justify-between gap-2" style={{ height: '44px' }}>

        {/* Container de física — inset-0, obstáculos protegem os botões */}
        <div
          ref={containerRef}
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {!hideFloatingEmojis && reactions.map((reaction, index) => {
            const isOtherUserReacted = reaction.count > 0 && !reaction.userReacted;
            return (
              <motion.button
                key={reaction.emoji}
                ref={setParticleRef[index]}
                onClick={() => handleReactionSelect(reaction.emoji)}
                whileTap={{ scale: 0.9 }}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03, duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
                className={cn(
                  'absolute flex flex-col items-center gap-[4px] rounded-full px-1 py-0.5',
                  'transition-colors duration-200',
                  reaction.userReacted
                    ? 'bg-primary/80'
                    : isOtherUserReacted
                    ? 'bg-transparent'
                    : 'bg-white/5'
                )}
                style={{ transform: 'translate(-50%, -50%)' }}
                aria-label={reaction.emoji}
              >
                <FlipNumber
                  value={reaction.count}
                  className={cn(
                    'text-[3px] font-bold leading-none',
                    reaction.userReacted || isOtherUserReacted ? 'text-white' : 'text-white/70'
                  )}
                />
                <span className="text-[12px] leading-none">{reaction.emoji}</span>
              </motion.button>
            );
          })}
        </div>

        {/* 🍪 — z-index acima do container */}
        <motion.button
          onClick={openPicker}
          whileTap={{ scale: 0.9 }}
          className="relative z-10 shrink-0 flex h-9 items-center gap-1 rounded-full border border-dashed border-white/30 bg-white/5 px-4 text-lg transition-colors hover:bg-white/10"
        >
          🍪
        </motion.button>

        {/* Botões de ação — lado DIREITO, z-index acima do container */}
        <div className="relative z-10 shrink-0 flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={onToggleReply}
            disabled={hideReplyButton}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-full transition-all',
              hideReplyButton && 'invisible pointer-events-none',
              isReplyOpen ? 'bg-white/20 text-white' : 'text-white hover:text-white/80 hover:bg-white/10'
            )}
            aria-label="Responder"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 17 4 12 9 7" />
              <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
            </svg>
          </button>
          <PostCardShare
            isSharing={isSharing ?? false}
            shareImageUrl={shareImageUrl ?? null}
            shareBlob={shareBlob ?? null}
            onShare={onShare}
            onClose={onClose}
          />
        </div>
      </div>

      <AnimatePresence>
        {showReactionPicker && (
          <motion.div
            key="picker-root"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 z-40 rounded-3xl overflow-hidden"
          >
            {/* Backdrop — blur suave confinado ao card, sem cor */}
            <div
              onClick={closePicker}
              className="absolute inset-0 backdrop-blur-sm"
            />

            {/* Container transparente — sobe de baixo */}
            <motion.div
              key="picker-sheet"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 z-50 pt-3 pb-4"
            >
              {/* Handle bar */}
              <div className="mx-auto mb-3 h-1 w-8 rounded-full bg-white/30" />

              {/* Grid 4 colunas — fundo só nos botões */}
              <div className="grid grid-cols-4 gap-2 px-3">
                {AVAILABLE_REACTIONS.map((reaction, i) => {
                  const reacted  = reactions.find(r => r.emoji === reaction.emoji);
                  const isActive = reacted?.userReacted;
                  return (
                    <motion.button
                      key={reaction.emoji}
                      onClick={() => handleReactionSelect(reaction.emoji)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025, duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
                      whileTap={{ scale: 0.88 }}
                      className={cn(
                        'flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 border transition-colors duration-150',
                        'bg-white/80 border-white/40 active:bg-white/60',
                      )}
                      aria-label={reaction.label}
                    >
                      <span className="text-3xl leading-none">{reaction.emoji}</span>
                      <span className={cn(
                        'text-[10px] font-medium leading-tight text-center',
                        isActive ? 'text-primary' : 'text-black/60',
                      )}>
                        {reaction.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
