// ─────────────────────────────────────────────────────────────────────────────
// Next.js Middleware — Auth + Tenant Routing Guard
// D007 (LOCKED): path-based subdirectory routing; tenant slug in URL.
// ─────────────────────────────────────────────────────────────────────────────

import { auth } from "./lib/auth.js";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: unknown }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth as {
    user?: {
      tenantSlug?: string | null;
      role?: string;
    };
  } | null;

  // Public routes — no auth required
  const publicPaths = ["/", "/login", "/register", "/api/health"];
  if (publicPaths.some((p) => pathname === p || pathname.startsWith("/api/auth"))) {
    return NextResponse.next();
  }

  // Not authenticated — redirect to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const user = session.user;

  // Platform admin routes — platform_owner only
  if (pathname.startsWith("/powerbyte-admin")) {
    if (user.role !== "platform_owner") {
      return new NextResponse(null, { status: 403 });
    }
    return NextResponse.next();
  }

  // Tenant routes — validate slug matches JWT
  const tenantRouteMatch = pathname.match(/^\/([^/]+)\/(erp|pos|portal)(\/.*)?$/);
  if (tenantRouteMatch) {
    const urlSlug = tenantRouteMatch[1];
    const jwtSlug = user.tenantSlug;

    // Cross-tenant path with valid session → 403 (L1 — always active)
    if (urlSlug !== jwtSlug) {
      return new NextResponse(null, { status: 403 });
    }

    // Role-based route protection
    const routeType = tenantRouteMatch[2];
    if (routeType === "pos" && !["cashier", "admin", "tenant_super_admin"].includes(user.role ?? "")) {
      return new NextResponse(null, { status: 403 });
    }
    if (routeType === "portal" && user.role !== "customer") {
      return new NextResponse(null, { status: 403 });
    }

    return NextResponse.next();
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
