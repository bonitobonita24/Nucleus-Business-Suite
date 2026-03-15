// ─────────────────────────────────────────────────────────────────────────────
// tRPC Context Creator
// Builds the TRPCContext from the incoming request.
// Extracts JWT from NextAuth session and tenant slug from URL path.
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "../lib/auth.js";
import type { TRPCContext } from "@nucleus/api-client";

export async function createTRPCContext(req: Request): Promise<TRPCContext> {
  const session = await auth();

  // Extract tenantSlug from URL path: /<slug>/erp/*, /<slug>/pos/*, /<slug>/portal/*
  const url = new URL(req.url);
  const pathSegments = url.pathname.split("/").filter(Boolean);

  // Path pattern: /api/trpc/... but called from /<slug>/* context
  // tenantSlug is passed via custom header from the frontend
  const tenantSlugHeader = req.headers.get("x-tenant-slug");
  const tenantSlug = tenantSlugHeader ?? pathSegments[0] ?? null;

  if (!session?.user) {
    return { user: null, tenantSlug };
  }

  const user = session.user as {
    userId: string;
    tenantSlug: string | null;
    role: string;
    isEmployee?: boolean;
  };

  if (user.tenantSlug === null) {
    // platform_owner
    return {
      user: {
        userId: user.userId,
        role: "platform_owner" as const,
        tenantSlug: null,
      },
      tenantSlug: null,
    };
  }

  return {
    user: {
      userId: user.userId,
      tenantSlug: user.tenantSlug,
      role: user.role as import("@nucleus/shared").TenantRole,
      isEmployee: user.isEmployee ?? false,
    },
    tenantSlug,
  };
}
