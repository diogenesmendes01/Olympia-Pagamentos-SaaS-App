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

describe("organization members", () => {
  it("owner promove member → admin, depois remove", async () => {
    capturedEmails.length = 0;
    const app = buildApp();

    const ownerCookie = await signupAndVerify(app, "owner2@test.com");
    const createOrg = await app.inject({
      method: "POST",
      url: "/api/auth/organization/create",
      headers: { cookie: ownerCookie },
      payload: { name: "Beta", slug: "beta" },
    });
    const orgId = createOrg.json().id ?? createOrg.json().data?.id;

    await app.inject({
      method: "POST",
      url: "/api/auth/organization/invite-member",
      headers: { cookie: ownerCookie },
      payload: { email: "member2@test.com", role: "member" },
    });
    const inviteJob = capturedEmails.find((j) => j.type === "orgInvite");
    // F1 monta inviteUrl com ?id=<id> — extrair via searchParams
    const inviteId = new URL(inviteJob!.inviteUrl).searchParams.get("id");

    const memberCookie = await signupAndVerify(app, "member2@test.com");
    await app.inject({
      method: "POST",
      url: "/api/auth/organization/accept-invitation",
      headers: { cookie: memberCookie },
      payload: { invitationId: inviteId },
    });

    // descobre o memberId via listMembers
    const list = await app.inject({
      method: "GET",
      url: "/api/auth/organization/list-members",
      headers: { cookie: ownerCookie },
    });
    const members = list.json().data ?? list.json();
    const membro = members.find(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (m: any) => m.user?.email === "member2@test.com",
    );
    expect(membro).toBeDefined();

    // owner promove a admin
    const update = await app.inject({
      method: "POST",
      url: "/api/auth/organization/update-member-role",
      headers: { cookie: ownerCookie },
      payload: { memberId: membro.id, role: "admin", organizationId: orgId },
    });
    expect(update.statusCode).toBe(200);

    // owner remove
    const remove = await app.inject({
      method: "POST",
      url: "/api/auth/organization/remove-member",
      headers: { cookie: ownerCookie },
      payload: { memberIdOrEmail: "member2@test.com", organizationId: orgId },
    });
    expect(remove.statusCode).toBe(200);

    await app.close();
  });

  it("member NÃO pode remover outro member", async () => {
    capturedEmails.length = 0;
    const app = buildApp();

    const ownerCookie = await signupAndVerify(app, "owner3@test.com");
    const createOrg = await app.inject({
      method: "POST",
      url: "/api/auth/organization/create",
      headers: { cookie: ownerCookie },
      payload: { name: "Gamma", slug: "gamma" },
    });
    const orgId = createOrg.json().id ?? createOrg.json().data?.id;

    await app.inject({
      method: "POST",
      url: "/api/auth/organization/invite-member",
      headers: { cookie: ownerCookie },
      payload: { email: "membera@test.com", role: "member" },
    });
    const inviteA = capturedEmails.find(
      (j) => j.type === "orgInvite" && j.to === "membera@test.com",
    );
    const inviteAId = new URL(inviteA!.inviteUrl).searchParams.get("id");
    const memberACookie = await signupAndVerify(app, "membera@test.com");
    await app.inject({
      method: "POST",
      url: "/api/auth/organization/accept-invitation",
      headers: { cookie: memberACookie },
      payload: { invitationId: inviteAId },
    });

    const tryRemove = await app.inject({
      method: "POST",
      url: "/api/auth/organization/remove-member",
      headers: { cookie: memberACookie },
      payload: { memberIdOrEmail: "owner3@test.com", organizationId: orgId },
    });
    expect([401, 403]).toContain(tryRemove.statusCode);

    await app.close();
  });
});
