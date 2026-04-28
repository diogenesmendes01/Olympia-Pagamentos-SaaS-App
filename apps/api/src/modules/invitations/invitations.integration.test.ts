import { describe, expect, it, vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const capturedEmails: any[] = [];
vi.mock("../../queues/email.queue.js", () => ({
  enqueueEmail: vi.fn(async (job) => {
    capturedEmails.push(job);
    return { id: "stub" };
  }),
  emailQueue: { add: vi.fn() },
  EMAIL_QUEUE_NAME: "email",
}));

import { buildApp } from "../../app.js";

async function signupAndVerify(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app: any,
  email: string,
  password = "password123",
) {
  await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    payload: { name: email.split("@")[0], email, password },
  });
  const job = capturedEmails.find(
    (j) => j.type === "verifyEmail" && j.to === email,
  );
  const token = new URL(job!.verifyUrl).searchParams.get("token");
  await app.inject({
    method: "GET",
    url: `/api/auth/verify-email?token=${token}`,
  });
  const login = await app.inject({
    method: "POST",
    url: "/api/auth/sign-in/email",
    payload: { email, password },
  });
  const cookies = login.headers["set-cookie"] as string | string[];
  return Array.isArray(cookies) ? cookies.join("; ") : cookies;
}

describe("invitations", () => {
  it("owner convida → membro aceita → vira member", async () => {
    capturedEmails.length = 0;
    const app = buildApp();

    const ownerCookie = await signupAndVerify(app, "owner@test.com");
    const createOrg = await app.inject({
      method: "POST",
      url: "/api/auth/organization/create",
      headers: { cookie: ownerCookie },
      payload: { name: "Acme", slug: "acme" },
    });
    expect(createOrg.statusCode).toBe(200);

    const invite = await app.inject({
      method: "POST",
      url: "/api/auth/organization/invite-member",
      headers: { cookie: ownerCookie },
      payload: { email: "member@test.com", role: "member" },
    });
    expect(invite.statusCode).toBe(200);

    const inviteJob = capturedEmails.find((j) => j.type === "orgInvite");
    expect(inviteJob).toBeDefined();

    // inviteUrl segue o formato `${WEB_ORIGIN}/invitation/<id>` (path
    // segment), igual à rota registrada em apps/web/src/app/routes.tsx.
    // Extrai o id via pathname.
    const inviteId = new URL(inviteJob!.inviteUrl).pathname.split("/").pop();

    const memberCookie = await signupAndVerify(app, "member@test.com");
    const accept = await app.inject({
      method: "POST",
      url: `/api/auth/organization/accept-invitation`,
      headers: { cookie: memberCookie },
      payload: { invitationId: inviteId },
    });
    expect(accept.statusCode).toBe(200);

    await app.close();
  });
});
