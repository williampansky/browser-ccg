/** Randomness the engine is allowed to use. The engine never calls Math.random. */
export interface Rng {
  /** Integer in [0, maxExclusive) */
  int(maxExclusive: number): number;
  /** Returns a new shuffled array; does not modify the input */
  shuffle<T>(items: readonly T[]): T[];
  pick<T>(items: readonly T[]): T;
}

/** Deterministic seeded generator (mulberry32), for tests and simulations. */
export const createSeededRng = (seed: number): Rng => {
  let a = seed >>> 0;
  const next = (): number => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const int = (maxExclusive: number): number => Math.floor(next() * maxExclusive);
  return {
    int,
    shuffle: (items) => {
      const out = [...items];
      for (let i = out.length - 1; i > 0; i--) {
        const j = int(i + 1);
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    pick: (items) => items[int(items.length)],
  };
};
