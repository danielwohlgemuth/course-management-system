#!/usr/bin/env node
/**
 * Regenerate every screenshot referenced in README.md.
 *
 * Run this whenever a UI change lands so the README images stay current.
 *
 * Usage: node scripts/update-readme-images.js
 * To target a specific org: SF_ORG_ALIAS=my-alias node scripts/update-readme-images.js
 */

import { execFileSync } from 'child_process';
import { readdirSync, copyFileSync, statSync } from 'fs';
import { join } from 'path';

const SCREENSHOT_DIR = 'scripts/screenshot';
const SCREENSHOTS_OUTPUT_DIR = 'playwright/screenshots';
const ASSETS_DIR = 'assets';

// Scripts that already save straight to assets/<name>.png, matching what README.md references.
const DIRECT_SCRIPTS = [
  'calendar-overlap-popover.js',
  'assets-courses-list.js',
  'assets-biology-101.js',
  'assets-community-home-alice.js',
  'assets-join-a-course-alice.js',
  'assets-my-courses-alice.js',
];

// Scripts that save datetime-prefixed files to playwright/screenshots/ instead —
// their output needs copying into assets/ under the filename README.md expects.
const INDIRECT_SCRIPTS = [
  {
    script: 'enrollment-dashboard.js',
    outputs: [
      { suffix: 'enrollment-dashboard.png', dest: 'enrollment-dashboard.png' },
      { suffix: 'enrollment-report.png', dest: 'enrollment-report.png' },
    ],
  },
  {
    // Locks the seeded plans — re-run scripts/apex/seed_course_plans.apex before re-running.
    script: 'course-planning.js',
    outputs: [
      { suffix: 'course-plan-draft.png', dest: 'course-plan-draft.png' },
      { suffix: 'course-plan-schedule.png', dest: 'course-plan-schedule.png' },
      { suffix: 'course-plan-error.png', dest: 'course-plan-error.png' },
    ],
  },
];

function run(script) {
  console.log(`\nRunning ${script}...`);
  execFileSync('node', [join(SCREENSHOT_DIR, script)], { stdio: 'inherit' });
}

function latestFileEndingWith(suffix) {
  const candidates = readdirSync(SCREENSHOTS_OUTPUT_DIR)
    .filter((f) => f.endsWith(`_${suffix}`))
    .map((f) => join(SCREENSHOTS_OUTPUT_DIR, f));
  if (!candidates.length) {
    throw new Error(`No screenshot found matching *_${suffix} in ${SCREENSHOTS_OUTPUT_DIR}`);
  }
  return candidates.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs)[0];
}

for (const script of DIRECT_SCRIPTS) {
  run(script);
}

for (const { script, outputs } of INDIRECT_SCRIPTS) {
  run(script);
  for (const { suffix, dest } of outputs) {
    const latest = latestFileEndingWith(suffix);
    const destPath = join(ASSETS_DIR, dest);
    copyFileSync(latest, destPath);
    console.log(`Copied ${latest} -> ${destPath}`);
  }
}

console.log('\nAll README images regenerated. Review the diff under assets/ before committing.');
