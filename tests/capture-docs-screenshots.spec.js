import { test } from '@playwright/test';
import { mkdirSync } from 'fs';

test.beforeAll(() => {
  mkdirSync('assets', { recursive: true });
});

test('capture documentation screenshots', async ({ page }) => {
  // ── Courses list ─────────────────────────────────────────────────────────
  await page.goto('/lightning/page/home');
  const coursesTab = page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first();
  await coursesTab.waitFor({ state: 'visible', timeout: 45_000 });
  await coursesTab.click();
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'playwright/courses-list.png', fullPage: false });

  // ── Course record ────────────────────────────────────────────────────────
  const firstCourseLink = page
    .locator('table tbody tr:first-child th a, table tbody tr:first-child td a[data-refid="recordId"]')
    .first();
  await firstCourseLink.click();
  await page.waitForURL(/\/r\/Course__c\/|\/[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'playwright/course-record.png', fullPage: false });

  // ── Create time slot (modal) ──────────────────────────────────────────────
  const timeSlotsSection = page
    .locator('article, lightning-card, div[class*="relatedList"]')
    .filter({ hasText: /Time Slots/ })
    .first();
  await timeSlotsSection.waitFor({ state: 'visible', timeout: 20_000 });
  await timeSlotsSection.scrollIntoViewIfNeeded();
  await timeSlotsSection.getByRole('button', { name: 'New' }).first().click();
  await page.locator('.slds-modal').first().waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('button[name="SaveEdit"]').first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'playwright/create-time-slot.png', fullPage: false });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // ── Calendar overview ────────────────────────────────────────────────────
  await page.goto('/lightning/page/home');
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'playwright/calendar-overview.png', fullPage: false });

  // ── Calendar with overlap badges visible ─────────────────────────────────
  const overlapGroup = page.locator('.overlap-group').first();
  await overlapGroup.waitFor({ state: 'visible', timeout: 15_000 });
  await page.screenshot({ path: 'playwright/calendar-overlap.png', fullPage: false });

  // ── Overlap popover ──────────────────────────────────────────────────────
  await overlapGroup.click();
  await page.locator('.popover-item').first().waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'playwright/calendar-overlap-popover.png', fullPage: false });
  await page.keyboard.press('Escape');

  // ── Create course (modal) — still on the courses list from the nav above ──
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first().click();
  await page.locator('table tbody tr').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('a[title="New"], button[title="New"]').first()
    .waitFor({ state: 'visible', timeout: 30_000 });
  await page.locator('a[title="New"], button[title="New"]').first().click();
  await page.locator('.slds-modal').first().waitFor({ state: 'visible', timeout: 20_000 });
  await page.locator('button[name="SaveEdit"]').first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'playwright/create-course.png', fullPage: false });
});
