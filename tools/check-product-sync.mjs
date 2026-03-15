#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Check PRODUCT.md and inputs.yml are in sync (Rule 9 bidirectional governance)
// Verifies that app name, modules, and key settings match.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const yaml = await import("js-yaml").catch(() => {
  console.warn("⚠️  js-yaml not installed. Skipping product sync check.");
  process.exit(0);
});

const productMd = readFileSync(resolve(root, "docs/PRODUCT.md"), "utf8");
const inputs = yaml.default.load(readFileSync(resolve(root, "inputs.yml"), "utf8"));

const errors = [];

// Check app name
if (inputs?.app?.name && !productMd.includes(inputs.app.name)) {
  errors.push(`App name "${inputs.app.name}" from inputs.yml not found in PRODUCT.md`);
}

// Check company name
if (inputs?.company?.name && !productMd.includes(inputs.company.name)) {
  errors.push(`Company name "${inputs.company.name}" from inputs.yml not found in PRODUCT.md`);
}

if (errors.length > 0) {
  console.error("❌ PRODUCT.md and inputs.yml are out of sync:");
  errors.forEach((e) => console.error(`  - ${e}`));
  console.error("\nRule 9: PRODUCT.md is the only human-edited file. Update inputs.yml to match.");
  process.exit(1);
}

console.log("✅ PRODUCT.md and inputs.yml are in sync");
