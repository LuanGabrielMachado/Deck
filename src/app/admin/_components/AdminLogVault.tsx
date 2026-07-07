'use client';

import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, Section } from './shared';

type LogLevel = 'info' | 'warn' | 'error' | '';

interface LogEntry {
  id: number;
  level: string;
  context: string;
  message: string;
  meta: string | null;
  actorId: number | null;
  createdAt: Date | string;
}

interface AdminLogVaultProps {
  logs: LogEntry[] | undefined;
  level: LogLevel;
  isLoading: boolean;
  isFetching: boolean;
  onLevelChange: (level: LogLevel) => void;
  onRefresh: () => void;
}

const LEVEL_COLOR: Record<string, string> = {
  error: 'text-red-400',
  warn:  'text-yellow-300',
  info:  'text-white/50',
};

export function AdminLogVault({
  logs, level, isLoading, isFetching, onLevelChange, onRefresh,
}: AdminLogVaultProps) {
  return (
    <Section icon="🪵" title="LogVault">
      <Card>
        {/* Filtro de nível */}
        <div className="flex gap-2 flex-wrap mb-3">
          {(['', 'info', 'warn', 'error'] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => onLevelChange(lvl)}
              className={`rounded-xl px-3 py-1 text-xs font-semibold transition-colors ${
                level === lvl
                  ? 'bg-white/30 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {lvl === '' ? 'Todos' : lvl.toUpperCase()}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-4"><Spinner /></div>
        ) : !logs || logs.length === 0 ? (
          <p className="text-center text-xs text-white/60 py-4">Nenhum log encontrado</p>
        ) : (
          <div className="space-y-1.5 max-h-[400px] overflow-y-auto no-scrollbar">
            {logs.map((entry) => {
              const color = LEVEL_COLOR[entry.level] ?? 'text-white/50';
              const meta = entry.meta
                ? (() => { try { return JSON.parse(entry.meta); } catch { return null; } })()
                : null;
              return (
                <div key={entry.id} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-bold uppercase ${color}`}>{entry.level}</span>
                    <span className="text-white/40 font-mono">[{entry.context}]</span>
                    <span className="ml-auto text-white/30 tabular-nums">
                      {new Date(entry.createdAt).toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-white/80">{entry.message}</p>
                  {entry.actorId && (
                    <p className="text-white/30 mt-0.5 text-[10px]">actor: {entry.actorId}</p>
                  )}
                  {meta && (
                    <pre className="text-white/30 mt-0.5 text-[10px] overflow-x-auto whitespace-pre-wrap break-all">
                      {JSON.stringify(meta, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Button
        variant="secondary"
        onClick={onRefresh}
        disabled={isFetching}
        className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl saturate-150 text-white hover:opacity-70 transition-opacity active:opacity-70"
      >
        {isFetching ? <Spinner size="sm" /> : '🔄 Carregar logs'}
      </Button>
    </Section>
  );
}
