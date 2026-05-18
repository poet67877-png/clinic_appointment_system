import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clinics, clinicUsers, plans } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

/**
 * Clinic Registration Router
 * Handles clinic signup and account creation
 */
export const clinicRegistrationRouter = router({
  // Check if subdomain is available
  checkSubdomainAvailability: publicProcedure
    .input(z.object({ subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      const existing = await db
        .select()
        .from(clinics)
        .where(eq(clinics.subdomain, input.subdomain))
        .limit(1);

      return {
        available: existing.length === 0,
        subdomain: input.subdomain,
      };
    }),

  // Register new clinic
  registerClinic: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(255),
        subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
        email: z.string().email(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "يجب تسجيل الدخول أولاً",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }

      // Check if subdomain is available
      const existingClinic = await db
        .select()
        .from(clinics)
        .where(eq(clinics.subdomain, input.subdomain))
        .limit(1);

      if (existingClinic.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "هذا النطاق الفرعي مستخدم بالفعل",
        });
      }

      // Get default plan (Free plan)
      const defaultPlan = await db
        .select()
        .from(plans)
        .limit(1);

      if (defaultPlan.length === 0) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "لا توجد خطط متاحة",
        });
      }

      const slug = input.subdomain.toLowerCase();

      // Create clinic
      const insertResult = await db.insert(clinics).values({
        name: input.name,
        slug,
        subdomain: input.subdomain,
        email: input.email,
        phone: input.phone,
        ownerId: ctx.user.id,
        planId: defaultPlan[0].id,
        isActive: true,
      });

      // Get the clinic ID from the insert result
      const clinicId = (insertResult as any).insertId || 1;

      // Add user as clinic owner
      await db.insert(clinicUsers).values({
        userId: ctx.user.id,
        clinicId: clinicId,
        role: "owner",
      });

      return {
        success: true,
        clinicId,
        subdomain: input.subdomain,
        slug,
        message: "تم تسجيل العيادة بنجاح",
      };
    }),

  // Get clinic details
  getClinicDetails: publicProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const result = await db
        .select()
        .from(clinics)
        .where(eq(clinics.id, input.clinicId))
        .limit(1);

      return result.length > 0 ? result[0] : null;
    }),
});
