import { useState } from "react";
import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authClient } from "../../lib/auth";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@olympia/shared/schemas/auth";

const C = {
  primary: "#1F3A5F",
  hover: "#274872",
  gold: "#C8A96B",
  ivory: "#F4EFE6",
};

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);

  const form = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: ForgotPasswordInput) {
    try {
      const { error } = await authClient.requestPasswordReset({
        email: values.email,
        redirectTo: "/reset-password",
      });
      if (error) {
        toast.error(error.message ?? "Falha ao solicitar reset");
        return;
      }
      setSent(true);
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
                marginBottom: 2,
              }}
            >
              Recuperar senha
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 22,
              }}
            >
              Informe seu email e enviaremos um link pra redefinir a senha.
            </p>

            {sent ? (
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  color: C.primary,
                  fontWeight: 600,
                }}
              >
                Email enviado. Verifique sua caixa de entrada.
              </p>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4"
                noValidate
              >
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
                    aria-invalid={!!errors.email}
                    aria-describedby={errors.email ? "email-error" : undefined}
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
                      id="email-error"
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
                    if (!isSubmitting)
                      e.currentTarget.style.background = C.hover;
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting)
                      e.currentTarget.style.background = C.primary;
                  }}
                >
                  {isSubmitting ? "Enviando..." : "Enviar link"}
                </button>
              </form>
            )}

            <p
              className="mt-5 text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                color: "#64748B",
              }}
            >
              <Link
                to="/login"
                style={{
                  color: C.primary,
                  fontWeight: 600,
                }}
              >
                Voltar ao login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
