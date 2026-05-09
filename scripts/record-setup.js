import { chromium } from '@playwright/test';
import { execSync } from 'child_process';

const { FORCE_COLOR: _, ...env } = process.env;
const frontdoorUrl = JSON.parse(
  execSync('sf org open --url-only --path /lightning/setup/SetupOneHome/home --json', { encoding: 'utf8', env })
).result.url;

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  recordVideo: { dir: 'playwright/recordings', size: { width: 1280, height: 720 } },
});
const page = await context.newPage();

// Use 'commit' to avoid waiting for all the cross-domain iframe redirects Salesforce Setup triggers
await page.goto(frontdoorUrl, { waitUntil: 'commit' });

// Wait for Object Manager tab to appear, then click it
const objectManager = page.locator('a', { hasText: 'Object Manager' }).first();
await objectManager.waitFor({ state: 'visible', timeout: 45_000 });
await objectManager.click();

await page.waitForTimeout(3000);
await context.close();
await browser.close();

console.log('Recording saved to playwright/recordings/');
