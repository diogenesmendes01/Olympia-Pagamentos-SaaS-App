import type { FastifyPluginAsync } from "fastify";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./instance.js";

export const authPlugin: FastifyPluginAsync = async (app) => {
  // Better Auth parseia o body por conta própria; evita double-parse por Fastify
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_req, body, done) => done(null, body),
  );

  app.all("/api/auth/*", async (req, reply) => {
    const url = new URL(
      req.url,
      `${req.protocol}://${req.headers.host ?? "localhost"}`,
    );
    const webRequest = new Request(url.toString(), {
      method: req.method,
      headers: fromNodeHeaders(req.headers),
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : (req.body as string | undefined),
    });

    const response = await auth.handler(webRequest);
    reply.status(response.status);
    response.headers.forEach((value, key) => reply.header(key, value));
    reply.send(await response.text());
  });

  app.decorateRequest("auth", null);
  app.addHook("preHandler", async (req) => {
    // Se getSession falhar (DB fora do ar, cookie inválido), seta null em vez
    // de 500 — health/ready/rotas públicas precisam continuar respondendo.
    try {
      const session = await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });
      // @ts-expect-error — decorated acima
      req.auth = session;
    } catch (err) {
      req.log.warn({ err }, "getSession falhou no preHandler");
      // @ts-expect-error — decorated acima
      req.auth = null;
    }
  });
};
