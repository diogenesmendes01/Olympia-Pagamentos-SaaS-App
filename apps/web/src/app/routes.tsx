import { createBrowserRouter, redirect } from "react-router";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { IntegrationsPage } from "./pages/IntegrationsPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { MagicLinkPage } from "./pages/MagicLinkPage";
import { OrgOnboardingPage } from "./pages/OrgOnboardingPage";
import { PayablesPage } from "./pages/PayablesPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ReceivablesPage } from "./pages/ReceivablesPage";
import { ReportsPage } from "./pages/ReportsPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { SettingsPage } from "./pages/SettingsPage";
import { SignupPage } from "./pages/SignupPage";
import { UsersPage } from "./pages/UsersPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";
import { RequireAuth } from "./guards/RequireAuth";
import { RequireSession } from "./guards/RequireSession";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", Component: LoginPage },
  { path: "/signup", Component: SignupPage },
  { path: "/verify-email", Component: VerifyEmailPage },
  { path: "/forgot-password", Component: ForgotPasswordPage },
  { path: "/reset-password", Component: ResetPasswordPage },
  { path: "/magic-link", Component: MagicLinkPage },
  {
    element: <RequireSession />,
    children: [
      { path: "/onboarding/organization", Component: OrgOnboardingPage },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        Component: MainLayout,
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
    ],
  },
  { path: "*", loader: () => redirect("/"), Component: () => null },
]);
