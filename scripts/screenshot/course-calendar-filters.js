import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// Boot the session on the home page (where the Course Calendar lives)
await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(4000);

// Wait for the filter toolbar to render
await page.locator('lightning-combobox.filter-control').first().waitFor({ state: 'visible', timeout: 15_000 });
await page.waitForTimeout(1500);

// 1. Full calendar with the filter toolbar
const unfilteredPath = join(SCREENSHOTS_DIR, `${datetime}_course-calendar-filters-all.png`);
await page.screenshot({ path: unfilteredPath, fullPage: false });
console.log(`Screenshot saved: ${unfilteredPath}`);

// 2. Apply the Instructor, Course, and Classroom filters and capture the narrowed calendar
async function selectComboboxOption(combobox, optionText) {
    await combobox.click();
    await page.waitForTimeout(500);
    const option = combobox.locator('lightning-base-combobox-item', { hasText: optionText });
    if ((await option.count()) === 0) {
        console.log(`Option "${optionText}" not found; skipping.`);
        await page.keyboard.press('Escape');
        return false;
    }
    await option.first().click();
    await page.waitForTimeout(1000);
    return true;
}

const instructorCombo = page.locator('lightning-combobox.filter-control').nth(1);
const courseCombo = page.locator('lightning-combobox.filter-control').nth(2);
const classroomCombo = page.locator('lightning-combobox.filter-control').nth(3);

const instructorSelected = await selectComboboxOption(instructorCombo, 'James Okafor');
const courseSelected = await selectComboboxOption(courseCombo, 'Art & Design Fundamentals');
const classroomSelected = await selectComboboxOption(classroomCombo, 'Room 102');

if (instructorSelected || courseSelected || classroomSelected) {
    await page.waitForTimeout(500);
    const filteredPath = join(SCREENSHOTS_DIR, `${datetime}_course-calendar-filters-all-applied.png`);
    await page.screenshot({ path: filteredPath, fullPage: false });
    console.log(`Screenshot saved: ${filteredPath}`);
} else {
    console.log('None of the requested filter options were available; skipped filtered screenshot.');
}

await context.close();
await browser.close();
