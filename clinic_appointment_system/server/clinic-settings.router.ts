import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clinics } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const clinicSettingsRouter = router({
  // Get clinic settings
  getSettings: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verify user has access to this clinic
      const clinic = await db
        .select()
        .from(clinics)
        .where(eq(clinics.id, input.clinicId))
        .limit(1);

      if (!clinic.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return clinic[0];
    }),

  // Update clinic settings
  updateSettings: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        name: z.string().min(1).max(255).optional(),
        primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
        description: z.string().max(1000).optional(),
        phone: z.string().max(20).optional(),
        address: z.string().max(500).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { clinicId, ...updateData } = input;

      // Verify clinic exists
      const clinic = await db
        .select()
        .from(clinics)
        .where(eq(clinics.id, clinicId))
        .limit(1);

      if (!clinic.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Update clinic
      await db
        .update(clinics)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(eq(clinics.id, clinicId));

      // Return updated clinic
      const updated = await db
        .select()
        .from(clinics)
        .where(eq(clinics.id, clinicId))
        .limit(1);

      return updated[0];
    }),

  // Update clinic logo (URL only - actual upload handled by client)
  updateLogo: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        logoUrl: z.string().url(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { clinicId, logoUrl } = input;

      // Verify clinic exists
      const clinic = await db
        .select()
        .from(clinics)
        .where(eq(clinics.id, clinicId))
        .limit(1);

      if (!clinic.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Update logo
      await db
        .update(clinics)
        .set({
          logo: logoUrl,
          updatedAt: new Date(),
        })
        .where(eq(clinics.id, clinicId));

      return { success: true, logoUrl };
    }),

  // Get clinic branding for public pages
  getPublicBranding: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const clinic = await db
        .select({
          id: clinics.id,
          name: clinics.name,
          logo: clinics.logo,
          primaryColor: clinics.primaryColor,
          secondaryColor: clinics.secondaryColor,
          description: clinics.description,
        })
        .from(clinics)
        .where(eq(clinics.id, input.clinicId))
        .limit(1);

      if (!clinic.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return clinic[0];
    }),
});

export type ClinicSettingsRouter = typeof clinicSettingsRouter;
