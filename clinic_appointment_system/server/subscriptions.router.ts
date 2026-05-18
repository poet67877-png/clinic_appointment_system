import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { subscriptions, invoices, payments, plans, clinics } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const subscriptionsRouter = router({
  // Get clinic subscription
  getSubscription: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.clinicId, input.clinicId))
        .limit(1);

      if (!subscription.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Get plan details
      const plan = await db
        .select()
        .from(plans)
        .where(eq(plans.id, subscription[0].planId))
        .limit(1);

      return {
        subscription: subscription[0],
        plan: plan[0],
      };
    }),

  // Create trial subscription (called on clinic registration)
  createTrialSubscription: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Get free plan
      const freePlan = await db
        .select()
        .from(plans)
        .where(eq(plans.name, "مجاني"))
        .limit(1);

      if (!freePlan.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Free plan not found" });
      }

      const now = new Date();
      const trialEndDate = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days

      await db.insert(subscriptions).values({
        clinicId: input.clinicId,
        planId: freePlan[0].id,
        status: "trial",
        trialStartDate: now,
        trialEndDate,
      });

      return { success: true };
    }),

  // Upgrade plan
  upgradePlan: protectedProcedure
    .input(z.object({ clinicId: z.number(), planId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.clinicId, input.clinicId))
        .limit(1);

      if (!subscription.length) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      // Update subscription
      await db
        .update(subscriptions)
        .set({
          planId: input.planId,
          status: "active",
          subscriptionStartDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(subscriptions.clinicId, input.clinicId));

      return { success: true };
    }),

  // Get invoices
  getInvoices: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const clinicInvoices = await db
        .select()
        .from(invoices)
        .where(eq(invoices.clinicId, input.clinicId));

      return clinicInvoices;
    }),

  // Create invoice
  createInvoice: protectedProcedure
    .input(
      z.object({
        clinicId: z.number(),
        subscriptionId: z.number(),
        amount: z.number(),
        dueDate: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const invoiceNumber = `INV-${Date.now()}`;

      const result = await db.insert(invoices).values({
        clinicId: input.clinicId,
        subscriptionId: input.subscriptionId,
        invoiceNumber,
        amount: input.amount,
        currency: "IQD",
        status: "sent",
        issueDate: new Date(),
        dueDate: input.dueDate,
      });

      return { success: true, invoiceNumber };
    }),

  // Record payment
  recordPayment: protectedProcedure
    .input(
      z.object({
        invoiceId: z.number(),
        clinicId: z.number(),
        amount: z.number(),
        paymentMethod: z.enum(["bank_transfer", "cash", "check"]),
        transactionId: z.string().optional(),
        bankName: z.string().optional(),
        accountNumber: z.string().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Create payment record
      await db.insert(payments).values({
        invoiceId: input.invoiceId,
        clinicId: input.clinicId,
        amount: input.amount,
        paymentMethod: input.paymentMethod,
        transactionId: input.transactionId,
        bankName: input.bankName,
        accountNumber: input.accountNumber,
        notes: input.notes,
        status: "confirmed",
      });

      // Update invoice status
      await db
        .update(invoices)
        .set({
          status: "paid",
          paidDate: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(invoices.id, input.invoiceId));

      return { success: true };
    }),

  // Get payments
  getPayments: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const clinicPayments = await db
        .select()
        .from(payments)
        .where(eq(payments.clinicId, input.clinicId));

      return clinicPayments;
    }),

  // Check trial status
  checkTrialStatus: protectedProcedure
    .input(z.object({ clinicId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const subscription = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.clinicId, input.clinicId))
        .limit(1);

      if (!subscription.length) {
        return { isTrialActive: false, daysRemaining: 0 };
      }

      const now = new Date();
      const isTrialActive =
        subscription[0].status === "trial" && now < subscription[0].trialEndDate;

      const daysRemaining = isTrialActive
        ? Math.ceil(
            (subscription[0].trialEndDate.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      return {
        isTrialActive,
        daysRemaining,
        trialEndDate: subscription[0].trialEndDate,
      };
    }),
});

export type SubscriptionsRouter = typeof subscriptionsRouter;
