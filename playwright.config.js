// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { ENV } = require('./config/env');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false, // Rules Builder flow (UC1) is stateful/sequential
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: ENV.APP_BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: ENV.API_BASE_URL,
      },
    },
  ],
});
