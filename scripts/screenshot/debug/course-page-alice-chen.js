import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../../tests/helpers/salesforce.js';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/003RK00001pbPsnYAE'), { waitUntil: 'commit' });
await page.waitForTimeout(3000);

await page.getByRole('button', { name: 'Show more actions' }).click();
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).waitFor({ state: 'visible', timeout: 10_000 });
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).click();
await page.waitForTimeout(4000);

await page.getByRole('link', { name: 'My Courses' }).waitFor({ state: 'visible', timeout: 30_000 });
await page.getByRole('link', { name: 'My Courses' }).click();

await page.locator('dxp-record-layout, .slds-page-header, h1, h2, h3').first()
  .waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(3000);

const links = await page.locator('a').all();
for (const l of links) {
  const href = await l.getAttribute('href');
  const text = (await l.innerText().catch(() => '')).trim();
  const visible = await l.isVisible();
  if (visible && (text || (href && !href.startsWith('javascript')))) {
    console.log(JSON.stringify({ text, href }));
  }
}

await context.close();
await browser.close();
