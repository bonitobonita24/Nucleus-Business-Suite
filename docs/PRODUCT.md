# Product Definition
# ⚠️ THIS IS THE ONLY FILE YOU EDIT AS A HUMAN.
# Agents own everything else. To change anything — edit this file, then run Phase 7.

## App Name
Nucleus Business Suite

## Connected Apps
- Nucleus Web — full ERP management dashboard (Next.js, port 3000)
  - Tenancy: multi-tenant, path-based subdirectory routing
  - Accessible at: erp.powerbyte.app/<tenant_slug>/erp
- Nucleus POS — cashier point-of-sale terminal (Next.js, same app)
  - Accessible at: erp.powerbyte.app/<tenant_slug>/pos
- Nucleus Portal — customer self-service portal (Next.js, same app)
  - Accessible at: erp.powerbyte.app/<tenant_slug>/portal
- Nucleus Admin — Powerbyte super admin panel (Next.js, same app)
  - Accessible at: erp.powerbyte.app/powerbyte-admin
- Nucleus Mobile — field companion app (Expo / React Native, iOS + Android)
  - Offline-first: yes (DTR clock-in/out, tasks, expenses, payslip cache)
  - Push notifications: yes (Expo Push / FCM + APNs)
  - Deployment: internal/enterprise only (APK + IPA via MDM or direct
    install link — NOT App Store or Play Store)

NOTE: All four web apps are ONE unified Next.js app on port 3000.
Next.js route groups handle all routing internally. No nginx, no
separate apps, no reverse proxy needed.

## Purpose
Powerbyte ERP — Nucleus Business Suite is a multi-tenant,
subscription-based enterprise resource planning SaaS platform built for
small-to-medium IT solutions and services businesses that sell both
physical products and billable services. Each subscribing business gets
a fully isolated ERP environment at their own path-based URL, with data
stored in a completely separate PostgreSQL schema — physically isolated
from all other tenants at the database level. The platform centralizes
sales, purchasing, inventory, project delivery, task management,
point-of-sale, accounting, banking, and HR into a single unified system
per tenant, with a Credit Manager for per-customer advance payments and
credit tracking. A companion mobile app (iOS + Android) allows employees
to clock in/out with GPS, manage tasks, view payslips, and submit
expenses from the field with full offline support.

## Target Users

### Platform-Level (Powerbyte Internal)
- platform_owner: Powerbyte super admin — manages all tenants, plans,
  billing, suspensions, DLQ replay; cannot access any tenant's ERP data

### Tenant-Level (each role scoped to their own PostgreSQL schema)
- tenant_super_admin: full access to all ERP modules; manages own users
  and settings; cannot access other tenants; mobile app access
- admin: full operational ERP access; assigns any role except
  tenant_super_admin; approves attendance; receives cost change alerts;
  manages customer credit limits and balances; mobile app access
- accountant: Accounting, Banking, Invoices, Payments, Expenses,
  Payroll; allocates budgets; manages customer credit limits/balances;
  read-only on other modules
- hr_manager: HR, Attendance, Leave, Cash Advances, Payroll, Banking;
  creates/manages staff users only; mobile app access
- project_manager: Projects, Tasks, Milestones, Time Logs,
  ProjectExpenses, Banking; approves on-site attendance; assigns tasks
  to any user; generates project invoices; mobile app access
- budget_holder: logs expenses against own allocation only; views own
  balance and spend history; cannot see other users' data
- sales_staff: Proposals, Invoices, Subscriptions, Customers; records
  payments; manages customer credit limits/balances; applies credit to
  invoices; handles excess payment decisions; processes credit refunds;
  no HR/Banking/Accounting access
- purchasing_staff: POs, Vendors, Goods Receipt, Shipping, Expenses;
  fund source selection; read-only on Inventory
- inventory_staff: Products, Stock, Warehouses, Purchase History;
  read-only on Purchasing
- staff: Task Dashboard on login; DTR clock-in/out; own tasks and todos
  only; no financial access; mobile app access
- cashier: POS Terminal + Task Dashboard only; fund source per session;
  no back-office access
- support_agent: Support Tickets full access; read-only on Customer and
  Projects; Task Dashboard
- customer: portal only — own Invoices (with Payment History and Credit
  Balance), Proposals, Project status, Tickets; can see own credit
  balance but never the internal credit limit setting

  Mobile app roles: staff, project_manager, hr_manager, admin,
  tenant_super_admin — same ERP credentials, same Auth.js JWT

## Core Entities

### Global Schema (public) — Platform Level Only
NOTE: These tables exist ONCE in the shared public schema. Only
platform_owner and the automated billing system access these. Tenant
users have zero visibility into this schema.

- Tenant (id, tenantName[slug: lowercase alphanumeric+hyphens 3–30
  chars, globally unique], companyName, ownerEmail, ownerName, planId,
  status[trial|active|suspended|cancelled], trialEndsAt,
  schemaName[t_<slug_underscored>], createdAt)
- Plan (id, name[Starter|Growth|Pro|Enterprise], monthlyPrice,
  annualPrice, features[], maxUsers, maxStorageGB, isActive, createdAt)
- TenantSubscription (id, tenantId, planId,
  billingCycle[monthly|annual], currentPeriodStart, currentPeriodEnd,
  status[active|past_due|cancelled])
- TenantInvoice (id, tenantId, subscriptionId, amount,
  status[draft|sent|paid|past_due|cancelled], dueDate, paidAt,
  generatedAt)
- TenantPayment (id, tenantInvoiceId, amount, method, referenceNo,
  paidAt, recordedBy)
- TenantAuditLog (id, tenantId, action, performedBy, notes, createdAt)

### Tenant Schema (t_<slug>) — All ERP Data
NOTE: Every entity below lives exclusively inside the tenant's own
PostgreSQL schema. No tenantId column on any of these tables — the
schema boundary IS the isolation layer.

#### Auth / Users
- User (id, name, email, password, role, departmentId, isEmployee,
  isActive, createdAt)
- Role (id, name, permissions[])
- Department (id, name)
- AuditLog (id, userId, action, module, recordId, timestamp)

#### CRM / Sales
- Customer (id, companyName, contactPerson, email, phone, address,
  type[individual|business], creditLimit[nullable — null=unlimited,
  0=no credit facility], creditBalance[default 0], createdAt)
- CustomerCreditAccount (id, customerId, totalCredited, totalUsed,
  totalRefunded, currentBalance, createdAt, updatedAt)
  NOTE: One per customer. Auto-created when creditLimit > 0 first set.
  Immutable ledger header. currentBalance = authoritative credit balance.
  Never deleted even if balance reaches zero.
- CustomerCreditTransaction (id, customerId,
  type[advance_payment|excess_payment|credit_applied|credit_refunded],
  amount, referenceType[invoice|payment|manual_refund], referenceId,
  invoiceId[nullable], notes, performedBy, createdAt)
  NOTE: Immutable ledger — never updated or deleted after creation.
- Proposal (id, customerId, lineItems[], terms,
  status[draft|sent|revised|accepted|declined], createdAt)
- Invoice (id, customerId, proposalId, projectId, subscriptionId,
  lineItems[], subtotal, tax, total, amountPaid, creditApplied,
  balance, status[draft|sent|unpaid|partially_paid|overdue|paid],
  fundSourceId, dueDate, createdAt)
  NOTE: balance = total - amountPaid - creditApplied
  Status auto-transitions:
  amountPaid+creditApplied=0 → unpaid
  0 < amountPaid+creditApplied < total → partially_paid
  amountPaid+creditApplied=total → paid
  past dueDate and balance>0 → overdue
- Payment (id, invoiceId, amount, method[cash|card|bank|gcash|other],
  fundSourceId, referenceNo, balanceAfterPayment, excessAmount,
  excessHandling[credited_to_account|refunded|pending_decision],
  notes, recordedBy, paidAt)
- Subscription (id, customerId, planId,
  billingCycle[monthly|quarterly|annual], nextBillingDate,
  descriptionTemplate[supports {{month}} {{date}} {{year}}],
  status[active|paused|cancelled])

#### Purchasing
- Vendor (id, type[direct_supplier|ecommerce_seller], name, createdAt)
- DirectSupplier (id, vendorId, companyOrPersonName, contactPerson,
  email, phone, address)
- ECommerceSeller (id, vendorId,
  platform[shopee|lazada|zalora|fb_marketplace|other],
  sellerName, profileUrl, createdAt)
- PurchaseOrder (id, vendorId, lineItems[], subtotal,
  status[draft|sent|confirmed|partially_received|received|cancelled],
  fundSourceId, expectedDate, approvedBy, approvedAt, createdAt)
- PurchaseOrderItem (id, purchaseOrderId, productId, productName,
  quantity, unitCost, lineTotal, landedUnitCost[computed])
- ShippingCost (id, purchaseOrderId, logisticsProvider,
  amount[nullable], receiptPhotoUrl, notes, addedBy, createdAt)
- GoodsReceipt (id, purchaseOrderId, receivedBy, receivedAt, notes,
  photos[url[]])
- GoodsReceiptItem (id, goodsReceiptId, purchaseOrderItemId, productId,
  quantityReceived)
- PurchaseInvoice (id, purchaseOrderId, vendorInvoiceNo, amount,
  fundSourceId, status[unpaid|paid], dueDate, createdAt)
- Expense (id, category, amount, description, attachmentUrl,
  fundSourceId, submittedBy, status[draft|approved|rejected], createdAt)

#### Inventory
- Product (id, name, sku, description, type[physical|service],
  unitPrice, costPrice, stock, reorderLevel, categoryId, isActive,
  createdAt)
- Category (id, name, parentId)
- ProductPurchaseHistory (id, productId, purchaseOrderId, vendorId,
  vendorName, vendorType, platform, quantityReceived, unitCost,
  shippingCostShare, landedUnitCost, receivedAt)
- StockMovement (id, productId, type[in|out|adjustment|transfer],
  quantity, referenceType, referenceId, notes, createdAt)
- Warehouse (id, name, location, isDefault)
- WarehouseStock (id, warehouseId, productId, quantity)

#### Projects
- Project (id, customerId, name, description, budget, startDate,
  endDate, status[draft|active|on_hold|completed|cancelled],
  managerId, createdAt)
- ProjectExpense (id, projectId, budgetAllocationId, cashAdvanceId,
  category, amount, description, receiptUrl, fundSourceId, loggedBy,
  status[draft|approved|rejected], createdAt)
- Milestone (id, projectId, title, dueDate, isCompleted)
- TimeLog (id, projectId, taskId, userId, hours, description, loggedAt)

#### Tasks
- Task (id, title, description, projectId, assignedTo, assignedBy,
  priority[low|medium|high], status[todo|in_progress|done|cancelled],
  dueDate, createdAt)
- ToDo (id, userId, title, isCompleted, dueDate, createdAt)

#### DTR / Attendance
- AttendanceRecord (id, userId, date, clockInTime, clockInLat,
  clockInLng, clockInLocation[office|project_site], clockOutTime,
  clockOutLat, clockOutLng, workLocation, projectId,
  status[pending|approved|rejected], approvedBy, approvedAt, notes,
  isSyncedFromOffline[boolean], createdAt)

#### Budget
- BudgetAllocation (id, allocatedTo, allocatedBy, amount,
  remainingBalance, projectId, generalCategory, fundSourceId, notes,
  status[active|exhausted|revoked], createdAt)

#### Banking & Finance
- FundSource (id, type[cash_on_hand|e_wallet|bank|credit_card], name,
  institutionName, accountNumber, currentBalance, creditLimit,
  outstandingBalance, isActive, createdAt)
- FundTransaction (id, fundSourceId, type[credit|debit], amount,
  referenceType, referenceId, description, balanceAfter, createdBy,
  createdAt)
- CreditCardPayment (id, creditCardFundSourceId, paidFromFundSourceId,
  amount, paymentType[per_transaction|bulk_statement|partial],
  coveredTransactionIds, statementPeriodStart, statementPeriodEnd,
  notes, createdBy, createdAt)

#### HR & Payroll
- Employee (id, userId, employeeNo, position, department,
  employmentType[full_time|part_time|contractual], hireDate, salary,
  isActive)
- Attendance (id, employeeId, attendanceRecordId, date, hoursWorked,
  status[present|absent|late|half_day])
- LeaveRequest (id, employeeId, type[vacation|sick|emergency],
  startDate, endDate, status[pending|approved|rejected], approvedBy)
- CashAdvance (id, employeeId, amount, fundSourceId, isProjectLinked,
  projectId, purpose,
  status[pending|approved|released|partially_recovered|fully_recovered],
  approvedBy, releasedAt, createdAt)
- CashAdvanceRecovery (id, cashAdvanceId, payrollId, amountDeducted,
  remainingBalance, createdAt)
- Payroll (id, periodStart, periodEnd, status[draft|approved|released])
- Payslip (id, payrollId, employeeId, basicPay, deductions[],
  additions[], cashAdvanceDeductions[], netPay, fundSourceId)

#### POS
- POSSession (id, cashierId, openedAt, closedAt, openingCash,
  closingCash, fundSourceId, status[open|closed])
- POSSale (id, sessionId, customerId, lineItems[], subtotal, discount,
  tax, total, paymentMethod, fundSourceId, receiptNo, createdAt)
- POSSaleItem (id, saleId, productId, quantity, unitPrice, lineTotal)

#### Accounting
- Account (id, code, name,
  type[asset|liability|equity|income|expense], balance)
- JournalEntry (id, referenceType, referenceId, date, lines[],
  description, createdBy)
- JournalLine (id, journalEntryId, accountId, debit, credit)
- TaxRate (id, name, percentage, isDefault)
- FiscalYear (id, name, startDate, endDate, isClosed)

#### Support
- Ticket (id, customerId, projectId, subject, description,
  priority[low|medium|high|critical],
  status[open|in_progress|resolved|closed], assignedTo, createdAt)
- TicketComment (id, ticketId, authorId, message, isInternal, createdAt)
- TicketAttachment (id, ticketId, fileUrl, uploadedAt)

## User Roles
- platform_owner: global schema only — manage tenants, plans,
  TenantInvoices, TenantPayments, DLQ replay; zero tenant ERP access;
  JWT: { userId, role: "platform_owner", tenantSlug: null }
- tenant_super_admin: tenant-scoped — full access all modules; assign
  any role; approve attendance; allocate budgets; manage customer credit
- admin: tenant-scoped — full operational access; assign any role
  except tenant_super_admin; approve attendance; manage customer credit;
  cannot delete core records
- accountant: tenant-scoped — Accounting, Banking, Invoices, Payments,
  Expenses, Payroll; allocate budgets; manage customer credit;
  read-only elsewhere
- hr_manager: tenant-scoped — HR, Attendance, Leave, Cash Advances,
  Payroll, Banking; create/manage staff users only; higher role
  assignments require admin or tenant_super_admin
- project_manager: tenant-scoped — Projects, Tasks, Milestones, Time
  Logs, ProjectExpenses, Banking; approve on-site attendance for own
  projects; assign tasks to any user; generate project invoices
- budget_holder: tenant-scoped — log expenses against own allocation;
  view own balance only; cannot see other users' data
- sales_staff: tenant-scoped — Proposals, Invoices, Subscriptions,
  Customers; record payments; manage customer credit limits/balances;
  apply credit; handle excess payments; process refunds; no HR/Banking/
  Accounting access
- purchasing_staff: tenant-scoped — POs, Vendors, Goods Receipt,
  Shipping, Expenses; fund source selection; read-only Inventory
- inventory_staff: tenant-scoped — Products, Stock, Warehouses,
  Purchase History; read-only Purchasing
- staff: tenant-scoped — Task Dashboard; DTR clock-in/out; own tasks
  and todos only; no financial access; mobile app access
- cashier: tenant-scoped — POS Terminal; Task Dashboard; fund source
  per session; no back-office access
- support_agent: tenant-scoped — Support Tickets; read-only Customer
  and Projects; Task Dashboard
- customer: tenant-scoped — portal only; own Invoices (with Payment
  History and Credit Balance), Proposals, Project status, Tickets;
  sees own credit balance only — never the internal credit limit

  Mobile app roles: staff, project_manager, hr_manager, admin,
  tenant_super_admin — same ERP credentials, same Auth.js JWT

## Main Workflows (step-by-step)

### Workflow: New Tenant Signup and Onboarding
1. Visitor lands on erp.powerbyte.app; clicks "Get Started"
2. Fills company name, owner name, email, password; selects plan
3. System validates slug uniqueness; background job fires
4. Job provisions PostgreSQL schema t_<slug>, runs full ERP migrations,
   creates tenant_super_admin user, sends welcome email via Resend
5. Tenant redirected to erp.powerbyte.app/<tenant_slug>/erp; 14-day
   trial begins
ERROR PATH: Provisioning fails → retry 3x exponential from 5s; DLQ
after 3 failures; platform_owner notified; tenant sees "setup in
progress" until resolved via DLQ replay

### Workflow: Set Customer Credit Limit
1. Sales staff opens Customer record; navigates to Credit tab
2. Sets creditLimit: specific amount, 0 (no facility), or null
   (unlimited)
3. CustomerCreditAccount auto-created if not yet existing
4. Change logged in AuditLog with old and new value
ERROR PATH: Cannot set creditLimit below current creditBalance —
blocked: "Reduce or refund existing credit balance first"

### Workflow: Customer Advance Payment (Before Invoice)
1. Sales staff clicks "Record Advance Payment" on Customer Credit tab
2. Enters amount, method, FundSource, reference number
3. CustomerCreditTransaction: type = advance_payment
4. Customer.creditBalance increased; FundTransaction created;
   Journal Entry: Debit FundSource / Credit Customer Deposits
ERROR PATH: creditLimit = 0 → blocked: "No credit facility. Update
credit limit first."

### Workflow: Apply Credit to an Invoice
1. Sales staff opens unpaid/partially paid Invoice
2. "Apply Credit" shown if customer.creditBalance > 0
3. Staff enters amount (capped at lesser of creditBalance or balance)
4. CustomerCreditTransaction: type = credit_applied
5. Invoice.creditApplied and balance updated; status auto-updated
6. Journal Entry: Debit Customer Deposits / Credit Accounts Receivable
ERROR PATH: Amount exceeds creditBalance → auto-capped; balance shown

### Workflow: Excess Payment — Staff Decision
1. Staff records Payment where amount > invoice balance
2. System detects excess; invoice marked paid immediately
3. Staff prompted: "₱[X] excess — Credit to Account or Refund?"
4a. Credit to Account → CustomerCreditTransaction: excess_payment;
    creditBalance increased; Journal Entry posted
4b. Refund → FundSource deducted; CustomerCreditTransaction:
    credit_refunded; Journal Entry posted
ERROR PATH: Staff closes without deciding → saved as pending_decision;
flagged in Sales Dashboard until resolved

### Workflow: Credit Refund
1. Sales staff opens Customer Credit tab; clicks "Refund Credit"
2. Enters amount (up to creditBalance); selects FundSource
3. CustomerCreditTransaction: type = credit_refunded
4. creditBalance decreased; FundSource deducted; Journal Entry posted
ERROR PATH: FundSource insufficient → blocked; current balance shown

### Workflow: Recording a Payment
1. Sales staff opens Invoice; clicks "Record Payment"
2. Enters amount, method, FundSource, reference number
3. Invoice.amountPaid updated; balance recalculated; status updated
4. FundTransaction created; Journal Entry posted
5. Payment History tab: all payments and credit applications
   chronologically with running balance after each entry
ERROR PATH: FundTransaction or Journal Entry fails → full rollback;
payment not saved; user shown error

### Workflow: Mobile App — Clock-In Online
1. Employee opens Nucleus Mobile; logs in with ERP credentials
2. Taps Clock In; native GPS captured; selects Office or Project Site
3. AttendanceRecord created on server; status = pending
4. Taps Clock Out; GPS captured; record updated
5. Approved by admin, hr_manager, or linked project_manager on web
ERROR PATH: GPS unavailable → warning; clock-in allowed; coordinates
null; HR notified

### Workflow: Mobile App — Clock-In Offline
1. Employee opens app with no internet
2. Taps Clock In; device GPS captured natively (offline capable)
3. Record stored in WatermelonDB; isSyncedFromOffline = true
4. App shows "Offline — will sync when connected"
5. On reconnect → synced chronologically; status = pending
ERROR PATH: Sync conflict (duplicate date/time) → server rejects;
mobile shows error; user contacts HR

### Workflow: Mobile App — Task Update
1. Task Dashboard loads; employee sees own assigned tasks (Kanban)
2. Updates task status; syncs in real time when online
3. Offline → stored locally; synced on reconnect; server wins
   on conflict

### Workflow: Mobile App — Submit Expense with Photo
1. Taps "New Expense"; fills amount, category, description
2. Takes receipt photo via device camera
3. Photo uploaded to R2 via pre-signed URL; Expense submitted (draft)
4. Admin/Accountant approves on web; employee notified via push
ERROR PATH: Photo upload fails → expense saved without attachment;
retry option shown

### Workflow: Mobile App — View Payslip and Leave Balance
1. Employee navigates to HR section; views payslips and leave balance
2. Can submit LeaveRequest; status tracked in real time
ERROR PATH: Offline → cached last-viewed data shown with notice

### Workflow: Tenant Subscription Billing
1. Daily job scans subscriptions ending within 7 days
2. Draft TenantInvoice generated; Resend emails at 7 days + due date
3. platform_owner records TenantPayment; invoice marked paid
4. Unpaid past 7-day grace period → tenant suspended; all web and
   mobile sessions invalidated; full-page suspension notice
5. On payment → reactivated immediately
ERROR PATH: Job fails → retry 3x; DLQ; platform_owner alerted

### Workflow: Proposal to Invoice (Sales Cycle)
1. Proposal created → customer accepts → Draft Invoice auto-generated
2. Payments and/or credit applied until balance = 0
3. Invoice marked paid; Journal Entry posted
ERROR PATH: Customer rejects → Proposal stays declined; can be revised

### Workflow: Subscription Auto-Billing (Tenant Customers)
1. Daily job generates Draft Invoice 3 days before nextBillingDate
2. {{month}}, {{date}}, {{year}} resolved; staff reviews and sends
3. Payments recorded; nextBillingDate advanced
ERROR PATH: Job fails → DLQ; sales staff notified

### Workflow: Purchase Order with Smart Product Entry
1. PO created; live autocomplete from Inventory product names
2. Unmatched → flagged; draft Products auto-created on PO approval
3. Shipping costs added; landedUnitCost computed per item
ERROR PATH: PO approval fails → draft Products rolled back

### Workflow: Goods Receiving and Inventory Update
1. GoodsReceipt created; photos uploaded; quantities confirmed
2. Stock incremented; draft products activated; landedUnitCost written
   to costPrice; ProductPurchaseHistory created
3. Prior costPrice exists → admin notified: old, new, difference;
   Accept or Retain required
ERROR PATH: Stock update fails → full rollback

### Workflow: Budget Allocation and Expense Logging
1. Admin/Accountant allocates budget to budget_holder with FundSource
2. Expenses logged; remainingBalance deducted in real time
3. Approved → Journal Entry posted
ERROR PATH: Expense exceeds balance → blocked

### Workflow: Cash Advance
1. HR/Admin creates CashAdvance; selects FundSource; approves
2. FundSource deducted; Journal Entry posted
3. ProjectExpense created if project-linked (cost visibility only)
4. HR adds CashAdvanceRecovery per payroll run
ERROR PATH: FundSource insufficient → advance blocked

### Workflow: Credit Card Purchase and Settlement
1. Purchase recorded against credit card FundSource
2. outstandingBalance increases (liability); no real cash deducted
3. Admin/Accountant settles via per-transaction, bulk, or partial mode
4. paidFromFundSource deducted; outstandingBalance reduced
ERROR PATH: paidFromFundSource insufficient → payment blocked

### Workflow: Payroll Processing
1. HR reviews approved DTR and leave; creates payroll run
2. Pay computed per employee including manual cash advance deductions
3. Approved; payslips generated; FundSource deducted; Journal Entry
ERROR PATH: FundSource insufficient → payroll blocked

### Workflow: Point of Sale Transaction
1. Cashier opens POS Session; selects FundSource; enters opening cash
2. Products added to cart; payment processed; receipt issued
3. Stock auto-deducted; FundTransaction created
4. Session closed; cash reconciliation generated
ERROR PATH: Stock = 0 → item blocked from cart

### Workflow: Support Ticket Lifecycle
1. Customer submits or staff creates ticket; assigned with priority
2. Agent investigates; comments added; linked to Project if applicable
3. Resolved; customer notified; closed
ERROR PATH: Unassigned 24hrs → auto-escalation to admin

### Workflow: Expense Submission and Approval
1. Staff submits Expense with receipt, category, FundSource
2. Admin/Accountant approves or rejects with reason
3. Approved → FundTransaction created; Journal Entry posted
ERROR PATH: Rejected → returned with reason; staff can resubmit

## Realtime Features
- Task Dashboard: updates in real time on assignment or status change
  (web and mobile)
- Invoice: status, balance, and creditApplied update in real time
- Payment History: updates instantly per payment or credit applied
- Customer credit balance: updates in real time on every credit movement
- Pending excess payment decisions: flagged in Sales Dashboard in
  real time until resolved
- DTR: clock-in/out instantly visible to approvers
- Dashboard KPIs: update in real time
- Inventory: stock updates immediately on POS sale or goods receipt
- Banking: fund source balances update on every transaction
- Support Tickets: changes notify agent and customer instantly
- Low-stock alerts: triggered automatically at reorder level
- Cost change alerts: admin notified in real time on product repurchase
- Budget: remainingBalance updates in real time as expenses approved
- Cash advance: recovery balance updates per payroll deduction
- Tenant suspension: notice in real time; mobile sessions invalidated
- Mobile sync: pending offline records sync automatically on reconnect

## Background Jobs
- tenant-provisioning | on tenant signup | provision PostgreSQL schema,
  run ERP migrations, create tenant_super_admin, send welcome email
  via Resend | retry 3x exponential from 5s | DLQ required

- tenant-billing | daily | scan subscriptions ending within 7 days;
  generate TenantInvoice; send reminders via Resend; suspend after
  grace period; invalidate all sessions; reactivate on payment |
  retry 3x exponential | DLQ required

- invoice-processing | daily | scan invoices past dueDate with balance
  > 0; update status to overdue | retry 3x | DLQ required

- subscription-billing | daily | generate Draft Invoice 3 days before
  nextBillingDate; resolve {{month}} {{date}} {{year}}; advance
  nextBillingDate | retry 3x exponential | DLQ required

- inventory-alerts | daily | scan products at or below reorderLevel;
  alert admin and inventory_staff | retry 3x | DLQ required

- goods-receipt | on GoodsReceipt save | increment stock; activate
  draft products; write landedUnitCost to costPrice; create
  ProductPurchaseHistory; trigger cost change alerts | retry 3x |
  DLQ required; full rollback on failure

- payment-processing | on Payment saved | update Invoice amountPaid,
  creditApplied, balance, status; create FundTransaction; post Journal
  Entry; trigger excess handling prompt if applicable | retry 3x |
  DLQ required; full rollback on failure

- credit-processing | on CustomerCreditTransaction saved | update
  Customer.creditBalance; update CustomerCreditAccount totals; post
  Journal Entry; create FundTransaction if advance or refund | retry
  3x | DLQ required; full rollback on failure

- expense-processing | on Expense or ProjectExpense approved | post
  Journal Entry; deduct BudgetAllocation if applicable; create
  FundTransaction | retry 3x | DLQ required; approval rolled back

- cash-advance | on CashAdvance approved | deduct FundSource; post
  Journal Entry; create ProjectExpense if project-linked | retry 3x |
  DLQ required; approval rolled back on failure

- credit-card-payment | on CreditCardPayment saved | deduct
  paidFromFundSource; reduce outstandingBalance; mark settled
  transactions as real expenses | retry 3x | DLQ required; full
  rollback on failure

- payroll-processing | on Payroll released | create FundTransaction per
  payslip; deduct FundSource; post Journal Entry | retry 3x |
  DLQ required; payroll release rolled back on failure

- shipping-cost-recalc | on ShippingCost add or update | recalculate
  landedUnitCost for all PO items; trigger cost change alerts if
  costPrice affected | retry 3x | DLQ required

- mobile-sync | on mobile client reconnect | receive pending offline
  AttendanceRecords, task updates, expenses from device; validate;
  write to server; reject duplicates; notify mobile of conflicts |
  retry 3x | DLQ required

- pdf-generation | on demand | generate PDF for Invoice, Proposal,
  Payslip, PO, Goods Receipt per tenant | retry 3x | DLQ required

- report-export | on demand | generate CSV, PDF, or XLSX per module
  per tenant | retry 3x | DLQ required

- notifications | event-driven | send emails via Resend + push via
  Expo Push (task assignments, approvals, ticket updates, cost change
  alerts, low-stock, payroll released, leave status, expense approval,
  credit balance changes, excess payment decision required) | retry 3x
  | DLQ required; non-critical

- payroll-reminder | monthly | remind hr_manager of payroll period |
  retry 3x | DLQ required; non-critical

## File Uploads
- Allowed file types: image/jpeg, image/png, image/webp, application/pdf
- Max file size: 10MB per file
- Store originals: yes
- Image variants needed: none — originals only
- Storage path pattern:
  <tenant_slug>/receipts/goods-receipt/<id>/<filename>
  <tenant_slug>/receipts/shipping-cost/<id>/<filename>
  <tenant_slug>/receipts/expense/<id>/<filename>
  <tenant_slug>/receipts/cash-advance/<id>/<filename>
  <tenant_slug>/receipts/credit-card-payment/<id>/<filename>
  <tenant_slug>/receipts/credit-refund/<id>/<filename>
  <tenant_slug>/documents/proposals/<id>/<filename>
  <tenant_slug>/tickets/<id>/<filename>
- Mobile uploads: expense receipt photos uploaded to R2 via pre-signed
  URL; offline → stored locally in WatermelonDB; uploaded on reconnect

## Reporting & Dashboards

### Platform Super Admin Dashboard (platform_owner only)
KPIs: tenants by status (active/trial/suspended/cancelled), MRR,
upcoming and overdue TenantInvoices, recent signups, plan distribution,
churn rate, DLQ failed job count with replay UI
Charts: Bar (MRR trend), Pie (plan distribution), Table (tenant list)
Export: CSV, XLSX

### Tenant Main Dashboard
KPIs: Invoices Awaiting Payment, Partially Paid Invoices, Projects In
Progress, Tasks Not Finished, Invoice/Proposal status overview,
Outstanding/Past Due/Paid totals, Active Subscriptions + next billing,
Budget Allocations (allocated vs spent), Fund Source Balances, Credit
Card Outstanding Balance per card, Pending Excess Payment Decisions
Charts: Bar (revenue by period), Pie (invoice status), Table
Export: none (module reports handle exports)

### Tenant Module Reports
- Sales: revenue by period, top customers, aging receivables, partial
  payment tracking, subscription MRR, customer credit balances summary,
  total credited vs used vs refunded, pending excess decisions
  — Bar + Line + Table — CSV/PDF/XLSX
- Purchasing: PO volume, vendor spend, landed vs raw cost
  — Bar + Table — CSV/XLSX
- Inventory: stock valuation, movement history, low-stock, vendor
  purchase history — Table — CSV/XLSX
- Projects: profitability, time vs budget, milestone completion,
  expenses — Bar + Table — CSV/PDF/XLSX
- Budget: allocation per user, spend by category, balances
  — Table — CSV/XLSX
- Banking: fund source ledger, credit card transaction + settlement
  history, cash flow — Table + Line — CSV/XLSX
- POS: daily sales, cash reconciliation, top products
  — Bar + Table — CSV/PDF/XLSX
- Accounting: P&L, Balance Sheet, Cash Flow, Trial Balance, Tax Summary
  — Table — PDF/XLSX
- HR: attendance (with Leaflet map on web), leave balance, payroll
  cost, cash advance recovery — Table — CSV/XLSX
- Support: ticket volume, resolution time, open by priority
  — Bar + Table — CSV

## Mobile App
- Platform: iOS + Android
- Framework: Expo managed workflow
- Distribution: internal/enterprise only — APK (Android) and IPA (iOS)
  via MDM or direct install link; NOT App Store or Play Store
- Offline-first: yes
  - DTR clock-in/out: fully offline; native device GPS (no internet
    needed); stored in WatermelonDB; auto-synced on reconnect
  - Task viewing and status updates: offline; synced on reconnect;
    server version wins on conflict
  - Payslip and leave balance: last-fetched cached; readable offline
    with "showing cached data" notice
  - Expense submission: form offline; receipt photo stored locally;
    uploaded and submitted on reconnect
  - All other features require internet connection
- Push notifications: yes — Expo Push Notifications (FCM + APNs)
  - Task assigned to user
  - Task status updated (notifies creator)
  - Attendance record approved or rejected
  - Leave request approved or rejected
  - Expense approved or rejected
  - Payroll released
  - Low-stock alert (admin + inventory_staff)
  - Cost change alert (admin)
  - Customer credit balance changed (sales_staff + accountant)
  - Excess payment decision required (sales_staff)
- Native features:
  - GPS: native device GPS for DTR clock-in/out; works offline
  - Camera: expense receipt photo capture
  - Biometrics: optional Face ID / Fingerprint for app unlock only
    (not for authentication — Auth.js session handles auth)
- Deep linking: yes
  - Task notification → task detail screen
  - Attendance notification → attendance record screen
  - Expense notification → expense record screen
  - Payroll notification → payslips screen
  - Credit alert → customer credit tab

## User-Facing URLs
Multi-tenant — subdirectory routing (path-based, NOT subdomain-based)

Public (no login):
  https://erp.powerbyte.app                    (landing + signup)
  https://erp.powerbyte.app/login

Platform owner:
  https://erp.powerbyte.app/powerbyte-admin/*

Per-tenant web ERP:
  https://erp.powerbyte.app/<slug>/erp/dashboard
  https://erp.powerbyte.app/<slug>/erp/crm/*
  https://erp.powerbyte.app/<slug>/erp/purchasing/*
  https://erp.powerbyte.app/<slug>/erp/inventory/*
  https://erp.powerbyte.app/<slug>/erp/projects/*
  https://erp.powerbyte.app/<slug>/erp/hr/*
  https://erp.powerbyte.app/<slug>/erp/banking/*
  https://erp.powerbyte.app/<slug>/erp/accounting/*
  https://erp.powerbyte.app/<slug>/erp/support/*
  https://erp.powerbyte.app/<slug>/erp/settings/*
  https://erp.powerbyte.app/<slug>/pos/*
  https://erp.powerbyte.app/<slug>/portal/*

Mobile API: https://erp.powerbyte.app/api/trpc/*
Stage:      https://staging.erp.powerbyte.app/<slug>/...
Dev:        http://localhost:3000 + :9001 (MinIO) + :8025 (MailHog)

## Access Control
Public (no login required):
  /                      (landing + pricing)
  /login
  /register              (new tenant signup)

Protected (login required):
  /powerbyte-admin/*     — platform_owner JWT only; any other role → 403
  /<slug>/erp/*          — valid tenant JWT; tenantSlug in JWT must
                           match slug in URL path; role checked per route
  /<slug>/pos/*          — cashier, admin, tenant_super_admin only
  /<slug>/portal/*       — customer role only; own records only
  /<slug>/erp/hr/*       — hr_manager, admin, tenant_super_admin
  /<slug>/erp/banking/*  — accountant, hr_manager, project_manager,
                           admin, tenant_super_admin
  /<slug>/erp/accounting/* — accountant, admin, tenant_super_admin
  /<slug>/erp/settings/* — admin, tenant_super_admin
  /<slug>/erp/crm/customers/*/credit — sales_staff, accountant,
                           admin, tenant_super_admin

Mobile: same JWT in Authorization header; tenantSlug scopes all calls;
roles with mobile access: staff, project_manager, hr_manager, admin,
tenant_super_admin; suspended tenant → 403 + suspension screen

Session rules:
  - Tenant session valid only for own /<slug>/* path
  - Cross-tenant path with valid session → 403
  - Suspended tenant → suspension screen on all routes + mobile API
  - platform_owner → /powerbyte-admin/* only; tenant paths → 403

## Data Sensitivity
Personal data stored:
  - Customer: name, email, phone, address, credit limit, credit balance
  - Employee: name, email, position, salary, hire date, employment type
  - User: name, email, hashed password
  - AttendanceRecord: GPS coordinates (lat/lng) at clock-in/out
  - Payslip: salary, deductions, additions, net pay
  - CashAdvance: amount, purpose
  - CustomerCreditTransaction: payment amounts, excess decisions

Data classification:
  - GPS coordinates: sensitive — admin, hr_manager, project_manager
    only; never exposed to staff or customer roles
  - Salary/payroll data: highly sensitive — hr_manager, accountant,
    admin, tenant_super_admin only
  - Customer credit data (creditLimit, creditBalance,
    CustomerCreditTransactions): sensitive — sales_staff, accountant,
    admin, tenant_super_admin; customers see own balance only
  - Financial records: sensitive — role-restricted per module
  - Mobile device: no PII stored beyond cached session, payslip, leave
    data, and pending offline records; offline records deleted from
    device after successful sync

Retention policy:
  - Financial + credit records: 7 years minimum
  - Attendance/DTR records: 5 years
  - Support tickets: 3 years
  - Tenant schema: retained on deletion; manually dropped by
    platform_owner after retention period; never auto-dropped

Compliance:
  - GDPR-aware: customer data exportable and deletable per tenant
  - Audit log: all create/update/delete, login/logout, role changes,
    failed logins, credit limit changes, credit transactions
  - TenantAuditLog: all platform-level tenant management actions
  - Mobile offline data: encrypted via device keychain/secure enclave;
    wiped on logout or app uninstall

## Security Requirements
- RBAC: role-based access enforced on every tRPC procedure and API
  endpoint; JWT role checked on every request (L3 — always active)
- AuditLog: immutable record on every data mutation, login/logout,
  role change, failed login, credit limit change, credit transaction
  (L5 — always active)
- Query guardrails: Prisma middleware enforces schema-scoping on every
  DB query — schema boundary prevents any cross-tenant data access
  regardless of application bugs (L6 — always active)

Multi-tenant isolation (LOCKED — separate schema per tenant):
  NOTE: This project uses separate PostgreSQL schema per tenant instead
  of the v10 default (shared schema + RLS). This means:
  - L2 = schema-boundary isolation, NOT PostgreSQL RLS policies
  - No tenantId column on any ERP entity — schema IS the boundary
  - Prisma middleware switches search_path atomically per request
  - A bug in application code cannot leak data between tenants
  - Migrations run sequentially per active tenant schema
  - Appropriate for payroll, banking, GPS data sensitivity
  - This decision is permanently LOCKED in DECISIONS_LOG

- Tenant context: tenantSlug extracted from JWT; validated against URL
  path on every web request; in Authorization header on every mobile
  request; Prisma switches search_path atomically per request (L1)
- Connection pool limits: PgBouncer per-tenant connection limits prevent
  noisy tenants from exhausting the pool (L4)
- Schema naming: t_<slug_underscored> — no reserved word conflicts

Rate limiting:
  - Auth endpoints (login, register, signup): 10 req/min per IP
  - tRPC API: 120 req/min per tenant (tenantSlug + userId)
  - File uploads: 20 req/min per user
  - Tenant signup: 5 req/min per IP
  - Mobile sync endpoint: 60 req/min per user

Additional:
  - CSRF: SameSite=Strict cookies (web); JWT in Authorization header
    (mobile — CSRF not applicable)
  - CORS: dev http://localhost:3000; stage https://staging.erp.powerbyte.app;
    prod https://erp.powerbyte.app
  - All PII and financial data encrypted at rest
  - Passwords hashed via bcrypt (Auth.js default)
  - Mobile offline data encrypted via device keychain/secure enclave
  - Suspended tenant: all web sessions and mobile JWTs invalidated
    immediately on suspension

## Tenancy Model
multi — subdirectory routing
erp.powerbyte.app/<tenant_slug>/erp — NOT subdomain-based

Isolation strategy: separate PostgreSQL schema per tenant (LOCKED)
  - Schema t_<slug_underscored> provisioned automatically on signup
  - Schema IS the data boundary — no tenantId column on ERP entities
  - Migration runner iterates all active schemas sequentially
  - Failed migrations per tenant logged and retried independently
  - Noisy neighbor protection: separate table statistics per schema
  - Schema retained on deletion; manually dropped after retention

Shared global data (public schema — outside tenant boundaries): yes
  Tenant, Plan, TenantSubscription, TenantInvoice, TenantPayment,
  TenantAuditLog, platform_owner user record
  Accessible only to platform_owner and automated billing jobs.

Roles: tenant-scoped — each tenant's users and roles live inside their
own schema; zero cross-tenant role inheritance or data visibility

## Environments Needed
dev / stage / prod

## Domain / Base URL Expectations
Dev:   http://localhost:3000
Stage: https://staging.erp.powerbyte.app
Prod:  https://erp.powerbyte.app

## Infrastructure Notes
Docker Compose services (dev + stage): postgres + pgbouncer, valkey,
minio, mailhog (dev only), web (Next.js port 3000), worker (BullMQ
single shared worker — tenantSlug in every job payload; Prisma switches
schema per job execution).

Production (managed external services):
  - PostgreSQL  → Railway or Supabase (managed)
  - Valkey      → Upstash (managed, eliminates ops overhead)
  - Storage     → Cloudflare R2 (S3-compatible, zero egress fees)
  - Email       → Resend (React Email compatible, 3k/day free)
  - Push        → Expo Push Notifications (FCM + APNs)
  - Hosting     → Railway, Render, or VPS + Docker Compose
  - K8s         → disabled by default; placeholder only

Non-OSS services accepted (all have OSS self-hosted alternatives):
  - Cloudflare R2 → OSS alt: self-hosted MinIO in prod
  - Upstash       → OSS alt: self-hosted Valkey on VPS
  - Railway/Render → OSS alt: Docker Compose on VPS (already in place)
  - Resend        → OSS alt: Postal
  - Expo Push     → no OSS equivalent for cross-platform push

## Tech Stack Preferences
Frontend framework:        Next.js (single unified app — all routes in
                           one app; no nginx; no separate deployables)
API style:                 tRPC
ORM / DB layer:            Prisma (schema-switching middleware;
                           search_path switched atomically per request)
Auth provider:             Auth.js (NextAuth v5) — tenant-scoped JWT;
                           platform_owner in global schema;
                           JWT tenant: { userId, tenantSlug, role,
                           isEmployee }
                           JWT platform: { userId,
                           role: "platform_owner", tenantSlug: null }
Primary database:          PostgreSQL (multi-schema, shared DB instance,
                           PgBouncer for connection pooling)
Cache / queue:             Valkey + BullMQ (single shared worker;
                           tenantSlug in every job payload)
File storage:              MinIO dev (port 9001) / Cloudflare R2 prod
Email dev:                 MailHog (port 8025)
Email prod:                Resend
UI component library:      shadcn/ui + Tailwind CSS
Mobile framework:          Expo managed workflow
Mobile UI library:         React Native Reusables + NativeWind
Mobile offline storage:    WatermelonDB
Mobile push:               Expo Push Notifications (FCM + APNs)
PDF generation:            React-PDF (lighter Docker, pure TypeScript,
                           no headless browser)
Maps (web):                Leaflet.js + OpenStreetMap (free, no API key)
Maps (mobile):             React Native Maps + OpenStreetMap tiles
Exports:                   CSV native / React-PDF / SheetJS (XLSX)

## DECISIONS_LOG
- Tenant isolation: separate PostgreSQL schema per tenant — LOCKED.
  Schema boundary at DB level. No tenantId column. Schema IS the
  boundary. Appropriate for payroll, banking, GPS data. Migration
  complexity handled by V10 tooling.
- Navigation menus: hardcoded per role, filtered at render time from
  JWT — no DB-driven nav customization.
- BullMQ queues: one queue per job type (17 named queues) — simpler
  DLQ isolation and replay targeting per job.
- Worker placement: Option C — packages/jobs for definitions + typed
  payloads; apps/worker for runtime worker process.
- URL routing: path-based subdirectory. No wildcard DNS. No per-tenant
  SSL. Instant tenant creation.
- Tenant schema deletion: never auto-dropped. Manually by platform_owner
  after retention period.
- Credit card payments: three modes. Oldest-first default; configurable.
- Cash advance recovery: manual per payroll run. No auto-deduction.
- Exports: CSV + PDF + XLSX.
- Maps: Leaflet.js + OpenStreetMap (web); React Native Maps +
  OpenStreetMap (mobile). Free, MIT, no API key.
- PDF: React-PDF over Puppeteer. ~400MB lighter Docker image.
- Email: Resend. Simple API, React Email compatible.
- Mobile: iOS + Android via Expo managed. Internal distribution only.
  Offline-first for DTR, tasks, expenses. WatermelonDB. Expo Push.
- Credit Manager: per-customer creditLimit (0=no facility,
  null=unlimited). Advance payments, excess decision (credit or refund —
  staff decides), credit applied to invoices, manual refunds.
  CustomerCreditAccount = immutable ledger header.
  CustomerCreditTransaction = immutable ledger lines.
  creditBalance can never go negative. Credit data visible in customer
  portal (balance only). All credit transactions post Journal Entries.
- Non-OSS accepted: Cloudflare R2, Upstash, Railway/Render, Resend,
  Expo Push. OSS alternatives documented per service above.
