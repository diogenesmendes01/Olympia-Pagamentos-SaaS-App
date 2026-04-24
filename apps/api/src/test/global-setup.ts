import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { pool } from "../db/client.js";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export async function setup() {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_TEST ??
    "postgresql://olympia:olympia@localhost:5432/olympia_test";
  execSync("pnpm db:migrate", {
    stdio: "inherit",
    cwd: apiRoot,
    env: { ...process.env },
  });
}

export async function teardown() {
  await pool.end();
}
