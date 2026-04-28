import { buildApp } from "./app.js";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";

async function main() {
  const app = buildApp();

  const shutdown = async (signal: string) => {
    logger.info({ signal }, "Shutting down");
    await app.close();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown("SIGINT"));
  process.on("SIGTERM", () => void shutdown("SIGTERM"));

  try {
    await app.listen({ port: config.PORT, host: "0.0.0.0" });
  } catch (err) {
    logger.error(err, "Failed to start");
    process.exit(1);
  }
}

void main();
