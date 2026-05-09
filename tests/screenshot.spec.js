import { test } from '@playwright/test';
import { getFrontdoorUrl } from './helpers/salesforce.js';
import { mkdirSync } from 'fs';

test('screenshot org home', async ({ page }) => {
  mkdirSync('playwright/screenshots', { recursive: true });
  await page.goto(getFrontdoorUrl('/lightning/page/home'));
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'playwright/screenshots/org-home.png' });
});
