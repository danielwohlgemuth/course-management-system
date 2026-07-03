#!/usr/bin/env node
/**
 * Create a GitHub release for a change (task, bug fix, or ad-hoc enhancement).
 *
 * Usage: node scripts/release.js <id> [--title "..."] [--notes "..."] [asset-file ...]
 * Example: node scripts/release.js 15 playwright/recordings/2026-05-29T10-00-00_enrollment.webm
 *
 * If a matching tasks/<id>_<slug>.md exists, title and notes are pulled from it.
 * Use --title / --notes to override or supply them when no task file exists.
 */

import { execSync } from 'child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename, extname } from 'path';
import { tmpdir } from 'os';

const argv = process.argv.slice(2);

if (!argv.length) {
  console.error('Usage: node scripts/release.js <id> [--title "..."] [--notes "..."] [asset-file ...]');
  process.exit(1);
}

// Parse flags and positional args
let titleOverride, notesOverride;
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--title') { titleOverride = argv[++i]; }
  else if (argv[i] === '--notes') { notesOverride = argv[++i]; }
  else { positional.push(argv[i]); }
}

const [idArg, ...assets] = positional;
const releaseId = parseInt(idArg, 10);
if (isNaN(releaseId)) {
  console.error(`Invalid ID: ${idArg}`);
  process.exit(1);
}

const paddedId = String(releaseId).padStart(3, '0');
const tag = `release-${paddedId}`;

// Resolve title and notes from task file if present
const tasksDir = join(process.cwd(), 'tasks');
const taskFile = existsSync(tasksDir)
  ? readdirSync(tasksDir).find(f => f.startsWith(`${paddedId}_`))
  : undefined;

let title = titleOverride;
let notes = notesOverride;

if (taskFile) {
  const taskContent = readFileSync(join(tasksDir, taskFile), 'utf8');
  if (!title) {
    const m = taskContent.match(/^#\s+\d+\s+(.+)$/m);
    if (m) title = m[1].trim();
  }
  if (!notes) {
    const m = taskContent.match(/^##\s+What\s*\n+([\s\S]+?)(?=\n##\s|\s*$)/m);
    if (m) notes = m[1].trim();
  }
}

if (!title) {
  console.error(`No title found. Pass --title "..." or create a task file at tasks/${paddedId}_<slug>.md`);
  process.exit(1);
}
if (!notes) notes = title;

// Check if tag already exists
try {
  execSync(`git rev-parse ${tag}`, { stdio: 'pipe' });
  console.error(`Tag ${tag} already exists. Aborting to prevent duplicate release.`);
  process.exit(1);
} catch {
  // Tag does not exist — good
}

console.log(`Release: ${paddedId} — ${title}`);
console.log(`Tag:   ${tag}`);
if (assets.length) {
  console.log(`Assets: ${assets.join(', ')}`);
}
console.log();

// Create and push the annotated tag
console.log(`Creating tag ${tag}...`);
execSync(`git tag -a ${tag} -m "${title.replace(/"/g, '\\"')}"`, { stdio: 'inherit' });

console.log(`Pushing tag ${tag}...`);
execSync(`git push origin ${tag}`, { stdio: 'inherit' });

// Embed PNG screenshots inline via their predictable release download URL.
// GitHub attaches assets under a fixed path — https://github.com/OWNER/REPO/releases/download/TAG/FILENAME —
// so the markdown can reference them before the release exists.
const pngAssets = assets.filter(a => extname(a).toLowerCase() === '.png');
if (pngAssets.length) {
  const repoSlug = execSync('gh repo view --json nameWithOwner -q .nameWithOwner', { stdio: ['pipe', 'pipe', 'inherit'] }).toString().trim();
  const imageLines = pngAssets.map(a => {
    const filename = basename(a);
    const alt = filename
      .replace(/^\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}_/, '')
      .replace(/\.[^.]+$/, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return `![${alt}](https://github.com/${repoSlug}/releases/download/${tag}/${filename})`;
  });
  notes = `${notes}\n\n${imageLines.join('\n\n')}`;
}

// Build the gh release create command. Notes go through a temp file so
// markdown images and other special characters don't need shell escaping.
const assetArgs = assets.map(a => `"${a}"`).join(' ');
const notesFile = join(tmpdir(), `release-${paddedId}-notes.md`);
writeFileSync(notesFile, notes);
const ghCmd = `gh release create ${tag} --title "${title.replace(/"/g, '\\"')}" --notes-file "${notesFile}"${assets.length ? ` ${assetArgs}` : ''}`;

console.log('\nCreating GitHub release...');
const output = execSync(ghCmd, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();

console.log(`\nRelease created: ${output}`);
