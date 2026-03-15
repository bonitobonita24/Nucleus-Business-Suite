# Phase 4 — Full Monorepo Scaffold (Auto-run Task)

## Trigger
This task file is read by Cline when the user says "Start Phase 4".

## Instructions for Cline
1. Read all 9 context docs (in order specified in .clinerules)
2. Read inputs.yml — derive ALL scaffold decisions from it
3. Run all 8 Parts sequentially without stopping
4. Do NOT ask for "next" prompts between parts
5. Do NOT ask clarifying questions about inputs.yml choices (they are locked)
6. After Part 8: automatically run Phase 5 validation
7. Fix all validation errors before declaring Phase 4 complete

## Parts to Run
- Part 1: Root config files (pnpm-workspace.yaml, turbo.json, tsconfig.base.json, etc.)
- Part 2: packages/shared + packages/api-client
- Part 3: packages/db (full ORM schema, migrations, seed, audit.ts, tenant-guard.ts)
- Part 4: packages/ui + packages/jobs (if enabled) + packages/storage (if enabled)
- Part 5: apps/[web app] — Next.js full scaffold
- Part 6: apps/[mobile app] — Expo full scaffold (SKIP if no mobile in inputs.yml)
- Part 7: tools/ + deploy/compose/ + K8s scaffold + .socraticodecontextartifacts.json
- Part 8: CI + governance docs + MANIFEST.txt + SocratiCode initial index

## Completion Criteria
- All 8 parts written to filesystem
- Phase 5 validation: all 8 commands green
- MANIFEST.txt lists every generated file
- docs/IMPLEMENTATION_MAP.md rewritten to reflect current state
- docs/CHANGELOG_AI.md updated with Agent: CLINE
- .cline/memory/agent-log.md updated
- SocratiCode index triggered (if Docker running)

## IMPORTANT
- TypeScript strict everywhere — no any types
- No .js files in src/ directories
- Mobile apps NEVER import from packages/db/ — API only
- .devcontainer is FROZEN — do not modify it
- Derive everything from inputs.yml — never hardcode values
