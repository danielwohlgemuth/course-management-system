import { record } from './helpers/recorder.js';
import { getFrontdoorUrl } from '../tests/helpers/salesforce.js';

await record('course-manager-app', async (page) => {
  // Land on the Lightning home page to establish the session
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(1000);

  // Open the App Launcher
  const waffle = page.locator('one-app-launcher-header .slds-icon-waffle, [data-id="AppLauncherButton"]').first();
  await waffle.click();

  // Search for Course Manager
  const search = page.locator('input[placeholder="Search apps and items..."]');
  await search.waitFor({ state: 'visible', timeout: 10_000 });
  await search.fill('Course Manager');
  await page.waitForTimeout(1500);

  // Click the Course Manager app tile
  const tile = page.locator('a', { hasText: 'Course Manager' }).first();
  await tile.waitFor({ state: 'visible', timeout: 10_000 });
  await tile.click();

  // Wait for Course Manager to load and show the Courses tab
  const coursesTab = page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first();
  await coursesTab.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2000);

  // Click the Courses tab
  await coursesTab.click();

  // Wait for the list view to render
  await page.locator('force-list-view-manager-header, .listViewManagerHeader, .slds-page-header__title').first()
    .waitFor({ state: 'visible', timeout: 30_000 });

  // Hold on the Courses list view
  await page.waitForTimeout(3000);
});
