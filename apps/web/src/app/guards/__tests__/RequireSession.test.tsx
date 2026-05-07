import { describe, expect, test, vi, beforeEach } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithRoute, NavSentinel } from "../../../test/test-utils";

vi.mock("../../../lib/auth", async () => {
  const { makeAuthMocks } = await import("../../../test/auth-mocks");
  return makeAuthMocks();
});

import { useSession } from "../../../lib/auth";
import { setMockSession } from "../../../test/auth-mocks";
import { RequireSession } from "../RequireSession";

const mockUseSession = useSession as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockUseSession.mockReset();
  setMockSession(mockUseSession, { signedIn: false });
});

describe("RequireSession", () => {
  test("isPending: placeholder", () => {
    setMockSession(mockUseSession, { pending: true });
    renderWithRoute(<RequireSession />, {
      path: "/onboarding/organization",
      initialEntry: "/onboarding/organization",
    });
    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  test("sem session: redireciona pra /login", () => {
    setMockSession(mockUseSession, { signedIn: false });
    renderWithRoute(<RequireSession />, {
      path: "/onboarding/organization",
      initialEntry: "/onboarding/organization",
      extraRoutes: [{ path: "/login", element: <NavSentinel label="login" /> }],
    });
    expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("login");
  });

  test("session com emailVerified=false: redireciona pra /verify-email", () => {
    setMockSession(mockUseSession, { emailVerified: false });
    renderWithRoute(<RequireSession />, {
      path: "/onboarding/organization",
      initialEntry: "/onboarding/organization",
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

  test("session válida + emailVerified=true: NÃO redireciona (mesmo sem activeOrg)", () => {
    setMockSession(mockUseSession, { activeOrganizationId: null });
    renderWithRoute(<RequireSession />, {
      path: "/onboarding/organization",
      initialEntry: "/onboarding/organization",
    });
    expect(screen.queryByTestId("nav-sentinel")).toBeNull();
    expect(screen.queryByText(/Carregando/i)).toBeNull();
  });
});
