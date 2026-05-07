import { describe, expect, test, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithRoute } from "../../../test/test-utils";

vi.mock("../../../lib/auth", async () => {
  const { makeAuthMocks } = await import("../../../test/auth-mocks");
  return makeAuthMocks();
});

vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn(), info: vi.fn() },
  Toaster: () => null,
}));

import { authClient } from "../../../lib/auth";
import { toast } from "sonner";
import { okResponse, errResponse } from "../../../test/auth-mocks";
import { ForgotPasswordPage } from "../ForgotPasswordPage";

const mockRequestPasswordReset = vi.mocked(authClient.requestPasswordReset);
const mockToastError = vi.mocked(toast.error);

beforeEach(() => {
  mockRequestPasswordReset.mockReset();
  mockToastError.mockReset();
});

describe("ForgotPasswordPage", () => {
  test("envio feliz mostra confirmação e chama BA com redirectTo=/reset-password", async () => {
    mockRequestPasswordReset.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<ForgotPasswordPage />, {
      path: "/forgot-password",
      initialEntry: "/forgot-password",
    });

    await user.type(screen.getByLabelText(/E-mail/i), "alice@olympia.dev");
    await user.click(screen.getByRole("button", { name: /Enviar link/i }));

    await waitFor(() => {
      expect(mockRequestPasswordReset).toHaveBeenCalledWith({
        email: "alice@olympia.dev",
        redirectTo: "/reset-password",
      });
    });
    expect(
      await screen.findByText(/Email enviado. Verifique sua caixa de entrada/i),
    ).toBeInTheDocument();
  });

  test("erro do BA exibe toast e mantém form", async () => {
    mockRequestPasswordReset.mockResolvedValueOnce(errResponse("Falha"));
    const user = userEvent.setup();
    renderWithRoute(<ForgotPasswordPage />, {
      path: "/forgot-password",
      initialEntry: "/forgot-password",
    });

    await user.type(screen.getByLabelText(/E-mail/i), "alice@olympia.dev");
    await user.click(screen.getByRole("button", { name: /Enviar link/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Falha");
    });
    expect(
      screen.queryByText(/Email enviado. Verifique sua caixa de entrada/i),
    ).toBeNull();
  });

  test("validação client-side bloqueia submit com email inválido", async () => {
    const user = userEvent.setup();
    renderWithRoute(<ForgotPasswordPage />, {
      path: "/forgot-password",
      initialEntry: "/forgot-password",
    });

    await user.type(screen.getByLabelText(/E-mail/i), "not-an-email");
    await user.click(screen.getByRole("button", { name: /Enviar link/i }));

    expect(mockRequestPasswordReset).not.toHaveBeenCalled();
    expect(await screen.findByText(/Email inválido/i)).toBeInTheDocument();
  });
});
