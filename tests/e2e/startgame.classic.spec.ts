import { test, expect } from "@playwright/test";

test.describe("StartGame@Classic", () => {
  test("clicking Start switches button to Pauza", async ({ page }) => {
    await page.goto("/");

    const startBtn = page.getByTestId("primary-action-button");
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    await expect(page.getByTestId("primary-action-button")).toContainText("Pauza", { timeout: 10000 });
  });
});

