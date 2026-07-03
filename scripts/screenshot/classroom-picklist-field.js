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

// ── Screenshot 1: Record detail page showing the Classroom field ─────────────
await page.goto(`${instanceUrl}/lightning/r/Course__c/${COURSE_RECORD_ID}/view`, { waitUntil: 'commit' });
await page.getByText('Classroom', { exact: true }).first().waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(2000);

const viewPath = join(SCREENSHOTS_DIR, `${datetime}_classroom-field-record-view.png`);
await page.screenshot({ path: viewPath, fullPage: false });
console.log(`Screenshot saved: ${viewPath}`);

// ── Screenshot 2: All Courses list view showing the Classroom column ─────────
const waffle = page.locator('one-app-launcher-header .slds-icon-waffle, [data-id="AppLauncherButton"]').first();
await waffle.click();
const search = page.locator('input[placeholder="Search apps and items..."]');
await search.waitFor({ state: 'visible', timeout: 10_000 });
await search.fill('Course Manager');
await page.waitForTimeout(1500);
const tile = page.locator('a', { hasText: 'Course Manager' }).first();
await tile.waitFor({ state: 'visible', timeout: 10_000 });
await tile.click();

const coursesTab = page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first();
await coursesTab.waitFor({ state: 'visible', timeout: 30_000 });
await coursesTab.click();

await page.locator('force-list-view-manager-header, .listViewManagerHeader, .slds-page-header__title').first()
  .waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(2000);

// Switch to the All Courses list view via the list view picker trigger
const listViewPicker = page.locator('.triggerLink, .slds-page-header__name.slds-type-focus').first();
await listViewPicker.waitFor({ state: 'visible', timeout: 10_000 });
await listViewPicker.click();
const allCoursesOption = page.locator('a[title="All Courses"], span[title="All Courses"], lightning-base-combobox-item[data-value*="All"], li', { hasText: 'All Courses' }).first();
await allCoursesOption.waitFor({ state: 'visible', timeout: 10_000 });
await allCoursesOption.click();
await page.waitForTimeout(3000);

const listPath = join(SCREENSHOTS_DIR, `${datetime}_classroom-column-list-view.png`);
await page.screenshot({ path: listPath, fullPage: false });
console.log(`Screenshot saved: ${listPath}`);

await context.close();
await browser.close();
