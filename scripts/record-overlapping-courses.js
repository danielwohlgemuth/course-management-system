import { record } from './helpers/recorder.js';
import { getFrontdoorUrl } from '../tests/helpers/salesforce.js';

await record('overlapping-courses', async (page) => {
  await page.goto(getFrontdoorUrl('/lightning/app/CourseManager'), { waitUntil: 'commit' });

  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(3000);

  // Wait for the calendar to render
  await page.locator('.day-column').first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(1000);

  // Click each visible overlap group across all day columns
  const dayHeaders = page.locator('.day-header');
  const dayColumns = page.locator('.day-column');
  const colCount = await dayColumns.count();

  for (let i = 0; i < colCount; i++) {
    const col = dayColumns.nth(i);
    const group = col.locator('.overlap-group').first();
    if (!await group.isVisible()) continue;

    const label = await dayHeaders.nth(i + 1).textContent().catch(() => `col-${i}`);
    console.log(`Clicking overlap group in ${label?.trim()}`);

    await page.waitForTimeout(800);
    await group.click();
    await page.locator('.overlap-popover').waitFor({ state: 'visible', timeout: 10_000 });
    await page.waitForTimeout(1500);

    // Dismiss by clicking elsewhere
    await page.locator('.calendar-container, c-course-calendar').first().click({ position: { x: 10, y: 10 }, force: true });
    await page.waitForTimeout(800);
  }

  await page.waitForTimeout(2000);
});
