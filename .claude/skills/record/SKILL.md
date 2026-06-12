---
description: Record a browser session of a feature in the Salesforce org as a .webm video
---

# Recording a feature

Recordings are Playwright scripts that drive a real browser against the live Salesforce org and save a `.webm` video to `playwright/recordings/`. Use them to visually verify a feature after deploying.

## Steps

### 1. Create the script

Create `scripts/record/<feature-name>.js`. Use an existing script as a reference — `scripts/record/click-course-from-calendar.js` is a good template.

Every script must:
- Import `record` from `../helpers/recorder.js`
- Import `getFrontdoorUrl` from `../../tests/helpers/salesforce.js`
- Call `record('<feature-name>', async (page) => { ... })`

### 2. Navigate to the app

The org requires a one-time login URL. Always open the home page via `getFrontdoorUrl` and then navigate to the Course Manager app through the waffle menu:

```js
import { record } from '../helpers/recorder.js';
import { getFrontdoorUrl } from '../../tests/helpers/salesforce.js';

await record('my-feature', async (page) => {
  // Boot the session
  await page.goto(getFrontdoorUrl('/lightning/page/home'), { waitUntil: 'commit' });
  await page.locator('one-app-nav-bar-item-root').first().waitFor({ state: 'visible', timeout: 45_000 });

  // Open the Course Manager app via the waffle menu
  const waffle = page.locator('one-app-launcher-header .slds-icon-waffle, [data-id="AppLauncherButton"]').first();
  await waffle.waitFor({ state: 'visible', timeout: 15_000 });
  await waffle.click();
  await page.waitForTimeout(1500);

  const search = page.locator('input[placeholder="Search apps and items..."]');
  await search.waitFor({ state: 'visible', timeout: 20_000 });
  await search.fill('Course Manager');
  await page.waitForTimeout(1500);

  const tile = page.locator('a', { hasText: 'Course Manager' }).first();
  await tile.waitFor({ state: 'visible', timeout: 10_000 });
  await tile.click();

  // Wait for the home page to load
  await page.locator('one-app-nav-bar-item-root', { hasText: 'Courses' }).first()
    .waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForTimeout(3000);

  // --- your feature interactions here ---
});
```

### 3. Run it

```bash
node scripts/record/<feature-name>.js
```

The script uses the default authorized org. To target a specific org, set `SF_ORG_ALIAS` first:

```bash
SF_ORG_ALIAS=my-alias node scripts/record/<feature-name>.js
```

### 4. Find the output

The video is saved to `playwright/recordings/<datetime>_<feature-name>.webm`.

## Tips

- Add `await page.waitForTimeout(1500)` before and after key interactions so the video clearly shows before/after states.
- For LWC components, wait for a specific locator (e.g. `.slot-card`) rather than a fixed timeout for the initial load.
- `getFrontdoorUrl` calls `sf org open --url-only` — the org must already be authorized via `sf org login web`.
- Existing scripts in `scripts/record/` cover: app setup, course creation, time slot creation, calendar display, and clicking a course from the calendar. Copy the closest one rather than starting from scratch.

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
   npx playwright codegen --output scripts/record/<feature-name>-codegen.js "<url from step 1>"
   ```
   A Chromium window opens already logged in. A code panel alongside it records every click and fill as Playwright selectors.

4. **Perform the flow manually** in the browser window — navigate, click, fill fields, save. The code panel updates in real time.

5. **Close the browser** when done. The generated code is saved to `scripts/record/<feature-name>-codegen.js`.

6. **Transfer the working selectors** into the final `record()`-based script, replacing any selectors that were failing. Key differences to handle:
   - `getByLabel` / `getByText` selectors from codegen sometimes only work in headed mode. For headless, prefer `article.filter({ hasText: /^SectionName/ }).getByRole('button', { name: 'New' })` for related-list buttons (see `create-time-slot.js`).
   - Inline lookup dropdowns: `page.getByText('Option Text').click()` is usually all that's needed.

7. **Delete any test data** created during the codegen session before running the final recording:
   ```bash
   sf data query --query "SELECT Id FROM MyObject__c ORDER BY CreatedDate DESC LIMIT 3"
   sf data delete record --sobject MyObject__c --record-id <id>
   ```

8. **Run the clean recording** script to produce the final `.webm`.
