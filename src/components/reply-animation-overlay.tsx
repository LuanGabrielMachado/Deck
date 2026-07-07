'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { aquecerVideoCache, obterVideoCacheado } from '@/lib/video-cache';

// Mesmos timings da página de post (animation.mp4 60fps, 3.74s)
const VIDEO_DURATION_MS = 3740;
const FLASH_START_MS = 1600;
const FLASH_END_MS = 2200;
const FLASH_DURATION = FLASH_END_MS - FLASH_START_MS;
const FLASH_FADE_MS = FLASH_DURATION / 2;
const FLASH_MAX_OPACITY = 1.0;

// Fade-in/out do vídeo
const VIDEO_FADE_IN_MS = 300;
const VIDEO_FADE_OUT_MS = 400;

interface ReplyAnimationOverlayProps {
  /** Quando true, inicia a animação completa (fade-in → play → flash → fade-out → onComplete) */
  isPlaying: boolean;
  /** Chamado após toda a animação terminar (fade-out concluído) */
  onComplete: () => void;
}

export function ReplyAnimationOverlay({ isPlaying, onComplete }: ReplyAnimationOverlayProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [videoSrc, setVideoSrc] = useState('/videos/animation.mp4');
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [videoOpacity, setVideoOpacity] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const hardStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flashTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flashFadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeOutTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fadeInTimerRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  // Aquecer cache do vídeo ao montar
  useEffect(() => {
    const src = '/videos/animation.mp4';
    aquecerVideoCache(src);
    let ativo = true;
    obterVideoCacheado(src).then((cached) => {
      if (ativo) setVideoSrc(cached);
    });
    return () => { ativo = false; };
  }, []);

  const clearAllTimers = useCallback(() => {
    [hardStopTimerRef, flashTimerRef, flashFadeTimerRef, fadeOutTimerRef, fadeInTimerRef].forEach(ref => {
      if (ref.current) { clearTimeout(ref.current); ref.current = null; }
    });
  }, []);

  const finishAnimation = useCallback(() => {
    clearAllTimers();
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.removeEventListener('ended', finishAnimation);
    }

    // Fade-out do vídeo
    setFlashOpacity(0);
    setVideoOpacity(0);
    setIsMounted(false);

    fadeOutTimerRef.current = setTimeout(() => {
      if (video) { video.currentTime = 0; }
      onCompleteRef.current();
    }, VIDEO_FADE_OUT_MS);
  }, [clearAllTimers]);

  // Quando isPlaying muda para true → inicia sequência
  useEffect(() => {
    if (!isPlaying) return;

    const video = videoRef.current;
    if (!video) {
      // Sem vídeo → completa direto
      onCompleteRef.current();
      return;
    }

    // Marca como montado antes de iniciar animação
    setIsMounted(true);

    // 1. Reset + primeiro frame visível com fade-in
    video.currentTime = 0;
    setFlashOpacity(0);
    
    // Pequeno delay para garantir que o DOM atualizou antes do fade-in
    requestAnimationFrame(() => {
      setVideoOpacity(1); // fade-in via CSS transition
    });

    // 2. Após fade-in, play
    fadeInTimerRef.current = setTimeout(() => {
      const handleEnded = () => {
        video.removeEventListener('ended', handleEnded);
        finishAnimation();
      };
      video.addEventListener('ended', handleEnded);

      // Hard stop de segurança
      hardStopTimerRef.current = setTimeout(() => {
        video.removeEventListener('ended', handleEnded);
        finishAnimation();
      }, VIDEO_DURATION_MS + 500);

      // Flash
      flashTimerRef.current = setTimeout(() => {
        setFlashOpacity(FLASH_MAX_OPACITY);
        flashFadeTimerRef.current = setTimeout(() => {
          setFlashOpacity(0);
        }, FLASH_FADE_MS);
      }, FLASH_START_MS);

      video.play().catch(() => {
        video.removeEventListener('ended', handleEnded);
        finishAnimation();
      });
    }, VIDEO_FADE_IN_MS + 50); // +50ms para garantir que o fade-in começou

    // Cleanup: remove listeners ao desmontar ou parar
    return () => {
      clearAllTimers();
      video.removeEventListener('ended', finishAnimation);
    };
  }, [isPlaying, finishAnimation, clearAllTimers]);

  // Preload primeiro frame
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.preload = 'auto';
      videoRef.current.load();
      videoRef.current.currentTime = 0;
    }
  }, [videoSrc]);

  return (
    <>
      {/* Flash fullscreen - só visível quando flashOpacity > 0 */}
      <div
        className="pointer-events-none fixed inset-0 z-[60]"
        style={{
          backgroundColor: '#ffffff',
          opacity: flashOpacity,
          visibility: flashOpacity > 0 ? 'visible' : 'hidden',
          transition: `opacity ${FLASH_FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1), visibility ${FLASH_FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      />

      {/* Video — só visível quando isMounted e videoOpacity > 0 */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-[55] flex justify-center pt-[34px]"
        style={{
          opacity: videoOpacity,
          visibility: isMounted && videoOpacity > 0 ? 'visible' : 'hidden',
          transition: `opacity ${videoOpacity === 0 ? VIDEO_FADE_OUT_MS : VIDEO_FADE_IN_MS}ms cubic-bezier(0.22, 1, 0.36, 1), visibility ${videoOpacity === 0 ? VIDEO_FADE_OUT_MS : VIDEO_FADE_IN_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        <div className="h-[88px] w-[88px]">
          <video
            ref={videoRef}
            width={88}
            height={88}
            className="h-full w-full block"
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={() => {
              if (videoRef.current) videoRef.current.currentTime = 0;
            }}
          >
            <source src={videoSrc} type="video/mp4" />
            <source src="/videos/animation.webm" type="video/webm" />
          </video>
        </div>
      </div>
    </>
  );
}
