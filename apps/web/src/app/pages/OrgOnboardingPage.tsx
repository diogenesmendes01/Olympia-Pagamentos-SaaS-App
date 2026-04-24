import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { authClient, organization } from "../../lib/auth";
import {
  createOrgSchema,
  type CreateOrgInput,
} from "@olympia/shared/schemas/organization";

const C = {
  primary: "#1F3A5F",
  hover: "#274872",
  ivory: "#F4EFE6",
};

function kebabCase(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function OrgOnboardingPage() {
  const navigate = useNavigate();
  const form = useForm<CreateOrgInput>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: "", slug: "", cnpj: "" },
  });

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getFieldState,
    formState: { errors, isSubmitting },
  } = form;

  const nameValue = useWatch({ control, name: "name" });

  useEffect(() => {
    const slugState = getFieldState("slug");
    // só auto-preenche enquanto o usuário não tocou no campo slug
    if (!slugState.isDirty) {
      setValue("slug", kebabCase(nameValue ?? ""), {
        shouldValidate: false,
      });
    }
  }, [nameValue, setValue, getFieldState]);

  async function onSubmit(values: CreateOrgInput) {
    try {
      const { data, error } = await organization.create(values);
      if (error) {
        toast.error(error.message ?? "Falha ao criar organização");
        return;
      }
      if (!data) {
        toast.error("Falha ao criar organização");
        return;
      }
      await organization.setActive({ organizationId: data.id });
      // Força refetch da sessão pra RequireAuth enxergar activeOrganizationId
      // no próximo render — evita flash de redirect pra /onboarding/organization.
      await authClient.getSession({ query: { disableCookieCache: true } });
      navigate("/dashboard");
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
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: C.primary,
                marginBottom: 2,
              }}
            >
              Criar sua organização
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 22,
              }}
            >
              Configure sua empresa para começar a usar a Olympia Pagamentos
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
                  Nome da organização
                </label>
                <input
                  id="name"
                  type="text"
                  autoComplete="organization"
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
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
                  placeholder="Minha Empresa LTDA"
                />
                {errors.name && (
                  <p
                    id="name-error"
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

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Identificador (slug)
                </label>
                <input
                  id="slug"
                  type="text"
                  autoComplete="off"
                  aria-invalid={!!errors.slug}
                  aria-describedby={errors.slug ? "slug-error" : "slug-helper"}
                  {...register("slug")}
                  className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    color: "#1E293B",
                    background: "#FAFAF9",
                    borderColor: errors.slug ? "#DC2626" : "#DDD8D0",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.slug
                      ? "#DC2626"
                      : "#DDD8D0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="minha-empresa"
                />
                {errors.slug ? (
                  <p
                    id="slug-error"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#DC2626",
                      marginTop: 6,
                    }}
                  >
                    {errors.slug.message}
                  </p>
                ) : (
                  <p
                    id="slug-helper"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#64748B",
                      marginTop: 6,
                    }}
                  >
                    Somente letras minúsculas, números e hífen
                  </p>
                )}
              </div>

              {/* CNPJ */}
              <div>
                <label
                  htmlFor="cnpj"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  CNPJ{" "}
                  <span style={{ color: "#94A3B8", fontWeight: 400 }}>
                    (opcional)
                  </span>
                </label>
                <input
                  id="cnpj"
                  type="text"
                  autoComplete="off"
                  aria-invalid={!!errors.cnpj}
                  aria-describedby={errors.cnpj ? "cnpj-error" : undefined}
                  {...register("cnpj")}
                  className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    color: "#1E293B",
                    background: "#FAFAF9",
                    borderColor: errors.cnpj ? "#DC2626" : "#DDD8D0",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = C.primary;
                    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.cnpj
                      ? "#DC2626"
                      : "#DDD8D0";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  placeholder="00.000.000/0000-00"
                />
                {errors.cnpj && (
                  <p
                    id="cnpj-error"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#DC2626",
                      marginTop: 6,
                    }}
                  >
                    {errors.cnpj.message}
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
                {isSubmitting ? "Criando organização..." : "Criar organização"}
                {!isSubmitting && <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
