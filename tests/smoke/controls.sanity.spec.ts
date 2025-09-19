import { test, expect } from "@playwright/test";

test("ST-03 ControlsSanity: minimal input set yields no errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });

  await page.goto("/");
  await page.getByTestId("primary-action-button").click();
  await page.waitForTimeout(500);
  await expect(page.getByTestId("primary-action-button")).toBeVisible();

  await page.keyboard.press("ArrowLeft");
  await page.keyboard.press("ArrowUp");
  await page.keyboard.press("Space");
  await expect(page.getByTestId("game-canvas")).toBeVisible();
  expect(errors).toHaveLength(0);
});

