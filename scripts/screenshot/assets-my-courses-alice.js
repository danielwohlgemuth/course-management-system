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

// Wait for Experience Site to load
await page.waitForTimeout(4000);

// Navigate to My Courses
await page.getByRole('link', { name: 'My Courses' }).waitFor({ state: 'visible', timeout: 30_000 });
await page.getByRole('link', { name: 'My Courses' }).click();

await page.locator('dxp-record-layout, .slds-page-header, h1, h2, h3').first()
  .waitFor({ state: 'visible', timeout: 30_000 });
await page.waitForTimeout(3000);

await page.screenshot({ path: 'assets/my-courses.png', fullPage: false });
console.log('Screenshot saved: assets/my-courses.png');

await context.close();
await browser.close();
