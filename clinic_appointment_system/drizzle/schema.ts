import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, date, time, boolean, index, unique } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "superadmin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Plans table - subscription plans
export const plans = mysqlTable("plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: int("price").notNull(), // in cents
  maxDoctors: int("maxDoctors").default(5).notNull(),
  maxAppointmentsPerMonth: int("maxAppointmentsPerMonth").default(1000).notNull(),
  features: text("features"), // JSON string
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Plan = typeof plans.$inferSelect;
export type InsertPlan = typeof plans.$inferInsert;

// Clinics table - each clinic is a separate tenant
export const clinics = mysqlTable("clinics", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  subdomain: varchar("subdomain", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  address: text("address"),
  logo: varchar("logo", { length: 500 }),
  description: text("description"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#3b82f6").notNull(),
  secondaryColor: varchar("secondaryColor", { length: 7 }).default("#06b6d4").notNull(),
  coverImage: varchar("coverImage", { length: 500 }),
  whatsappNumber: varchar("whatsappNumber", { length: 20 }),
  ownerId: int("ownerId").notNull(),
  planId: int("planId").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  subdomainIdx: index("subdomain_idx").on(table.subdomain),
  slugIdx: index("slug_idx").on(table.slug),
  ownerIdx: index("clinic_owner_idx").on(table.ownerId),
}));

export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = typeof clinics.$inferInsert;

// Clinic Users - relationship between users and clinics
export const userClinicRole = mysqlEnum("userClinicRole", ["owner", "admin", "staff"]);

export const clinicUsers = mysqlTable("clinic_users", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  clinicId: int("clinicId").notNull(),
  role: userClinicRole.default("staff").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userClinicIdx: unique("user_clinic_unique").on(table.userId, table.clinicId),
  clinicIdx: index("clinic_users_clinic_idx").on(table.clinicId),
  userIdx: index("clinic_users_user_idx").on(table.userId),
}));

export type ClinicUser = typeof clinicUsers.$inferSelect;
export type InsertClinicUser = typeof clinicUsers.$inferInsert;

// Doctors table - with clinicId for multi-tenant
export const doctors = mysqlTable("doctors", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdx: index("doctors_clinic_idx").on(table.clinicId),
}));

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

// Available time slots for doctors - with clinicId
export const doctorTimeSlots = mysqlTable("doctor_time_slots", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  doctorId: int("doctorId").notNull(),
  dayOfWeek: int("dayOfWeek").notNull(), // 0-6 (Sunday-Saturday)
  startTime: time("startTime").notNull(),
  endTime: time("endTime").notNull(),
  slotDurationMinutes: int("slotDurationMinutes").default(30).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdx: index("slots_clinic_idx").on(table.clinicId),
  doctorIdx: index("slots_doctor_idx").on(table.doctorId),
}));

export type DoctorTimeSlot = typeof doctorTimeSlots.$inferSelect;
export type InsertDoctorTimeSlot = typeof doctorTimeSlots.$inferInsert;

// Appointments table - with clinicId for multi-tenant
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  confirmationCode: varchar("confirmationCode", { length: 20 }).notNull().unique(),
  doctorId: int("doctorId").notNull(),
  patientName: varchar("patientName", { length: 255 }).notNull(),
  patientPhone: varchar("patientPhone", { length: 20 }).notNull(),
  appointmentDate: date("appointmentDate").notNull(),
  appointmentTime: time("appointmentTime").notNull(),
  status: mysqlEnum("status", ["معلق", "مؤكد", "ملغى"]).default("معلق").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdx: index("appointments_clinic_idx").on(table.clinicId),
  phoneIdx: index("appointments_phone_idx").on(table.patientPhone),
  dateIdx: index("appointments_date_idx").on(table.appointmentDate),
}));

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;


// Subscriptions table - track clinic subscriptions
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull().unique(),
  planId: int("planId").notNull(),
  status: mysqlEnum("subscriptionStatus", ["trial", "active", "paused", "cancelled"]).default("trial").notNull(),
  trialStartDate: timestamp("trialStartDate").notNull(),
  trialEndDate: timestamp("trialEndDate").notNull(),
  subscriptionStartDate: timestamp("subscriptionStartDate"),
  subscriptionEndDate: timestamp("subscriptionEndDate"),
  autoRenew: boolean("autoRenew").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdx: index("subscriptions_clinic_idx").on(table.clinicId),
  planIdx: index("subscriptions_plan_idx").on(table.planId),
}));

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// Invoices table - billing records
export const invoices = mysqlTable("invoices", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  subscriptionId: int("subscriptionId").notNull(),
  invoiceNumber: varchar("invoiceNumber", { length: 50 }).notNull().unique(),
  amount: int("amount").notNull(), // in cents
  currency: varchar("currency", { length: 3 }).default("IQD").notNull(),
  status: mysqlEnum("invoiceStatus", ["draft", "sent", "paid", "overdue", "cancelled"]).default("draft").notNull(),
  issueDate: timestamp("issueDate").notNull(),
  dueDate: timestamp("dueDate").notNull(),
  paidDate: timestamp("paidDate"),
  bankDetails: text("bankDetails"), // JSON with bank transfer info
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdx: index("invoices_clinic_idx").on(table.clinicId),
  statusIdx: index("invoices_status_idx").on(table.status),
  dueDateIdx: index("invoices_due_date_idx").on(table.dueDate),
}));

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = typeof invoices.$inferInsert;

// Payments table - track payment records
export const payments = mysqlTable("payments", {
  id: int("id").autoincrement().primaryKey(),
  invoiceId: int("invoiceId").notNull(),
  clinicId: int("clinicId").notNull(),
  amount: int("amount").notNull(), // in cents
  paymentMethod: mysqlEnum("paymentMethod", ["bank_transfer", "cash", "check"]).notNull(),
  transactionId: varchar("transactionId", { length: 100 }),
  bankName: varchar("bankName", { length: 255 }),
  accountNumber: varchar("accountNumber", { length: 50 }),
  notes: text("notes"),
  status: mysqlEnum("paymentStatus", ["pending", "confirmed", "failed"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  invoiceIdx: index("payments_invoice_idx").on(table.invoiceId),
  clinicIdx: index("payments_clinic_idx").on(table.clinicId),
  statusIdx: index("payments_status_idx").on(table.status),
}));

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;

// Bank Accounts table - clinic bank details for receiving payments
export const bankAccounts = mysqlTable("bank_accounts", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  bankName: varchar("bankName", { length: 255 }).notNull(),
  accountHolderName: varchar("accountHolderName", { length: 255 }).notNull(),
  accountNumber: varchar("accountNumber", { length: 50 }).notNull(),
  iban: varchar("iban", { length: 50 }),
  isDefault: boolean("isDefault").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdx: index("bank_accounts_clinic_idx").on(table.clinicId),
}));

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;


// Clinic Notes table - admin notes on clinics
export const clinicNotes = mysqlTable("clinic_notes", {
  id: int("id").autoincrement().primaryKey(),
  clinicId: int("clinicId").notNull(),
  adminId: int("adminId").notNull(),
  note: text("note").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  clinicIdx: index("clinic_notes_clinic_idx").on(table.clinicId),
  adminIdx: index("clinic_notes_admin_idx").on(table.adminId),
}));

export type ClinicNote = typeof clinicNotes.$inferSelect;
export type InsertClinicNote = typeof clinicNotes.$inferInsert;
