import { useState } from "react";
import {
  User, Mail, Phone, Building2, Shield, Bell, Monitor,
  Camera, Lock, Eye, EyeOff, CheckCircle, AlertTriangle,
  Smartphone, Laptop, Globe, LogOut, Save, Edit3, Key
} from "lucide-react";
import { toast } from "sonner";
import { currentUser } from "../data/mockData";
import {
  PRIMARY as P, PRIMARY_HOVER as PH, GOLD as G,
  SUCCESS, SUCCESS_BG, SUCCESS_BORDER,
  DANGER, DANGER_BG, DANGER_BORDER,
  WARNING, WARNING_BG,
  PRIMARY_SOFT,
} from "../styles/tokens";

type Tab = "perfil" | "seguranca" | "notificacoes" | "sessoes";

const sessions = [
  { id: 1, device: "MacBook Pro 16\"", browser: "Chrome 124", ip: "177.52.34.12", location: "São Paulo, SP", time: "Agora — ativo", current: true, icon: Laptop },
  { id: 2, device: "iPhone 15 Pro", browser: "Safari Mobile", ip: "177.52.34.15", location: "São Paulo, SP", time: "2h atrás", current: false, icon: Smartphone },
  { id: 3, device: "Windows PC", browser: "Edge 123", ip: "189.20.45.80", location: "Campinas, SP", time: "Ontem 14:32", current: false, icon: Monitor },
];

const notifGroups = [
  {
    label: "Pagamentos",
    items: [
      { key: "pag_vencimento", label: "Vencimentos próximos", desc: "Aviso com 3 e 1 dia de antecedência", val: true },
      { key: "pag_recebido", label: "Pagamento recebido", desc: "Confirmação em tempo real via Open Finance", val: true },
      { key: "pag_inadimplencia", label: "Inadimplência detectada", desc: "Quando um boleto não for pago", val: true },
    ],
  },
  {
    label: "Aprovações",
    items: [
      { key: "apr_solicitacao", label: "Nova solicitação de aprovação", desc: "Quando alguém solicitar sua aprovação", val: true },
      { key: "apr_resultado", label: "Aprovação concluída", desc: "Quando sua aprovação for aceita ou recusada", val: false },
    ],
  },
  {
    label: "Sistema",
    items: [
      { key: "sis_login", label: "Novo acesso detectado", desc: "Login de dispositivo desconhecido", val: true },
      { key: "sis_relatorio", label: "Relatórios gerados", desc: "Quando um relatório agendado ficar pronto", val: false },
      { key: "sis_integracao", label: "Falha em integração", desc: "Quando uma integração falhar ou desconectar", val: true },
    ],
  },
];

export function ProfilePage() {
  const [tab, setTab] = useState<Tab>("perfil");
  const [editMode, setEditMode] = useState(false);
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [mfaEnabled, setMfaEnabled] = useState(true);
  const [notifs, setNotifs] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    notifGroups.forEach(g => g.items.forEach(i => { map[i.key] = i.val; }));
    return map;
  });

  const [form, setForm] = useState({
    nome: currentUser.name,
    email: currentUser.email,
    telefone: "(11) 98765-4321",
    cargo: "CEO & Founder",
    departamento: "Diretoria",
    bio: "Responsável pela gestão financeira e estratégica da Olympia Pagamentos.",
  });

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "perfil", label: "Meu Perfil", icon: User },
    { id: "seguranca", label: "Segurança", icon: Shield },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "sessoes", label: "Sessões Ativas", icon: Monitor },
  ];

  const field = (label: string, key: keyof typeof form, type = "text") => (
    <div key={key}>
      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
        {label}
      </label>
      {key === "bio" ? (
        <textarea
          disabled={!editMode}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          rows={3}
          className="w-full px-4 py-2.5 rounded-xl border resize-none transition-all focus:outline-none"
          style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#374151",
            background: editMode ? "#FFFFFF" : "#F8FAFC",
            borderColor: editMode ? "#CBD5E1" : "#E2E8F0",
          }}
          onFocus={e => editMode && (e.currentTarget.style.borderColor = P)}
          onBlur={e => editMode && (e.currentTarget.style.borderColor = "#CBD5E1")}
        />
      ) : (
        <input
          type={type}
          disabled={!editMode}
          value={form[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          className="w-full px-4 py-2.5 rounded-xl border transition-all focus:outline-none"
          style={{
            fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#374151",
            background: editMode ? "#FFFFFF" : "#F8FAFC",
            borderColor: editMode ? "#CBD5E1" : "#E2E8F0",
          }}
          onFocus={e => editMode && (e.currentTarget.style.borderColor = P)}
          onBlur={e => editMode && (e.currentTarget.style.borderColor = "#CBD5E1")}
        />
      )}
    </div>
  );

  return (
    <div className="p-5 lg:p-6 max-w-4xl mx-auto space-y-5">
      {/* Header card */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="h-24 mx-[0px] my-[39px]" style={{ background: `linear-gradient(135deg, ${P} 0%, #2D527A 100%)` }} />
        <div className="px-6 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4" style={{ marginTop: -36 }}>
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-18 h-18 rounded-2xl flex items-center justify-center text-lg font-bold shadow-lg"
                  style={{ width: 72, height: 72, background: G, color: P, fontFamily: "'Inter', sans-serif", fontWeight: 800, fontSize: 24, border: "3px solid white" }}>
                  {currentUser.avatar}
                </div>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-md"
                  style={{ background: P }}
                  onClick={() => toast.info("Upload de foto disponível na versão Pro")}>
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="pb-1">
                <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 20, fontWeight: 800, color: "#1E293B" }}>
                  {form.nome}
                </h1>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748B" }}>
                  {form.cargo} · {currentUser.company}
                </p>
              </div>
            </div>
            <div className="flex gap-2 pb-1">
              <span className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                style={{ background: PRIMARY_SOFT, fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700, color: P }}>
                <Shield className="w-3.5 h-3.5" />
                {currentUser.role}
              </span>
              {mfaEnabled && (
                <span className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  style={{ background: SUCCESS_BG, fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700, color: SUCCESS }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  MFA Ativo
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs + Content */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Tab nav */}
        <div className="lg:w-52 flex-shrink-0">
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all relative"
                  style={{
                    background: active ? PRIMARY_SOFT : "transparent",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                >
                  {active && (
                    <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r" style={{ background: P }} />
                  )}
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: active ? P : "#94A3B8" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: active ? 600 : 400, color: active ? P : "#374151" }}>
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* ── PERFIL ── */}
          {tab === "perfil" && (
            <div className="bg-white rounded-2xl p-6 space-y-5" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B" }}>Informações Pessoais</h2>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>Atualize seus dados e informações profissionais</p>
                </div>
                {!editMode ? (
                  <button onClick={() => setEditMode(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors hover:bg-slate-50"
                    style={{ borderColor: "#E2E8F0" }}>
                    <Edit3 className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151" }}>Editar</span>
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setEditMode(false)}
                      className="px-3 py-2 rounded-xl border hover:bg-slate-50"
                      style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, borderColor: "#E2E8F0", color: "#64748B" }}>
                      Cancelar
                    </button>
                    <button onClick={() => { setEditMode(false); toast.success("Perfil atualizado com sucesso!"); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-white"
                      style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700 }}>
                      <Save className="w-3.5 h-3.5" />
                      Salvar
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {field("Nome completo", "nome")}
                {field("E-mail", "email", "email")}
                {field("Telefone / WhatsApp", "telefone")}
                {field("Cargo", "cargo")}
                {field("Departamento", "departamento")}
              </div>
              <div>{field("Sobre / Bio", "bio")}</div>

              <div className="pt-3 border-t" style={{ borderColor: "#F1F5F9" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Empresa vinculada</p>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: PRIMARY_SOFT }}>
                    <Building2 className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: P }} />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{currentUser.company}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#64748B" }}>CNPJ {currentUser.cnpj}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SEGURANÇA ── */}
          {tab === "seguranca" && (
            <div className="space-y-4">
              {/* Alterar senha */}
              <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B", marginBottom: 4 }}>Alterar Senha</h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B", marginBottom: 18 }}>Use uma senha forte com pelo menos 10 caracteres</p>
                <div className="space-y-4 max-w-md">
                  {[
                    { label: "Senha atual", show: showOldPass, toggle: () => setShowOldPass(!showOldPass) },
                    { label: "Nova senha", show: showNewPass, toggle: () => setShowNewPass(!showNewPass) },
                    { label: "Confirmar nova senha", show: showNewPass, toggle: () => setShowNewPass(!showNewPass) },
                  ].map((f) => (
                    <div key={f.label}>
                      <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>
                        {f.label}
                      </label>
                      <div className="relative">
                        <input
                          type={f.show ? "text" : "password"}
                          placeholder="••••••••••"
                          className="w-full px-4 py-2.5 pr-10 rounded-xl border focus:outline-none transition-all"
                          style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, borderColor: "#CBD5E1", background: "#FFFFFF" }}
                          onFocus={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.08)`; }}
                          onBlur={e => { e.currentTarget.style.borderColor = "#CBD5E1"; e.currentTarget.style.boxShadow = "none"; }}
                        />
                        <button onClick={f.toggle} className="absolute right-3 top-1/2 -translate-y-1/2">
                          {f.show ? <EyeOff className="w-4 h-4" style={{ color: "#94A3B8" }} /> : <Eye className="w-4 h-4" style={{ color: "#94A3B8" }} />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={() => toast.success("Senha alterada com sucesso!")}
                    className="w-full py-2.5 rounded-xl text-white mt-2"
                    style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 700 }}
                    onMouseEnter={e => (e.currentTarget.style.background = PH)}
                    onMouseLeave={e => (e.currentTarget.style.background = P)}>
                    Atualizar Senha
                  </button>
                </div>
              </div>

              {/* MFA */}
              <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B" }}>
                        Autenticação de Dois Fatores (MFA)
                      </h2>
                      {mfaEnabled && (
                        <span className="px-2 py-0.5 rounded-lg" style={{ background: SUCCESS_BG, fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 700, color: SUCCESS }}>
                          ATIVO
                        </span>
                      )}
                    </div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>
                      {mfaEnabled
                        ? "Sua conta está protegida com autenticador TOTP (Google Authenticator, Authy)"
                        : "Adicione uma camada extra de segurança à sua conta"}
                    </p>
                  </div>
                  <button
                    onClick={() => { setMfaEnabled(!mfaEnabled); toast.success(mfaEnabled ? "MFA desativado" : "MFA configurado com sucesso!"); }}
                    className="px-4 py-2 rounded-xl flex-shrink-0"
                    style={{
                      background: mfaEnabled ? DANGER_BG : P,
                      color: mfaEnabled ? DANGER : "white",
                      fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700,
                      border: mfaEnabled ? `1px solid ${DANGER_BORDER}` : "none",
                    }}>
                    {mfaEnabled ? "Desativar MFA" : "Ativar MFA"}
                  </button>
                </div>
                {!mfaEnabled && (
                  <div className="mt-4 p-4 rounded-xl flex items-start gap-3" style={{ background: WARNING_BG, border: `1px solid #E8D5B0` }}>
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: WARNING }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#92400E" }}>
                      Sem MFA, sua conta está vulnerável. Recomendamos ativar imediatamente.
                    </p>
                  </div>
                )}
              </div>

              {/* Recovery codes */}
              <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
                <div className="flex items-center gap-3 mb-3">
                  <Key className="w-4.5 h-4.5" style={{ width: 18, height: 18, color: "#64748B" }} />
                  <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B" }}>Códigos de Recuperação</h2>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B", marginBottom: 14 }}>
                  Use estes códigos para acessar sua conta caso perca o dispositivo MFA. Cada código só pode ser usado uma vez.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {["8F3D-A921", "2K7P-Q345", "9N1R-T678", "4M6W-E012", "7J5V-B234", "1H8C-L567"].map((code) => (
                    <div key={code} className="px-3 py-2 rounded-lg text-center"
                      style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", fontFamily: "'Courier New', monospace", fontSize: 13, fontWeight: 700, color: "#374151" }}>
                      {code}
                    </div>
                  ))}
                </div>
                <button onClick={() => toast.success("Novos códigos gerados!")}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border hover:bg-slate-50"
                  style={{ borderColor: "#E2E8F0" }}>
                  <Key className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151" }}>Gerar novos códigos</span>
                </button>
              </div>
            </div>
          )}

          {/* ── NOTIFICAÇÕES ── */}
          {tab === "notificacoes" && (
            <div className="bg-white rounded-2xl p-6 space-y-6" style={{ border: "1px solid #E2E8F0" }}>
              <div>
                <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B", marginBottom: 2 }}>Preferências de Notificação</h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>Escolha como e quando deseja ser notificado</p>
              </div>

              {/* Channels */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: Mail, label: "E-mail", active: true },
                  { icon: Smartphone, label: "Push / App", active: true },
                  { icon: Globe, label: "WhatsApp", active: false },
                ].map(({ icon: Icon, label, active }) => (
                  <button key={label}
                    onClick={() => toast.info(`Canal ${label} ${active ? "desativado" : "ativado"}`)}
                    className="flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all"
                    style={{ borderColor: active ? P : "#E2E8F0", background: active ? PRIMARY_SOFT : "white" }}>
                    <Icon className="w-5 h-5" style={{ color: active ? P : "#94A3B8" }} />
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: active ? 700 : 400, color: active ? P : "#64748B" }}>{label}</span>
                  </button>
                ))}
              </div>

              {/* Groups */}
              {notifGroups.map(group => (
                <div key={group.label}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", color: "#94A3B8", marginBottom: 10 }}>
                    {group.label.toUpperCase()}
                  </p>
                  <div className="space-y-2">
                    {group.items.map(item => (
                      <div key={item.key} className="flex items-center justify-between py-3 px-4 rounded-xl hover:bg-slate-50 transition-colors"
                        style={{ border: "1px solid #F1F5F9" }}>
                        <div className="flex-1 min-w-0 pr-4">
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{item.label}</p>
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#64748B" }}>{item.desc}</p>
                        </div>
                        <button
                          onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                          className="w-10 h-5.5 rounded-full flex-shrink-0 transition-all relative"
                          style={{ width: 40, height: 22, background: notifs[item.key] ? P : "#E2E8F0" }}>
                          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all"
                            style={{ left: notifs[item.key] ? 18 : 2 }} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button onClick={() => toast.success("Preferências salvas!")}
                className="w-full py-2.5 rounded-xl text-white"
                style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 700 }}
                onMouseEnter={e => (e.currentTarget.style.background = PH)}
                onMouseLeave={e => (e.currentTarget.style.background = P)}>
                Salvar Preferências
              </button>
            </div>
          )}

          {/* ── SESSÕES ── */}
          {tab === "sessoes" && (
            <div className="bg-white rounded-2xl p-6" style={{ border: "1px solid #E2E8F0" }}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B", marginBottom: 2 }}>Sessões Ativas</h2>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>Dispositivos conectados à sua conta</p>
                </div>
                <button onClick={() => toast.success("Todas as outras sessões encerradas!")}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border hover:bg-slate-50"
                  style={{ borderColor: DANGER_BORDER }}>
                  <LogOut className="w-3.5 h-3.5" style={{ color: DANGER }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: DANGER, fontWeight: 600 }}>Encerrar outras</span>
                </button>
              </div>
              <div className="space-y-3">
                {sessions.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: s.current ? PRIMARY_SOFT : "#F8FAFC", border: `1px solid ${s.current ? "#C3D0E4" : "#E2E8F0"}` }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: s.current ? P : "#E2E8F0" }}>
                        <Icon className="w-5 h-5" style={{ color: s.current ? "white" : "#64748B" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{s.device}</p>
                          {s.current && (
                            <span className="px-1.5 py-0.5 rounded"
                              style={{ background: SUCCESS_BG, fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: SUCCESS }}>
                              ATUAL
                            </span>
                          )}
                        </div>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#64748B" }}>
                          {s.browser} · {s.ip} · {s.location}
                        </p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{s.time}</p>
                      </div>
                      {!s.current && (
                        <button onClick={() => toast.warning("Sessão encerrada")}
                          style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: DANGER, fontWeight: 600 }}>
                          Encerrar
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}