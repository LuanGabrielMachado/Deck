'use client';

/**
 * PostMentionParticles — fotos flutuantes dos usuários mencionados.
 *
 * Usa o mesmo motor de física (usePhysicsParticles) das reações:
 * - Movimento eterno via thermal noise
 * - Giroscópio integrado (useDeviceMotion)
 * - Repulsão entre partículas
 * - Confinado ao container pai (absolute inset-0, pointer-events-none)
 * - 85% de opacidade — decorativo, não interativo
 */

import { memo, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { usePhysicsParticles } from '@/hooks/use-physics-particles';
import { useDeviceMotion } from '@/hooks/use-device-motion';

export interface MentionParticleUser {
  telegramId: number;
  name: string | null;
  photoUrl: string | null;
}

interface PostMentionParticlesProps {
  mentionedUsers: MentionParticleUser[];
}

export const PostMentionParticles = memo(function PostMentionParticles({
  mentionedUsers,
}: PostMentionParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const particleRefs = useRef<(HTMLElement | null)[]>([]);

  const deviceMotion = useDeviceMotion();

  // Mesmos parâmetros das reações — comportamento consistente
  usePhysicsParticles(mentionedUsers.length, containerRef, particleRefs, {
    collisionRadius: 12, // avatar 24px → raio 12
    repulsionStrength: 1.2,
    maxSpeed: 1.4,
    damping: 0.990,
    noiseStrength: 0.018,
    externalForceRef: deviceMotion,
  });

  // Estabiliza os setters de ref (não recria por render)
  const setParticleRef = useMemo(
    () =>
      mentionedUsers.map(
        (_, i) =>
          (el: HTMLDivElement | null) => {
            particleRefs.current[i] = el;
          }
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mentionedUsers.length]
  );

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    >
      {mentionedUsers.map((user, index) => {
        const avatarUrl =
          user.photoUrl ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&size=64&background=0a7ea4&color=fff`;

        return (
          <motion.div
            key={user.telegramId}
            ref={setParticleRef[index]}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.85, scale: 1 }}
            transition={{
              delay: index * 0.06,
              duration: 0.45,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="absolute"
            style={{ transform: 'translate(-50%, -50%)' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrl}
              alt={user.name || 'Usuário'}
              className="h-6 w-6 rounded-full object-cover ring-1 ring-white/30 shadow-md"
              draggable={false}
            />
          </motion.div>
        );
      })}
    </div>
  );
});
