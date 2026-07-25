import { chromium } from "@playwright/test";
import { getFrontdoorUrl } from "../../../tests/helpers/salesforce.js";
import { mkdirSync } from "fs";

const SCREENSHOTS_DIR = "playwright/screenshots";
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 }
});
const page = await context.newPage();

// Boot admin session directly on Elena Marsh's Contact record
await page.goto(getFrontdoorUrl("/003RK00001orKQbYAM"), {
  waitUntil: "commit"
});
await page.waitForTimeout(10000);
console.log("URL after boot:", page.url());
await page.screenshot({
  path: `${SCREENSHOTS_DIR}/debug_instructor_contact.png`,
  fullPage: true
});

const links = await page.locator("a").all();
for (const l of links) {
  const title = await l.getAttribute("title");
  const text = (await l.innerText().catch(() => "")).trim();
  if (title || text) console.log("LINK", JSON.stringify({ title, text }));
}

const buttons = await page.locator("button").all();
for (const b of buttons) {
  const title = await b.getAttribute("title");
  const aria = await b.getAttribute("aria-label");
  const text = (await b.innerText().catch(() => "")).trim();
  if (title || aria || text) console.log(JSON.stringify({ title, aria, text }));
}

await browser.close();
