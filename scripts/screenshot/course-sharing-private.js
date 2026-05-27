import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// Navigate to the Sharing Settings page in Setup
await page.goto(
  getFrontdoorUrl('/lightning/setup/SecuritySharing/home'),
  { waitUntil: 'commit' }
);

// Wait for the page to load
await page.locator('h1, .slds-page-header, iframe').first()
  .waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(4000);

// Sharing Settings is in a legacy iframe — switch into it if present
const iframe = page.frameLocator('iframe[name="setupComponent"], iframe').first();

// Try to find the Course row in the sharing settings table
const courseRow = iframe.locator('tr, .detailRow').filter({ hasText: /Course/ }).first();
await courseRow.waitFor({ state: 'visible', timeout: 20_000 });

// Scroll the row into view
await courseRow.scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);

await page.screenshot({ path: 'playwright/screenshots/course-sharing-private.png', fullPage: false });

await context.close();
await browser.close();
