import { TRPCError } from "@trpc/server";
import type { TrpcContext } from "./_core/context";
import { getDb } from "./db";
import { clinics, clinicUsers } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export async function extractClinicContext(req: TrpcContext["req"]): Promise<{
  clinicId: number | null;
  clinicSlug: string | null;
}> {
  const host = req.headers.host || "";
  const parts = host.split(".");

  // Ignore railway.app and localhost - not clinic subdomains
  const isRailway = host.includes("railway.app");
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  if (parts.length > 2 && !isRailway && !isLocalhost) {
    const subdomain = parts[0];
    const clinic = await getClinicBySubdomain(subdomain);
    if (clinic) {
      return { clinicId: clinic.id, clinicSlug: clinic.slug };
    }
  }

  return { clinicId: null, clinicSlug: null };
}

export async function getClinicBySubdomain(subdomain: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clinics).where(eq(clinics.subdomain, subdomain)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getClinicBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clinics).where(eq(clinics.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getClinicById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(clinics).where(eq(clinics.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function userHasClinicAccess(userId: number, clinicId: number) {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(clinicUsers).where(and(eq(clinicUsers.userId, userId), eq(clinicUsers.clinicId, clinicId))).limit(1);
  return result.length > 0;
}

export function ensureClinicContext(clinicId: number | null) {
  if (!clinicId) {
    throw new TRPCError({ code: "BAD_REQUEST", message: "Clinic context not found" });
  }
}

export async function ensureUserClinicAccess(userId: number, clinicId: number) {
  const hasAccess = await userHasClinicAccess(userId, clinicId);
  if (!hasAccess) {
    throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this clinic" });
  }
}

export async function isClinicOwner(userId: number, clinicId: number) {
  const clinic = await getClinicById(clinicId);
  if (!clinic) return false;
  return clinic.ownerId === userId;
}

export async function ensureClinicOwner(userId: number, clinicId: number) {
  const owner = await isClinicOwner(userId, clinicId);
  if (!owner) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Only clinic owner can perform this action" });
  }
}
