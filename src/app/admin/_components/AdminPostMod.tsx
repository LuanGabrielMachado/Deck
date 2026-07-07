'use client';

import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, Section } from './shared';

interface AdminPostModProps {
  postInput: string;
  onPostInputChange: (v: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
}

export function AdminPostMod({ postInput, onPostInputChange, onDelete, isDeleting }: AdminPostModProps) {
  return (
    <Section icon="📝" title="Moderação de Post">
      <Card>
        <div className="flex gap-2">
          <Input
            value={postInput}
            onChange={(e) => onPostInputChange(e.target.value)}
            placeholder="ID do post"
            type="number"
            className="flex-1"
          />
          <Button
            onClick={onDelete}
            disabled={isDeleting}
            className="shrink-0 bg-error hover:bg-error/90 text-white border-0"
          >
            {isDeleting ? <Spinner size="sm" /> : '🗑️ Deletar'}
          </Button>
        </div>
      </Card>
    </Section>
  );
}
