import { describe, expect, it } from "vitest";
import { getDropInterval, getLevelForLines, getLevelProgress, getLinesPerLevel } from "@/features/game/engine/difficulty";

describe("difficulty curves", () => {
  it("reduce drop interval as level increases but stay above minimum", () => {
    const relaxedStart = getDropInterval("Relaxed", 1);
    const relaxedLevel6 = getDropInterval("Relaxed", 6);
    const expertStart = getDropInterval("Expert", 1);
    const expertLevel10 = getDropInterval("Expert", 10);

    expect(relaxedLevel6).toBeLessThan(relaxedStart);
    expect(relaxedLevel6).toBeGreaterThanOrEqual(280);
    expect(expertLevel10).toBeLessThan(expertStart);
    expect(expertLevel10).toBeGreaterThanOrEqual(70);
    expect(expertStart).toBeLessThan(relaxedStart);
  });

  it("computes level thresholds per difficulty", () => {
    expect(getLinesPerLevel("Relaxed")).toBeGreaterThan(getLinesPerLevel("Expert"));
    expect(getLevelForLines("Classic", 0)).toBe(1);
    expect(getLevelForLines("Classic", 19)).toBe(2);
    expect(getLevelForLines("Expert", 24)).toBe(4);
  });

  it("reports remaining lines to next level", () => {
    const progress = getLevelProgress("Classic", 12);
    expect(progress.linesPerLevel).toBe(10);
    expect(progress.linesToNextLevel).toBe(8);

    const reset = getLevelProgress("Expert", 16);
    expect(reset.linesToNextLevel).toBe(reset.linesPerLevel);
  });
});

