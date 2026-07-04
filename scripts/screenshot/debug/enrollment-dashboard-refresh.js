import { chromium } from '@playwright/test';
import { getFrontdoorUrl, getInstanceUrl } from '../../../tests/helpers/salesforce.js';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(3000);

const instanceUrl = getInstanceUrl();
await page.goto(`${instanceUrl}/lightning/r/Dashboard/01ZRK000008Ja3C2AS/view`, { waitUntil: 'commit' });
await page.waitForTimeout(12000);

const dashboardFrame = page.frames().find(f => f.url().includes('desktopDashboards'));
console.log('found frame:', !!dashboardFrame);

const refreshText = dashboardFrame.getByText('Refresh', { exact: true });
console.log('count:', await refreshText.count());
for (const el of await refreshText.all()) {
  console.log(JSON.stringify({
    tag: await el.evaluate(e => e.tagName),
    outer: (await el.evaluate(e => e.outerHTML)).slice(0, 300),
    visible: await el.isVisible(),
  }));
}

await context.close();
await browser.close();
