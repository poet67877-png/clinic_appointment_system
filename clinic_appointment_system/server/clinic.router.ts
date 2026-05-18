import { z } from "zod";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import {
  getAllDoctors,
  getDoctorById,
  getAvailableTimeSlots,
  createAppointment,
  getAppointmentsByPhone,
  getAllAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  getAppointmentStats,
} from "./db";
import { nanoid } from "nanoid";

export const clinicRouter = router({
  // Get all active doctors
  doctors: publicProcedure.query(async () => {
    return await getAllDoctors();
  }),

  // Get doctor by ID
  getDoctor: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getDoctorById(input.id);
    }),

  // Get available time slots for a doctor on a specific day
  getAvailableSlots: publicProcedure
    .input(z.object({ doctorId: z.number(), dayOfWeek: z.number() }))
    .query(async ({ input }) => {
      return await getAvailableTimeSlots(input.doctorId, input.dayOfWeek);
    }),

  // Book an appointment
  bookAppointment: publicProcedure
    .input(
      z.object({
        doctorId: z.number(),
        patientName: z.string().min(2),
        patientPhone: z.string().min(10),
        appointmentDate: z.string(), // YYYY-MM-DD
        appointmentTime: z.string(), // HH:MM:SS
      })
    )
    .mutation(async ({ input }) => {
      const confirmationCode = nanoid(10).toUpperCase();
      await createAppointment({
        clinicId: 1,
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
    .input(z.object({ phone: z.string() }))
    .query(async ({ input }) => {
      return await getAppointmentsByPhone(input.phone);
    }),

  // Cancel appointment by ID
  cancelAppointment: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await updateAppointmentStatus(input.id, "ملغى");
      return { success: true };
    }),

  // Admin: Get all appointments
  getAllAppointments: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await getAllAppointments();
  }),

  // Admin: Update appointment status
  updateAppointmentStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["معلق", "مؤكد", "ملغى"]) }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await updateAppointmentStatus(input.id, input.status);
      return { success: true };
    }),

  // Admin: Delete appointment
  deleteAppointment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Unauthorized");
      }
      await deleteAppointment(input.id);
      return { success: true };
    }),

  // Admin: Get appointment statistics
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new Error("Unauthorized");
    }
    return await getAppointmentStats();
  }),
});
