import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { TRPCProvider } from '@/lib/trpc';
import { ThemeProvider } from '@/lib/theme-provider';
import { TabBarProvider } from '@/lib/tab-bar-context';
import { FloatingTabBar } from '@/components/floating-tab-bar';
import { AssetPreloader } from '@/components/asset-preloader';
import { BiometricGate } from '@/components/biometric-gate';
import { DesktopGate } from '@/components/desktop-gate';
import { TelegramAnalyticsProvider } from '@/components/telegram-analytics-provider';

export const metadata: Metadata = {
  title: 'Maracutáia - Telegram Mini App',
  description: 'Compartilhe suas maracutáias com seus amigos',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Maracutáia',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Maracutáia',
    description: 'Compartilhe suas maracutáias com seus amigos',
    siteName: 'Maracutáia',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/* Meta tags para Telegram */}
        <meta name="telegram:card" content="summary_large_image" />
        <meta name="telegram:title" content="Maracutáia" />
        <meta name="telegram:description" content="Compartilhe suas maracutáias" />
      </head>
      <body className="antialiased font-sans" suppressHydrationWarning>
        {/* Fundo global — evita flash branco entre trocas de rota */}
        <div id="global-bg" />

        {/* Telegram WebApp SDK — carrega antes de qualquer coisa */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />

        {/* Telegram Analytics SDK — carrega assíncrono, inicializado pelo TelegramAnalyticsProvider */}
        <Script
          src="https://tganalytics.xyz/index.js"
          strategy="afterInteractive"
          id="tg-analytics-sdk"
        />

        <TRPCProvider>
          <DesktopGate>
            <TabBarProvider>
              <ThemeProvider>
                <AssetPreloader />
                <TelegramAnalyticsProvider />
                <BiometricGate>
                  {children}
                </BiometricGate>
                <FloatingTabBar />
              </ThemeProvider>
            </TabBarProvider>
          </DesktopGate>
        </TRPCProvider>
      </body>
    </html>
  );
}
