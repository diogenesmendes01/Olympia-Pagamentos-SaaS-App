import { pool } from "./client.js";

const TABLES_TO_TRUNCATE = [
  "session",
  "account",
  "verification",
  "user",
  // Task F1 adiciona: "invitation", "member", "organization"
];

export async function resetDb() {
  const tables = TABLES_TO_TRUNCATE.map((t) => `"${t}"`).join(", ");
  await pool.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
}
