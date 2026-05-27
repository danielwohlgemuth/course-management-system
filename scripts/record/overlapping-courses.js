import { record } from '../helpers/recorder.js';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

await record('overlapping-courses', async (page) => {
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });

  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(3000);

  // Wait for the calendar to render
  await page.locator('.day-column').first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(1000);

  // Click each day column that has an overlap group
  const dayColumns = page.locator('.day-column[data-has-overlap="true"]');
  const colCount = await dayColumns.count();

  for (let i = 0; i < colCount; i++) {
    const col = dayColumns.nth(i);
    const group = col.locator('.overlap-group').first();
    const label = await col.getAttribute('data-day').catch(() => `col-${i}`);
    console.log(`Clicking overlap group in ${label}`);

    await page.waitForTimeout(800);
    await group.click();
    await page.locator('.overlap-popover').waitFor({ state: 'visible', timeout: 5_000 });
    await page.waitForTimeout(1500);

    // Dismiss via the calendar header — no interactive slots there
    await page.locator('.calendar-header').click({ force: true });
    await page.waitForTimeout(800);
  }

  await page.waitForTimeout(2000);
});
