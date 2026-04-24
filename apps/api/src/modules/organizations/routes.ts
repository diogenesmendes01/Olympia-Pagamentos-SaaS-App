import type { FastifyPluginAsync } from "fastify";

export const organizationRoutes: FastifyPluginAsync = async (app) => {
  // Placeholder — Better Auth organization plugin expõe /api/auth/organization/*
  // Endpoints agregadores/relatórios org-scoped virão na Fase 3.
  app.get("/api/organizations/_placeholder", async () => ({ ok: true }));
};
