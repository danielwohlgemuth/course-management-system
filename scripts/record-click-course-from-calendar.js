import { record } from './helpers/recorder.js';
import { getFrontdoorUrl } from '../tests/helpers/salesforce.js';

await record('click-course-from-calendar', async (page) => {
  // Open the Course Manager home page (shows the calendar)
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });

  const waffle = page.locator('one-app-launcher-header .slds-icon-waffle, [data-id="AppLauncherButton"]').first();
  await waffle.waitFor({ state: 'visible', timeout: 15_000 });
  await waffle.click();
  await page.waitForTimeout(1500);

  const search = page.locator('input[placeholder="Search apps and items..."]');
  await search.waitFor({ state: 'visible', timeout: 20_000 });
  await search.fill('Course Manager');
  await page.waitForTimeout(1500);

  const tile = page.locator('a', { hasText: 'Course Manager' }).first();
  await tile.waitFor({ state: 'visible', timeout: 10_000 });
  await tile.click();

  // Wait for the home page with the calendar component
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(3000);

  // Click the first visible slot card on the calendar
  const slotCard = page.locator('.slot-card').first();
  await slotCard.waitFor({ state: 'visible', timeout: 15_000 });
  await slotCard.click({ force: true });

  // Wait for the course record page to open
  await page.waitForURL(/\/r\/Course__c\/|\/[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
  await page.waitForTimeout(3000);
});
