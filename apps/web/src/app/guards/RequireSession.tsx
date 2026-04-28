import { Navigate, Outlet, useLocation } from "react-router";
import { useSession } from "../../lib/auth";

export function RequireSession() {
  const { data, isPending } = useSession();
  const location = useLocation();

  if (isPending) return <div className="p-8">Carregando...</div>;

  if (!data?.session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!data.user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return <Outlet />;
}
