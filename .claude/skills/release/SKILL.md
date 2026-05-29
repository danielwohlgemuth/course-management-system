---
description: Create a GitHub release for a change (task, bug fix, or enhancement), tagging the commit and attaching recordings or screenshots.
---

# Creating a release

Releases cover any meaningful change — a completed task, a bug fix, or an ad-hoc enhancement. Each release gets a `release-<id>` tag, a title and notes (pulled from the task file if one exists, or provided inline), and any relevant recordings or screenshots attached as assets.

## Steps

### 1. Identify the release

Ask the user for:
- A numeric ID (used for the tag, e.g. `release-015`)
- A short title (if there is no task file to pull one from)

If the change corresponds to a task, the ID should match the task number. For bug fixes or ad-hoc work without a task file, use the next available ID by checking `git tag --sort=-version:refname | grep '^release-' | head -1`.

### 2. Find assets to attach

Assets are recordings (`.webm`) and screenshots (`.png`) created as part of this task's work.

**Default strategy — filter by timestamp:**

Get the timestamp of the previous release tag:
```bash
git tag --sort=-version:refname | grep '^release-' | head -1
```

If a previous tag exists, find its commit date:
```bash
git log <prev-tag> -1 --format="%ai"
```

Then list recordings and screenshots newer than that date:
```bash
find playwright/recordings playwright/screenshots -type f \( -name "*.webm" -o -name "*.png" \) -newer <any-file-with-that-mtime>
```

A simpler alternative: recording filenames begin with `YYYY-MM-DDTHH-MM-SS_`. Compare the datetime prefix against the previous tag's commit date to identify candidates.

**Always confirm with the user** before attaching — show the candidate list and ask whether to include all, a subset, or none.

### 3. Run the release script

```bash
node scripts/release.js <task-id> [asset-file ...]
```

Examples:
```bash
# Release task 15 (title pulled from tasks/015_*.md)
node scripts/release.js 15

# Bug fix or ad-hoc change with no task file
node scripts/release.js 16 --title "Fix overlapping time slot edge case"

# With assets
node scripts/release.js 15 \
  playwright/recordings/2026-05-29T10-00-00_enrollment-related-list.webm \
  playwright/screenshots/enrollment-related-list.png
```

The script will:
1. Read `tasks/<id>_<slug>.md` for the title and **What** body
2. Create and push an annotated git tag `release-<id>` (e.g. `release-015`)
3. Call `gh release create` with the title, notes, and any asset files
4. Print the release URL on success

### 4. Report the result

Share the release URL with the user.

## Notes

- The `gh` CLI must be authenticated (`gh auth status`). If not, run `gh auth login` first.
- The tag must not already exist. If it does, the script aborts — delete the tag manually before retrying: `git tag -d release-<id> && git push origin :refs/tags/release-<id>`.
- Asset files are attached in a single `gh release create` call. If you need to add more assets after the fact, use `gh release upload <tag> <file>`.
- For a dry run, you can pass `--draft` by editing the script temporarily or calling `gh` directly with the same arguments plus `--draft`.
