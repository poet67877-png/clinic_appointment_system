import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { doctors, doctorTimeSlots } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { eq, and } from "drizzle-orm";
import { ensureClinicOwner } from "./multitenant";

/**
 * Doctors Management Router for Multi-tenant
 */
export const doctorsMultitenantRouter = router({
  // Get all doctors for a clinic
  getClinicDoctors: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input, ctx }) => {
      // Verify user has access to this clinic
      if (!ctx.clinicId || ctx.clinicId !== input.clinicId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(doctors)
        .where(eq(doctors.clinicId, input.clinicId));
    }),

  // Add a new doctor
  addDoctor: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        name: z.string().min(2).max(255),
        specialty: z.string().min(2).max(255),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Verify user is clinic owner
      await ensureClinicOwner(ctx.user?.id || 0, input.clinicId);

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(doctors).values({
        clinicId: input.clinicId,
        name: input.name,
        specialty: input.specialty,
        email: input.email,
        phone: input.phone,
        isActive: true,
      });

      return { success: true };
    }),

  // Update doctor
  updateDoctor: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        doctorId: z.number(),
        name: z.string().min(2).max(255).optional(),
        specialty: z.string().min(2).max(255).optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ensureClinicOwner(ctx.user?.id || 0, input.clinicId);

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verify doctor belongs to clinic
      const doctor = await db
        .select()
        .from(doctors)
        .where(and(eq(doctors.id, input.doctorId), eq(doctors.clinicId, input.clinicId)))
        .limit(1);

      if (doctor.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const updateData: any = {};
      if (input.name) updateData.name = input.name;
      if (input.specialty) updateData.specialty = input.specialty;
      if (input.email) updateData.email = input.email;
      if (input.phone) updateData.phone = input.phone;

      if (Object.keys(updateData).length > 0) {
        await db
          .update(doctors)
          .set(updateData)
          .where(eq(doctors.id, input.doctorId));
      }

      return { success: true };
    }),

  // Delete doctor
  deleteDoctor: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        doctorId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ensureClinicOwner(ctx.user?.id || 0, input.clinicId);

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Verify doctor belongs to clinic
      const doctor = await db
        .select()
        .from(doctors)
        .where(and(eq(doctors.id, input.doctorId), eq(doctors.clinicId, input.clinicId)))
        .limit(1);

      if (doctor.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Soft delete by setting isActive to false
      await db
        .update(doctors)
        .set({ isActive: false })
        .where(eq(doctors.id, input.doctorId));

      return { success: true };
    }),

  // Get doctor time slots
  getDoctorTimeSlots: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        doctorId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      if (!ctx.clinicId || ctx.clinicId !== input.clinicId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) return [];

      return await db
        .select()
        .from(doctorTimeSlots)
        .where(
          and(
            eq(doctorTimeSlots.clinicId, input.clinicId),
            eq(doctorTimeSlots.doctorId, input.doctorId)
          )
        );
    }),

  // Add time slot for doctor
  addTimeSlot: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        doctorId: z.number(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await ensureClinicOwner(ctx.user?.id || 0, input.clinicId);

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(doctorTimeSlots).values({
        clinicId: input.clinicId,
        doctorId: input.doctorId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime as any,
        endTime: input.endTime as any,
        isActive: true,
      });

      return { success: true };
    }),
});
