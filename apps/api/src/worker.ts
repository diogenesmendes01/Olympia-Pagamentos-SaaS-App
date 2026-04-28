import { createEmailWorker } from "./queues/email.worker.js";
import { redisConnection } from "./queues/redis.js";
import { logger } from "./lib/logger.js";

async function main() {
  const worker = createEmailWorker();
  logger.info("Email worker iniciado");

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down worker");
    await worker.close();
    await redisConnection.quit();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  worker.on("failed", (job, err) => {
    logger.error({ jobId: job?.id, err }, "Job falhou");
  });
}

void main();
