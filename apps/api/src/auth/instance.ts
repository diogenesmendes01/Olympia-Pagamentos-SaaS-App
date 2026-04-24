import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { magicLink } from "better-auth/plugins";
import { db } from "../db/client.js";
import { config } from "../config.js";
import { enqueueEmail } from "../queues/email.queue.js";

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  secret: config.BETTER_AUTH_SECRET,
  baseURL: config.BETTER_AUTH_URL,
  trustedOrigins: [config.WEB_ORIGIN],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    sendResetPassword: async ({ user, url }) => {
      await enqueueEmail({
        type: "resetPassword",
        to: user.email,
        name: user.name,
        resetUrl: url,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await enqueueEmail({
        type: "verifyEmail",
        to: user.email,
        name: user.name,
        verifyUrl: url,
      });
    },
  },
  socialProviders: {
    ...(config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: config.GOOGLE_CLIENT_ID,
            clientSecret: config.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
    ...(config.MICROSOFT_CLIENT_ID && config.MICROSOFT_CLIENT_SECRET
      ? {
          microsoft: {
            clientId: config.MICROSOFT_CLIENT_ID,
            clientSecret: config.MICROSOFT_CLIENT_SECRET,
            tenantId: "common",
          },
        }
      : {}),
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await enqueueEmail({
          type: "magicLink",
          to: email,
          linkUrl: url,
        });
      },
    }),
  ],
  advanced: {
    cookiePrefix: "olympia",
    useSecureCookies: config.NODE_ENV === "production",
    defaultCookieAttributes: { sameSite: "lax" },
  },
});

export type Auth = typeof auth;
