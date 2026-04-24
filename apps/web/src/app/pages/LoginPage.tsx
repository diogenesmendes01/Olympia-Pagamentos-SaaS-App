import { useState } from "react";
import { useNavigate } from "react-router";
import { Eye, EyeOff, Shield, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const C = {
  primary: "#1F3A5F",
  hover: "#274872",
  gold: "#C8A96B",
  ivory: "#F4EFE6",
};

export function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("rafael@olympiapag.com.br");
  const [password, setPassword] = useState("Olympia@2026");
  const [cnpj, setCnpj] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [mfaStep, setMfaStep] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setLoading(false);
    setMfaStep(true);
  };

  const handleMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    localStorage.setItem("olympia_auth", "true");
    toast.success("Acesso autorizado com sucesso.");
    navigate("/dashboard");
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    localStorage.setItem("olympia_auth", "true");
    toast.success(`Autenticado via ${provider}.`);
    navigate("/dashboard");
  };

  const handleDemoFirstLogin = async (type: "owner" | "invited") => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    localStorage.setItem("olympia_auth", "true");
    localStorage.setItem("olympia_onboarding", type);
    toast.success(
      type === "owner"
        ? "Novo acesso como Dono detectado."
        : "Acesso por convite detectado.",
    );
    navigate("/dashboard");
  };

  const formatCNPJ = (v: string) => {
    const d = v.replace(/\D/g, "").slice(0, 14);
    return d
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
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
            {/* Tabs */}
            <div className="flex" style={{ borderBottom: "1px solid #F1EDE7" }}>
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setMfaStep(false);
                  }}
                  className="flex-1 py-4 transition-colors"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    fontWeight: 600,
                    color: tab === t ? C.primary : "#94A3B8",
                    borderBottom:
                      tab === t
                        ? `2.5px solid ${C.primary}`
                        : "2.5px solid transparent",
                    background: "transparent",
                  }}
                >
                  {t === "login" ? "Entrar" : "Criar Conta"}
                </button>
              ))}
            </div>

            <div className="p-7">
              {tab === "login" && !mfaStep && (
                <>
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
                        provider: "Google",
                      },
                      {
                        label: "Continuar com Microsoft",
                        color: "#00A4EF",
                        letter: "M",
                        provider: "Microsoft",
                      },
                    ].map((s) => (
                      <button
                        key={s.provider}
                        onClick={() => handleSocialLogin(s.provider)}
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
                        <button
                          type="button"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12,
                            color: C.primary,
                            fontWeight: 500,
                          }}
                        >
                          Esqueceu?
                        </button>
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
                            <Eye
                              className="h-4 w-4"
                              style={{ color: "#94A3B8" }}
                            />
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
                        !loading &&
                        (e.currentTarget.style.background = C.primary)
                      }
                    >
                      {loading ? "Verificando..." : "Entrar"}{" "}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>
                  </form>
                  <p
                    className="mt-5 text-center"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      color: "#94A3B8",
                    }}
                  >
                    Também disponível: Magic Link via e-mail ou WhatsApp
                  </p>
                </>
              )}

              {tab === "login" && mfaStep && (
                <>
                  <div className="mb-6 flex items-center gap-3">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl"
                      style={{
                        background: "rgba(31,58,95,0.08)",
                        border: `1px solid rgba(31,58,95,0.15)`,
                      }}
                    >
                      <Shield
                        className="h-5 w-5"
                        style={{ color: C.primary }}
                      />
                    </div>
                    <div>
                      <h2
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: 16,
                          fontWeight: 800,
                          color: C.primary,
                        }}
                      >
                        Verificação em 2 Fatores
                      </h2>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          color: "#64748B",
                        }}
                      >
                        Código do seu app autenticador
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleMFA} className="space-y-4">
                    <input
                      type="text"
                      value={mfaCode}
                      onChange={(e) => {
                        setMfaCode(
                          e.target.value.replace(/\D/g, "").slice(0, 6),
                        );
                      }}
                      maxLength={6}
                      autoFocus
                      className="w-full rounded-xl border px-4 py-4 text-center tracking-widest transition-all focus:outline-none"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 22,
                        fontWeight: 700,
                        color: C.primary,
                        background: "#FAFAF9",
                        borderColor: "#DDD8D0",
                        letterSpacing: "0.35em",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = C.primary;
                        e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "#DDD8D0";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                      placeholder="000000"
                    />
                    <button
                      type="submit"
                      disabled={loading || mfaCode.length < 6}
                      className="w-full rounded-xl py-3 text-white transition-all"
                      style={{
                        background:
                          loading || mfaCode.length < 6 ? "#CBD5E1" : C.primary,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {loading ? "Verificando..." : "Confirmar Acesso"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMfaStep(false);
                      }}
                      className="w-full py-2"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: "#64748B",
                      }}
                    >
                      ← Voltar
                    </button>
                  </form>
                  <p
                    className="mt-3 text-center"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      color: "#94A3B8",
                    }}
                  >
                    Aceita: App autenticador, SMS, e-mail ou Passkey biométrico
                  </p>
                </>
              )}

              {tab === "register" && (
                <>
                  <h2
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      color: C.primary,
                      marginBottom: 4,
                    }}
                  >
                    Crie sua conta
                  </h2>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12.5,
                      color: "#64748B",
                      marginBottom: 18,
                    }}
                  >
                    Onboarding em 3 passos · Sem cartão de crédito
                  </p>
                  <form
                    className="space-y-3.5"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSocialLogin("cadastro");
                    }}
                  >
                    {[
                      {
                        label: "CNPJ da Empresa",
                        placeholder: "00.000.000/0001-00",
                        value: cnpj,
                        onChange: (v: string) => {
                          setCnpj(formatCNPJ(v));
                        },
                        type: "text",
                      },
                      {
                        label: "Razão Social",
                        placeholder: "Sua Empresa Ltda",
                        value: "",
                        // eslint-disable-next-line @typescript-eslint/no-empty-function -- demo UI noop
                        onChange: () => {},
                        type: "text",
                      },
                      {
                        label: "E-mail Corporativo",
                        placeholder: "voce@empresa.com.br",
                        value: "",
                        // eslint-disable-next-line @typescript-eslint/no-empty-function -- demo UI noop
                        onChange: () => {},
                        type: "email",
                      },
                      {
                        label: "Senha",
                        placeholder: "Mínimo 8 caracteres",
                        value: "",
                        // eslint-disable-next-line @typescript-eslint/no-empty-function -- demo UI noop
                        onChange: () => {},
                        type: "password",
                      },
                    ].map((f) => (
                      <div key={f.label}>
                        <label
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "#374151",
                            display: "block",
                            marginBottom: 5,
                          }}
                        >
                          {f.label}
                        </label>
                        <input
                          type={f.type}
                          placeholder={f.placeholder}
                          value={f.value}
                          onChange={(e) => {
                            f.onChange(e.target.value);
                          }}
                          className="w-full rounded-xl border px-4 py-2.5 transition-all focus:outline-none"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 13,
                            background: "#FAFAF9",
                            borderColor: "#DDD8D0",
                            color: "#1E293B",
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = C.primary;
                            e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = "#DDD8D0";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        />
                        {f.label === "CNPJ da Empresa" &&
                          cnpj.length === 18 && (
                            <div className="mt-1.5 flex items-center gap-1.5">
                              <CheckCircle2
                                className="h-3.5 w-3.5"
                                style={{ color: "#22C55E" }}
                              />
                              <span
                                style={{
                                  fontSize: 11.5,
                                  color: "#22C55E",
                                  fontFamily: "'Inter', sans-serif",
                                }}
                              >
                                CNPJ válido — preenchido automaticamente
                              </span>
                            </div>
                          )}
                      </div>
                    ))}
                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-white"
                      style={{
                        background: C.primary,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = C.hover)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = C.primary)
                      }
                    >
                      Criar conta gratuita <ArrowRight className="h-4 w-4" />
                    </button>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: "#94A3B8",
                        textAlign: "center",
                      }}
                    >
                      Ao criar sua conta você aceita os{" "}
                      <span style={{ color: C.primary, fontWeight: 600 }}>
                        Termos de Uso
                      </span>{" "}
                      e{" "}
                      <span style={{ color: C.primary, fontWeight: 600 }}>
                        Política de Privacidade
                      </span>
                    </p>
                  </form>
                </>
              )}
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

          {/* Demo first-login shortcuts */}
          <div
            className="mt-4 border-t pt-4"
            style={{ borderColor: "#E8E3DA" }}
          >
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "#9B8F83",
                textAlign: "center",
                marginBottom: 10,
              }}
            >
              ⚡ Demos de primeiro acesso
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleDemoFirstLogin("owner")}
                className="rounded-xl border px-3 py-2 text-left transition-all hover:shadow-sm"
                style={{
                  borderColor: "#DDD8D0",
                  background: "rgba(31,58,95,0.04)",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#1F3A5F",
                  }}
                >
                  🏢 Dono de Empresa
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10.5,
                    color: "#9B8F83",
                  }}
                >
                  1º acesso com onboarding
                </p>
              </button>
              <button
                onClick={() => handleDemoFirstLogin("invited")}
                className="rounded-xl border px-3 py-2 text-left transition-all hover:shadow-sm"
                style={{
                  borderColor: "#DDD8D0",
                  background: "rgba(31,58,95,0.04)",
                }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "#1F3A5F",
                  }}
                >
                  👤 Usuário Convidado
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10.5,
                    color: "#9B8F83",
                  }}
                >
                  Aceitar convite de empresa
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
