import { record } from '../helpers/recorder.js';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

await record('create-time-slot', async (page) => {
  // Navigate directly to the Courses list view
  await page.goto(getFrontdoorUrl('/lightning/o/Course__c/list'), { waitUntil: 'commit' });

  // Click on the first course record in the list
  const firstCourseLink = page.locator('table tbody tr:first-child a[data-refid="recordId"], table tbody tr:first-child th a').first();
  await firstCourseLink.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1000);
  await firstCourseLink.click();

  // Wait for the course record page to load
  await page.waitForURL(/\/r\/Course__c\/|\/[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
  await page.waitForTimeout(2000);

  // Scroll down to and click New in the Time Slots related list
  const timeSlotsRelatedList = page.locator('article, lightning-card, div[class*="relatedList"]').filter({ hasText: /^Time Slots/ }).first();
  await timeSlotsRelatedList.waitFor({ state: 'visible', timeout: 30_000 });
  await timeSlotsRelatedList.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);
  const newButton = timeSlotsRelatedList.getByRole('button', { name: 'New' }).first();
  await newButton.waitFor({ state: 'visible', timeout: 15_000 });
  await page.waitForTimeout(500);
  await newButton.click();

  // Wait for the new-record modal to appear
  await page.locator('.slds-modal, [role="dialog"].panel').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1500);

  // Open the Day of Week picklist and select Monday
  const dayCombobox = page.getByRole('combobox', { name: 'Day of Week' });
  await dayCombobox.waitFor({ state: 'visible', timeout: 15_000 });
  await dayCombobox.click();
  const mondayOption = page.getByRole('option', { name: 'Monday' }).first();
  await mondayOption.waitFor({ state: 'visible', timeout: 10_000 });
  await mondayOption.click();

  // Fill in Start Time
  const startTimeField = page.locator('input[name="Start_Time__c"]');
  await startTimeField.waitFor({ state: 'visible', timeout: 10_000 });
  await startTimeField.fill('09:00 AM');
  await page.keyboard.press('Tab');

  // Fill in End Time
  const endTimeField = page.locator('input[name="End_Time__c"]');
  await endTimeField.waitFor({ state: 'visible', timeout: 10_000 });
  await endTimeField.fill('10:30 AM');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(1000);

  // Save
  const saveButton = page.getByRole('button', { name: 'Save', exact: true });
  await saveButton.click();

  // Wait for the modal to close and the related list to refresh
  await page.locator('.slds-modal').waitFor({ state: 'hidden', timeout: 30_000 });

  // Hold on the record page
  await page.waitForTimeout(4000);
});
