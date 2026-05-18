import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clinics, subscriptions, invoices, payments, plans, users } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "superadmin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only superadmin can access this" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Get all clinics
  getAllClinics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allClinics = await db.select().from(clinics);
    return allClinics;
  }),

  // Get clinic details with subscription
  getClinicDetails: adminProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const clinic = await db
        .select()
        .from(clinics)
        .where(eq(clinics.id, input.clinicId))
        .limit(1);

      if (!clinic.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.clinicId, input.clinicId))
        .limit(1);

      const plan = subscription.length
        ? await db
            .select()
            .from(plans)
            .where(eq(plans.id, subscription[0].planId))
            .limit(1)
        : [];

      return {
        clinic: clinic[0],
        subscription: subscription[0],
        plan: plan[0],
      };
    }),

  // Get dashboard statistics
  getDashboardStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    // Total clinics
    const allClinics = await db.select().from(clinics);
    const totalClinics = allClinics.length;

    // Active subscriptions
    const activeSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, "active"));

    // Trial subscriptions
    const trialSubscriptions = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.status, "trial"));

    // Total revenue (paid invoices)
    const paidInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.status, "paid"));

    const totalRevenue = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);

    // Pending payments
    const pendingPayments = await db
      .select()
      .from(invoices)
      .where(eq(invoices.status, "sent"));

    const pendingAmount = pendingPayments.reduce((sum, inv) => sum + inv.amount, 0);

    return {
      totalClinics,
      activeSubscriptions: activeSubscriptions.length,
      trialSubscriptions: trialSubscriptions.length,
      totalRevenue: totalRevenue / 100, // Convert from cents
      pendingAmount: pendingAmount / 100,
      conversionRate: totalClinics > 0 ? ((activeSubscriptions.length / totalClinics) * 100).toFixed(2) : "0",
    };
  }),

  // Get revenue by plan
  getRevenueByPlan: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allPlans = await db.select().from(plans);
    const revenueData = [];

    for (const plan of allPlans) {
      const planInvoices = await db
        .select()
        .from(invoices)
        .innerJoin(subscriptions, eq(invoices.subscriptionId, subscriptions.id))
        .where(and(eq(subscriptions.planId, plan.id), eq(invoices.status, "paid")));

      const revenue = planInvoices.reduce((sum, item) => sum + item.invoices.amount, 0);

      revenueData.push({
        planName: plan.name,
        revenue: revenue / 100,
        invoiceCount: planInvoices.length,
      });
    }

    return revenueData;
  }),

  // Get monthly revenue
  getMonthlyRevenue: adminProcedure
    .input(z.object({ months: z.number().default(12) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const monthlyData = [];
      const now = new Date();

      for (let i = input.months - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const monthInvoices = await db
          .select()
          .from(invoices)
          .where(
            and(
              eq(invoices.status, "paid"),
              gte(invoices.paidDate, monthStart),
              lte(invoices.paidDate, monthEnd)
            )
          );

        const revenue = monthInvoices.reduce((sum, inv) => sum + inv.amount, 0);

        monthlyData.push({
          month: monthStart.toLocaleDateString("ar-IQ", { month: "long", year: "numeric" }),
          revenue: revenue / 100,
          invoiceCount: monthInvoices.length,
        });
      }

      return monthlyData;
    }),

  // Get clinic growth
  getClinicGrowth: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allClinics = await db.select().from(clinics);

    // Group by month
    const growthData: Record<string, number> = {};

    for (const clinic of allClinics) {
      const monthKey = clinic.createdAt.toLocaleDateString("ar-IQ", {
        month: "long",
        year: "numeric",
      });

      growthData[monthKey] = (growthData[monthKey] || 0) + 1;
    }

    return Object.entries(growthData).map(([month, count]) => ({
      month,
      clinics: count,
    }));
  }),

  // Get pending invoices
  getPendingInvoices: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const pending = await db
      .select()
      .from(invoices)
      .where(eq(invoices.status, "sent"));

    return pending.map((inv) => ({
      ...inv,
      amount: inv.amount / 100,
    }));
  }),

  // Get clinic subscription status
  getClinicSubscriptionStatus: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allSubscriptions = await db.select().from(subscriptions);

    const statusCount = {
      trial: 0,
      active: 0,
      paused: 0,
      cancelled: 0,
    };

    for (const sub of allSubscriptions) {
      statusCount[sub.status]++;
    }

    return statusCount;
  }),

  // Update clinic status
  updateClinicStatus: adminProcedure
    .input(
      z.object({
        clinicId: z.number(),
        isActive: z.boolean(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(clinics)
        .set({
          isActive: input.isActive,
          updatedAt: new Date(),
        })
        .where(eq(clinics.id, input.clinicId));

      return { success: true };
    }),

  // Get system settings
  getSystemSettings: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allPlans = await db.select().from(plans);

    return {
      plans: allPlans,
      trialDays: 14,
    };
  }),
});

export type AdminRouter = typeof adminRouter;
