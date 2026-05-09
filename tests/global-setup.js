import { test as setup, expect } from '@playwright/test';
import { getFrontdoorUrl } from './helpers/salesforce.js';

const SESSION_FILE = 'playwright/.auth/session.json';

setup('authenticate with Salesforce org', async ({ page }) => {
  // The frontdoor URL is a one-time token that establishes a Salesforce session.
  // Redirect directly into Lightning so the Lightning session cookie is set before saving state.
  await page.goto(getFrontdoorUrl('/lightning/page/home'));
  await expect(page.getByTitle('App Launcher')).toBeVisible({ timeout: 30_000 });
  await page.context().storageState({ path: SESSION_FILE });
});
