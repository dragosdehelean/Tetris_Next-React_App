import { shuffleWithSeed } from "@/features/game/engine/prng";
import { TETROMINO_SEQUENCE, type TetrominoType } from "@/features/game/engine/tetromino";

export const generateBag = (seed: number): { queue: TetrominoType[]; seed: number } => {
  const { result, seed: nextSeed } = shuffleWithSeed(TETROMINO_SEQUENCE, seed);
  const filtered = result.filter((t): t is TetrominoType => Boolean(t));
  if (filtered.length === TETROMINO_SEQUENCE.length) {
    return { queue: filtered, seed: nextSeed };
  }
  const missing = TETROMINO_SEQUENCE.filter((t) => !filtered.includes(t));
  const completed = [...filtered, ...missing].slice(0, TETROMINO_SEQUENCE.length);
  return { queue: completed, seed: nextSeed };
};
