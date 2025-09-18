import { test, expect } from "@playwright/test";

test("ST-02 QuickStart: start game and stay stable", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });

  await page.goto("/");
  await page.getByRole("button", { name: "Incepe jocul" }).click();
  await expect(page.getByRole("button", { name: "Pauza" })).toBeVisible();

  await page.waitForTimeout(500);
  await expect(page.getByTestId("game-canvas")).toBeVisible();
  expect(errors).toHaveLength(0);
});

