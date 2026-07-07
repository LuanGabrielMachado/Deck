'use client';

import { Spinner } from '@/components/ui/spinner';
import { Card, Section } from './shared';

interface Stats {
  postsToday: number;
  totalUsers: number;
  bannedUsers: number;
}

interface AdminStatsProps {
  stats: Stats | undefined;
  isLoading: boolean;
}

export function AdminStats({ stats, isLoading }: AdminStatsProps) {
  return (
    <Section icon="📊" title="Estatísticas">
      <Card>
        {isLoading ? (
          <div className="flex justify-center py-2"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-3 divide-x divide-border">
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-2xl font-bold text-foreground">{stats?.postsToday ?? '—'}</span>
              <span className="text-center text-[10px] text-white">Posts hoje</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-2xl font-bold text-foreground">{stats?.totalUsers ?? '—'}</span>
              <span className="text-center text-[10px] text-white">Usuários</span>
            </div>
            <div className="flex flex-col items-center gap-0.5 px-2">
              <span className="text-2xl font-bold text-error">{stats?.bannedUsers ?? '—'}</span>
              <span className="text-center text-[10px] text-white">Banidos</span>
            </div>
          </div>
        )}
      </Card>
    </Section>
  );
}
