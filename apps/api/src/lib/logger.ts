import { pino } from "pino";
import { config } from "../config.js";

const isDev = config.NODE_ENV === "development";

export const logger = pino({
  level: config.LOG_LEVEL,
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "*.password",
      "*.secret",
      "*.token",
    ],
    censor: "[REDACTED]",
  },
  transport: isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true, singleLine: false },
      }
    : undefined,
});
