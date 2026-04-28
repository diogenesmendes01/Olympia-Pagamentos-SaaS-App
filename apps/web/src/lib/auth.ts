import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  magicLinkClient,
} from "better-auth/client/plugins";

// IMPORTANTE: NÃO passar `baseURL` aqui. Em better-auth 1.6.8, qualquer
// string truthy passa por `withPath` → `assertHasProtocol` → `new URL(value)`,
// e um caminho relativo como "/api/auth" lança `TypeError` que vira
// `BetterAuthError("Invalid base URL: ...")` no carregamento do módulo.
// Sem `baseURL` o client cai no fallback `window.location.origin + "/api/auth"`,
// que é exatamente o que queremos pra deploy same-origin (Coolify) e dev (Vite
// proxy de /api). Pra ambientes de origem diferente, definir a env do BA
// (BETTER_AUTH_URL / VITE_BETTER_AUTH_URL) ou estender este client com URL
// absoluta antes do build.
export const authClient = createAuthClient({
  plugins: [organizationClient(), magicLinkClient()],
});

export const { useSession, signIn, signOut, signUp } = authClient;
export const organization = authClient.organization;
