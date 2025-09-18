export interface RandomResult {
  value: number;
  seed: number;
}

const MOD = 0xffffffff;

export const createSeed = (ts: number = Date.now()) => (ts >>> 0) || 1;

export const nextSeed = (seed: number): number => (Math.imul(seed ^ 0x6d2b79f5, 0x2c9277b5) + 0x7ed55d16) >>> 0;

export const randomFromSeed = (seed: number): RandomResult => {
  const newSeed = nextSeed(seed);
  const value = (newSeed & MOD) / (MOD + 1);
  return { value, seed: newSeed };
};

export const shuffleWithSeed = <T>(input: readonly T[], seed: number): { result: T[]; seed: number } => {
  let next = seed;
  const arr = [...input];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const { value, seed: updated } = randomFromSeed(next);
    next = updated;
    const j = Math.floor(value * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return { result: arr, seed: next };
};