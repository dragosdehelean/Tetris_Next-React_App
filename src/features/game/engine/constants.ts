import type { TetrominoType } from "@/features/game/engine/tetromino";

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;
export const VISIBLE_HEIGHT = 20;

export const SPAWN_POSITIONS: Record<TetrominoType, { x: number; y: number }> = {
  I: { x: 3, y: 0 },
  J: { x: 3, y: 0 },
  L: { x: 3, y: 0 },
  O: { x: 4, y: 0 },
  S: { x: 3, y: 0 },
  T: { x: 3, y: 0 },
  Z: { x: 3, y: 0 },
};

export const LOCK_DELAY_FRAMES = 500; // ms before automatic lock (simplified)