# Cline Lessons — Nucleus Business Suite

## Phase 4 / Phase 5 Lessons (2026-03-15)

### L001 — Prisma: Back-relations must be explicit
- **Error**: `The relation field 'manager' on model 'Project' is missing an opposite relation field on model 'User'`
- **Fix**: Added `managedProjects Project[] @relation("ProjectManager")` to User model AND named the forward relation `@relation("ProjectManager", ...)`
- **Rule**: Every Prisma relation must have a named back-relation on both sides

### L002 — GlobalPlan.name must be @unique for seed upsert
- **Error**: `Type '{ name: ... }' is not assignable to GlobalPlanWhereUniqueInput` in seed.ts
- **Fix**: Added `@unique` to `GlobalPlan.name` in schema, re-ran `prisma generate`
- **Rule**: Any field used in `where:` clause of `upsert`/`findUnique` must be `@unique`

### L003 — Workspace packages need to be built before typecheck dependents
- **Error**: `Cannot find module '@nucleus/shared'` in api-client typecheck
- **Fix**: Run `pnpm --filter @nucleus/shared run build` first, then typecheck downstream
- **Rule**: In a monorepo with compiled packages, always build `shared` → `db` → `jobs/storage/api-client` → apps in order

### L004 — apps/web tsconfig must override declaration:false
- **Error**: `The inferred type of 'signIn'/'auth' cannot be named without a reference to internal next-auth paths`
- **Fix**: Added `"declaration": false, "declarationMap": false` to `apps/web/tsconfig.json`
- **Rule**: Next.js apps should never emit declaration files; override `declaration: false` to avoid next-auth type resolution issues

### L005 — apps/web tsconfig must override exactOptionalPropertyTypes:false
- **Error**: `session.user as Record<string, unknown>` type mismatch with exactOptionalPropertyTypes
- **Fix**: Added `"exactOptionalPropertyTypes": false` to `apps/web/tsconfig.json`
- **Rule**: next-auth v5 beta callbacks are not compatible with `exactOptionalPropertyTypes: true`

### L006 — BullMQ removeOnFail must be KeepJobs type, not boolean
- **Error**: `Type 'false' is not assignable to type 'KeepJobs | undefined'`
- **Fix**: Changed `removeOnFail: false` to `removeOnFail: { count: 1000 }`
- **Rule**: BullMQ v5 uses `KeepJobs = { count?: number; age?: number }` type for `removeOnComplete`/`removeOnFail`

### L007 — inputs.yml: square bracket notation in YAML flow collections
- **Error**: `YAMLException: missed comma between flow collection entries` on `fields: [id, permissions[]]`
- **Fix**: Quote any item with brackets: `"permissions[]"` 
- **Rule**: YAML flow collections (`[...]`) treat unquoted `[]` as nested collections — always quote array-type field names

### L008 — AJV v8 requires strict:false for JSON Schema format keywords
- **Error**: `unknown format "uri" ignored in schema` — throws by default in AJV v8
- **Fix**: Initialize AJV with `{ strict: false }` to treat unknown formats as warnings not errors
- **Rule**: AJV v8 strict mode throws on unknown format keywords; use `{ strict: false }` or add `ajv-formats`

### L009 — QUEUE_NAMES must stay in sync with inputs.yml queues list
- **Error**: `inputs.yml validation failed: /jobs/queues: must NOT have more than 17 items`
- **Fix**: Added `PAYROLL_REMINDER` to QUEUE_NAMES; updated schema maxItems from 17→18
- **Rule**: Any change to queue definitions must be reflected in all three places: QUEUE_NAMES, inputs.yml, inputs.schema.json
