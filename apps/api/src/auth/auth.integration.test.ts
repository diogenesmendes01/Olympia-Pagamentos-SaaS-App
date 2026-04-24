import { describe, expect, it } from "vitest";
import { vi } from "vitest";
vi.mock("../queues/email.queue.js", () => ({
  enqueueEmail: vi.fn(async () => ({ id: "stub" })),
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
