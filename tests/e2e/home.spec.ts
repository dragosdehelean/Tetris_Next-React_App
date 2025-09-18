import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("displays hero content and CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Tetris Neon Odyssey" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Începe jocul" })).toBeVisible();
  });
});