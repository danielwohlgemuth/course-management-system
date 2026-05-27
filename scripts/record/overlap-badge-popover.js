import { record } from '../helpers/recorder.js';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

await record('overlap-badge-popover', async (page) => {
  // Open the Course Manager home page (shows the calendar)
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  // Wait for the home page with the calendar
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(3000);

  // Find a slot card that has an overlap badge
  const badge = page.locator('.overlap-badge').first();
  await badge.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(1000);

  // Click the badge to open the popover
  await badge.click();
  await page.waitForTimeout(1500);

  // Click a course item in the popover to navigate to its record page
  const popoverItem = page.locator('.popover-item').first();
  await popoverItem.waitFor({ state: 'visible', timeout: 10_000 });
  await popoverItem.click();

  // Wait for the course record page to open
  await page.waitForURL(/\/r\/Course__c\/|\/[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
  await page.waitForTimeout(3000);
});
