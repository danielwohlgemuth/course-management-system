import { record } from './helpers/recorder.js';
import { getFrontdoorUrl } from '../tests/helpers/salesforce.js';

await record('calendar-conditionals', async (page) => {
  // Open the Course Manager home page (shows the calendar)
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });

  const waffle = page.locator('one-app-launcher-header .slds-icon-waffle, [data-id="AppLauncherButton"]').first();
  await waffle.waitFor({ state: 'visible', timeout: 15_000 });
  await waffle.click();
  await page.waitForTimeout(3000);

  const search = page.locator('input[placeholder="Search apps and items..."]');
  await search.waitFor({ state: 'visible', timeout: 20_000 });
  await search.fill('Course Manager');
  await page.waitForTimeout(1500);

  const tile = page.locator('a', { hasText: 'Course Manager' }).first();
  await tile.waitFor({ state: 'visible', timeout: 10_000 });
  await tile.click();

  // Wait for the calendar to render
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(3000);

  // Show a slot card is rendered (lwc:if={slot.isCard})
  const slotCard = page.locator('.slot-card').first();
  await slotCard.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(1500);

  // Click an overlap group if one exists to trigger the popover (lwc:if={hasActivePopover})
  const overlapGroup = page.locator('.overlap-group').first();
  const hasOverlap = await overlapGroup.isVisible();
  if (hasOverlap) {
    await overlapGroup.click({ force: true });
    await page.waitForTimeout(1500);
    // Dismiss the popover by clicking elsewhere
    await page.locator('.calendar-container').click({ position: { x: 10, y: 10 }, force: true });
    await page.waitForTimeout(1500);
  }
});
