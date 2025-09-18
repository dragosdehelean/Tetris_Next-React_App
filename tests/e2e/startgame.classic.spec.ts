import { test, expect } from "@playwright/test";

test.describe("StartGame@Classic", () => {
  test("clicking Start switches button to Pauza", async ({ page }) => {
    await page.goto("/");

    const startBtn = page.getByRole("button", { name: "Incepe jocul" });
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    await expect(page.getByRole("button", { name: "Pauza" })).toBeVisible();
  });
});

