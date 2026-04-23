import { createBrowserRouter, redirect } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ReceivablesPage } from "./pages/ReceivablesPage";
import { PayablesPage } from "./pages/PayablesPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { UsersPage } from "./pages/UsersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ProfilePage } from "./pages/ProfilePage";

const isAuthenticated = () => localStorage.getItem("olympia_auth") === "true";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  {
    path: "/login",
    Component: LoginPage,
    loader: () => {
      if (isAuthenticated()) return redirect("/dashboard");
      return null;
    },
  },
  {
    Component: MainLayout,
    loader: () => {
      if (!isAuthenticated()) return redirect("/login");
      return null;
    },
    children: [
      { path: "dashboard", Component: DashboardPage },
      { path: "receivables", Component: ReceivablesPage },
      { path: "payables", Component: PayablesPage },
      { path: "invoices", Component: InvoicesPage },
      { path: "users", Component: UsersPage },
      { path: "reports", Component: ReportsPage },
      { path: "integrations", Component: IntegrationsPage },
      { path: "settings", Component: SettingsPage },
      { path: "profile", Component: ProfilePage },
    ],
  },
  { path: "*", loader: () => redirect("/"), Component: () => null },
]);
