import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../tests/helpers/salesforce.js';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });

// Navigate directly to the Courses list view
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

await page.screenshot({ path: 'playwright/courses-list.png', fullPage: false });

await context.close();
await browser.close();
