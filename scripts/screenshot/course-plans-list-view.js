import { chromium } from "@playwright/test";
import { getFrontdoorUrl } from "../../tests/helpers/salesforce.js";
import { mkdirSync } from "fs";
import { join } from "path";

const SCREENSHOTS_DIR = "playwright/screenshots";
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, "-");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 }
});
const page = await context.newPage();

await page.goto(getFrontdoorUrl("/lightning/page/home"), {
  waitUntil: "commit"
});
await page
  .locator("one-app-nav-bar-item-root")
  .first()
  .waitFor({ state: "visible", timeout: 45_000 });

// Navigate to the Course Manager app
const waffle = page
  .locator(
    'one-app-launcher-header .slds-icon-waffle, [data-id="AppLauncherButton"]'
  )
  .first();
await waffle.click();
const search = page.locator('input[placeholder="Search apps and items..."]');
await search.waitFor({ state: "visible", timeout: 10_000 });
await search.fill("Course Manager");
await page.waitForTimeout(1500);
const tile = page.locator("a", { hasText: "Course Manager" }).first();
await tile.waitFor({ state: "visible", timeout: 10_000 });
await tile.click();

const coursePlansTab = page
  .locator("one-app-nav-bar-item-root", { hasText: "Course Plans" })
  .first();
await coursePlansTab.waitFor({ state: "visible", timeout: 30_000 });
await coursePlansTab.click();

await page
  .locator(
    "force-list-view-manager-header, .listViewManagerHeader, .slds-page-header__title"
  )
  .first()
  .waitFor({ state: "visible", timeout: 30_000 });
await page.waitForTimeout(2000);

// Switch to the All Course Plans list view via the list view picker trigger
const listViewPicker = page
  .locator(".triggerLink, .slds-page-header__name.slds-type-focus")
  .first();
await listViewPicker.waitFor({ state: "visible", timeout: 10_000 });
await listViewPicker.click();
const allCoursePlansOption = page
  .locator('a[title="All Course Plans"], span[title="All Course Plans"], li', {
    hasText: "All Course Plans"
  })
  .first();
await allCoursePlansOption.waitFor({ state: "visible", timeout: 10_000 });
await allCoursePlansOption.click();
await page.waitForTimeout(3000);

const screenshotPath = join(
  SCREENSHOTS_DIR,
  `${datetime}_course-plans-list-view.png`
);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
