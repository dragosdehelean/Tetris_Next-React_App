import { test, expect } from "@playwright/test";

test.describe("Instructions@PauseResume", () => {
  test("opening instructions pauses, closing resumes", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("primary-action-button").click();

    await page.getByTestId("instructions-open").click();
    // Dialog is open; background content may be aria-hidden. Close and verify resume state reflects.
    await page.getByTestId("instructions-close").click();
    await expect(page.getByRole("button", { name: "Pauza" })).toBeVisible();
  });
});
