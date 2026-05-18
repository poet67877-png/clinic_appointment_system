import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { and, eq, desc } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clinics, subscriptions, plans, clinicNotes, users } from "../drizzle/schema";

export const superadminRouter = router({
  // Get all clinics with subscription info
  getAllClinics: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "superadmin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Only super admins can access this" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allClinics = await db
      .select({
        clinic: clinics,
        subscription: subscriptions,
        plan: plans,
      })
      .from(clinics)
      .leftJoin(subscriptions, eq(clinics.id, subscriptions.clinicId))
      .leftJoin(plans, eq(subscriptions.planId, plans.id))
      .orderBy(desc(clinics.createdAt));

    return allClinics;
  }),

  // Get clinic details with notes
  getClinicDetails: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [clinic] = await db
        .select()
        .from(clinics)
        .where(eq(clinics.id, input.clinicId));

      if (!clinic) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Clinic not found" });
      }

      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.clinicId, input.clinicId));

      const notes = await db
        .select()
        .from(clinicNotes)
        .where(eq(clinicNotes.clinicId, input.clinicId))
        .orderBy(desc(clinicNotes.createdAt));

      return { clinic, subscription, notes };
    }),

  // Update clinic subscription status
  updateClinicSubscription: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        planId: z.number().optional(),
        status: z.enum(["trial", "active", "paused", "cancelled"]).optional(),
        subscriptionEndDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [subscription] = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.clinicId, input.clinicId));

      if (!subscription) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Subscription not found" });
      }

      const updateData: Record<string, unknown> = {};
      if (input.status) updateData.status = input.status;
      if (input.planId) updateData.planId = input.planId;
      if (input.subscriptionEndDate) {
        updateData.subscriptionEndDate = input.subscriptionEndDate;
      }

      await db
        .update(subscriptions)
        .set(updateData)
        .where(eq(subscriptions.id, subscription.id));

      return { success: true };
    }),

  // Toggle clinic active status
  toggleClinicStatus: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [clinic] = await db
        .select()
        .from(clinics)
        .where(eq(clinics.id, input.clinicId));

      if (!clinic) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      await db
        .update(clinics)
        .set({ isActive: !clinic.isActive })
        .where(eq(clinics.id, input.clinicId));

      return { success: true, isActive: !clinic.isActive };
    }),

  // Add note to clinic
  addClinicNote: protectedProcedure
    .input(z.object({ clinicId: z.number(), note: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "superadmin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(clinicNotes).values({
        clinicId: input.clinicId,
        adminId: ctx.user.id,
        note: input.note,
      });

      return { success: true };
    }),

  // Get plans for dropdown
  getPlans: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "superadmin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return await db.select().from(plans);
  }),

  // Get dashboard stats
  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "superadmin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const allClinics = await db.select().from(clinics);
    const allSubscriptions = await db.select().from(subscriptions);

    const activeCount = allClinics.filter((c) => c.isActive).length;
    const trialCount = allSubscriptions.filter((s) => s.status === "trial").length;
    const activeSubscriptions = allSubscriptions.filter((s) => s.status === "active").length;
    const pausedCount = allSubscriptions.filter((s) => s.status === "paused").length;

    return {
      totalClinics: allClinics.length,
      activeClinics: activeCount,
      inactiveClinics: allClinics.length - activeCount,
      trialSubscriptions: trialCount,
      activeSubscriptions,
      pausedSubscriptions: pausedCount,
      conversionRate: allClinics.length > 0 ? ((activeSubscriptions / allClinics.length) * 100).toFixed(2) : "0",
    };
  }),
});
