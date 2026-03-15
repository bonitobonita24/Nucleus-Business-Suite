#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Check that all required env vars are present (Phase 5 check)
// ─────────────────────────────────────────────────────────────────────────────

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
  "REDIS_HOST",
  "REDIS_PORT",
  "STORAGE_ENDPOINT",
  "STORAGE_ACCESS_KEY",
  "STORAGE_SECRET_KEY",
  "STORAGE_BUCKET",
];

const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error("❌ Missing required environment variables:");
  missing.forEach((key) => console.error(`  - ${key}`));
  process.exit(1);
}

console.log("✅ All required environment variables are set");
