'use client';

import { Button } from '@/components/ui/button';
import { Card, Section } from './shared';

interface AdminCacheProps {
  onClear: () => void;
}

export function AdminCache({ onClear }: AdminCacheProps) {
  return (
    <Section icon="🗄️" title="Cache Local">
      <Card>
        <p className="mb-2 text-xs text-white">
          Limpa o cache de rate limit do <strong>seu</strong> dispositivo.
          Útil para testar sem aguardar o cooldown.
        </p>
        <Button variant="secondary" onClick={onClear} className="w-full text-xs">
          🧹 Limpar cache local
        </Button>
      </Card>
    </Section>
  );
}
