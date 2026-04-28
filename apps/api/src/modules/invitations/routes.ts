import type { FastifyPluginAsync } from "fastify";
import { eq, and, gt } from "drizzle-orm";
import { db } from "../../db/client.js";
import { invitation } from "../../db/schema/organization.js";

export const invitationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/api/invitations/me", async (req, reply) => {
    // @ts-expect-error — decorated via authPlugin
    const session = req.auth;
    if (!session?.user?.email) {
      return reply.code(401).send({ error: "unauthorized" });
    }

    // Fallback Drizzle: lista invites pendentes pro email do user logado.
    // Evita depender de auth.api.listUserInvitations — cuja disponibilidade
    // runtime não conseguimos verificar no modo "só código".
    const invites = await db
      .select()
      .from(invitation)
      .where(
        and(
          eq(invitation.email, session.user.email),
          eq(invitation.status, "pending"),
          gt(invitation.expiresAt, new Date()),
        ),
      );

    return reply.send(invites);
  });
};
