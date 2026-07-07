'use client';

import { Spinner } from '@/components/ui/spinner';
import { Card, Section, FlagToggle } from './shared';

interface FlagData { key: string; value: string; }

interface AdminFlagsProps {
  flags: FlagData[] | undefined;
  isLoading: boolean;
  isMutating: boolean;
  onToggleFlag: (key: string, value: boolean) => void;
  onToggleFeedGlobal: (key: string, value: boolean) => void;
}

export function AdminFlags({
  flags, isLoading, isMutating, onToggleFlag, onToggleFeedGlobal,
}: AdminFlagsProps) {
  const get = (key: string) => flags?.find(f => f.key === key)?.value === 'true';
  const maintenanceOn = get('maintenance_mode');
  const pauseUsersOn  = get('pause_new_users');
  const lockPostsOn   = get('lock_posts_global');
  const feedGlobalOn  = flags?.find(f => f.key === 'feed_mode_global')?.value === 'all';

  return (
    <Section icon="🚦" title="Flags Globais">
      <Card className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-2"><Spinner /></div>
        ) : (
          <>
            <FlagToggle label="🔧 Modo Manutenção"           flagKey="maintenance_mode"  value={maintenanceOn} onToggle={onToggleFlag}       isLoading={isMutating} />
            <FlagToggle label="🚫 Pausar Novos Usuários"     flagKey="pause_new_users"   value={pauseUsersOn}  onToggle={onToggleFlag}       isLoading={isMutating} />
            <FlagToggle label={`🌐 Feed Global — ${feedGlobalOn ? 'Todos' : 'Seguindo'}`} flagKey="feed_mode_global" value={feedGlobalOn} onToggle={onToggleFeedGlobal} isLoading={isMutating} />
            <FlagToggle label="🔒 Bloquear Posts e Respostas" flagKey="lock_posts_global" value={lockPostsOn}   onToggle={onToggleFlag}       isLoading={isMutating} />
          </>
        )}
      </Card>
      {(maintenanceOn || pauseUsersOn || feedGlobalOn || lockPostsOn) && (
        <p className="rounded-xl border border-error/30 bg-error/10 px-3 py-2 text-xs text-error backdrop-blur-md">
          ⚠️ Atenção: {[
            maintenanceOn && 'modo manutenção ativo',
            pauseUsersOn  && 'novos usuários pausados',
            feedGlobalOn  && 'feed global: todos ativo',
            lockPostsOn   && 'posts e respostas bloqueados',
          ].filter(Boolean).join(' · ')}
        </p>
      )}
    </Section>
  );
}
