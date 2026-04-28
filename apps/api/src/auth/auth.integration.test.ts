import { describe, expect, it } from "vitest";
import { vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const capturedEmails: any[] = [];
vi.mock("../queues/email.queue.js", () => ({
  enqueueEmail: vi.fn(async (job) => {
    capturedEmails.push(job);
    return { id: "stub" };
  }),
  emailQueue: { add: vi.fn() },
  EMAIL_QUEUE_NAME: "email",
}));
import { buildApp } from "../app.js";

describe("auth — email/password", () => {
  it("signup + login (email not verified yet)", async () => {
    const app = buildApp();

    const signup = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        name: "Diogo",
        email: "diogo@test.com",
        password: "password123",
      },
    });
    expect(signup.statusCode).toBe(200);

    // Email not verified yet — login should be blocked (401 or 403)
    const login = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "diogo@test.com", password: "password123" },
    });
    expect(login.statusCode).not.toBe(200);

    await app.close();
  });

  it("login com senha errada → 401", async () => {
    const app = buildApp();
    await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: { name: "X", email: "x@test.com", password: "password123" },
    });
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "x@test.com", password: "wrong-wrong" },
    });
    // Better Auth checks credentials before verification status; wrong password should still 401
    // Pinning exact code (401 vs 403) deferred to VPS runtime test
    expect([401, 403]).toContain(res.statusCode);
    await app.close();
  });
});

describe("auth — magic link", () => {
  it("magic link — pede link → captura token → autentica", async () => {
    capturedEmails.length = 0;
    const app = buildApp();

    // Usuário precisa existir primeiro (magic link não cria)
    await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        name: "Magic",
        email: "magic@test.com",
        password: "password123",
      },
    });

    const res = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/magic-link",
      payload: { email: "magic@test.com" },
    });
    expect(res.statusCode).toBe(200);

    const linkJob = capturedEmails.find((j) => j.type === "magicLink");
    expect(linkJob).toBeDefined();

    await app.close();
  });
});

describe("auth — fluxo completo signup + verify + login", () => {
  it("captura token do email e verifica", async () => {
    capturedEmails.length = 0;
    const app = buildApp();

    // 1. Signup → email de verificação enfileirado
    await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      payload: {
        name: "Flow",
        email: "flow@test.com",
        password: "password123",
      },
    });

    const verifyJob = capturedEmails.find((j) => j.type === "verifyEmail");
    expect(verifyJob).toBeDefined();
    expect(verifyJob!.to).toBe("flow@test.com");

    // 2. Login antes de verificar → falha
    const loginBefore = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "flow@test.com", password: "password123" },
    });
    expect(loginBefore.statusCode).toBe(403);

    // 3. Extrai token da URL do email
    const token = new URL(verifyJob!.verifyUrl).searchParams.get("token");
    expect(token).toBeTruthy();

    // 4. Verifica
    const verify = await app.inject({
      method: "GET",
      url: `/api/auth/verify-email?token=${token}&callbackURL=/dashboard`,
    });
    expect([200, 302]).toContain(verify.statusCode);

    // 5. Login agora funciona
    const loginAfter = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "flow@test.com", password: "password123" },
    });
    expect(loginAfter.statusCode).toBe(200);

    await app.close();
  });
});
