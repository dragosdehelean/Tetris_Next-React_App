export type Difficulty = "Relaxed" | "Classic" | "Expert";
export type GameStatus = "idle" | "running" | "paused" | "gameOver";

export const difficultyLevelBoost: Record<Difficulty, number> = {
  Relaxed: 1,
  Classic: 2,
  Expert: 3,
};

export const difficultyDropMultiplier: Record<Difficulty, number> = {
  Relaxed: 1,
  Classic: 1.25,
  Expert: 1.5,
};