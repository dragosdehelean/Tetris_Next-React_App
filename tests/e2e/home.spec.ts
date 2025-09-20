import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("displays hero content and CTA", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Tetris Odyssey" })).toBeVisible();
    await expect(page.getByTestId("primary-action-button")).toBeVisible();
    await expect(page.getByTestId("settings-button")).toBeVisible();
  });

  test("opens settings dialog and displays all sections", async ({ page }) => {
    await page.goto("/");

    // Click pe butonul de setări
    await page.getByTestId("settings-button").click();

    // Verifică că dialogul s-a deschis și conține toate secțiunile
    await expect(page.getByText("⚙️ Setări")).toBeVisible();
    await expect(page.getByText("🎮 Controale")).toBeVisible();
    await expect(page.getByText("� Audio")).toBeVisible();
    await expect(page.getByText("�👻 Vizuale")).toBeVisible();
    await expect(page.getByText("🎨 Teme")).toBeVisible();

    // Verifică setările pentru preferința de mână
    await expect(page.getByText("Dreptaci (Hard Drop → Soft Drop)")).toBeVisible();
    await expect(page.getByText("Stângaci (Soft Drop → Hard Drop)")).toBeVisible();

    // Verifică opțiunile de rotație
    await expect(page.getByText("⟳ Clockwise (în sensul acelor)")).toBeVisible();
    await expect(page.getByText("⟲ Counter-Clockwise (invers acelor)")).toBeVisible();

    // Verifică setările audio
    await expect(page.getByText("Volum:")).toBeVisible();
    await expect(page.getByText("Dezactivează sunetul")).toBeVisible();

    // Verifică setările vizuale
    await expect(page.getByText("Afișează piesa fantomă")).toBeVisible();

    // Închide dialogul
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByText("⚙️ Setări")).not.toBeVisible();
  });
});
