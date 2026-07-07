'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Home, PenSquare, UserPlus, User } from 'lucide-react';
import { useTabBar } from '@/lib/tab-bar-context';
import { useTabPrefetch } from '@/hooks/use-tab-prefetch';

const tabs = [
  { name: '/',        icon: Home,      label: 'Início' },
  { name: '/create',  icon: PenSquare, label: 'Novo' },
  { name: '/follow',  icon: UserPlus,  label: 'Seguir' },
  { name: '/profile', icon: User,      label: 'Perfil' },
];

export function FloatingTabBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const { activeTab, setActiveTab } = useTabBar();
  const { prefetchRoute } = useTabPrefetch();
  const [mounted, setMounted] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  // ── Detectar teclado virtual ──────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getVH = () => window.visualViewport
      ? window.visualViewport.height + window.visualViewport.offsetTop
      : window.innerHeight;

    let baseHeight = getVH();

    const handleViewportChange = () => {
      setKeyboardOffset(Math.max(0, baseHeight - getVH()));
    };

    const handleOrientationChange = () => {
      baseHeight = getVH();
      setKeyboardOffset(0);
    };

    window.visualViewport?.addEventListener('resize', handleViewportChange);
    window.visualViewport?.addEventListener('scroll', handleViewportChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportChange);
      window.visualViewport?.removeEventListener('scroll', handleViewportChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // ── Sincroniza aba ativa com pathname ─────────────────────────────────────
  useEffect(() => {
    if (pathname) setActiveTab(pathname);
  }, [pathname, setActiveTab]);

  // ── Pré-fetch de rotas no Next.js ─────────────────────────────────────────
  useEffect(() => {
    tabs.forEach((tab) => router.prefetch(tab.name));
  }, [router]);

  const handleTabClick = useCallback((tabName: string) => {
    if (!pathname || pathname === tabName) return;
    prefetchRoute(tabName);
    setActiveTab(tabName);
    router.push(tabName);
  }, [pathname, prefetchRoute, setActiveTab, router]);

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center"
      style={{
        transform: keyboardOffset > 0 ? `translateY(${keyboardOffset}px)` : 'translateY(0)',
        willChange: 'transform',
      }}
    >
      <div
        className="flex w-[340px] items-center justify-around rounded-[40px] border border-white/20 bg-white/10 px-6 py-[12px] backdrop-blur-xl saturate-150 tab-bar-breathe"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)' }}
      >
        {tabs.map((tab) => {
          const Icon   = tab.icon;
          const active = activeTab === tab.name;

          return (
            <button
              key={tab.name}
              type="button"
              onClick={() => handleTabClick(tab.name)}
              className="relative flex items-center justify-center"
              style={{ touchAction: 'manipulation', minHeight: 52, minWidth: 52, padding: '8px 12px' }}
              aria-label={tab.label}
            >
              {/* Bolha indicadora — anima via CSS puro */}
              <span
                className="pointer-events-none absolute inset-0 rounded-full bg-white/80"
                style={{
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  opacity:   active ? 1 : 0,
                  transform: active ? 'scale(1)' : 'scale(0.5)',
                  transition: 'opacity 0.2s ease-out, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
              />
              <Icon
                className="pointer-events-none relative z-10"
                size={24}
                strokeWidth={2}
                style={{
                  color: active ? 'var(--color-primary)' : '#ffffff',
                  transition: 'color 0.2s ease-out',
                }}
              />
            </button>
          );
        })}
      </div>
    </div>,
    document.body
  );
}
