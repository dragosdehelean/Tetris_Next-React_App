import baseConfig from "./playwright.config";
import { defineConfig, devices } from "@playwright/test";

const chromiumProject = Array.isArray(baseConfig.projects)
  ? baseConfig.projects.find((project) => project.name === "chromium")
  : undefined;

export default defineConfig({
  ...baseConfig,
  testDir: "./tests/smoke",
  projects: [
    {
      name: "chromium-smoke",
      use: chromiumProject?.use ?? { ...devices["Desktop Chrome"] },
    },
  ],
});