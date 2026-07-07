'use client';

import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, Section } from './shared';

interface BroadcastPost {
  id: number;
  content: string;
  createdAt: Date;
}

interface AdminBroadcastProps {
  text: string;
  onTextChange: (v: string) => void;
  broadcasts: BroadcastPost[] | undefined;
  isLoadingBroadcasts: boolean;
  isDeleting: boolean;
  onLoadBroadcasts: () => void;
  onDelete: (postId: number) => void;
}

export function AdminBroadcast({
  text, onTextChange,
  broadcasts, isLoadingBroadcasts,
  isDeleting,
  onLoadBroadcasts, onDelete,
}: AdminBroadcastProps) {
  return (
    <Section icon="📢" title="Broadcast">
      <Card>
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value.slice(0, 999))}
          placeholder="Aviso, changelog, comunicado... (máx. 999 caracteres)"
          rows={4}
          className="w-full resize-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/50 shadow-lg backdrop-blur-xl focus:outline-none focus:border-white/30 transition-colors"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-white/40">{text.length}/999</span>
        </div>
      </Card>

      <Button
        variant="secondary"
        onClick={onLoadBroadcasts}
        disabled={isLoadingBroadcasts}
        className="w-full rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl saturate-150 text-white hover:opacity-70 transition-opacity active:opacity-70"
      >
        {isLoadingBroadcasts ? <Spinner size="sm" /> : '📋 Ver broadcasts publicados'}
      </Button>

      {broadcasts && broadcasts.length > 0 && (
        <Card>
          <div className="space-y-1.5">
            {broadcasts.map((p) => (
              <div key={p.id} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                <p className="flex-1 text-xs text-white/80 line-clamp-1">{p.content}</p>
                <button
                  type="button"
                  onClick={() => onDelete(p.id)}
                  disabled={isDeleting}
                  className="shrink-0 text-error/70 hover:text-error text-sm font-bold transition-colors px-1"
                  aria-label="Excluir broadcast"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </Section>
  );
}
