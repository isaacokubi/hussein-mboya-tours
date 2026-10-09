import { defineConfig } from "@playwright/test";
import process from "node:process";

const localPreview = process.env.PLAYWRIGHT_LOCAL_PREVIEW === "true";

export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: process.env.DEMO_FRONTEND_URL || (localPreview ? "http://127.0.0.1:4173" : "https://hussein-mboya-tours.vercel.app"),
    browserName: "chromium",
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    trace: process.env.DEMO_TEST_PASSWORD || process.env.DEMO_SMOKE_PASSWORD ? "off" : "retain-on-failure",
  },
  ...(localPreview ? {
    webServer: {
      command: "npm run preview -- --host 127.0.0.1 --port 4173 --strictPort",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  } : {}),
});
