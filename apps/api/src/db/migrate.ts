import { migrate } from "drizzle-orm/node-postgres/migrator";
import { db, pool } from "./client.js";
import { logger } from "../lib/logger.js";

async function main() {
  logger.info("Rodando migrations...");
  await migrate(db, { migrationsFolder: "./src/db/migrations" });
  logger.info("Migrations OK");
  await pool.end();
}

main().catch((err) => {
  logger.error(err, "Migration falhou");
  process.exit(1);
});
