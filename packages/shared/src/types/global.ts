// ─────────────────────────────────────────────────────────────────────────────
// Global Schema Types (public schema)
// Platform-level entities — only platform_owner and billing jobs access these.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  TenantStatus,
  PlanName,
  TenantSubscriptionStatus,
  TenantInvoiceStatus,
  BillingCycle,
} from "../enums.js";

// ─── Tenant ──────────────────────────────────────────────────────────────────

export interface Tenant {
  id: string;
  /** Slug: lowercase alphanumeric + hyphens, 3–30 chars, globally unique */
  tenantName: string;
  companyName: string;
  ownerEmail: string;
  ownerName: string;
  planId: string;
  status: TenantStatus;
  trialEndsAt: Date | null;
  /** t_<slug_underscored> */
  schemaName: string;
  createdAt: Date;
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: PlanName;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
  maxUsers: number;
  maxStorageGB: number;
  isActive: boolean;
  createdAt: Date;
}

// ─── TenantSubscription ───────────────────────────────────────────────────────

export interface TenantSubscription {
  id: string;
  tenantId: string;
  planId: string;
  billingCycle: BillingCycle;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  status: TenantSubscriptionStatus;
}

// ─── TenantInvoice ────────────────────────────────────────────────────────────

export interface TenantInvoice {
  id: string;
  tenantId: string;
  subscriptionId: string;
  amount: number;
  status: TenantInvoiceStatus;
  dueDate: Date;
  paidAt: Date | null;
  generatedAt: Date;
}

// ─── TenantPayment ────────────────────────────────────────────────────────────

export interface TenantPayment {
  id: string;
  tenantInvoiceId: string;
  amount: number;
  method: string;
  referenceNo: string | null;
  paidAt: Date;
  recordedBy: string;
}

// ─── TenantAuditLog ───────────────────────────────────────────────────────────

export interface TenantAuditLog {
  id: string;
  tenantId: string;
  action: string;
  performedBy: string;
  notes: string | null;
  createdAt: Date;
}
