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
<!-- Additional decisions are added here by agents during Phase 3 (spec generation) and Phase 7 (feature updates) -->
