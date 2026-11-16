import { existsSync } from "node:fs";

import { defineConfig, devices } from "@playwright/test";

if (existsSync(".env")) process.loadEnvFile(".env");

/**
 * E2E chạy trên bản build production ở cổng 3100, với MỘT DATABASE RIÊNG (E2E_DATABASE_URL).
 * Trước khi test, e2e/global-setup.ts xoá sạch và seed lại database đó để kết quả lặp lại được,
 * nên không bao giờ trỏ E2E_DATABASE_URL vào database đang dùng để phát triển hay production.
 */
const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;
const databaseUrl = process.env.E2E_DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Thiếu E2E_DATABASE_URL. Xem .env.example và mục Kiểm thử trong README.");
}

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  // Các kịch bản dùng chung một database và có thứ tự (sinh viên đăng ký → giảng viên duyệt).
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"]],
  use: {
    baseURL,
    locale: "vi-VN",
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Chạy trên bản build production: cần `npm run build` trước (script test:e2e đã làm sẵn bước này).
    command: `npm run start -- -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      DATABASE_URL: databaseUrl,
      BETTER_AUTH_URL: baseURL,
    },
  },
});
