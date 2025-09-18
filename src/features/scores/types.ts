import type { Difficulty } from "@/features/game/types";

export interface ScoreEntry {
  id: string;
  value: number;
  linesCleared: number;
  levelReached: number;
  difficulty: Difficulty;
  timestamp: string; // ISO
}

export type ScoreList = ScoreEntry[];

