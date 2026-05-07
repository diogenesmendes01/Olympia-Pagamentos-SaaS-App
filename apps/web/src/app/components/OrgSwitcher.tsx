import { useNavigate } from "react-router";
import { Building2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { organization, useSession } from "../../lib/auth";
import { queryKeys } from "../../lib/queryClient";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { PRIMARY, GOLD } from "../styles/tokens";

interface Org {
  id: string;
  name: string;
}

const C = {
  primary: PRIMARY,
  gold: GOLD,
  goldLight: "rgba(200,169,107,0.15)",
};

export function OrgSwitcher() {
  const { data: sessionData } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // org-list é uma query separada (não é org-scoped) porque mostra TODAS as
  // orgs do user. Não invalidamos junto na troca de org pra evitar refetch
  // desnecessário (lista de orgs do user não muda quando ele troca a ativa).
  const { data: orgs = [], isPending: loading } = useQuery<Org[]>({
    queryKey: queryKeys.orgList(),
    queryFn: async () => {
      const res = await organization.list();
      if (res.error) {
        toast.error("Falha ao carregar organizações");
        throw new Error(res.error.message ?? "Falha ao carregar organizações");
      }
      return res.data ?? [];
    },
    enabled: !!sessionData?.user,
  });

  async function switchOrg(id: string) {
    try {
      const res = await organization.setActive({ organizationId: id });
      if (res.error) {
        toast.error("Falha ao trocar de organização");
        return;
      }
      // Invalida tudo que é org-scoped (chave começa com "org"). Mantém
      // session/org-list intactas — o useSession do BA já refresca via
      // cookie/cache, e org-list não muda só porque a ativa mudou.
      await queryClient.invalidateQueries({
        predicate: (q) => q.queryKey[0] === "org",
      });
    } catch {
      toast.error("Falha ao trocar de organização");
    }
  }

  const activeOrgId = sessionData?.session?.activeOrganizationId;
  const active = orgs.find((o) => o.id === activeOrgId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Alternar organização"
        className="flex items-center gap-2 rounded-xl py-1.5 pr-2 pl-3 transition-colors hover:bg-slate-50 focus:outline-none"
        style={{
          fontSize: 12.5,
          fontFamily: "'Inter', sans-serif",
          color: C.primary,
          fontWeight: 600,
        }}
      >
        <div
          className="flex h-6 w-6 items-center justify-center rounded-md"
          style={{
            background: C.goldLight,
            border: `1px solid rgba(200,169,107,0.3)`,
          }}
        >
          <Building2 style={{ width: 13, height: 13, color: C.gold }} />
        </div>
        <span className="hidden max-w-[140px] truncate sm:inline">
          {active?.name ?? "Organização"}
        </span>
        <ChevronDown className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {loading ? (
          <DropdownMenuItem disabled>Carregando...</DropdownMenuItem>
        ) : orgs.length === 0 ? (
          <DropdownMenuItem disabled>Nenhuma organização</DropdownMenuItem>
        ) : (
          orgs.map((o) => {
            const isActive = o.id === active?.id;
            return (
              <DropdownMenuItem
                key={o.id}
                onSelect={() => {
                  void switchOrg(o.id);
                }}
                aria-current={isActive ? "true" : undefined}
                className={isActive ? "font-bold" : ""}
              >
                <Building2 className="h-4 w-4" style={{ color: C.gold }} />
                <span className="truncate">{o.name}</span>
              </DropdownMenuItem>
            );
          })
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={() => {
            void navigate("/onboarding/organization?mode=additional");
          }}
        >
          + Criar nova organização
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
