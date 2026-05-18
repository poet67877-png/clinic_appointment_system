import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { clinics } from "../drizzle/schema";
import { storagePut } from "./storage";

export const clinicCustomizationRouter = router({
  // Get clinic customization settings
  getSettings: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.clinicId) {
      throw new TRPCError({ code: "FORBIDDEN", message: "No clinic context" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [clinic] = await db
      .select()
      .from(clinics)
      .where(eq(clinics.id, ctx.clinicId));

    if (!clinic) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Clinic not found" });
    }

    return {
      name: clinic.name,
      logo: clinic.logo,
      coverImage: clinic.coverImage,
      primaryColor: clinic.primaryColor,
      secondaryColor: clinic.secondaryColor,
      whatsappNumber: clinic.whatsappNumber,
      description: clinic.description,
    };
  }),

  // Update basic clinic info
  updateBasicInfo: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        whatsappNumber: z.string().regex(/^\d{10,15}$/).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.clinicId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const updateData: Record<string, unknown> = {};
      if (input.name) updateData.name = input.name;
      if (input.description) updateData.description = input.description;
      if (input.whatsappNumber) updateData.whatsappNumber = input.whatsappNumber;

      await db.update(clinics).set(updateData).where(eq(clinics.id, ctx.clinicId));

      return { success: true };
    }),

  // Update colors
  updateColors: protectedProcedure
    .input(
      z.object({
        primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
        secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.clinicId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(clinics)
        .set({
          primaryColor: input.primaryColor,
          secondaryColor: input.secondaryColor,
        })
        .where(eq(clinics.id, ctx.clinicId));

      return { success: true };
    }),

  // Upload logo
  uploadLogo: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.clinicId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        const buffer = Buffer.from(input.base64, "base64");
        const fileKey = `clinics/${ctx.clinicId}/logo-${Date.now()}`;

        const { url } = await storagePut(fileKey, buffer, "image/png");

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db.update(clinics).set({ logo: url }).where(eq(clinics.id, ctx.clinicId));

        return { success: true, url };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload logo",
        });
      }
    }),

  // Upload cover image
  uploadCoverImage: protectedProcedure
    .input(
      z.object({
        base64: z.string(),
        fileName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.clinicId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      try {
        const buffer = Buffer.from(input.base64, "base64");
        const fileKey = `clinics/${ctx.clinicId}/cover-${Date.now()}`;

        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        const db = await getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

        await db
          .update(clinics)
          .set({ coverImage: url })
          .where(eq(clinics.id, ctx.clinicId));

        return { success: true, url };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload cover image",
        });
      }
    }),

  // Get public clinic profile (for public pages)
  getPublicProfile: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const [clinic] = await db
        .select()
        .from(clinics)
        .where(eq(clinics.slug, input.slug));

      if (!clinic || !clinic.isActive) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Clinic not found" });
      }

      return {
        id: clinic.id,
        name: clinic.name,
        slug: clinic.slug,
        logo: clinic.logo,
        coverImage: clinic.coverImage,
        primaryColor: clinic.primaryColor,
        secondaryColor: clinic.secondaryColor,
        description: clinic.description,
        whatsappNumber: clinic.whatsappNumber,
      };
    }),
});
