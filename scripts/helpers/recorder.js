import { chromium } from '@playwright/test';
import { mkdirSync, renameSync } from 'fs';
import { join } from 'path';

const RECORDINGS_DIR = 'playwright/recordings';

/**
 * Launches a headless browser, records the session, and saves it with a
 * datetime-prefixed name. Pass your navigation logic as the callback.
 *
 * @param {string} name - Readable name appended after the datetime, e.g. 'setup-object-manager'
 * @param {(page: import('@playwright/test').Page) => Promise<void>} fn
 */
export async function record(name, fn) {
  mkdirSync(RECORDINGS_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    recordVideo: { dir: RECORDINGS_DIR, size: { width: 1280, height: 720 } },
  });
  const page = await context.newPage();

  try {
    await fn(page);
    const tempPath = await page.video().path();
    await context.close();
    await browser.close();

    const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const finalPath = join(RECORDINGS_DIR, `${datetime}_${name}.webm`);
    renameSync(tempPath, finalPath);
    console.log(`Saved: ${finalPath}`);
  } catch (err) {
    await context.close().catch(() => {});
    await browser.close().catch(() => {});
    throw err;
  }
}
