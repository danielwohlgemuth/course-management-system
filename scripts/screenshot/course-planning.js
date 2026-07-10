// Captures the course-planning feature (task 024) in three states:
//   1. a draft plan with availability windows and the Lock button
//   2. the same plan locked, showing the generated weekly schedule
//   3. an infeasible plan locked, showing the scheduling error
//
// Prerequisite: sf apex run --file scripts/apex/seed_course_plans.apex
// (re-run it before re-running this script — locking mutates the plans).
//
// Output: playwright/screenshots/<datetime>_course-plan-{draft,schedule,error}.png

import { chromium } from "@playwright/test";
import {
  getFrontdoorUrl,
  getInstanceUrl,
  query
} from "../../tests/helpers/salesforce.js";
import { mkdirSync } from "fs";
import { join } from "path";

const SCREENSHOTS_DIR = "playwright/screenshots";
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
const instanceUrl = getInstanceUrl();

function planIdByName(name) {
  const records = query(
    `SELECT Id FROM CoursePlan__c WHERE Course_Name__c = '${name}' ORDER BY CreatedDate DESC LIMIT 1`
  );
  if (!records.length) {
    throw new Error(
      `No CoursePlan__c named "${name}" — run scripts/apex/seed_course_plans.apex first`
    );
  }
  return records[0].Id;
}

const feasiblePlanId = planIdByName("Chemistry 200");
const infeasiblePlanId = planIdByName("Advanced Robotics");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 }
});
const page = await context.newPage();

// Boot the session
await page.goto(getFrontdoorUrl("/lightning/page/home"), {
  waitUntil: "commit"
});
await page
  .locator("one-app-nav-bar-item-root")
  .first()
  .waitFor({ state: "visible", timeout: 45_000 });
await page.waitForTimeout(3000);

async function openPlan(planId) {
  await page.goto(`${instanceUrl}/lightning/r/CoursePlan__c/${planId}/view`, {
    waitUntil: "commit"
  });
  await page
    .getByRole("button", { name: "Lock plan" })
    .first()
    .waitFor({ state: "visible", timeout: 30_000 });
  await page.waitForTimeout(2500);
}

async function shoot(name) {
  const path = join(SCREENSHOTS_DIR, `${datetime}_${name}.png`);
  await page.screenshot({ path, fullPage: false });
  console.log(`Screenshot saved: ${path}`);
}

// ── 1: Draft plan with availability windows and the Lock button ──────────────
await openPlan(feasiblePlanId);
await shoot("course-plan-draft");

// ── 2: Lock the plan; the generated weekly schedule appears ──────────────────
await page.getByRole("button", { name: "Lock plan" }).click();
await page
  .locator('[data-id="schedule-table"]')
  .waitFor({ state: "visible", timeout: 30_000 });
await page.waitForTimeout(2000);
await shoot("course-plan-schedule");

// ── 3: Locking an infeasible plan surfaces a clear scheduling error ──────────
await openPlan(infeasiblePlanId);
await page.getByRole("button", { name: "Lock plan" }).click();
await page
  .locator(".slds-scoped-notification")
  .waitFor({ state: "visible", timeout: 30_000 });
await page.waitForTimeout(2000);
await shoot("course-plan-error");

await context.close();
await browser.close();
