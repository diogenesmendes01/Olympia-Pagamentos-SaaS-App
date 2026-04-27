import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Users, X } from "lucide-react";
import { toast } from "sonner";
import { organization, useSession } from "../../lib/auth";
import {
  PRIMARY,
  PRIMARY_HOVER,
  PRIMARY_SOFT,
  GOLD_SOFT,
  GOLD_TEXT,
  DANGER,
  DANGER_BG,
} from "../styles/tokens";

// ── Tipos ─────────────────────────────────────────────────────────────────
type OrgRole = "owner" | "admin" | "member";
type AssignableRole = "admin" | "member";

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

interface InvitationRow {
  id: string;
  email: string;
  role: string;
  status: string;
  inviterId: string;
  expiresAt: string;
  createdAt: string;
}

// `listMembers` (BA 1.6.8) retorna `{ members, total }`; `listInvitations`
// retorna um array. Defendemos contra ambos os formatos pra evitar `any` casts.
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

function extractInvitations(data: unknown): InvitationRow[] {
  if (Array.isArray(data)) {
    return data.filter(isInvitationRow);
  }
  if (data && typeof data === "object" && "invitations" in data) {
    const inner = data.invitations;
    if (Array.isArray(inner)) {
      return inner.filter(isInvitationRow);
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

function isInvitationRow(value: unknown): value is InvitationRow {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.email === "string" &&
    typeof v.role === "string" &&
    typeof v.status === "string"
  );
}

function isAssignableRole(value: string): value is AssignableRole {
  return value === "admin" || value === "member";
}

// ── Estilo dos badges de role ─────────────────────────────────────────────
const roleBadge: Record<OrgRole, { bg: string; text: string; label: string }> =
  {
    owner: { bg: GOLD_SOFT, text: GOLD_TEXT, label: "Owner" },
    admin: { bg: PRIMARY_SOFT, text: PRIMARY, label: "Admin" },
    member: { bg: "#F1F5F9", text: "#64748B", label: "Membro" },
  };

function roleStyles(role: string): { bg: string; text: string; label: string } {
  if (role === "owner" || role === "admin" || role === "member") {
    return roleBadge[role];
  }
  // Role custom não-padrão da BA — mostra como genérica.
  return { bg: "#F1F5F9", text: "#64748B", label: role };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Página ────────────────────────────────────────────────────────────────
export function UsersPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InvitationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const [confirm, setConfirm] = useState<
    | { kind: "removeMember"; member: MemberRow }
    | { kind: "cancelInvite"; invite: InvitationRow }
    | null
  >(null);

  // Guard contra setState pós-unmount E contra refresh stale (refresh #N
  // resolvendo depois de refresh #N+1). refreshGenRef incrementa a cada chamada
  // e o resolver só aceita seu próprio gen.
  const mountedRef = useRef(true);
  const refreshGenRef = useRef(0);

  // Refetch sem toggle de loading global — usado depois de mutations.
  // setState calls vivem dentro de .then/.catch (assíncronos), satisfazendo
  // react-hooks/set-state-in-effect. Partial-success: cada lista só é
  // sobrescrita quando seu fetch retornar sem error — evita clobber de
  // dados válidos com [] em falha de uma das chamadas.
  function refresh(): void {
    refreshGenRef.current += 1;
    const gen = refreshGenRef.current;
    Promise.all([organization.listMembers(), organization.listInvitations()])
      .then(([mRes, iRes]) => {
        if (!mountedRef.current || gen !== refreshGenRef.current) return;
        if (mRes.error) {
          toast.error(mRes.error.message ?? "Falha ao carregar membros");
        } else {
          setMembers(extractMembers(mRes.data));
        }
        if (iRes.error) {
          toast.error(iRes.error.message ?? "Falha ao carregar convites");
        } else {
          // BA 1.6.8 não suporta filtro por status no endpoint; filtramos client-side.
          setInvites(
            extractInvitations(iRes.data).filter((i) => i.status === "pending"),
          );
        }
      })
      .catch(() => {
        if (!mountedRef.current || gen !== refreshGenRef.current) return;
        toast.error("Erro de conexão. Tente novamente.");
      });
  }

  // Carga inicial — `loading` começa true; só baixamos para false aqui.
  useEffect(() => {
    mountedRef.current = true;
    refreshGenRef.current += 1;
    const gen = refreshGenRef.current;
    Promise.all([organization.listMembers(), organization.listInvitations()])
      .then(([mRes, iRes]) => {
        if (!mountedRef.current || gen !== refreshGenRef.current) return;
        if (mRes.error) {
          toast.error(mRes.error.message ?? "Falha ao carregar membros");
        } else {
          setMembers(extractMembers(mRes.data));
        }
        if (iRes.error) {
          toast.error(iRes.error.message ?? "Falha ao carregar convites");
        } else {
          setInvites(
            extractInvitations(iRes.data).filter((i) => i.status === "pending"),
          );
        }
        setLoading(false);
      })
      .catch(() => {
        if (!mountedRef.current || gen !== refreshGenRef.current) return;
        toast.error("Erro de conexão. Tente novamente.");
        setLoading(false);
      });
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Mutações ────────────────────────────────────────────────────────────
  async function handleInvite(email: string, role: AssignableRole) {
    setBusyId("invite");
    try {
      const res = await organization.inviteMember({ email, role });
      if (res.error) {
        toast.error(res.error.message ?? "Falha ao convidar usuário");
        return;
      }
      toast.success(`Convite enviado para ${email}`);
      setShowInvite(false);
      refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleUpdateRole(memberId: string, role: AssignableRole) {
    setBusyId(memberId);
    try {
      const res = await organization.updateMemberRole({ memberId, role });
      if (res.error) {
        toast.error(res.error.message ?? "Falha ao atualizar role");
        return;
      }
      toast.success("Permissão atualizada");
      refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemoveMember(member: MemberRow) {
    setBusyId(member.id);
    try {
      const res = await organization.removeMember({
        memberIdOrEmail: member.id,
      });
      if (res.error) {
        toast.error(res.error.message ?? "Falha ao remover membro");
        return;
      }
      toast.success(`${member.user.name} foi removido`);
      setConfirm(null);
      refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancelInvite(invite: InvitationRow) {
    setBusyId(invite.id);
    try {
      const res = await organization.cancelInvitation({
        invitationId: invite.id,
      });
      if (res.error) {
        toast.error(res.error.message ?? "Falha ao cancelar convite");
        return;
      }
      toast.success("Convite cancelado");
      setConfirm(null);
      refresh();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
    } finally {
      setBusyId(null);
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────
  const currentUserId = session?.user?.id;

  return (
    <div className="space-y-5 p-5 lg:p-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontSize: 21,
              fontWeight: 800,
              color: PRIMARY,
            }}
          >
            Gestão de Usuários
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              color: "#64748B",
            }}
          >
            Membros da organização e convites pendentes
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setShowInvite(true);
          }}
          className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-white transition-all"
          style={{
            background: PRIMARY,
            fontFamily: "'Inter', sans-serif",
            fontSize: 12.5,
            fontWeight: 700,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = PRIMARY_HOVER;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = PRIMARY;
          }}
        >
          <Plus className="h-3.5 w-3.5" />
          Convidar usuário
        </button>
      </div>

      <div aria-live="polite" className="sr-only">
        {loading ? "Carregando membros..." : ""}
      </div>

      {/* Membros */}
      <section
        aria-labelledby="members-heading"
        className="overflow-hidden rounded-2xl bg-white"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <header
          className="flex items-center gap-2 border-b px-5 py-3.5"
          style={{ borderColor: "#F1F5F9" }}
        >
          <Users className="h-4 w-4" style={{ color: PRIMARY }} />
          <h2
            id="members-heading"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 700,
              color: PRIMARY,
            }}
          >
            Membros{" "}
            <span style={{ color: "#94A3B8", fontWeight: 500 }}>
              ({members.length})
            </span>
          </h2>
        </header>

        {loading ? (
          <p
            className="px-5 py-8 text-center"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "#64748B",
            }}
          >
            Carregando...
          </p>
        ) : members.length === 0 ? (
          <p
            className="px-5 py-8 text-center"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "#64748B",
            }}
          >
            Nenhum membro nesta organização.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "#F8FAFC" }}>
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-2.5 text-left"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Nome
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 text-left"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Permissão
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 text-right"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const styles = roleStyles(member.role);
                  const isOwner = member.role === "owner";
                  const isSelf = member.userId === currentUserId;
                  const isBusy = busyId === member.id;
                  const canChangeRole =
                    !isOwner && isAssignableRole(member.role);
                  return (
                    <tr
                      key={member.id}
                      className="border-t"
                      style={{ borderColor: "#F1F5F9" }}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            aria-hidden="true"
                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                            style={{
                              background: PRIMARY_SOFT,
                              color: PRIMARY,
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12,
                              fontWeight: 700,
                            }}
                          >
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: "#1E293B",
                              }}
                            >
                              {member.user.name}
                              {isSelf && (
                                <span
                                  style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 10.5,
                                    color: "#94A3B8",
                                    fontWeight: 500,
                                    marginLeft: 6,
                                  }}
                                >
                                  (você)
                                </span>
                              )}
                            </p>
                            <p
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 12,
                                color: "#64748B",
                              }}
                            >
                              {member.user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {canChangeRole ? (
                          <label
                            className="sr-only"
                            htmlFor={`role-${member.id}`}
                          >
                            Permissão de {member.user.name}
                          </label>
                        ) : null}
                        {canChangeRole ? (
                          <select
                            id={`role-${member.id}`}
                            disabled={isBusy}
                            value={member.role}
                            onChange={(e) => {
                              const next = e.target.value;
                              if (isAssignableRole(next)) {
                                void handleUpdateRole(member.id, next);
                              }
                            }}
                            className="rounded-lg border px-2.5 py-1.5 transition-colors focus:outline-none"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              color: styles.text,
                              background: styles.bg,
                              borderColor: "transparent",
                              fontWeight: 600,
                              cursor: isBusy ? "not-allowed" : "pointer",
                              opacity: isBusy ? 0.6 : 1,
                            }}
                          >
                            <option value="admin">Admin</option>
                            <option value="member">Membro</option>
                          </select>
                        ) : (
                          <span
                            className="inline-block rounded-lg px-2.5 py-1"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              fontWeight: 600,
                              background: styles.bg,
                              color: styles.text,
                            }}
                          >
                            {styles.label}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        {isOwner ? (
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 11.5,
                              color: "#94A3B8",
                            }}
                          >
                            Owner não removível
                          </span>
                        ) : isSelf ? (
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 11.5,
                              color: "#94A3B8",
                            }}
                          >
                            —
                          </span>
                        ) : (
                          <button
                            type="button"
                            disabled={isBusy}
                            aria-label={`Remover ${member.user.name}`}
                            onClick={() => {
                              setConfirm({ kind: "removeMember", member });
                            }}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12,
                              fontWeight: 600,
                              color: DANGER,
                              background: isBusy ? "#F1F5F9" : DANGER_BG,
                              opacity: isBusy ? 0.6 : 1,
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Remover
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Convites pendentes */}
      <section
        aria-labelledby="invites-heading"
        className="overflow-hidden rounded-2xl bg-white"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <header
          className="flex items-center gap-2 border-b px-5 py-3.5"
          style={{ borderColor: "#F1F5F9" }}
        >
          <h2
            id="invites-heading"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13.5,
              fontWeight: 700,
              color: PRIMARY,
            }}
          >
            Convites pendentes{" "}
            <span style={{ color: "#94A3B8", fontWeight: 500 }}>
              ({invites.length})
            </span>
          </h2>
        </header>

        {loading ? (
          <p
            className="px-5 py-8 text-center"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "#64748B",
            }}
          >
            Carregando...
          </p>
        ) : invites.length === 0 ? (
          <p
            className="px-5 py-8 text-center"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              color: "#64748B",
            }}
          >
            Nenhum convite pendente.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ background: "#F8FAFC" }}>
                <tr>
                  <th
                    scope="col"
                    className="px-5 py-2.5 text-left"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    E-mail
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 text-left"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Permissão
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 text-left"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Expira em
                  </th>
                  <th
                    scope="col"
                    className="px-5 py-2.5 text-right"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => {
                  const styles = roleStyles(invite.role);
                  const isBusy = busyId === invite.id;
                  const expires = new Date(invite.expiresAt);
                  const expiresLabel = Number.isNaN(expires.getTime())
                    ? "—"
                    : expires.toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });
                  return (
                    <tr
                      key={invite.id}
                      className="border-t"
                      style={{ borderColor: "#F1F5F9" }}
                    >
                      <td
                        className="px-5 py-3"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          color: "#1E293B",
                        }}
                      >
                        {invite.email}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className="inline-block rounded-lg px-2.5 py-1"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12.5,
                            fontWeight: 600,
                            background: styles.bg,
                            color: styles.text,
                          }}
                        >
                          {styles.label}
                        </span>
                      </td>
                      <td
                        className="px-5 py-3"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          color: "#64748B",
                        }}
                      >
                        {expiresLabel}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          type="button"
                          disabled={isBusy}
                          aria-label={`Cancelar convite para ${invite.email}`}
                          onClick={() => {
                            setConfirm({ kind: "cancelInvite", invite });
                          }}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 transition-colors"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12,
                            fontWeight: 600,
                            color: DANGER,
                            background: isBusy ? "#F1F5F9" : DANGER_BG,
                            opacity: isBusy ? 0.6 : 1,
                          }}
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancelar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de convite */}
      {showInvite && (
        <InviteDialog
          busy={busyId === "invite"}
          onClose={() => {
            setShowInvite(false);
          }}
          onSubmit={handleInvite}
        />
      )}

      {/* Modal de confirmação destrutiva */}
      {confirm?.kind === "removeMember" && (
        <ConfirmDialog
          title="Remover membro"
          description={`Tem certeza que deseja remover ${confirm.member.user.name} da organização? Eles perderão acesso imediato.`}
          confirmLabel="Remover"
          busy={busyId === confirm.member.id}
          onCancel={() => {
            setConfirm(null);
          }}
          onConfirm={() => {
            void handleRemoveMember(confirm.member);
          }}
        />
      )}
      {confirm?.kind === "cancelInvite" && (
        <ConfirmDialog
          title="Cancelar convite"
          description={`Cancelar o convite para ${confirm.invite.email}?`}
          confirmLabel="Cancelar convite"
          busy={busyId === confirm.invite.id}
          onCancel={() => {
            setConfirm(null);
          }}
          onConfirm={() => {
            void handleCancelInvite(confirm.invite);
          }}
        />
      )}
    </div>
  );
}

// ── Componentes auxiliares ────────────────────────────────────────────────

interface InviteDialogProps {
  busy: boolean;
  onClose: () => void;
  onSubmit: (email: string, role: AssignableRole) => Promise<void>;
}

function InviteDialog({ busy, onClose, onSubmit }: InviteDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AssignableRole>("member");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!EMAIL_REGEX.test(trimmed)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setError(null);
    void onSubmit(trimmed, role);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15, 23, 42, 0.45)" }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-title"
      aria-describedby="invite-desc"
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <h2
          id="invite-title"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 18,
            fontWeight: 800,
            color: PRIMARY,
            marginBottom: 4,
          }}
        >
          Convidar usuário
        </h2>
        <p
          id="invite-desc"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "#64748B",
            marginBottom: 18,
          }}
        >
          O usuário receberá um e-mail com o link de convite.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="invite-email"
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
              id="invite-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              aria-invalid={!!error}
              aria-describedby={error ? "invite-email-error" : undefined}
              className="w-full rounded-xl border px-4 py-2.5 transition-all focus:outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13.5,
                color: "#1E293B",
                background: "#FAFAF9",
                borderColor: error ? "#DC2626" : "#DDD8D0",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = PRIMARY;
                e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = error
                  ? "#DC2626"
                  : "#DDD8D0";
                e.currentTarget.style.boxShadow = "none";
              }}
              placeholder="usuario@empresa.com.br"
            />
            {error && (
              <p
                id="invite-email-error"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#DC2626",
                  marginTop: 6,
                }}
              >
                {error}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="invite-role"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 6,
              }}
            >
              Permissão
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => {
                const next = e.target.value;
                if (isAssignableRole(next)) {
                  setRole(next);
                }
              }}
              className="w-full rounded-xl border px-4 py-2.5 transition-all focus:outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13.5,
                color: "#1E293B",
                background: "#FAFAF9",
                borderColor: "#DDD8D0",
              }}
            >
              <option value="member">Membro — acesso padrão</option>
              <option value="admin">Admin — gerencia membros e convites</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl px-4 py-2 transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 600,
                color: "#64748B",
                background: "#F1F5F9",
                opacity: busy ? 0.6 : 1,
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl px-4 py-2 text-white transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                fontWeight: 700,
                background: busy ? "#94A3B8" : PRIMARY,
              }}
              onMouseEnter={(e) => {
                if (!busy) e.currentTarget.style.background = PRIMARY_HOVER;
              }}
              onMouseLeave={(e) => {
                if (!busy) e.currentTarget.style.background = PRIMARY;
              }}
            >
              {busy ? "Enviando..." : "Enviar convite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  busy,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "rgba(15, 23, 42, 0.45)" }}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <h2
          id="confirm-title"
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 17,
            fontWeight: 800,
            color: PRIMARY,
            marginBottom: 6,
          }}
        >
          {title}
        </h2>
        <p
          id="confirm-desc"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13,
            color: "#64748B",
            marginBottom: 18,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl px-4 py-2 transition-colors"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "#64748B",
              background: "#F1F5F9",
              opacity: busy ? 0.6 : 1,
            }}
          >
            Voltar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="rounded-xl px-4 py-2 text-white transition-colors"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 13,
              fontWeight: 700,
              background: busy ? "#94A3B8" : DANGER,
            }}
          >
            {busy ? "Processando..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
