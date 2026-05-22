import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import * as db from "./db";
import { sdk } from "./_core/sdk";
import { z } from "zod";
import * as crypto from "crypto";
import { clinicRouter } from "./clinic.router";
import { multitenantClinicRouter } from "./clinic-multitenant.router";
import { clinicRegistrationRouter } from "./clinic-registration.router";
import { doctorsMultitenantRouter } from "./doctors-multitenant.router";
import { clinicSettingsRouter } from "./clinic-settings.router";
import { subscriptionsRouter } from "./subscriptions.router";
import { adminRouter } from "./admin.router";
import { superadminRouter } from "./superadmin.router";
import { clinicCustomizationRouter } from "./clinic-customization.router";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  clinic: clinicRouter,
  multitenantClinic: multitenantClinicRouter,
  clinicRegistration: clinicRegistrationRouter,
  doctorsMultitenant: doctorsMultitenantRouter,
  clinicSettings: clinicSettingsRouter,
  subscriptions: subscriptionsRouter,
  admin: adminRouter,
  superadmin: superadminRouter,
  clinicCustomization: clinicCustomizationRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(6) }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        const hash = crypto.createHash("sha256").update(input.password).digest("hex");
        if (hash !== user.passwordHash) throw new Error("البريد الإلكتروني أو كلمة المرور غير صحيحة");
        const sessionToken = await sdk.createSessionToken(user.openId, { name: user.name || "", expiresInMs: ONE_YEAR_MS });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true };
      }),
    register: publicProcedure
      .input(z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6) }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) throw new Error("البريد الإلكتروني مستخدم بالفعل");
        const openId = crypto.randomUUID();
        const passwordHash = crypto.createHash("sha256").update(input.password).digest("hex");
        await db.upsertUser({ openId, name: input.name, email: input.email, loginMethod: "email", lastSignedIn: new Date() });
        const newUser = await db.getUserByEmail(input.email);
        if (!newUser) throw new Error("خطأ في إنشاء الحساب");
        await db.setUserPassword(newUser.id, passwordHash);
        const sessionToken = await sdk.createSessionToken(openId, { name: input.name, expiresInMs: ONE_YEAR_MS });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true };
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
