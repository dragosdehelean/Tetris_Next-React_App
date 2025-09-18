import { describe, expect, it } from "vitest";
import {
  gameReducer,
  incrementScore,
  pauseGame,
  resetGame,
  resumeGame,
  startGame,
  type GameState,
} from "@/features/game/gameSlice";

const createState = (override: Partial<GameState> = {}) =>
  ({
    status: "idle",
    score: 0,
    linesCleared: 0,
    level: 1,
    difficulty: "Classic",
    startTime: null,
    lastTick: null,
    ...override,
  }) satisfies GameState;

describe("gameSlice", () => {
  it("should start a game with provided difficulty", () => {
    const state = createState();
    const result = gameReducer(state, startGame({ difficulty: "Expert", timestamp: 1 }));

    expect(result.status).toBe("running");
    expect(result.difficulty).toBe("Expert");
    expect(result.score).toBe(0);
    expect(result.startTime).toBe(1);
  });

  it("should ignore score updates when not running", () => {
    const state = createState({ status: "paused" });
    const result = gameReducer(state, incrementScore({ lines: 2 }));

    expect(result.score).toBe(0);
    expect(result.linesCleared).toBe(0);
  });

  it("should update score and level when clearing enough lines", () => {
    const running = createState({ status: "running", difficulty: "Expert" });
    const afterTetris = gameReducer(running, incrementScore({ lines: 4 }));
    const afterCombo = gameReducer(afterTetris, incrementScore({ lines: 6 }));

    expect(afterCombo.score).toBeGreaterThan(afterTetris.score);
    expect(afterCombo.level).toBe(2);
    expect(afterCombo.linesCleared).toBe(10);
  });

  it("should toggle pause and resume", () => {
    const running = createState({ status: "running" });
    const paused = gameReducer(running, pauseGame());
    expect(paused.status).toBe("paused");

    const resumed = gameReducer(paused, resumeGame());
    expect(resumed.status).toBe("running");
  });

  it("should reset state to defaults", () => {
    const running = createState({ status: "running", score: 123, level: 4 });
    const result = gameReducer(running, resetGame());

    expect(result).toMatchObject({
      status: "idle",
      score: 0,
      level: 1,
    });
  });
});