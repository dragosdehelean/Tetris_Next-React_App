import { test, expect } from "@playwright/test";

test("ST-05 LocalStorageHealth: write/remove score and verify fallback", async ({ page }) => {
  await page.goto("/");

  // Ensure empty leaderboard text appears when nothing persisted
  await page.evaluate(() => {
    localStorage.removeItem("scores.classic");
  });
  await page.reload();
  await expect(page.getByText(/Top scoruri \(Classic\)/)).toBeVisible();
  await expect(page.getByText(/Nicio intrare încă/)).toBeVisible();

  // Write a sample score and verify it appears
  await page.evaluate(() => {
    const entry = [{ id: "test", value: 1234, linesCleared: 10, levelReached: 3, difficulty: "Classic", timestamp: new Date().toISOString() }];
    localStorage.setItem("scores.classic", JSON.stringify(entry));
  });
  await page.reload();
  await expect(page.getByText(/1[.,]?234/)).toBeVisible();
});
