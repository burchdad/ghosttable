#!/usr/bin/env node
// Add Sentry `withSentry` to all Next.js Pages API routes.
// - Scans: ./pages/api/**/*.(js|ts)  (App Router /app/api is intentionally skipped)
// - Adds:  import { withSentry } from '@sentry/nextjs'
// - Wraps: export default handler  -> export default withSentry(handler)
//   export default function handler(...) -> function handler(...); export default withSentry(handler)
// - Skips files that already contain "withSentry(".
//
// Usage:
//   node scripts/add-sentry-to-apis.js         # dry-run (shows changes)
//   node scripts/add-sentry-to-apis.js --write # apply changes

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

const PROJECT_ROOT = process.cwd();
const API_ROOT = path.join(PROJECT_ROOT, 'pages', 'api');

const WRITE = process.argv.includes('--write') || process.argv.includes('-w');

const exts = new Set(['.js', '.ts']);
const changed = [];
const skipped = [];
const errors = [];

async function* walk(dir) {
  let entries;
  try {
    entries = await fsp.readdir(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      yield* walk(p);
    } else if (exts.has(path.extname(p))) {
      yield p;
    }
  }
}

function hasWithSentry(content) {
  // quick heuristic
  return /\bwithSentry\s*\(/.test(content);
}
function hasSentryImport(content) {
  return /from\s+['"]@sentry\/nextjs['"]/.test(content);
}

function insertImport(content) {
  if (hasSentryImport(content)) return content;

  const line = `import { withSentry } from '@sentry/nextjs'\n`;
  // place after the last existing import, else at top
  const importMatches = [...content.matchAll(/^\s*import .*?;?\s*$/gm)];
  if (importMatches.length > 0) {
    const last = importMatches[importMatches.length - 1];
    const idx = last.index + last[0].length;
    return content.slice(0, idx) + '\n' + line + content.slice(idx);
  }
  return line + content;
}

function wrapDefaultExport(content) {
  if (hasWithSentry(content)) return { content, changed: false };

  // Case A: `export default withSentry(...)` already — covered above
  // Case B: `export default function handler(...) { ... }`
  // We rewrite to: `function handler(...) { ... }\nexport default withSentry(handler)`
  const reFunc = /export\s+default\s+(async\s+)?function\s+([A-Za-z_$][\w$]*)\s*\(/;
  if (reFunc.test(content)) {
    content = content.replace(reFunc, (m, aSync, name) => `${aSync || ''}function ${name}(`);
    // append export line at the end (safe)
    if (!/\n\s*export\s+default\s+withSentry\s*\(/.test(content)) {
      content = content.trimEnd() + `\n\nexport default withSentry(${RegExp.$2 || 'handler'});\n`;
    }
    return { content, changed: true };
  }

  // Case C: `async function handler(...) {}` ... `export default handler`
  // or     `function handler(...) {}` ... `export default handler`
  const reId = /export\s+default\s+([A-Za-z_$][\w$]*)\s*;?/;
  if (reId.test(content)) {
    const name = content.match(reId)[1];
    content = content.replace(reId, `export default withSentry(${name});`);
    // ensure no duplicate export default lines remain later
    return { content, changed: true };
  }

  // Case D: Fallback — if file contains an API handler variable like `const handler = (req,res)=>{}` and a default export,
  // the above should have matched. If the file uses anonymous default (rare), we won't auto-edit.
  return { content, changed: false };
}

async function processFile(file) {
  let text;
  try {
    text = await fsp.readFile(file, 'utf8');
  } catch (e) {
    errors.push({ file, error: e.message });
    return;
  }

  // Skip files that clearly aren't API route handlers
  // (Very light check — we keep it permissive)
  if (!/export\s+default/.test(text)) {
    skipped.push({ file, reason: 'no default export' });
    return;
  }
  if (hasWithSentry(text)) {
    skipped.push({ file, reason: 'already has withSentry' });
    return;
  }

  let next = insertImport(text);
  const { content: wrapped, changed: didWrap } = wrapDefaultExport(next);
  if (!didWrap) {
    skipped.push({ file, reason: 'could not detect handler pattern' });
    return;
  }

  if (!WRITE) {
    changed.push({ file, changed: true, preview: diffPreview(text, wrapped) });
    return;
  }

  // backup
  try {
    await fsp.writeFile(file + '.bak', text, 'utf8');
  } catch (e) {}

  try {
    await fsp.writeFile(file, wrapped, 'utf8');
    changed.push({ file, changed: true });
  } catch (e) {
    errors.push({ file, error: e.message });
  }
}

function diffPreview(oldText, newText) {
  // very small inline preview: first 8 changed lines
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const changes = [];
  const max = Math.max(oldLines.length, newLines.length);
  for (let i = 0; i < max; i++) {
    if (oldLines[i] !== newLines[i]) {
      changes.push(`- ${oldLines[i] ?? ''}`);
      changes.push(`+ ${newLines[i] ?? ''}`);
      if (changes.length > 16) break;
    }
  }
  return changes.join('\n');
}

(async function main() {
  // Verify API root exists
  if (!fs.existsSync(API_ROOT)) {
    console.warn(`[info] No pages/api directory found at: ${API_ROOT}`);
    console.warn(`[info] This script targets Next.js Pages API routes only.`);
    process.exit(0);
  }

  for await (const file of walk(API_ROOT)) {
    await processFile(file);
  }

  // Report
  console.log(`\nSentry codemod ${WRITE ? '(WRITE MODE)' : '(DRY RUN)'} finished.\n`);
  if (changed.length) {
    console.log(`Changed ${changed.length} file(s):`);
    for (const c of changed) {
      console.log(`  ✓ ${path.relative(PROJECT_ROOT, c.file)}`);
      if (!WRITE && c.preview) {
        console.log(c.preview.split('\n').slice(0, 12).map(l => '    ' + l).join('\n'));
        if (c.preview.split('\n').length > 12) console.log('    ...');
      }
    }
  } else {
    console.log('No files needed changes.');
  }
  if (skipped.length) {
    console.log(`\nSkipped ${skipped.length} file(s):`);
    for (const s of skipped) {
      console.log(`  - ${path.relative(PROJECT_ROOT, s.file)} (${s.reason})`);
    }
  }
  if (errors.length) {
    console.log(`\nErrors on ${errors.length} file(s):`);
    for (const e of errors) {
      console.log(`  ! ${path.relative(PROJECT_ROOT, e.file)} -> ${e.error}`);
    }
  }

  console.log('\nTips:');
  console.log('  • Run with "--write" to apply changes.');
  console.log('  • Backups are saved as "*.bak" next to each modified file.');
  console.log('  • This targets Pages API (pages/api). App Router route handlers are not modified.');
})();
