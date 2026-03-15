# DECISIONS_LOG.md — Locked Architectural Decisions
# Every architectural decision is recorded here with rationale.
# Agents never change a locked decision without explicit user confirmation.
# Humans never edit this file — agents write entries when decisions are made.
#
# FORMAT:
# ## [Decision ID] — [Decision Title]
# - Date:       YYYY-MM-DD
# - Agent:      CLINE | CLAUDE_CODE | COPILOT | HUMAN
# - Status:     LOCKED | PROPOSED | SUPERSEDED
# - Decision:   What was decided
# - Rationale:  Why this was chosen over alternatives
# - Alternatives considered: list
# - Impact:     What this affects
# - Supersedes: [Decision ID] or "none"

---

## D001 — Spec-Driven Platform V10 Adopted
- Date:       2026-03-15
- Agent:      CLINE
- Status:     LOCKED
- Decision:   Use Spec-Driven Platform V10 as the governing methodology for this project
- Rationale:  Provides structured, agent-driven development with full governance traceability
- Alternatives considered: ad-hoc development, V9 platform
- Impact:     All phases, all files, all agents follow V10 rules
- Supersedes: none

## D002 — PRODUCT.md as Sole Human Interface
- Date:       2026-03-15
- Agent:      CLINE
- Status:     LOCKED
- Decision:   docs/PRODUCT.md is the only file humans ever edit directly
- Rationale:  Prevents drift between spec and implementation; all changes flow through governance
- Alternatives considered: direct code editing, separate spec documents
- Impact:     All feature requests must start with PRODUCT.md edits
- Supersedes: none

## D003 — TypeScript Strict Mode Everywhere
- Date:       2026-03-15
- Agent:      CLINE
- Status:     LOCKED
- Decision:   TypeScript strict mode in every tsconfig; no `any` types; no .js files in src/
- Rationale:  Type safety prevents entire categories of runtime errors; enforces quality
- Alternatives considered: JavaScript, TypeScript lenient mode
- Impact:     All source files in apps/ and packages/ must be .ts or .tsx
- Supersedes: none

---

## D004 — Tenant Isolation: Separate PostgreSQL Schema Per Tenant
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Each tenant gets its own PostgreSQL schema (t_<slug_underscored>). No tenantId column on any ERP entity. Schema IS the data boundary. Prisma middleware sets search_path atomically per request from JWT tenantSlug.
- Rationale:  Physical isolation appropriate for payroll, banking, GPS data sensitivity. A bug in application code cannot leak data between tenants. Separate table statistics per schema prevent noisy-neighbor performance issues.
- Alternatives considered: shared schema + RLS (V10 default), separate database per tenant
- Impact:     All ERP entities in tenant schema have no tenantId column. Migrations run per tenant schema sequentially. Global entities (Tenant, Plan, etc.) live in public schema only. L2 is schema-boundary isolation, NOT PostgreSQL RLS.
- Supersedes: none

## D005 — Multi-App Architecture: One Unified Next.js App
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   All four web surfaces (ERP, POS, Portal, Admin) are one Next.js app on port 3000. Next.js route groups handle all routing internally. No nginx, no separate deployables.
- Rationale:  Simplifies deployment, shared components, shared auth session, no inter-service HTTP. Route groups (erp), (pos), (portal), (admin) give clean code separation without separate processes.
- Alternatives considered: separate Next.js app per surface, microservices, nginx reverse proxy
- Impact:     Single Docker service for the web app. All routes handled by one Next.js middleware.
- Supersedes: none

## D006 — Worker Placement: packages/jobs + apps/worker
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   packages/jobs holds typed BullMQ queue definitions and job payload types. apps/worker is the runtime worker process that imports from packages/jobs and executes all 17 queues.
- Rationale:  Clean separation of typed contracts (packages/jobs, importable by any app for enqueueing) from the runtime worker. Prevents circular dependencies. Single shared worker process handles all queues.
- Alternatives considered: jobs inline in web app, separate worker per queue, all in apps/worker
- Impact:     17 named queues. tenantSlug in every job payload. Prisma switches search_path per job execution.
- Supersedes: none

## D007 — URL Routing: Path-Based Subdirectory (Not Subdomain)
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Tenant routing uses path prefix: erp.powerbyte.app/<slug>/erp. No wildcard DNS. No per-tenant SSL certificates. Tenant slug extracted from URL path and validated against JWT on every request.
- Rationale:  Instant tenant creation (no DNS propagation wait), no wildcard SSL complexity, simpler deployment. Single cert for erp.powerbyte.app covers all tenants.
- Alternatives considered: subdomain routing (tenant.erp.powerbyte.app), custom domains per tenant
- Impact:     Next.js middleware extracts :slug from path. JWT tenantSlug must match URL :slug — mismatch → 403.
- Supersedes: none

## D008 — Auth: Auth.js v5 (NextAuth) with JWT Strategy
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Auth.js v5 with JWT session strategy. Tenant JWT: { userId, tenantSlug, role, isEmployee }. Platform JWT: { userId, role: "platform_owner", tenantSlug: null }. Single role per user — no multi-role.
- Rationale:  OSS (MIT), NextAuth v5 is App Router native, JWT avoids DB session lookups on every request, single role keeps auth logic simple and auditable.
- Alternatives considered: Clerk (proprietary fees), Keycloak (heavy ops), custom JWT
- Impact:     All tRPC context built from JWT. isEmployee field gates Employee record + mobile app access. Suspended tenant invalidates all JWTs immediately.
- Supersedes: none

## D009 — Roles: Single Role Per User, TypeScript Enum Enforcement
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Strictly one role per user. RBAC enforced via TypeScript enum in code (requireRole middleware). Role DB entity is a read-only reference table seeded at migration — tenants cannot define custom roles or edit permissions.
- Rationale:  Single role eliminates permission matrix complexity and ambiguity. Code-enforced RBAC is auditable and testable. Tenants don't need custom roles for this use case.
- Alternatives considered: multi-role per user, DB-driven permissions, role hierarchy
- Impact:     Role entity seeded at migration; read-only thereafter. JWT role is a single string. RBAC middleware checks role enum on every tRPC procedure.
- Supersedes: none

## D010 — isEmployee Flag: Links User to Employee Record + Mobile Access
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   isEmployee: true on a User means (1) user has a linked Employee record in the HR module AND (2) user is permitted to use the mobile app. Both conditions are always in sync — toggling isEmployee = true atomically creates/links the Employee record.
- Rationale:  Prevents divergent state where mobile access is granted but no payroll record exists (or vice versa). Roles with mobile access (staff, project_manager, hr_manager, admin, tenant_super_admin) always have isEmployee = true.
- Alternatives considered: separate mobile_access flag, role-only gating
- Impact:     Employee creation is atomic with isEmployee toggle. support_agent and customer default to isEmployee: false.
- Supersedes: none

## D011 — Realtime: SSE for Web, React Query Polling for Mobile
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Web real-time features use Server-Sent Events (SSE) via Next.js route handlers. Mobile uses tRPC + React Query refetchInterval polling per screen. No WebSocket server. No third-party managed WebSocket service.
- Rationale:  SSE fits the single unified Next.js app — no extra infra, no separate WebSocket process. All 18 real-time web features are server-to-client push (SSE sufficient). Mobile polling avoids persistent connection complexity on mobile networks.
- Alternatives considered: WebSockets (Socket.io), Pusher/Ably, Supabase Realtime
- Impact:     SSE route handlers per feature in apps/web. React Query invalidation + refetchInterval on mobile screens.
- Supersedes: none

## D012 — PDF Generation: React-PDF (No Headless Browser)
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   React-PDF for all PDF generation (invoices, proposals, payslips, POs, goods receipts). No Puppeteer, no headless Chrome.
- Rationale:  ~400MB lighter Docker image. Pure TypeScript, no browser dependency, no Chrome sandbox complexity in containers. Sufficient for all document types needed.
- Alternatives considered: Puppeteer/headless Chrome, Playwright, wkhtmltopdf
- Impact:     PDF generation runs in the BullMQ worker process via pdf-generation queue.
- Supersedes: none

## D013 — Maps: Leaflet.js + OpenStreetMap (Web), React Native Maps (Mobile)
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Leaflet.js + OpenStreetMap tiles for web (HR attendance GPS visualization). React Native Maps + OpenStreetMap for mobile. No Google Maps API.
- Rationale:  Free, MIT/OSS, no API key required, no per-request billing. OpenStreetMap tiles are sufficient for GPS coordinate display and attendance visualization.
- Alternatives considered: Google Maps (billing per request), Mapbox (paid tier)
- Impact:     HR attendance report includes Leaflet map on web. Mobile DTR uses React Native Maps for location display.
- Supersedes: none

## D014 — Storage: Single Bucket, Tenant-Slug Path Prefix
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   One shared S3/R2 bucket. Tenant isolation via path prefix: <tenant_slug>/<category>/<entity>/<id>/<filename>. Dev: MinIO. Prod: Cloudflare R2 (zero egress fees).
- Rationale:  Single bucket is simpler to manage and provision. Path-based isolation sufficient when combined with schema-level access control. R2 chosen for zero egress cost in prod.
- Alternatives considered: per-tenant bucket (complex IAM), CDN delivery (out of scope)
- Impact:     Mobile uploads use pre-signed URLs. Offline uploads stored in WatermelonDB and uploaded on reconnect.
- Supersedes: none

## D015 — Email: MailHog (Dev) + Resend (Prod) with React Email
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   MailHog for local dev email capture. Resend for production email sending. React Email for templates.
- Rationale:  Resend has simple API, React Email compatible, 3k/day free tier. MailHog is standard local dev email trap. React Email allows typed email templates in TSX.
- Alternatives considered: SendGrid, Nodemailer, Postal (OSS), SES
- Impact:     notifications and tenant-billing jobs send via Resend in prod, MailHog in dev.
- Supersedes: none

## D016 — Credit Card Settlement: Three Payment Modes
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Three credit card settlement modes: per_transaction (settle one FundTransaction), bulk_statement (settle all in a period), partial (settle a portion). Default ordering: oldest-first (configurable).
- Rationale:  Matches real business patterns — some businesses pay per transaction, others pay monthly statements. Partial payment is needed for cash flow management.
- Alternatives considered: single settlement mode only
- Impact:     CreditCardPayment entity has paymentType, coveredTransactionIds, statementPeriodStart/End.
- Supersedes: none

## D017 — Cash Advance Recovery: Manual Per Payroll Run
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Cash advance recovery is manual — HR creates CashAdvanceRecovery per payroll run. No auto-deduction.
- Rationale:  Manual control allows HR to adjust recovery amounts based on employee circumstances. Prevents payroll errors from automatic deductions.
- Alternatives considered: auto-deduction on payroll release, fixed installment schedule
- Impact:     CashAdvanceRecovery entity linked to Payroll. HR manually decides deduction amount per period.
- Supersedes: none

## D018 — Mobile: Expo Managed Workflow, Internal Distribution Only
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   Expo managed workflow for iOS + Android. Distribution via APK (Android) and IPA (iOS) through MDM or direct install link. NOT submitted to App Store or Play Store.
- Rationale:  Internal enterprise tool — no app store review overhead, faster deployment, no public listing. MDM distribution standard for enterprise mobile apps.
- Alternatives considered: Expo bare workflow, React Native CLI, App Store distribution
- Impact:     No EAS Submit config for stores. eas.json configured for internal builds only. Biometrics for app unlock only — not for authentication.
- Supersedes: none

## D019 — BullMQ Queues: One Queue Per Job Type (17 Named Queues)
- Date:       2026-03-15
- Agent:      CLAUDE_CODE
- Status:     LOCKED
- Decision:   17 separate named BullMQ queues — one per job type. Each queue has its own DLQ. No shared catch-all queue.
- Rationale:  Simpler DLQ isolation and replay targeting per job type. Failed tenant-provisioning jobs don't block invoice-processing jobs. Platform owner can replay specific failed job types without affecting others.
- Alternatives considered: single queue with job type field, grouped queues by criticality
- Impact:     packages/jobs defines 17 typed queue clients. apps/worker registers 17 workers. DLQ replay UI in platform admin shows counts per queue name.
- Supersedes: none

---
<!-- Additional decisions are added here by agents during Phase 7 (feature updates) -->
