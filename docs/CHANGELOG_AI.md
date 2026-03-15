# CHANGELOG_AI.md — Agent Change Log
# Every change must be logged here with agent attribution (Rule 15).
# Humans never edit this file directly — agents append entries only.
#
# FORMAT (Rule 15):
# ## YYYY-MM-DD — [Phase or Feature Name]
# - Agent:               CLINE | CLAUDE_CODE | COPILOT | HUMAN
# - Why:                 reason for the change
# - Files added:         list or "none"
# - Files modified:      list or "none"
# - Files deleted:       list or "none"
# - Schema/migrations:   list or "none"
# - Errors encountered:  list or "none"
# - Errors resolved:     how each was fixed, or "none"

---

## 2026-03-15 — Phase 4 Completeness Audit + Gap Fixes
- Agent:               CLINE
- Why:                 Thorough audit of Phase 4 deliverables vs inputs.yml spec — found 4 missing items
- Files added:
    apps/web/postcss.config.mjs (required for Tailwind CSS — Next.js won't process CSS without it),
    apps/web/Dockerfile (multi-stage prod build: deps→builder→runner),
    apps/worker/Dockerfile (multi-stage prod build: deps→builder→runner),
    apps/mobile/package.json (Expo ~52 + expo-router + NativeWind + WatermelonDB deps),
    apps/mobile/tsconfig.json (standalone — module:ESNext, moduleResolution:bundler, jsx:react-native),
    apps/mobile/app.json (Expo config — iOS + Android, scheme:nucleus, GPS/Camera/Biometrics permissions),
    apps/mobile/app/_layout.tsx (Expo Router root Stack layout),
    apps/mobile/app/index.tsx (home screen),
    apps/mobile/src/index.ts (entry point comment block)
- Files modified:      docs/CHANGELOG_AI.md, docs/IMPLEMENTATION_MAP.md
- Files deleted:       none
- Schema/migrations:   none
- Errors encountered:  none — all 4 gaps were straightforward additions
- Errors resolved:     n/a

---

## 2026-03-15 — Phase 4+5: Full Monorepo Scaffold + Validation
- Agent:               CLINE
- Why:                 Phase 4 — scaffold all 8 parts of the monorepo from inputs.yml; Phase 5 — validate all checks green
- Files added:
    pnpm-workspace.yaml, turbo.json, tsconfig.base.json, .editorconfig, .prettierrc, .eslintrc.js,
    .env.example, packages/shared/package.json, packages/shared/tsconfig.json,
    packages/shared/src/{enums,jwt,index,types/global,types/tenant,schemas/global,schemas/tenant}.ts,
    packages/db/package.json, packages/db/tsconfig.json, packages/db/prisma/schema.prisma,
    packages/db/src/{client,tenant-guard,audit,seed,index}.ts,
    packages/api-client/package.json, packages/api-client/tsconfig.json,
    packages/api-client/src/{trpc,index}.ts,
    packages/jobs/package.json, packages/jobs/tsconfig.json,
    packages/jobs/src/{queues,payloads,index}.ts,
    packages/storage/package.json, packages/storage/tsconfig.json, packages/storage/src/index.ts,
    packages/ui/package.json, packages/ui/tsconfig.json,
    packages/ui/src/{index,utils}.ts,
    packages/ui/src/components/{button,badge,card,input,label}.tsx,
    apps/web/package.json, apps/web/tsconfig.json, apps/web/next.config.ts,
    apps/web/tailwind.config.ts, apps/web/src/styles/globals.css,
    apps/web/src/app/{layout,page}.tsx, apps/web/src/app/login/page.tsx,
    apps/web/src/app/api/health/route.ts, apps/web/src/app/api/trpc/[trpc]/route.ts,
    apps/web/src/app/api/auth/[...nextauth]/route.ts,
    apps/web/src/server/{context,routers/_app,routers/auth,routers/tenant}.ts,
    apps/web/src/lib/auth.ts, apps/web/src/middleware.ts,
    apps/worker/package.json, apps/worker/tsconfig.json, apps/worker/src/index.ts,
    deploy/compose/docker-compose.db.yml, deploy/compose/docker-compose.app.yml,
    .github/workflows/ci.yml,
    tools/{validate-inputs,check-env,check-product-sync,hydration-lint}.mjs,
    .cline/memory/lessons.md (L001-L009)
- Files modified:
    package.json (added js-yaml, ajv devDeps),
    apps/web/package.json (added bcryptjs, tailwindcss-animate, @types/bcryptjs),
    packages/db/prisma/schema.prisma (added ProjectManager back-relation, GlobalPlan.name @unique),
    packages/jobs/src/queues.ts (added PAYROLL_REMINDER, fixed removeOnFail type),
    inputs.yml (fixed YAML flow collection bracket quoting, total_queues 17→18),
    inputs.schema.json (maxItems 17→18),
    apps/web/tsconfig.json (declaration:false, exactOptionalPropertyTypes:false),
    apps/web/src/lib/auth.ts (removed unused @prisma/client import, fixed session cast),
    apps/web/src/app/api/trpc/[trpc]/route.ts (fixed exactOptionalPropertyTypes onError spread)
- Files deleted:       none
- Schema/migrations:   packages/db/prisma/schema.prisma created (full ERP schema — 900+ lines, 40+ models)
- Errors encountered:
    L001 Prisma back-relation missing (ProjectManager),
    L002 GlobalPlan.name not @unique (seed.ts type error),
    L003 @nucleus/shared must be built before downstream typecheck,
    L004 next-auth inferred-type error with declaration:true,
    L005 exactOptionalPropertyTypes incompatible with next-auth v5 callbacks,
    L006 BullMQ removeOnFail:false wrong type,
    L007 inputs.yml YAML flow collection bracket quoting,
    L008 AJV v8 strict mode rejects unknown uri format,
    L009 QUEUE_NAMES/inputs.yml/schema.json queue count mismatch
- Errors resolved:     All 9 errors fixed — see .cline/memory/lessons.md L001-L009

---

## 2026-03-15 — Phase 3: Spec File Generation
- Agent:               CLAUDE_CODE
- Why:                 Generate inputs.yml (v3), inputs.schema.json, update devcontainer.json, and record all architectural decisions after Phase 2 discovery interview confirmed spec
- Files added:         inputs.yml, inputs.schema.json
- Files modified:      .devcontainer/devcontainer.json ({{APP_NAME}} replaced — FROZEN), docs/DECISIONS_LOG.md (D004–D019 added), docs/CHANGELOG_AI.md
- Files deleted:       none
- Schema/migrations:   none
- Errors encountered:  none
- Errors resolved:     none
- Phase 2 answers locked:
    Q1 Realtime: SSE (web) + React Query polling (mobile)
    Q2 Roles: single role per user; Role entity = read-only reference table
    Q3 isEmployee: gates Employee record AND mobile app access; always in sync

---

## 2026-03-15 — Phase 0 Bootstrap
- Agent:               CLINE
- Why:                 Initial project bootstrap — created all scaffold files for Spec-Driven Platform V10
- Files added:         .clinerules, .cline/tasks/phase4-autorun.md, .cline/memory/lessons.md,
                       .cline/memory/agent-log.md, .claude/settings.json, .gitignore, .nvmrc,
                       package.json, .devcontainer/devcontainer.json, .devcontainer/Dockerfile,
                       .vscode/mcp.json, docs/PRODUCT.md, docs/CHANGELOG_AI.md,
                       docs/DECISIONS_LOG.md, docs/IMPLEMENTATION_MAP.md, project.memory.md,
                       CLAUDE.md, .specstory/specs/v10-master-prompt.md
- Files modified:      none
- Files deleted:       none
- Schema/migrations:   none
- Errors encountered:  none
- Errors resolved:     none
