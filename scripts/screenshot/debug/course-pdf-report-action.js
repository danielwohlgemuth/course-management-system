import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../../tests/helpers/salesforce.js';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

await page.goto(getFrontdoorUrl('/lightning/r/Course__c/a00RK00000k5aMvYAI/view'), { waitUntil: 'commit' });
await page.locator('.slds-page-header, h1').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(4000);

const buttons = await page.locator('button, a').all();
for (const b of buttons) {
  const title = await b.getAttribute('title');
  const aria = await b.getAttribute('aria-label');
  const text = (await b.innerText().catch(() => '')).trim();
  if ((title && /pdf|download|report/i.test(title)) ||
      (aria && /pdf|download|report/i.test(aria)) ||
      (text && /pdf|download|report/i.test(text))) {
    console.log(JSON.stringify({ title, aria, text }));
  }
}

console.log('--- all header/actions area buttons ---');
const headerButtons = await page.locator('.slds-page-header button, .slds-page-header a, lightning-button, lightning-button-menu').all();
for (const b of headerButtons) {
  const title = await b.getAttribute('title');
  const aria = await b.getAttribute('aria-label');
  const text = (await b.innerText().catch(() => '')).trim();
  console.log(JSON.stringify({ title, aria, text }));
}

await context.close();
await browser.close();
