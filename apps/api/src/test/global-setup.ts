import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { pool } from "../db/client.js";

const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export async function setup() {
  // Aponta o DATABASE_URL pra DB de teste (com fallback). Tem que rodar
  // ANTES de qualquer import que feche o config — vitest globalSetup roda
  // num child process isolado, então mexer em process.env aqui não polui
  // os workers (eles re-leem env).
  process.env.DATABASE_URL =
    process.env.DATABASE_URL_TEST ??
    "postgresql://olympia:olympia@localhost:5432/olympia_test";

  // Em CI, o step `Migrate DB` no workflow já rodou `pnpm db:migrate`
  // antes de chamar vitest — pular pra evitar a chamada duplicada que
  // quebra o vitest (turbo + execSync paralelos disputam recursos).
  // Em dev local, faz a migration aqui pra garantir schema atualizado
  // antes dos integration tests rodarem.
  if (process.env.CI === "true") {
    return;
  }
  execSync("pnpm db:migrate", {
    stdio: "inherit",
    cwd: apiRoot,
    env: { ...process.env },
  });
}

export async function teardown() {
  await pool.end();
}
