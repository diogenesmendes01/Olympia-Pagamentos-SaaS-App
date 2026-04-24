import { Redis as IORedis } from "ioredis";
import { config } from "../config.js";

export const redisConnection = new IORedis(config.REDIS_URL, {
  maxRetriesPerRequest: null,
});
