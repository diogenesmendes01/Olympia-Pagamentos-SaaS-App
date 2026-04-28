import type { FastifyPluginAsync } from "fastify";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/health", async () => ({ status: "ok" }));

  app.get("/ready", async (req, reply) => {
    // placeholder — checagens reais (pg + redis) na Task C1/D1
    return reply.send({ status: "ok", db: "pending", redis: "pending" });
  });
};
