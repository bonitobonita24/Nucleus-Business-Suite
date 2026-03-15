#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Hydration Lint — Check for common Next.js hydration error patterns
// Scans src files for known anti-patterns that cause React hydration mismatches.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, readdirSync, statSync } from "fs";
import { resolve, join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const webSrc = resolve(root, "apps/web/src");

const ANTI_PATTERNS = [
  {
    pattern: /typeof window !== ['"]undefined['"]/,
    message: "Use useEffect or dynamic import instead of typeof window check",
  },
  {
    pattern: /new Date\(\)\.(toLocaleString|toLocaleDateString|toLocaleTimeString)/,
    message: "Use a stable date format or suppressHydrationWarning on date elements",
  },
  {
    pattern: /Math\.random\(\)/,
    message: "Math.random() can cause hydration mismatches — use stable IDs",
  },
];

let errors = 0;

function scanDir(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && !entry.startsWith(".") && entry !== "node_modules") {
      scanDir(fullPath);
    } else if (stat.isFile() && /\.(tsx?|jsx?)$/.test(entry)) {
      const content = readFileSync(fullPath, "utf8");
      const lines = content.split("\n");

      for (const { pattern, message } of ANTI_PATTERNS) {
        lines.forEach((line, i) => {
          if (pattern.test(line)) {
            console.error(`❌ Hydration risk in ${fullPath.replace(root, "")}:${i + 1}`);
            console.error(`   ${message}`);
            console.error(`   > ${line.trim()}`);
            errors++;
          }
        });
      }
    }
  }
}

scanDir(webSrc);

if (errors > 0) {
  console.error(`\n❌ Found ${errors} potential hydration issue(s)`);
  process.exit(1);
}

console.log("✅ No hydration anti-patterns found");
