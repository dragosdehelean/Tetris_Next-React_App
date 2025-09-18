import { test, expect } from "@playwright/test";

const TYPES = ["S", "Z", "L", "J"] as const;

function parseRot(text: string) {
  const m = text.match(/rot=(\d)/);
  return m ? Number(m[1]) : null;
}

for (const t of TYPES) {
  test(`RotationIndex@${t}`, async ({ page }) => {
    await page.goto("/?test=1");
    await page.getByRole("button", { name: "Incepe jocul" }).click();
    await page.getByTestId(`debug-set-${t.toLowerCase()}`).click();

    const debug = page.getByTestId("debug-rotation");
    const start = parseRot((await debug.textContent()) ?? "") ?? 0;

    await page.keyboard.press("ArrowUp");
    const r1 = parseRot((await debug.textContent()) ?? "");
    expect(r1).toBe(((start + 3) % 4));

    await page.keyboard.press("PageUp");
    const r2 = parseRot((await debug.textContent()) ?? "");
    expect(r2).toBe(start);
  });
}
