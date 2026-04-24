import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@olympia/shared/schemas/auth";
import { authClient } from "../../lib/auth";

const C = {
  primary: "#1F3A5F",
  hover: "#274872",
  gold: "#C8A96B",
  ivory: "#F4EFE6",
};

export function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get("token");
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  const form = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", token: token ?? "" },
    values: { password: "", token: token ?? "" },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  async function onSubmit(values: ResetPasswordInput) {
    try {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token: values.token,
      });
      if (error) {
        toast.error(error.message ?? "Falha ao redefinir senha");
        return;
      }
      toast.success("Senha redefinida. Faça login.");
      navigate("/login");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    }
  }

  if (!token) {
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
                Link inválido
              </h1>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  color: "#64748B",
                  marginBottom: 18,
                }}
              >
                O link de redefinição está ausente ou expirou.
              </p>
              <Link
                to="/forgot-password"
                style={{
                  color: C.primary,
                  fontWeight: 600,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                }}
              >
                Solicitar novo link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
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
              Redefinir senha
            </h1>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 22,
              }}
            >
              Escolha uma nova senha pra sua conta.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
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
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    aria-invalid={!!errors.password}
                    aria-describedby={
                      errors.password ? "password-error" : undefined
                    }
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
                    id="password-error"
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
                {isSubmitting ? "Redefinindo..." : "Redefinir senha"}
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
