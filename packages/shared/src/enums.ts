// ─────────────────────────────────────────────────────────────────────────────
// Nucleus Business Suite — Shared Enums
// All enum types are string literals (TypeScript const enums avoided for DX).
// Derived from inputs.yml roles + all entity status fields.
// ─────────────────────────────────────────────────────────────────────────────

// ─── Role Enums ──────────────────────────────────────────────────────────────

export const PLATFORM_ROLES = ["platform_owner"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const TENANT_ROLES = [
  "tenant_super_admin",
  "admin",
  "accountant",
  "hr_manager",
  "project_manager",
  "budget_holder",
  "sales_staff",
  "purchasing_staff",
  "inventory_staff",
  "staff",
  "cashier",
  "support_agent",
  "customer",
] as const;
export type TenantRole = (typeof TENANT_ROLES)[number];

export const ALL_ROLES = [...PLATFORM_ROLES, ...TENANT_ROLES] as const;
export type AppRole = (typeof ALL_ROLES)[number];

/** Roles that have mobile app access */
export const MOBILE_ROLES: readonly TenantRole[] = [
  "tenant_super_admin",
  "admin",
  "hr_manager",
  "project_manager",
  "staff",
] as const;

/** Roles that have employee records */
export const EMPLOYEE_ROLES: readonly TenantRole[] = [
  "tenant_super_admin",
  "admin",
  "accountant",
  "hr_manager",
  "project_manager",
  "budget_holder",
  "sales_staff",
  "purchasing_staff",
  "inventory_staff",
  "staff",
  "cashier",
] as const;

// ─── Tenant Status ────────────────────────────────────────────────────────────

export const TENANT_STATUSES = ["trial", "active", "suspended", "cancelled"] as const;
export type TenantStatus = (typeof TENANT_STATUSES)[number];

export const PLAN_NAMES = ["Starter", "Growth", "Pro", "Enterprise"] as const;
export type PlanName = (typeof PLAN_NAMES)[number];

export const TENANT_SUBSCRIPTION_STATUSES = ["active", "past_due", "cancelled"] as const;
export type TenantSubscriptionStatus = (typeof TENANT_SUBSCRIPTION_STATUSES)[number];

export const TENANT_INVOICE_STATUSES = [
  "draft",
  "sent",
  "paid",
  "past_due",
  "cancelled",
] as const;
export type TenantInvoiceStatus = (typeof TENANT_INVOICE_STATUSES)[number];

export const BILLING_CYCLES = ["monthly", "annual"] as const;
export type BillingCycle = (typeof BILLING_CYCLES)[number];

// ─── CRM / Sales Enums ───────────────────────────────────────────────────────

export const CUSTOMER_TYPES = ["individual", "business"] as const;
export type CustomerType = (typeof CUSTOMER_TYPES)[number];

export const CREDIT_TRANSACTION_TYPES = [
  "advance_payment",
  "excess_payment",
  "credit_applied",
  "credit_refunded",
] as const;
export type CreditTransactionType = (typeof CREDIT_TRANSACTION_TYPES)[number];

export const CREDIT_REFERENCE_TYPES = ["invoice", "payment", "manual_refund"] as const;
export type CreditReferenceType = (typeof CREDIT_REFERENCE_TYPES)[number];

export const PROPOSAL_STATUSES = ["draft", "sent", "revised", "accepted", "declined"] as const;
export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const INVOICE_STATUSES = [
  "draft",
  "sent",
  "unpaid",
  "partially_paid",
  "overdue",
  "paid",
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const PAYMENT_METHODS = ["cash", "card", "bank", "gcash", "other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const EXCESS_HANDLING_TYPES = [
  "credited_to_account",
  "refunded",
  "pending_decision",
] as const;
export type ExcessHandlingType = (typeof EXCESS_HANDLING_TYPES)[number];

export const SUBSCRIPTION_BILLING_CYCLES = ["monthly", "quarterly", "annual"] as const;
export type SubscriptionBillingCycle = (typeof SUBSCRIPTION_BILLING_CYCLES)[number];

export const SUBSCRIPTION_STATUSES = ["active", "paused", "cancelled"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

// ─── Purchasing Enums ─────────────────────────────────────────────────────────

export const VENDOR_TYPES = ["direct_supplier", "ecommerce_seller"] as const;
export type VendorType = (typeof VENDOR_TYPES)[number];

export const ECOMMERCE_PLATFORMS = [
  "shopee",
  "lazada",
  "zalora",
  "fb_marketplace",
  "other",
] as const;
export type EcommercePlatform = (typeof ECOMMERCE_PLATFORMS)[number];

export const PURCHASE_ORDER_STATUSES = [
  "draft",
  "sent",
  "confirmed",
  "partially_received",
  "received",
  "cancelled",
] as const;
export type PurchaseOrderStatus = (typeof PURCHASE_ORDER_STATUSES)[number];

export const PURCHASE_INVOICE_STATUSES = ["unpaid", "paid"] as const;
export type PurchaseInvoiceStatus = (typeof PURCHASE_INVOICE_STATUSES)[number];

export const EXPENSE_STATUSES = ["draft", "approved", "rejected"] as const;
export type ExpenseStatus = (typeof EXPENSE_STATUSES)[number];

// ─── Inventory Enums ──────────────────────────────────────────────────────────

export const PRODUCT_TYPES = ["physical", "service"] as const;
export type ProductType = (typeof PRODUCT_TYPES)[number];

export const STOCK_MOVEMENT_TYPES = ["in", "out", "adjustment", "transfer"] as const;
export type StockMovementType = (typeof STOCK_MOVEMENT_TYPES)[number];

// ─── Projects Enums ───────────────────────────────────────────────────────────

export const PROJECT_STATUSES = [
  "draft",
  "active",
  "on_hold",
  "completed",
  "cancelled",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// ─── Tasks Enums ──────────────────────────────────────────────────────────────

export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ["todo", "in_progress", "done", "cancelled"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

// ─── DTR / Attendance Enums ───────────────────────────────────────────────────

export const CLOCK_IN_LOCATIONS = ["office", "project_site"] as const;
export type ClockInLocation = (typeof CLOCK_IN_LOCATIONS)[number];

export const ATTENDANCE_RECORD_STATUSES = ["pending", "approved", "rejected"] as const;
export type AttendanceRecordStatus = (typeof ATTENDANCE_RECORD_STATUSES)[number];

export const ATTENDANCE_STATUSES = ["present", "absent", "late", "half_day"] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

// ─── Budget Enums ─────────────────────────────────────────────────────────────

export const BUDGET_ALLOCATION_STATUSES = ["active", "exhausted", "revoked"] as const;
export type BudgetAllocationStatus = (typeof BUDGET_ALLOCATION_STATUSES)[number];

// ─── Banking Enums ────────────────────────────────────────────────────────────

export const FUND_SOURCE_TYPES = [
  "cash_on_hand",
  "e_wallet",
  "bank",
  "credit_card",
] as const;
export type FundSourceType = (typeof FUND_SOURCE_TYPES)[number];

export const FUND_TRANSACTION_TYPES = ["credit", "debit"] as const;
export type FundTransactionType = (typeof FUND_TRANSACTION_TYPES)[number];

export const CREDIT_CARD_PAYMENT_TYPES = [
  "per_transaction",
  "bulk_statement",
  "partial",
] as const;
export type CreditCardPaymentType = (typeof CREDIT_CARD_PAYMENT_TYPES)[number];

// ─── HR / Payroll Enums ───────────────────────────────────────────────────────

export const EMPLOYMENT_TYPES = ["full_time", "part_time", "contractual"] as const;
export type EmploymentType = (typeof EMPLOYMENT_TYPES)[number];

export const LEAVE_REQUEST_TYPES = ["vacation", "sick", "emergency"] as const;
export type LeaveRequestType = (typeof LEAVE_REQUEST_TYPES)[number];

export const LEAVE_REQUEST_STATUSES = ["pending", "approved", "rejected"] as const;
export type LeaveRequestStatus = (typeof LEAVE_REQUEST_STATUSES)[number];

export const CASH_ADVANCE_STATUSES = [
  "pending",
  "approved",
  "released",
  "partially_recovered",
  "fully_recovered",
] as const;
export type CashAdvanceStatus = (typeof CASH_ADVANCE_STATUSES)[number];

export const PAYROLL_STATUSES = ["draft", "approved", "released"] as const;
export type PayrollStatus = (typeof PAYROLL_STATUSES)[number];

// ─── POS Enums ────────────────────────────────────────────────────────────────

export const POS_SESSION_STATUSES = ["open", "closed"] as const;
export type PosSessionStatus = (typeof POS_SESSION_STATUSES)[number];

// ─── Accounting Enums ─────────────────────────────────────────────────────────

export const ACCOUNT_TYPES = [
  "asset",
  "liability",
  "equity",
  "income",
  "expense",
] as const;
export type AccountType = (typeof ACCOUNT_TYPES)[number];

// ─── Support Enums ────────────────────────────────────────────────────────────

export const TICKET_PRIORITIES = ["low", "medium", "high", "critical"] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TICKET_STATUSES = ["open", "in_progress", "resolved", "closed"] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];
