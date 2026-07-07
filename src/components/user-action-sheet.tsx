'use client';

/**
 * UserActionSheet — sheet de ações sobre um usuário.
 *
 * Substitui o popup nativo do Telegram (que só suporta 3 botões)
 * com um overlay glassmorphism em grade 2×2.
 *
 * Ações:
 *   🚨 Denunciar  |  👻 Ghosting / 💅 Superada
 *   🚫 Bloquear   |  🫧 Cancelar
 */

import { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticImpact } from '@/lib/telegram-utils';

interface UserActionSheetProps {
  isOpen: boolean;
  authorName: string;
  isGhosting: boolean;
  isLoadingStatus: boolean;
  onReport: () => void;
  onGhost: () => void;
  onBlock: () => void;
  onClose: () => void;
}

interface ActionButtonProps {
  emoji: string;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'destructive' | 'ghost-active' | 'cancel';
  disabled?: boolean;
}

const ActionButton = memo(function ActionButton({
  emoji,
  label,
  onClick,
  variant = 'default',
  disabled = false,
}: ActionButtonProps) {
  const variantClass = {
    default:       'bg-white/10 hover:bg-white/20 text-white border-white/20',
    destructive:   'bg-error/15 hover:bg-error/25 text-red-300 border-red-400/30',
    'ghost-active':'bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border-purple-400/30',
    cancel:        'bg-white/5 hover:bg-white/10 text-white/60 border-white/10',
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex flex-col items-center justify-center gap-1.5
        rounded-2xl border backdrop-blur-xl saturate-150
        px-3 py-4 transition-all duration-150
        active:scale-95 disabled:opacity-50 disabled:pointer-events-none
        ${variantClass}
      `}
    >
      <span className="text-2xl leading-none">{emoji}</span>
      <span className="text-[11px] font-semibold leading-tight text-center">{label}</span>
    </button>
  );
});

export const UserActionSheet = memo(function UserActionSheet({
  isOpen,
  authorName,
  isGhosting,
  isLoadingStatus,
  onReport,
  onGhost,
  onBlock,
  onClose,
}: UserActionSheetProps) {

  // Fecha ao pressionar ESC (desktop / teclado)
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [isOpen, onClose]);

  const handleAction = (fn: () => void) => {
    hapticImpact('light');
    fn();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="action-sheet-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-6"
          onClick={onClose}
        >
          {/* Backdrop blur */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Sheet */}
          <motion.div
            key="action-sheet-content"
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.34, 1.56, 0.64, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur-2xl saturate-200 shadow-xl"
          >
            {/* Nome do usuário */}
            <p className="mb-4 text-center text-sm font-semibold text-white/70 truncate px-2">
              {authorName}
            </p>

            {/* Grade 2×2 */}
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                emoji="🚨"
                label="Denunciar"
                variant="destructive"
                onClick={() => handleAction(onReport)}
              />
              <ActionButton
                emoji={isLoadingStatus ? '⏳' : isGhosting ? '💅' : '👻'}
                label={isLoadingStatus ? 'Carregando...' : isGhosting ? 'Superada' : 'Ghosting'}
                variant={isGhosting ? 'ghost-active' : 'default'}
                disabled={isLoadingStatus}
                onClick={() => handleAction(onGhost)}
              />
              <ActionButton
                emoji="🚫"
                label="Bloquear"
                variant="destructive"
                onClick={() => handleAction(onBlock)}
              />
              <ActionButton
                emoji="🫧"
                label="Cancelar"
                variant="cancel"
                onClick={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});
