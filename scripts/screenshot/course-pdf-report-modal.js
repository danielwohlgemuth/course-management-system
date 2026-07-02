import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });
const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();

// Boot admin session on the Course record page
await page.goto(getFrontdoorUrl('/lightning/r/Course__c/a00RK00000k5aMvYAI/view'), { waitUntil: 'commit' });
await page.locator('.slds-page-header, h1').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(4000);

// Open the "Download PDF Report" quick action. The renderAs="pdf" response
// triggers a browser download rather than rendering inline in the modal iframe,
// and the modal's "Save" button stays disabled since the page has no form to submit.
await Promise.all([
  page.waitForEvent('download', { timeout: 20_000 }).catch(() => null),
  page.getByRole('button', { name: 'Download PDF Report' }).click()
]);

// Give the modal time to fully render before capturing it
await page.waitForTimeout(2500);

const screenshotPath = join(SCREENSHOTS_DIR, `${datetime}_course-pdf-report-modal.png`);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
