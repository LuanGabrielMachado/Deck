'use client';

/**
 * DesktopGate — bloqueia acesso fora do Telegram (browser puro).
 *
 * Permite: Telegram mobile (Android/iOS) e Telegram Desktop (tdesktop/weba/webk)
 * Bloqueia: qualquer browser sem window.Telegram.WebApp
 *
 * Estratégia:
 * - Renderiza children por padrão (sem flash/tela branca)
 * - Após mount + pequeno delay (SDK precisa de 1 frame para inicializar),
 *   verifica se está no Telegram. Se não estiver, substitui pelo gate.
 */

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { IMAGES } from '@/constants/images';

const BOT_LINK = 'https://t.me/vempradeckbot';
const QR_URL   = `https://chart.googleapis.com/chart?cht=qr&chs=220x220&chl=${encodeURIComponent(BOT_LINK)}&choe=UTF-8&chld=M|2`;

export function DesktopGate({ children }: { children: React.ReactNode }) {
  // Começa false — renderiza children por padrão, sem tela branca
  const [showGate, setShowGate] = useState(false);

  useEffect(() => {
    const check = () => {
      const isLargeScreen = window.innerWidth > 600;
      setShowGate(isLargeScreen);
    };

    const timer = setTimeout(check, 150);
    window.addEventListener('resize', check);
    return () => { clearTimeout(timer); window.removeEventListener('resize', check); };
  }, []);

  if (!showGate) return <>{children}</>;

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background landscape horizontal */}
      <div className="absolute inset-0">
        <Image
          src={IMAGES.bgArtistic}
          alt=""
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Conteúdo centralizado */}
      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-8 px-8">

        <div className="text-center">
          <h1 className="text-4xl font-bold text-white text-shadow-dark tracking-tight">
            Maracutáia
          </h1>
          <p className="mt-2 text-lg text-white/80 text-shadow-dark">
            é coisa de celular 📱
          </p>
        </div>

        {/* Card glassmorphism com QR code */}
        <div className="flex flex-col items-center gap-4 rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-2xl saturate-150 shadow-2xl">
          {/* QR code — fundo branco para escaneamento */}
          <div className="rounded-2xl overflow-hidden border border-white/30 bg-white p-3 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={QR_URL}
              alt="QR Code para abrir no Telegram"
              width={200}
              height={200}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-white/70 text-shadow-dark">
              Abra no Telegram
            </p>
            <a
              href={BOT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-base font-semibold text-white text-shadow-dark hover:opacity-80 transition-opacity"
            >
              t.me/vempradeckbot
            </a>
          </div>
        </div>

        <p className="text-center text-sm text-white/60 text-shadow-dark max-w-xs">
          Thread boa só funciona no bolso 💅
        </p>

      </div>
    </div>
  );
}
