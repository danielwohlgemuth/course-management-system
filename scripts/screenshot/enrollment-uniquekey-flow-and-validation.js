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

// Boot via PermSets — this lands the session on salesforce-setup.com so that
// subsequent Object Manager navigations resolve correctly in headless mode.
await page.goto(getFrontdoorUrl('/lightning/setup/PermSets/home'), { waitUntil: 'commit' });
await page.locator('input[placeholder="Quick Find"]').waitFor({ state: 'visible', timeout: 45_000 });

// Navigate to the Enrollment__c Validation Rules list
await page.goto(
  `${instanceUrl}/lightning/setup/ObjectManager/Enrollment__c/ValidationRules/view`,
  { waitUntil: 'commit' }
);
await page.waitForTimeout(8000);

// --- Student_Cannot_Change ---
await page.getByRole('link', { name: 'Student_Cannot_Change' }).first().click();
await page.waitForTimeout(3000);
const studentPath = join(SCREENSHOTS_DIR, `${datetime}_enrollment-validation-student-cannot-change.png`);
await page.screenshot({ path: studentPath, fullPage: false });
console.log(`Screenshot saved: ${studentPath}`);

// --- Course_Cannot_Change ---
await page.getByRole('tab', { name: 'Validation Rules' }).click();
await page.waitForTimeout(2000);
await page.getByRole('link', { name: 'Course_Cannot_Change' }).first().click();
await page.waitForTimeout(3000);
const coursePath = join(SCREENSHOTS_DIR, `${datetime}_enrollment-validation-course-cannot-change.png`);
await page.screenshot({ path: coursePath, fullPage: false });
console.log(`Screenshot saved: ${coursePath}`);

// --- Enrollment Set UniqueKey flow ---
await page.goto(
  `${instanceUrl}/lightning/setup/Flows/home`,
  { waitUntil: 'commit' }
);
await page.waitForTimeout(5000);

// Clicking the flow name opens Flow Builder in a popup
const popupPromise = page.waitForEvent('popup');
await page.getByRole('link', { name: 'Enrollment Set UniqueKey' }).click();
const flowPage = await popupPromise;

// Flow Builder takes a while to render the canvas
await flowPage.waitForTimeout(10000);
const flowPath = join(SCREENSHOTS_DIR, `${datetime}_enrollment-set-uniquekey-flow.png`);
await flowPage.screenshot({ path: flowPath, fullPage: false });
console.log(`Screenshot saved: ${flowPath}`);

await context.close();
await browser.close();
