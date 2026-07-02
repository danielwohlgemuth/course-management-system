import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// Boot admin session on the Course record page
await page.goto(getFrontdoorUrl('/lightning/r/Course__c/a00RK00000k5aMvYAI/view'), { waitUntil: 'commit' });
await page.locator('.slds-page-header, h1').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(4000);
await page.reload({ waitUntil: 'commit' });
await page.locator('.slds-page-header, h1').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(5000);

const screenshotPath = join(SCREENSHOTS_DIR, `${datetime}_course-pdf-report-action.png`);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
