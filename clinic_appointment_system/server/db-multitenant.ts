import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import {
  doctors,
  doctorTimeSlots,
  appointments,
  InsertDoctor,
  InsertDoctorTimeSlot,
  InsertAppointment,
  clinics,
  InsertClinic,
  clinicUsers,
  InsertClinicUser,
  plans,
  InsertPlan,
} from "../drizzle/schema";

/**
 * Clinic Management
 */
export async function createClinic(data: InsertClinic) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clinics).values(data);
}

export async function getClinicById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getAllClinics() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clinics).where(eq(clinics.isActive, true));
}

/**
 * Clinic Users Management
 */
export async function addUserToClinic(data: InsertClinicUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(clinicUsers).values(data);
}

export async function getUserClinics(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(clinicUsers).where(eq(clinicUsers.userId, userId));
}

/**
 * Plans Management
 */
export async function createPlan(data: InsertPlan) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(plans).values(data);
}

export async function getPlanById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(plans).where(eq(plans.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Doctors Management (Multi-tenant)
 */
export async function getAllDoctorsByClinic(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(doctors)
    .where(and(eq(doctors.clinicId, clinicId), eq(doctors.isActive, true)));
}

export async function getDoctorById(id: number, clinicId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(doctors)
    .where(and(eq(doctors.id, id), eq(doctors.clinicId, clinicId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createDoctorForClinic(data: InsertDoctor) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(doctors).values(data);
}

export async function deleteDoctorFromClinic(id: number, clinicId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(doctors)
    .where(and(eq(doctors.id, id), eq(doctors.clinicId, clinicId)));
}

/**
 * Time Slots Management (Multi-tenant)
 */
export async function getAvailableTimeSlotsByClinic(
  clinicId: number,
  doctorId: number,
  dayOfWeek: number
) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(doctorTimeSlots)
    .where(
      and(
        eq(doctorTimeSlots.clinicId, clinicId),
        eq(doctorTimeSlots.doctorId, doctorId),
        eq(doctorTimeSlots.dayOfWeek, dayOfWeek),
        eq(doctorTimeSlots.isActive, true)
      )
    );
}

export async function createTimeSlotForClinic(data: InsertDoctorTimeSlot) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(doctorTimeSlots).values(data);
}

/**
 * Appointments Management (Multi-tenant)
 */
export async function createAppointmentForClinic(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(appointments).values(data);
}

export async function getAppointmentsByPhoneAndClinic(phone: string, clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(appointments)
    .where(
      and(eq(appointments.patientPhone, phone), eq(appointments.clinicId, clinicId))
    );
}

export async function getAllAppointmentsByClinic(clinicId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(appointments)
    .where(eq(appointments.clinicId, clinicId));
}

export async function updateAppointmentStatusByClinic(
  id: number,
  clinicId: number,
  status: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(appointments)
    .set({ status: status as any, updatedAt: new Date() })
    .where(and(eq(appointments.id, id), eq(appointments.clinicId, clinicId)));
}

export async function deleteAppointmentByClinic(id: number, clinicId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .delete(appointments)
    .where(and(eq(appointments.id, id), eq(appointments.clinicId, clinicId)));
}

export async function getAppointmentStatsByClinic(clinicId: number) {
  const db = await getDb();
  if (!db) return { total: 0, confirmed: 0, pending: 0 };

  const allAppointments = await db
    .select()
    .from(appointments)
    .where(eq(appointments.clinicId, clinicId));

  const confirmed = allAppointments.filter((a) => a.status === "مؤكد").length;
  const pending = allAppointments.filter((a) => a.status === "معلق").length;

  return {
    total: allAppointments.length,
    confirmed,
    pending,
  };
}
