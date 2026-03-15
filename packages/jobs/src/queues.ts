// ─────────────────────────────────────────────────────────────────────────────
// BullMQ Queue Definitions — 18 Named Queues (D019)
// One queue per job type. Each has its own DLQ. tenantSlug in every payload.
// ─────────────────────────────────────────────────────────────────────────────

import { Queue } from "bullmq";
import type { ConnectionOptions } from "bullmq";

// ─── Queue Names ─────────────────────────────────────────────────────────────

export const QUEUE_NAMES = {
  TENANT_PROVISIONING: "tenant-provisioning",
  TENANT_BILLING: "tenant-billing",
  INVOICE_PROCESSING: "invoice-processing",
  SUBSCRIPTION_BILLING: "subscription-billing",
  INVENTORY_ALERTS: "inventory-alerts",
  GOODS_RECEIPT: "goods-receipt",
  PAYMENT_PROCESSING: "payment-processing",
  CREDIT_PROCESSING: "credit-processing",
  EXPENSE_PROCESSING: "expense-processing",
  CASH_ADVANCE: "cash-advance",
  CREDIT_CARD_PAYMENT: "credit-card-payment",
  PAYROLL_PROCESSING: "payroll-processing",
  SHIPPING_COST_RECALC: "shipping-cost-recalc",
  MOBILE_SYNC: "mobile-sync",
  PDF_GENERATION: "pdf-generation",
  REPORT_EXPORT: "report-export",
  NOTIFICATIONS: "notifications",
  PAYROLL_REMINDER: "payroll-reminder",
} as const;

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES];

// ─── Default Job Options ──────────────────────────────────────────────────────

export const DEFAULT_JOB_OPTIONS = {
  attempts: 3,
  backoff: { type: "exponential" as const, delay: 5000 },
  removeOnComplete: { count: 100 },
  removeOnFail: { count: 1000 }, // Keep last 1000 failed jobs for DLQ inspection
} as const;

// ─── Queue Factory ────────────────────────────────────────────────────────────

export function createQueue(name: QueueName, connection: ConnectionOptions): Queue {
  return new Queue(name, {
    connection,
    defaultJobOptions: DEFAULT_JOB_OPTIONS,
  });
}

// ─── All Queues Map ───────────────────────────────────────────────────────────

export type QueuesMap = Record<QueueName, Queue>;

export function createAllQueues(connection: ConnectionOptions): QueuesMap {
  return Object.fromEntries(
    Object.values(QUEUE_NAMES).map((name) => [name, createQueue(name, connection)]),
  ) as QueuesMap;
}
