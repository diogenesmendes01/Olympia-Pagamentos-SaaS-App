import { execSync } from "node:child_process";

export async function setup() {
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_TEST ??
    "postgresql://olympia:olympia@localhost:5432/olympia_test";
  execSync("pnpm db:migrate", {
    stdio: "inherit",
    env: { ...process.env },
  });
}
