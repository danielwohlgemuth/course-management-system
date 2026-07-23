#!/usr/bin/env node
import { execSync } from "node:child_process";

const EM_DASH = "—";

const ALLOWLIST = ["scripts/hooks/check-em-dash.js"];

const diff = execSync("git diff --cached -U0 --", {
  encoding: "utf8",
  maxBuffer: 1024 * 1024 * 50
});

let currentFile = null;
let currentLine = null;
let match = null;

for (const line of diff.split("\n")) {
  const fileHeaderMatch = line.match(/^\+\+\+ b\/(.+)$/);
  if (fileHeaderMatch) {
    currentFile = fileHeaderMatch[1];
    continue;
  }

  const hunkHeaderMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
  if (hunkHeaderMatch) {
    currentLine = parseInt(hunkHeaderMatch[1], 10);
    continue;
  }

  // "+" marks an added line; "+++" is the diff's new-file path header
  if (!line.startsWith("+") || line.startsWith("+++")) {
    continue;
  }

  if (currentFile && ALLOWLIST.includes(currentFile)) {
    currentLine++;
    continue;
  }

  if (line.includes(EM_DASH)) {
    match = { file: currentFile, line: currentLine };
    break;
  }

  currentLine++;
}

if (match) {
  console.error(
    `Replace em dash (${EM_DASH}) with comma, parentheses, or colon at ${match.file}:${match.line}`
  );
  process.exit(1);
}
