import { z } from "zod";
import { router, tenantProcedure, requireRole } from "@nucleus/api-client";
import { db, withTenantSchema } from "@nucleus/db";

export const tenantRouter = router({
  /** Get dashboard KPIs for authenticated tenant user */
  dashboard: tenantProcedure.query(async ({ ctx }) => {
    return withTenantSchema(db, ctx.tenantSlug, async (tx) => {
      const [invoiceCount, projectCount, taskCount] = await Promise.all([
        tx.invoice.count({
          where: { status: { in: ["unpaid", "partially_paid", "overdue"] } },
        }),
        tx.project.count({ where: { status: "active" } }),
        tx.task.count({ where: { status: { in: ["todo", "in_progress"] } } }),
      ]);

      return {
        invoicesAwaitingPayment: invoiceCount,
        projectsInProgress: projectCount,
        tasksNotFinished: taskCount,
      };
    });
  }),
});
