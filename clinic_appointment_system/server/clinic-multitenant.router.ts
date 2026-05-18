import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { nanoid } from "nanoid";
import {
  getAllDoctorsByClinic,
  getDoctorById,
  getAvailableTimeSlotsByClinic,
  createAppointmentForClinic,
  getAppointmentsByPhoneAndClinic,
  getAllAppointmentsByClinic,
  updateAppointmentStatusByClinic,
  deleteAppointmentByClinic,
  getAppointmentStatsByClinic,
  createClinic,
  addUserToClinic,
  createDoctorForClinic,
  createTimeSlotForClinic,
  getClinicById,
} from "./db-multitenant";
import { ensureClinicContext, ensureUserClinicAccess, ensureClinicOwner } from "./multitenant";
import { TRPCError } from "@trpc/server";

/**
 * Multi-tenant Clinic Router
 * All procedures require clinicId context
 */
export const multitenantClinicRouter = router({
  // Register new clinic
  registerClinic: publicProcedure
    .input(
      z.object({
        name: z.string().min(2),
        subdomain: z.string().min(3).regex(/^[a-z0-9-]+$/),
        email: z.string().email(),
        phone: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      // Check if subdomain is available
      const existingClinic = await getClinicById(1); // Placeholder check
      // In real implementation, check subdomain availability

      const slug = input.subdomain.toLowerCase();
      await createClinic({
        name: input.name,
        slug,
        subdomain: input.subdomain,
        email: input.email,
        phone: input.phone,
        ownerId: ctx.user.id,
        planId: 1, // Default plan
        isActive: true,
      });

      // Add user as clinic owner
      await addUserToClinic({
        userId: ctx.user.id,
        clinicId: 1, // Should get actual clinic ID
        role: "owner",
      });

      return { success: true, subdomain: input.subdomain };
    }),

  // Get clinic info
  getClinicInfo: publicProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      return await getClinicById(input.clinicId);
    }),

  // Get all doctors for clinic
  doctors: publicProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      return await getAllDoctorsByClinic(input.clinicId);
    }),

  // Get doctor by ID
  getDoctor: publicProcedure
    .input(z.object({ clinicId: z.number(), doctorId: z.number() }))
    .query(async ({ input }) => {
      return await getDoctorById(input.doctorId, input.clinicId);
    }),

  // Get available time slots for a doctor on a specific day
  getAvailableSlots: publicProcedure
    .input(z.object({ clinicId: z.number(), doctorId: z.number(), dayOfWeek: z.number() }))
    .query(async ({ input }) => {
      return await getAvailableTimeSlotsByClinic(
        input.clinicId,
        input.doctorId,
        input.dayOfWeek
      );
    }),

  // Book an appointment
  bookAppointment: publicProcedure
    .input(
      z.object({
        clinicId: z.number(),
        doctorId: z.number(),
        patientName: z.string().min(2),
        patientPhone: z.string().min(10),
        appointmentDate: z.string(), // YYYY-MM-DD
        appointmentTime: z.string(), // HH:MM:SS
      })
    )
    .mutation(async ({ input }) => {
      const confirmationCode = nanoid(10).toUpperCase();
      await createAppointmentForClinic({
        clinicId: input.clinicId,
        confirmationCode,
        doctorId: input.doctorId,
        patientName: input.patientName,
        patientPhone: input.patientPhone,
        appointmentDate: input.appointmentDate as any,
        appointmentTime: input.appointmentTime as any,
        status: "معلق",
      });
      return { confirmationCode };
    }),

  // Get appointments by phone number
  getAppointmentsByPhone: publicProcedure
    .input(z.object({ clinicId: z.number(), phone: z.string() }))
    .query(async ({ input }) => {
      return await getAppointmentsByPhoneAndClinic(input.phone, input.clinicId);
    }),

  // Cancel appointment by ID
  cancelAppointment: publicProcedure
    .input(z.object({ clinicId: z.number(), id: z.number() }))
    .mutation(async ({ input }) => {
      await updateAppointmentStatusByClinic(input.id, input.clinicId, "ملغى");
      return { success: true };
    }),

  // Admin: Get all appointments
  getAllAppointments: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input, ctx }) => {
      ensureClinicContext(input.clinicId);
      await ensureUserClinicAccess(ctx.user!.id, input.clinicId);
      return await getAllAppointmentsByClinic(input.clinicId);
    }),

  // Admin: Update appointment status
  updateAppointmentStatus: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        id: z.number(),
        status: z.enum(["معلق", "مؤكد", "ملغى"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ensureClinicContext(input.clinicId);
      await ensureUserClinicAccess(ctx.user!.id, input.clinicId);
      await updateAppointmentStatusByClinic(input.id, input.clinicId, input.status);
      return { success: true };
    }),

  // Admin: Delete appointment
  deleteAppointment: protectedProcedure
    .input(z.object({ clinicId: z.number(), id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      ensureClinicContext(input.clinicId);
      await ensureUserClinicAccess(ctx.user!.id, input.clinicId);
      await deleteAppointmentByClinic(input.id, input.clinicId);
      return { success: true };
    }),

  // Admin: Get appointment statistics
  getStats: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input, ctx }) => {
      ensureClinicContext(input.clinicId);
      await ensureUserClinicAccess(ctx.user!.id, input.clinicId);
      return await getAppointmentStatsByClinic(input.clinicId);
    }),

  // Admin: Add doctor to clinic
  addDoctor: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        name: z.string().min(2),
        specialty: z.string().min(2),
        phone: z.string().optional(),
        email: z.string().email().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ensureClinicContext(input.clinicId);
      await ensureClinicOwner(ctx.user!.id, input.clinicId);
      await createDoctorForClinic({
        clinicId: input.clinicId,
        name: input.name,
        specialty: input.specialty,
        phone: input.phone,
        email: input.email,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { success: true };
    }),

  // Admin: Add time slot for doctor
  addTimeSlot: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        doctorId: z.number(),
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(), // HH:MM:SS
        endTime: z.string(),
        slotDurationMinutes: z.number().default(30),
      })
    )
    .mutation(async ({ input, ctx }) => {
      ensureClinicContext(input.clinicId);
      await ensureClinicOwner(ctx.user!.id, input.clinicId);
      await createTimeSlotForClinic({
        clinicId: input.clinicId,
        doctorId: input.doctorId,
        dayOfWeek: input.dayOfWeek,
        startTime: input.startTime,
        endTime: input.endTime,
        slotDurationMinutes: input.slotDurationMinutes,
        isActive: true,
      });
      return { success: true };
    }),
});
