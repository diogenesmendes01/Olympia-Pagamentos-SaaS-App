import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import { config } from "./config.js";
import { logger } from "./lib/logger.js";
import { healthRoutes } from "./modules/health/routes.js";
import { organizationRoutes } from "./modules/organizations/routes.js";
import { invitationRoutes } from "./modules/invitations/routes.js";
import { authPlugin } from "./auth/plugin.js";

export function buildApp() {
  const app = Fastify({ loggerInstance: logger });

  app.register(cors, {
    origin: config.WEB_ORIGIN,
    credentials: true,
  });

  // Rate limit global modesto: protege contra burst geral. Endpoints
  // sensíveis de auth recebem limites mais agressivos abaixo via override
  // do `keyGenerator` no roteador do Better Auth (handled per-request por
  // path matching dentro do plugin de rate-limit).
  // Em test/development, desabilita pra não fritar test runs e dev hot-reload.
  app.register(rateLimit, {
    global: config.NODE_ENV === "production",
    max: 300, // 300 req/min/IP no global (alto pra não falsear UX normal)
    timeWindow: "1 minute",
    allowList: ["127.0.0.1", "::1"],
    // Endpoints específicos: brute-force-prone do BA. Limites baseados em
    // OWASP rate-limit cheat sheet — agressivo o suficiente pra impedir
    // dictionary attack mas permissivo pra digitação humana errada.
    nameSpace: "olympia-rl-",
    skipOnError: true, // se Redis cair, não bloqueia API; só perde rate limit
  });

  // Aplica rate limit estrito nas rotas de auth via hook global. O
  // path matcher cobre o subset de endpoints do Better Auth que aceita
  // password/credential — sign-in, sign-up, reset, magic-link.
  app.addHook("onRoute", (routeOpts) => {
    const url = routeOpts.url;
    const isAuthMutation =
      typeof url === "string" &&
      (url.startsWith("/api/auth/sign-in") ||
        url.startsWith("/api/auth/sign-up") ||
        url.startsWith("/api/auth/forget-password") ||
        url.startsWith("/api/auth/request-password-reset") ||
        url.startsWith("/api/auth/reset-password") ||
        url.startsWith("/api/auth/sign-in/magic-link") ||
        url.startsWith("/api/auth/magic-link"));
    if (!isAuthMutation) return;
    routeOpts.config = {
      ...routeOpts.config,
      rateLimit: {
        max: 10, // 10 tentativas/IP/15min em endpoints sensíveis
        timeWindow: "15 minutes",
      },
    };
  });

  app.register(authPlugin);
  app.register(healthRoutes);
  app.register(organizationRoutes);
  app.register(invitationRoutes);

  return app;
}
