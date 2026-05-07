import { QueryClient } from "@tanstack/react-query";

// Defaults conservadores: 30s staleTime evita re-fetches em renders
// rápidos sem deixar dados envelhecerem. Mutations não retentam — erro
// de mutation é tratado por caller (toast.error). Queries retentam 1x
// pra absorver glitches de rede sem ficar agressivo.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

// Convenção de query keys org-scoped: `["org", activeOrgId, <resource>]`.
// O OrgSwitcher invalida tudo que não é session; manter o prefixo "org"
// nessas keys facilita filtros explícitos quando necessário.
export const queryKeys = {
  orgList: () => ["org-list"] as const,
  orgMembers: (orgId: string | null | undefined) =>
    ["org", orgId, "members"] as const,
  orgInvitations: (orgId: string | null | undefined) =>
    ["org", orgId, "invitations"] as const,
};
