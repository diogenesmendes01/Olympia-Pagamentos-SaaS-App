import { describe, expect, test, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithRoute, NavSentinel } from "../../../test/test-utils";

vi.mock("../../../lib/auth", async () => {
  const { makeAuthMocks } = await import("../../../test/auth-mocks");
  return makeAuthMocks();
});

import { authClient, useSession } from "../../../lib/auth";
import { setMockSession } from "../../../test/auth-mocks";
import { RequireOrgRole } from "../RequireOrgRole";

const mockUseSession = useSession as unknown as ReturnType<typeof vi.fn>;
const mockGetActiveMember = authClient.organization
  .getActiveMember as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockUseSession.mockReset();
  setMockSession(mockUseSession, { signedIn: false });
  mockGetActiveMember.mockReset();
});

describe("RequireOrgRole", () => {
  test("isPending: placeholder", () => {
    setMockSession(mockUseSession, { pending: true });
    renderWithRoute(<RequireOrgRole roles={["owner", "admin"]} />, {
      path: "/users",
      initialEntry: "/users",
    });
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  test("sem activeOrgId: redireciona pra /dashboard", () => {
    setMockSession(mockUseSession, { activeOrganizationId: null });
    renderWithRoute(<RequireOrgRole roles={["owner", "admin"]} />, {
      path: "/users",
      initialEntry: "/users",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });
    expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("dashboard");
  });

  test("getActiveMember error: redireciona pra /dashboard", async () => {
    setMockSession(mockUseSession, {});
    mockGetActiveMember.mockResolvedValueOnce({
      data: null,
      error: { message: "boom" },
    });
    renderWithRoute(<RequireOrgRole roles={["owner", "admin"]} />, {
      path: "/users",
      initialEntry: "/users",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("dashboard");
    });
  });

  test("role 'admin' permite acesso quando roles=['owner','admin']", async () => {
    setMockSession(mockUseSession, {});
    mockGetActiveMember.mockResolvedValueOnce({
      data: { role: "admin", id: "m1", userId: "u1", organizationId: "org-1" },
      error: null,
    });
    renderWithRoute(<RequireOrgRole roles={["owner", "admin"]} />, {
      path: "/users",
      initialEntry: "/users",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });
    await waitFor(() => {
      expect(mockGetActiveMember).toHaveBeenCalled();
    });
    // Sem rota filha — só prova que NÃO redirecionou pra /dashboard.
    await waitFor(() => {
      expect(screen.queryByTestId("nav-sentinel")).toBeNull();
    });
  });

  test("role 'member' NÃO permite acesso quando roles=['owner','admin']: redireciona", async () => {
    setMockSession(mockUseSession, {});
    mockGetActiveMember.mockResolvedValueOnce({
      data: { role: "member", id: "m1", userId: "u1", organizationId: "org-1" },
      error: null,
    });
    renderWithRoute(<RequireOrgRole roles={["owner", "admin"]} />, {
      path: "/users",
      initialEntry: "/users",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("dashboard");
    });
  });

  test("role CSV 'admin,member' faz parse e checa interseção corretamente", async () => {
    setMockSession(mockUseSession, {});
    mockGetActiveMember.mockResolvedValueOnce({
      data: {
        role: "admin,member",
        id: "m1",
        userId: "u1",
        organizationId: "org-1",
      },
      error: null,
    });
    renderWithRoute(<RequireOrgRole roles={["owner"]} />, {
      path: "/settings/organization",
      initialEntry: "/settings/organization",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });
    // Tem 'admin,member' mas precisa de 'owner' → redireciona
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("dashboard");
    });
  });

  test("role CSV inclui owner: permite acesso quando roles=['owner']", async () => {
    setMockSession(mockUseSession, {});
    mockGetActiveMember.mockResolvedValueOnce({
      data: {
        role: "owner,admin",
        id: "m1",
        userId: "u1",
        organizationId: "org-1",
      },
      error: null,
    });
    renderWithRoute(<RequireOrgRole roles={["owner"]} />, {
      path: "/settings/organization",
      initialEntry: "/settings/organization",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });
    await waitFor(() => {
      expect(mockGetActiveMember).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.queryByTestId("nav-sentinel")).toBeNull();
    });
  });
});
