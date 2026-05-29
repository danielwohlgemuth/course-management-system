import { record } from '../helpers/recorder.js';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

await record('create-enrollment', async (page) => {
  // Boot the session and navigate to the Course list
  await page.goto(getFrontdoorUrl('/lightning/o/Course__c/list'), { waitUntil: 'commit' });

  // Open the first course
  const firstCourseLink = page.locator('table tbody tr:first-child a[data-refid="recordId"], table tbody tr:first-child th a').first();
  await firstCourseLink.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1000);
  await firstCourseLink.click();
  await page.waitForURL(/\/r\/Course__c\/|\/[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
  await page.waitForTimeout(2000);

  // Scroll to the Enrollments related list and click New
  const enrollmentsList = page.locator('article, lightning-card, div[class*="relatedList"]').filter({ hasText: /^Enrollments/ }).first();
  await enrollmentsList.waitFor({ state: 'visible', timeout: 30_000 });
  await enrollmentsList.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const newButton = enrollmentsList.getByRole('button', { name: 'New' }).first();
  await newButton.waitFor({ state: 'visible', timeout: 15_000 });
  await newButton.click();

  // Wait for the modal and fill in the Student lookup
  const modal = page.locator('.slds-modal__container');
  await modal.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1500);

  await page.getByRole('combobox', { name: 'Student' }).click();
  await page.waitForTimeout(1000);
  await page.getByText('User User').click();
  await page.waitForTimeout(1000);

  // Save
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  // Wait for the modal to close and show the result
  await modal.waitFor({ state: 'hidden', timeout: 30_000 });
  await page.waitForTimeout(4000);
});
