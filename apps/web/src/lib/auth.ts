// ─────────────────────────────────────────────────────────────────────────────
// Auth.js v5 (NextAuth) Configuration
// D008 (LOCKED): JWT strategy; tenant + platform JWT shapes.
// ─────────────────────────────────────────────────────────────────────────────

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db, withTenantSchema } from "@nucleus/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          !credentials?.email ||
          !credentials?.password ||
          typeof credentials.email !== "string" ||
          typeof credentials.password !== "string"
        ) {
          return null;
        }

        // Check platform_owner first (in public schema)
        // Then check tenant users by looking up tenant by email domain or slug

        // For platform owner: check in public schema
        // (Platform owner user would be stored in a separate table or config)
        // For this scaffold, we look for tenant by checking all active tenants
        // In production: add a platform_users table in public schema

        // Try to find user in any tenant schema
        // Note: In production, maintain an email→tenantSlug index for fast lookup
        const tenants = await db.globalTenant.findMany({
          where: { status: { in: ["trial", "active"] } },
          select: { tenantName: true, schemaName: true },
        });

        for (const tenant of tenants) {
          try {
            const user = await withTenantSchema(
              db,
              tenant.tenantName,
              async (tx) => {
                return tx.user.findUnique({
                  where: { email: credentials.email as string },
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    password: true,
                    role: true,
                    isEmployee: true,
                    isActive: true,
                  },
                });
              },
            );

            if (user && user.isActive) {
              // Verify password (bcrypt)
              const { default: bcrypt } = await import("bcryptjs");
              const valid = await bcrypt.compare(
                credentials.password as string,
                user.password,
              );

              if (valid) {
                return {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                  // Custom JWT fields
                  userId: user.id,
                  tenantSlug: tenant.tenantName,
                  role: user.role,
                  isEmployee: user.isEmployee,
                };
              }
            }
          } catch {
            // User not in this tenant schema, continue
          }
        }

        return null;
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as {
          userId?: string;
          tenantSlug?: string | null;
          role?: string;
          isEmployee?: boolean;
        };
        token["userId"] = u.userId ?? user.id;
        token["tenantSlug"] = u.tenantSlug ?? null;
        token["role"] = u.role ?? "staff";
        token["isEmployee"] = u.isEmployee ?? false;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        (session.user as unknown as Record<string, unknown>)["userId"] = token["userId"];
        (session.user as unknown as Record<string, unknown>)["tenantSlug"] = token["tenantSlug"];
        (session.user as unknown as Record<string, unknown>)["role"] = token["role"];
        (session.user as unknown as Record<string, unknown>)["isEmployee"] = token["isEmployee"];
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
