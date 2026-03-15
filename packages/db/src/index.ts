// ─────────────────────────────────────────────────────────────────────────────
// @nucleus/db — Barrel Export
// ─────────────────────────────────────────────────────────────────────────────

// Prisma client singleton (global/public schema)
export { db } from "./client.js";

// Tenant schema guard — search_path switching
export {
  withTenantSchema,
  withTenantTransaction,
  runRawInTenantSchema,
  provisionTenantSchema,
  tenantSlugToSchema,
} from "./tenant-guard.js";

// Audit log helpers
export {
  createAuditLog,
  createGlobalAuditLog,
  type AuditLogInput,
  type AuditAction,
  type AuditModule,
} from "./audit.js";

// Tenant seed (for provisioning job)
export { seedTenantSchema } from "./seed.js";

// Re-export Prisma types for consumers
export type { Prisma, PrismaClient } from "@prisma/client";
