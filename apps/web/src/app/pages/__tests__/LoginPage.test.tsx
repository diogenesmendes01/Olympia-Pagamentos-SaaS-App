import { describe, expect, test, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRoute, NavSentinel } from "../../../test/test-utils";

// vi.mock é hoisted — async factory evita TDZ no `makeAuthMocks`.
vi.mock("../../../lib/auth", async () => {
  const { makeAuthMocks } = await import("../../../test/auth-mocks");
  return makeAuthMocks();
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
  Toaster: () => null,
}));

import { signIn } from "../../../lib/auth";
import { toast } from "sonner";
import { okResponse, errResponse } from "../../../test/auth-mocks";
import { LoginPage } from "../LoginPage";

const mockSignInEmail = vi.mocked(signIn.email);
const mockSignInSocial = vi.mocked(signIn.social);
const mockToastError = vi.mocked(toast.error);

beforeEach(() => {
  mockSignInEmail.mockReset();
  mockSignInSocial.mockReset();
  mockToastError.mockReset();
});

describe("LoginPage", () => {
  test("login feliz com password navega pro destino default /dashboard", async () => {
    mockSignInEmail.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: "/login",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });

    await user.type(
      screen.getByPlaceholderText("seu@email.com.br"),
      "alice@olympia.dev",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: /^Entrar$/ }));

    await waitFor(() => {
      expect(mockSignInEmail).toHaveBeenCalledWith({
        email: "alice@olympia.dev",
        password: "secret123",
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("dashboard");
    });
  });

  test("erro do BA exibe toast e não navega", async () => {
    mockSignInEmail.mockResolvedValueOnce(errResponse("Credenciais inválidas"));
    const user = userEvent.setup();
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: "/login",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });

    await user.type(
      screen.getByPlaceholderText("seu@email.com.br"),
      "alice@olympia.dev",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "wrong-pass");
    await user.click(screen.getByRole("button", { name: /^Entrar$/ }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Credenciais inválidas");
    });
    expect(screen.queryByTestId("nav-sentinel")).toBeNull();
  });

  test("erro de rede (rejected promise) exibe toast genérico", async () => {
    mockSignInEmail.mockRejectedValueOnce(new Error("Network down"));
    const user = userEvent.setup();
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: "/login",
    });

    await user.type(
      screen.getByPlaceholderText("seu@email.com.br"),
      "alice@olympia.dev",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: /^Entrar$/ }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith(
        "Erro de conexão. Tente novamente.",
      );
    });
  });

  test("respeita state.from injetado pelos guards (Navigate)", async () => {
    mockSignInEmail.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: {
        pathname: "/login",
        state: { from: { pathname: "/users" } },
      },
      extraRoutes: [
        { path: "/users", element: <NavSentinel label="users-page" /> },
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });

    await user.type(
      screen.getByPlaceholderText("seu@email.com.br"),
      "alice@olympia.dev",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: /^Entrar$/ }));

    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent(
        "users-page",
      );
    });
  });

  test("respeita ?from=<path> da query string (vindo da InvitationPage)", async () => {
    mockSignInEmail.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: "/login?from=%2Finvitation%2Fabc123",
      extraRoutes: [
        {
          path: "/invitation/:id",
          element: <NavSentinel label="invitation-page" />,
        },
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });

    await user.type(
      screen.getByPlaceholderText("seu@email.com.br"),
      "alice@olympia.dev",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: /^Entrar$/ }));

    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent(
        "invitation-page",
      );
    });
  });

  test("rejeita ?from=//evil.com (open redirect) e cai no /dashboard", async () => {
    mockSignInEmail.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: "/login?from=%2F%2Fevil.com",
      extraRoutes: [
        { path: "/dashboard", element: <NavSentinel label="dashboard" /> },
      ],
    });

    await user.type(
      screen.getByPlaceholderText("seu@email.com.br"),
      "alice@olympia.dev",
    );
    await user.type(screen.getByPlaceholderText("••••••••"), "secret123");
    await user.click(screen.getByRole("button", { name: /^Entrar$/ }));

    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("dashboard");
    });
  });

  test("link 'Entrar com link mágico' propaga ?from= quando redirectTo != /dashboard", () => {
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: "/login?from=%2Finvitation%2Fabc123",
    });

    const magicLinkLink = screen.getByRole("link", {
      name: /Entrar com link mágico/i,
    });
    expect(magicLinkLink).toHaveAttribute(
      "href",
      "/magic-link?from=%2Finvitation%2Fabc123",
    );
  });

  test("link 'Entrar com link mágico' não anexa ?from= quando destino é default /dashboard", () => {
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: "/login",
    });

    const magicLinkLink = screen.getByRole("link", {
      name: /Entrar com link mágico/i,
    });
    expect(magicLinkLink).toHaveAttribute("href", "/magic-link");
  });

  test("login social (google) usa redirectTo do state.from como callbackURL", async () => {
    mockSignInSocial.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<LoginPage />, {
      path: "/login",
      initialEntry: {
        pathname: "/login",
        state: { from: { pathname: "/users" } },
      },
    });

    await user.click(
      screen.getByRole("button", { name: /Continuar com Google/i }),
    );

    await waitFor(() => {
      expect(mockSignInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "/users",
      });
    });
  });
});
