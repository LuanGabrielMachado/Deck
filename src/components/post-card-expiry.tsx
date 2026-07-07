'use client';

import { memo, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface PostCardExpiryProps {
  createdAt: Date | string;
  className?: string;
}

export const PostCardExpiry = memo(function PostCardExpiry({
  createdAt,
  className,
}: PostCardExpiryProps) {
  const [expiryText, setExpiryText] = useState('');

  useEffect(() => {
    const createdDate = typeof createdAt === 'string' ? new Date(createdAt) : createdAt;
    const expiresAt = createdDate.getTime() + 7 * 24 * 60 * 60 * 1000;

    const update = () => {
      const remaining = expiresAt - Date.now();
      if (remaining <= 0) {
        setExpiryText('expirando...');
        return;
      }
      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const mins = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      if (days > 0) {
        setExpiryText(`${days} dia${days > 1 ? 's' : ''} restante${days > 1 ? 's' : ''}`);
      } else {
        setExpiryText(`${hours}h ${mins}m restantes`);
      }
    };

    update();

    // Tick a cada hora quando sobram dias; a cada minuto nas últimas 24h
    const hoursLeft = (expiresAt - Date.now()) / (60 * 60 * 1000);
    const interval = hoursLeft <= 24 ? 60_000 : 3_600_000;
    const timer = setInterval(update, interval);
    return () => clearInterval(timer);
  }, [createdAt]);

  return (
    <div className={cn('flex justify-end pb-1', className)}>
      <span className="text-[10px] text-shadow-dark" style={{ color: '#ffffff' }}>{expiryText}</span>
    </div>
  );
});
