// ─────────────────────────────────────────────────────────────────────────────
// Database Seed
// Seeds the global (public) schema with:
//   - Plans (Starter, Growth, Pro, Enterprise)
// Tenant schema seeding is done by the tenant-provisioning job:
//   - Roles (read-only reference table)
//   - Default Chart of Accounts
//   - Default Tax Rates
//   - Default Warehouse
// ─────────────────────────────────────────────────────────────────────────────

import { db } from "./client.js";
import { withTenantSchema } from "./tenant-guard.js";

async function seedGlobalPlans(): Promise<void> {
  console.log("🌱 Seeding global plans...");

  const plans = [
    {
      name: "Starter" as const,
      monthlyPrice: 29,
      annualPrice: 290,
      features: ["Up to 5 users", "Basic ERP", "POS Terminal", "Customer Portal"],
      maxUsers: 5,
      maxStorageGB: 5,
      isActive: true,
    },
    {
      name: "Growth" as const,
      monthlyPrice: 79,
      annualPrice: 790,
      features: [
        "Up to 20 users",
        "Full ERP",
        "POS Terminal",
        "Customer Portal",
        "Mobile App",
        "Projects",
        "HR & Payroll",
      ],
      maxUsers: 20,
      maxStorageGB: 20,
      isActive: true,
    },
    {
      name: "Pro" as const,
      monthlyPrice: 149,
      annualPrice: 1490,
      features: [
        "Up to 50 users",
        "Full ERP",
        "POS Terminal",
        "Customer Portal",
        "Mobile App",
        "Projects",
        "HR & Payroll",
        "Advanced Reporting",
        "API Access",
      ],
      maxUsers: 50,
      maxStorageGB: 50,
      isActive: true,
    },
    {
      name: "Enterprise" as const,
      monthlyPrice: 299,
      annualPrice: 2990,
      features: [
        "Unlimited users",
        "Full ERP",
        "POS Terminal",
        "Customer Portal",
        "Mobile App",
        "Projects",
        "HR & Payroll",
        "Advanced Reporting",
        "API Access",
        "Priority Support",
        "Custom Integrations",
      ],
      maxUsers: 9999,
      maxStorageGB: 200,
      isActive: true,
    },
  ];

  for (const plan of plans) {
    await db.globalPlan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    });
  }

  console.log(`✅ Seeded ${plans.length} plans`);
}

/**
 * Seed a new tenant schema with default reference data.
 * Called by the tenant-provisioning BullMQ job after schema creation.
 */
export async function seedTenantSchema(tenantSlug: string): Promise<void> {
  console.log(`🌱 Seeding tenant schema for: ${tenantSlug}`);

  await withTenantSchema(db, tenantSlug, async (tx) => {
    // ─── Seed Roles (read-only reference table — D009) ─────────────────────
    const roles = [
      { name: "tenant_super_admin", permissions: ["*"] },
      {
        name: "admin",
        permissions: [
          "crm:*", "purchasing:*", "inventory:*", "projects:*",
          "tasks:*", "dtr:*", "budget:*", "banking:*", "hr:*",
          "payroll:*", "pos:*", "accounting:*", "support:*", "settings:*",
        ],
      },
      {
        name: "accountant",
        permissions: [
          "accounting:*", "banking:*", "invoices:*", "payments:*",
          "expenses:*", "payroll:*", "budget:allocate",
          "crm:read", "purchasing:read", "inventory:read",
          "projects:read", "hr:read",
        ],
      },
      {
        name: "hr_manager",
        permissions: [
          "hr:*", "dtr:*", "payroll:*", "banking:read",
          "users:create_staff",
        ],
      },
      {
        name: "project_manager",
        permissions: [
          "projects:*", "tasks:*", "timeLogs:*", "milestones:*",
          "projectExpenses:*", "banking:read", "dtr:approve_site",
          "invoices:create",
        ],
      },
      {
        name: "budget_holder",
        permissions: ["expenses:create_own", "budget:view_own"],
      },
      {
        name: "sales_staff",
        permissions: [
          "crm:*", "invoices:*", "proposals:*", "subscriptions:*",
          "payments:*", "credit:*",
        ],
      },
      {
        name: "purchasing_staff",
        permissions: [
          "purchasing:*", "vendors:*", "expenses:*",
          "inventory:read",
        ],
      },
      {
        name: "inventory_staff",
        permissions: [
          "inventory:*", "warehouses:*",
          "purchasing:read",
        ],
      },
      {
        name: "staff",
        permissions: ["tasks:view_own", "dtr:clock_in_out", "todos:*"],
      },
      {
        name: "cashier",
        permissions: ["pos:*", "tasks:view_own"],
      },
      {
        name: "support_agent",
        permissions: [
          "tickets:*", "customers:read", "projects:read", "tasks:view_own",
        ],
      },
      {
        name: "customer",
        permissions: [
          "portal:invoices:view_own", "portal:proposals:view_own",
          "portal:projects:view_own", "portal:tickets:*",
          "portal:credit:view_balance",
        ],
      },
    ];

    for (const role of roles) {
      await tx.role.upsert({
        where: { name: role.name },
        update: { permissions: role.permissions },
        create: role,
      });
    }

    // ─── Seed Default Chart of Accounts ─────────────────────────────────────
    const accounts = [
      // Assets
      { code: "1000", name: "Cash on Hand", type: "asset" as const },
      { code: "1010", name: "Bank Account", type: "asset" as const },
      { code: "1020", name: "E-Wallet", type: "asset" as const },
      { code: "1100", name: "Accounts Receivable", type: "asset" as const },
      { code: "1200", name: "Inventory", type: "asset" as const },
      { code: "1300", name: "Prepaid Expenses", type: "asset" as const },
      // Liabilities
      { code: "2000", name: "Accounts Payable", type: "liability" as const },
      { code: "2100", name: "Credit Card Payable", type: "liability" as const },
      { code: "2200", name: "Customer Deposits", type: "liability" as const },
      { code: "2300", name: "Tax Payable", type: "liability" as const },
      // Equity
      { code: "3000", name: "Owner's Equity", type: "equity" as const },
      { code: "3100", name: "Retained Earnings", type: "equity" as const },
      // Income
      { code: "4000", name: "Sales Revenue", type: "income" as const },
      { code: "4100", name: "Service Revenue", type: "income" as const },
      { code: "4200", name: "Other Income", type: "income" as const },
      // Expenses
      { code: "5000", name: "Cost of Goods Sold", type: "expense" as const },
      { code: "5100", name: "Salaries and Wages", type: "expense" as const },
      { code: "5200", name: "Rent Expense", type: "expense" as const },
      { code: "5300", name: "Utilities Expense", type: "expense" as const },
      { code: "5400", name: "Supplies Expense", type: "expense" as const },
      { code: "5500", name: "Depreciation Expense", type: "expense" as const },
      { code: "5600", name: "General and Administrative", type: "expense" as const },
    ];

    for (const account of accounts) {
      await tx.account.upsert({
        where: { code: account.code },
        update: { name: account.name, type: account.type },
        create: account,
      });
    }

    // ─── Seed Default Tax Rate ───────────────────────────────────────────────
    await tx.taxRate.upsert({
      where: { id: "default-tax-0" },
      update: {},
      create: {
        id: "default-tax-0",
        name: "No Tax",
        percentage: 0,
        isDefault: true,
      },
    });

    // ─── Seed Default Warehouse ──────────────────────────────────────────────
    await tx.warehouse.upsert({
      where: { id: "default-warehouse" },
      update: {},
      create: {
        id: "default-warehouse",
        name: "Main Warehouse",
        location: null,
        isDefault: true,
      },
    });

    console.log(`✅ Tenant schema seeded: ${tenantSlug}`);
  });
}

async function main(): Promise<void> {
  try {
    await seedGlobalPlans();
    console.log("✅ Global seed complete");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

await main();
