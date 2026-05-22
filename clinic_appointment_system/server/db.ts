import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, doctors, doctorTimeSlots, appointments, InsertAppointment } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAllDoctors() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(doctors).where(eq(doctors.isActive, true));
}

export async function getDoctorById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(doctors).where(eq(doctors.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAvailableTimeSlots(doctorId: number, dayOfWeek: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(doctorTimeSlots)
    .where(and(eq(doctorTimeSlots.doctorId, doctorId), eq(doctorTimeSlots.dayOfWeek, dayOfWeek), eq(doctorTimeSlots.isActive, true)));
}

export async function createAppointment(data: InsertAppointment) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(appointments).values(data);
}

export async function getAppointmentsByPhone(phone: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(appointments)
    .where(eq(appointments.patientPhone, phone));
}

export async function getAllAppointments() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(appointments);
}

export async function updateAppointmentStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(appointments)
    .set({ status: status as any, updatedAt: new Date() })
    .where(eq(appointments.id, id));
}

export async function deleteAppointment(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(appointments).where(eq(appointments.id, id));
}

export async function getAppointmentStats() {
  const db = await getDb();
  if (!db) return { total: 0, confirmed: 0, pending: 0 };
  
  const allAppointments = await db.select().from(appointments);
  const confirmed = allAppointments.filter(a => a.status === 'مؤكد').length;
  const pending = allAppointments.filter(a => a.status === 'معلق').length;
  
  return {
    total: allAppointments.length,
    confirmed,
    pending
  };
}

// TODO: add feature queries here as your schema grows.

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return rows[0] ?? null;
}

export async function setUserPassword(userId: number, passwordHash: string) {
  const db = await getDb();
  if (!db) return;
  await db.update(schema.users).set({ passwordHash }).where(eq(users.id, userId));
}

export async function runMigrations() {
  const db = await getDb();
  if (!db) return;
  try {
    // Add passwordHash column if it doesn't exist
    await db.execute(`ALTER TABLE users ADD COLUMN IF NOT EXISTS passwordHash varchar(255)`);
    console.log("[DB] Migrations completed ✅");
  } catch (error) {
    console.warn("[DB] Migration warning:", error);
  }
}
