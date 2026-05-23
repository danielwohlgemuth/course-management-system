import { record } from './helpers/recorder.js';
import { getFrontdoorUrl } from '../tests/helpers/salesforce.js';

await record('popup-overflow-fix', async (page) => {
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(3000);

  // Wait for the calendar to render
  await page.locator('.day-column').first().waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(1000);

  // Find overlap badges in the last two day columns (Saturday / Sunday)
  const dayColumns = page.locator('.day-column');
  const count = await dayColumns.count();
  let badgeClicked = false;

  // Try last two columns first (Saturday, Sunday), then fall back to any column
  const tryOrder = count >= 2
    ? [count - 1, count - 2, ...Array.from({ length: count - 2 }, (_, i) => i)]
    : Array.from({ length: count }, (_, i) => i);

  for (const idx of tryOrder) {
    const col = dayColumns.nth(idx);
    const group = col.locator('.overlap-group').first();
    if (await group.isVisible()) {
      const box = await col.boundingBox();
      const colLabel = await page.locator('.day-header').nth(idx + 1).textContent().catch(() => `col-${idx}`);
      console.log(`Clicking overlap group in column ${idx} (${colLabel?.trim()}), right edge at x=${box ? Math.round(box.x + box.width) : '?'}`);
      await page.waitForTimeout(800);
      await group.click();
      badgeClicked = true;
      break;
    }
  }

  if (!badgeClicked) {
    console.log('No overlap badge found in any column — nothing to verify');
    return;
  }

  // Wait for the popover to appear
  await page.locator('.overlap-popover').waitFor({ state: 'visible', timeout: 10_000 });
  await page.waitForTimeout(1500);

  // Verify the popover is fully within the viewport
  const viewport = page.viewportSize();
  const popoverBox = await page.locator('.overlap-popover').boundingBox();
  if (popoverBox && viewport) {
    const overflowsRight = popoverBox.x + popoverBox.width > viewport.width;
    const overflowsBottom = popoverBox.y + popoverBox.height > viewport.height;
    console.log(`Popover bounds: x=${Math.round(popoverBox.x)}, y=${Math.round(popoverBox.y)}, w=${Math.round(popoverBox.width)}, h=${Math.round(popoverBox.height)}`);
    console.log(`Viewport: ${viewport.width}x${viewport.height}`);
    console.log(`Overflows right: ${overflowsRight}, Overflows bottom: ${overflowsBottom}`);
  }

  await page.waitForTimeout(2500);
});
