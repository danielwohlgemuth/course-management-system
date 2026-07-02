import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync, renameSync } from 'fs';
import { join, resolve } from 'path';
import { execFileSync } from 'child_process';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();

// Boot admin session directly on Elena Marsh's Contact record (instructor of CRS-0000)
await page.goto(getFrontdoorUrl('/003RK00001orKQbYAM'), { waitUntil: 'commit' });
await page.waitForTimeout(3000);

// Log in to Experience Site as Alice Chen
await page.getByRole('button', { name: 'Show more actions' }).click();
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).waitFor({ state: 'visible', timeout: 10_000 });
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).click();

// Wait for the Experience Site to load in the same page
await page.waitForTimeout(4000);

// Navigate to My Courses
await page.getByRole('link', { name: 'My Courses' }).waitFor({ state: 'visible', timeout: 30_000 });
await page.getByRole('link', { name: 'My Courses' }).click();

// Wait for the course list to render
await page.locator('dxp-record-layout, .slds-page-header, h1, h2, h3').first()
  .waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(3000);

// Click into the first course record to open its detail page
const courseLink = page.getByRole('link', { name: /^CRS-\d+$/ }).first();
await courseLink.waitFor({ state: 'visible', timeout: 30_000 });
await courseLink.click();

// Wait for the course detail page to render, including the download button
await page.locator('dxp-record-layout, .slds-page-header, h1, h2, h3').first()
  .waitFor({ state: 'visible', timeout: 30_000 });
await page.getByRole('button', { name: 'Download PDF Report' }).waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(2000);

const detailScreenshotPath = join(SCREENSHOTS_DIR, `${datetime}_course-pdf-report-community-detail.png`);
await page.screenshot({ path: detailScreenshotPath, fullPage: false });
console.log(`Screenshot saved: ${detailScreenshotPath}`);

// Click the button and capture either a popup tab rendering the PDF inline, or a file download
const [popupOrDownload] = await Promise.all([
  Promise.race([
    context.waitForEvent('page', { timeout: 15_000 }).then((p) => ({ type: 'popup', value: p })),
    page.waitForEvent('download', { timeout: 15_000 }).then((d) => ({ type: 'download', value: d }))
  ]),
  page.getByRole('button', { name: 'Download PDF Report' }).click()
]);

const pdfScreenshotPath = join(SCREENSHOTS_DIR, `${datetime}_course-pdf-report-community-pdf.png`);

if (popupOrDownload.type === 'popup') {
  const pdfPage = popupOrDownload.value;
  await pdfPage.waitForLoadState('load', { timeout: 30_000 }).catch(() => {});
  await pdfPage.waitForTimeout(3000);
  await pdfPage.screenshot({ path: pdfScreenshotPath, fullPage: false });
  console.log(`Screenshot saved: ${pdfScreenshotPath}`);
} else {
  const download = popupOrDownload.value;
  const downloadedPath = join(SCREENSHOTS_DIR, `${datetime}_course-pdf-report-community.pdf`);
  await download.saveAs(downloadedPath);
  console.log(`PDF downloaded: ${downloadedPath}`);

  // Render the PDF's first page to a PNG via macOS Quick Look
  execFileSync('qlmanage', ['-t', '-s', '1200', '-o', SCREENSHOTS_DIR, resolve(downloadedPath)]);
  const generatedThumbnail = join(SCREENSHOTS_DIR, `${datetime}_course-pdf-report-community.pdf.png`);
  renameSync(generatedThumbnail, pdfScreenshotPath);
  console.log(`Screenshot saved: ${pdfScreenshotPath}`);
}

await context.close();
await browser.close();
