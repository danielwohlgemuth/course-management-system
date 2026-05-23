// @ts-check
import { defineConfig, devices } from '@playwright/test';
import { getInstanceUrl } from './tests/helpers/salesforce.js';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  timeout: 60_000,
  use: {
    baseURL: getInstanceUrl(),
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'setup',
      testMatch: '**/global-setup.js',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/session.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'screenshot',
      testMatch: '**/screenshot.spec.js',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'docs-screenshots',
      testMatch: '**/capture-docs-screenshots.spec.js',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/session.json',
      },
      dependencies: ['setup'],
    },
  ],
});
