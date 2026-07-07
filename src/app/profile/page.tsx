'use client';

import { useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { usePageBackground } from '@/hooks/use-page-background';
import { useProfileData } from '@/hooks/use-profile-data';
import { ProfileBubbles } from '@/components/profile-bubbles';
import { Spinner } from '@/components/ui/spinner';
import { useBiometricLock } from '@/hooks/use-biometric-lock';
import { trpc } from '@/lib/trpc';
import {
  showTelegramPopup as showPopup,
  closeTelegramApp as closeApp,
  isTelegramWebView,
  hapticSelection,
  hapticNotification,
  biometricOpenSettings,
} from '@/lib/telegram-utils';

export default function ProfilePage() {
  const router = useRouter();
  const { user: authUser, isAdmin, isModerator, isLoading: isAuthLoading } = useAuth();
  const lastTapRef = useRef<number>(0);
  const bg = usePageBackground('perfil');

  const {
    followingQuery,
    unfollowMutation,
    setNotificationsMutation,
    userData,
    postCount,
    notificationsEnabled,
  } = useProfileData(authUser?.id);

  const {
    biometricType,
    isEnabled: biometricEnabled,
    isUnavailable: biometricUnavailable,
    enableBiometricLock,
    disableBiometricLock,
    authenticate,
  } = useBiometricLock();

  const exportDataMutation = trpc.users.exportData.useMutation({
    onSuccess: () => {
      hapticNotification('success');
      showPopup({
        message: '📦 Arquivo enviado!\n\nVerifique sua conversa com o bot do Maracutáia.',
        buttons: [{ type: 'ok', text: 'Ok' }],
      });
    },
    onError: (e) => {
      hapticNotification('error');
      showPopup({
        message: e.message || 'Erro ao exportar dados. Tente novamente.',
        buttons: [{ type: 'ok', text: 'Ok' }],
      });
    },
  });

  const handleExportData = useCallback(() => {
    if (exportDataMutation.isPending) return;
    if (isTelegramWebView()) hapticSelection();
    showPopup({
      message: 'Exportar seus dados?\n\nVamos te enviar um arquivo .txt com tudo que armazenamos sobre você, direto pelo bot.',
      buttons: [
        { id: 'confirm', type: 'ok',     text: 'Exportar' },
        { id: 'cancel',  type: 'cancel', text: 'Cancelar' },
      ],
    }, (btn) => {
      if (btn === 'confirm') exportDataMutation.mutate();
    });
  }, [exportDataMutation]);

  const deleteAccountMutation = trpc.users.deleteAccount.useMutation({
    onSuccess: () => {
      hapticNotification('success');
      // Redireciona para o Google — sai do app após exclusão
      window.location.href = 'https://www.google.com';
    },
    onError: (e) => {
      hapticNotification('error');
      showPopup({
        message: e.message || 'Erro ao excluir conta. Tente novamente.',
        buttons: [{ type: 'ok', text: 'Ok' }],
      });
    },
  });

  const handleDeleteAccount = useCallback(() => {
    if (deleteAccountMutation.isPending) return;
    if (isTelegramWebView()) hapticSelection();

    // Popup 1 — aviso claro
    showPopup({
      title: 'Excluir conta',
      message: 'Isso apaga TUDO: posts, respostas, reações, histórico e seus dados.\n\nEssa ação é permanente e não pode ser desfeita.',
      buttons: [
        { id: 'cancel',  type: 'cancel',     text: 'Cancelar' },
        { id: 'confirm', type: 'destructive', text: 'Continuar' },
      ],
    }, (btn1) => {
      if (btn1 !== 'confirm') return;

      // Popup 2 — confirmação final, sempre obrigatório
      setTimeout(() => {
        showPopup({
          title: 'Tem certeza mesmo?',
          message: 'Não tem volta. Sua conta, posts e todos os dados serão apagados para sempre.',
          buttons: [
            { id: 'cancel',  type: 'cancel',     text: 'Não, voltar' },
            { id: 'confirm', type: 'destructive', text: 'Sim, excluir tudo' },
          ],
        }, (btn2) => {
          if (btn2 !== 'confirm') return;

          // Biometria como terceira camada — se ativa
          if (biometricEnabled) {
            setTimeout(() => {
              authenticate().then((confirmed) => {
                if (!confirmed) return;
                deleteAccountMutation.mutate();
              });
            }, 300);
            return;
          }

          deleteAccountMutation.mutate();
        });
      }, 300);
    });
  }, [deleteAccountMutation, biometricEnabled, authenticate]);

  const handleBiometricToggle = useCallback(async () => {
    if (!isTelegramWebView()) return;
    hapticSelection();

    if (biometricUnavailable) {
      showPopup({
        message: 'Biometria não disponível neste dispositivo.',
        buttons: [{ type: 'ok', text: 'Ok' }],
      });
      return;
    }

    if (!biometricEnabled) {
      // Lock não configurado — ativar
      const ok = await enableBiometricLock();
      if (ok) {
        hapticNotification('success');
      } else {
        showPopup({
          message: 'Não foi possível ativar a biometria. Verifique as permissões.',
          buttons: [
            { id: 'settings', type: 'default', text: 'Abrir config' },
            { id: 'cancel',   type: 'cancel',  text: 'Cancelar' },
          ],
        }, (btn) => { if (btn === 'settings') biometricOpenSettings(); });
      }
    } else {
      // Lock ativo — confirmar desativação
      showPopup({
        message: 'Desativar o lock biométrico?',
        buttons: [
          { id: 'disable', type: 'destructive', text: 'Desativar' },
          { id: 'cancel',  type: 'cancel',      text: 'Cancelar' },
        ],
      }, async (btn) => {
        if (btn === 'disable') {
          await disableBiometricLock();
          hapticNotification('success');
        }
      });
    }
  }, [biometricEnabled, biometricUnavailable, enableBiometricLock, disableBiometricLock]);

  // Pré-carrega a foto do perfil assim que disponível
  useEffect(() => {
    const url = authUser?.photo_url;
    if (!url) return;
    const img = new window.Image();
    img.src = url;
  }, [authUser?.photo_url]);

  const userName  = userData.fullName;
  const avatarUrl = userData.photoUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&size=300&background=random`;

  const handleUnfollow = useCallback((followingUserId: number, followingUserName: string) => {
    if (isTelegramWebView()) hapticSelection();
    showPopup(
      {
        message: `Deixar de seguir ${followingUserName}?`,
        buttons: [
          { id: 'no',  type: 'cancel',      text: 'Não' },
          { id: 'yes', type: 'destructive',  text: 'Sim' },
        ],
      },
      (buttonId) => {
        if (buttonId === 'yes' && authUser) {
          unfollowMutation.mutate({ followerId: authUser.id, followingId: followingUserId });
        }
      }
    );
  }, [authUser, unfollowMutation]);

  const handleAvatarTap = useCallback(() => {
    if (!isAdmin && !isModerator) return;
    const now = Date.now();
    if (now - lastTapRef.current < 400) {
      router.push('/admin');
      lastTapRef.current = 0;
    } else {
      lastTapRef.current = now;
    }
  }, [isAdmin, isModerator, router]);

  const handleViewAllPosts = useCallback(() => {
    if (authUser) router.push(`/user/${authUser.id}`);
  }, [authUser, router]);

  const handleToggleNotifications = useCallback(() => {
    if (isTelegramWebView()) hapticSelection();
    setNotificationsMutation.mutate({ enabled: !notificationsEnabled });
  }, [setNotificationsMutation, notificationsEnabled]);

  const Background = () => (
    <div
      className="fixed inset-0 -z-10 bg-cover bg-center"
      style={{ backgroundImage: `url(${bg})`, backgroundAttachment: 'fixed' }}
    />
  );

  if (isAuthLoading) {
    return (
      <>
        <Background />
        <div className="flex min-h-screen items-center justify-center">
          <Spinner size="lg" />
        </div>
      </>
    );
  }

  if (!authUser) {
    return (
      <>
        <Background />
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-foreground">Faz login pra threadr também, baixa o Telegram!</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Background />
      <div className="min-h-screen pt-14">
        <div className="flex-1 overflow-y-auto p-6 pb-32">

          {/* ── Cabeçalho do perfil ─────────────────────────────────── */}
          <motion.div
            className="mb-3 flex flex-col items-center"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              className="relative mb-6 h-[230px] w-[230px] overflow-hidden rounded-full border border-white/50 shadow-md profile-bubble-float"
              onClick={handleAvatarTap}
              style={{
                ['--float-x' as string]: '3px',
                ['--float-y' as string]: '-4px',
                ['--float-duration' as string]: '7s',
                ['--float-delay' as string]: '0s',
              }}
            >
              <Image src={avatarUrl} alt={userName} fill className="object-cover" priority />
            </div>

            <div className="mb-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl saturate-150">
              <h1 className="text-center text-4xl font-bold text-white text-shadow-dark">{userName}</h1>
            </div>

            {/* Contador + Ver todos */}
            <div className="mb-3 flex items-center justify-center gap-2">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl saturate-150 flex items-center">
                <p className="text-lg font-bold text-white whitespace-nowrap">
                  {postCount} {postCount === 1 ? 'Post' : 'Posts'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleViewAllPosts}
                className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl saturate-150 text-lg font-bold text-white hover:opacity-70 transition-opacity flex items-center"
              >
                Ver todos
              </button>
            </div>

            {/* Notificações + Biometria — linha própria, centralizada */}
            <div className="mb-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleToggleNotifications}
                disabled={setNotificationsMutation.isPending}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-0 backdrop-blur-xl saturate-150 text-lg font-bold text-white hover:opacity-70 transition-opacity active:opacity-70 disabled:pointer-events-none disabled:opacity-50"
                title={notificationsEnabled ? 'Notificações ativas' : 'Notificações desativadas'}
              >
                <span
                  className="text-xl transition-all duration-300 ease-in-out"
                  style={{ transform: notificationsEnabled ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-15deg)' }}
                >
                  {notificationsEnabled ? '🔔' : '🔕'}
                </span>
              </button>

              {/* Biometric lock — só exibe se Telegram WebView e biometria não indisponível */}
              {isTelegramWebView() && !biometricUnavailable && (
                <button
                  type="button"
                  onClick={handleBiometricToggle}
                  className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-0 backdrop-blur-xl saturate-150 text-lg font-bold text-white hover:opacity-70 transition-opacity active:opacity-70"
                  title={biometricEnabled ? 'Lock biométrico ativo — toque para desativar' : 'Ativar lock biométrico'}
                >
                  <span className="text-xl transition-all duration-300 ease-in-out"
                    style={{ transform: biometricEnabled ? 'scale(1)' : 'scale(0.85)' }}
                  >
                    {biometricEnabled
                      ? (biometricType === 'face' ? '🫧' : '🔒')
                      : '🔓'}
                  </span>
                </button>
              )}

              {/* Exportar dados (LGPD) */}
              <button
                type="button"
                onClick={handleExportData}
                disabled={exportDataMutation.isPending}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-0 backdrop-blur-xl saturate-150 text-lg font-bold text-white hover:opacity-70 transition-opacity active:opacity-70 disabled:opacity-50 disabled:pointer-events-none"
                title="Exportar meus dados"
              >
                <span className="text-xl transition-all duration-300 ease-in-out"
                  style={{ transform: exportDataMutation.isPending ? 'scale(0.85)' : 'scale(1)' }}
                >
                  {exportDataMutation.isPending ? '⏳' : '📦'}
                </span>
              </button>

              {/* Excluir conta (LGPD) */}
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                className="flex h-10 w-10 items-center justify-center rounded-2xl border border-error/40 bg-error/10 p-0 backdrop-blur-xl saturate-150 text-lg font-bold text-white hover:opacity-70 transition-opacity active:opacity-70 disabled:opacity-50 disabled:pointer-events-none"
                title="Excluir minha conta"
              >
                <span className="text-xl transition-all duration-300 ease-in-out"
                  style={{ transform: deleteAccountMutation.isPending ? 'scale(0.85)' : 'scale(1)' }}
                >
                  {deleteAccountMutation.isPending ? '⏳' : '🗑️'}
                </span>
              </button>
            </div>
          </motion.div>

          {/* ── Seção Seguindo ──────────────────────────────────────── */}
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="mb-4 flex justify-center">
              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-xl saturate-150">
                <h2 className="text-center text-2xl font-bold text-white text-shadow-dark">Seguindo</h2>
              </div>
            </div>

            <ProfileBubbles
              users={followingQuery.data ?? []}
              isLoading={followingQuery.isLoading}
              isPending={unfollowMutation.isPending}
              onUnfollow={handleUnfollow}
            />
          </motion.div>

          {/* ── Sair ───────────────────────────────────────────────── */}
          <button
            onClick={() => showPopup(
              {
                message: 'Quer ir? Porta tá aberta',
                buttons: [
                  { id: 'cancel',  type: 'cancel', text: 'Cancelar' },
                  { id: 'confirm', type: 'ok',      text: 'Sair' },
                ],
              },
              (buttonId) => { if (buttonId === 'confirm') closeApp(); }
            )}
            className="w-full rounded-2xl border border-white/20 bg-white/10 px-6 py-3 text-base font-semibold text-white backdrop-blur-xl saturate-150 transition-opacity active:opacity-70"
          >
            Sair do aplicativo
          </button>

        </div>
      </div>
    </>
  );
}
