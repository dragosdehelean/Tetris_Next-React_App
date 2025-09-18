import type { Difficulty } from "@/features/game/types";
import type { ScoreEntry, ScoreList } from "@/features/scores/types";

const KEY = (difficulty: Difficulty) => `scores.${difficulty.toLowerCase()}`;

export const readScores = (difficulty: Difficulty): ScoreList => {
  try {
    const raw = localStorage.getItem(KEY(difficulty));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ScoreList;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((e) => typeof e?.value === "number" && typeof e?.timestamp === "string")
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  } catch {
    return [];
  }
};

export const writeScore = (entry: ScoreEntry): ScoreList => {
  const list = readScores(entry.difficulty);
  const merged = [...list, entry]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);
  try {
    localStorage.setItem(KEY(entry.difficulty), JSON.stringify(merged));
  } catch {}
  return merged;
};

