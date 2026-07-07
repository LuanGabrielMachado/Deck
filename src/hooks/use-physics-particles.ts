/**
 * Hook de física para partículas com bounce nas bordas, repulsão entre si
 * e movimento eterno via thermal noise (força aleatória suave por frame).
 *
 * Cada partícula tem posição (x, y) e velocidade (vx, vy) em pixels.
 * O loop roda com requestAnimationFrame e atualiza as posições via ref,
 * escrevendo diretamente no DOM para evitar re-renders do React.
 *
 * Thermal noise: se a velocidade cair abaixo de minSpeed, uma força
 * aleatória suave é injetada — movimento gracioso e eterno.
 *
 * externalForceRef (opcional): ref com { fx, fy } lida a cada frame.
 * Permite giroscópio ou qualquer força externa sem re-criar o loop.
 * A força é aplicada como nudge suave — não substitui o thermal noise.
 */

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;   // px, relativo ao container
  y: number;
  vx: number;  // px/frame
  vy: number;
  noiseSeed: number; // semente pessoal para noise determinístico
}

export interface ExternalForce {
  fx: number;
  fy: number;
}

export interface ObstacleRect {
  x: number; y: number; w: number; h: number;
}

interface PhysicsOptions {
  /** Raio de colisão entre partículas (px) */
  collisionRadius?: number;
  /** Força de repulsão entre partículas */
  repulsionStrength?: number;
  /** Velocidade máxima (px/frame) */
  maxSpeed?: number;
  /** Amortecimento por frame (0–1, próximo de 1 = muito lento) */
  damping?: number;
  /** Velocidade mínima — abaixo disso injeta thermal noise */
  minSpeed?: number;
  /** Intensidade do thermal noise (força suave por frame) */
  noiseStrength?: number;
  /**
   * Ref com força externa { fx, fy } lida a cada frame.
   * Valores tipicamente muito pequenos (0.001–0.005).
   * Não causa re-criação do loop quando a ref muda de valor.
   */
  externalForceRef?: React.RefObject<ExternalForce>;
  /**
   * Zonas retangulares de exclusão — partículas ricocheteiam nelas.
   * Coordenadas relativas ao container. Ref para não re-criar o loop.
   */
  obstaclesRef?: React.RefObject<ObstacleRect[]>;
}

// Sequência de Halton para posição inicial quasi-aleatória
function halton(index: number, base: number): number {
  let f = 1; let r = 0; let i = index;
  while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
  return r;
}

// Ruído suave baseado em seno — determinístico por semente, varia com o tempo
function smoothNoise(seed: number, t: number): number {
  return Math.sin(seed * 127.1 + t * 0.018) * Math.cos(seed * 311.7 + t * 0.011);
}

export function usePhysicsParticles(
  count: number,
  containerRef: React.RefObject<HTMLElement | null>,
  particleRefs: React.RefObject<(HTMLElement | null)[]>,
  options: PhysicsOptions = {},
) {
  const {
    collisionRadius = 14,
    repulsionStrength = 1.4,
    maxSpeed = 1.2,
    damping = 0.994,
    minSpeed = 0.08,
    noiseStrength = 0.012,
    externalForceRef,
    obstaclesRef,
  } = options;

  const particles = useRef<Particle[]>([]);
  const rafRef = useRef<number | null>(null);
  const frameRef = useRef(0);

  const init = useCallback((w: number, h: number) => {
    particles.current = Array.from({ length: count }, (_, i) => {
      const margin = collisionRadius + 4;
      const x = margin + halton(i + 1, 2) * (w - margin * 2);
      const y = margin + halton(i + 1, 3) * (h - margin * 2);
      const angle = (i / count) * Math.PI * 2 + halton(i + 1, 5) * 1.2;
      const speed = 0.3 + halton(i + 1, 7) * 0.5;
      return {
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        noiseSeed: halton(i + 1, 11) * 100,
      };
    });
  }, [count, collisionRadius]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || count === 0) return;
    const rect = container.getBoundingClientRect();
    const w = rect.width || container.offsetWidth;
    const h = rect.height || container.offsetHeight;
    if (w === 0 || h === 0) return;

    init(w, h);
    frameRef.current = 0;

    const margin = collisionRadius + 2;

    const tick = () => {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      const pts = particles.current;
      const t = frameRef.current++;

      // Lê intensidade do movimento do giroscópio — sem direção, só magnitude
      const extFx = externalForceRef?.current?.fx ?? 0;
      const extFy = externalForceRef?.current?.fy ?? 0;
      // Magnitude total do movimento do celular (0 a MAX_FORCE)
      const shakeEnergy = Math.sqrt(extFx * extFx + extFy * extFy);

      // ── Repulsão entre partículas ──────────────────────────
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[j].x - pts[i].x;
          const dy = pts[j].y - pts[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
          if (dist < collisionRadius * 2) {
            const force = (repulsionStrength * (collisionRadius * 2 - dist)) / dist;
            const fx = dx * force;
            const fy = dy * force;
            pts[i].vx -= fx;
            pts[i].vy -= fy;
            pts[j].vx += fx;
            pts[j].vy += fy;
          }
        }
      }

      // ── Atualizar posição + bounce + thermal noise ─────────
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];

        // Damping adaptativo: dissipa mais rápido quando há energia do giroscópio
        // Isso garante que o agito some logo e volta ao movimento suave
        const adaptiveDamping = shakeEnergy > 0.002 ? damping * 0.97 : damping;
        p.vx *= adaptiveDamping;
        p.vy *= adaptiveDamping;

        // Giroscópio como energia: cada partícula recebe impulso em direção única
        // A direção é determinística por semente — sempre a mesma por partícula,
        // mas diferente entre partículas. Resultado: todas ganham energia mas
        // cada uma vai para um lado → aspecto de "agitação" e não de "empurrão"
        if (shakeEnergy > 0.001) {
          const angle = smoothNoise(p.noiseSeed * 3.7, t * 0.3) * Math.PI * 2;
          const impulse = shakeEnergy * 3.5;  // era 2.5
          p.vx += Math.cos(angle) * impulse;
          p.vy += Math.sin(angle) * impulse;
        }

        // Thermal noise: injeta força suave quando quase parado
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed < minSpeed) {
          p.vx += smoothNoise(p.noiseSeed,      t) * noiseStrength;
          p.vy += smoothNoise(p.noiseSeed + 50, t) * noiseStrength;
        }

        // Clamp velocidade máxima
        const speedAfter = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speedAfter > maxSpeed) {
          p.vx = (p.vx / speedAfter) * maxSpeed;
          p.vy = (p.vy / speedAfter) * maxSpeed;
        }

        p.x += p.vx;
        p.y += p.vy;

        // ── Colisão com obstáculos retangulares (botões) ───────
        const obstacles = obstaclesRef?.current;
        if (obstacles) {
          for (const obs of obstacles) {
            const r = collisionRadius;
            if (
              p.x + r > obs.x && p.x - r < obs.x + obs.w &&
              p.y + r > obs.y && p.y - r < obs.y + obs.h
            ) {
              // Sobreposição em cada eixo
              const overlapLeft  = (p.x + r) - obs.x;
              const overlapRight = (obs.x + obs.w) - (p.x - r);
              const overlapTop   = (p.y + r) - obs.y;
              const overlapBot   = (obs.y + obs.h) - (p.y - r);
              // Empurra pelo menor overlap — face mais próxima
              const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBot);
              if (minOverlap === overlapLeft)  { p.x = obs.x - r;           p.vx = -Math.abs(p.vx); }
              else if (minOverlap === overlapRight) { p.x = obs.x + obs.w + r; p.vx =  Math.abs(p.vx); }
              else if (minOverlap === overlapTop)   { p.y = obs.y - r;          p.vy = -Math.abs(p.vy); }
              else                                  { p.y = obs.y + obs.h + r;  p.vy =  Math.abs(p.vy); }
            }
          }
        }

        if (p.x < margin)      { p.x = margin;      p.vx =  Math.abs(p.vx); }
        if (p.x > cw - margin) { p.x = cw - margin; p.vx = -Math.abs(p.vx); }
        if (p.y < margin)      { p.y = margin;       p.vy =  Math.abs(p.vy); }
        if (p.y > ch - margin) { p.y = ch - margin;  p.vy = -Math.abs(p.vy); }

        const el = particleRefs.current?.[i];
        if (el) {
          el.style.left = `${p.x}px`;
          el.style.top  = `${p.y}px`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [count, collisionRadius, repulsionStrength, maxSpeed, damping, minSpeed, noiseStrength, externalForceRef, obstaclesRef, init, containerRef, particleRefs]);
}
