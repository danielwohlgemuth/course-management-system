import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(
  getFrontdoorUrl('/lightning/setup/PermSets/home'),
  { waitUntil: 'commit' }
);

// Wait for Setup sidebar — reliable signal that the page has fully loaded
await page.locator('input[placeholder="Quick Find"]').waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(3000);

// Find the Permission Sets classic frame via Playwright's frame list
const permSetsFrame = page.frames().find(f => f.url().includes('/0PS'));
if (!permSetsFrame) throw new Error('Permission Sets frame not found');

// Click the "C" letter in the A–Z alphabet filter
await permSetsFrame.locator('a', { hasText: /^C$/ }).first()
  .waitFor({ state: 'visible', timeout: 20_000 });
await permSetsFrame.locator('a', { hasText: /^C$/ }).first().click();
await page.waitForTimeout(2000);

// Mask rows that are not course-specific permission sets
const maskLocators = [permSetsFrame.locator('.x-grid3-row').filter({ hasNotText: /Course/ })];

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const screenshotPath = join(SCREENSHOTS_DIR, `${datetime}_permission-sets-filter-c.png`);
await page.screenshot({ path: screenshotPath, fullPage: false, mask: maskLocators, maskColor: '#808080' });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
