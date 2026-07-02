import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });
const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/lightning/r/Course__c/a00RK00000k5aMvYAI/view'), { waitUntil: 'commit' });
await page.locator('.slds-page-header, h1').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(4000);

// Clicking the highlights-panel quick action opens a modal that immediately
// triggers a browser download of the rendered PDF (renderAs="pdf" pages don't
// render inline inside the quick action iframe).
const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 20_000 }).catch(() => null),
  page.getByRole('button', { name: 'Download PDF Report' }).click()
]);

if (download) {
  console.log('Download suggested filename:', download.suggestedFilename());
  const dlPath = join(SCREENSHOTS_DIR, `downloaded-${download.suggestedFilename()}`);
  await download.saveAs(dlPath);
  console.log('Saved download to:', dlPath);
}

await page.waitForTimeout(1000);
const screenshotPath = join(SCREENSHOTS_DIR, `${datetime}_course-pdf-report-modal.png`);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
