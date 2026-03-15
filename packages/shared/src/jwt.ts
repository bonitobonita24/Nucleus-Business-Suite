// ─────────────────────────────────────────────────────────────────────────────
// JWT Types — Auth.js v5 Token Shapes
// D008: JWT strategy; single role per user.
// ─────────────────────────────────────────────────────────────────────────────

import type { TenantRole, PlatformRole } from "./enums.js";

/** JWT payload for tenant users */
export interface TenantJwtPayload {
  userId: string;
  tenantSlug: string;
  role: TenantRole;
  isEmployee: boolean;
}

/** JWT payload for platform owner */
export interface PlatformJwtPayload {
  userId: string;
  role: PlatformRole;
  tenantSlug: null;
}

export type AppJwtPayload = TenantJwtPayload | PlatformJwtPayload;

export function isTenantJwt(payload: AppJwtPayload): payload is TenantJwtPayload {
  return payload.tenantSlug !== null;
}

export function isPlatformJwt(payload: AppJwtPayload): payload is PlatformJwtPayload {
  return payload.tenantSlug === null;
}
