'use client';

import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, Section } from './shared';

interface AuditAction {
  id: number;
  action: string;
  createdAt: Date | string;
  targetTelegramId?: number | null;
  targetPostId?: number | null;
  previousValue?: string | null;
  newValue?: string | null;
  notes?: string | null;
}

interface AdminAuditLogProps {
  actions: AuditAction[] | undefined;
  isLoading: boolean;
  isFetching: boolean;
  onRefresh: () => void;
}

export function AdminAuditLog({ actions, isLoading, isFetching, onRefresh }: AdminAuditLogProps) {
  return (
    <Section icon="📋" title="Ações Recentes">
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-4"><Spinner /></div>
        ) : !actions || actions.length === 0 ? (
          <p className="p-4 text-center text-sm text-white">Nenhuma ação registrada</p>
        ) : (
          <ul className="divide-y divide-border">
            {actions.map((a) => (
              <li key={a.id} className="flex flex-col gap-0.5 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-foreground">{a.action}</span>
                  <span className="shrink-0 text-[10px] text-white">
                    {new Date(a.createdAt).toLocaleString('pt-BR')}
                  </span>
                </div>
                {(a.targetTelegramId ?? a.targetPostId) && (
                  <span className="text-[10px] text-white">
                    {a.targetTelegramId ? `Usuário: ${a.targetTelegramId}` : ''}
                    {a.targetPostId ? `Post #${a.targetPostId}` : ''}
                  </span>
                )}
                {(a.previousValue || a.newValue) && (
                  <span className="text-[10px] text-white">
                    {a.previousValue && `antes: ${a.previousValue}`}
                    {a.previousValue && a.newValue && ' → '}
                    {a.newValue && `depois: ${a.newValue}`}
                  </span>
                )}
                {a.notes && <span className="text-[10px] text-white italic">{a.notes}</span>}
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Button
        onClick={onRefresh}
        variant="secondary"
        disabled={isFetching}
        className="w-full text-xs rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl saturate-150 text-white hover:opacity-70 transition-opacity active:opacity-70"
      >
        {isFetching ? <Spinner size="sm" /> : '🔄 Atualizar log'}
      </Button>
    </Section>
  );
}
