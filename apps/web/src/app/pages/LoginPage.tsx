import { useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "../../lib/auth";
import { loginSchema } from "@olympia/shared/schemas/auth";

const C = {
  primary: "#1F3A5F",
  hover: "#274872",
  gold: "#C8A96B",
  ivory: "#F4EFE6",
};

// Resolve o destino pós-login. Os guards (RequireAuth/RequireSession)
// passam `from` via location.state quando redirecionam pra cá. A
// InvitationPage Branch 3 manda usuário trocar de conta com
// `?from=/invitation/<id>` na query — usado pra retomar o fluxo de
// convite após login. Fallback: /dashboard.
function isSafeInternalPath(path: string): boolean {
  // Aceita só paths internos (começam com "/" e não com "//"). Bloqueia
  // open redirect via "//evil.com" ou "https://evil.com".
  return (
    typeof path === "string" && path.startsWith("/") && !path.startsWith("//")
  );
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // location.state é injetado pelo Navigate dos guards: { from: location }
  // (apps/web/src/app/guards/RequireAuth.tsx:11). InvitationPage.tsx:170
  // usa query string ?from=<path> porque o redirect dela não preserva state.
  const stateFrom =
    typeof (location.state as { from?: { pathname?: string } } | null)?.from
      ?.pathname === "string"
      ? (location.state as { from: { pathname: string } }).from.pathname
      : null;
  const queryFrom = params.get("from");
  const redirectTo =
    (stateFrom && isSafeInternalPath(stateFrom) && stateFrom) ||
    (queryFrom && isSafeInternalPath(queryFrom) && queryFrom) ||
    "/dashboard";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Email ou senha inválidos",
      );
      return;
    }
    setLoading(true);
    try {
      const { error } = await signIn.email({
        email: parsed.data.email,
        password: parsed.data.password,
      });
      if (error) {
        toast.error(error.message ?? "Falha no login");
        return;
      }
      navigate(redirectTo, { replace: true });
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const loginGoogle = async () => {
    try {
      await signIn.social({ provider: "google", callbackURL: redirectTo });
    } catch {
      toast.error("Falha ao iniciar login social");
    }
  };

  const loginMicrosoft = async () => {
    try {
      await signIn.social({ provider: "microsoft", callbackURL: redirectTo });
    } catch {
      toast.error("Falha ao iniciar login social");
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: C.ivory }}>
      {/* ── Left panel — Deep Blue ── */}
      <div
        className="hidden w-[460px] flex-shrink-0 flex-col justify-between px-12 py-10 lg:flex"
        style={{ background: C.primary }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3.5">
          <div
            className="flex h-11 w-11 items-center justify-center rounded-xl"
            style={{
              background: "rgba(200,169,107,0.12)",
              border: `1.5px solid ${C.gold}`,
            }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 19,
                fontWeight: 700,
                color: C.gold,
                lineHeight: 1,
              }}
            >
              O
            </span>
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 15,
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.14em",
              }}
            >
              OLYMPIA
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 9.5,
                fontWeight: 600,
                color: C.gold,
                letterSpacing: "0.2em",
              }}
            >
              PAGAMENTOS
            </p>
          </div>
        </div>

        {/* Headline */}
        <div>
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5"
            style={{
              background: "rgba(200,169,107,0.12)",
              border: `1px solid rgba(200,169,107,0.25)`,
            }}
          >
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: C.gold }}
            />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                fontWeight: 600,
                color: C.gold,
                letterSpacing: "0.1em",
              }}
            >
              GESTÃO FINANCEIRA INTELIGENTE
            </span>
          </div>

          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 30,
              fontWeight: 800,
              lineHeight: 1.25,
              color: "#FFFFFF",
              marginBottom: 16,
            }}
          >
            Controle total dos seus
            <br />
            <span style={{ color: C.gold }}>recebimentos</span>
            <br />e pagamentos
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 14.5,
              color: "#A8BDD4",
              lineHeight: 1.65,
            }}
          >
            Automatize cobranças, concilie em tempo real e tome decisões com
            inteligência financeira.
          </p>

          <div className="mt-8 space-y-3">
            {[
              "Pix Cobrança + Boleto Registrado",
              "Conciliação via Open Finance",
              "Projeção de caixa com IA — 90 dias",
              "Emissão automática NF-e / NFS-e",
              "Workflow de aprovação multinível",
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div
                  className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                  style={{
                    background: "rgba(200,169,107,0.15)",
                    border: `1px solid ${C.gold}`,
                  }}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: C.gold }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    color: "#CBD8E8",
                  }}
                >
                  {f}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "em transações", value: "R$ 2,8bi" },
            { label: "empresas ativas", value: "4.200+" },
            { label: "conciliação", value: "99,7%" },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl p-3.5 text-center"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <p
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: 800,
                  fontSize: 19,
                  color: C.gold,
                }}
              >
                {s.value}
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10.5,
                  color: "#6B8BAF",
                  marginTop: 2,
                }}
              >
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel — Ivory ── */}
      <div
        className="flex flex-1 items-center justify-center px-5 py-10"
        style={{ background: C.ivory }}
      >
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl"
              style={{ background: C.primary, border: `1.5px solid ${C.gold}` }}
            >
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 15,
                  fontWeight: 700,
                  color: C.gold,
                }}
              >
                O
              </span>
            </div>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 16,
                fontWeight: 700,
                color: C.primary,
                letterSpacing: "0.1em",
              }}
            >
              OLYMPIA
            </p>
          </div>

          <div
            className="overflow-hidden rounded-3xl bg-white shadow-xl"
            style={{ border: "1px solid #E8DDD0" }}
          >
            <div className="p-7">
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 20,
                  fontWeight: 800,
                  color: C.primary,
                  marginBottom: 2,
                }}
              >
                Bem-vindo de volta
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: "#64748B",
                  marginBottom: 22,
                }}
              >
                Acesse sua conta Olympia Pagamentos
              </p>

              {/* Social */}
              <div className="mb-5 space-y-2.5">
                {[
                  {
                    label: "Continuar com Google",
                    color: "#EA4335",
                    letter: "G",
                    provider: "google" as const,
                    onClick: loginGoogle,
                  },
                  {
                    label: "Continuar com Microsoft",
                    color: "#00A4EF",
                    letter: "M",
                    provider: "microsoft" as const,
                    onClick: loginMicrosoft,
                  },
                ].map((s) => (
                  <button
                    key={s.provider}
                    onClick={s.onClick}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 transition-colors"
                    style={{
                      border: "1.5px solid #E2E8F0",
                      background: "#FAFAF9",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#F4EFE6")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#FAFAF9")
                    }
                  >
                    <div
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-white"
                      style={{ background: s.color }}
                    >
                      {s.letter}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13.5,
                        color: "#374151",
                      }}
                    >
                      {s.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mb-5 flex items-center gap-3">
                <div
                  className="h-px flex-1"
                  style={{ background: "#EDE8E1" }}
                />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11.5,
                    color: "#94A3B8",
                  }}
                >
                  ou com e-mail
                </span>
                <div
                  className="h-px flex-1"
                  style={{ background: "#EDE8E1" }}
                />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    required
                    className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      color: "#1E293B",
                      background: "#FAFAF9",
                      borderColor: "#DDD8D0",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#DDD8D0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder="seu@email.com.br"
                  />
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between">
                    <label
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Senha
                    </label>
                    <Link
                      to="/forgot-password"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12,
                        color: C.primary,
                        fontWeight: 500,
                      }}
                    >
                      Esqueceu?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                      }}
                      required
                      className="w-full rounded-xl border px-4 py-3 pr-11 transition-all focus:outline-none"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13.5,
                        color: "#1E293B",
                        background: "#FAFAF9",
                        borderColor: "#DDD8D0",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = C.primary;
                        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#DDD8D0";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setShowPass(!showPass);
                      }}
                      className="absolute top-1/2 right-3.5 -translate-y-1/2"
                    >
                      {showPass ? (
                        <EyeOff
                          className="h-4 w-4"
                          style={{ color: "#94A3B8" }}
                        />
                      ) : (
                        <Eye className="h-4 w-4" style={{ color: "#94A3B8" }} />
                      )}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-white transition-all"
                  style={{
                    background: loading ? "#94A3B8" : C.primary,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.01em",
                  }}
                  onMouseEnter={(e) =>
                    !loading && (e.currentTarget.style.background = C.hover)
                  }
                  onMouseLeave={(e) =>
                    !loading && (e.currentTarget.style.background = C.primary)
                  }
                >
                  {loading ? "Verificando..." : "Entrar"}{" "}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>
              </form>

              <div className="mt-5 text-center">
                <Link
                  to={
                    redirectTo !== "/dashboard"
                      ? `/magic-link?from=${encodeURIComponent(redirectTo)}`
                      : "/magic-link"
                  }
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    color: C.primary,
                    fontWeight: 500,
                  }}
                >
                  Entrar com link mágico
                </Link>
              </div>

              <p
                className="mt-4 text-center"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#64748B",
                }}
              >
                Não tem conta?{" "}
                <Link
                  to="/signup"
                  style={{
                    color: C.primary,
                    fontWeight: 600,
                  }}
                >
                  Criar conta
                </Link>
              </p>
            </div>
          </div>

          <p
            className="mt-5 text-center"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11.5,
              color: "#9B8F83",
            }}
          >
            🔒 Criptografia AES-256 · Conformidade LGPD · SOC 2 Type II
          </p>
        </div>
      </div>
    </div>
  );
}
