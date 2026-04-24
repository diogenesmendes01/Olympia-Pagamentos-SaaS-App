import { describe, expect, it } from "vitest";
import { buildApp } from "../app.js";

describe("auth — email/password", () => {
  it("signup + login + session", async () => {
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

    const login = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      payload: { email: "diogo@test.com", password: "password123" },
    });
    expect(login.statusCode).toBe(200);

    const cookie = login.headers["set-cookie"];
    expect(cookie).toBeDefined();

    const session = await app.inject({
      method: "GET",
      url: "/api/auth/get-session",
      headers: { cookie: Array.isArray(cookie) ? cookie.join("; ") : cookie! },
    });
    expect(session.statusCode).toBe(200);
    const body = session.json();
    expect(body.user.email).toBe("diogo@test.com");

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
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});
