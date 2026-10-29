import { defineConfig } from "@playwright/test";
import process from "node:process";

export default defineConfig({
  testDir: "./e2e/tour-edit",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4174",
    browserName: "chromium",
    headless: true,
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4174 --strictPort",
    url: "http://127.0.0.1:4174",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
