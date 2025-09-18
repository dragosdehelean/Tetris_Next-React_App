import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { hardDrop as engineHardDrop, holdPiece, initializeFrame, movePiece, rotateActive, softDrop as engineSoftDrop, tickFrame } from "@/features/game/engine/gameEngine";
import type { GameFrameState } from "@/features/game/engine/state";
import { createSeed } from "@/features/game/engine/prng";
import type { Difficulty, GameStatus } from "@/features/game/types";
import type { TetrominoType } from "@/features/game/engine/tetromino";
import { SPAWN_POSITIONS } from "@/features/game/engine/constants";
import { difficultyLevelBoost } from "@/features/game/types";

export interface GameState {
  status: GameStatus;
  difficulty: Difficulty;
  frame: GameFrameState | null;
  seed: number;
  lastUpdate: number;
}

const initialSeed = createSeed();

const initialState: GameState = {
  status: "idle",
  difficulty: "Classic",
  frame: null,
  seed: initialSeed,
  lastUpdate: 0,
};

interface StartPayload {
  difficulty?: Difficulty;
  timestamp?: number;
  seed?: number;
}

interface TickPayload {
  elapsed: number;
}

const updateFrame = (state: GameState, frame: GameFrameState) => {
  state.frame = frame;
  state.lastUpdate = Date.now();
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    startGame(state, action: PayloadAction<StartPayload | undefined>) {
      const difficulty = action?.payload?.difficulty ?? state.difficulty;
      const seed = action?.payload?.seed ?? createSeed(action?.payload?.timestamp);
      state.difficulty = difficulty;
      state.seed = seed;
      const { frame, lockedOut } = initializeFrame(seed, difficulty);
      updateFrame(state, frame);
      state.status = lockedOut ? "gameOver" : "running";
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
    },
    tick(state, action: PayloadAction<TickPayload | undefined>) {
      if (state.status !== "running" || !state.frame) {
        return;
      }
      const elapsed = action.payload?.elapsed ?? state.frame.dropInterval;
      const result = tickFrame(state.frame, elapsed);
      updateFrame(state, result.frame);
      if (result.lockedOut) {
        state.status = "gameOver";
      }
    },
    moveLeft(state) {
      if (state.status !== "running" || !state.frame) return;
      const result = movePiece(state.frame, -1, 0);
      updateFrame(state, result.frame);
    },
    moveRight(state) {
      if (state.status !== "running" || !state.frame) return;
      const result = movePiece(state.frame, 1, 0);
      updateFrame(state, result.frame);
    },
    softDrop(state) {
      if (state.status !== "running" || !state.frame) return;
      const result = engineSoftDrop(state.frame);
      updateFrame(state, result.frame);
      if (result.lockedOut) state.status = "gameOver";
    },
    hardDrop(state) {
      if (state.status !== "running" || !state.frame) return;
      const result = engineHardDrop(state.frame);
      updateFrame(state, result.frame);
      if (result.lockedOut) state.status = "gameOver";
    },
    rotateClockwise(state) {
      if (state.status !== "running" || !state.frame) return;
      const result = rotateActive(state.frame, 1);
      updateFrame(state, result.frame);
    },
    rotateCounterClockwise(state) {
      if (state.status !== "running" || !state.frame) return;
      const result = rotateActive(state.frame, -1);
      updateFrame(state, result.frame);
    },
    hold(state) {
      if (state.status !== "running" || !state.frame) return;
      const result = holdPiece(state.frame);
      updateFrame(state, result.frame);
      if (result.lockedOut) state.status = "gameOver";
    },
    // Debug/testing helper: adjust current frame score/lines/level for test-only flows
    debugSetScore(state, action: PayloadAction<{ score?: number; linesCleared?: number; level?: number }>) {
      if (!state.frame) return;
      state.frame = {
        ...state.frame,
        score: action.payload.score ?? state.frame.score,
        clearedLines: action.payload.linesCleared ?? state.frame.clearedLines,
        level: action.payload.level ?? state.frame.level,
      };
      state.lastUpdate = Date.now();
    },
    debugSetActive(state, action: PayloadAction<{ type: TetrominoType }>) {
      if (!state.frame) return;
      const t = action.payload.type;
      const spawn = SPAWN_POSITIONS[t];
      state.frame = {
        ...state.frame,
        activePiece: { type: t, rotation: 0, position: { x: spawn.x, y: spawn.y } },
      };
      state.lastUpdate = Date.now();
    },
    resetGameState() {
      return initialState;
    },
  },
});

export const {
  startGame,
  pauseGame,
  resumeGame,
  endGame,
  tick,
  moveLeft,
  moveRight,
  softDrop,
  hardDrop,
  rotateClockwise,
  rotateCounterClockwise,
  hold,
  debugSetScore,
  debugSetActive,
  resetGameState,
} = gameSlice.actions;

export const gameReducer = gameSlice.reducer;

export const selectGameState = (state: { game: GameState }) => state.game;
export const selectFrame = (state: { game: GameState }) => state.game.frame;
export const selectScore = (state: { game: GameState }) => state.game.frame?.score ?? 0;
export const selectLinesCleared = (state: { game: GameState }) => state.game.frame?.clearedLines ?? 0;
export const selectLevel = (state: { game: GameState }) => state.game.frame?.level ?? 1;
export const selectDifficultyMultiplier = (state: { game: GameState }) =>
  difficultyLevelBoost[state.game.difficulty];
