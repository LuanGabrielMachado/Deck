'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePostRateLimit } from '@/hooks/use-post-rate-limit';
import { trpc } from '@/lib/trpc';
import { validateImageSize, createImagePreviewUrl, revokeImagePreviewUrl } from '@/lib/image-utils';
import { compressImage } from '@/lib/image-compress';
import { aquecerVideoCache, obterVideoCacheado, clearVideoCache } from '@/lib/video-cache';
import { setRateLimitCache } from '@/lib/rate-limit-cache';
import {
  initTelegramWebApp,
  expandTelegramApp,
  hapticImpact,
  hapticNotification,
  hapticSelection,
  isTelegramWebView,
  mainButtonShow,
  mainButtonHide,
  mainButtonSetText,
  mainButtonEnable,
  mainButtonDisable,
  mainButtonShowProgress,
  mainButtonHideProgress,
  mainButtonOnClick,
  mainButtonOffClick,
  backButtonShow,
  backButtonHide,
  backButtonOnClick,
  backButtonOffClick,
  secondaryButtonShow,
  secondaryButtonHide,
  secondaryButtonSetText,
  secondaryButtonEnable,
  secondaryButtonOnClick,
  secondaryButtonOffClick,
  enableClosingConfirmation,
  disableClosingConfirmation,
  showTelegramPopup as showPopup,
} from '@/lib/telegram-utils';
import { Textarea } from '@/components/ui/textarea';
import { CountdownTimer } from '@/components/countdown-timer';
import { IMAGES } from '@/constants/images';
import { getRandomPlaceholderPhrase, getRandomPostRatePhrase } from '@/constants/rate-limit-phrases';
import { detectVideoEmbed, stripVideoUrl, extractVideoUrl } from '@/lib/video-embed';
import type { MentionedUser } from '@/types/mention';

// Flash effect config - Ajustado para animação 60fps (3.74s)
const VIDEO_DURATION_MS = 3740;
const FLASH_START_MS = 1600;
const FLASH_END_MS = 2200;
const FLASH_DURATION = FLASH_END_MS - FLASH_START_MS;
const FLASH_FADE_MS = FLASH_DURATION / 2;
const FLASH_MAX_OPACITY = 1.0;

export default function CreatePostPage() {
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const { canPost, timeRemaining, refetch } = usePostRateLimit(user?.id, isAdmin);

  // Frase aleatória do rate limit — muda a cada bloqueio
  const rateLimitPhrase = useMemo(
    () => getRandomPostRatePhrase(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [canPost]
  );

  // Placeholder aleatório — muda a cada montagem
  const placeholderPhrase = useMemo(() => getRandomPlaceholderPhrase(), []);

  const [content, setContent] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // ── Menções como chips — não contam no limite de caracteres ──────
  const [mentionedUsers, setMentionedUsers] = useState<MentionedUser[]>([]);
  const [mentionQuery, setMentionQuery] = useState<string | null>(null); // null = dropdown fechado

  // Pré-carrega seguidos na montagem para autocomplete instantâneo
  const followingQuery = trpc.follows.following.useQuery(
    { telegramId: user?.id ?? 0 },
    { enabled: !!user, staleTime: 5 * 60 * 1000, gcTime: 10 * 60 * 1000 }
  );

  const mentionSuggestions = useMemo(() => {
    if (mentionQuery === null || !followingQuery.data) return [];
    const q = mentionQuery.toLowerCase();
    const alreadyAdded = new Set(mentionedUsers.map((u) => u.telegramId));
    return followingQuery.data
      .filter((u) => u.name && u.name.toLowerCase().includes(q) && !alreadyAdded.has(u.telegramId))
      .slice(0, 5);
  }, [mentionQuery, followingQuery.data, mentionedUsers]);

  const handleContentChange = useCallback((value: string) => {
    setContent(value);
    const atIdx = value.lastIndexOf('@');
    if (atIdx !== -1) {
      const afterAt = value.slice(atIdx + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionQuery(afterAt);
        return;
      }
    }
    setMentionQuery(null);
  }, []);

  const handleMentionSelect = useCallback((u: { telegramId: number; name: string; photoUrl: string | null }) => {
    if (mentionedUsers.length >= 3) return;
    // Remove o @parcial do texto
    const atIdx = content.lastIndexOf('@');
    if (atIdx !== -1) setContent(content.slice(0, atIdx));
    setMentionedUsers((prev) => [...prev, u]);
    setMentionQuery(null);
  }, [content, mentionedUsers]);

  const handleMentionRemove = useCallback((telegramId: number) => {
    setMentionedUsers((prev) => prev.filter((u) => u.telegramId !== telegramId));
  }, []);
  const [flashOpacity, setFlashOpacity] = useState(0);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [animationVideoSrc, setAnimationVideoSrc] = useState('/videos/animation.mp4');
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fadeInTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const baseViewportHeightRef = useRef<number | null>(null);

  const hardStopTimerRef = useRef<NodeJS.Timeout | null>(null);
  const midCheckFiredRef = useRef(false);
  const flashTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flashFadeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const videoHandlersRef = useRef<{ timeupdate: ((event: Event) => void) | null; ended: ((event: Event) => void) | null }>({ timeupdate: null, ended: null });

  // ── Refs que sempre contêm o valor mais recente ─────────────
  // Evita stale closures nos callbacks do Telegram / video / timeout
  const contentRef = useRef(content);
  const videoUrlRef = useRef(videoUrl);
  const imageBase64Ref = useRef(imageBase64);
  const isPublishingRef = useRef(isPublishing);
  const canPostRef = useRef(canPost);
  const userRef = useRef(user);
  const isVideoPlayingRef = useRef(isVideoPlaying);
  const mentionedUsersRef = useRef(mentionedUsers);

  useEffect(() => { contentRef.current = content; }, [content]);
  useEffect(() => { videoUrlRef.current = videoUrl; }, [videoUrl]);
  useEffect(() => { mentionedUsersRef.current = mentionedUsers; }, [mentionedUsers]);

  // ── Auto-detecção de URL de vídeo ────────────────────────────
  // Quando o usuário cola uma URL suportada, ela é removida do textarea
  // automaticamente e salva em videoUrl. O chip aparece no rodapé.
  useEffect(() => {
    const embed = detectVideoEmbed(content);
    if (!embed) return;
    const url = extractVideoUrl(content);
    if (!url) return;
    setVideoUrl(url);
    setContent(prev => stripVideoUrl(prev));
  }, [content]);
  useEffect(() => { imageBase64Ref.current = imageBase64; }, [imageBase64]);
  useEffect(() => { isPublishingRef.current = isPublishing; }, [isPublishing]);
  useEffect(() => { canPostRef.current = canPost; }, [canPost]);
  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { isVideoPlayingRef.current = isVideoPlaying; }, [isVideoPlaying]);

  useEffect(() => {
    const srcOriginal = '/videos/animation.mp4';
    aquecerVideoCache(srcOriginal);

    let ativo = true;
    obterVideoCacheado(srcOriginal).then((srcCacheado) => {
      if (!ativo) return;
      setAnimationVideoSrc(srcCacheado);
    });

    return () => {
      ativo = false;
      clearVideoCache(); // Limpa cache e revoga object URLs
    };
  }, []);

  const utils = trpc.useUtils();

  const createPostMutation = trpc.posts.create.useMutation({
    onSuccess: () => {
      refetch();
      // Invalida o feed para aparecer imediatamente ao voltar
      void utils.posts.timeline.invalidate();
    },
  });
  // Ref para a mutation também
  const mutationRef = useRef(createPostMutation);
  useEffect(() => { mutationRef.current = createPostMutation; }, [createPostMutation]);

  const charactersLeft = 165 - content.length;
  
  // Separação: validação de texto é independente de rate limit
  // Um post só com URL de vídeo (sem texto) também é válido
  const isValidText = (content.trim().length > 0 || !!videoUrl) && content.length <= 165;
  const isValid = isValidText && canPost;

  const showPopupAlert = useCallback((message: string) => {
    try {
      showPopup({
        message,
        buttons: [{ type: 'ok', text: 'OK' }],
      });
    } catch {
      // fallback se popup do Telegram não funcionar
      alert(message);
    }
  }, []);

  const handlePickImage = useCallback(async () => {
    if (isTelegramWebView()) {
      hapticSelection();
    }
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      if (!validateImageSize(file.size)) {
        showPopupAlert('Imagem muito grande. O máximo é 12MB.');
        return;
      }

      try {
        const preview = createImagePreviewUrl(file);
        if (previewUrlRef.current) {
          revokeImagePreviewUrl(previewUrlRef.current);
        }
        previewUrlRef.current = preview;
        setImagePreview(preview);

        // Compressão client-side: threshold 300KB, redimensiona ≤1280px, JPEG 0.82, max 12MB
        const dataUrl = await compressImage(file);
        setImageBase64(dataUrl);
      } catch {
        if (previewUrlRef.current) {
          revokeImagePreviewUrl(previewUrlRef.current);
          previewUrlRef.current = null;
        }
        setImagePreview(null);
        setImageBase64(null);
        if (isTelegramWebView()) {
          hapticNotification('error');
        }
        showPopupAlert('Erro ao carregar imagem.');
      }
    };
    input.click();
  }, [showPopupAlert]);

  // ── Publish: lê TUDO de refs → nunca stale ──────────────────
  const doPublish = useCallback(async () => {
    const currentUser = userRef.current;
    const currentImage = imageBase64Ref.current;

    // Combina texto + URL do vídeo (se houver) — URL não conta no limite visual
    const textPart  = contentRef.current?.trim() ?? '';
    const urlPart   = videoUrlRef.current ?? '';
    const currentContent = urlPart
      ? (textPart ? `${textPart}\n${urlPart}` : urlPart)
      : textPart;

    if (!currentUser || !currentContent || isPublishingRef.current) return;

    setIsPublishing(true);
    isPublishingRef.current = true;

    try {
      await mutationRef.current.mutateAsync({
        telegramId: currentUser.id,
        content: currentContent,
        imageBase64: currentImage || undefined,
        mentionedIds: mentionedUsersRef.current.map((u) => u.telegramId),
      });

      // Camada 1 do rate limit: grava o timestamp no cache local.
      // Isso garante bloqueio imediato mesmo sem chamar o servidor.
      // Admin não grava cache — não precisa de rate limit.
      if (!isAdmin) {
        setRateLimitCache(Date.now());
      }

      setContent('');
      setVideoUrl(null);
      setMentionQuery(null);
      setMentionedUsers([]);
      if (previewUrlRef.current) {
        revokeImagePreviewUrl(previewUrlRef.current);
        previewUrlRef.current = null;
      }
      setImagePreview(null);
      setImageBase64(null);

      hapticNotification('success');
      // Desativa confirmação de fechamento antes de navegar (evita popup "Quer sair?")
      disableClosingConfirmation();
      router.push('/');
    } catch (error: unknown) {
      // Type-safe error handling
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      const errorCode = error instanceof Error && 'code' in error ? (error as { code?: string }).code : undefined;
      
      hapticNotification('error');
      
      if (errorCode === 'TOO_MANY_REQUESTS') {
        showPopupAlert(errorMessage || 'Aguarde antes de postar novamente.');
      } else if (errorMessage && errorMessage !== 'Erro desconhecido') {
        showPopupAlert(errorMessage);
      } else {
        showPopupAlert('Erro ao publicar o post. Tente novamente.');
      }
    } finally {
      setIsPublishing(false);
      isPublishingRef.current = false;
      setIsVideoPlaying(false);
      mainButtonHideProgress();
    }
  }, [router, showPopupAlert, isAdmin]);

  const stopVideoAnimation = useCallback(() => {
    // Limpa TODOS os timers pendentes
    const timers = [
      fadeInTimerRef.current,
      hardStopTimerRef.current,
      flashTimerRef.current,
      flashFadeTimerRef.current,
    ];

    timers.forEach((timer) => {
      if (timer) {
        clearTimeout(timer);
      }
    });

    fadeInTimerRef.current = null;
    hardStopTimerRef.current = null;
    flashTimerRef.current = null;
    flashFadeTimerRef.current = null;

    // Para e reseta o vídeo - REMOVE event listeners para evitar memory leak
    if (videoRef.current) {
      const video = videoRef.current;
      // Remove handlers registrados
      if (videoHandlersRef.current.timeupdate) {
        video.removeEventListener('timeupdate', videoHandlersRef.current.timeupdate);
      }
      if (videoHandlersRef.current.ended) {
        video.removeEventListener('ended', videoHandlersRef.current.ended);
      }
      video.pause();
      video.currentTime = 0;
      videoHandlersRef.current = { timeupdate: null, ended: null };
    }

    setIsVideoPlaying(false);
    setFlashOpacity(0);
    midCheckFiredRef.current = false;
  }, []);

  const startVideoAnimation = useCallback(() => {
    if (!canPostRef.current) {
      showPopupAlert('Você não pode publicar agora.');
      return;
    }

    const video = videoRef.current;
    if (!video) {
      // Sem vídeo → publica direto
      doPublish();
      return;
    }

    hapticImpact('medium');
    midCheckFiredRef.current = false;

    // Fade-in do vídeo (300ms) → play → flash → fade-out (400ms) → publish
    setIsVideoPlaying(true); // opacity 0→1 via CSS transition 300ms

    // Handlers com referência estável para cleanup
    const handlers = {
      timeupdate: null as ((event: Event) => void) | null,
      ended: null as ((event: Event) => void) | null,
    };

    // Aguardar fade-in completar antes de dar play
    const fadeInTimer = setTimeout(() => {
      const midCheckTime = 1.9;

      handlers.timeupdate = () => {
        if (video.currentTime >= midCheckTime && !midCheckFiredRef.current) {
          midCheckFiredRef.current = true;
          refetch();
        }
      };

      handlers.ended = () => {
        // Cleanup listeners
        if (handlers.timeupdate) video.removeEventListener('timeupdate', handlers.timeupdate);
        if (handlers.ended) video.removeEventListener('ended', handlers.ended);
        videoHandlersRef.current = { timeupdate: null, ended: null };

        // Fade-out do vídeo (400ms) antes de publicar
        setIsVideoPlaying(false); // opacity 1→0 via CSS transition 400ms
        setFlashOpacity(0);
        setTimeout(() => {
          stopVideoAnimation();
          doPublish();
        }, 400);
      };

      // Registrar listeners e armazenar refs para cleanup
      if (handlers.timeupdate) {
        videoHandlersRef.current.timeupdate = handlers.timeupdate;
        video.addEventListener('timeupdate', handlers.timeupdate);
      }
      if (handlers.ended) {
        videoHandlersRef.current.ended = handlers.ended;
        video.addEventListener('ended', handlers.ended);
      }

      hardStopTimerRef.current = setTimeout(() => {
        if (handlers.timeupdate) video.removeEventListener('timeupdate', handlers.timeupdate);
        if (handlers.ended) video.removeEventListener('ended', handlers.ended);
        videoHandlersRef.current = { timeupdate: null, ended: null };
        setIsVideoPlaying(false);
        setTimeout(() => {
          stopVideoAnimation();
          doPublish();
        }, 400);
      }, VIDEO_DURATION_MS + 500);

      flashTimerRef.current = setTimeout(() => {
        setFlashOpacity(FLASH_MAX_OPACITY);
        flashFadeTimerRef.current = setTimeout(() => {
          setFlashOpacity(0);
        }, FLASH_FADE_MS);
      }, FLASH_START_MS);

      video.currentTime = 0;
      video.play().catch(() => {
        // Falha silenciosa — o fluxo de fallback (stopVideoAnimation + doPublish) já cobre
        stopVideoAnimation();
        doPublish();
      });
    }, 300); // espera fade-in

    // Guardar timer do fade-in para cleanup
    fadeInTimerRef.current = fadeInTimer;
  }, [doPublish, showPopupAlert, refetch, stopVideoAnimation]);

  // ── Handler estável do SecondaryButton (📷 Foto) ────────────
  const stablePickImageHandler = useRef<() => void>(() => {});
  useEffect(() => {
    stablePickImageHandler.current = () => {
      if (isPublishingRef.current || isVideoPlayingRef.current) return;
      handlePickImage();
    };
  }, [handlePickImage]);

  const onSecondaryButtonClick = useCallback(() => {
    stablePickImageHandler.current();
  }, []);

  // ── Handler estável registrado uma vez no MainButton ────────
  // Callback ref pattern: todas as dependências em refs para evitar recriação
  const stablePublishHandler = useRef<() => void>(() => {});

  useEffect(() => {
    stablePublishHandler.current = () => {
      const trimmed = contentRef.current?.trim() ?? '';
      const hasVideo = !!videoUrlRef.current;
      if (trimmed.length === 0 && !hasVideo) return;
      if (trimmed.length > 165) return;
      if (!canPostRef.current) return;
      if (isPublishingRef.current) return;
      if (isVideoPlayingRef.current) return;
      // startVideoAnimation também usa refs, então é seguro chamar
      startVideoAnimation();
    };
  }, [startVideoAnimation]);

  // Wrapper estável que nunca muda de referência (registrado UMA VEZ no MainButton)
  const onMainButtonClick = useCallback(() => {
    stablePublishHandler.current();
  }, []);

  const handleCancel = useCallback(() => {
    stopVideoAnimation();
    router.back();
  }, [stopVideoAnimation, router]);

  // ── Closing confirmation — ativa quando há conteúdo não publicado ──
  useEffect(() => {
    if (!isTelegramWebView()) return;
    const hasUnsaved = content.trim().length > 0 || !!imagePreview;
    if (hasUnsaved) {
      enableClosingConfirmation();
    } else {
      disableClosingConfirmation();
    }
    return () => { disableClosingConfirmation(); };
  }, [content, imagePreview]);

  // Garantir que o primeiro frame está sempre visível
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.preload = 'auto';
      videoRef.current.load();
      videoRef.current.currentTime = 0;
    }
  }, [animationVideoSrc]);

  // Cleanup de timers e listeners no unmount (previne memory leaks)
  useEffect(() => {
    // Captura o valor do ref dentro do effect para evitar stale ref no cleanup
    const video = videoRef.current;
    return () => {
      if (video) {
        video.pause();
        video.src = '';
        video.load();
      }
      stopVideoAnimation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // Telegram integration — registra handlers UMA VEZ (refs estáveis)
  useEffect(() => {
    initTelegramWebApp();
    expandTelegramApp();
    backButtonShow();
    backButtonOnClick(handleCancel);
    mainButtonOnClick(onMainButtonClick);

    // SecondaryButton: "📷 Foto" — botão nativo abaixo do MainButton
    // Não mostra aqui — controlado pelo useEffect do MainButton (só com texto)
    if (isTelegramWebView()) {
      secondaryButtonSetText('📷 Foto');
      secondaryButtonEnable();
      secondaryButtonOnClick(onSecondaryButtonClick);
    }

    return () => {
      backButtonOffClick(handleCancel);
      mainButtonOffClick(onMainButtonClick);
      backButtonHide();
      mainButtonHide();
      secondaryButtonOffClick(onSecondaryButtonClick);
      secondaryButtonHide();
      disableClosingConfirmation();
      // Cleanup CRÍTICO: limpa TODOS os timers pendentes no unmount
      stopVideoAnimation();
      // Limpa cache de vídeo para evitar memory leak
      clearVideoCache();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const setInitialViewportHeight = () => {
      setViewportHeight(window.innerHeight);
    };

    setInitialViewportHeight();
    window.addEventListener('orientationchange', setInitialViewportHeight);

    return () => {
      window.removeEventListener('orientationchange', setInitialViewportHeight);
    };
  }, []);

  // ── Detectar teclado virtual (visualViewport) ──────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getVH = () => window.visualViewport
      ? window.visualViewport.height + window.visualViewport.offsetTop
      : window.innerHeight;

    baseViewportHeightRef.current = getVH();

    const handleResize = () => {
      const base = baseViewportHeightRef.current ?? window.innerHeight;
      const current = getVH();
      setKeyboardOffset(Math.max(0, base - current));
    };

    window.visualViewport?.addEventListener('resize', handleResize);
    window.visualViewport?.addEventListener('scroll', handleResize);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('scroll', handleResize);
    };
  }, []);

  // ── MainButton: apenas controla visibilidade / texto ────────
  useEffect(() => {
    const hideMainButtonCompletely = () => {
      mainButtonHideProgress();
      mainButtonHide();
    };

    if (isVideoPlaying) {
      hideMainButtonCompletely();
      if (isTelegramWebView()) secondaryButtonHide();
      return;
    }

    if (isPublishing) {
      mainButtonShow();
      mainButtonDisable();
      mainButtonSetText('Publicando...');
      mainButtonShowProgress();
      if (isTelegramWebView()) secondaryButtonHide();
      return;
    }

    // Só mostra os botões se tiver texto digitado
    const hasText = content.trim().length > 0;
    if (!hasText) {
      hideMainButtonCompletely();
      if (isTelegramWebView()) secondaryButtonHide();
      return;
    }

    // Tem texto — mostra SecondaryButton (foto) sempre que MainButton aparece
    if (isTelegramWebView()) secondaryButtonShow();

    if (isValid && canPost) {
      mainButtonShow();
      mainButtonEnable();
      mainButtonSetText('Publicar');
      return;
    }

    if (!canPost) {
      mainButtonShow();
      mainButtonDisable();
      const minutes = Math.floor(timeRemaining / 60000);
      const seconds = Math.floor((timeRemaining % 60000) / 1000);
      mainButtonSetText(`Aguardar ${minutes}m ${seconds}s`);
      return;
    }

    hideMainButtonCompletely();
  }, [
    content,
    isValid,
    canPost,
    timeRemaining,
    isVideoPlaying,
    isPublishing,
  ]);

  return (
    <div
      className="relative flex flex-col overflow-hidden"
      style={{ height: viewportHeight ? `${viewportHeight}px` : '100svh' }}
    >
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${IMAGES.bgArtistic})` }}
      />
      <div
        className="absolute inset-0 z-40"
        style={{
          backgroundColor: '#ffffff',
          opacity: flashOpacity,
            transition: `opacity ${FLASH_FADE_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
          pointerEvents: 'none',
        }}
      />


      {/* Video animation (hidden, used during post animation) — fade-in 300ms / fade-out 400ms */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[55] flex justify-center pt-[34px]" style={{ opacity: isVideoPlaying ? 1 : 0, transition: `opacity ${isVideoPlaying ? 300 : 400}ms cubic-bezier(0.22, 1, 0.36, 1)` }}>
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
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
              }
            }}
          >
            <source src={animationVideoSrc} type="video/mp4" />
            <source src="/videos/animation.webm" type="video/webm" />
          </video>
        </div>
      </div>

      {/* Espaçador para empurrar conteúdo acima da área fixa do form */}
      <div className="flex-1" />

      {/* Form fixo acima da tab bar — sobe com o teclado */}
      <div
        className="px-6 pb-32"
        style={{
          transform: !canPost ? 'none' : `translateY(-${keyboardOffset}px)`,
          transition: 'transform 0.15s ease-out',
          willChange: 'transform',
        }}
      >
        {/* Rate limit warning (acima da caixa de texto) */}
        {!canPost && (
          <div className="mb-3 rounded-2xl border border-error/30 bg-error/80 p-3 shadow-[0_0_20px_rgba(255,59,48,0.2)] backdrop-blur-md">
            <p className="text-center font-bold text-white text-shadow-dark">{rateLimitPhrase}</p>
            <CountdownTimer timeRemainingMs={timeRemaining} variant="error" />
          </div>
        )}
        {/* ── Dropdown de sugestões ── */}
        {mentionQuery !== null && mentionSuggestions.length > 0 && mentionedUsers.length < 3 && (
          <div className="mb-2 overflow-hidden rounded-2xl border border-white/20 bg-black/60 backdrop-blur-xl shadow-lg">
            {mentionSuggestions.map((u) => (
              <button
                key={u.telegramId}
                type="button"
                onClick={() => handleMentionSelect({ telegramId: u.telegramId, name: u.name ?? '', photoUrl: u.photoUrl })}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-white/10 active:bg-white/15"
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

        {/* ── Bolinhas de vídeo e imagem — acima da textarea, fora da caixa ── */}
        {(videoUrl || imagePreview) && (
          <div className="mb-2 flex items-center gap-2">
            {/* Bolinha de vídeo */}
            {videoUrl && (() => {
              const embed = detectVideoEmbed(videoUrl);
              return embed ? (
                <button
                  type="button"
                  onClick={() => setVideoUrl(null)}
                  title={`Remover vídeo (${embed.label})`}
                  className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white/30 bg-white/15 backdrop-blur-xl shadow-lg flex items-center justify-center transition-opacity hover:opacity-75 active:opacity-50"
                >
                  <span className="text-xl leading-none">🎬</span>
                </button>
              ) : null;
            })()}
            {/* Bolinha de imagem — preview redondo */}
            {imagePreview && (
              <button
                type="button"
                onClick={() => {
                  revokeImagePreviewUrl(imagePreview);
                  previewUrlRef.current = null;
                  setImagePreview(null);
                  setImageBase64(null);
                }}
                title="Remover imagem"
                className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-full border border-white/30 shadow-lg transition-opacity hover:opacity-75 active:opacity-50"
              >
                <Image src={imagePreview} alt="Preview" width={40} height={40} className="h-full w-full object-cover" />
              </button>
            )}
          </div>
        )}

        {/* ── Textarea com fotos de menção sobrepostas no canto sup-dir ── */}
        <div className="relative mb-2">
          <Textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            placeholder={placeholderPhrase}
            className="min-h-[100px] w-full resize-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-base placeholder:text-white/50 shadow-lg backdrop-blur-xl"
            style={{ color: '#000000', paddingRight: mentionedUsers.length > 0 ? '2.75rem' : undefined }}
            maxLength={165}
            disabled={isVideoPlaying || isPublishing || !canPost}
          />
          {mentionedUsers.length > 0 && (
            <div className="absolute top-2 right-2 flex flex-col items-center gap-1 pointer-events-none">
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
        </div>

        <div className="mt-1 text-center">
          <p className="text-sm text-white text-shadow-dark">
            {charactersLeft} caracteres restantes
          </p>
        </div>
      </div>
    </div>
  );
}
