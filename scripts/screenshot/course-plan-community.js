// Captures the community course-planning feature (task 034) in three states:
//   1. the "My Course Plans" list page in the Experience Site
//   2. a selected draft plan with availability windows and the Lock button
//   3. the same plan locked, showing the generated weekly schedule
//
// Prerequisite: sf apex run --file scripts/apex/seed_course_plans.apex
// (re-run it before re-running this script, since locking mutates the plans).
//
// Output: playwright/screenshots/<datetime>_course-plan-community-{list,draft,schedule}.png

import { chromium } from "@playwright/test";
import { getFrontdoorUrl } from "../../tests/helpers/salesforce.js";
import { mkdirSync } from "fs";
import { join } from "path";

const SCREENSHOTS_DIR = "playwright/screenshots";
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, "-");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 }
});
const page = await context.newPage();

// Boot admin session directly on Elena Marsh's Contact record (a course instructor)
await page.goto(getFrontdoorUrl("/003RK00001rn8tRYAQ"), {
  waitUntil: "commit"
});
await page.waitForTimeout(3000);

// Log in to Experience Site as Elena Marsh
await page.getByRole("button", { name: "Show more actions" }).click();
await page
  .getByRole("menuitem", { name: "Log in to Experience as User" })
  .waitFor({ state: "visible", timeout: 10_000 });
await page
  .getByRole("menuitem", { name: "Log in to Experience as User" })
  .click();

// Wait for the Experience Site to load in the same page
await page.waitForTimeout(4000);

// Navigate to My Course Plans
await page
  .getByRole("link", { name: "My Course Plans" })
  .waitFor({ state: "visible", timeout: 30_000 });
await page.getByRole("link", { name: "My Course Plans" }).click();

// Wait for the plan list table to render
await page
  .locator('[data-id="plan-table"]')
  .waitFor({ state: "visible", timeout: 30_000 });
await page.waitForTimeout(2000);

async function shoot(name, fullPage = false) {
  const path = join(SCREENSHOTS_DIR, `${datetime}_${name}.png`);
  await page.screenshot({ path, fullPage });
  console.log(`Screenshot saved: ${path}`);
}

// ── 1: "My Course Plans" list page ────────────────────────────────────────────
await shoot("course-plan-community-list");

// ── 2: Select the draft plan; availability windows and the Lock button ──────
await page
  .locator('table[data-id="plan-table"] tbody tr')
  .filter({ hasText: "Chemistry 200" })
  .getByRole("button", { name: "View" })
  .click();
await page
  .getByRole("button", { name: "Lock plan" })
  .waitFor({ state: "visible", timeout: 30_000 });
await page.waitForTimeout(2000);
await shoot("course-plan-community-draft");

// ── 3: Lock the plan; the generated weekly schedule appears ──────────────────
await page.getByRole("button", { name: "Lock plan" }).click();
await page
  .locator('[data-id="schedule-table"]')
  .waitFor({ state: "visible", timeout: 30_000 });
await page.waitForTimeout(2000);
await shoot("course-plan-community-schedule", true);

await context.close();
await browser.close();
