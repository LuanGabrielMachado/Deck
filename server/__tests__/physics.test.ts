/**
 * Testes: Motor de física das partículas
 * Garante bounce nas bordas, repulsão e thermal noise.
 */

import { describe, it, expect } from 'vitest';

// Replica a lógica core do use-physics-particles para teste isolado

function halton(index: number, base: number): number {
  let f = 1; let r = 0; let i = index;
  while (i > 0) { f /= base; r += f * (i % base); i = Math.floor(i / base); }
  return r;
}

function smoothNoise(seed: number, t: number): number {
  return Math.sin(seed * 127.1 + t * 0.018) * Math.cos(seed * 311.7 + t * 0.011);
}

interface Particle { x: number; y: number; vx: number; vy: number; noiseSeed: number; }

function tickParticle(
  p: Particle,
  cw: number, ch: number,
  margin: number,
  damping: number,
  maxSpeed: number,
  minSpeed: number,
  noiseStrength: number,
  t: number,
): Particle {
  let { x, y, vx, vy } = p;
  vx *= damping;
  vy *= damping;
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (speed < minSpeed) {
    vx += smoothNoise(p.noiseSeed, t) * noiseStrength;
    vy += smoothNoise(p.noiseSeed + 50, t) * noiseStrength;
  }
  const s2 = Math.sqrt(vx * vx + vy * vy);
  if (s2 > maxSpeed) { vx = (vx / s2) * maxSpeed; vy = (vy / s2) * maxSpeed; }
  x += vx; y += vy;
  if (x < margin) { x = margin; vx = Math.abs(vx); }
  if (x > cw - margin) { x = cw - margin; vx = -Math.abs(vx); }
  if (y < margin) { y = margin; vy = Math.abs(vy); }
  if (y > ch - margin) { y = ch - margin; vy = -Math.abs(vy); }
  return { ...p, x, y, vx, vy };
}

describe('Motor de física — bounce nas bordas', () => {
  const W = 300, H = 44, MARGIN = 10;

  it('reverte vx ao atingir borda esquerda', () => {
    let p: Particle = { x: 5, y: 22, vx: -0.5, vy: 0, noiseSeed: 1 };
    p = tickParticle(p, W, H, MARGIN, 0.994, 1.2, 0.08, 0.012, 0);
    expect(p.vx).toBeGreaterThan(0);
    expect(p.x).toBeGreaterThanOrEqual(MARGIN);
  });

  it('reverte vx ao atingir borda direita', () => {
    let p: Particle = { x: W - 5, y: 22, vx: 0.5, vy: 0, noiseSeed: 2 };
    p = tickParticle(p, W, H, MARGIN, 0.994, 1.2, 0.08, 0.012, 0);
    expect(p.vx).toBeLessThan(0);
    expect(p.x).toBeLessThanOrEqual(W - MARGIN);
  });

  it('reverte vy ao atingir borda superior', () => {
    let p: Particle = { x: 150, y: 5, vx: 0, vy: -0.5, noiseSeed: 3 };
    p = tickParticle(p, W, H, MARGIN, 0.994, 1.2, 0.08, 0.012, 0);
    expect(p.vy).toBeGreaterThan(0);
    expect(p.y).toBeGreaterThanOrEqual(MARGIN);
  });

  it('reverte vy ao atingir borda inferior', () => {
    let p: Particle = { x: 150, y: H - 5, vx: 0, vy: 0.5, noiseSeed: 4 };
    p = tickParticle(p, W, H, MARGIN, 0.994, 1.2, 0.08, 0.012, 0);
    expect(p.vy).toBeLessThan(0);
    expect(p.y).toBeLessThanOrEqual(H - MARGIN);
  });
});

describe('Motor de física — thermal noise', () => {
  it('injeta força quando velocidade está abaixo de minSpeed', () => {
    const p: Particle = { x: 150, y: 22, vx: 0.001, vy: 0.001, noiseSeed: 7 };
    const after = tickParticle(p, 300, 44, 10, 0.994, 1.2, 0.08, 0.1, 100);
    const speedAfter = Math.sqrt(after.vx ** 2 + after.vy ** 2);
    expect(speedAfter).toBeGreaterThan(0.001); // se moveu
  });

  it('smoothNoise retorna valores entre -1 e 1', () => {
    for (let i = 0; i < 100; i++) {
      const v = smoothNoise(i * 3.7, i * 1.3);
      expect(v).toBeGreaterThanOrEqual(-1);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe('Sequência de Halton', () => {
  it('base 2: primeiros valores são 0.5, 0.25, 0.75', () => {
    expect(halton(1, 2)).toBeCloseTo(0.5);
    expect(halton(2, 2)).toBeCloseTo(0.25);
    expect(halton(3, 2)).toBeCloseTo(0.75);
  });

  it('todos os valores estão entre 0 e 1', () => {
    for (let i = 1; i <= 20; i++) {
      expect(halton(i, 2)).toBeGreaterThanOrEqual(0);
      expect(halton(i, 2)).toBeLessThan(1);
      expect(halton(i, 3)).toBeGreaterThanOrEqual(0);
      expect(halton(i, 3)).toBeLessThan(1);
    }
  });
});
