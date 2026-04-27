import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Building2, UserCog } from "lucide-react";
import { toast } from "sonner";
import { authClient, organization, useSession } from "../../lib/auth";
import {
  createOrgSchema,
  type CreateOrgInput,
} from "@olympia/shared/schemas/organization";
import {
  PRIMARY,
  PRIMARY_HOVER,
  DANGER,
  DANGER_BG,
  DANGER_BORDER,
} from "../styles/tokens";

// ── Tipos ─────────────────────────────────────────────────────────────────
interface MemberRow {
  id: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

interface OrgInfo {
  id: string;
  name: string;
  slug: string;
}

// `listMembers` (BA 1.6.8) retorna `{ members, total }`; defendemos contra
// formato em array também — mesmo helper que a UsersPage usa.
function extractMembers(data: unknown): MemberRow[] {
  if (Array.isArray(data)) {
    return data.filter(isMemberRow);
  }
  if (data && typeof data === "object" && "members" in data) {
    const inner = data.members;
    if (Array.isArray(inner)) {
      return inner.filter(isMemberRow);
    }
  }
  return [];
}

function isMemberRow(value: unknown): value is MemberRow {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.userId === "string" &&
    typeof v.role === "string" &&
    typeof v.user === "object" &&
    v.user !== null
  );
}

// Pega um campo string do entity de org que o servidor devolveu (resposta de
// `organization.update`). Defensivo contra shapes que mudam em patches da BA.
function extractOrgField(data: unknown, key: "name" | "slug"): string | null {
  if (!data || typeof data !== "object") return null;
  const v = (data as Record<string, unknown>)[key];
  return typeof v === "string" ? v : null;
}

// `organization.list()` retorna array direto de orgs (ver OrgSwitcher).
function findActiveOrg(data: unknown, activeId: string): OrgInfo | null {
  if (!Array.isArray(data)) return null;
  for (const item of data) {
    if (!item || typeof item !== "object") continue;
    const v = item as Record<string, unknown>;
    if (
      v.id === activeId &&
      typeof v.id === "string" &&
      typeof v.name === "string" &&
      typeof v.slug === "string"
    ) {
      return { id: v.id, name: v.name, slug: v.slug };
    }
  }
  return null;
}

export function OrgSettingsPage() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const activeOrgId = session?.session?.activeOrganizationId ?? null;
  const currentUserId = session?.user?.id ?? null;

  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"rename" | "transfer" | "delete" | null>(
    null,
  );
  const [transferTargetId, setTransferTargetId] = useState<string>("");
  const [confirmTransfer, setConfirmTransfer] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteTyped, setDeleteTyped] = useState("");

  const mountedRef = useRef(true);

  const form = useForm<CreateOrgInput>({
    resolver: zodResolver(createOrgSchema),
    defaultValues: { name: "", slug: "", cnpj: "" },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = form;

  // ── Carga inicial ───────────────────────────────────────────────────────
  // Esta página é gated por RequireOrgRole=["owner"], então activeOrgId é
  // garantido. Se vier null, paramos o fetch silenciosamente — o guard já
  // redirecionou (estamos numa render transiente).
  useEffect(() => {
    mountedRef.current = true;
    if (!activeOrgId) {
      return () => {
        mountedRef.current = false;
      };
    }
    const orgIdSnapshot = activeOrgId;
    let cancelled = false;
    Promise.all([organization.list(), organization.listMembers()])
      .then(([orgRes, mRes]) => {
        if (cancelled || !mountedRef.current) return;
        if (orgRes.error) {
          toast.error(orgRes.error.message ?? "Falha ao carregar organização");
        } else {
          const found = findActiveOrg(orgRes.data, orgIdSnapshot);
          if (found) {
            setOrg(found);
            reset({ name: found.name, slug: found.slug, cnpj: "" });
          } else {
            toast.error("Organização ativa não encontrada");
          }
        }
        if (mRes.error) {
          toast.error(mRes.error.message ?? "Falha ao carregar membros");
        } else {
          setMembers(extractMembers(mRes.data));
        }
        setLoading(false);
      })
      .catch(() => {
        if (cancelled || !mountedRef.current) return;
        toast.error("Erro de conexão. Tente novamente.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
      mountedRef.current = false;
    };
  }, [activeOrgId, reset]);

  // ── Identidade: rename ──────────────────────────────────────────────────
  async function onRenameSubmit(values: CreateOrgInput) {
    if (!activeOrgId) return;
    setBusy("rename");
    try {
      const res = await organization.update({
        data: { name: values.name, slug: values.slug },
        organizationId: activeOrgId,
      });
      if (res.error) {
        toast.error(res.error.message ?? "Falha ao atualizar organização");
        return;
      }
      // Prefere o entity que o servidor devolveu (BA pode normalizar slug,
      // trim de espaços etc.). Fallback pros valores do form se a resposta
      // não trouxer os campos.
      const nameOnServer = extractOrgField(res.data, "name") ?? values.name;
      const slugOnServer = extractOrgField(res.data, "slug") ?? values.slug;
      setOrg({ id: activeOrgId, name: nameOnServer, slug: slugOnServer });
      reset({ name: nameOnServer, slug: slugOnServer, cnpj: "" });
      toast.success("Organização atualizada");
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  // ── Transferência de ownership ──────────────────────────────────────────
  // BA 1.6.8 NÃO auto-rebaixa o owner anterior — promove o alvo para owner
  // mas o usuário corrente continua com role "owner". Pra completar a
  // transferência precisamos chamar updateMemberRole de novo no nosso
  // próprio member pra virar admin.
  async function handleTransferOwnership() {
    if (!activeOrgId || !transferTargetId || !currentUserId) return;
    const myMember = members.find((m) => m.userId === currentUserId);
    if (!myMember) {
      toast.error("Membro atual não encontrado");
      return;
    }
    setBusy("transfer");
    try {
      // 1. Promove o alvo para owner.
      const promoteRes = await organization.updateMemberRole({
        memberId: transferTargetId,
        role: "owner",
      });
      if (promoteRes.error) {
        toast.error(
          promoteRes.error.message ?? "Falha ao transferir ownership",
        );
        return;
      }
      // 2. Rebaixa o usuário atual (owner anterior) para admin. Como agora
      // existem dois owners, o backend permite o downgrade sem violar
      // YOU_CANNOT_LEAVE_THE_ORGANIZATION_WITHOUT_AN_OWNER.
      const demoteRes = await organization.updateMemberRole({
        memberId: myMember.id,
        role: "admin",
      });
      if (demoteRes.error) {
        // Estado parcial: o alvo já é owner mas nós também continuamos owner.
        // Avisa o usuário com uma toast persistente (Infinity) explicando o
        // estado e dando uma instrução acionável.
        toast.error(
          "Ownership transferido, mas falha ao rebaixar você para admin. " +
            "A organização tem dois owners agora — peça ao novo owner para " +
            "rebaixar você, ou tente novamente mais tarde.",
          { duration: Infinity },
        );
        return;
      }
      toast.success("Ownership transferido");
      setConfirmTransfer(false);
      // Força refetch da sessão pra que RequireOrgRole enxergue o novo role.
      // O guard vai redirecionar para /dashboard automaticamente.
      await authClient.getSession({ query: { disableCookieCache: true } });
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  // ── Zona perigosa: delete ───────────────────────────────────────────────
  async function handleDeleteOrg() {
    if (!activeOrgId) return;
    setBusy("delete");
    try {
      const res = await organization.delete({ organizationId: activeOrgId });
      if (res.error) {
        toast.error(res.error.message ?? "Falha ao deletar organização");
        return;
      }
      toast.success("Organização deletada");
      setConfirmDelete(false);
      // Após delete, BA limpa activeOrganizationId. Se o usuário ainda
      // pertence a outras orgs, ativa a primeira disponível e manda pro
      // /dashboard. Senão, vai pro onboarding.
      await authClient.getSession({ query: { disableCookieCache: true } });
      const listRes = await organization.list();
      const remaining =
        Array.isArray(listRes.data) && listRes.data.length > 0
          ? (listRes.data[0] as { id?: unknown }).id
          : null;
      if (typeof remaining === "string") {
        await organization.setActive({ organizationId: remaining });
        await authClient.getSession({ query: { disableCookieCache: true } });
        navigate("/dashboard");
      } else {
        navigate("/onboarding/organization");
      }
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setBusy(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  const adminMembers = members.filter(
    (m) => m.role === "admin" && m.userId !== currentUserId,
  );

  if (loading) {
    return (
      <div className="space-y-5 p-5 lg:p-6">
        <p
          aria-live="polite"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "#64748B",
          }}
        >
          Carregando configurações da organização...
        </p>
      </div>
    );
  }

  if (!org) {
    return (
      <div className="space-y-5 p-5 lg:p-6">
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "#64748B",
          }}
        >
          Nenhuma organização ativa selecionada.
        </p>
      </div>
    );
  }

  const renameBusy = busy === "rename" || isSubmitting;
  const transferBusy = busy === "transfer";
  const deleteBusy = busy === "delete";
  const anyBusy = busy !== null || isSubmitting;
  // Trim pra tolerar espaços colados acidentalmente; mantém case-sensitive
  // (convenção do GitHub/Vercel pra type-to-confirm).
  const deleteConfirmed = deleteTyped.trim() === org.name;

  return (
    <div className="space-y-5 p-5 lg:p-6">
      {/* Header */}
      <div>
        <h1
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 21,
            fontWeight: 800,
            color: PRIMARY,
          }}
        >
          Configurações da organização
        </h1>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12.5,
            color: "#64748B",
          }}
        >
          Gerencie identidade, ownership e exclusão da organização
        </p>
      </div>

      {/* Identidade */}
      <section
        aria-labelledby="identity-heading"
        className="overflow-hidden rounded-2xl bg-white"
        style={{ border: "1px solid #E8DDD0" }}
      >
        <header
          className="flex items-center gap-2 border-b px-5 py-3.5"
          style={{ borderColor: "#F1F5F9" }}
        >
          <Building2 className="h-4 w-4" style={{ color: PRIMARY }} />
          <h2
            id="identity-heading"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 700,
              color: PRIMARY,
            }}
          >
            Identidade
          </h2>
        </header>
        <form
          onSubmit={handleSubmit(onRenameSubmit)}
          className="space-y-4 p-5"
          noValidate
        >
          <div>
            <label
              htmlFor="org-name"
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
              id="org-name"
              type="text"
              autoComplete="organization"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "org-name-error" : undefined}
              {...register("name")}
              disabled={renameBusy}
              className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13.5,
                color: "#1E293B",
                background: "#FAFAF9",
                borderColor: errors.name ? "#DC2626" : "#DDD8D0",
                opacity: renameBusy ? 0.6 : 1,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = PRIMARY;
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.name
                  ? "#DC2626"
                  : "#DDD8D0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {errors.name && (
              <p
                id="org-name-error"
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
          <div>
            <label
              htmlFor="org-slug"
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
              id="org-slug"
              type="text"
              autoComplete="off"
              aria-invalid={!!errors.slug}
              aria-describedby={
                errors.slug ? "org-slug-error" : "org-slug-helper"
              }
              {...register("slug")}
              disabled={renameBusy}
              className="w-full rounded-xl border px-4 py-3 transition-all focus:outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13.5,
                color: "#1E293B",
                background: "#FAFAF9",
                borderColor: errors.slug ? "#DC2626" : "#DDD8D0",
                opacity: renameBusy ? 0.6 : 1,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = PRIMARY;
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = errors.slug
                  ? "#DC2626"
                  : "#DDD8D0";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {errors.slug ? (
              <p
                id="org-slug-error"
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
                id="org-slug-helper"
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
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={anyBusy}
              className="rounded-xl px-5 py-2.5 text-white transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                background: anyBusy ? "#94A3B8" : PRIMARY,
              }}
              onMouseEnter={(e) => {
                if (!anyBusy) e.currentTarget.style.background = PRIMARY_HOVER;
              }}
              onMouseLeave={(e) => {
                if (!anyBusy) e.currentTarget.style.background = PRIMARY;
              }}
            >
              {renameBusy ? "Salvando..." : "Salvar alterações"}
            </button>
          </div>
        </form>
      </section>

      {/* Transferência de ownership */}
      <section
        aria-labelledby="transfer-heading"
        className="overflow-hidden rounded-2xl bg-white"
        style={{ border: "1px solid #E8DDD0" }}
      >
        <header
          className="flex items-center gap-2 border-b px-5 py-3.5"
          style={{ borderColor: "#F1F5F9" }}
        >
          <UserCog className="h-4 w-4" style={{ color: PRIMARY }} />
          <h2
            id="transfer-heading"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 700,
              color: PRIMARY,
            }}
          >
            Transferência de ownership
          </h2>
        </header>
        <div className="space-y-4 p-5">
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              color: "#64748B",
              lineHeight: 1.5,
            }}
          >
            Selecione um administrador para se tornar o novo owner. Você virará
            admin e perderá acesso a esta página.
          </p>
          {adminMembers.length === 0 ? (
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                color: "#94A3B8",
                fontStyle: "italic",
              }}
            >
              Nenhum admin disponível para receber ownership. Promova um membro
              a admin antes de transferir.
            </p>
          ) : (
            <>
              <div>
                <label
                  htmlFor="transfer-target"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  Novo owner
                </label>
                <select
                  id="transfer-target"
                  value={transferTargetId}
                  onChange={(e) => {
                    setTransferTargetId(e.target.value);
                  }}
                  disabled={anyBusy}
                  className="w-full rounded-xl border px-4 py-2.5 transition-all focus:outline-none"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    color: "#1E293B",
                    background: "#FAFAF9",
                    borderColor: "#DDD8D0",
                    opacity: anyBusy ? 0.6 : 1,
                  }}
                >
                  <option value="">Selecione um admin...</option>
                  {adminMembers.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.user.name} ({m.user.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={!transferTargetId || anyBusy}
                  onClick={() => {
                    setConfirmTransfer(true);
                  }}
                  className="rounded-xl px-5 py-2.5 text-white transition-colors"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    background:
                      !transferTargetId || anyBusy ? "#94A3B8" : PRIMARY,
                  }}
                  onMouseEnter={(e) => {
                    if (transferTargetId && !anyBusy)
                      e.currentTarget.style.background = PRIMARY_HOVER;
                  }}
                  onMouseLeave={(e) => {
                    if (transferTargetId && !anyBusy)
                      e.currentTarget.style.background = PRIMARY;
                  }}
                >
                  Transferir
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Zona perigosa */}
      <section
        aria-labelledby="danger-heading"
        className="overflow-hidden rounded-2xl bg-white"
        style={{ border: `1px solid ${DANGER_BORDER}` }}
      >
        <header
          className="flex items-center gap-2 border-b px-5 py-3.5"
          style={{ borderColor: DANGER_BORDER, background: DANGER_BG }}
        >
          <AlertTriangle className="h-4 w-4" style={{ color: DANGER }} />
          <h2
            id="danger-heading"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 700,
              color: DANGER,
            }}
          >
            Zona perigosa
          </h2>
        </header>
        <div className="space-y-4 p-5">
          <div>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                color: "#1E293B",
                marginBottom: 4,
              }}
            >
              Deletar organização
            </h3>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                color: "#64748B",
                lineHeight: 1.5,
              }}
            >
              Esta ação é permanente. Todos os membros perdem acesso, e dados
              associados são removidos. Não há como desfazer.
            </p>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              disabled={anyBusy}
              onClick={() => {
                setConfirmDelete(true);
                setDeleteTyped("");
              }}
              className="rounded-xl px-5 py-2.5 text-white transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                background: anyBusy ? "#94A3B8" : DANGER,
                opacity: anyBusy ? 0.6 : 1,
              }}
            >
              Deletar organização
            </button>
          </div>
        </div>
      </section>

      {/* Modal: confirmar transferência */}
      {confirmTransfer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(15, 23, 42, 0.45)" }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="transfer-confirm-title"
          aria-describedby="transfer-confirm-desc"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <h2
              id="transfer-confirm-title"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: PRIMARY,
                marginBottom: 6,
              }}
            >
              Transferir ownership
            </h2>
            <p
              id="transfer-confirm-desc"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 18,
                lineHeight: 1.5,
              }}
            >
              Você vai virar admin. Deseja continuar?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={transferBusy}
                onClick={() => {
                  setConfirmTransfer(false);
                }}
                className="rounded-xl px-4 py-2 transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#64748B",
                  background: "#F1F5F9",
                  opacity: transferBusy ? 0.6 : 1,
                }}
              >
                Voltar
              </button>
              <button
                type="button"
                disabled={transferBusy}
                onClick={() => {
                  void handleTransferOwnership();
                }}
                className="rounded-xl px-4 py-2 text-white transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  background: transferBusy ? "#94A3B8" : PRIMARY,
                }}
                onMouseEnter={(e) => {
                  if (!transferBusy)
                    e.currentTarget.style.background = PRIMARY_HOVER;
                }}
                onMouseLeave={(e) => {
                  if (!transferBusy) e.currentTarget.style.background = PRIMARY;
                }}
              >
                {transferBusy ? "Transferindo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: type-to-confirm de delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: "rgba(15, 23, 42, 0.45)" }}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-confirm-title"
          aria-describedby="delete-confirm-desc"
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <h2
              id="delete-confirm-title"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: DANGER,
                marginBottom: 6,
              }}
            >
              Deletar organização
            </h2>
            <p
              id="delete-confirm-desc"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#64748B",
                marginBottom: 14,
                lineHeight: 1.5,
              }}
            >
              Esta ação é permanente. Digite o nome da organização (
              <strong style={{ color: "#1E293B" }}>{org.name}</strong>) para
              confirmar.
            </p>
            <div>
              <label htmlFor="delete-confirm-input" className="sr-only">
                Nome da organização para confirmar
              </label>
              <input
                id="delete-confirm-input"
                type="text"
                autoComplete="off"
                value={deleteTyped}
                onChange={(e) => {
                  setDeleteTyped(e.target.value);
                }}
                disabled={deleteBusy}
                className="mb-4 w-full rounded-xl border px-4 py-2.5 transition-all focus:outline-none"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  color: "#1E293B",
                  background: "#FAFAF9",
                  borderColor: "#DDD8D0",
                  opacity: deleteBusy ? 0.6 : 1,
                }}
                placeholder={org.name}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={deleteBusy}
                onClick={() => {
                  setConfirmDelete(false);
                  setDeleteTyped("");
                }}
                className="rounded-xl px-4 py-2 transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#64748B",
                  background: "#F1F5F9",
                  opacity: deleteBusy ? 0.6 : 1,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={!deleteConfirmed || deleteBusy}
                onClick={() => {
                  void handleDeleteOrg();
                }}
                className="rounded-xl px-4 py-2 text-white transition-colors"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                  background:
                    !deleteConfirmed || deleteBusy ? "#94A3B8" : DANGER,
                  opacity: !deleteConfirmed || deleteBusy ? 0.6 : 1,
                }}
              >
                {deleteBusy ? "Deletando..." : "Deletar permanentemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
