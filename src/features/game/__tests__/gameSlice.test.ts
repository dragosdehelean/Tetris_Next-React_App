import { describe, expect, it } from "vitest";
import {
  gameReducer,
  startGame,
  pauseGame,
  resumeGame,
  tick,
  moveLeft,
  hold,
  hardDrop,
} from "@/features/game/gameSlice";
import type { GameState } from "@/features/game/gameSlice";

type PartialGameState = Partial<Omit<GameState, "frame">> & { frame?: GameState["frame"] };

const createState = (override: PartialGameState = {}): GameState => ({
  status: "idle",
  difficulty: "Classic",
  frame: null,
  seed: 1,
  lastUpdate: 0,
  ...override,
});

describe("gameSlice", () => {
  it("starts a game with the requested difficulty and seed", () => {
    const initial = createState();
    const result = gameReducer(initial, startGame({ difficulty: "Expert", seed: 123 }));

    expect(result.status).toBe("running");
    expect(result.difficulty).toBe("Expert");
    expect(result.frame).not.toBeNull();
    expect(result.frame?.difficulty).toBe("Expert");
  });

  it("pauses and resumes gameplay", () => {
    const running = gameReducer(createState(), startGame({ seed: 5 }));
    const paused = gameReducer(running, pauseGame());
    expect(paused.status).toBe("paused");

    const resumed = gameReducer(paused, resumeGame());
    expect(resumed.status).toBe("running");
  });

  it("ticks gravity to move the active piece down", () => {
    let state = gameReducer(createState(), startGame({ seed: 10 }));
    const initialY = state.frame?.activePiece?.position.y ?? 0;
    state = gameReducer(state, tick({ elapsed: state.frame?.dropInterval ?? 0 }));
    const nextY = state.frame?.activePiece?.position.y ?? 0;

    expect(nextY).toBeGreaterThan(initialY);
  });

  it("moves the piece left when possible", () => {
    let state = gameReducer(createState(), startGame({ seed: 20 }));
    const initialX = state.frame?.activePiece?.position.x ?? 0;
    state = gameReducer(state, moveLeft());
    const nextX = state.frame?.activePiece?.position.x ?? 0;

    expect(nextX).toBeLessThanOrEqual(initialX);
  });

  it("locks piece after hard drop and enables hold again", () => {
    let state = gameReducer(createState(), startGame({ seed: 33 }));
    state = gameReducer(state, hardDrop());

    expect(state.frame?.activePiece).not.toBeNull();
    const filledCells = state.frame?.board.flat().filter((cell) => cell !== null).length ?? 0;
    expect(filledCells).toBeGreaterThan(0);
    expect(state.frame?.canHold).toBe(true);
  });

  it("allows holding a piece once per drop and re-enables after lock", () => {
    let state = gameReducer(createState(), startGame({ seed: 42 }));
    const initialType = state.frame?.activePiece?.type;
    state = gameReducer(state, hold());

    const frame = state.frame;
    expect(frame?.holdPiece).toBe(initialType);
    expect(frame?.canHold).toBe(false);

    state = gameReducer(state, hardDrop());
    expect(state.frame?.canHold).toBe(true);
  });
});

