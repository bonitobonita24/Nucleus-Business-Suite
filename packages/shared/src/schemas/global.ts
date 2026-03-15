import { z } from "zod";
import {
  TENANT_STATUSES,
  PLAN_NAMES,
  TENANT_SUBSCRIPTION_STATUSES,
  TENANT_INVOICE_STATUSES,
  BILLING_CYCLES,
} from "../enums.js";

export const TenantSchema = z.object({
  id: z.string().cuid2(),
  tenantName: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric + hyphens only"),
  companyName: z.string().min(1).max(200),
  ownerEmail: z.string().email(),
  ownerName: z.string().min(1).max(200),
  planId: z.string().cuid2(),
  status: z.enum(TENANT_STATUSES),
  trialEndsAt: z.date().nullable(),
  schemaName: z.string().regex(/^t_[a-z0-9_]+$/),
  createdAt: z.date(),
});

export const CreateTenantSchema = TenantSchema.pick({
  tenantName: true,
  companyName: true,
  ownerEmail: true,
  ownerName: true,
  planId: true,
});

export const PlanSchema = z.object({
  id: z.string().cuid2(),
  name: z.enum(PLAN_NAMES),
  monthlyPrice: z.number().nonnegative(),
  annualPrice: z.number().nonnegative(),
  features: z.array(z.string()),
  maxUsers: z.number().int().positive(),
  maxStorageGB: z.number().int().positive(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const TenantSubscriptionSchema = z.object({
  id: z.string().cuid2(),
  tenantId: z.string().cuid2(),
  planId: z.string().cuid2(),
  billingCycle: z.enum(BILLING_CYCLES),
  currentPeriodStart: z.date(),
  currentPeriodEnd: z.date(),
  status: z.enum(TENANT_SUBSCRIPTION_STATUSES),
});

export const TenantInvoiceSchema = z.object({
  id: z.string().cuid2(),
  tenantId: z.string().cuid2(),
  subscriptionId: z.string().cuid2(),
  amount: z.number().positive(),
  status: z.enum(TENANT_INVOICE_STATUSES),
  dueDate: z.date(),
  paidAt: z.date().nullable(),
  generatedAt: z.date(),
});

export const TenantPaymentSchema = z.object({
  id: z.string().cuid2(),
  tenantInvoiceId: z.string().cuid2(),
  amount: z.number().positive(),
  method: z.string().min(1),
  referenceNo: z.string().nullable(),
  paidAt: z.date(),
  recordedBy: z.string().min(1),
});

export const TenantAuditLogSchema = z.object({
  id: z.string().cuid2(),
  tenantId: z.string().cuid2(),
  action: z.string().min(1),
  performedBy: z.string().min(1),
  notes: z.string().nullable(),
  createdAt: z.date(),
});
