import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "@nucleus/api-client";

export const authRouter = router({
  /** Get current session user */
  me: protectedProcedure.query(({ ctx }) => {
    return ctx.user;
  }),

  /** Health check — public */
  health: publicProcedure.query(() => {
    return { status: "ok", timestamp: new Date().toISOString() };
  }),
});
