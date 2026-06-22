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

// Boot admin session on Alice Chen's Contact record
await page.goto(
  getFrontdoorUrl('/003RK00001pbPsnYAE'),
  { waitUntil: 'commit' }
);
await page.waitForTimeout(3000);

// Log in to Experience Site as Alice Chen
await page.getByRole('button', { name: 'Show more actions' }).click();
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).waitFor({ state: 'visible', timeout: 10_000 });
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).click();

// Wait for the Experience Site to load
await page.waitForTimeout(4000);

// Navigate to Join a Course page
await page.getByRole('link', { name: 'Join a Course' }).waitFor({ state: 'visible', timeout: 30_000 });
await page.getByRole('link', { name: 'Join a Course' }).click();

// Wait for the datatable to render
await page.waitForTimeout(4000);

const label = process.env.SCREENSHOT_LABEL ?? datetime;
const screenshotPath = join(SCREENSHOTS_DIR, `${label}_join-course-instructor-name.png`);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
