import { test, expect } from "@playwright/test";

const TYPES = ["S", "Z", "L", "J"] as const;

for (const t of TYPES) {
  test(`RotationScreenshots@${t}`, async ({ page }, testInfo) => {
    await page.goto("/?test=1");
    await page.getByRole("button", { name: "Incepe jocul" }).click();
    await page.getByTestId(`debug-set-${t.toLowerCase()}`).click();

    const canvas = page.getByTestId("game-canvas");
    await expect(canvas).toBeVisible();

    await canvas.screenshot({ path: testInfo.outputPath(`rot-${t}-0.png`) });
    await page.keyboard.press("ArrowUp");
    await canvas.screenshot({ path: testInfo.outputPath(`rot-${t}-1.png`) });
    await page.keyboard.press("ArrowUp");
    await canvas.screenshot({ path: testInfo.outputPath(`rot-${t}-2.png`) });
    await page.keyboard.press("ArrowUp");
    await canvas.screenshot({ path: testInfo.outputPath(`rot-${t}-3.png`) });
    await page.keyboard.press("ArrowUp");
    await canvas.screenshot({ path: testInfo.outputPath(`rot-${t}-0-again.png`) });
  });
}
