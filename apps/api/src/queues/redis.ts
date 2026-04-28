import { Redis as IORedis } from "ioredis";
import { config } from "../config.js";
import { logger } from "../lib/logger.js";

export const redisConnection = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on("error", (err) => {
  logger.error({ err }, "redis connection error");
});
