import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("displays hero content and CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Tetris Odyssey" })).toBeVisible();
    await expect(page.getByTestId("primary-action-button")).toBeVisible();
    await expect(page.getByTestId("theme-switch")).toBeVisible();
  });
});
