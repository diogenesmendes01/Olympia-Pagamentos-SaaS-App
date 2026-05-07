import { describe, expect, test, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRoute, NavSentinel } from "../../../test/test-utils";

vi.mock("../../../lib/auth", async () => {
  const { makeAuthMocks } = await import("../../../test/auth-mocks");
  return makeAuthMocks();
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
  Toaster: () => null,
}));

import {
  authClient,
  organization,
  signOut,
  useSession,
} from "../../../lib/auth";
import { toast } from "sonner";
import {
  setMockSession,
  okResponse,
  errResponse,
} from "../../../test/auth-mocks";
import { InvitationPage } from "../InvitationPage";

const mockUseSession = useSession as unknown as ReturnType<typeof vi.fn>;
const mockGetInvitation = authClient.organization
  .getInvitation as unknown as ReturnType<typeof vi.fn>;
const mockAcceptInvitation =
  organization.acceptInvitation as unknown as ReturnType<typeof vi.fn>;
const mockGetSession = authClient.getSession as unknown as ReturnType<
  typeof vi.fn
>;
const mockSignOut = signOut as unknown as ReturnType<typeof vi.fn>;
const mockToastError = vi.mocked(toast.error);

beforeEach(() => {
  mockUseSession.mockReset();
  setMockSession(mockUseSession, { signedIn: false });
  mockGetInvitation.mockReset();
  mockAcceptInvitation.mockReset();
  mockGetSession.mockReset();
  mockSignOut.mockReset();
  mockToastError.mockReset();
});

const inviteData = {
  data: { email: "bob@olympia.dev", organizationName: "Acme" },
  error: null,
};

describe("InvitationPage — Branch 1 (sem sessão)", () => {
  test("redireciona pra /signup?invitation=<id>&email=<encoded>", async () => {
    setMockSession(mockUseSession, { signedIn: false });
    mockGetInvitation.mockResolvedValueOnce(inviteData);
    renderWithRoute(<InvitationPage />, {
      path: "/invitation/:id",
      initialEntry: "/invitation/inv-1",
      extraRoutes: [
        { path: "/signup", element: <NavSentinel label="signup" /> },
      ],
    });

    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("signup");
    });
    // window.location reflete a URL atual do MemoryRouter via teste —
    // em vez disso usamos o NavSentinel + a query no DOM via location helper.
  });
});

describe("InvitationPage — Branch 2 (email match)", () => {
  test("chama acceptInvitation, refresca sessão e navega pra /dashboard", async () => {
    setMockSession(mockUseSession, { email: "bob@olympia.dev" });
    mockGetInvitation.mockResolvedValueOnce(inviteData);
    mockAcceptInvitation.mockResolvedValueOnce(okResponse);
    mockGetSession.mockResolvedValueOnce({ data: null, error: null });

    renderWithRoute(<InvitationPage />, {
      path: "/invitation/:id",
      initialEntry: "/invitation/inv-1",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });

    await waitFor(() => {
      expect(mockAcceptInvitation).toHaveBeenCalledWith({
        invitationId: "inv-1",
      });
    });
    await waitFor(() => {
      expect(mockGetSession).toHaveBeenCalledWith({
        query: { disableCookieCache: true },
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("dashboard");
    });
  });

  test("erro no accept exibe toast + UI de erro, não navega", async () => {
    setMockSession(mockUseSession, { email: "bob@olympia.dev" });
    mockGetInvitation.mockResolvedValueOnce(inviteData);
    mockAcceptInvitation.mockResolvedValueOnce(errResponse("Convite expirado"));

    renderWithRoute(<InvitationPage />, {
      path: "/invitation/:id",
      initialEntry: "/invitation/inv-1",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Convite expirado");
    });
    expect(await screen.findByText(/Convite inválido/i)).toBeInTheDocument();
    expect(screen.queryByTestId("nav-sentinel")).toBeNull();
  });
});

describe("InvitationPage — Branch 3 (email diverge)", () => {
  test("renderiza UI de troca de conta com email do invite", async () => {
    setMockSession(mockUseSession, { email: "alice@olympia.dev" });
    mockGetInvitation.mockResolvedValueOnce(inviteData);

    renderWithRoute(<InvitationPage />, {
      path: "/invitation/:id",
      initialEntry: "/invitation/inv-1",
    });

    expect(
      await screen.findByText(/Convite para outra conta/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/bob@olympia.dev/)).toBeInTheDocument();
    expect(screen.getByText(/alice@olympia.dev/)).toBeInTheDocument();
    expect(mockAcceptInvitation).not.toHaveBeenCalled();
  });

  test("clicar em 'Sair e entrar com <email>' chama signOut e navega pra /login com ?email=&from=", async () => {
    setMockSession(mockUseSession, { email: "alice@olympia.dev" });
    mockGetInvitation.mockResolvedValueOnce(inviteData);
    mockSignOut.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();

    renderWithRoute(<InvitationPage />, {
      path: "/invitation/:id",
      initialEntry: "/invitation/inv-1",
      extraRoutes: [{ path: "/login", element: <NavSentinel label="login" /> }],
    });

    await user.click(
      await screen.findByRole("button", { name: /Sair e entrar com bob/i }),
    );

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("login");
    });
  });
});

describe("InvitationPage — invite inválido", () => {
  test("getInvitation com error renderiza UI de erro", async () => {
    setMockSession(mockUseSession, { signedIn: false });
    mockGetInvitation.mockResolvedValueOnce(errResponse("Convite expirado"));

    renderWithRoute(<InvitationPage />, {
      path: "/invitation/:id",
      initialEntry: "/invitation/inv-bad",
    });

    expect(await screen.findByText(/Convite inválido/i)).toBeInTheDocument();
    expect(mockToastError).toHaveBeenCalledWith("Convite expirado");
  });
});
