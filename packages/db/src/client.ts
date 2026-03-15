// ─────────────────────────────────────────────────────────────────────────────
// Prisma Client Singleton
// Global Prisma client for the `public` schema.
// For tenant operations use withTenantSchema() from ./tenant-guard.ts
// ─────────────────────────────────────────────────────────────────────────────

import { PrismaClient } from "@prisma/client";

declare global {
  // Allow global `var` declarations
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env["NODE_ENV"] === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });
}

// Singleton: reuse client in dev to avoid connection pool exhaustion on hot reload
export const db: PrismaClient =
  global.__prisma ?? createPrismaClient();

if (process.env["NODE_ENV"] !== "production") {
  global.__prisma = db;
}
