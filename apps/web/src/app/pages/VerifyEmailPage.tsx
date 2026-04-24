import { useSearchParams, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "../../lib/auth";

const C = {
  primary: "#1F3A5F",
  hover: "#274872",
  ivory: "#F4EFE6",
};

export function VerifyEmailPage() {
  const [params] = useSearchParams();
  const { data: session } = useSession();
  const navigate = useNavigate();
  const [state, setState] = useState<"idle" | "verifying" | "error" | "sent">(
    params.get("token") ? "verifying" : "idle",
  );
  const [email, setEmail] = useState(session?.user?.email ?? "");

  useEffect(() => {
    const token = params.get("token");
    if (!token) return;
    const url = `/api/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=/dashboard`;
    fetch(url, { credentials: "include" })
      .then((res) => {
        if (res.ok || res.redirected) {
          navigate("/dashboard");
        } else {
          setState("error");
        }
      })
      .catch(() => {
        setState("error");
      });
  }, [params, navigate]);

  async function resend(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    try {
      const res = await fetch("/api/auth/send-verification-email", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, callbackURL: "/dashboard" }),
      });
      if (!res.ok) {
        toast.error("Falha ao reenviar email");
        return;
      }
      setState("sent");
    } catch {
      toast.error("Falha ao reenviar email");
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-10"
      style={{ background: C.ivory }}
    >
      <div className="w-full max-w-md">
        <div
          className="overflow-hidden rounded-3xl bg-white shadow-xl"
          style={{ border: "1px solid #E8DDD0" }}
        >
          <div className="p-7">
            <h1
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: C.primary,
                marginBottom: 10,
              }}
            >
              Verifique seu email
            </h1>

            {state === "verifying" && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  color: "#64748B",
                }}
              >
                Verificando...
              </p>
            )}

            {state === "error" && (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  color: "#DC2626",
                }}
              >
                Link inválido ou expirado.
              </p>
            )}

            {(state === "idle" || state === "sent") && (
              <>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    color: "#64748B",
                    marginBottom: 18,
                  }}
                >
                  Enviamos um link pro seu email. Clique pra ativar a conta.
                </p>
                {state === "sent" ? (
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      color: C.primary,
                      fontWeight: 600,
                    }}
                  >
                    Email reenviado.
                  </p>
                ) : (
                  <form
                    onSubmit={resend}
                    className="mt-2 flex gap-2"
                    noValidate
                  >
                    <label htmlFor="verify-email" className="sr-only">
                      E-mail
                    </label>
                    <input
                      id="verify-email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                      }}
                      placeholder="seu@email.com"
                      required
                      className="flex-1 rounded-xl border px-4 py-3 transition-all focus:outline-none"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13.5,
                        color: "#1E293B",
                        background: "#FAFAF9",
                        borderColor: "#DDD8D0",
                      }}
                    />
                    <button
                      type="submit"
                      className="rounded-xl px-4 py-3 text-white transition-all"
                      style={{
                        background: C.primary,
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13.5,
                        fontWeight: 700,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = C.hover;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = C.primary;
                      }}
                    >
                      Reenviar
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
