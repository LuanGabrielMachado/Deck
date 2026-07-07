'use client';

import { memo, useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  detectVideoEmbed,
  stripVideoUrl,
  getEmbedUrl,
  getThumbnailUrl,
  type VideoEmbed,
} from '@/lib/video-embed';
import { PostMentionParticles, type MentionParticleUser } from './post-mention-particles';

// ── Player de embed ───────────────────────────────────────────────────────────

interface VideoEmbedPlayerProps {
  embed: VideoEmbed;
}

const VideoEmbedPlayer = memo(function VideoEmbedPlayer({ embed }: VideoEmbedPlayerProps) {
  const [playing, setPlaying] = useState(false);

  const thumbnailUrl = getThumbnailUrl(embed);
  const embedUrl     = getEmbedUrl(embed);

  return (
    <div className="relative mt-3 w-full overflow-hidden rounded-xl bg-black" style={{ aspectRatio: '16/9' }}>
      {playing ? (
        <iframe
          src={embedUrl}
          title={`${embed.label} video`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="group absolute inset-0 flex h-full w-full items-center justify-center"
          aria-label={`Reproduzir vídeo do ${embed.label}`}
        >
          {/* Thumbnail (YouTube) ou placeholder de plataforma (Vimeo) */}
          {thumbnailUrl ? (
            <>
              <Image
                src={thumbnailUrl}
                alt={`Thumbnail ${embed.label}`}
                fill
                className="object-cover transition-transform duration-300 group-active:scale-95"
                sizes="(max-width: 768px) 100vw, 600px"
                unoptimized
              />
              <div className="absolute inset-0 bg-black/20" />
            </>
          ) : (
            /* Vimeo: placeholder com gradiente azul */
            <div
              className="absolute inset-0 flex items-end pb-3 pl-4"
              style={{ background: 'linear-gradient(135deg, #1ab7ea 0%, #0d87c8 50%, #0a6fa3 100%)' }}
            >
              <span className="text-xs font-bold tracking-widest text-white/80 uppercase">
                {embed.label}
              </span>
            </div>
          )}

          {/* Botão ▶ — igual para todas as plataformas */}
          <div
            className="relative flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform duration-150 group-active:scale-90"
            style={{
              background: embed.platform === 'youtube' ? '#ff0000' : '#1ab7ea',
            }}
          >
            <svg viewBox="0 0 24 24" fill="white" className="h-6 w-6 translate-x-0.5" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </button>
      )}
    </div>
  );
});

// ── Componente principal ──────────────────────────────────────────────────────

interface PostCardContentProps {
  content: string;
  imagePath: string | null;
  uniformHeight?: boolean;
  /** Usuários mencionados — exibidos como fotos flutuantes por trás do conteúdo */
  mentionedUsers?: MentionParticleUser[] | null;
}

export const PostCardContent = memo(function PostCardContent({
  content,
  imagePath,
  uniformHeight = false,
  mentionedUsers,
}: PostCardContentProps) {
  const embed       = detectVideoEmbed(content);
  const displayText = embed ? stripVideoUrl(content) : content;
  const hasParticles = !!mentionedUsers && mentionedUsers.length > 0;

  return (
    /**
     * Container externo: relative + overflow-hidden para confinar as partículas.
     * As fotos flutuantes ficam em absolute inset-0 z-0, ATRÁS do conteúdo (z-10).
     */
    <div className={cn('mb-5 pr-1 relative overflow-hidden', uniformHeight && 'flex-1')}>

      {/* Fotos flutuantes das menções — por trás de tudo */}
      {hasParticles && <PostMentionParticles mentionedUsers={mentionedUsers!} />}

      {/* Conteúdo do post — z-10 garante que fica acima das fotos */}
      <div className={cn('relative z-10', uniformHeight && 'h-full overflow-y-auto no-scrollbar')}>
        {displayText.length > 0 && (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-white">
            {displayText}
          </p>
        )}

        {/* Embed de vídeo — tem prioridade sobre imagePath */}
        {embed && <VideoEmbedPlayer embed={embed} />}

        {/* Imagem — só exibe se não houver embed */}
        {!embed && imagePath && (
          <div className="relative mt-3 flex w-full items-center justify-center overflow-hidden rounded-xl">
            <Image
              src={imagePath}
              alt="Post image"
              width={600}
              height={400}
              className="h-auto max-h-[400px] w-auto max-w-full rounded-xl object-contain"
              sizes="(max-width: 768px) 100vw, 600px"
            />
          </div>
        )}
      </div>
    </div>
  );
});
