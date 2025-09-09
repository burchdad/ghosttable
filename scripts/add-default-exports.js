#!/usr/bin/env node
/**
 * Ensure default exports for components that are imported as default.
 * - Adds: `export default <ComponentName>;` at end of file (if missing).
 * - Makes a one-time .bak backup per edited file.
 * - Idempotent and chatty (logs what it changes/skips).
 *
 * Run: node scripts/add-default-exports.js
 */

const fs = require("fs");
const path = require("path");

const COMPONENTS = [
  "RecordDrawer",
  "GridTable",
  "FieldCreator",
  "ViewControls",
  "PresenceIndicator",
  "GridToolbar",
  "GridSummary",
  "GridGroupHeader",
  "GridEmptyState",
  "GridActions",
  "GridPagination",
  "GridFilterPanel",
  "GridSortPanel",
  "GridRowSelection",
  "GridBulkActions",
  "GridColumnResizer",
  "GridColumnVisibilityPanel",
  "Notification",
  "UndoRedo",
  "GridContext",
];

const EXTS = [".tsx", ".jsx", ".ts", ".js"];
const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "dist",
  "build",
  "out",
  ".vercel",
  ".turbo",
]);
const REPO_ROOT = process.cwd();

// crude cache
const allFiles = [];
let walked = false;

// --- fs helpers ---
async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      await walk(path.join(dir, e.name));
    } else if (e.isFile()) {
      allFiles.push(path.join(dir, e.name));
    }
  }
}

async function getAllFiles() {
  if (!walked) {
    await walk(REPO_ROOT);
    walked = true;
  }
  return allFiles;
}

// rank candidates: higher is better
function scorePath(p, comp) {
  let score = 0;
  const norm = p.replace(/\\/g, "/");
  if (norm.includes("/src/components/")) score += 100;
  if (norm.includes(`/components/${comp}.`)) score += 80;
  if (norm.endsWith(`/${comp}/index.tsx`)) score += 75;
  if (norm.endsWith(`/${comp}/index.jsx`)) score += 65;
  if (norm.endsWith(`/${comp}.tsx`)) score += 60;
  if (norm.endsWith(`/${comp}.jsx`)) score += 50;
  if (norm.endsWith(`/${comp}.ts`)) score += 40;
  if (norm.endsWith(`/${comp}.js`)) score += 30;

  // prefer shorter paths (closer to root)
  score += Math.max(0, 40 - norm.split("/").length);

  return score;
}

function hasDefaultExport(src) {
  // very simple, safe-enough check
  return /\bexport\s+default\b/.test(src);
}

function declaresName(src, name) {
  // try to see if symbol exists in file
  const re =
    new RegExp(
      `\\b(${[
        `function\\s+${name}\\b`,
        `(const|let|var)\\s+${name}\\b`,
        `class\\s+${name}\\b`,
        `type\\s+${name}\\b`,
        `interface\\s+${name}\\b`,
        `enum\\s+${name}\\b`,
        `export\\s+(const|let|var|function|class)\\s+${name}\\b`,
      ].join("|")})`,
      "m"
    );
  return re.test(src);
}

async function ensureBackup(file) {
  const bak = file + ".bak";
  try {
    await fs.promises.access(bak, fs.constants.F_OK);
    // backup already exists
  } catch {
    await fs.promises.copyFile(file, bak);
  }
}

async function editFile(file, name) {
  const src = await fs.promises.readFile(file, "utf8");
  if (hasDefaultExport(src)) {
    console.log(`✓ ${name}: default export already present (${rel(file)})`);
    return false;
  }
  if (!declaresName(src, name)) {
    console.warn(
      `! ${name}: symbol not found in ${rel(
        file
      )}. Skipping so we don't break the file.`
    );
    return false;
  }

  await ensureBackup(file);

  // Ensure trailing newline, append default
  const block = src.endsWith("\n") ? src : src + "\n";
  const appended = block + `export default ${name};\n`;
  await fs.promises.writeFile(file, appended, "utf8");
  console.log(`✎ ${name}: added "export default ${name};" → ${rel(file)}`);
  return true;
}

function rel(p) {
  return path.relative(REPO_ROOT, p).replace(/\\/g, "/");
}

async function findCandidateFiles(name) {
  const files = await getAllFiles();
  const nameLower = name.toLowerCase();
  const candidates = [];

  for (const f of files) {
    const ext = path.extname(f);
    if (!EXTS.includes(ext)) continue;

    const base = path.basename(f, ext); // e.g., GridTable from GridTable.tsx
    const dir = path.dirname(f).replace(/\\/g, "/");

    // 1) exact filename match: **/GridTable.tsx
    if (base === name) {
      candidates.push(f);
      continue;
    }

    // 2) index file inside directory **/GridTable/index.tsx
    const leafDir = dir.split("/").pop();
    if (leafDir && leafDir === name && base === "index") {
      candidates.push(f);
      continue;
    }

    // 3) last resort: same name but different case (rare, but try)
    if (base.toLowerCase() === nameLower) {
      candidates.push(f);
      continue;
    }
  }

  // rank & return best-first
  return candidates
    .map((p) => ({ p, s: scorePath(p, name) }))
    .sort((a, b) => b.s - a.s)
    .map((x) => x.p);
}

async function main() {
  console.log("▶ Ensuring default exports for components...\n");
  await getAllFiles();

  let edited = 0;
  let skipped = 0;
  let notFound = [];

  for (const name of COMPONENTS) {
    const matches = await findCandidateFiles(name);

    if (!matches.length) {
      console.warn(`✗ ${name}: file not found (searched common patterns)`);
      notFound.push(name);
      continue;
    }

    // Try the best candidate first; if symbol not found, try others
    let done = false;
    for (const file of matches) {
      const src = await fs.promises.readFile(file, "utf8");
      if (hasDefaultExport(src)) {
        console.log(`✓ ${name}: default export already present (${rel(file)})`);
        skipped++;
        done = true;
        break;
      }
      if (!declaresName(src, name)) {
        // try next candidate
        continue;
      }
      const changed = await editFile(file, name);
      if (changed) edited++;
      done = true;
      break;
    }

    if (!done) {
      // We found files but none declared the name
      console.warn(
        `! ${name}: found files (${matches
          .map(rel)
          .join(", ")}) but symbol "${name}" not declared.`
      );
      skipped++;
    }
  }

  console.log(`\n— Summary —`);
  console.log(`Edited: ${edited}`);
  console.log(`Skipped: ${skipped}`);
  if (notFound.length) {
    console.log(
      `Not found (${notFound.length}): ${notFound
        .sort()
        .join(", ")}  ← check file names/locations`
    );
  }

  if (edited > 0) {
    console.log(
      `\nBackups created as *.bak (first edit only). Review diffs, then commit.`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
