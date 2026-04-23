import { useState } from "react";
import {
  CheckCircle, ArrowRight, ArrowLeft, Eye, EyeOff,
  Shield, Lock, User, Phone, Bell, FileText, DollarSign,
  BarChart3, Settings, Users
} from "lucide-react";
import { toast } from "sonner";
import {
  PRIMARY as P, PRIMARY_HOVER as PH, GOLD as G,
  SUCCESS, SUCCESS_BG, SUCCESS_BORDER,
  DANGER, DANGER_BG, DANGER_BORDER,
  WARNING, WARNING_BG,
  PRIMARY_SOFT,
} from "../../styles/tokens";

interface Props { onComplete: () => void; }

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { n: 1, label: "Convite" },
  { n: 2, label: "Senha" },
  { n: 3, label: "Perfil" },
  { n: 4, label: "Acesso" },
];

// Mock invite details
const INVITE = {
  empresa:    "Olympia Pagamentos",
  cnpj:       "12.345.678/0001-90",
  convidadoPor: "Rafael Oliveira",
  cargo:      "CEO & Founder",
  role:       "Financeiro",
  avatar:     "RO",
};

const ROLE_PERMS: Record<string, { icon: any; label: string; allowed: boolean }[]> = {
  Financeiro: [
    { icon: DollarSign, label: "Contas a Receber",     allowed: true },
    { icon: FileText,   label: "Contas a Pagar",       allowed: true },
    { icon: BarChart3,  label: "Relatórios",           allowed: true },
    { icon: Bell,       label: "Notificações",         allowed: true },
    { icon: Users,      label: "Gestão de Usuários",   allowed: false },
    { icon: Settings,   label: "Configurações",        allowed: false },
  ],
  Operacional: [
    { icon: DollarSign, label: "Contas a Receber",     allowed: true },
    { icon: FileText,   label: "Contas a Pagar",       allowed: true },
    { icon: BarChart3,  label: "Relatórios",           allowed: true },
    { icon: Bell,       label: "Notificações",         allowed: true },
    { icon: Users,      label: "Gestão de Usuários",   allowed: false },
    { icon: Settings,   label: "Configurações",        allowed: false },
  ],
  Visualizador: [
    { icon: DollarSign, label: "Contas a Receber",     allowed: true },
    { icon: FileText,   label: "Contas a Pagar",       allowed: true },
    { icon: BarChart3,  label: "Relatórios",           allowed: true },
    { icon: Bell,       label: "Notificações",         allowed: false },
    { icon: Users,      label: "Gestão de Usuários",   allowed: false },
    { icon: Settings,   label: "Configurações",        allowed: false },
  ],
};

function strengthLabel(pwd: string): { pct: number; label: string; color: string } {
  if (pwd.length === 0) return { pct: 0, label: "", color: "#E2E8F0" };
  const checks = [pwd.length >= 8, /[A-Z]/.test(pwd), /[0-9]/.test(pwd), /[^A-Za-z0-9]/.test(pwd), pwd.length >= 12];
  const score = checks.filter(Boolean).length;
  if (score <= 1) return { pct: 20, label: "Muito fraca",  color: DANGER };
  if (score <= 2) return { pct: 40, label: "Fraca",        color: WARNING };
  if (score <= 3) return { pct: 60, label: "Razoável",     color: "#B8872F" };
  if (score <= 4) return { pct: 80, label: "Boa",          color: SUCCESS };
  return                { pct: 100, label: "Excelente",    color: SUCCESS };
}

export function InvitedOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [accepted, setAccepted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [profile, setProfile] = useState({ nome: "", telefone: "" });
  const [finishing, setFinishing] = useState(false);

  const strength = strengthLabel(password);
  const pwdMatch = confirm.length > 0 && password === confirm;
  const pwdMismatch = confirm.length > 0 && password !== confirm;
  const perms = ROLE_PERMS[INVITE.role] ?? ROLE_PERMS.Financeiro;

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const handleFinish = async () => {
    setFinishing(true);
    await new Promise(r => setTimeout(r, 1000));
    setFinishing(false);
    toast.success("Conta ativada! Bem-vindo à Olympia.");
    onComplete();
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-all";
  const inputSty = { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#374151", background: "#FFFFFF" };
  const onF = (e: any) => { e.currentTarget.style.borderColor = P; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.08)`; };
  const onB = (e: any, err?: boolean) => { e.currentTarget.style.borderColor = err ? DANGER : "#CBD5E1"; e.currentTarget.style.boxShadow = "none"; };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-3xl shadow-2xl w-full flex flex-col overflow-hidden"
        style={{ maxWidth: 520, maxHeight: "95vh" }}>

        {/* Top bar */}
        <div style={{ background: P, padding: "20px 24px 0" }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(200,169,107,0.15)", border: `1.5px solid ${G}` }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: G }}>O</span>
              </div>
              <div>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 12, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.12em" }}>OLYMPIA</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", display: "block" }}>PAGAMENTOS</span>
              </div>
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "rgba(255,255,255,0.6)" }}>
              Passo {step} de {STEPS.length}
            </span>
          </div>

          <div className="flex gap-1">
            {STEPS.map(s => (
              <button key={s.n} disabled={step <= s.n}
                onClick={() => step > s.n && setStep(s.n as Step)}
                className="flex-1 py-2.5 rounded-t-xl transition-all"
                style={{ background: step === s.n ? "white" : "transparent" }}>
                <span style={{
                  fontFamily: "'Inter', sans-serif", fontSize: 11,
                  fontWeight: step === s.n ? 700 : 400,
                  color: step === s.n ? P : step > s.n ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)",
                }}>
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 3, background: "#E2E8F0" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: G, transition: "width 0.4s ease" }} />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">

          {/* ── Step 1: Convite ── */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>
                  Você recebeu um convite!
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748B" }}>
                  Revise os detalhes e aceite para ativar seu acesso
                </p>
              </div>

              {/* Invite card */}
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
                <div className="px-5 py-4 flex items-center gap-4" style={{ background: PRIMARY_SOFT }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: P }}>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 800, color: G }}>{INVITE.avatar}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 700, color: P }}>{INVITE.convidadoPor}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>{INVITE.cargo}</p>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B", marginLeft: "auto" }}>convidou você</p>
                </div>
                <div className="px-5 py-4 space-y-3">
                  {[
                    { label: "Empresa",    val: INVITE.empresa },
                    { label: "CNPJ",       val: INVITE.cnpj },
                    { label: "Sua Função", val: INVITE.role },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-center">
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>{label}</span>
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700, color: "#1E293B" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accept checkbox */}
              <div
                className="flex items-start gap-3 p-4 rounded-2xl cursor-pointer transition-all"
                style={{ background: accepted ? SUCCESS_BG : "#F8FAFC", border: `2px solid ${accepted ? SUCCESS : "#E2E8F0"}` }}
                onClick={() => setAccepted(!accepted)}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: accepted ? SUCCESS : "white", border: `2px solid ${accepted ? SUCCESS : "#CBD5E1"}` }}>
                  {accepted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151", lineHeight: 1.5 }}>
                  Aceito os <span style={{ color: P, fontWeight: 600 }}>Termos de Uso</span> e a{" "}
                  <span style={{ color: P, fontWeight: 600 }}>Política de Privacidade</span> da Olympia Pagamentos e confirmo
                  minha participação nessa empresa.
                </p>
              </div>
            </div>
          )}

          {/* ── Step 2: Senha ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800, color: "#1E293B" }}>Defina sua Senha</h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>
                  Crie uma senha forte para proteger seu acesso
                </p>
              </div>
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                  Nova Senha
                </label>
                <div className="relative">
                  <input
                    type={showPwd ? "text" : "password"}
                    className={inputCls}
                    style={{ ...inputSty, borderColor: "#CBD5E1", paddingRight: 40 }}
                    placeholder="Mínimo 8 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={onF}
                    onBlur={e => onB(e)}
                  />
                  <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showPwd ? <EyeOff className="w-4 h-4" style={{ color: "#94A3B8" }} /> : <Eye className="w-4 h-4" style={{ color: "#94A3B8" }} />}
                  </button>
                </div>
                {/* Strength */}
                {password.length > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 rounded-full" style={{ background: "#E2E8F0" }}>
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${strength.pct}%`, background: strength.color }} />
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: strength.color, marginTop: 3, fontWeight: 600 }}>
                      {strength.label}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                  Confirmar Senha
                </label>
                <div className="relative">
                  <input
                    type={showConf ? "text" : "password"}
                    className={inputCls}
                    style={{ ...inputSty, borderColor: pwdMismatch ? DANGER : pwdMatch ? SUCCESS : "#CBD5E1", paddingRight: 40 }}
                    placeholder="Repita a senha"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    onFocus={onF}
                    onBlur={e => onB(e, pwdMismatch)}
                  />
                  <button onClick={() => setShowConf(!showConf)} className="absolute right-3 top-1/2 -translate-y-1/2">
                    {showConf ? <EyeOff className="w-4 h-4" style={{ color: "#94A3B8" }} /> : <Eye className="w-4 h-4" style={{ color: "#94A3B8" }} />}
                  </button>
                </div>
                {pwdMismatch && (
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: DANGER, marginTop: 4 }}>As senhas não coincidem</p>
                )}
                {pwdMatch && (
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle className="w-3.5 h-3.5" style={{ color: SUCCESS }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: SUCCESS }}>Senhas conferem</p>
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="space-y-1.5 p-4 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 8 }}>
                  Requisitos de segurança:
                </p>
                {[
                  { label: "Mínimo 8 caracteres",         ok: password.length >= 8 },
                  { label: "Uma letra maiúscula",          ok: /[A-Z]/.test(password) },
                  { label: "Um número",                    ok: /[0-9]/.test(password) },
                  { label: "Um caractere especial (@!#…)", ok: /[^A-Za-z0-9]/.test(password) },
                ].map(req => (
                  <div key={req.label} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: req.ok ? SUCCESS_BG : "#F1F5F9" }}>
                      {req.ok
                        ? <CheckCircle className="w-3 h-3" style={{ color: SUCCESS }} />
                        : <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#CBD5E1" }} />}
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: req.ok ? "#374151" : "#94A3B8" }}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 3: Perfil ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800, color: "#1E293B" }}>Complete seu Perfil</h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>Seus colegas vão te ver assim no sistema</p>
              </div>

              {[
                { label: "Nome completo", key: "nome" as const, placeholder: "Como deseja ser chamado(a)" },
                { label: "Telefone / WhatsApp", key: "telefone" as const, placeholder: "(11) 9 8765-4321" },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                    {f.label}
                  </label>
                  <input className={inputCls} style={{ ...inputSty, borderColor: "#CBD5E1" }}
                    placeholder={f.placeholder} value={profile[f.key]}
                    onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                    onFocus={onF} onBlur={e => onB(e)} />
                </div>
              ))}

              {/* Role permissions preview */}
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", marginBottom: 10 }}>
                  Seus acessos como <span style={{ color: P }}>{INVITE.role}</span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {perms.map(perm => {
                    const Icon = perm.icon;
                    return (
                      <div key={perm.label}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl"
                        style={{
                          background: perm.allowed ? SUCCESS_BG : "#F8FAFC",
                          border: `1px solid ${perm.allowed ? SUCCESS_BORDER : "#E2E8F0"}`,
                        }}>
                        <Icon className="w-3.5 h-3.5 flex-shrink-0"
                          style={{ color: perm.allowed ? SUCCESS : "#CBD5E1" }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 500, color: perm.allowed ? "#374151" : "#94A3B8" }}>
                          {perm.label}
                        </span>
                        {perm.allowed
                          ? <CheckCircle className="w-3 h-3 ml-auto flex-shrink-0" style={{ color: SUCCESS }} />
                          : <div className="w-3 h-3 ml-auto flex-shrink-0 rounded-full" style={{ background: "#E2E8F0" }} />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── Step 4: Pronto! ── */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: SUCCESS_BG, border: `3px solid ${SUCCESS}` }}>
                <CheckCircle className="w-10 h-10" style={{ color: SUCCESS }} />
              </div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>
                {profile.nome ? `Bem-vindo(a), ${profile.nome.split(" ")[0]}!` : "Conta ativada!"}
              </h2>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#64748B", lineHeight: 1.7, maxWidth: 360, margin: "0 auto 24px" }}>
                Sua conta na <strong style={{ color: P }}>{INVITE.empresa}</strong> está ativa. Você tem acesso como <strong style={{ color: P }}>{INVITE.role}</strong>.
              </p>
              <div className="space-y-2 text-left max-w-xs mx-auto">
                {[
                  { label: "Convite aceito",       done: true },
                  { label: "Senha definida",        done: password.length > 0 },
                  { label: "Perfil configurado",    done: profile.nome.length > 0 },
                  { label: "Acesso liberado",       done: true },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: item.done ? SUCCESS_BG : "#F1F5F9" }}>
                      {item.done
                        ? <CheckCircle className="w-3.5 h-3.5" style={{ color: SUCCESS }} />
                        : <div className="w-2 h-2 rounded-full" style={{ background: "#CBD5E1" }} />}
                    </div>
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: item.done ? "#374151" : "#94A3B8" }}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between flex-shrink-0"
          style={{ borderColor: "#F1F5F9" }}>
          <div>
            {step > 1 && step < 4 && (
              <button onClick={() => setStep(s => (s - 1) as Step)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border hover:bg-slate-50"
                style={{ borderColor: "#E2E8F0", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151" }}>
                <ArrowLeft className="w-3.5 h-3.5" /> Voltar
              </button>
            )}
          </div>
          <div>
            {step < 4 ? (
              <button
                disabled={step === 1 && !accepted}
                onClick={() => setStep(s => (s + 1) as Step)}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-white transition-all"
                style={{
                  background: step === 1 && !accepted ? "#CBD5E1" : P,
                  fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700,
                  cursor: step === 1 && !accepted ? "not-allowed" : "pointer",
                }}
                onMouseEnter={e => { if (!(step === 1 && !accepted)) e.currentTarget.style.background = PH; }}
                onMouseLeave={e => { if (!(step === 1 && !accepted)) e.currentTarget.style.background = P; }}>
                {step === 1 ? "Aceitar e Continuar" : "Continuar"} <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button onClick={handleFinish} disabled={finishing}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white"
                style={{ background: finishing ? "#94A3B8" : P, fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700 }}
                onMouseEnter={e => { if (!finishing) e.currentTarget.style.background = PH; }}
                onMouseLeave={e => { if (!finishing) e.currentTarget.style.background = P; }}>
                {finishing ? "Entrando…" : <>Acessar minha conta <ArrowRight className="w-4 h-4" /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
