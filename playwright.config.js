// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { ENV } = require('./config/env');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 180_000,
  expect: { timeout: 15_000 },
  // AA Community Edition allows only ONE active session per user
  // (multipleLogin=false in the auth token): any new login — UI or API —
  // invalidates the previous one. Everything must run strictly serially.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
  ],
  use: {
    baseURL: ENV.APP_BASE_URL,
    // Traces/videos capture full network request bodies, including the
    // POST /v2/authentication body with the account password. The CI workflow
    // publishes the HTML report (with attachments) to public GitHub Pages, so
    // these are disabled in CI to avoid leaking credentials. They stay on
    // locally, where the report is private, for debugging.
    trace: process.env.CI ? 'off' : 'retain-on-failure',
    screenshot: process.env.CI ? 'off' : 'only-on-failure',
    video: process.env.CI ? 'off' : 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    viewport: { width: 1500, height: 950 },
  },
  projects: [
    {
      name: 'ui-chromium',
      testDir: './tests/ui',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1500, height: 950 } },
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: { baseURL: ENV.API_BASE_URL },
    },
  ],
});
