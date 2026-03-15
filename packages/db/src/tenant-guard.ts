// ─────────────────────────────────────────────────────────────────────────────
// Tenant Guard — search_path Switching Middleware
//
// D004 (LOCKED): separate PostgreSQL schema per tenant.
// Prisma middleware sets search_path atomically per request from JWT tenantSlug.
//
// USAGE:
//   import { withTenantSchema } from "@nucleus/db/tenant-guard";
//
//   const result = await withTenantSchema(db, tenantSlug, async (tx) => {
//     return tx.user.findMany();
//   });
//
// SAFETY:
//   Uses SET LOCAL search_path inside a transaction — safe with PgBouncer
//   in transaction mode. SET LOCAL reverts automatically on transaction end.
//   Schema name is validated against a strict regex before use.
// ─────────────────────────────────────────────────────────────────────────────

import type { PrismaClient, Prisma } from "@prisma/client";

// Valid schema name: t_ followed by lowercase alphanumeric + underscores
const TENANT_SCHEMA_REGEX = /^t_[a-z0-9_]+$/;

/**
 * Convert a tenant slug to its PostgreSQL schema name.
 * "my-tenant" → "t_my_tenant"
 */
export function tenantSlugToSchema(tenantSlug: string): string {
  return `t_${tenantSlug.replace(/-/g, "_")}`;
}

/**
 * Validate that a schema name is safe to interpolate into SQL.
 * Throws if invalid — never trust user input directly.
 */
function validateSchemaName(schemaName: string): void {
  if (!TENANT_SCHEMA_REGEX.test(schemaName)) {
    throw new Error(
      `Invalid tenant schema name: "${schemaName}". Must match /^t_[a-z0-9_]+$/.`,
    );
  }
}

/**
 * Run a database operation in the context of a specific tenant schema.
 *
 * Wraps the operation in a transaction and sets `SET LOCAL search_path`
 * so all queries within `fn` target the correct tenant schema.
 *
 * @param prisma  - The global PrismaClient instance
 * @param tenantSlug - The tenant slug from JWT (e.g. "acme-corp")
 * @param fn      - The operation to run inside the tenant schema context
 */
export async function withTenantSchema<T>(
  prisma: PrismaClient,
  tenantSlug: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  const schemaName = tenantSlugToSchema(tenantSlug);
  validateSchemaName(schemaName);

  return prisma.$transaction(async (tx) => {
    // SET LOCAL is transaction-scoped: reverts on transaction end
    // Safe for PgBouncer in transaction pooling mode
    await tx.$executeRawUnsafe(
      `SET LOCAL search_path TO "${schemaName}", public`,
    );
    return fn(tx);
  });
}

/**
 * Type-safe wrapper that provides both the tenant schema context
 * and the transaction client with correct Prisma types.
 *
 * Use for complex operations that need explicit transaction control.
 */
export async function withTenantTransaction<T>(
  prisma: PrismaClient,
  tenantSlug: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
  options?: Parameters<PrismaClient["$transaction"]>[1],
): Promise<T> {
  const schemaName = tenantSlugToSchema(tenantSlug);
  validateSchemaName(schemaName);

  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SET LOCAL search_path TO "${schemaName}", public`,
    );
    return fn(tx);
  }, options);
}

/**
 * Run a raw SQL query inside a tenant schema context.
 * Useful for migrations and data queries that bypass the ORM.
 */
export async function runRawInTenantSchema(
  prisma: PrismaClient,
  tenantSlug: string,
  sql: string,
  values?: unknown[],
): Promise<unknown> {
  const schemaName = tenantSlugToSchema(tenantSlug);
  validateSchemaName(schemaName);

  return prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `SET LOCAL search_path TO "${schemaName}", public`,
    );
    return values?.length
      ? tx.$executeRawUnsafe(sql, ...values)
      : tx.$executeRawUnsafe(sql);
  });
}

/**
 * Provision a new tenant schema by running the tenant migration SQL.
 * Called by the tenant-provisioning BullMQ job.
 *
 * @param prisma     - Global PrismaClient (connected to superuser or migration user)
 * @param tenantSlug - New tenant's slug
 * @param migrationSql - Full migration SQL for the tenant schema
 */
export async function provisionTenantSchema(
  prisma: PrismaClient,
  tenantSlug: string,
  migrationSql: string,
): Promise<void> {
  const schemaName = tenantSlugToSchema(tenantSlug);
  validateSchemaName(schemaName);

  await prisma.$transaction(async (tx) => {
    // Create schema if not exists
    await tx.$executeRawUnsafe(
      `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`,
    );
    // Set search_path and run migration
    await tx.$executeRawUnsafe(
      `SET LOCAL search_path TO "${schemaName}", public`,
    );
    await tx.$executeRawUnsafe(migrationSql);
  });
}
