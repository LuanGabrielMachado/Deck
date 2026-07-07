'use client';

import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Spinner } from './ui/spinner';
import { isTelegramWebView, hapticImpact } from '@/lib/telegram-utils';

interface PostCardShareProps {
  isSharing: boolean;
  shareImageUrl: string | null;
  shareBlob?: Blob | null;
  onShare?: () => void;
  onClose?: () => void;
}

export const PostCardShare = function PostCardShare({
  isSharing,
  shareImageUrl,
  shareBlob,
  onShare,
  onClose,
}: PostCardShareProps) {
  const [mounted, setMounted] = useState(false);
  const [canWebShare] = useState(() =>
    typeof navigator !== 'undefined' && !!navigator.share && !!navigator.canShare
  );

  useEffect(() => { setMounted(true); }, []);

  const handleShare = useCallback(async () => {
    if (isSharing) return;
    if (isTelegramWebView()) hapticImpact('light');
    onShare?.();
  }, [isSharing, onShare]);

  // Quando a imagem fica pronta e Web Share API está disponível, abre direto
  useEffect(() => {
    if (!shareBlob || !shareImageUrl) return;
    if (!canWebShare) return;

    const file = new File([shareBlob], 'deck.jpg', { type: 'image/jpeg' });
    if (!navigator.canShare({ files: [file] })) return;

    navigator.share({
      files: [file],
      title: 'Deck 🎭',
    }).catch(() => {
      // Usuário cancelou ou API falhou — modal de fallback já está visível
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareBlob]);

  if (!mounted) return null;

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleShare}
        disabled={isSharing}
        className={cn('h-9 w-9 rounded-full p-0 text-white hover:text-white/80 hover:bg-white/10')}
        aria-label="Compartilhar"
      >
        {isSharing ? (
          <Spinner size="sm" className="text-white" />
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </Button>

      {/* Modal de fallback — aparece quando Web Share API não está disponível */}
      {shareImageUrl && !canWebShare && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={shareImageUrl}
                alt="Post para compartilhar"
                className="max-h-[80vh] w-auto max-w-[90vw] rounded-2xl shadow-2xl allow-context-menu"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
