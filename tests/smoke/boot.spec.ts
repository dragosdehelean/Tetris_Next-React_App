import { test, expect } from "@playwright/test";

test("smoke: homepage renders without console errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push(msg.text());
    }
  });

  await page.goto("/");

  await expect(page.getByTestId("primary-action-button")).toBeVisible();
  expect(errors).toHaveLength(0);
});
