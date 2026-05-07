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

import { signUp } from "../../../lib/auth";
import { toast } from "sonner";
import { okResponse, errResponse } from "../../../test/auth-mocks";
import { SignupPage } from "../SignupPage";

const mockSignUpEmail = vi.mocked(signUp.email);
const mockToastError = vi.mocked(toast.error);

beforeEach(() => {
  mockSignUpEmail.mockReset();
  mockToastError.mockReset();
  sessionStorage.clear();
});

describe("SignupPage", () => {
  // Self-service signup foi convertido em lead capture (PR #7): chegando
  // direto em /signup sem ?invitation= o submit NÃO chama signUp.email,
  // só renderiza estado "Obrigado pelo interesse" e bloqueia o flow.
  test("submit sem ?invitation= mostra 'Obrigado pelo interesse' e NÃO chama signUp.email", async () => {
    const user = userEvent.setup();
    renderWithRoute(<SignupPage />, {
      path: "/signup",
      initialEntry: "/signup",
      extraRoutes: [
        {
          path: "/verify-email",
          element: <NavSentinel label="verify-email" />,
        },
      ],
    });

    await user.type(screen.getByLabelText(/Nome completo/i), "Alice");
    await user.type(screen.getByLabelText(/E-mail/i), "alice@olympia.dev");
    await user.type(screen.getByLabelText("Senha"), "secret12345");
    await user.click(screen.getByRole("button", { name: /Criar conta/i }));

    expect(
      await screen.findByText(/Obrigado pelo interesse/i),
    ).toBeInTheDocument();
    expect(mockSignUpEmail).not.toHaveBeenCalled();
    expect(screen.queryByTestId("nav-sentinel")).toBeNull();
    expect(sessionStorage.getItem("olympia_pending_invitation")).toBeNull();
  });

  test("signup com ?invitation= preenche email, usa callbackURL=/invitation/<id> e persiste sessionStorage", async () => {
    mockSignUpEmail.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<SignupPage />, {
      path: "/signup",
      initialEntry: "/signup?invitation=inv-42&email=bob%40olympia.dev",
      extraRoutes: [
        {
          path: "/verify-email",
          element: <NavSentinel label="verify-email" />,
        },
      ],
    });

    // Email já vem pré-preenchido pela query
    expect(screen.getByLabelText(/E-mail/i)).toHaveValue("bob@olympia.dev");

    await user.type(screen.getByLabelText(/Nome completo/i), "Bob");
    await user.type(screen.getByLabelText("Senha"), "secret12345");
    await user.click(screen.getByRole("button", { name: /Criar conta/i }));

    await waitFor(() => {
      expect(mockSignUpEmail).toHaveBeenCalledWith({
        name: "Bob",
        email: "bob@olympia.dev",
        password: "secret12345",
        callbackURL: "/invitation/inv-42",
      });
    });
    expect(sessionStorage.getItem("olympia_pending_invitation")).toBe("inv-42");
  });

  test("erro do BA no flow de invite exibe toast e não navega", async () => {
    mockSignUpEmail.mockResolvedValueOnce(errResponse("Email já cadastrado"));
    const user = userEvent.setup();
    renderWithRoute(<SignupPage />, {
      path: "/signup",
      initialEntry: "/signup?invitation=inv-42&email=bob%40olympia.dev",
      extraRoutes: [
        {
          path: "/verify-email",
          element: <NavSentinel label="verify-email" />,
        },
      ],
    });

    await user.type(screen.getByLabelText(/Nome completo/i), "Bob");
    await user.type(screen.getByLabelText("Senha"), "secret12345");
    await user.click(screen.getByRole("button", { name: /Criar conta/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Email já cadastrado");
    });
    expect(screen.queryByTestId("nav-sentinel")).toBeNull();
    expect(sessionStorage.getItem("olympia_pending_invitation")).toBeNull();
  });

  test("validação client-side bloqueia submit (senha < 8)", async () => {
    const user = userEvent.setup();
    renderWithRoute(<SignupPage />, {
      path: "/signup",
      initialEntry: "/signup",
    });

    await user.type(screen.getByLabelText(/Nome completo/i), "Alice");
    await user.type(screen.getByLabelText(/E-mail/i), "alice@olympia.dev");
    await user.type(screen.getByLabelText("Senha"), "short");
    await user.click(screen.getByRole("button", { name: /Criar conta/i }));

    expect(mockSignUpEmail).not.toHaveBeenCalled();
    expect(
      await screen.findByText(/Senha precisa ter ao menos 8 caracteres/i),
    ).toBeInTheDocument();
    // Não deve mostrar a mensagem de "Obrigado" (validação bloqueou antes)
    expect(screen.queryByText(/Obrigado pelo interesse/i)).toBeNull();
  });
});
