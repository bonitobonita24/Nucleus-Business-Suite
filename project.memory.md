# project.memory.md — Project Memory (Agent-Owned)
# This file is maintained by agents. Humans never edit it.
# It contains the V10 rules summary, agent stack, and project state.
# Used for Session Resume with just 3 docs.

---

## Platform Version
Spec-Driven Platform V10

## Project Name
Nucleus Business Suite

## Project Status
Phase 0 — Bootstrap complete. Awaiting PRODUCT.md completion.

## Last Updated
2026-03-15 by CLINE (Phase 0 Bootstrap)

---

## V10 Active Rules Summary

| Rule | Description | Status |
|------|-------------|--------|
| Rule 1 | PRODUCT.md is sole source of truth | ACTIVE |
| Rule 2 | Agents own inputs.yml + inputs.schema.json | ACTIVE |
| Rule 3 | Log every change with agent attribution | ACTIVE |
| Rule 4 | Read all 9 context docs before any change | ACTIVE |
| Rule 5 | Docker Compose-first, AWS-ready | PENDING (Phase 4) |
| Rule 6 | K8s scaffold inactive by default | ACTIVE |
| Rule 7 | Multi-tenant DB strategy + security stack | PENDING (Phase 3) |
| Rule 8 | .devcontainer frozen after Phase 3 | ACTIVE — placeholder in place |
| Rule 9 | Bidirectional governance | ACTIVE |
| Rule 10 | Never infer missing information | ACTIVE |
| Rule 11 | Feature removal = full cleanup | ACTIVE |
| Rule 12 | TypeScript everywhere, always | ACTIVE |
| Rule 13 | Multi-app monorepo support | ACTIVE |
| Rule 14 | OSS-first stack by default | ACTIVE |
| Rule 15 | Agent attribution in every CHANGELOG entry | ACTIVE |
| Rule 16 | Visual QA after Phase 6 + major Phase 7 | ACTIVE |
| Rule 17 | Search before reading (SocratiCode) | ACTIVE — NEW V10 |

---

## Agent Stack (4 Agents)

### Claude Code
- Role: Planning only
- Use for: Phase 2 discovery interview, PRODUCT.md updates, Session Resume
- Auto-loads: CLAUDE.md every session
- Hand off to Cline after Phase 3

### Cline
- Role: Building everything (Phase 3 through Phase 8)
- Use for: Full monorepo scaffold, feature updates, Docker services, Visual QA
- Reads: .clinerules (auto-loads 9 governance docs)
- Self-heals errors (3 attempts then handoff file)
- No "next" prompts needed — fully automated

### Copilot + SpecStory
- Role: Inline autocomplete + fallback agent
- Always-on ghost text while typing
- Use for: PR reviews, handoff fallback when Cline is stuck
- Attach all 9 docs for Phase 7/8 context

### SocratiCode (NEW V10)
- Role: Codebase intelligence MCP server
- Provides: Hybrid semantic + keyword search, polyglot dependency graph
- Config: .vscode/mcp.json (already written)
- Requires: Docker running
- Benchmarked: 61% less context, 84% fewer tool calls, 37x faster than grep
- Rule 17: codebase_search BEFORE opening any file (mandatory)

---

## The 9 Governance Documents

| # | File | Owner | Purpose |
|---|------|-------|---------|
| 1 | docs/PRODUCT.md | HUMAN | Only file humans ever edit |
| 2 | inputs.yml | AGENT | Full app spec derived from PRODUCT.md |
| 3 | inputs.schema.json | AGENT | JSON Schema validation for inputs.yml |
| 4 | docs/CHANGELOG_AI.md | AGENT | Change log with agent attribution |
| 5 | docs/DECISIONS_LOG.md | AGENT | Locked architectural decisions |
| 6 | docs/IMPLEMENTATION_MAP.md | AGENT | Current build state |
| 7 | project.memory.md | AGENT | This file — V10 rules + agent stack |
| 8 | .cline/memory/lessons.md | CLINE | Error memory — read FIRST |
| 9 | .cline/memory/agent-log.md | ALL | Running activity log |

---

## Key File Ownership

```
HUMAN OWNED:
  docs/PRODUCT.md        ← only file humans ever edit
  CLAUDE.md              ← copy of master prompt
  .claude/settings.json  ← Claude Code project settings
  .clinerules            ← Cline configuration
  .vscode/mcp.json       ← SocratiCode MCP config

AGENT OWNED (never edit manually):
  inputs.yml
  inputs.schema.json
  docs/CHANGELOG_AI.md
  docs/DECISIONS_LOG.md
  docs/IMPLEMENTATION_MAP.md
  project.memory.md
  .socraticodecontextartifacts.json

CLINE ONLY:
  .cline/memory/lessons.md   ← Cline writes after every error
  .cline/memory/agent-log.md ← all agents append
  .cline/handoffs/*.md       ← written when stuck

FROZEN FOREVER (after Phase 3):
  .devcontainer/**           ← never touch again
```

---

## Quick Start Commands

```bash
# After PRODUCT.md is complete:
# Phase 2: Open Claude Code → "Start Phase 2" + paste PRODUCT.md
# Phase 4: Open Cline → "Start Phase 4" (reads inputs.yml automatically)

# After Phase 4 + Phase 6:
pnpm db:migrate && pnpm db:seed

# Governance tools:
pnpm tools:check-product-sync
pnpm typecheck
pnpm test
pnpm build

# Docker services (run on host, not in devcontainer):
bash deploy/compose/start.sh dev up -d

# SocratiCode (after Docker is running):
# Ask Cline: "Index this codebase"
```
