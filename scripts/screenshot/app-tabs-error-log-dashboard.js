import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });

// Navigate into the Course Manager app
const waffle = page.locator('one-app-launcher-header .slds-icon-waffle, [data-id="AppLauncherButton"]').first();
await waffle.click();
const search = page.locator('input[placeholder="Search apps and items..."]');
await search.waitFor({ state: 'visible', timeout: 10_000 });
await search.fill('Course Manager');
await page.waitForTimeout(1500);
const tile = page.locator('a', { hasText: 'Course Manager' }).first();
await tile.waitFor({ state: 'visible', timeout: 10_000 });
await tile.click();

// Land on the app's Home tab and wait for the nav bar (with the new tabs) to render
await page.locator('one-app-nav-bar-item-root', { hasText: 'Home' }).first().waitFor({ state: 'visible', timeout: 30_000 });
await page.locator('one-app-nav-bar-item-root', { hasText: 'Dashboard' }).first().waitFor({ state: 'visible', timeout: 30_000 });
await page.locator('one-app-nav-bar-item-root', { hasText: 'Error Log' }).first().waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(2000);

const screenshotPath = join(SCREENSHOTS_DIR, `${datetime}_app-tabs-error-log-dashboard.png`);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
