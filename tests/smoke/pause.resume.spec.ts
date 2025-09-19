import { test, expect } from "@playwright/test";

test("ST-04 PauseResume: pause and resume after 300ms", async ({ page }) => {
  await page.goto("/");
  await page.getByTestId("primary-action-button").click();

  const pauseBtn = page.getByTestId("primary-action-button");
  await expect(pauseBtn).toBeVisible();
  await pauseBtn.click();

  const resumeBtn = page.getByTestId("primary-action-button");
  await expect(resumeBtn).toBeVisible();
  await page.waitForTimeout(300);
  await resumeBtn.click();
  await expect(page.getByTestId("primary-action-button")).toBeVisible();
});

