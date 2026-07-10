#!/usr/bin/env node
/**
 * Regenerate documentation screenshots for one or more features.
 *
 * Runs each given per-feature screenshot script (from scripts/screenshot/) and
 * copies every NEW datetime-prefixed PNG it produced in playwright/screenshots/
 * into assets/, stripping the datetime prefix — so
 * `2026-07-08T10-00-00_course-plan-draft.png` lands as `assets/course-plan-draft.png`,
 * the stable filename README.md and docs/*.md reference.
 *
 * Any screenshot script that follows the repo convention (datetime-prefixed
 * output into playwright/screenshots/) works without registration here; use
 * scripts/update-readme-images.js instead to regenerate every README image.
 *
 * Usage:
 *   node scripts/update-doc-images.js course-planning.js [another-feature.js ...]
 *   SF_ORG_ALIAS=my-alias node scripts/update-doc-images.js course-planning.js
 */

import { execFileSync } from "child_process";
import { readdirSync, copyFileSync, mkdirSync } from "fs";
import { join } from "path";

const SCREENSHOT_DIR = "scripts/screenshot";
const SCREENSHOTS_OUTPUT_DIR = "playwright/screenshots";
const ASSETS_DIR = "assets";
const DATETIME_PREFIX = /^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_/;

const scripts = process.argv.slice(2);
if (!scripts.length) {
  console.error(
    "Usage: node scripts/update-doc-images.js <screenshot-script.js> [...]"
  );
  console.error(
    "Runs scripts/screenshot/<script> and copies its new PNGs into assets/."
  );
  process.exit(1);
}

mkdirSync(SCREENSHOTS_OUTPUT_DIR, { recursive: true });

function snapshot() {
  return new Set(readdirSync(SCREENSHOTS_OUTPUT_DIR));
}

for (const script of scripts) {
  const before = snapshot();
  console.log(`\nRunning ${script}...`);
  execFileSync("node", [join(SCREENSHOT_DIR, script)], { stdio: "inherit" });

  const produced = [...snapshot()].filter(
    (f) => !before.has(f) && DATETIME_PREFIX.test(f) && f.endsWith(".png")
  );
  if (!produced.length) {
    throw new Error(
      `${script} produced no new datetime-prefixed PNGs in ${SCREENSHOTS_OUTPUT_DIR}`
    );
  }
  for (const file of produced) {
    const dest = join(ASSETS_DIR, file.replace(DATETIME_PREFIX, ""));
    copyFileSync(join(SCREENSHOTS_OUTPUT_DIR, file), dest);
    console.log(`Copied ${join(SCREENSHOTS_OUTPUT_DIR, file)} -> ${dest}`);
  }
}

console.log(
  "\nDoc images updated. Review the diff under assets/ before committing."
);
