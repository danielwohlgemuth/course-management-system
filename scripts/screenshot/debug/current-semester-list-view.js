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

console.log('Current URL after login:', page.url());

const myCoursesLink = page.getByRole('link', { name: 'My Courses' });
await myCoursesLink.waitFor({ state: 'visible', timeout: 30_000 });
const href = await myCoursesLink.getAttribute('href');
console.log('My Courses href:', href);

await myCoursesLink.click();
await page.waitForTimeout(3000);
console.log('URL after clicking My Courses:', page.url());

await context.close();
await browser.close();
