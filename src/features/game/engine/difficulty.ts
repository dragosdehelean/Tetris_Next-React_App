import type { Difficulty } from "@/features/game/types";

interface DifficultyCurve {
  baseDropMs: number;
  minDropMs: number;
  acceleration: number; // per level multiplier < 1
  linesPerLevel: number;
}

const DIFFICULTY_CURVES: Record<Difficulty, DifficultyCurve> = {
  Relaxed: {
    baseDropMs: 1000,
    minDropMs: 280,
    acceleration: 0.94,
    linesPerLevel: 12,
  },
  Classic: {
    baseDropMs: 750,
    minDropMs: 120,
    acceleration: 0.9,
    linesPerLevel: 10,
  },
  Expert: {
    baseDropMs: 500,
    minDropMs: 70,
    acceleration: 0.85,
    linesPerLevel: 8,
  },
};

export const getLinesPerLevel = (difficulty: Difficulty): number => DIFFICULTY_CURVES[difficulty].linesPerLevel;

export const getLevelForLines = (difficulty: Difficulty, totalLines: number): number => {
  const linesPerLevel = getLinesPerLevel(difficulty);
  return Math.floor(totalLines / linesPerLevel) + 1;
};

export const getDropInterval = (difficulty: Difficulty, level: number): number => {
  const curve = DIFFICULTY_CURVES[difficulty];
  const scaled = curve.baseDropMs * Math.pow(curve.acceleration, Math.max(0, level - 1));
  return Math.max(curve.minDropMs, Math.round(scaled));
};

export const getLevelProgress = (difficulty: Difficulty, totalLines: number) => {
  const linesPerLevel = getLinesPerLevel(difficulty);
  const linesIntoLevel = totalLines % linesPerLevel;
  const linesToNextLevel = linesIntoLevel === 0 ? linesPerLevel : linesPerLevel - linesIntoLevel;
  return {
    linesPerLevel,
    linesIntoLevel,
    linesToNextLevel,
  };
};

