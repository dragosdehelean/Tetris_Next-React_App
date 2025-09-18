import { describe, expect, it } from "vitest";
import { createSeed, randomFromSeed } from "@/features/game/engine/prng";
import { generateBag } from "@/features/game/engine/bag";
import { TETROMINO_SEQUENCE } from "@/features/game/engine/tetromino";
import { BOARD_HEIGHT, BOARD_WIDTH } from "@/features/game/engine/constants";
import { createEmptyBoard, collides, mergePiece, clearLines } from "@/features/game/engine/board";
import { getPieceCells } from "@/features/game/engine/piece";
import {
  initializeFrame,
  movePiece,
  rotateActive,
  holdPiece,
  hardDrop,
  tickFrame,
} from "@/features/game/engine/gameEngine";
import type { ActivePiece } from "@/features/game/engine/state";

describe("engine: prng", () => {
  it("produces reproducible sequences", () => {
    const seed = createSeed(42);
    const first = randomFromSeed(seed);
    const second = randomFromSeed(first.seed);

    expect(first.value).not.toBe(second.value);
    expect(randomFromSeed(seed)).toEqual(first);
  });
});

describe("engine: bag", () => {
  it("generates deterministic shuffled 7-bags", () => {
    const first = generateBag(7);
    const second = generateBag(7);
    const next = generateBag(first.seed);

    expect(first.queue).toHaveLength(TETROMINO_SEQUENCE.length);
    expect(new Set(first.queue)).toEqual(new Set(TETROMINO_SEQUENCE));
    expect(first.queue).toEqual(second.queue);
    expect(first.queue).not.toEqual(next.queue);
  });
});

describe("engine: board mechanics", () => {
  it("creates an empty board", () => {
    const board = createEmptyBoard();
    expect(board).toHaveLength(BOARD_HEIGHT);
    expect(board[0]).toHaveLength(BOARD_WIDTH);
    expect(board.flat().every((cell) => cell === null)).toBe(true);
  });

  it("detects collisions and clearing", () => {
    const board = createEmptyBoard();
    const piece: ActivePiece = {
      type: "O",
      rotation: 0,
      position: { x: 4, y: 0 },
    };
    const coordinates = getPieceCells(piece);
    expect(collides(board, coordinates)).toBe(false);

    const merged = mergePiece(board, coordinates, "O");
    const { board: cleared, cleared: lines } = clearLines(merged);
    expect(lines).toBe(0);
    expect(cleared.flat().filter((cell) => cell === "O")).toHaveLength(4);
  });
});

describe("engine: gameplay", () => {
  it("initializes frame with active piece", () => {
    const { frame, lockedOut } = initializeFrame(42, "Classic");
    expect(lockedOut).toBe(false);
    expect(frame.activePiece).not.toBeNull();
    expect(frame.queue.length).toBeGreaterThan(0);
  });

  it("moves, rotates, holds and re-enables hold after lock", () => {
    let { frame } = initializeFrame(99, "Classic");
    frame = movePiece(frame, 1, 0).frame;
    const activeAfterMove = frame.activePiece;
    expect(activeAfterMove?.position.x).toBeGreaterThanOrEqual(0);

    frame = rotateActive(frame, 1).frame;
    expect(frame.activePiece?.rotation).not.toBeNull();

    const held = holdPiece(frame);
    frame = held.frame;
    expect(frame.holdPiece).not.toBeNull();
    expect(frame.canHold).toBe(false);

    const afterLock = hardDrop(frame).frame;
    expect(afterLock.canHold).toBe(true);
  });

  it("performs a hard drop and spawns a new piece", () => {
    const { frame } = initializeFrame(7, "Classic");
    const result = hardDrop(frame);
    expect(result.frame.board.flat().some((cell) => cell !== null)).toBe(true);
    expect(result.frame.activePiece).not.toBeNull();
  });
});

describe("engine: gravity", () => {
  it("advances multiple steps when elapsed exceeds drop interval", () => {
    let { frame } = initializeFrame(5, "Classic");
    const startY = frame.activePiece?.position.y ?? 0;
    const dropInterval = frame.dropInterval;

    const result = tickFrame(frame, dropInterval * 2);
    frame = result.frame;

    expect(frame.activePiece?.position.y).toBe(startY + 2);
    expect(frame.gravityAccumulator).toBeGreaterThanOrEqual(0);
    expect(frame.tick).toBeGreaterThanOrEqual(2);
  });
});

