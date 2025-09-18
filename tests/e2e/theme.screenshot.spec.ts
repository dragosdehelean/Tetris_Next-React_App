import { test } from "@playwright/test";
import { promises as fs } from "fs";

const THEMES = ["neon", "cityscape", "aurora"] as const;

test.beforeAll(async () => {
  await fs.mkdir("test-results/screenshots", { recursive: true });
});

for (const theme of THEMES) {
  test(`captures ${theme} theme screenshot`, async ({ page }) => {
    await page.goto(`/?theme=${theme}`);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(200);
    await page.screenshot({ path: `test-results/screenshots/${theme}-theme.png`, fullPage: true });
  });
}