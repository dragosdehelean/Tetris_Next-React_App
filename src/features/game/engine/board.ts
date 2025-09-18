import { BOARD_HEIGHT, BOARD_WIDTH } from "@/features/game/engine/constants";
import type { Coordinate, TetrominoType } from "@/features/game/engine/tetromino";

export type Cell = TetrominoType | null;
export type Matrix = Cell[][];

export const createEmptyBoard = (height: number = BOARD_HEIGHT, width: number = BOARD_WIDTH): Matrix =>
  Array.from({ length: height }, () => Array<Cell>(width).fill(null));

export const cloneBoard = (board: Matrix): Matrix => board.map((row) => [...row]);

export const withinBounds = (x: number, y: number, width = BOARD_WIDTH, height = BOARD_HEIGHT) =>
  x >= 0 && x < width && y >= 0 && y < height;

export const collides = (board: Matrix, cells: Coordinate[]): boolean =>
  cells.some(({ x, y }) => {
    if (!withinBounds(x, y)) {
      return true;
    }
    return board[y][x] !== null;
  });

export const mergePiece = (board: Matrix, cells: Coordinate[], value: TetrominoType): Matrix => {
  const next = cloneBoard(board);
  for (const { x, y } of cells) {
    if (withinBounds(x, y)) {
      next[y][x] = value;
    }
  }
  return next;
};

export const clearLines = (board: Matrix): { board: Matrix; cleared: number } => {
  const remaining: Matrix = [];
  let cleared = 0;
  for (const row of board) {
    if (row.every((cell) => cell !== null)) {
      cleared += 1;
    } else {
      remaining.push(row);
    }
  }
  while (remaining.length < board.length) {
    remaining.unshift(Array<Cell>(BOARD_WIDTH).fill(null));
  }
  return { board: remaining, cleared };
};

export const getDroppedCoordinates = (board: Matrix, cells: Coordinate[]): Coordinate[] => {
  let offset = 0;
  let blocked = false;
  while (!blocked) {
    const next = cells.map(({ x, y }) => ({ x, y: y + offset + 1 }));
    if (collides(board, next)) {
      blocked = true;
    } else {
      offset += 1;
    }
  }
  return cells.map(({ x, y }) => ({ x, y: y + offset }));
};