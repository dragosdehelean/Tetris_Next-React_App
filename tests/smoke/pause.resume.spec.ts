import { test, expect } from "@playwright/test";

test("ST-04 PauseResume: pause and resume after 300ms", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Incepe jocul" }).click();

  const pauseBtn = page.getByRole("button", { name: "Pauza" });
  await expect(pauseBtn).toBeVisible();
  await pauseBtn.click();

  const resumeBtn = page.getByRole("button", { name: "Reia jocul" });
  await expect(resumeBtn).toBeVisible();
  await page.waitForTimeout(300);
  await resumeBtn.click();
  await expect(page.getByRole("button", { name: "Pauza" })).toBeVisible();
});

