import { beforeEach } from "vitest";
import { pool } from "../db/client.js";
import { resetDb } from "../db/test-utils.js";

beforeEach(async () => {
  await resetDb();
});

process.on("beforeExit", async () => {
  await pool.end();
});
