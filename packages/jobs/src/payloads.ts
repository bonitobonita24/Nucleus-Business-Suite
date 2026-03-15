// ─────────────────────────────────────────────────────────────────────────────
// BullMQ Job Payload Types — Typed payloads for all 17 queues
// Every payload includes tenantSlug (except global platform jobs).
// ─────────────────────────────────────────────────────────────────────────────

// ─── 1. tenant-provisioning ──────────────────────────────────────────────────
export interface TenantProvisioningPayload {
  tenantId: string;
  tenantSlug: string;
  companyName: string;
  ownerEmail: string;
  ownerName: string;
  ownerPassword: string; // hashed before enqueue
  planId: string;
}

// ─── 2. tenant-billing ───────────────────────────────────────────────────────
export interface TenantBillingPayload {
  /** null = scan all tenants; string = specific tenant */
  tenantId: string | null;
  action: "generate_invoice" | "send_reminder" | "suspend" | "reactivate";
}

// ─── 3. invoice-processing ───────────────────────────────────────────────────
export interface InvoiceProcessingPayload {
  tenantSlug: string;
  /** null = scan all invoices for tenant; string = specific invoice */
  invoiceId: string | null;
}

// ─── 4. subscription-billing ─────────────────────────────────────────────────
export interface SubscriptionBillingPayload {
  tenantSlug: string;
  subscriptionId: string;
}

// ─── 5. inventory-alerts ─────────────────────────────────────────────────────
export interface InventoryAlertsPayload {
  tenantSlug: string;
  /** null = scan all products */
  productId: string | null;
}

// ─── 6. goods-receipt ────────────────────────────────────────────────────────
export interface GoodsReceiptPayload {
  tenantSlug: string;
  goodsReceiptId: string;
  purchaseOrderId: string;
}

// ─── 7. payment-processing ───────────────────────────────────────────────────
export interface PaymentProcessingPayload {
  tenantSlug: string;
  paymentId: string;
  invoiceId: string;
}

// ─── 8. credit-processing ────────────────────────────────────────────────────
export interface CreditProcessingPayload {
  tenantSlug: string;
  creditTransactionId: string;
  customerId: string;
}

// ─── 9. expense-processing ───────────────────────────────────────────────────
export interface ExpenseProcessingPayload {
  tenantSlug: string;
  expenseType: "expense" | "project_expense";
  expenseId: string;
}

// ─── 10. cash-advance ────────────────────────────────────────────────────────
export interface CashAdvancePayload {
  tenantSlug: string;
  cashAdvanceId: string;
  employeeId: string;
}

// ─── 11. credit-card-payment ─────────────────────────────────────────────────
export interface CreditCardPaymentPayload {
  tenantSlug: string;
  creditCardPaymentId: string;
}

// ─── 12. payroll-processing ──────────────────────────────────────────────────
export interface PayrollProcessingPayload {
  tenantSlug: string;
  payrollId: string;
}

// ─── 13. shipping-cost-recalc ────────────────────────────────────────────────
export interface ShippingCostRecalcPayload {
  tenantSlug: string;
  purchaseOrderId: string;
  shippingCostId: string;
}

// ─── 14. mobile-sync ─────────────────────────────────────────────────────────
export interface MobileSyncPayload {
  tenantSlug: string;
  userId: string;
  records: {
    type: "attendance" | "task_update" | "expense";
    data: Record<string, unknown>;
    offlineId: string;
    createdAt: string; // ISO timestamp
  }[];
}

// ─── 15. pdf-generation ──────────────────────────────────────────────────────
export type PdfDocumentType = "invoice" | "proposal" | "payslip" | "purchase_order" | "goods_receipt";

export interface PdfGenerationPayload {
  tenantSlug: string;
  documentType: PdfDocumentType;
  documentId: string;
  requestedBy: string;
  callbackUrl?: string;
}

// ─── 16. report-export ───────────────────────────────────────────────────────
export type ReportModule =
  | "sales"
  | "purchasing"
  | "inventory"
  | "projects"
  | "budget"
  | "banking"
  | "pos"
  | "accounting"
  | "hr"
  | "support";

export type ExportFormat = "csv" | "pdf" | "xlsx";

export interface ReportExportPayload {
  tenantSlug: string;
  module: ReportModule;
  format: ExportFormat;
  filters: Record<string, unknown>;
  requestedBy: string;
  callbackUrl?: string;
}

// ─── 17. notifications ────────────────────────────────────────────────────────
export type NotificationEvent =
  | "task_assigned"
  | "task_status_updated"
  | "attendance_approved_or_rejected"
  | "leave_approved_or_rejected"
  | "expense_approved_or_rejected"
  | "payroll_released"
  | "low_stock_alert"
  | "cost_change_alert"
  | "credit_balance_changed"
  | "excess_payment_decision_required"
  | "payroll_reminder";

export interface NotificationPayload {
  tenantSlug: string | null; // null for platform-level notifications
  event: NotificationEvent;
  recipientUserIds: string[];
  recipientEmails?: string[];
  expoPushTokens?: string[];
  data: Record<string, unknown>;
}

// ─── Union Type for All Payloads ──────────────────────────────────────────────
export type JobPayload =
  | TenantProvisioningPayload
  | TenantBillingPayload
  | InvoiceProcessingPayload
  | SubscriptionBillingPayload
  | InventoryAlertsPayload
  | GoodsReceiptPayload
  | PaymentProcessingPayload
  | CreditProcessingPayload
  | ExpenseProcessingPayload
  | CashAdvancePayload
  | CreditCardPaymentPayload
  | PayrollProcessingPayload
  | ShippingCostRecalcPayload
  | MobileSyncPayload
  | PdfGenerationPayload
  | ReportExportPayload
  | NotificationPayload;
