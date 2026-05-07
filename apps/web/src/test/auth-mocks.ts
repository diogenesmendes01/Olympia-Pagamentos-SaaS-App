import { vi, type Mock } from "vitest";

// `Mock` é o tipo de retorno de `vi.fn()`. Reexportado nos shapes acima.

// Factory que produz um conjunto fresco de mocks compatíveis com o shape
// de `apps/web/src/lib/auth.ts`. Usado em `vi.mock("../../lib/auth", ...)`
// nos testes de páginas/guards.
//
// Cada mock é `vi.fn()` — os testes definem `mockResolvedValue(...)` por
// caso de teste. `useSession` tem default benigno via `setMockSession`.

export interface AuthMocks {
  signIn: {
    email: Mock;
    magicLink: Mock;
    social: Mock;
  };
  signUp: { email: Mock };
  signOut: Mock;
  useSession: Mock;
  organization: {
    list: Mock;
    setActive: Mock;
    acceptInvitation: Mock;
    getInvitation: Mock;
    getActiveMember: Mock;
    listMembers: Mock;
    listInvitations: Mock;
    inviteMember: Mock;
    updateMemberRole: Mock;
    removeMember: Mock;
    cancelInvitation: Mock;
  };
  authClient: {
    organization: {
      getInvitation: Mock;
      getActiveMember: Mock;
    };
    getSession: Mock;
    requestPasswordReset: Mock;
    resetPassword: Mock;
  };
}

export function makeAuthMocks(): AuthMocks {
  const useSessionMock = vi.fn();
  setMockSession(useSessionMock, { signedIn: false });
  return {
    signIn: {
      email: vi.fn(),
      magicLink: vi.fn(),
      social: vi.fn(),
    },
    signUp: { email: vi.fn() },
    signOut: vi.fn(),
    useSession: useSessionMock,
    organization: {
      list: vi.fn(),
      setActive: vi.fn(),
      acceptInvitation: vi.fn(),
      getInvitation: vi.fn(),
      getActiveMember: vi.fn(),
      listMembers: vi.fn(),
      listInvitations: vi.fn(),
      inviteMember: vi.fn(),
      updateMemberRole: vi.fn(),
      removeMember: vi.fn(),
      cancelInvitation: vi.fn(),
    },
    authClient: {
      organization: {
        getInvitation: vi.fn(),
        getActiveMember: vi.fn(),
      },
      getSession: vi.fn(),
      requestPasswordReset: vi.fn(),
      resetPassword: vi.fn(),
    },
  };
}

// ── Session helpers ────────────────────────────────────────────────────────

export interface SessionOverrides {
  userId?: string;
  email?: string;
  name?: string;
  emailVerified?: boolean;
  activeOrganizationId?: string | null;
}

// Monta um objeto compatível com `useSession()['data']` do better-auth
// (campos `createdAt`/`updatedAt` necessários pelo tipo, mas irrelevantes
// pra esses testes). Retornado como `unknown` pra evitar declarar todos
// os campos transitivos do BA — o consumidor casta no setMockSession.
function buildSession(overrides: SessionOverrides = {}): unknown {
  const userId = overrides.userId ?? "user-1";
  const now = new Date("2026-01-01T00:00:00Z");
  return {
    user: {
      id: userId,
      email: overrides.email ?? "alice@olympia.dev",
      name: overrides.name ?? "Alice",
      emailVerified: overrides.emailVerified ?? true,
      image: null,
      createdAt: now,
      updatedAt: now,
    },
    session: {
      id: "session-1",
      userId,
      activeOrganizationId:
        overrides.activeOrganizationId === undefined
          ? "org-1"
          : overrides.activeOrganizationId,
      expiresAt: new Date(now.getTime() + 1000 * 60 * 60 * 24),
      token: "fake-token",
      createdAt: now,
      updatedAt: now,
      ipAddress: null,
      userAgent: null,
    },
  };
}

export interface SetSessionOptions extends SessionOverrides {
  /** `false` retorna `data: null`. */
  signedIn?: boolean;
  /** `true` retorna `isPending: true` com data: undefined. */
  pending?: boolean;
}

// Aceita qualquer mock (incluindo `vi.fn()` "construtor-friendly") sem
// brigar com a inferência estrita do TypeScript. O `as never` no return
// value evita reproduzir todo o tipo do BA em cada teste.
interface AnyMock {
  mockReturnValue: (value: unknown) => unknown;
}

// Configura o retorno do useSession mock com o shape completo esperado
// pelo better-auth (`data`, `isPending`, `isRefetching`, `error`, `refetch`).
export function setMockSession(mock: AnyMock, options: SetSessionOptions = {}) {
  if (options.pending) {
    mock.mockReturnValue({
      data: undefined,
      isPending: true,
      isRefetching: false,
      error: null,
      refetch: vi.fn(),
    });
    return;
  }
  if (options.signedIn === false) {
    mock.mockReturnValue({
      data: null,
      isPending: false,
      isRefetching: false,
      error: null,
      refetch: vi.fn(),
    });
    return;
  }
  mock.mockReturnValue({
    data: buildSession(options),
    isPending: false,
    isRefetching: false,
    error: null,
    refetch: vi.fn(),
  });
}

// Resposta benigna pra `signIn.email`/`signUp.email`/etc — `{ error: null }`.
// Casta como `never` pra que `mockResolvedValueOnce(okResponse)` não brigue
// com o tipo BA-específico inferido por `vi.mocked(fn)`.
export const okResponse: never = { data: undefined, error: null } as never;

// Resposta de erro com message conhecida.
export function errResponse(message: string): never {
  return { data: null, error: { message } } as never;
}
