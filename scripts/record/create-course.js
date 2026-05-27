import { record } from '../helpers/recorder.js';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

await record('create-course', async (page) => {
  // Land on Lightning home and open the App Launcher
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  // Navigate to the Courses tab
  const coursesTab = page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first();
  await coursesTab.waitFor({ state: 'visible', timeout: 45_000 });
  await page.waitForTimeout(1000);
  await coursesTab.click();

  // Wait for the list view and click New
  const newButton = page.locator('a[title="New"], button[title="New"]').first();
  await newButton.waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(1000);
  await newButton.click();

  // Fill in the new-record modal
  const courseNameField = page.locator('input[name="Course_Name__c"]');
  await courseNameField.waitFor({ state: 'visible', timeout: 15_000 });
  await courseNameField.fill('Introduction to Salesforce Development');

  const instructorField = page.locator('input[name="Instructor__c"]');
  await instructorField.waitFor({ state: 'visible', timeout: 10_000 });
  await instructorField.fill('Jane Smith');
  await page.waitForTimeout(1000);

  // Save
  const saveButton = page.locator('button[name="SaveEdit"]').first();
  await saveButton.click();

  // Wait for the record detail page to load
  await page.locator('records-record-layout-section, .slds-page-header__title, force-highlights-panel').first()
    .waitFor({ state: 'visible', timeout: 30_000 });

  // Hold on the record page
  await page.waitForTimeout(4000);
});
