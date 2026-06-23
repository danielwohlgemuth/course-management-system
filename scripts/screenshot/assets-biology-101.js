import { chromium } from '@playwright/test';
import { getFrontdoorUrl, getInstanceUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';

mkdirSync('assets', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });

const coursesTab = page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first();
await coursesTab.waitFor({ state: 'visible', timeout: 30_000 });
await coursesTab.click();

await page.locator('force-list-view-manager-header, .listViewManagerHeader, .slds-page-header__title').first()
  .waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(2000);

// Switch to All Courses list view first to find Biology 101
const listViewPicker = page.locator('.triggerLink, .slds-page-header__name.slds-type-focus').first();
await listViewPicker.waitFor({ state: 'visible', timeout: 10_000 });
await listViewPicker.click();
const allCoursesOption = page.locator('a[title="All Courses"], span[title="All Courses"], li', { hasText: 'All Courses' }).first();
await allCoursesOption.waitFor({ state: 'visible', timeout: 10_000 });
await allCoursesOption.click();
await page.waitForTimeout(3000);

// Click on the CRS-0002 link (Biology 101's course number)
const biologyLink = page.locator('a', { hasText: 'CRS-0002' }).first();
await biologyLink.waitFor({ state: 'visible', timeout: 15_000 });
await biologyLink.click();

await page.waitForURL(/Course__c\/[A-Za-z0-9]+\/view/, { timeout: 30_000 });
await page.waitForTimeout(4000);

await page.screenshot({ path: 'assets/biology-101-course.png', fullPage: false });
console.log('Screenshot saved: assets/biology-101-course.png');

await context.close();
await browser.close();
