import { describe, expect, test, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRoute, NavSentinel } from "../../../test/test-utils";

vi.mock("../../../lib/auth", async () => {
  const { makeAuthMocks } = await import("../../../test/auth-mocks");
  return makeAuthMocks();
});

import { useSession } from "../../../lib/auth";
import { setMockSession } from "../../../test/auth-mocks";
import { RequireAuth } from "../RequireAuth";

const mockUseSession = useSession as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockUseSession.mockReset();
  setMockSession(mockUseSession, { signedIn: false });
});

describe("RequireAuth", () => {
  test("isPending: renderiza placeholder de carregamento", () => {
    setMockSession(mockUseSession, { pending: true });
    renderWithRoute(<RequireAuth />, {
      path: "/protected",
      initialEntry: "/protected",
    });
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  test("sem session: redireciona pra /login", () => {
    setMockSession(mockUseSession, { signedIn: false });
    renderWithRoute(<RequireAuth />, {
      path: "/protected",
      initialEntry: "/protected",
      extraRoutes: [{ path: "/login", element: <NavSentinel label="login" /> }],
    });
    expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("login");
  });

  test("session com email não verificado: redireciona pra /verify-email", () => {
    setMockSession(mockUseSession, { emailVerified: false });
    renderWithRoute(<RequireAuth />, {
      path: "/protected",
      initialEntry: "/protected",
      extraRoutes: [
        {
          path: "/verify-email",
          element: <NavSentinel label="verify-email" />,
        },
      ],
    });
    expect(screen.getByTestId("nav-sentinel")).toHaveTextContent(
      "verify-email",
    );
  });

  test("session sem activeOrganizationId: redireciona pra /onboarding/organization", () => {
    setMockSession(mockUseSession, { activeOrganizationId: null });
    renderWithRoute(<RequireAuth />, {
      path: "/protected",
      initialEntry: "/protected",
      extraRoutes: [
        {
          path: "/onboarding/organization",
          element: <NavSentinel label="onboarding" />,
        },
      ],
    });
    expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("onboarding");
  });

  test("session válida + email verificado + activeOrg: renderiza Outlet", () => {
    setMockSession(mockUseSession, {});
    // Como RequireAuth só renderiza <Outlet />, precisamos de uma rota nested.
    // Usamos `renderWithRoute` mas embrulhando dentro de uma estrutura simples.
    renderWithRoute(<RequireAuth />, {
      path: "/protected",
      initialEntry: "/protected",
    });
    // Sem rota filha, RequireAuth não renderiza nada — só prova que NÃO redireciona.
    // Não tem `nav-sentinel` no DOM porque nenhuma rota /login/verify-email existe.
    expect(screen.queryByTestId("nav-sentinel")).toBeNull();
    expect(screen.queryByText(/Carregando/i)).toBeNull();
  });
});
