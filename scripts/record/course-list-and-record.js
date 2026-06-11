import { record } from '../helpers/recorder.js';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

await record('course-list-and-record', async (page) => {
  // Boot the session on the Course Manager home page
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(3000);

  // Navigate to the Courses tab
  const coursesTab = page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first();
  await coursesTab.click();

  // Wait for the list view to load (may default to Recently Viewed)
  await page.locator('force-list-view-manager-header, table.slds-table, .listViewContent').first()
    .waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1500);

  // Switch to the All Courses list view via the picker
  const listViewPickerTrigger = page.getByText('Recently Viewed').first();
  await listViewPickerTrigger.waitFor({ state: 'visible', timeout: 15_000 });
  await listViewPickerTrigger.click();
  await page.waitForTimeout(1000);

  const allCoursesOption = page.getByText('All Courses').first();
  await allCoursesOption.waitFor({ state: 'visible', timeout: 10_000 });
  await allCoursesOption.click();

  // Wait for the All Courses list view to load
  await page.locator('table.slds-table tbody tr').first()
    .waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(2000);

  // Open the first course record from the list
  const firstCourseLink = page
    .locator('table tbody tr:first-child th a, table tbody tr:first-child td a[data-refid="recordId"]')
    .first();
  await firstCourseLink.waitFor({ state: 'visible', timeout: 15_000 });
  await firstCourseLink.click();

  // Wait for navigation to the record page
  await page.waitForURL(/\/r\/Course__c\/|\/[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
  await page.waitForTimeout(4000);
});
