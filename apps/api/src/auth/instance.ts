import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/client.js";
import { config } from "../config.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
  trustedOrigins: [config.WEB_ORIGIN],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // ativado na Task D5
    autoSignIn: true,
  },
  advanced: {
    cookiePrefix: "olympia",
    useSecureCookies: config.NODE_ENV === "production",
    defaultCookieAttributes: {
      sameSite: "lax",
    },
  },
});

export type Auth = typeof auth;
