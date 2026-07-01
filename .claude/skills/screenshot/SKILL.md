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

## When stuck on selectors — use Playwright Codegen

If a script keeps failing because a selector doesn't match, don't iterate blindly. Use `playwright codegen` to discover the right selectors by performing the flow manually in a headed browser:

### Steps

1. **Get an authenticated URL** for the starting page:
   ```bash
   sf org open --url-only --path /lightning/o/Course__c/list
   ```

2. **Plan the steps** you will perform in the browser before launching — write them out so you can execute them quickly without hesitation once codegen is running. Codegen records every interaction, so wandering or correcting mistakes produces noisy output.

3. **Launch codegen** with that URL:
   ```bash
   npx playwright codegen --output scripts/screenshot/<feature-name>-codegen.js "<url from step 1>"
   ```
   A Chromium window opens already logged in. A code panel alongside it records every click and fill as Playwright selectors.

4. **Perform the flow manually** in the browser window — navigate to the page you want to screenshot. The code panel updates in real time.

5. **Close the browser** when done. The generated code is saved to `scripts/screenshot/<feature-name>-codegen.js`.

6. **Transfer the working selectors** into the final screenshot script, replacing any selectors that were failing. Key differences to handle:
   - `getByLabel` / `getByText` selectors from codegen sometimes only work in headed mode. For headless, prefer attribute-based or role-based selectors.
   - Inline lookup dropdowns: `page.getByText('Option Text').click()` is usually all that's needed.

7. **Delete the codegen file** once the working selectors have been transferred:
   ```bash
   rm scripts/screenshot/<feature-name>-codegen.js
   ```

## When codegen isn't available — use a headless debug script

In headless/CLI-only environments (no display for `playwright codegen`), discover selectors by driving the same authenticated session and dumping the DOM instead of screenshotting it.

Create `scripts/screenshot/debug/<feature-name>.js`: reuse the same session-boot and navigation steps as the real screenshot script, but instead of taking a screenshot, query and log the elements you need selectors for, e.g.:

```js
const buttons = await page.locator('button').all();
for (const b of buttons) {
  const title = await b.getAttribute('title');
  const aria = await b.getAttribute('aria-label');
  const text = (await b.innerText().catch(() => '')).trim();
  if (title || aria || text) console.log(JSON.stringify({ title, aria, text }));
}
```

Because it lives one directory deeper than `scripts/screenshot/`, its import path is `'../../../tests/helpers/salesforce.js'` (not `'../../...'`).

Run it with `node scripts/screenshot/debug/<feature-name>.js` and read the logged output to find reliable selectors (e.g. `title="Edit Semester"` for a Lightning inline-edit pencil icon). Transfer the working selector into the real screenshot script.

Unlike codegen files, keep scripts in `scripts/screenshot/debug/` around (don't delete after use) — the `debug/` subfolder marks them as troubleshooting aids that document how a selector was found, useful if the UI changes later and the screenshot script needs re-diagnosing.
