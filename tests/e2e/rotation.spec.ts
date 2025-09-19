import { test, expect } from "@playwright/test";

function parseRotationText(text: string) {
  // format: "rot=1 type=T"
  const m = text.match(/rot=(\d)/);
  return m ? Number(m[1]) : null;
}

test.describe("Rotation@Keys", () => {
  test("ArrowUp rotates visually CW (index -1), PageUp rotates visually CCW (index +1)", async ({ page }) => {
    await page.goto("/?test=1");
    await page.getByTestId("primary-action-button").click();

    const debug = page.getByTestId("debug-rotation");
    await expect(debug).toBeVisible();
    const startRot = parseRotationText(await debug.textContent() || "") ?? 0;

    await page.keyboard.press("ArrowUp");
    const cwRot = parseRotationText(await debug.textContent() || "");
    expect(cwRot).toBe(((startRot + 3) % 4));

    await page.keyboard.press("PageUp");
    const ccwRot = parseRotationText(await debug.textContent() || "");
    expect(ccwRot).toBe(startRot);
  });
});
