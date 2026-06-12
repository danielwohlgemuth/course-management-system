import { chromium } from '@playwright/test';
import { getFrontdoorUrl, getInstanceUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const instanceUrl = getInstanceUrl();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// Boot the session
await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(3000);

// Navigate directly to the CourseStudent permission set assignments Lightning page
// (15-char perm set ID: 0PSRK00000GthWB)
await page.goto(
  `${instanceUrl}/lightning/setup/PermSets/0PSRK00000GthWB/PermissionSetAssignment/home`,
  { waitUntil: 'commit' }
);

// Wait for the assignments table to render
await page.locator('table').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(3000);

const screenshotPath = join(SCREENSHOTS_DIR, `${datetime}_course-student-perm-set-assignments.png`);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
