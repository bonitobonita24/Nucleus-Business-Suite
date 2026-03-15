// ─────────────────────────────────────────────────────────────────────────────
// tRPC — Core Router + Context Type
// This file defines the tRPC context type and procedure builder.
// Imported by apps/web for router definitions; exported via api-client for types.
// ─────────────────────────────────────────────────────────────────────────────

import { initTRPC, TRPCError } from "@trpc/server";
import { z } from "zod";
import type { AppJwtPayload, TenantJwtPayload, PlatformJwtPayload } from "@nucleus/shared";
import type { TenantRole, PlatformRole } from "@nucleus/shared";

// ─── Context ─────────────────────────────────────────────────────────────────

export interface TRPCContext {
  /** Authenticated user JWT payload — null if not authenticated */
  user: AppJwtPayload | null;
  /** Tenant slug extracted from URL path (for tenant routes) */
  tenantSlug: string | null;
}

// ─── tRPC Init ────────────────────────────────────────────────────────────────

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape }) {
    return shape;
  },
});

export const router = t.router;
export const mergeRouters = t.mergeRouters;
export const middleware = t.middleware;

// ─── Base Procedures ─────────────────────────────────────────────────────────

/** Public procedure — no authentication required */
export const publicProcedure = t.procedure;

// ─── Auth Middleware ──────────────────────────────────────────────────────────

const enforceAuth = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

/** Authenticated procedure — requires any valid JWT */
export const protectedProcedure = t.procedure.use(enforceAuth);

// ─── Tenant Middleware ────────────────────────────────────────────────────────

const enforceTenant = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!("tenantSlug" in ctx.user) || ctx.user.tenantSlug === null) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Tenant context required" });
  }

  const tenantUser = ctx.user as TenantJwtPayload;

  // Validate tenantSlug in URL matches tenantSlug in JWT (L1 — always active)
  if (ctx.tenantSlug && ctx.tenantSlug !== tenantUser.tenantSlug) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Tenant slug mismatch — cross-tenant access denied",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: tenantUser,
      tenantSlug: tenantUser.tenantSlug,
    },
  });
});

/** Tenant procedure — requires tenant JWT; validates slug matches URL */
export const tenantProcedure = t.procedure.use(enforceAuth).use(enforceTenant);

// ─── Role Enforcement ─────────────────────────────────────────────────────────

/**
 * Create a procedure that requires specific tenant roles.
 * Usage: requireRole("admin", "tenant_super_admin")
 */
export function requireRole(...roles: TenantRole[]) {
  return tenantProcedure.use(
    middleware(({ ctx, next }) => {
      const tenantUser = ctx.user as TenantJwtPayload;
      if (!roles.includes(tenantUser.role)) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: `Required role: ${roles.join(" or ")}. Current role: ${tenantUser.role}`,
        });
      }
      return next({ ctx });
    }),
  );
}

/**
 * Platform owner procedure — requires platform_owner JWT.
 * Returns 403 for any tenant role.
 */
const enforcePlatformOwner = middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  const platformUser = ctx.user as PlatformJwtPayload;
  if (platformUser.role !== "platform_owner" || platformUser.tenantSlug !== null) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Platform owner access required" });
  }
  return next({ ctx: { ...ctx, user: platformUser } });
});

export const platformProcedure = t.procedure.use(enforceAuth).use(enforcePlatformOwner);

// ─── Rate Limiting Input Validation ──────────────────────────────────────────

/** Common pagination schema */
export const PaginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;

/** Common list response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
