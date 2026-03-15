// ─────────────────────────────────────────────────────────────────────────────
// Audit Log Helper
// L5 (LOCKED): immutable AuditLog on every create/update/delete, login/logout,
// role change, failed login, credit limit change, credit transaction.
//
// USAGE (inside withTenantSchema transaction):
//   await createAuditLog(tx, {
//     userId: ctx.user.userId,
//     action: "CREATE",
//     module: "invoices",
//     recordId: invoice.id,
//   });
// ─────────────────────────────────────────────────────────────────────────────

import type { Prisma } from "@prisma/client";

export interface AuditLogInput {
  userId: string;
  action: AuditAction;
  module: AuditModule;
  recordId: string;
}

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "LOGIN"
  | "LOGOUT"
  | "LOGIN_FAILED"
  | "ROLE_CHANGE"
  | "CREDIT_LIMIT_CHANGE"
  | "CREDIT_TRANSACTION"
  | "APPROVE"
  | "REJECT"
  | "RELEASE"
  | "SUSPEND"
  | "REACTIVATE"
  | "EXPORT"
  | "VIEW_SENSITIVE";

export type AuditModule =
  | "auth"
  | "users"
  | "customers"
  | "invoices"
  | "payments"
  | "credit"
  | "proposals"
  | "subscriptions"
  | "purchasing"
  | "inventory"
  | "projects"
  | "tasks"
  | "dtr"
  | "budget"
  | "banking"
  | "hr"
  | "payroll"
  | "pos"
  | "accounting"
  | "support"
  | "settings"
  | "platform";

/**
 * Create an immutable audit log entry.
 * Must be called inside a withTenantSchema transaction.
 * AuditLog entries are NEVER updated or deleted (L5 — always active).
 */
export async function createAuditLog(
  tx: Prisma.TransactionClient,
  input: AuditLogInput,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: input.userId,
      action: input.action,
      module: input.module,
      recordId: input.recordId,
    },
  });
}

/**
 * Create a platform-level audit log entry (global schema).
 * Used for platform_owner actions on tenant management.
 */
export async function createGlobalAuditLog(
  tx: Prisma.TransactionClient,
  input: {
    tenantId: string;
    action: string;
    performedBy: string;
    notes?: string;
  },
): Promise<void> {
  await tx.globalTenantAuditLog.create({
    data: {
      tenantId: input.tenantId,
      action: input.action,
      performedBy: input.performedBy,
      notes: input.notes ?? null,
    },
  });
}
