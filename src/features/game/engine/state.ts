import { BOARD_HEIGHT, BOARD_WIDTH } from "@/features/game/engine/constants";
import { getLinesPerLevel } from "@/features/game/engine/difficulty";
import type { Matrix } from "@/features/game/engine/board";
import type { Coordinate, TetrominoType } from "@/features/game/engine/tetromino";
import type { Difficulty } from "@/features/game/types";

export interface ActivePiece {
  type: TetrominoType;
  rotation: 0 | 1 | 2 | 3;
  position: Coordinate;
}

export interface GameFrameState {
  board: Matrix;
  activePiece: ActivePiece | null;
  queue: TetrominoType[];
  clearedLines: number;
  score: number;
  level: number;
  difficulty: Difficulty;
  seed: number;
  tick: number;
  dropInterval: number;
  linesPerLevel: number;
  linesToNextLevel: number;
  gravityAccumulator: number;
}

export const initialFrameState = (seed: number, difficulty: Difficulty): GameFrameState => {
  const linesPerLevel = getLinesPerLevel(difficulty);
  return {
    board: Array.from({ length: BOARD_HEIGHT }, () => Array<TetrominoType | null>(BOARD_WIDTH).fill(null)),
    activePiece: null,
    queue: [],
    clearedLines: 0,
    score: 0,
    level: 1,
    difficulty,
    seed,
    tick: 0,
    dropInterval: 1000,
    linesPerLevel,
    linesToNextLevel: linesPerLevel,
    gravityAccumulator: 0,
  };
};

