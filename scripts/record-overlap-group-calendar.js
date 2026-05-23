import { record } from './helpers/recorder.js';
import { getFrontdoorUrl } from '../tests/helpers/salesforce.js';

await record('overlap-group-calendar', async (page) => {
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(3000);

  // Wait for the calendar to render overlap groups
  const overlapGroup = page.locator('.overlap-group').first();
  await overlapGroup.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(1500);

  // Click the overlap group to open the popover list
  await overlapGroup.click({ force: true });
  await page.waitForTimeout(1500);

  // Verify the popover is visible
  await page.locator('.overlap-popover').waitFor({ state: 'visible', timeout: 5_000 });
  await page.waitForTimeout(2000);

  // Click outside the group to close the popover
  await page.locator('.calendar-container').click({ position: { x: 10, y: 10 }, force: true });
  await page.waitForTimeout(1500);
});
