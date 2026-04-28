import { pool } from "./client.js";

const TABLES_TO_TRUNCATE = [
  "invitation",
  "member",
  "organization",
  "session",
  "account",
  "verification",
  "user",
];

export async function resetDb() {
  const tables = TABLES_TO_TRUNCATE.map((t) => `"${t}"`).join(", ");
  await pool.query(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
}
