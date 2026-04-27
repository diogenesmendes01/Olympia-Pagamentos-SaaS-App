import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { toast } from "sonner";
import { authClient, organization, signOut, useSession } from "../../lib/auth";

const C = {
  primary: "#1F3A5F",
  hover: "#274872",
  ivory: "#F4EFE6",
};

interface InviteData {
  email: string;
  organizationName: string;
}

type Status = "loading" | "ready" | "error";

export function InvitationPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState<string>("");
  // Guard against a double acceptInvitation call if the branch effect re-runs
  // (e.g. session object updates after membership is added but before navigate
  // unmounts the route).
  const acceptedRef = useRef(false);

  // Fetch invite data. setState calls live inside .then/.catch callbacks
  // (asynchronous), satisfying react-hooks/set-state-in-effect.
  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    authClient.organization
      .getInvitation({ query: { id } })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          const msg = error.message ?? "Convite inválido ou expirado.";
          setErrorMsg(msg);
          setStatus("error");
          toast.error(msg);
          return;
        }
        if (!data) {
          const msg = "Convite inválido ou expirado.";
          setErrorMsg(msg);
          setStatus("error");
          toast.error(msg);
          return;
        }
        setInvite({
          email: data.email,
          organizationName: data.organizationName,
        });
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        const msg = "Erro de conexão. Tente novamente.";
        setErrorMsg(msg);
        setStatus("error");
        toast.error(msg);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Branch routing once invite + session are both resolved. setState calls
  // here only happen inside .then/.catch callbacks (post-await), keeping the
  // effect body itself free of synchronous setState calls.
  useEffect(() => {
    if (isPending) return;
    if (status !== "ready") return;
    if (!invite || !id) return;

    // Branch 1: no session → signup with invite context.
    if (!session) {
      navigate(
        `/signup?invitation=${id}&email=${encodeURIComponent(invite.email)}`,
        { replace: true },
      );
      return;
    }

    // Branch 2: session matches invite email → accept and go to dashboard.
    if (session.user.email === invite.email) {
      if (acceptedRef.current) return;
      acceptedRef.current = true;
      let cancelled = false;
      organization
        .acceptInvitation({ invitationId: id })
        .then(async ({ error }) => {
          if (cancelled) return;
          if (error) {
            const msg = error.message ?? "Falha ao aceitar convite";
            toast.error(msg);
            // surface as error state so the UI explains the failure
            setErrorMsg(msg);
            setStatus("error");
            return;
          }
          // Força refetch da sessão pra RequireAuth ver o novo
          // activeOrganizationId no próximo render — evita flash de redirect
          // pra /onboarding/organization (mesmo padrão de OrgOnboardingPage).
          await authClient.getSession({ query: { disableCookieCache: true } });
          if (cancelled) return;
          navigate("/dashboard", { replace: true });
        })
        .catch(() => {
          if (cancelled) return;
          const msg = "Erro de conexão. Tente novamente.";
          toast.error(msg);
          setErrorMsg(msg);
          setStatus("error");
        });
      return () => {
        cancelled = true;
      };
    }

    // Branch 3: session email diverges → fall through to render the
    // "Convite para outra conta" UI below (no navigation).
  }, [session, invite, id, navigate, isPending, status]);

  // ─── Render ───────────────────────────────────────────────────────────────
  // Short-circuit on missing :id without touching effect state.
  if (!id) {
    return (
      <Shell busy={false}>
        <ErrorState message="Convite inválido ou expirado." />
      </Shell>
    );
  }

  if (status === "error") {
    return (
      <Shell busy={false}>
        <ErrorState message={errorMsg || "Convite inválido ou expirado."} />
      </Shell>
    );
  }

  if (status === "loading" || isPending || !invite) {
    return (
      <Shell busy={true}>
        <LoadingState />
      </Shell>
    );
  }

  // status === "ready" + invite present
  if (session && session.user.email !== invite.email) {
    return (
      <Shell busy={false}>
        <DivergentEmailState
          inviteEmail={invite.email}
          sessionEmail={session.user.email}
          organizationName={invite.organizationName}
          onSwitch={async () => {
            try {
              await signOut();
              navigate(`/login?email=${encodeURIComponent(invite.email)}`, {
                replace: true,
              });
            } catch {
              toast.error("Falha ao encerrar sessão");
            }
          }}
        />
      </Shell>
    );
  }

  // Either branch 1 (no session) is mid-redirect, or branch 2 is mid-accept.
  // Neutral "processing" UI prevents flash-of-empty content.
  return (
    <Shell busy={true}>
      {session?.user.email === invite.email ? (
        <AcceptingState />
      ) : (
        <ProcessingState />
      )}
    </Shell>
  );
}

// ─── Layout shell ───────────────────────────────────────────────────────────

interface ShellProps {
  busy: boolean;
  children: React.ReactNode;
}

function Shell({ busy, children }: ShellProps) {
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
          <div className="p-7" aria-live="polite" aria-busy={busy}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-views ──────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <>
      <h1
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 20,
          fontWeight: 800,
          color: C.primary,
          marginBottom: 10,
        }}
      >
        Carregando convite
      </h1>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          color: "#64748B",
        }}
      >
        Verificando os detalhes do convite...
      </p>
    </>
  );
}

function AcceptingState() {
  return (
    <>
      <h1
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 20,
          fontWeight: 800,
          color: C.primary,
          marginBottom: 10,
        }}
      >
        Aceitando convite
      </h1>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          color: "#64748B",
        }}
      >
        Adicionando você à organização...
      </p>
    </>
  );
}

function ProcessingState() {
  return (
    <>
      <h1
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 20,
          fontWeight: 800,
          color: C.primary,
          marginBottom: 10,
        }}
      >
        Processando convite
      </h1>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          color: "#64748B",
        }}
      >
        Redirecionando...
      </p>
    </>
  );
}

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <>
      <h1
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 20,
          fontWeight: 800,
          color: C.primary,
          marginBottom: 10,
        }}
      >
        Convite inválido
      </h1>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          color: "#DC2626",
          marginBottom: 18,
        }}
      >
        {message || "Convite inválido ou expirado."}
      </p>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: "#64748B",
        }}
      >
        Peça pra quem te convidou enviar um novo link.
      </p>
    </>
  );
}

interface DivergentEmailStateProps {
  inviteEmail: string;
  sessionEmail: string;
  organizationName: string;
  onSwitch: () => Promise<void>;
}

function DivergentEmailState({
  inviteEmail,
  sessionEmail,
  organizationName,
  onSwitch,
}: DivergentEmailStateProps) {
  const [busy, setBusy] = useState(false);

  return (
    <>
      <h1
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 20,
          fontWeight: 800,
          color: C.primary,
          marginBottom: 6,
        }}
      >
        Convite para outra conta
      </h1>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13.5,
          color: "#64748B",
          marginBottom: 16,
          lineHeight: 1.6,
        }}
      >
        O convite para entrar em{" "}
        <strong style={{ color: C.primary }}>{organizationName}</strong> foi
        enviado para <strong style={{ color: C.primary }}>{inviteEmail}</strong>
        , mas você está conectado como{" "}
        <strong style={{ color: C.primary }}>{sessionEmail}</strong>.
      </p>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 13,
          color: "#64748B",
          marginBottom: 22,
        }}
      >
        Saia da sessão atual e entre com o email correto para aceitar o convite.
      </p>
      <button
        type="button"
        disabled={busy}
        aria-label={`Sair e entrar com ${inviteEmail}`}
        onClick={() => {
          setBusy(true);
          onSwitch().finally(() => {
            setBusy(false);
          });
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-white transition-all"
        style={{
          background: busy ? "#94A3B8" : C.primary,
          fontFamily: "'Inter', sans-serif",
          fontSize: 14,
          fontWeight: 700,
          letterSpacing: "0.01em",
        }}
        onMouseEnter={(e) => {
          if (!busy) e.currentTarget.style.background = C.hover;
        }}
        onMouseLeave={(e) => {
          if (!busy) e.currentTarget.style.background = C.primary;
        }}
      >
        {busy ? "Saindo..." : `Sair e entrar com ${inviteEmail}`}
      </button>
    </>
  );
}
