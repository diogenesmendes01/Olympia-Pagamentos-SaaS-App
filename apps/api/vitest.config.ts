import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["./src/test/global-setup.ts"],
    setupFiles: ["./src/test/setup.ts"],
    testTimeout: 15000,
    hookTimeout: 30000,
    // Integration tests compartilham o mesmo banco postgres (DATABASE_URL).
    // Cada test file faz `resetDb()` em beforeEach via TRUNCATE CASCADE.
    // Se files rodam em paralelo (default vitest 4.x = forks pool),
    // workers truncam tabelas dos outros mid-flight → BA tenta criar
    // sessions contra users que acabaram de ser apagados →
    // "insert or update on table session violates foreign key
    // constraint session_user_id_user_id_fk".
    // Fix: serializar files com fileParallelism: false. Testes dentro
    // de um mesmo file continuam em série pelo default do vitest.
    fileParallelism: false,
  },
});
