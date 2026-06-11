import { chromium } from '@playwright/test';
import { getFrontdoorUrl, getInstanceUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const COURSE_OBJECT_ID = '01IRK00000DOWAY';
const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const instanceUrl = getInstanceUrl();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// Boot the session
await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });

// ── Screenshot 1: Fields and Relationships ────────────────────────────────────
await page.goto(
  `${instanceUrl}/lightning/setup/ObjectManager/${COURSE_OBJECT_ID}/FieldsAndRelationships/view`,
  { waitUntil: 'commit' }
);
await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(2000);

const fieldsPath = join(SCREENSHOTS_DIR, `${datetime}_course-fields-and-relationships.png`);
await page.screenshot({ path: fieldsPath, fullPage: false });
console.log(`Screenshot saved: ${fieldsPath}`);

// ── Screenshot 2: Deleted Fields ──────────────────────────────────────────────
await page.getByRole('button', { name: 'Deleted Fields' }).click();
await page.waitForTimeout(4000);

const deletedPath = join(SCREENSHOTS_DIR, `${datetime}_course-deleted-fields.png`);
await page.screenshot({ path: deletedPath, fullPage: false });
console.log(`Screenshot saved: ${deletedPath}`);

await context.close();
await browser.close();
