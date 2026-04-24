import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Building2, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { organization, useSession } from "../../lib/auth";
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
  slug: string;
}

const C = {
  primary: PRIMARY,
  gold: GOLD,
  goldLight: "rgba(200,169,107,0.15)",
};

export function OrgSwitcher() {
  const { data } = useSession();
  const [orgs, setOrgs] = useState<Org[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Guard: só carrega orgs se o usuário tem sessão ativa.
    if (!data?.user) return;
    let cancelled = false;
    organization
      .list()
      .then((res) => {
        if (cancelled) return;
        if (res.error) {
          toast.error("Falha ao carregar organizações");
          return;
        }
        setOrgs(res.data ?? []);
      })
      .catch(() => {
        if (cancelled) return;
        toast.error("Falha ao carregar organizações");
      });
    return () => {
      cancelled = true;
    };
  }, [data?.user]);

  async function switchOrg(id: string) {
    try {
      const res = await organization.setActive({ organizationId: id });
      if (res.error) {
        toast.error("Falha ao trocar de organização");
        return;
      }
      // força refetch de tudo org-scoped (invoices, receivables, users, etc.)
      window.location.reload();
    } catch {
      toast.error("Falha ao trocar de organização");
    }
  }

  const activeOrgId = data?.session?.activeOrganizationId;
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
        {orgs.length === 0 ? (
          <DropdownMenuItem disabled>Nenhuma organização</DropdownMenuItem>
        ) : (
          orgs.map((o) => (
            <DropdownMenuItem
              key={o.id}
              onSelect={() => {
                void switchOrg(o.id);
              }}
              className={o.id === active?.id ? "font-bold" : ""}
            >
              <Building2 className="h-4 w-4" style={{ color: C.gold }} />
              <span className="truncate">{o.name}</span>
            </DropdownMenuItem>
          ))
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
