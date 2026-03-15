#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Validate inputs.yml against inputs.schema.json (Phase 5 check #1)
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const yaml = await import("js-yaml").catch(() => {
  console.error("❌ js-yaml not installed. Run: pnpm add -D js-yaml");
  process.exit(1);
});

const Ajv = await import("ajv").catch(() => {
  console.error("❌ ajv not installed. Run: pnpm add -D ajv");
  process.exit(1);
});

const schema = JSON.parse(readFileSync(resolve(root, "inputs.schema.json"), "utf8"));
const inputs = yaml.default.load(readFileSync(resolve(root, "inputs.yml"), "utf8"));

const ajv = new Ajv.default({ allErrors: true, strict: false });
const validate = ajv.compile(schema);
const valid = validate(inputs);

if (!valid) {
  console.error("❌ inputs.yml validation failed:");
  validate.errors?.forEach((err) => {
    console.error(`  ${err.instancePath || "/"}: ${err.message}`);
  });
  process.exit(1);
}

console.log("✅ inputs.yml is valid");
