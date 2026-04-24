import { createAuthClient } from "better-auth/react";
import {
  organizationClient,
  magicLinkClient,
} from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "/api/auth",
  plugins: [organizationClient(), magicLinkClient()],
});

export const { useSession, signIn, signOut, signUp } = authClient;
export const organization = authClient.organization;
