import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { clinicRouter } from "./clinic.router";
import { multitenantClinicRouter } from "./clinic-multitenant.router";
import { clinicRegistrationRouter } from "./clinic-registration.router";
import { doctorsMultitenantRouter } from "./doctors-multitenant.router";
import { clinicSettingsRouter } from "./clinic-settings.router";
import { subscriptionsRouter } from "./subscriptions.router";
import { adminRouter } from "./admin.router";
import { superadminRouter } from "./superadmin.router";
import { clinicCustomizationRouter } from "./clinic-customization.router";
import { emailAuthRouter } from "./email-auth.router";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
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
  emailAuth: emailAuthRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: emailAuthRouter.login,
    register: emailAuthRouter.register,
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
