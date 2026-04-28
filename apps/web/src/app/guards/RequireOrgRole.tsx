import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";
import { authClient, useSession } from "../../lib/auth";

type OrgRole = "owner" | "admin" | "member";

const KNOWN_ROLES: readonly OrgRole[] = ["owner", "admin", "member"];

function isOrgRole(value: string): value is OrgRole {
  return (KNOWN_ROLES as readonly string[]).includes(value);
}

interface MemberRolesState {
  orgId: string;
  status: "ok" | "error";
  roles: OrgRole[];
}

export function RequireOrgRole({
  roles = ["owner", "admin"],
}: {
  roles?: OrgRole[];
}) {
  const { data, isPending } = useSession();
  const activeOrgId = data?.session?.activeOrganizationId;
  const [memberState, setMemberState] = useState<MemberRolesState | null>(null);

  useEffect(() => {
    // Sem org ativa: não dispara fetch — o render handler abaixo já redireciona.
    if (!activeOrgId) {
      return;
    }
    let cancelled = false;
    authClient.organization
      .getActiveMember()
      .then(({ data: member, error }) => {
        if (cancelled) return;
        if (error || !member) {
          setMemberState({ orgId: activeOrgId, status: "error", roles: [] });
          return;
        }
        // BA armazena múltiplos roles como CSV ("admin,member"). Parse e
        // checa interseção, não igualdade direta.
        const rawRole: unknown = member.role;
        const parsed: OrgRole[] =
          typeof rawRole === "string"
            ? rawRole
                .split(",")
                .map((r) => r.trim())
                .filter(isOrgRole)
            : [];
        setMemberState({ orgId: activeOrgId, status: "ok", roles: parsed });
      })
      .catch(() => {
        if (cancelled) return;
        setMemberState({ orgId: activeOrgId, status: "error", roles: [] });
      });
    return () => {
      cancelled = true;
    };
  }, [activeOrgId]);

  if (isPending) {
    return <div className="p-8">Carregando...</div>;
  }
  if (!activeOrgId) {
    // Sem org ativa: deixa RequireAuth fazer o redirect pra /onboarding.
    return <Navigate to="/dashboard" replace />;
  }
  // Estado ainda não carregado, ou pertence a uma org anterior (após troca).
  if (memberState?.orgId !== activeOrgId) {
    return <div className="p-8">Carregando...</div>;
  }
  if (memberState.status === "error") {
    return <Navigate to="/dashboard" replace />;
  }
  const allowed = memberState.roles.some((r) => roles.includes(r));
  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
