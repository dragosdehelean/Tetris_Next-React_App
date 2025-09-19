import { test, expect } from "@playwright/test";

function parseRotationText(text: string) {
  const m = text.match(/rot=(\d)/);
  return m ? Number(m[1]) : null;
}

test.describe("RotationScreenshots", () => {
  test("capture successive rotations for T piece", async ({ page }, testInfo) => {
    await page.goto("/?test=1");
    await page.getByTestId("primary-action-button").click();
    await page.getByTestId("debug-set-t").click();

    const canvas = page.getByTestId("game-canvas");
    await expect(canvas).toBeVisible();

    // initial
    await canvas.screenshot({ path: testInfo.outputPath("rotation-0.png") });
    // CW
    await page.keyboard.press("ArrowUp");
    await canvas.screenshot({ path: testInfo.outputPath("rotation-1-cw.png") });
    await page.keyboard.press("ArrowUp");
    await canvas.screenshot({ path: testInfo.outputPath("rotation-2-cw.png") });
    await page.keyboard.press("ArrowUp");
    await canvas.screenshot({ path: testInfo.outputPath("rotation-3-cw.png") });
    await page.keyboard.press("ArrowUp");
    await canvas.screenshot({ path: testInfo.outputPath("rotation-0-cw.png") });

    // CCW one step from initial
    await page.keyboard.press("PageUp");
    await canvas.screenshot({ path: testInfo.outputPath("rotation-3-ccw.png") });
  });
});
