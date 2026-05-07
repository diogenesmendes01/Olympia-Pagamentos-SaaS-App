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

import { signIn } from "../../../lib/auth";
import { toast } from "sonner";
import { okResponse, errResponse } from "../../../test/auth-mocks";
import { MagicLinkPage } from "../MagicLinkPage";

const mockSignInMagicLink = vi.mocked(signIn.magicLink);
const mockToastError = vi.mocked(toast.error);

beforeEach(() => {
  mockSignInMagicLink.mockReset();
  mockToastError.mockReset();
});

describe("MagicLinkPage", () => {
  test("envio feliz usa callbackURL=/dashboard como default", async () => {
    mockSignInMagicLink.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<MagicLinkPage />, {
      path: "/magic-link",
      initialEntry: "/magic-link",
    });

    await user.type(screen.getByLabelText(/E-mail/i), "alice@olympia.dev");
    await user.click(
      screen.getByRole("button", { name: /Enviar link mágico/i }),
    );

    await waitFor(() => {
      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: "alice@olympia.dev",
        callbackURL: "/dashboard",
      });
    });
    expect(
      await screen.findByText(/Link enviado — veja seu email/i),
    ).toBeInTheDocument();
  });

  test("respeita ?from= da query como callbackURL", async () => {
    mockSignInMagicLink.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<MagicLinkPage />, {
      path: "/magic-link",
      initialEntry: "/magic-link?from=%2Finvitation%2Fabc",
    });

    await user.type(screen.getByLabelText(/E-mail/i), "alice@olympia.dev");
    await user.click(
      screen.getByRole("button", { name: /Enviar link mágico/i }),
    );

    await waitFor(() => {
      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: "alice@olympia.dev",
        callbackURL: "/invitation/abc",
      });
    });
  });

  test("respeita state.from quando guard injeta", async () => {
    mockSignInMagicLink.mockResolvedValueOnce(okResponse);
    const user = userEvent.setup();
    renderWithRoute(<MagicLinkPage />, {
      path: "/magic-link",
      initialEntry: {
        pathname: "/magic-link",
        state: { from: { pathname: "/users" } },
      },
    });

    await user.type(screen.getByLabelText(/E-mail/i), "alice@olympia.dev");
    await user.click(
      screen.getByRole("button", { name: /Enviar link mágico/i }),
    );

    await waitFor(() => {
      expect(mockSignInMagicLink).toHaveBeenCalledWith({
        email: "alice@olympia.dev",
        callbackURL: "/users",
      });
    });
  });

  test("erro do BA exibe toast e mantém form visível", async () => {
    mockSignInMagicLink.mockResolvedValueOnce(errResponse("Falha no envio"));
    const user = userEvent.setup();
    renderWithRoute(<MagicLinkPage />, {
      path: "/magic-link",
      initialEntry: "/magic-link",
    });

    await user.type(screen.getByLabelText(/E-mail/i), "alice@olympia.dev");
    await user.click(
      screen.getByRole("button", { name: /Enviar link mágico/i }),
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("Falha no envio");
    });
    expect(screen.queryByText(/Link enviado — veja seu email/i)).toBeNull();
  });
});
