import { BOARD_HEIGHT, BOARD_WIDTH, SPAWN_POSITIONS } from "@/features/game/engine/constants";
import { collides, mergePiece, clearLines, getDroppedCoordinates } from "@/features/game/engine/board";
import { getPieceCells, translatePiece, attemptRotation } from "@/features/game/engine/piece";
import type { ActivePiece, GameFrameState } from "@/features/game/engine/state";
import { initialFrameState } from "@/features/game/engine/state";
import { generateBag } from "@/features/game/engine/bag";
import { getDropInterval, getLevelForLines, getLevelProgress } from "@/features/game/engine/difficulty";
import type { Difficulty } from "@/features/game/types";
import { difficultyLevelBoost } from "@/features/game/types";

const LINE_BASE_SCORES = {
  0: 0,
  1: 100,
  2: 300,
  3: 500,
  4: 800,
} as const;

const MIN_QUEUE_SIZE = 6;
const MAX_GRAVITY_STEPS = 10;

const ensureQueue = (frame: GameFrameState): GameFrameState => {
  let queue = [...frame.queue];
  let seed = frame.seed;
  while (queue.length < MIN_QUEUE_SIZE) {
    const { queue: bag, seed: next } = generateBag(seed);
    queue = queue.concat(bag);
    seed = next;
  }
  return { ...frame, queue, seed };
};

const spawnPiece = (frame: GameFrameState): { frame: GameFrameState; lockedOut: boolean } => {
  const prepared = ensureQueue(frame);
  const [nextType, ...rest] = prepared.queue;
  const spawn = SPAWN_POSITIONS[nextType];
  const active: ActivePiece = {
    type: nextType,
    rotation: 0,
    position: { x: spawn.x, y: spawn.y },
  };
  const collidesSpawn = collides(prepared.board, getPieceCells(active));
  if (collidesSpawn) {
    return {
      frame: {
        ...prepared,
        queue: rest,
        activePiece: null,
      },
      lockedOut: true,
    };
  }
  return {
    frame: {
      ...prepared,
      queue: rest,
      activePiece: active,
    },
    lockedOut: false,
  };
};

const scoreForLines = (lines: number, level: number, difficulty: Difficulty) =>
  LINE_BASE_SCORES[lines as keyof typeof LINE_BASE_SCORES] * level * difficultyLevelBoost[difficulty];

const applyProgression = (frame: GameFrameState, cleared: number): GameFrameState => {
  const totalLines = frame.clearedLines + cleared;
  const level = getLevelForLines(frame.difficulty, totalLines);
  const progress = getLevelProgress(frame.difficulty, totalLines);
  const dropInterval = getDropInterval(frame.difficulty, level);
  return {
    ...frame,
    clearedLines: totalLines,
    level,
    dropInterval,
    linesPerLevel: progress.linesPerLevel,
    linesToNextLevel: progress.linesToNextLevel,
    score: frame.score + scoreForLines(cleared, level, frame.difficulty),
  };
};

export interface AdvanceResult {
  frame: GameFrameState;
  lockedOut?: boolean;
  cleared?: number;
}

export const initializeFrame = (seed: number, difficulty: Difficulty): AdvanceResult => {
  const frame = initialFrameState(seed, difficulty);
  const progress = getLevelProgress(difficulty, 0);
  const withDrop: GameFrameState = {
    ...frame,
    dropInterval: getDropInterval(difficulty, frame.level),
    linesPerLevel: progress.linesPerLevel,
    linesToNextLevel: progress.linesToNextLevel,
  };
  return spawnPiece(withDrop);
};

export const hardDrop = (frame: GameFrameState): AdvanceResult => {
  if (!frame.activePiece) {
    return { frame };
  }
  const currentCells = getPieceCells(frame.activePiece);
  const droppedCells = getDroppedCoordinates(frame.board, currentCells);
  const dropDelta = droppedCells[0].y - currentCells[0].y;
  const droppedPiece = translatePiece(frame.activePiece, 0, dropDelta);
  return lockPiece({ ...frame, activePiece: droppedPiece, gravityAccumulator: 0 });
};

export const softDrop = (frame: GameFrameState): AdvanceResult => movePiece(frame, 0, 1, { soft: true });

export const movePiece = (
  frame: GameFrameState,
  dx: number,
  dy: number,
  options?: { soft?: boolean },
): AdvanceResult => {
  if (!frame.activePiece) {
    return { frame };
  }
  const moved = translatePiece(frame.activePiece, dx, dy);
  const cells = getPieceCells(moved);
  if (collides(frame.board, cells)) {
    if (options?.soft && dy > 0) {
      return lockPiece(frame);
    }
    return { frame };
  }
  const scoreIncrement = options?.soft && dy > 0 ? difficultyLevelBoost[frame.difficulty] : 0;
  return {
    frame: {
      ...frame,
      activePiece: moved,
      score: frame.score + scoreIncrement,
    },
  };
};

export const rotateActive = (frame: GameFrameState, direction: 1 | -1): AdvanceResult => {
  if (!frame.activePiece) {
    return { frame };
  }
  const rotated = attemptRotation(frame.activePiece, direction, (candidate) =>
    !collides(frame.board, getPieceCells(candidate)),
  );
  if (!rotated) {
    return { frame };
  }
  return {
    frame: {
      ...frame,
      activePiece: rotated,
    },
  };
};

export const lockPiece = (frame: GameFrameState): AdvanceResult => {
  if (!frame.activePiece) {
    return { frame };
  }
  const mergedBoard = mergePiece(frame.board, getPieceCells(frame.activePiece), frame.activePiece.type);
  const { board, cleared } = clearLines(mergedBoard);
  const progressed = applyProgression(
    {
      ...frame,
      board,
      activePiece: null,
      gravityAccumulator: 0,
    },
    cleared,
  );
  const spawn = spawnPiece(progressed);
  return {
    ...spawn,
    cleared,
  };
};

export const tickFrame = (frame: GameFrameState, elapsed: number): AdvanceResult => {
  let working = frame;
  let lockedOut = false;
  let totalCleared = 0;
  let accumulator = frame.gravityAccumulator + elapsed;
  let ticksPerformed = 0;

  if (!working.activePiece) {
    const spawn = spawnPiece(working);
    working = spawn.frame;
    lockedOut = spawn.lockedOut ?? false;
    if (lockedOut) {
      return {
        frame: { ...working, gravityAccumulator: 0 },
        lockedOut: true,
      };
    }
  }

  let steps = 0;
  while (working.activePiece && accumulator >= working.dropInterval && steps < MAX_GRAVITY_STEPS) {
    accumulator -= working.dropInterval;
    steps += 1;
    ticksPerformed += 1;

    const moved = translatePiece(working.activePiece, 0, 1);
    if (collides(working.board, getPieceCells(moved))) {
      const result = lockPiece({ ...working, gravityAccumulator: 0 });
      working = result.frame;
      lockedOut = lockedOut || (result.lockedOut ?? false);
      if (result.cleared) totalCleared += result.cleared;
      if (lockedOut) {
        accumulator = 0;
        break;
      }
    } else {
      working = { ...working, activePiece: moved };
    }
  }

  return {
    frame: { ...working, gravityAccumulator: accumulator, tick: working.tick + ticksPerformed },
    lockedOut: lockedOut || undefined,
    cleared: totalCleared || undefined,
  };
};

export const resetBoard = (seed: number, difficulty: Difficulty): AdvanceResult => initializeFrame(seed, difficulty);

export const boardIsValid = (frame: GameFrameState): boolean =>
  frame.board.length === BOARD_HEIGHT && frame.board.every((row) => row.length === BOARD_WIDTH);
