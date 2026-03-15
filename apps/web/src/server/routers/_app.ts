// ─────────────────────────────────────────────────────────────────────────────
// tRPC App Router — Root router combining all module routers
// ─────────────────────────────────────────────────────────────────────────────

import { router } from "@nucleus/api-client";
import { authRouter } from "./auth.js";
import { tenantRouter } from "./tenant.js";

export const appRouter = router({
  auth: authRouter,
  tenant: tenantRouter,
});

export type AppRouter = typeof appRouter;
