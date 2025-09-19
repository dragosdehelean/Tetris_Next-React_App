import { test, expect } from "@playwright/test";

const TYPES = ["S", "Z", "L", "J"] as const;

function parseRot(text: string) {
  const m = text.match(/rot=(\d)/);
  return m ? Number(m[1]) : null;
}

for (const t of TYPES) {
  test(`RotationIndex@${t}`, async ({ page }) => {
    await page.goto("/?test=1");
    
    // Wait for page to be ready
    await page.waitForTimeout(500);
    
    const startBtn = page.getByTestId("primary-action-button");
    await expect(startBtn).toBeVisible();
    await expect(startBtn).toContainText("Start");
    
    await startBtn.click();
    
    // Wait for game to start and button to change to Pauza
    await expect(page.getByTestId("primary-action-button")).toContainText("Pauza", { timeout: 15000 });
    
    await page.getByTestId(`debug-set-${t.toLowerCase()}`).click();

    const debug = page.getByTestId("debug-rotation");
    await expect(debug).toContainText(/rot=\d/, { timeout: 10000 });
    const start = parseRot((await debug.textContent()) ?? "") ?? 0;

    await page.keyboard.press("ArrowUp");
    await expect(debug).toContainText(/rot=\d/, { timeout: 5000 });
    const r1 = parseRot((await debug.textContent()) ?? "");
    expect(r1).toBe(((start + 3) % 4));

    await page.keyboard.press("PageUp");
    await expect(debug).toContainText(/rot=\d/, { timeout: 5000 });
    const r2 = parseRot((await debug.textContent()) ?? "");
    expect(r2).toBe(start);
  });
}
