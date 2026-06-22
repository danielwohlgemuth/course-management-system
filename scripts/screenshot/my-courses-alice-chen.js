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

// Boot admin session directly on Alice Chen's Contact record
await page.goto(
  getFrontdoorUrl('/003RK00001pbPsnYAE'),
  { waitUntil: 'commit' }
);
await page.waitForTimeout(3000);

// Click "Show more actions" then "Log in to Experience as User"
await page.getByRole('button', { name: 'Show more actions' }).click();
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).waitFor({ state: 'visible', timeout: 10_000 });
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).click();

// Wait for the Experience Site to load in the same page
await page.waitForTimeout(4000);

// Click "My Courses" in the Experience Site navigation
await page.getByRole('link', { name: 'My Courses' }).waitFor({ state: 'visible', timeout: 30_000 });
await page.getByRole('link', { name: 'My Courses' }).click();

// Wait for the course list to render
await page.locator('dxp-record-layout, .slds-page-header, h1, h2, h3').first()
  .waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(3000);

const screenshotPath = join(SCREENSHOTS_DIR, `${datetime}_my-courses-alice-chen.png`);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
