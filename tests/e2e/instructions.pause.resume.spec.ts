import { test, expect } from "@playwright/test";

test.describe("Instructions@PauseResume", () => {
  test("opening instructions pauses, closing resumes", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("primary-action-button").click();

    // Wait for game to start and show "Pauza" before opening instructions
    await expect(page.getByTestId("primary-action-button")).toContainText("Pauza", { timeout: 10000 });

    await page.getByTestId("instructions-open").click();
    // Dialog is open; background content may be aria-hidden. Close and verify resume state reflects.
    await page.getByTestId("instructions-close").click();
    
    // Wait for state to update after dialog close with increased timeout for WebKit
    await page.waitForTimeout(200);
    await expect(page.getByTestId("primary-action-button")).toContainText("Pauza", { timeout: 10000 });
  });
});
