import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../../tests/helpers/salesforce.js';
import { writeFileSync, mkdirSync } from 'fs';

const COURSE_RECORD_ID = 'a00RK00000k5aMvYAI';
const OUTPUT_DIR = 'playwright/screenshots';
mkdirSync(OUTPUT_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

const browser = await chromium.launch({ headless: true, acceptDownloads: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, acceptDownloads: true });
const page = await context.newPage();

const url = getFrontdoorUrl(`/apex/CoursePdfReport?id=${COURSE_RECORD_ID}`);

const [download] = await Promise.all([
  page.waitForEvent('download', { timeout: 30_000 }).catch(() => null),
  page.goto(url, { waitUntil: 'commit' }).catch(() => null),
]);

const outPath = `${OUTPUT_DIR}/${datetime}_classroom_pdf_check.pdf`;
if (download) {
  await download.saveAs(outPath);
  console.log('Saved PDF via download event to', outPath);
} else {
  await page.waitForTimeout(2000);
  const buffer = await page.pdf().catch(() => null);
  if (buffer) {
    writeFileSync(outPath, buffer);
    console.log('Saved rendered page as PDF to', outPath);
  } else {
    const html = await page.content();
    writeFileSync(`${OUTPUT_DIR}/${datetime}_classroom_pdf_check.html`, html);
    console.log('No download/PDF captured; saved page HTML instead. URL was:', page.url());
  }
}

await context.close();
await browser.close();
