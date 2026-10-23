// src/shared/sketch/random.ts
// Seeded randomness so a sketched shape looks hand-drawn but stays identical between renders.

export type Rng = () => number;

// mulberry32 - small, fast, good enough for visual jitter
export const createRng = (seed: number): Rng => {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

export const hashString = (value: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

// value in [-amount, amount]
export const jitter = (rng: Rng, amount: number) => (rng() * 2 - 1) * amount;
