import { chromium } from '@playwright/test';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';

mkdirSync('assets', { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
const page = await context.newPage();

// Boot admin session on Alice Chen's Contact record
await page.goto(getFrontdoorUrl('/003RK00001pbPsnYAE'), { waitUntil: 'commit' });
await page.waitForTimeout(3000);

// Log in to Experience Site as Alice Chen
await page.getByRole('button', { name: 'Show more actions' }).click();
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).waitFor({ state: 'visible', timeout: 10_000 });
await page.getByRole('menuitem', { name: 'Log in to Experience as User' }).click();

// Wait for the Experience Site home page to render
await page.waitForTimeout(8000);

await page.screenshot({ path: 'assets/community-home.png', fullPage: false });
console.log('Screenshot saved: assets/community-home.png');

await context.close();
await browser.close();
