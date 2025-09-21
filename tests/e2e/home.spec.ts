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

    const settingsDialog = page.getByRole("dialog");
    await expect(settingsDialog).toBeVisible();
    await expect(settingsDialog.getByRole("heading", { name: /⚙️ Setări/ })).toBeVisible();

    // Verifică că dialogul s-a deschis și conține toate secțiunile
    await expect(settingsDialog.getByText("🎮 Controale")).toBeVisible();
    await expect(settingsDialog.getByText(/Audio/)).toBeVisible();
    await expect(settingsDialog.getByText(/👻 Vizuale/)).toBeVisible();
    await expect(settingsDialog.getByText("🎨 Teme")).toBeVisible();

    // Verifică setările pentru preferința de mână
    await expect(settingsDialog.getByText("Dreptaci (Hard Drop → Soft Drop)")).toBeVisible();
    await expect(settingsDialog.getByText("Stângaci (Soft Drop → Hard Drop)")).toBeVisible();

    // Verifică opțiunile de rotație
    await expect(settingsDialog.getByText("⟳ Clockwise (în sensul acelor)")).toBeVisible();
    await expect(settingsDialog.getByText("⟲ Counter-Clockwise (invers acelor)")).toBeVisible();

    // Verifică setările audio
    await expect(settingsDialog.getByText("Volum:")).toBeVisible();
    await expect(settingsDialog.getByText("Dezactivează sunetul")).toBeVisible();

    // Verifică setările vizuale
    await expect(settingsDialog.getByText("Afișează piesa fantomă")).toBeVisible();

    // Închide dialogul
    await settingsDialog.getByRole("button", { name: "✕" }).click();
    await expect(settingsDialog).toBeHidden();
  });
});
