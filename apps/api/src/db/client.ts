import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { config } from "../config.js";
import * as schema from "./schema/index.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.DATABASE_URL,
  max: 10,
});

export const db = drizzle(pool, { schema });

export type DB = typeof db;
