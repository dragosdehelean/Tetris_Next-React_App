import { describe, expect, it } from "vitest";
import { readScores, writeScore } from "@/features/scores/localScores";

const entry = (value: number) => ({
  id: String(value),
  value,
  linesCleared: value % 10,
  levelReached: 1 + (value % 3),
  difficulty: "Classic" as const,
  timestamp: new Date().toISOString(),
});

describe("localScores", () => {
  it("writes and reads top 5 scores sorted desc", () => {
    window.localStorage.clear();
    const values = [100, 500, 300, 700, 200, 400];
    for (const v of values) writeScore(entry(v));
    const list = readScores("Classic");
    expect(list.map((s) => s.value)).toEqual([700, 500, 400, 300, 200]);
  });
});
