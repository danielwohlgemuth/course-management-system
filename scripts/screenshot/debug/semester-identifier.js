import { chromium } from '@playwright/test';
import { getFrontdoorUrl, getInstanceUrl } from '../../../tests/helpers/salesforce.js';

const COURSE_RECORD_ID = 'a00RK00000k5aMvYAI';
const instanceUrl = getInstanceUrl();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(3000);

await page.goto(`${instanceUrl}/lightning/r/Course__c/${COURSE_RECORD_ID}/view`, { waitUntil: 'commit' });
await page.getByText('Semester', { exact: true }).first().waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(2000);

const buttons = await page.locator('button').all();
for (const b of buttons) {
  const title = await b.getAttribute('title');
  const aria = await b.getAttribute('aria-label');
  const text = (await b.innerText().catch(() => '')).trim();
  if (title || aria || text) console.log(JSON.stringify({ title, aria, text }));
}

await context.close();
await browser.close();
