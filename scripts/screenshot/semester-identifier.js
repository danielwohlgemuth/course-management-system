import { chromium } from '@playwright/test';
import { getFrontdoorUrl, getInstanceUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const COURSE_RECORD_ID = 'a00RK00000k5aMvYAI';
const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const instanceUrl = getInstanceUrl();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// Boot the session
await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(3000);

// ── Screenshot 1: Record detail/view page ─────────────────────────────────────
await page.goto(`${instanceUrl}/lightning/r/Course__c/${COURSE_RECORD_ID}/view`, { waitUntil: 'commit' });
await page.getByText('Semester', { exact: true }).first().waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(2000);

const viewPath = join(SCREENSHOTS_DIR, `${datetime}_semester-field-record-view.png`);
await page.screenshot({ path: viewPath, fullPage: false });
console.log(`Screenshot saved: ${viewPath}`);

// ── Screenshot 2: Record edit mode ────────────────────────────────────────────
await page.getByRole('button', { name: 'Edit Semester', exact: true }).click();
await page.getByRole('combobox', { name: 'Semester', exact: true }).waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(1500);

const editPath = join(SCREENSHOTS_DIR, `${datetime}_semester-field-record-edit.png`);
await page.screenshot({ path: editPath, fullPage: false });
console.log(`Screenshot saved: ${editPath}`);

await context.close();
await browser.close();
