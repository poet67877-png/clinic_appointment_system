import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { SignJWT } from "jose";
import { nanoid } from "nanoid";
import { createHash } from "crypto";

const getJwtSecret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET || "clinic-plus-secret-key-2024"
  );

function hashPassword(password: string): string {
  return createHash("sha256")
    .update(password + "clinicplus_2024_salt")
    .digest("hex");
}

export const emailAuthRouter = router({
  register: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "قاعدة البيانات غير متاحة",
        });

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (existing.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "البريد الإلكتروني مستخدم بالفعل",
        });
      }

      const passwordHash = hashPassword(input.password);
      // Store password hash encoded in loginMethod field temporarily
      // Format: "email:HASH"
      const loginMethodWithHash = `email:${passwordHash}`;
      const openId = `email_${nanoid()}`;

      await db.insert(users).values({
        openId,
        email: input.email,
        name: input.name,
        loginMethod: loginMethodWithHash,
        role: "user",
        lastSignedIn: new Date(),
      });

      const insertedUser = await db
        .select()
        .from(users)
        .where(eq(users.openId, openId))
        .limit(1);

      if (!insertedUser[0])
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const token = await new SignJWT({ openId, userId: insertedUser[0].id })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1y")
        .sign(getJwtSecret());

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, user: { ...insertedUser[0], loginMethod: "email" } };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "قاعدة البيانات غير متاحة",
        });

      const userList = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);

      if (userList.length === 0) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }

      const user = userList[0];

      // Verify password
      if (!user.loginMethod || !user.loginMethod.startsWith("email:")) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "هذا الحساب لا يدعم تسجيل الدخول بالبريد الإلكتروني",
        });
      }

      const storedHash = user.loginMethod.split(":")[1];
      const inputHash = hashPassword(input.password);

      if (storedHash !== inputHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "البريد الإلكتروني أو كلمة المرور غير صحيحة",
        });
      }

      await db
        .update(users)
        .set({ lastSignedIn: new Date() })
        .where(eq(users.id, user.id));

      const token = await new SignJWT({
        openId: user.openId,
        userId: user.id,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("1y")
        .sign(getJwtSecret());

      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      return { success: true, user: { ...user, loginMethod: "email" } };
    }),
});
