import { z } from "zod";

const schema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  LOG_LEVEL: z
    .enum(["trace", "debug", "info", "warn", "error", "fatal"])
    .default("info"),
  PORT: z.coerce.number().default(3000),

  DATABASE_URL: z.string().url(),
  DATABASE_URL_TEST: z.string().url().optional(),
  REDIS_URL: z.string().url(),

  BETTER_AUTH_SECRET: z.string().min(32, "Gere com: openssl rand -base64 32"),
  BETTER_AUTH_URL: z.string().url(),
  WEB_ORIGIN: z.string().url(),

  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().email(),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  MICROSOFT_CLIENT_ID: z.string().optional(),
  MICROSOFT_CLIENT_SECRET: z.string().optional(),

  BULL_BOARD_TOKEN: z.string().optional(),
});

const result = schema.safeParse(process.env);

if (!result.success) {
  console.error("❌ Config inválida:");
  console.error(result.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = result.data;
export type Config = typeof config;

export const hasGoogleSSO = Boolean(
  config.GOOGLE_CLIENT_ID && config.GOOGLE_CLIENT_SECRET,
);
export const hasMicrosoftSSO = Boolean(
  config.MICROSOFT_CLIENT_ID && config.MICROSOFT_CLIENT_SECRET,
);
