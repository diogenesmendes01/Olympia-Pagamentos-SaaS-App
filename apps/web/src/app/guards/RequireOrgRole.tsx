import { Navigate, Outlet } from "react-router";
import { useSession } from "../../lib/auth";

export function RequireOrgRole({
  roles = ["owner", "admin"],
}: {
  roles?: ("owner" | "admin" | "member")[];
}) {
  const { data } = useSession();
  // @ts-expect-error — activeOrganizationRole está na sessão do plugin
  const role = data?.session?.activeOrganizationRole;
  if (!role || !roles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
