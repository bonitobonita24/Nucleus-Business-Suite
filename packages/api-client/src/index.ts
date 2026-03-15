// ─────────────────────────────────────────────────────────────────────────────
// @nucleus/api-client — Barrel Export
// Typed tRPC client — used by all apps; never by packages/db or workers directly
// ─────────────────────────────────────────────────────────────────────────────

// tRPC core — router, procedures, middleware
export {
  router,
  mergeRouters,
  middleware,
  publicProcedure,
  protectedProcedure,
  tenantProcedure,
  platformProcedure,
  requireRole,
  PaginationSchema,
  type TRPCContext,
  type PaginationInput,
  type PaginatedResponse,
} from "./trpc.js";
