import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });

// Open Course Manager app
const waffle = page.locator('one-app-launcher-header .slds-icon-waffle, [data-id="AppLauncherButton"]').first();
await waffle.click();
const search = page.locator('input[placeholder="Search apps and items..."]');
await search.waitFor({ state: 'visible', timeout: 10_000 });
await search.fill('Course Manager');
await page.waitForTimeout(1500);
const tile = page.locator('a', { hasText: 'Course Manager' }).first();
await tile.waitFor({ state: 'visible', timeout: 10_000 });
await tile.click();

// Go to Courses tab
const coursesTab = page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first();
await coursesTab.waitFor({ state: 'visible', timeout: 30_000 });
await coursesTab.click();

// Wait for the list view to load and click the first course record
await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(1500);
const firstCourseLink = page.locator('table tbody tr').first().locator('a').first();
await firstCourseLink.click();

// Wait for the course record page to load
await page.waitForURL(/\/r\/Course__c\/|\/[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
await page.locator('lst-related-list-single-container, lst-related-list-view-manager, .related-list-container, force-related-list-container').first()
  .waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(3000);

// Scroll down to reveal the related lists section
await page.evaluate(() => window.scrollBy(0, 600));
await page.waitForTimeout(3000);

// Wait for the Enrollments related list spinner to disappear
await page.locator('lst-related-list-single-container').nth(1).locator('.slds-spinner').waitFor({ state: 'hidden', timeout: 20_000 }).catch(() => {});
await page.waitForTimeout(2000);

await page.screenshot({ path: 'playwright/screenshots/enrollment-related-list.png', fullPage: false });

await context.close();
await browser.close();
