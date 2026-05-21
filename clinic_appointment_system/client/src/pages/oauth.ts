import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // ✅ بدء OAuth login flow
  app.get("/api/oauth/login", (req: Request, res: Response) => {
    const host = req.get("host") ?? "";
    const protocol = req.headers["x-forwarded-proto"] ?? req.protocol;
    const redirectUri = `${protocol}://${host}/api/oauth/callback`;
    const state = Buffer.from(redirectUri).toString("base64");

    if (!ENV.oAuthServerUrl) {
      console.error("[OAuth] OAUTH_SERVER_URL is not set");
      res.status(500).json({ error: "OAuth server not configured" });
      return;
    }

    const oauthUrl =
      `${ENV.oAuthServerUrl}/oauth/authorize` +
      `?client_id=${encodeURIComponent(ENV.appId)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${encodeURIComponent(state)}` +
      `&response_type=code`;

    console.log("[OAuth] Redirecting to:", oauthUrl);
    res.redirect(302, oauthUrl);
  });

  // ✅ OAuth callback — لا تغيير
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.redirect(302, "/dashboard");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
