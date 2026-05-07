import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
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

import { useSession } from "../../../lib/auth";
import { toast } from "sonner";
import { setMockSession } from "../../../test/auth-mocks";
import { VerifyEmailPage } from "../VerifyEmailPage";

const mockUseSession = useSession as unknown as ReturnType<typeof vi.fn>;
const mockToastError = vi.mocked(toast.error);

const fetchSpy = vi.spyOn(globalThis, "fetch");

beforeEach(() => {
  mockUseSession.mockReset();
  setMockSession(mockUseSession, { signedIn: false });
  mockToastError.mockReset();
  fetchSpy.mockReset();
  sessionStorage.clear();
});

afterEach(() => {
  sessionStorage.clear();
});

describe("VerifyEmailPage", () => {
  test("sem ?token= renderiza UI idle com form de reenvio", () => {
    renderWithRoute(<VerifyEmailPage />, {
      path: "/verify-email",
      initialEntry: "/verify-email",
    });

    expect(
      screen.getByText(/Enviamos um link pro seu email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Reenviar/i }),
    ).toBeInTheDocument();
  });

  test("?token=<x> dispara fetch e navega pro callback /dashboard quando ok", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));
    renderWithRoute(<VerifyEmailPage />, {
      path: "/verify-email",
      initialEntry: "/verify-email?token=abc123",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/auth/verify-email?token=abc123&callbackURL=%2Fdashboard",
        expect.objectContaining({ credentials: "include" }),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("dashboard");
    });
  });

  test("?token= com pending invitation no sessionStorage navega pra /invitation/<id> e limpa storage", async () => {
    sessionStorage.setItem("olympia_pending_invitation", "inv-42");
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));
    renderWithRoute(<VerifyEmailPage />, {
      path: "/verify-email",
      initialEntry: "/verify-email?token=abc123",
      extraRoutes: [
        {
          path: "/invitation/:id",
          element: <NavSentinel label="invitation" />,
        },
      ],
    });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/auth/verify-email?token=abc123&callbackURL=%2Finvitation%2Finv-42",
        expect.any(Object),
      );
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent(
        "invitation",
      );
    });
    expect(sessionStorage.getItem("olympia_pending_invitation")).toBeNull();
  });

  test("?token= com fetch falhando renderiza estado de erro", async () => {
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 400 }));
    renderWithRoute(<VerifyEmailPage />, {
      path: "/verify-email",
      initialEntry: "/verify-email?token=bad",
    });

    expect(
      await screen.findByText(/Link inválido ou expirado/i),
    ).toBeInTheDocument();
  });

  test("resend usa pending invitation como callbackURL", async () => {
    sessionStorage.setItem("olympia_pending_invitation", "inv-99");
    setMockSession(mockUseSession, {
      email: "alice@olympia.dev",
      emailVerified: false,
    });
    fetchSpy.mockResolvedValueOnce(new Response(null, { status: 200 }));
    const user = userEvent.setup();
    renderWithRoute(<VerifyEmailPage />, {
      path: "/verify-email",
      initialEntry: "/verify-email",
    });

    await user.click(screen.getByRole("button", { name: /Reenviar/i }));

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        "/api/auth/send-verification-email",
        expect.objectContaining({
          method: "POST",
          credentials: "include",
          body: JSON.stringify({
            email: "alice@olympia.dev",
            callbackURL: "/invitation/inv-99",
          }),
        }),
      );
    });
    expect(await screen.findByText(/Email reenviado/i)).toBeInTheDocument();
  });
});
