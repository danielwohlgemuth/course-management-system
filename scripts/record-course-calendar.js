import { record } from './helpers/recorder.js';
import { getFrontdoorUrl } from '../tests/helpers/salesforce.js';

await record('course-calendar', async (page) => {
  // Open the Course Manager home page (shows the calendar)
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  // Wait for the home page with the calendar component
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(2000);

  // Hold on the calendar (empty or with existing data)
  await page.waitForTimeout(3000);

  // Navigate to the Courses tab and create a new course
  const coursesTab = page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first();
  await coursesTab.click();

  const newButton = page.locator('a[title="New"], button[title="New"]').first();
  await newButton.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1000);
  await newButton.click();

  const courseNameField = page.locator('input[name="Course_Name__c"]');
  await courseNameField.waitFor({ state: 'visible', timeout: 15_000 });
  await courseNameField.fill('Web Development Fundamentals');

  const instructorField = page.locator('input[name="Instructor__c"]');
  await instructorField.waitFor({ state: 'visible', timeout: 10_000 });
  await instructorField.fill('Alex Johnson');
  await page.waitForTimeout(500);

  const saveButton = page.locator('button[name="SaveEdit"]').first();
  await saveButton.click();

  // Wait for the course record page
  await page.waitForURL(/\/r\/Course__c\/|\/[a-zA-Z0-9]{15,18}\/view/, { timeout: 30_000 });
  await page.waitForTimeout(2000);

  // Add a time slot from the related list
  const timeSlotsRelatedList = page.locator('article, lightning-card, div[class*="relatedList"]')
    .filter({ hasText: /^Time Slots/ }).first();
  await timeSlotsRelatedList.waitFor({ state: 'visible', timeout: 30_000 });
  await timeSlotsRelatedList.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const newTimeSlotButton = timeSlotsRelatedList.getByRole('button', { name: 'New' }).first();
  await newTimeSlotButton.waitFor({ state: 'visible', timeout: 15_000 });
  await newTimeSlotButton.click();

  // Wait for modal
  await page.locator('.slds-modal, [role="dialog"].panel').first().waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1500);

  // Select day of week
  const dayCombobox = page.getByRole('combobox', { name: 'Day of Week' });
  await dayCombobox.waitFor({ state: 'visible', timeout: 15_000 });
  await dayCombobox.click();
  const wednesdayOption = page.getByRole('option', { name: 'Wednesday' }).first();
  await wednesdayOption.waitFor({ state: 'visible', timeout: 10_000 });
  await wednesdayOption.click();

  // Fill start time
  const startTimeField = page.locator('input[name="Start_Time__c"]');
  await startTimeField.waitFor({ state: 'visible', timeout: 10_000 });
  await startTimeField.fill('02:00 PM');
  await page.keyboard.press('Tab');

  // Fill end time
  const endTimeField = page.locator('input[name="End_Time__c"]');
  await endTimeField.waitFor({ state: 'visible', timeout: 10_000 });
  await endTimeField.fill('03:30 PM');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(1000);

  // Save the time slot
  const saveTimeSlotButton = page.getByRole('button', { name: 'Save', exact: true });
  await saveTimeSlotButton.click();

  await page.locator('.slds-modal').waitFor({ state: 'hidden', timeout: 30_000 });
  await page.waitForTimeout(2000);

  // Navigate back to the home page to see the calendar updated
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  // Wait for the home page calendar to render with the new time slot
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(3000);

  // Hold on the calendar showing the new slot
  await page.waitForTimeout(4000);
});
