# IMPLEMENTATION_MAP.md — Current Implementation State
# This file is rewritten by agents after every Phase 4 and Phase 7.
# It reflects the exact current state of what is built vs what is pending.
# Humans never edit this file — agents maintain it.

---

## Project Status
- Phase: 5 — Monorepo Scaffold + Validation COMPLETE
- Last updated: 2026-03-15
- Agent: CLINE

---

## What Is Built

### Phase 0–3 — Bootstrap + Spec
- [x] Project folder structure
- [x] .clinerules (Cline automation rules)
- [x] .cline/tasks/phase4-autorun.md
- [x] .cline/memory/lessons.md (L001–L009 from Phase 4+5)
- [x] .cline/memory/agent-log.md
- [x] .claude/settings.json
- [x] .gitignore, .nvmrc (Node 20)
- [x] CLAUDE.md
- [x] docs/PRODUCT.md (human-written spec)
- [x] inputs.yml (v3 — agent-owned, derived from PRODUCT.md)
- [x] inputs.schema.json (JSON Schema — agent-owned)
- [x] .devcontainer/devcontainer.json (FROZEN after Phase 3)

### Phase 4 — Monorepo Scaffold

#### Root Config
- [x] pnpm-workspace.yaml (apps/*, packages/*)
- [x] turbo.json (build pipeline)
- [x] tsconfig.base.json (strict + noUncheckedIndexedAccess + exactOptionalPropertyTypes)
- [x] .editorconfig
- [x] .prettierrc
- [x] .eslintrc.js
- [x] .env.example
- [x] package.json (pnpm@9.12.0, turbo scripts, tool scripts, js-yaml+ajv devDeps)

#### packages/shared
- [x] package.json + tsconfig.json
- [x] src/enums.ts (TenantRole, PlatformRole, GlobalTenantStatus, etc.)
- [x] src/types/global.ts (GlobalTenant, GlobalPlan, GlobalInvoice, etc.)
- [x] src/types/tenant.ts (User, Employee, Customer, Invoice, Project, etc.)
- [x] src/schemas/global.ts (Zod schemas for global entities)
- [x] src/schemas/tenant.ts (Zod schemas for all tenant ERP entities)
- [x] src/jwt.ts (AppJwtPayload, TenantJwtPayload, PlatformJwtPayload)
- [x] src/index.ts (barrel export)
- [x] dist/ (built ✅)

#### packages/db
- [x] package.json + tsconfig.json
- [x] prisma/schema.prisma (full ERP schema — 40+ models, public + tenant schemas)
  - Global: GlobalTenant, GlobalPlan, GlobalTenantSubscription, GlobalTenantInvoice, GlobalTenantPayment, GlobalTenantAuditLog
  - Tenant: User, Employee, Department, Role, Customer, Proposal, Invoice, Payment, Subscription, Vendor, PurchaseOrder, Product, Category, Warehouse, Project, Milestone, TimeLog, Task, AttendanceRecord, BudgetAllocation, FundSource, Employee, Payroll, Payslip, CashAdvance, POSSession, POSSale, JournalEntry, Ticket, etc.
- [x] src/client.ts (PrismaClient singleton)
- [x] src/tenant-guard.ts (withTenantSchema — search_path switcher)
- [x] src/audit.ts (logAudit helper)
- [x] src/seed.ts (GlobalPlan seeder)
- [x] src/index.ts (barrel export)
- [x] dist/ (built ✅)

#### packages/api-client
- [x] package.json + tsconfig.json
- [x] src/trpc.ts (typed tRPC client + React Query hooks)
- [x] src/index.ts (barrel export)
- [x] dist/ (built ✅)

#### packages/jobs
- [x] package.json + tsconfig.json
- [x] src/queues.ts (QUEUE_NAMES — 18 queues, DEFAULT_JOB_OPTIONS, createQueue, createAllQueues)
- [x] src/payloads.ts (typed job payload interfaces for all 18 queues)
- [x] src/index.ts (barrel export)
- [x] dist/ (built ✅)

#### packages/storage
- [x] package.json + tsconfig.json
- [x] src/index.ts (MinIO/S3 wrapper — uploadFile, getFileUrl, deleteFile, listFiles)
- [x] dist/ (built ✅)

#### packages/ui
- [x] package.json + tsconfig.json
- [x] src/utils.ts (cn() — clsx + tailwind-merge)
- [x] src/components/button.tsx (shadcn/ui Button with variants)
- [x] src/components/badge.tsx (shadcn/ui Badge)
- [x] src/components/card.tsx (shadcn/ui Card + subcomponents)
- [x] src/components/input.tsx (shadcn/ui Input)
- [x] src/components/label.tsx (shadcn/ui Label via Radix)
- [x] src/index.ts (barrel export)
- [x] dist/ (built ✅)

#### apps/web
- [x] package.json + tsconfig.json (declaration:false, exactOptionalPropertyTypes:false)
- [x] next.config.ts (transpilePackages for all @nucleus/* workspace packages)
- [x] tailwind.config.ts (Tailwind v3 + dark mode + workspace content paths)
- [x] src/styles/globals.css (CSS variables for shadcn/ui theming)
- [x] src/app/layout.tsx (root layout with SessionProvider)
- [x] src/app/page.tsx (landing / redirect to login)
- [x] src/app/login/page.tsx (credentials login form with next-auth)
- [x] src/app/api/health/route.ts (GET /api/health → 200 JSON)
- [x] src/app/api/trpc/[trpc]/route.ts (tRPC fetch handler)
- [x] src/app/api/auth/[...nextauth]/route.ts (Auth.js v5 route)
- [x] src/server/context.ts (tRPC context — JWT auth)
- [x] src/server/routers/_app.ts (root tRPC router)
- [x] src/server/routers/auth.ts (login, me, logout procedures)
- [x] src/server/routers/tenant.ts (getTenantInfo procedure)
- [x] src/lib/auth.ts (NextAuth v5 config — Credentials, JWT callbacks)
- [x] src/middleware.ts (Next.js middleware — auth guard, tenant route matching)

#### apps/worker
- [x] package.json + tsconfig.json
- [x] src/index.ts (BullMQ worker — all 18 queues, graceful shutdown)

#### deploy/
- [x] deploy/compose/docker-compose.db.yml (postgres:16, redis:7, minio — nucleus-net)
- [x] deploy/compose/docker-compose.app.yml (web + worker — external nucleus-net)

#### tools/
- [x] tools/validate-inputs.mjs (AJV + js-yaml — validates inputs.yml against schema)
- [x] tools/check-env.mjs (required env var checker)
- [x] tools/check-product-sync.mjs (Rule 9 bidirectional governance check)
- [x] tools/hydration-lint.mjs (Next.js hydration anti-pattern scanner)

#### CI
- [x] .github/workflows/ci.yml (validate → typecheck → lint → build pipeline)

### Phase 5 — Validation Results
- [x] `prisma generate` ✅
- [x] `pnpm --filter @nucleus/shared run typecheck` ✅
- [x] `pnpm --filter @nucleus/db run typecheck` ✅
- [x] `pnpm --filter @nucleus/jobs run typecheck` ✅
- [x] `pnpm --filter @nucleus/storage run typecheck` ✅
- [x] `pnpm --filter @nucleus/api-client run typecheck` ✅
- [x] `pnpm --filter @nucleus/ui run typecheck` (via build) ✅
- [x] `pnpm --filter @nucleus/web run typecheck` ✅
- [x] `pnpm --filter @nucleus/worker run typecheck` ✅
- [x] `node tools/validate-inputs.mjs` ✅
- [x] `node tools/hydration-lint.mjs` ✅
- [x] `node tools/check-product-sync.mjs` ✅

---

## What Is Pending

### Phase 6 — Docker Services
- [ ] Start docker-compose.db.yml (postgres, redis, minio)
- [ ] Run `prisma migrate dev` (global schema)
- [ ] Run `prisma db seed` (plans + admin user)
- [ ] Start docker-compose.app.yml (web + worker)
- [ ] Visual QA: login page loads, /api/health returns 200, auth flow works

### Phase 7 — Feature Implementation (per PRODUCT.md modules)
- [ ] ERP modules: CRM, Purchasing, Inventory, Projects, HR, Payroll, POS, Accounting, Support
- [ ] Multi-tenant routing (/:slug/erp/*, /:slug/pos/*, /:slug/portal/*)
- [ ] Platform admin (/powerbyte-admin/*)
- [ ] Mobile app (Expo — apps/mobile)
- [ ] Tenant provisioning job handler
- [ ] All 18 job queue handlers

---

## Architecture Decisions
See docs/DECISIONS_LOG.md for full details.
- D001: Spec-Driven Platform V10 — LOCKED
- D002: PRODUCT.md as sole human interface — LOCKED
- D003: TypeScript strict everywhere — LOCKED
- D004: Schema-per-tenant isolation (no tenantId columns) — LOCKED
- D005: Next.js App Router (single app for all routes) — LOCKED
- D006: tRPC v11 + React Query v5 — LOCKED
- D007: Auth.js v5 (NextAuth) — JWT strategy — LOCKED
- D008: BullMQ + Valkey for job queues — LOCKED
- D009: MinIO/S3 for object storage — LOCKED
