/**
 * Playwright Configuration for E2E Tests (Story 7.1)
 *
 * Browser: Chromium
 * Parallel: 1 worker (Instagram test account single-threaded)
 * Timeout: 10 seconds per test
 * Retries: 1 (for flaky Instagram steps)
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '*.spec.ts',
  timeout: 30 * 1000, // 30s per test
  globalTimeout: 15 * 60 * 1000, // 15 minutes total
  expect: {
    timeout: 5 * 1000, // 5s for assertions
  },

  fullyParallel: false, // Sequential execution (Instagram rate limiting)
  workers: 1, // Single worker

  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/e2e/reports', open: 'never' }],
    ['json', { outputFile: 'tests/e2e/reports/results.json' }],
  ],

  use: {
    baseURL: process.env.STAGING_URL || 'http://localhost:3000',
    trace: 'on-first-retry', // Trace on retry
    screenshot: 'only-on-failure', // Screenshots only when failed
    video: 'retain-on-failure', // Videos only when failed
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: process.env.STAGING_URL ? undefined : {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: process.env.CI ? false : true,
  },
});
