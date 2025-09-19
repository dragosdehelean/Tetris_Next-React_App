import { test, expect } from "@playwright/test";

test.describe("StartGame@Classic", () => {
  test("clicking Start switches button to Pauza", async ({ page }) => {
    await page.goto("/");

    const startBtn = page.getByTestId("primary-action-button");
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toContainText("Start");
    
    // Wait a bit for the page to be fully loaded
    await page.waitForTimeout(500);
    
    await startBtn.click();

    // Wait for state change with longer timeout
    await expect(page.getByTestId("primary-action-button")).toContainText("Pauza", { timeout: 15000 });
  });
});

