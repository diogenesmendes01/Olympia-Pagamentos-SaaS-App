import Fastify from "fastify";
import cors from "@fastify/cors";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./modules/health/routes.js";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
  });

  app.register(healthRoutes);

  return app;
}
