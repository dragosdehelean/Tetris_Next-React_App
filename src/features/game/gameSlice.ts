import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export type Difficulty = "Relaxed" | "Classic" | "Expert";
export type GameStatus = "idle" | "running" | "paused" | "gameOver";

export interface GameState {
  status: GameStatus;
  score: number;
  linesCleared: number;
  level: number;
  difficulty: Difficulty;
  startTime: number | null;
  lastTick: number | null;
}

const initialState: GameState = {
  status: "idle",
  score: 0,
  linesCleared: 0,
  level: 1,
  difficulty: "Classic",
  startTime: null,
  lastTick: null,
};

const difficultyLevelBoost: Record<Difficulty, number> = {
  Relaxed: 1,
  Classic: 2,
  Expert: 3,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startGame(state, action: PayloadAction<{ difficulty?: Difficulty; timestamp?: number } | undefined>) {
      state.status = "running";
      state.difficulty = action.payload?.difficulty ?? state.difficulty;
      state.score = 0;
      state.linesCleared = 0;
      state.level = 1;
      state.startTime = action.payload?.timestamp ?? Date.now();
      state.lastTick = action.payload?.timestamp ?? Date.now();
    },
    pauseGame(state) {
      if (state.status === "running") {
        state.status = "paused";
      }
    },
    resumeGame(state) {
      if (state.status === "paused") {
        state.status = "running";
      }
    },
    endGame(state) {
      state.status = "gameOver";
      state.lastTick = Date.now();
    },
    incrementScore(state, action: PayloadAction<{ lines: number; timestamp?: number }>) {
      if (state.status !== "running") {
        return;
      }

      const { lines, timestamp } = action.payload;
      const baseScore = Math.max(0, lines) * 100;
      const difficultyMultiplier = difficultyLevelBoost[state.difficulty];
      state.score += baseScore * difficultyMultiplier * state.level;
      state.linesCleared += lines;

      if (state.linesCleared >= state.level * 10) {
        state.level += 1;
      }

      if (timestamp) {
        state.lastTick = timestamp;
      }
    },
    resetGame() {
      return initialState;
    },
  },
});

export const { startGame, pauseGame, resumeGame, endGame, incrementScore, resetGame } = gameSlice.actions;
export const gameReducer = gameSlice.reducer;
export const selectGameState = (state: { game: GameState }) => state.game;