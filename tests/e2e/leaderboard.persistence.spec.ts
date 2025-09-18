import { test, expect } from "@playwright/test";

test.describe("Leaderboard@Persistence", () => {
  test("game over saves score and persists across reload", async ({ page }) => {
    await page.goto("/?test=1");

    await page.getByRole("button", { name: "Incepe jocul" }).click();
    // Set a deterministic score via test controls
    await page.getByTestId("force-score").click();
    // Trigger game over
    await page.getByTestId("force-gameover").click();

    await expect(page.getByText(/Top scoruri \(Classic\)/)).toBeVisible();
    await expect(page.getByTestId("leaderboard").getByText(/1[.,]?234/)).toBeVisible();

    await page.reload();

    await expect(page.getByText(/Top scoruri \(Classic\)/)).toBeVisible();
    await expect(page.getByTestId("leaderboard").getByText(/1[.,]?234/)).toBeVisible();
  });
});
