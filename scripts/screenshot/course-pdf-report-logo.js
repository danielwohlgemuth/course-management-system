import { chromium } from "@playwright/test";
import {
  getFrontdoorUrl,
  getInstanceUrl
} from "../../tests/helpers/salesforce.js";
import { mkdirSync } from "fs";
import { join } from "path";

const SCREENSHOTS_DIR = "playwright/screenshots";
mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const datetime = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
const instanceUrl = getInstanceUrl();

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1280, height: 900 }
});
const page = await context.newPage();

// Boot the session
await page.goto(getFrontdoorUrl("/lightning/page/home"), {
  waitUntil: "commit"
});
await page
  .locator("one-app-nav-bar-item-root")
  .first()
  .waitFor({ state: "visible", timeout: 45_000 });
await page.waitForTimeout(3000);

// Navigate to the Visualforce PDF report (renderAs="pdf" triggers a download)
const downloadPromise = page.waitForEvent("download");
await page
  .goto(`${instanceUrl}/apex/CoursePdfReport?id=a02RK000014AWv5YAG`, {
    waitUntil: "commit"
  })
  .catch(() => {});
const download = await downloadPromise;
const pdfPath = join(SCREENSHOTS_DIR, `${datetime}_course-pdf-report-logo.pdf`);
await download.saveAs(pdfPath);
console.log(`PDF saved: ${pdfPath}`);

// Open the downloaded PDF in a new tab to render and screenshot it
const pdfPage = await context.newPage();
await pdfPage.goto(`file://${process.cwd()}/${pdfPath}`, { waitUntil: "load" });
await pdfPage.waitForTimeout(2000);

const screenshotPath = join(
  SCREENSHOTS_DIR,
  `${datetime}_course-pdf-report-logo.png`
);
await pdfPage.screenshot({ path: screenshotPath, fullPage: false });
console.log(`Screenshot saved: ${screenshotPath}`);

await context.close();
await browser.close();
