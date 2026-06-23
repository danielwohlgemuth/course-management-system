import { chromium } from '@playwright/test';
import { getFrontdoorUrl, getInstanceUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'assets';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

// Boot the session on the home page
await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(4000);

// Click the first overlap-group badge (the Monday "2" stack indicator)
const overlapGroup = page.locator('.overlap-group').first();
await overlapGroup.waitFor({ state: 'visible', timeout: 15_000 });
await overlapGroup.click();

// Wait for the popover to appear
await page.locator('.overlap-popover').waitFor({ state: 'visible', timeout: 10_000 });
await page.waitForTimeout(1000);

const screenshotPath = join(SCREENSHOTS_DIR, 'calendar-overlap-popover.png');
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
