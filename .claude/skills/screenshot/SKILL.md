---
description: Take a screenshot of a feature in the Salesforce org as a .png image
---

# Taking a screenshot

Screenshots are Playwright scripts that drive a real browser against the live Salesforce org and save `.png` images to `playwright/screenshots/`. Use them to document or verify a feature after deploying.

## Steps

### 1. Create the script

Create `scripts/screenshot/<feature-name>.js`. Use an existing script as a reference — `scripts/screenshot/permission-sets-filter-c.js` is a good template.

Every script must:
- Import `chromium` from `@playwright/test`
- Import `getFrontdoorUrl` (and `getInstanceUrl` for subsequent navigations) from `../../tests/helpers/salesforce.js`
- Save output to `playwright/screenshots/` with a `${datetime}_<feature-name>.png` filename

### 2. Navigate to the page

Boot the session with a one-time `getFrontdoorUrl` call. For navigating to additional pages after the session is established use `getInstanceUrl()` to build subsequent URLs directly.

```js
import { chromium } from '@playwright/test';
import { getFrontdoorUrl, getInstanceUrl } from '../../tests/helpers/salesforce.js';
import { mkdirSync } from 'fs';
import { join } from 'path';

const SCREENSHOTS_DIR = 'playwright/screenshots';
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
const instanceUrl = getInstanceUrl();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await context.newPage();

// Boot the session
await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });
await page.waitForTimeout(3000);

// --- navigate and interact here ---

const screenshotPath = join(SCREENSHOTS_DIR, `${datetime}_<feature-name>.png`);
await page.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
```

### 3. Run it

```bash
node scripts/screenshot/<feature-name>.js
```

To target a specific org, set `SF_ORG_ALIAS` first:

```bash
SF_ORG_ALIAS=my-alias node scripts/screenshot/<feature-name>.js
```

### 4. Find the output

Screenshots are saved to `playwright/screenshots/<datetime>_<feature-name>.png`.

## Tips

- Call `getFrontdoorUrl` only once — it generates a one-time login URL. Use `getInstanceUrl()` to build all subsequent navigation URLs.
- Add `await page.waitForTimeout(2000)` after navigations so the page fully renders before the snapshot.
- Use `mask` with `maskColor: '#808080'` to grey out rows or sections that are irrelevant or contain sensitive data.
- Some Setup pages use classic iframes. Find the frame with `page.frames().find(f => f.url().includes('/prefix'))` and query locators against that frame object.
- Lightning Object Manager pages (e.g. Validation Rules, Fields) are full Lightning pages — no iframe needed.
- Flow Builder takes several seconds to render its canvas. Wait at least 7 s after navigation before snapping.
- Existing scripts in `scripts/screenshot/` cover: permission sets list, course list, enrollment related list.
