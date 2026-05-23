import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Starting database seed...");

  const connection = await mysql.createConnection({
    host: process.env.MYSQLHOST || process.env.DB_HOST,
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER,
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD,
    database: process.env.MYSQLDATABASE || process.env.DB_NAME,
  });

  const db = drizzle(connection, { schema, mode: "default" });

  // Check if admin already exists
  const existing = await db
    .select()
    .from(schema.users)
    .limit(1);

  if (existing.length > 0) {
    console.log("⚠️  Database already has users — skipping seed");
    await connection.end();
    return;
  }

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  await db.insert(schema.users).values({
    name: "Admin",
    email: "admin@clinicplus.com",
    password: hashedPassword,
    role: "admin",
    phone: "+964-000-0000000",
    isActive: true,
  });

  // Create a sample doctor user
  const doctorPassword = await bcrypt.hash("doctor123", 10);
  const [doctorResult] = await db.insert(schema.users).values({
    name: "Dr. Ahmad Al-Rashid",
    email: "doctor@clinicplus.com",
    password: doctorPassword,
    role: "doctor",
    phone: "+964-770-1234567",
    isActive: true,
  });

  // Create doctor profile
  await db.insert(schema.doctors).values({
    userId: (doctorResult as any).insertId,
    specialization: "General Practice",
    licenseNumber: "IQ-MED-2024-001",
    bio: "Experienced general practitioner with 10 years of service.",
    consultationFee: 25000,
  });

  console.log("✅ Seed completed!");
  console.log("📋 Default accounts created:");
  console.log("   Admin  → admin@clinicplus.com  / admin123");
  console.log("   Doctor → doctor@clinicplus.com / doctor123");

  await connection.end();
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
