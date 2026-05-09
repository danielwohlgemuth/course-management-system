import { test, expect } from '@playwright/test';

test('Courses tab appears in App Launcher', async ({ page }) => {
  await page.goto('/lightning/page/home');

  // Open the App Launcher
  const appLauncher = page.getByTitle('App Launcher');
  await expect(appLauncher).toBeVisible({ timeout: 20_000 });
  await appLauncher.click();

  // Search for Courses
  const search = page.getByPlaceholder('Search apps and items...');
  await expect(search).toBeVisible({ timeout: 10_000 });
  await search.fill('Courses');

  // The Courses item should appear in results
  const coursesItem = page.getByRole('link', { name: /^Courses$/ });
  await expect(coursesItem).toBeVisible({ timeout: 10_000 });
});
