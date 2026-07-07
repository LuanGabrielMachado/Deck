'use client';

import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, Section, StatusBadge } from './shared';

interface UserInfo {
  telegramId: number;
  name: string | null;
  isBanned: boolean;
  shadowBanned: boolean;
  feedMode: string;
  lastPostAt: string | null;
}

interface AdminUserModProps {
  userInput: string;
  userInfo: UserInfo | null;
  onUserInputChange: (v: string) => void;
  onLookup: () => void;
  onBan: (ban: boolean) => void;
  onShadowBan: (ban: boolean) => void;
  onResetRL: () => void;
  onSetFeedMode: (mode: 'following' | 'all') => void;
  isLookingUp: boolean;
  isBanning: boolean;
  isShadowBanning: boolean;
  isResettingRL: boolean;
  isSettingFeedMode: boolean;
}

export function AdminUserMod({
  userInput, userInfo,
  onUserInputChange, onLookup,
  onBan, onShadowBan, onResetRL, onSetFeedMode,
  isLookingUp, isBanning, isShadowBanning, isResettingRL, isSettingFeedMode,
}: AdminUserModProps) {
  return (
    <Section icon="👤" title="Moderação de Usuário">
      <Card className="space-y-3">
        <div className="flex gap-2">
          <Input
            value={userInput}
            onChange={(e) => onUserInputChange(e.target.value)}
            placeholder="Telegram ID"
            type="number"
            className="flex-1"
          />
          <Button onClick={onLookup} disabled={isLookingUp} variant="secondary" className="shrink-0">
            {isLookingUp ? <Spinner size="sm" /> : 'Buscar'}
          </Button>
        </div>

        {userInfo && (
          <div className="space-y-3 rounded-xl glass-card p-3">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{userInfo.name ?? 'Sem nome'}</p>
                <p className="text-xs text-white">ID: {userInfo.telegramId}</p>
                <p className="text-xs text-white">
                  Feed: <span className="font-semibold text-foreground">
                    {userInfo.feedMode === 'all' ? '🌍 todos' : '👥 só quem segue'}
                  </span>
                </p>
                {userInfo.lastPostAt && (
                  <p className="text-xs text-white">Último post: {userInfo.lastPostAt}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1">
                {userInfo.isBanned      && <StatusBadge ok={false} label="Banido" />}
                {userInfo.shadowBanned  && <StatusBadge ok={false} label="Shadow Ban" />}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {userInfo.isBanned ? (
                <Button onClick={() => onBan(false)} disabled={isBanning} className="text-xs">✅ Desbanir</Button>
              ) : (
                <Button onClick={() => onBan(true)} disabled={isBanning} className="text-xs bg-error hover:bg-error/90 text-white border-0">🔨 Banir</Button>
              )}

              {userInfo.shadowBanned ? (
                <Button onClick={() => onShadowBan(false)} disabled={isShadowBanning} className="text-xs">👁️ Remover Shadow</Button>
              ) : (
                <Button onClick={() => onShadowBan(true)} disabled={isShadowBanning} variant="secondary" className="text-xs">👻 Shadow Ban</Button>
              )}

              <Button onClick={onResetRL} disabled={isResettingRL} variant="secondary" className="col-span-2 text-xs">
                ⏱️ Resetar Rate Limit
              </Button>

              {userInfo.feedMode === 'all' ? (
                <Button onClick={() => onSetFeedMode('following')} disabled={isSettingFeedMode} variant="secondary" className="col-span-2 text-xs">
                  👥 Feed: só quem segue
                </Button>
              ) : (
                <Button onClick={() => onSetFeedMode('all')} disabled={isSettingFeedMode} variant="secondary" className="col-span-2 text-xs">
                  🌍 Feed: todos os posts
                </Button>
              )}
            </div>
          </div>
        )}
      </Card>
    </Section>
  );
}
