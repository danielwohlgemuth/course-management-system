import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/003RK00001orKQbYAM'), { waitUntil: 'commit' });
await page.waitForTimeout(3000);

await page.getByRole('button', { name: 'Show more actions' }).click();
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).waitFor({ state: 'visible', timeout: 10_000 });
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).click();

await page.waitForTimeout(4000);
console.log('URL after login:', page.url());

await page.getByRole('link', { name: 'My Courses' }).waitFor({ state: 'visible', timeout: 30_000 });
await page.getByRole('link', { name: 'My Courses' }).click();
await page.waitForTimeout(8000);
console.log('URL on My Courses:', page.url());
await page.screenshot({ path: join(SCREENSHOTS_DIR, 'debug_my-courses.png'), fullPage: true });

const links = await page.getByRole('link').all();
for (const l of links) {
  const text = (await l.innerText().catch(() => '')).trim();
  if (text) console.log('LINK:', text);
}

const courseLink = page.getByRole('link', { name: /^CRS-\d+$/ }).first();
const hasCourseLink = await courseLink.count();
console.log('Course link count:', hasCourseLink);
if (hasCourseLink) {
  await courseLink.click();
  await page.waitForTimeout(4000);
  console.log('URL on course detail:', page.url());
  await page.screenshot({ path: join(SCREENSHOTS_DIR, 'debug_course-detail.png'), fullPage: true });

  const buttons = await page.locator('button, lightning-button').all();
  for (const b of buttons) {
    const text = (await b.innerText().catch(() => '')).trim();
    const aria = await b.getAttribute('aria-label').catch(() => null);
    if (text || aria) console.log('BUTTON:', JSON.stringify({ text, aria }));
  }
}

await context.close();
await browser.close();
