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

// Boot session
await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(3000);

// --- Enrollment Dashboard ---
await page.goto(`${instanceUrl}/lightning/r/Dashboard/01ZRK000008Ja3C2AS/view`, { waitUntil: 'commit' });
await page.waitForTimeout(12000);

// The dashboard renders inside its own iframe (desktopDashboards/dashboardApp.app),
// so the Refresh button must be located within that frame, not the top-level page.
const dashboardFrame = page.frames().find((f) => f.url().includes('desktopDashboards'));
const refreshButton = dashboardFrame.locator('button.refresh');
await refreshButton.waitFor({ state: 'visible', timeout: 15_000 });
await refreshButton.click();
await page.waitForTimeout(10000);

await page.screenshot({
    path: join(SCREENSHOTS_DIR, `${datetime}_enrollment-dashboard.png`),
    fullPage: false,
});
console.log(`Screenshot saved: ${datetime}_enrollment-dashboard.png`);

// --- Enrollment by Instructor report ---
await page.goto(`${instanceUrl}/lightning/r/Report/00ORK00000QfGxu2AF/view`, { waitUntil: 'commit' });
await page.waitForTimeout(15000);
await page.screenshot({
    path: join(SCREENSHOTS_DIR, `${datetime}_enrollment-report.png`),
    fullPage: false,
});
console.log(`Screenshot saved: ${datetime}_enrollment-report.png`);

await context.close();
await browser.close();
