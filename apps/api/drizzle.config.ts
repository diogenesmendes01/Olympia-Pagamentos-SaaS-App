import type { Config } from "drizzle-kit";

export default {
  // Lista explícita em vez de glob/diretório: drizzle-kit 0.28 carrega via CJS
  // `require` e engasga com o `index.ts` que re-exporta `./auth.js` (ESM/NodeNext).
  // Ao adicionar schemas novos, inclua o caminho aqui.
  schema: ["./src/db/schema/auth.ts", "./src/db/schema/organization.ts"],
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
} satisfies Config;
