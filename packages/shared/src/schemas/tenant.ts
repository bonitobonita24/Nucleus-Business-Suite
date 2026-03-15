import { z } from "zod";
import {
  CUSTOMER_TYPES,
  CREDIT_TRANSACTION_TYPES,
  CREDIT_REFERENCE_TYPES,
  PROPOSAL_STATUSES,
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  EXCESS_HANDLING_TYPES,
  SUBSCRIPTION_BILLING_CYCLES,
  SUBSCRIPTION_STATUSES,
  VENDOR_TYPES,
  ECOMMERCE_PLATFORMS,
  PURCHASE_ORDER_STATUSES,
  PURCHASE_INVOICE_STATUSES,
  EXPENSE_STATUSES,
  PRODUCT_TYPES,
  STOCK_MOVEMENT_TYPES,
  PROJECT_STATUSES,
  TASK_PRIORITIES,
  TASK_STATUSES,
  CLOCK_IN_LOCATIONS,
  ATTENDANCE_RECORD_STATUSES,
  ATTENDANCE_STATUSES,
  BUDGET_ALLOCATION_STATUSES,
  FUND_SOURCE_TYPES,
  FUND_TRANSACTION_TYPES,
  CREDIT_CARD_PAYMENT_TYPES,
  EMPLOYMENT_TYPES,
  LEAVE_REQUEST_TYPES,
  LEAVE_REQUEST_STATUSES,
  CASH_ADVANCE_STATUSES,
  PAYROLL_STATUSES,
  POS_SESSION_STATUSES,
  ACCOUNT_TYPES,
  TICKET_PRIORITIES,
  TICKET_STATUSES,
  TENANT_ROLES,
} from "../enums.js";

// ─── Reusable Base ────────────────────────────────────────────────────────────
const cuid2 = () => z.string().cuid2();
const money = () => z.number().nonnegative();

// ─── Auth / Users ─────────────────────────────────────────────────────────────

export const UserSchema = z.object({
  id: cuid2(),
  name: z.string().min(1).max(200),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(TENANT_ROLES),
  departmentId: cuid2().nullable(),
  isEmployee: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const CreateUserSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  role: true,
  departmentId: true,
  isEmployee: true,
});

export const DepartmentSchema = z.object({
  id: cuid2(),
  name: z.string().min(1).max(100),
});

export const AuditLogSchema = z.object({
  id: cuid2(),
  userId: cuid2(),
  action: z.string().min(1),
  module: z.string().min(1),
  recordId: z.string(),
  timestamp: z.date(),
});

// ─── CRM / Sales ─────────────────────────────────────────────────────────────

export const LineItemSchema = z.object({
  productId: cuid2().nullable(),
  description: z.string().min(1),
  quantity: z.number().positive(),
  unitPrice: money(),
  lineTotal: money(),
});

export const CustomerSchema = z.object({
  id: cuid2(),
  companyName: z.string().min(1).max(200),
  contactPerson: z.string().min(1).max(200),
  email: z.string().email(),
  phone: z.string().min(1),
  address: z.string().min(1),
  type: z.enum(CUSTOMER_TYPES),
  creditLimit: money().nullable(),
  creditBalance: money(),
  createdAt: z.date(),
});

export const CreateCustomerSchema = CustomerSchema.pick({
  companyName: true,
  contactPerson: true,
  email: true,
  phone: true,
  address: true,
  type: true,
  creditLimit: true,
});

export const CustomerCreditAccountSchema = z.object({
  id: cuid2(),
  customerId: cuid2(),
  totalCredited: money(),
  totalUsed: money(),
  totalRefunded: money(),
  currentBalance: money(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CustomerCreditTransactionSchema = z.object({
  id: cuid2(),
  customerId: cuid2(),
  type: z.enum(CREDIT_TRANSACTION_TYPES),
  amount: z.number().positive(),
  referenceType: z.enum(CREDIT_REFERENCE_TYPES),
  referenceId: z.string(),
  invoiceId: cuid2().nullable(),
  notes: z.string().nullable(),
  performedBy: z.string().min(1),
  createdAt: z.date(),
});

export const ProposalSchema = z.object({
  id: cuid2(),
  customerId: cuid2(),
  lineItems: z.array(LineItemSchema).min(1),
  terms: z.string().nullable(),
  status: z.enum(PROPOSAL_STATUSES),
  createdAt: z.date(),
});

export const CreateProposalSchema = ProposalSchema.pick({
  customerId: true,
  lineItems: true,
  terms: true,
});

export const InvoiceSchema = z.object({
  id: cuid2(),
  customerId: cuid2(),
  proposalId: cuid2().nullable(),
  projectId: cuid2().nullable(),
  subscriptionId: cuid2().nullable(),
  lineItems: z.array(LineItemSchema).min(1),
  subtotal: money(),
  tax: money(),
  total: money(),
  amountPaid: money(),
  creditApplied: money(),
  balance: money(),
  status: z.enum(INVOICE_STATUSES),
  fundSourceId: cuid2().nullable(),
  dueDate: z.date(),
  createdAt: z.date(),
});

export const CreateInvoiceSchema = InvoiceSchema.pick({
  customerId: true,
  proposalId: true,
  projectId: true,
  subscriptionId: true,
  lineItems: true,
  fundSourceId: true,
  dueDate: true,
});

export const PaymentSchema = z.object({
  id: cuid2(),
  invoiceId: cuid2(),
  amount: z.number().positive(),
  method: z.enum(PAYMENT_METHODS),
  fundSourceId: cuid2(),
  referenceNo: z.string().nullable(),
  balanceAfterPayment: money(),
  excessAmount: money(),
  excessHandling: z.enum(EXCESS_HANDLING_TYPES),
  notes: z.string().nullable(),
  recordedBy: z.string().min(1),
  paidAt: z.date(),
});

export const CreatePaymentSchema = PaymentSchema.pick({
  invoiceId: true,
  amount: true,
  method: true,
  fundSourceId: true,
  referenceNo: true,
  notes: true,
});

export const SubscriptionSchema = z.object({
  id: cuid2(),
  customerId: cuid2(),
  planId: z.string(),
  billingCycle: z.enum(SUBSCRIPTION_BILLING_CYCLES),
  nextBillingDate: z.date(),
  descriptionTemplate: z.string().min(1),
  status: z.enum(SUBSCRIPTION_STATUSES),
});

// ─── Purchasing ───────────────────────────────────────────────────────────────

export const VendorSchema = z.object({
  id: cuid2(),
  type: z.enum(VENDOR_TYPES),
  name: z.string().min(1).max(200),
  createdAt: z.date(),
});

export const DirectSupplierSchema = z.object({
  id: cuid2(),
  vendorId: cuid2(),
  companyOrPersonName: z.string().min(1).max(200),
  contactPerson: z.string().nullable(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
});

export const ECommerceSellerSchema = z.object({
  id: cuid2(),
  vendorId: cuid2(),
  platform: z.enum(ECOMMERCE_PLATFORMS),
  sellerName: z.string().min(1).max(200),
  profileUrl: z.string().url().nullable(),
  createdAt: z.date(),
});

export const PurchaseOrderItemSchema = z.object({
  id: cuid2(),
  purchaseOrderId: cuid2(),
  productId: cuid2().nullable(),
  productName: z.string().min(1),
  quantity: z.number().positive(),
  unitCost: money(),
  lineTotal: money(),
  landedUnitCost: money(),
});

export const PurchaseOrderSchema = z.object({
  id: cuid2(),
  vendorId: cuid2(),
  lineItems: z.array(PurchaseOrderItemSchema).min(1),
  subtotal: money(),
  status: z.enum(PURCHASE_ORDER_STATUSES),
  fundSourceId: cuid2(),
  expectedDate: z.date().nullable(),
  approvedBy: z.string().nullable(),
  approvedAt: z.date().nullable(),
  createdAt: z.date(),
});

export const ShippingCostSchema = z.object({
  id: cuid2(),
  purchaseOrderId: cuid2(),
  logisticsProvider: z.string().min(1),
  amount: money().nullable(),
  receiptPhotoUrl: z.string().url().nullable(),
  notes: z.string().nullable(),
  addedBy: z.string().min(1),
  createdAt: z.date(),
});

export const GoodsReceiptSchema = z.object({
  id: cuid2(),
  purchaseOrderId: cuid2(),
  receivedBy: z.string().min(1),
  receivedAt: z.date(),
  notes: z.string().nullable(),
  photos: z.array(z.string().url()),
});

export const ExpenseSchema = z.object({
  id: cuid2(),
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().min(1),
  attachmentUrl: z.string().url().nullable(),
  fundSourceId: cuid2(),
  submittedBy: z.string().min(1),
  status: z.enum(EXPENSE_STATUSES),
  createdAt: z.date(),
});

export const CreateExpenseSchema = ExpenseSchema.pick({
  category: true,
  amount: true,
  description: true,
  attachmentUrl: true,
  fundSourceId: true,
});

// ─── Inventory ────────────────────────────────────────────────────────────────

export const ProductSchema = z.object({
  id: cuid2(),
  name: z.string().min(1).max(200),
  sku: z.string().min(1).max(100),
  description: z.string().nullable(),
  type: z.enum(PRODUCT_TYPES),
  unitPrice: money(),
  costPrice: money(),
  stock: z.number().int().nonnegative(),
  reorderLevel: z.number().int().nonnegative(),
  categoryId: cuid2().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const CreateProductSchema = ProductSchema.pick({
  name: true,
  sku: true,
  description: true,
  type: true,
  unitPrice: true,
  costPrice: true,
  reorderLevel: true,
  categoryId: true,
});

export const CategorySchema = z.object({
  id: cuid2(),
  name: z.string().min(1).max(100),
  parentId: cuid2().nullable(),
});

export const StockMovementSchema = z.object({
  id: cuid2(),
  productId: cuid2(),
  type: z.enum(STOCK_MOVEMENT_TYPES),
  quantity: z.number().int().positive(),
  referenceType: z.string().min(1),
  referenceId: z.string().min(1),
  notes: z.string().nullable(),
  createdAt: z.date(),
});

export const WarehouseSchema = z.object({
  id: cuid2(),
  name: z.string().min(1).max(100),
  location: z.string().nullable(),
  isDefault: z.boolean(),
});

// ─── Projects ─────────────────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  id: cuid2(),
  customerId: cuid2(),
  name: z.string().min(1).max(200),
  description: z.string().nullable(),
  budget: money(),
  startDate: z.date(),
  endDate: z.date().nullable(),
  status: z.enum(PROJECT_STATUSES),
  managerId: cuid2(),
  createdAt: z.date(),
});

export const CreateProjectSchema = ProjectSchema.pick({
  customerId: true,
  name: true,
  description: true,
  budget: true,
  startDate: true,
  endDate: true,
  managerId: true,
});

export const MilestoneSchema = z.object({
  id: cuid2(),
  projectId: cuid2(),
  title: z.string().min(1).max(200),
  dueDate: z.date(),
  isCompleted: z.boolean(),
});

export const TimeLogSchema = z.object({
  id: cuid2(),
  projectId: cuid2(),
  taskId: cuid2().nullable(),
  userId: cuid2(),
  hours: z.number().positive().max(24),
  description: z.string().nullable(),
  loggedAt: z.date(),
});

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const TaskSchema = z.object({
  id: cuid2(),
  title: z.string().min(1).max(200),
  description: z.string().nullable(),
  projectId: cuid2().nullable(),
  assignedTo: cuid2(),
  assignedBy: cuid2(),
  priority: z.enum(TASK_PRIORITIES),
  status: z.enum(TASK_STATUSES),
  dueDate: z.date().nullable(),
  createdAt: z.date(),
});

export const CreateTaskSchema = TaskSchema.pick({
  title: true,
  description: true,
  projectId: true,
  assignedTo: true,
  priority: true,
  dueDate: true,
});

export const ToDoSchema = z.object({
  id: cuid2(),
  userId: cuid2(),
  title: z.string().min(1).max(200),
  isCompleted: z.boolean(),
  dueDate: z.date().nullable(),
  createdAt: z.date(),
});

// ─── DTR / Attendance ─────────────────────────────────────────────────────────

export const AttendanceRecordSchema = z.object({
  id: cuid2(),
  userId: cuid2(),
  date: z.date(),
  clockInTime: z.date(),
  clockInLat: z.number().min(-90).max(90).nullable(),
  clockInLng: z.number().min(-180).max(180).nullable(),
  clockInLocation: z.enum(CLOCK_IN_LOCATIONS),
  clockOutTime: z.date().nullable(),
  clockOutLat: z.number().min(-90).max(90).nullable(),
  clockOutLng: z.number().min(-180).max(180).nullable(),
  workLocation: z.string().nullable(),
  projectId: cuid2().nullable(),
  status: z.enum(ATTENDANCE_RECORD_STATUSES),
  approvedBy: cuid2().nullable(),
  approvedAt: z.date().nullable(),
  notes: z.string().nullable(),
  isSyncedFromOffline: z.boolean(),
  createdAt: z.date(),
});

export const ClockInSchema = z.object({
  clockInLat: z.number().min(-90).max(90).nullable(),
  clockInLng: z.number().min(-180).max(180).nullable(),
  clockInLocation: z.enum(CLOCK_IN_LOCATIONS),
  projectId: cuid2().nullable(),
  isSyncedFromOffline: z.boolean().default(false),
  clockInTime: z.date().optional(),
});

export const AttendanceSchema = z.object({
  id: cuid2(),
  employeeId: cuid2(),
  attendanceRecordId: cuid2(),
  date: z.date(),
  hoursWorked: z.number().nonnegative().max(24),
  status: z.enum(ATTENDANCE_STATUSES),
});

// ─── Budget ───────────────────────────────────────────────────────────────────

export const BudgetAllocationSchema = z.object({
  id: cuid2(),
  allocatedTo: cuid2(),
  allocatedBy: cuid2(),
  amount: z.number().positive(),
  remainingBalance: money(),
  projectId: cuid2().nullable(),
  generalCategory: z.string().nullable(),
  fundSourceId: cuid2(),
  notes: z.string().nullable(),
  status: z.enum(BUDGET_ALLOCATION_STATUSES),
  createdAt: z.date(),
});

export const CreateBudgetAllocationSchema = BudgetAllocationSchema.pick({
  allocatedTo: true,
  amount: true,
  projectId: true,
  generalCategory: true,
  fundSourceId: true,
  notes: true,
});

// ─── Banking & Finance ────────────────────────────────────────────────────────

export const FundSourceSchema = z.object({
  id: cuid2(),
  type: z.enum(FUND_SOURCE_TYPES),
  name: z.string().min(1).max(200),
  institutionName: z.string().nullable(),
  accountNumber: z.string().nullable(),
  currentBalance: z.number(),
  creditLimit: money().nullable(),
  outstandingBalance: money().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export const FundTransactionSchema = z.object({
  id: cuid2(),
  fundSourceId: cuid2(),
  type: z.enum(FUND_TRANSACTION_TYPES),
  amount: z.number().positive(),
  referenceType: z.string().min(1),
  referenceId: z.string().min(1),
  description: z.string().min(1),
  balanceAfter: z.number(),
  createdBy: cuid2(),
  createdAt: z.date(),
});

export const CreditCardPaymentSchema = z.object({
  id: cuid2(),
  creditCardFundSourceId: cuid2(),
  paidFromFundSourceId: cuid2(),
  amount: z.number().positive(),
  paymentType: z.enum(CREDIT_CARD_PAYMENT_TYPES),
  coveredTransactionIds: z.array(cuid2()),
  statementPeriodStart: z.date().nullable(),
  statementPeriodEnd: z.date().nullable(),
  notes: z.string().nullable(),
  createdBy: cuid2(),
  createdAt: z.date(),
});

// ─── HR & Payroll ─────────────────────────────────────────────────────────────

export const EmployeeSchema = z.object({
  id: cuid2(),
  userId: cuid2(),
  employeeNo: z.string().min(1).max(50),
  position: z.string().min(1).max(100),
  department: z.string().min(1).max(100),
  employmentType: z.enum(EMPLOYMENT_TYPES),
  hireDate: z.date(),
  salary: money(),
  isActive: z.boolean(),
});

export const LeaveRequestSchema = z.object({
  id: cuid2(),
  employeeId: cuid2(),
  type: z.enum(LEAVE_REQUEST_TYPES),
  startDate: z.date(),
  endDate: z.date(),
  status: z.enum(LEAVE_REQUEST_STATUSES),
  approvedBy: cuid2().nullable(),
});

export const CreateLeaveRequestSchema = LeaveRequestSchema.pick({
  type: true,
  startDate: true,
  endDate: true,
});

export const CashAdvanceSchema = z.object({
  id: cuid2(),
  employeeId: cuid2(),
  amount: z.number().positive(),
  fundSourceId: cuid2(),
  isProjectLinked: z.boolean(),
  projectId: cuid2().nullable(),
  purpose: z.string().min(1),
  status: z.enum(CASH_ADVANCE_STATUSES),
  approvedBy: cuid2().nullable(),
  releasedAt: z.date().nullable(),
  createdAt: z.date(),
});

export const PayrollSchema = z.object({
  id: cuid2(),
  periodStart: z.date(),
  periodEnd: z.date(),
  status: z.enum(PAYROLL_STATUSES),
});

export const DeductionSchema = z.object({
  description: z.string().min(1),
  amount: money(),
});

export const AdditionSchema = z.object({
  description: z.string().min(1),
  amount: money(),
});

export const PayslipSchema = z.object({
  id: cuid2(),
  payrollId: cuid2(),
  employeeId: cuid2(),
  basicPay: money(),
  deductions: z.array(DeductionSchema),
  additions: z.array(AdditionSchema),
  cashAdvanceDeductions: z.array(z.object({ cashAdvanceRecoveryId: cuid2(), amount: money() })),
  netPay: money(),
  fundSourceId: cuid2(),
});

// ─── POS ──────────────────────────────────────────────────────────────────────

export const POSSessionSchema = z.object({
  id: cuid2(),
  cashierId: cuid2(),
  openedAt: z.date(),
  closedAt: z.date().nullable(),
  openingCash: money(),
  closingCash: money().nullable(),
  fundSourceId: cuid2(),
  status: z.enum(POS_SESSION_STATUSES),
});

export const POSSaleItemSchema = z.object({
  id: cuid2(),
  saleId: cuid2(),
  productId: cuid2(),
  quantity: z.number().int().positive(),
  unitPrice: money(),
  lineTotal: money(),
});

export const POSSaleSchema = z.object({
  id: cuid2(),
  sessionId: cuid2(),
  customerId: cuid2().nullable(),
  lineItems: z.array(POSSaleItemSchema).min(1),
  subtotal: money(),
  discount: money(),
  tax: money(),
  total: money(),
  paymentMethod: z.enum(PAYMENT_METHODS),
  fundSourceId: cuid2(),
  receiptNo: z.string().min(1),
  createdAt: z.date(),
});

// ─── Accounting ───────────────────────────────────────────────────────────────

export const AccountSchema = z.object({
  id: cuid2(),
  code: z.string().min(1).max(20),
  name: z.string().min(1).max(200),
  type: z.enum(ACCOUNT_TYPES),
  balance: z.number(),
});

export const JournalLineSchema = z.object({
  id: cuid2(),
  journalEntryId: cuid2(),
  accountId: cuid2(),
  debit: money(),
  credit: money(),
});

export const JournalEntrySchema = z.object({
  id: cuid2(),
  referenceType: z.string().min(1),
  referenceId: z.string().min(1),
  date: z.date(),
  lines: z.array(JournalLineSchema).min(2),
  description: z.string().min(1),
  createdBy: cuid2(),
});

export const TaxRateSchema = z.object({
  id: cuid2(),
  name: z.string().min(1).max(100),
  percentage: z.number().min(0).max(100),
  isDefault: z.boolean(),
});

export const FiscalYearSchema = z.object({
  id: cuid2(),
  name: z.string().min(1).max(100),
  startDate: z.date(),
  endDate: z.date(),
  isClosed: z.boolean(),
});

// ─── Support ──────────────────────────────────────────────────────────────────

export const TicketSchema = z.object({
  id: cuid2(),
  customerId: cuid2(),
  projectId: cuid2().nullable(),
  subject: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(TICKET_PRIORITIES),
  status: z.enum(TICKET_STATUSES),
  assignedTo: cuid2().nullable(),
  createdAt: z.date(),
});

export const CreateTicketSchema = TicketSchema.pick({
  customerId: true,
  projectId: true,
  subject: true,
  description: true,
  priority: true,
});

export const TicketCommentSchema = z.object({
  id: cuid2(),
  ticketId: cuid2(),
  authorId: cuid2(),
  message: z.string().min(1),
  isInternal: z.boolean(),
  createdAt: z.date(),
});
