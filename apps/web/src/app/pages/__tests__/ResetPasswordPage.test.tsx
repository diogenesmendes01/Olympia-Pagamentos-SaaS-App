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

import { authClient } from "../../../lib/auth";
import { toast } from "sonner";
import { okResponse, errResponse } from "../../../test/auth-mocks";
import { ResetPasswordPage } from "../ResetPasswordPage";

const mockResetPassword = vi.mocked(authClient.resetPassword);
const mockToastError = vi.mocked(toast.error);
const mockToastSuccess = vi.mocked(toast.success);

beforeEach(() => {
  mockResetPassword.mockReset();
  mockToastError.mockReset();
  mockToastSuccess.mockReset();
});

describe("ResetPasswordPage", () => {
  test("sem ?token= renderiza estado de link inválido", () => {
    renderWithRoute(<ResetPasswordPage />, {
      path: "/reset-password",
      initialEntry: "/reset-password",
    });

    expect(screen.getByText(/Link inválido/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Solicitar novo link/i }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  test("reset feliz com ?token= chama BA com newPassword+token e navega pra /login", async () => {
    mockResetPassword.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<ResetPasswordPage />, {
      path: "/reset-password",
      initialEntry: "/reset-password?token=tok-xyz",
      extraRoutes: [{ path: "/login", element: <NavSentinel label="login" /> }],
    });

    await user.type(screen.getByLabelText(/Nova senha/i), "newpass1234");
    await user.click(screen.getByRole("button", { name: /Redefinir senha/i }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        newPassword: "newpass1234",
        token: "tok-xyz",
      });
    });
    await waitFor(() => {
      expect(screen.getByTestId("nav-sentinel")).toHaveTextContent("login");
    });
    expect(mockToastSuccess).toHaveBeenCalled();
  });

  test("erro do BA exibe toast e não navega", async () => {
    mockResetPassword.mockResolvedValueOnce(errResponse("Token expirado"));
    const user = userEvent.setup();
    renderWithRoute(<ResetPasswordPage />, {
      path: "/reset-password",
      initialEntry: "/reset-password?token=tok-xyz",
      extraRoutes: [{ path: "/login", element: <NavSentinel label="login" /> }],
    });

    await user.type(screen.getByLabelText(/Nova senha/i), "newpass1234");
    await user.click(screen.getByRole("button", { name: /Redefinir senha/i }));

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Token expirado");
    });
    expect(screen.queryByTestId("nav-sentinel")).toBeNull();
  });
});
