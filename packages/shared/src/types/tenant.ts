// ─────────────────────────────────────────────────────────────────────────────
// Tenant Schema Types
// All entities below live exclusively inside a tenant's own PostgreSQL schema.
// NO tenantId column — the schema boundary IS the isolation layer.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  TenantRole,
  CustomerType,
  CreditTransactionType,
  CreditReferenceType,
  ProposalStatus,
  InvoiceStatus,
  PaymentMethod,
  ExcessHandlingType,
  SubscriptionBillingCycle,
  SubscriptionStatus,
  VendorType,
  EcommercePlatform,
  PurchaseOrderStatus,
  PurchaseInvoiceStatus,
  ExpenseStatus,
  ProductType,
  StockMovementType,
  ProjectStatus,
  TaskPriority,
  TaskStatus,
  ClockInLocation,
  AttendanceRecordStatus,
  AttendanceStatus,
  BudgetAllocationStatus,
  FundSourceType,
  FundTransactionType,
  CreditCardPaymentType,
  EmploymentType,
  LeaveRequestType,
  LeaveRequestStatus,
  CashAdvanceStatus,
  PayrollStatus,
  PosSessionStatus,
  AccountType,
  TicketPriority,
  TicketStatus,
} from "../enums.js";

// ─── Auth / Users ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: TenantRole;
  departmentId: string | null;
  isEmployee: boolean;
  isActive: boolean;
  createdAt: Date;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface Department {
  id: string;
  name: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  module: string;
  recordId: string;
  timestamp: Date;
}

// ─── CRM / Sales ─────────────────────────────────────────────────────────────

export interface LineItem {
  productId: string | null;
  description: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  type: CustomerType;
  /** null = unlimited, 0 = no credit facility, positive = specific limit */
  creditLimit: number | null;
  /** Authoritative credit balance — never goes negative */
  creditBalance: number;
  createdAt: Date;
}

export interface CustomerCreditAccount {
  id: string;
  customerId: string;
  totalCredited: number;
  totalUsed: number;
  totalRefunded: number;
  /** currentBalance = authoritative credit balance */
  currentBalance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerCreditTransaction {
  id: string;
  customerId: string;
  type: CreditTransactionType;
  amount: number;
  referenceType: CreditReferenceType;
  referenceId: string;
  invoiceId: string | null;
  notes: string | null;
  performedBy: string;
  createdAt: Date;
}

export interface Proposal {
  id: string;
  customerId: string;
  lineItems: LineItem[];
  terms: string | null;
  status: ProposalStatus;
  createdAt: Date;
}

export interface Invoice {
  id: string;
  customerId: string;
  proposalId: string | null;
  projectId: string | null;
  subscriptionId: string | null;
  lineItems: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  creditApplied: number;
  /** balance = total - amountPaid - creditApplied */
  balance: number;
  status: InvoiceStatus;
  fundSourceId: string | null;
  dueDate: Date;
  createdAt: Date;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  fundSourceId: string;
  referenceNo: string | null;
  balanceAfterPayment: number;
  excessAmount: number;
  excessHandling: ExcessHandlingType;
  notes: string | null;
  recordedBy: string;
  paidAt: Date;
}

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  billingCycle: SubscriptionBillingCycle;
  nextBillingDate: Date;
  /** Supports {{month}} {{date}} {{year}} placeholders */
  descriptionTemplate: string;
  status: SubscriptionStatus;
}

// ─── Purchasing ───────────────────────────────────────────────────────────────

export interface Vendor {
  id: string;
  type: VendorType;
  name: string;
  createdAt: Date;
}

export interface DirectSupplier {
  id: string;
  vendorId: string;
  companyOrPersonName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
}

export interface ECommerceSeller {
  id: string;
  vendorId: string;
  platform: EcommercePlatform;
  sellerName: string;
  profileUrl: string | null;
  createdAt: Date;
}

export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitCost: number;
  lineTotal: number;
  /** unitCost + shipping share (computed) */
  landedUnitCost: number;
}

export interface PurchaseOrder {
  id: string;
  vendorId: string;
  lineItems: PurchaseOrderItem[];
  subtotal: number;
  status: PurchaseOrderStatus;
  fundSourceId: string;
  expectedDate: Date | null;
  approvedBy: string | null;
  approvedAt: Date | null;
  createdAt: Date;
}

export interface ShippingCost {
  id: string;
  purchaseOrderId: string;
  logisticsProvider: string;
  amount: number | null;
  receiptPhotoUrl: string | null;
  notes: string | null;
  addedBy: string;
  createdAt: Date;
}

export interface GoodsReceipt {
  id: string;
  purchaseOrderId: string;
  receivedBy: string;
  receivedAt: Date;
  notes: string | null;
  photos: string[];
}

export interface GoodsReceiptItem {
  id: string;
  goodsReceiptId: string;
  purchaseOrderItemId: string;
  productId: string;
  quantityReceived: number;
}

export interface PurchaseInvoice {
  id: string;
  purchaseOrderId: string;
  vendorInvoiceNo: string | null;
  amount: number;
  fundSourceId: string;
  status: PurchaseInvoiceStatus;
  dueDate: Date;
  createdAt: Date;
}

export interface Expense {
  id: string;
  category: string;
  amount: number;
  description: string;
  attachmentUrl: string | null;
  fundSourceId: string;
  submittedBy: string;
  status: ExpenseStatus;
  createdAt: Date;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string | null;
  type: ProductType;
  unitPrice: number;
  costPrice: number;
  stock: number;
  reorderLevel: number;
  categoryId: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  parentId: string | null;
}

export interface ProductPurchaseHistory {
  id: string;
  productId: string;
  purchaseOrderId: string;
  vendorId: string;
  vendorName: string;
  vendorType: VendorType;
  platform: EcommercePlatform | null;
  quantityReceived: number;
  unitCost: number;
  shippingCostShare: number;
  landedUnitCost: number;
  receivedAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  referenceType: string;
  referenceId: string;
  notes: string | null;
  createdAt: Date;
}

export interface Warehouse {
  id: string;
  name: string;
  location: string | null;
  isDefault: boolean;
}

export interface WarehouseStock {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
}

// ─── Projects ─────────────────────────────────────────────────────────────────

export interface Project {
  id: string;
  customerId: string;
  name: string;
  description: string | null;
  budget: number;
  startDate: Date;
  endDate: Date | null;
  status: ProjectStatus;
  managerId: string;
  createdAt: Date;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  budgetAllocationId: string | null;
  cashAdvanceId: string | null;
  category: string;
  amount: number;
  description: string;
  receiptUrl: string | null;
  fundSourceId: string;
  loggedBy: string;
  status: ExpenseStatus;
  createdAt: Date;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  dueDate: Date;
  isCompleted: boolean;
}

export interface TimeLog {
  id: string;
  projectId: string;
  taskId: string | null;
  userId: string;
  hours: number;
  description: string | null;
  loggedAt: Date;
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description: string | null;
  projectId: string | null;
  assignedTo: string;
  assignedBy: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | null;
  createdAt: Date;
}

export interface ToDo {
  id: string;
  userId: string;
  title: string;
  isCompleted: boolean;
  dueDate: Date | null;
  createdAt: Date;
}

// ─── DTR / Attendance ─────────────────────────────────────────────────────────

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: Date;
  clockInTime: Date;
  clockInLat: number | null;
  clockInLng: number | null;
  clockInLocation: ClockInLocation;
  clockOutTime: Date | null;
  clockOutLat: number | null;
  clockOutLng: number | null;
  workLocation: string | null;
  projectId: string | null;
  status: AttendanceRecordStatus;
  approvedBy: string | null;
  approvedAt: Date | null;
  notes: string | null;
  isSyncedFromOffline: boolean;
  createdAt: Date;
}

export interface Attendance {
  id: string;
  employeeId: string;
  attendanceRecordId: string;
  date: Date;
  hoursWorked: number;
  status: AttendanceStatus;
}

// ─── Budget ───────────────────────────────────────────────────────────────────

export interface BudgetAllocation {
  id: string;
  allocatedTo: string;
  allocatedBy: string;
  amount: number;
  remainingBalance: number;
  projectId: string | null;
  generalCategory: string | null;
  fundSourceId: string;
  notes: string | null;
  status: BudgetAllocationStatus;
  createdAt: Date;
}

// ─── Banking & Finance ────────────────────────────────────────────────────────

export interface FundSource {
  id: string;
  type: FundSourceType;
  name: string;
  institutionName: string | null;
  accountNumber: string | null;
  currentBalance: number;
  /** Relevant for credit_card type */
  creditLimit: number | null;
  /** Relevant for credit_card type */
  outstandingBalance: number | null;
  isActive: boolean;
  createdAt: Date;
}

export interface FundTransaction {
  id: string;
  fundSourceId: string;
  type: FundTransactionType;
  amount: number;
  referenceType: string;
  referenceId: string;
  description: string;
  balanceAfter: number;
  createdBy: string;
  createdAt: Date;
}

export interface CreditCardPayment {
  id: string;
  creditCardFundSourceId: string;
  paidFromFundSourceId: string;
  amount: number;
  paymentType: CreditCardPaymentType;
  coveredTransactionIds: string[];
  statementPeriodStart: Date | null;
  statementPeriodEnd: Date | null;
  notes: string | null;
  createdBy: string;
  createdAt: Date;
}

// ─── HR & Payroll ─────────────────────────────────────────────────────────────

export interface Employee {
  id: string;
  userId: string;
  employeeNo: string;
  position: string;
  department: string;
  employmentType: EmploymentType;
  hireDate: Date;
  salary: number;
  isActive: boolean;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveRequestType;
  startDate: Date;
  endDate: Date;
  status: LeaveRequestStatus;
  approvedBy: string | null;
}

export interface CashAdvance {
  id: string;
  employeeId: string;
  amount: number;
  fundSourceId: string;
  isProjectLinked: boolean;
  projectId: string | null;
  purpose: string;
  status: CashAdvanceStatus;
  approvedBy: string | null;
  releasedAt: Date | null;
  createdAt: Date;
}

export interface CashAdvanceRecovery {
  id: string;
  cashAdvanceId: string;
  payrollId: string;
  amountDeducted: number;
  remainingBalance: number;
  createdAt: Date;
}

export interface Deduction {
  description: string;
  amount: number;
}

export interface Addition {
  description: string;
  amount: number;
}

export interface Payroll {
  id: string;
  periodStart: Date;
  periodEnd: Date;
  status: PayrollStatus;
}

export interface Payslip {
  id: string;
  payrollId: string;
  employeeId: string;
  basicPay: number;
  deductions: Deduction[];
  additions: Addition[];
  cashAdvanceDeductions: CashAdvanceRecovery[];
  netPay: number;
  fundSourceId: string;
}

// ─── POS ──────────────────────────────────────────────────────────────────────

export interface POSSession {
  id: string;
  cashierId: string;
  openedAt: Date;
  closedAt: Date | null;
  openingCash: number;
  closingCash: number | null;
  fundSourceId: string;
  status: PosSessionStatus;
}

export interface POSSaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface POSSale {
  id: string;
  sessionId: string;
  customerId: string | null;
  lineItems: POSSaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: PaymentMethod;
  fundSourceId: string;
  receiptNo: string;
  createdAt: Date;
}

// ─── Accounting ───────────────────────────────────────────────────────────────

export interface Account {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface JournalLine {
  id: string;
  journalEntryId: string;
  accountId: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  referenceType: string;
  referenceId: string;
  date: Date;
  lines: JournalLine[];
  description: string;
  createdBy: string;
}

export interface TaxRate {
  id: string;
  name: string;
  percentage: number;
  isDefault: boolean;
}

export interface FiscalYear {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isClosed: boolean;
}

// ─── Support ──────────────────────────────────────────────────────────────────

export interface Ticket {
  id: string;
  customerId: string;
  projectId: string | null;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assignedTo: string | null;
  createdAt: Date;
}

export interface TicketComment {
  id: string;
  ticketId: string;
  authorId: string;
  message: string;
  isInternal: boolean;
  createdAt: Date;
}

export interface TicketAttachment {
  id: string;
  ticketId: string;
  fileUrl: string;
  uploadedAt: Date;
}
