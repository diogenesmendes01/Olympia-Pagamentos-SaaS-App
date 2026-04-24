import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { signUp } from "../../lib/auth";
import { signupSchema, type SignupInput } from "@olympia/shared/schemas/auth";

const C = {
  primary: "#1F3A5F",
  hover: "#274872",
  gold: "#C8A96B",
  ivory: "#F4EFE6",
};

export function SignupPage() {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const form = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: SignupInput) {
    try {
      const { error } = await signUp.email(values);
      if (error) {
        toast.error(error.message ?? "Falha ao criar conta");
        return;
      }
      navigate("/verify-email");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-5 py-10"
      style={{ background: C.ivory }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-xl"
            style={{ background: C.primary, border: `1.5px solid ${C.gold}` }}
          >
            <span
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 17,
                fontWeight: 700,
                color: C.gold,
              }}
            >
              O
            </span>
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 16,
                fontWeight: 700,
                color: C.primary,
                letterSpacing: "0.12em",
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
              Criar sua conta
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 22,
              }}
            >
              Comece a usar a Olympia Pagamentos em poucos minutos
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              {/* Nome */}
              <div>
                <label
                  htmlFor="name"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register("name")}
                  className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    color: "#1E293B",
                    background: "#FAFAF9",
                    borderColor: errors.name ? "#DC2626" : "#DDD8D0",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.name
                      ? "#DC2626"
                      : "#DDD8D0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="Seu nome"
                />
                {errors.name && (
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#DC2626",
                      marginTop: 6,
                    }}
                  >
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* E-mail */}
              <div>
                <label
                  htmlFor="email"
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
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email")}
                  className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    color: "#1E293B",
                    background: "#FAFAF9",
                    borderColor: errors.email ? "#DC2626" : "#DDD8D0",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.email
                      ? "#DC2626"
                      : "#DDD8D0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="seu@email.com.br"
                />
                {errors.email && (
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#DC2626",
                      marginTop: 6,
                    }}
                  >
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="password"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    {...register("password")}
                    className="w-full rounded-xl border px-4 py-3 pr-11 transition-all focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      color: "#1E293B",
                      background: "#FAFAF9",
                      borderColor: errors.password ? "#DC2626" : "#DDD8D0",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = C.primary;
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.password
                        ? "#DC2626"
                        : "#DDD8D0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setShowPass(!showPass);
                    }}
                    className="absolute top-1/2 right-3.5 -translate-y-1/2"
                    aria-label={showPass ? "Ocultar senha" : "Mostrar senha"}
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
                {errors.password && (
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#DC2626",
                      marginTop: 6,
                    }}
                  >
                    {errors.password.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-white transition-all"
                style={{
                  background: isSubmitting ? "#94A3B8" : C.primary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  if (!isSubmitting) e.currentTarget.style.background = C.hover;
                }}
                onMouseLeave={(e) => {
                  if (!isSubmitting)
                    e.currentTarget.style.background = C.primary;
                }}
              >
                {isSubmitting ? "Criando conta..." : "Criar conta"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>

            <p
              className="mt-5 text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                color: "#64748B",
              }}
            >
              Já tem conta?{" "}
              <Link
                to="/login"
                style={{
                  color: C.primary,
                  fontWeight: 600,
                }}
              >
                Entrar
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
  );
}
