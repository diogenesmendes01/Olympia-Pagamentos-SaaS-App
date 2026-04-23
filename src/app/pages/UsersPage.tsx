import { useState } from "react";
import {
  Plus, Search, Shield, CheckCircle, XCircle, Clock,
  MoreHorizontal, Mail, Smartphone, Lock, Eye, Trash2,
  Activity, LogOut, AlertTriangle, Users, UserCheck,
  ShieldCheck, UserMinus, FileText
} from "lucide-react";
import {
  PRIMARY as P, PRIMARY_HOVER as PH, GOLD as G,
  SUCCESS, SUCCESS_BG,
  DANGER, DANGER_BG,
  WARNING,
} from "../styles/tokens";
import { users, auditLog } from "../data/mockData";
import { toast } from "sonner";

const roleConfig: Record<string, { bg: string; text: string; desc: string }> = {
  "Administrador":    { bg: "#EEF3F8",  text: P,          desc: "Acesso total ao sistema" },
  "Financeiro":       { bg: "#F5F1FF",  text: "#6B4BAF",  desc: "Tudo exceto usuários" },
  "Operacional":      { bg: SUCCESS_BG, text: SUCCESS,     desc: "Recebíveis e pagáveis + relatórios" },
  "Visualizador":     { bg: "#F1F5F9",  text: "#64748B",  desc: "Apenas leitura" },
  "Contador Externo": { bg: "#FDF8EE",  text: G,           desc: "Relatórios fiscais + leitura" },
};

export function UsersPage() {
  const [search, setSearch] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState<"users" | "audit" | "sessions">("users");
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Financeiro");
  const [inviteExpiry, setInviteExpiry] = useState("7");

  const filtered = users.filter(
    (u) =>
      u.nome.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  const sessions = [
    { device: "MacBook Pro 16\" (Safari)", ip: "177.52.34.12", location: "São Paulo, SP", time: "Agora", current: true },
    { device: "iPhone 15 Pro (App iOS)", ip: "189.32.54.21", location: "São Paulo, SP", time: "2h atrás", current: false },
    { device: "Windows PC (Chrome)", ip: "201.18.45.67", location: "Campinas, SP", time: "Ontem 14:32", current: false },
  ];

  return (
    <div className="p-5 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 21, fontWeight: 800, color: P }}>Gestão de Usuários</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>Controle de acesso, perfis e auditoria</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white transition-all"
          style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700 }}
          onMouseEnter={e => (e.currentTarget.style.background = PH)}
          onMouseLeave={e => (e.currentTarget.style.background = P)}
        >
          <Plus className="w-3.5 h-3.5" />Convidar Usuário
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total de Usuários", value: users.length,                                    color: P,       Icon: Users },
          { label: "Ativos",            value: users.filter(u => u.status === "ativo").length,  color: SUCCESS, Icon: UserCheck },
          { label: "Com MFA",           value: users.filter(u => u.mfa).length,                color: "#6B4BAF", Icon: ShieldCheck },
          { label: "Inativos",          value: users.filter(u => u.status === "inativo").length,color: "#94A3B8", Icon: UserMinus },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ border: "1px solid #E2E8F0" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${s.color}14` }}>
              <s.Icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex border-b" style={{ borderColor: "#F1F5F9" }}>
          {([
            { id: "users",    label: "Usuários" },
            { id: "audit",    label: "Auditoria" },
            { id: "sessions", label: "Sessões Ativas" },
          ] as const).map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className="px-5 py-3.5 transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 600,
                color: activeTab === tab.id ? P : "#94A3B8",
                borderBottom: activeTab === tab.id ? `2.5px solid ${P}` : "2.5px solid transparent",
                background: "transparent",
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div>
            <div className="p-4 border-b" style={{ borderColor: "#F8FAFC" }}>
              <div className="flex items-center gap-2 rounded-xl px-3 py-2 border" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                <Search className="w-4 h-4" style={{ color: "#94A3B8" }} />
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar por nome, e-mail ou perfil..."
                  className="flex-1 bg-transparent focus:outline-none"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#374151" }} />
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
              {filtered.map((user) => {
                const rc = roleConfig[user.role];
                return (
                  <div key={user.id} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
                      style={{ background: user.status === "inativo" ? "#F1F5F9" : "rgba(31,58,95,0.08)", border: user.status === "inativo" ? "1px solid #E2E8F0" : `1px solid rgba(200,169,107,0.4)`, color: user.status === "inativo" ? "#94A3B8" : P, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
                      {user.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 600, color: user.status === "inativo" ? "#94A3B8" : "#1E293B" }}>{user.nome}</p>
                        {user.status === "inativo" && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, background: "#F1F5F9", color: "#94A3B8", padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>INATIVO</span>}
                      </div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>{user.email}</p>
                    </div>
                    <div className="hidden sm:block">
                      <span className="px-2.5 py-1 rounded-xl text-xs font-semibold" style={{ fontFamily: "'Inter', sans-serif", background: rc.bg, color: rc.text }}>{user.role}</span>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#94A3B8", marginTop: 2 }}>{rc.desc}</p>
                    </div>
                    <div className="hidden lg:flex flex-col items-center gap-1">
                      {user.mfa ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: SUCCESS_BG }}>
                          <Shield className="w-3 h-3" style={{ color: SUCCESS }} />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: SUCCESS, fontWeight: 700 }}>MFA Ativo</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg" style={{ background: DANGER_BG }}>
                          <AlertTriangle className="w-3 h-3" style={{ color: DANGER }} />
                          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: DANGER, fontWeight: 700 }}>Sem MFA</span>
                        </span>
                      )}
                    </div>
                    <div className="hidden lg:block text-right">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#64748B" }}>Último acesso</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "#374151" }}>{user.ultimoAcesso}</p>
                    </div>
                    <div className="relative">
                      <button onClick={() => setOpenMenu(openMenu === user.id ? null : user.id)} className="p-1.5 rounded-lg hover:bg-slate-100">
                        <MoreHorizontal className="w-4 h-4" style={{ color: "#94A3B8" }} />
                      </button>
                      {openMenu === user.id && (
                        <div className="absolute right-0 mt-1 w-52 bg-white rounded-2xl shadow-xl z-10 overflow-hidden py-1" style={{ border: "1px solid #E2E8F0" }}>
                          {[
                            { icon: Eye,   label: "Ver Perfil",           action: () => { setOpenMenu(null); toast.info("Abrindo perfil"); } },
                            { icon: Mail,  label: "Reenviar Convite",     action: () => { setOpenMenu(null); toast.success("Convite reenviado!"); } },
                            { icon: Lock,  label: "Resetar Senha",        action: () => { setOpenMenu(null); toast.success("Link enviado"); } },
                            { icon: Shield,label: "Forçar MFA",           action: () => { setOpenMenu(null); toast.info("MFA configurado"); } },
                            { icon: LogOut,label: "Desconectar Sessões",  action: () => { setOpenMenu(null); toast.warning("Sessões encerradas"); } },
                            { icon: Trash2,label: "Desativar Conta",      action: () => { setOpenMenu(null); toast.error("Conta desativada"); }, danger: true },
                          ].map((item) => (
                            <button key={item.label} onClick={item.action} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-left">
                              <item.icon className="w-3.5 h-3.5" style={{ color: (item as any).danger ? DANGER : "#94A3B8" }} />
                              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: (item as any).danger ? DANGER : "#374151" }}>{item.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div>
            <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "#F8FAFC" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#374151" }}>Registro de Auditoria</p>
              <button onClick={() => toast.info("Exportando logs...")} style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: P, fontWeight: 600 }}>Exportar CSV</button>
            </div>
            <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
              {auditLog.map((log) => (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#EEF2F9" }}>
                    <Activity className="w-4 h-4" style={{ color: P }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151" }}>{log.acao}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8" }}>
                      Por <span style={{ color: P, fontWeight: 600 }}>{log.usuario}</span> · IP: {log.ip}
                    </p>
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8", flexShrink: 0 }}>{log.horario}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div>
            <div className="px-5 py-3 border-b" style={{ borderColor: "#F8FAFC" }}>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>Sessões ativas de Rafael Oliveira</p>
            </div>
            {[
              { device: "MacBook Pro 16\" (Safari)", ip: "177.52.34.12", location: "São Paulo, SP", time: "Agora", current: true },
              { device: "iPhone 15 Pro (App iOS)", ip: "189.32.54.21", location: "São Paulo, SP", time: "2h atrás", current: false },
              { device: "Windows PC (Chrome)", ip: "201.18.45.67", location: "Campinas, SP", time: "Ontem 14:32", current: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50 border-t" style={{ borderColor: "#F8FAFC" }}>
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: s.current ? "#EEF2F9" : "#F8FAFC" }}>
                  <Smartphone className="w-4 h-4" style={{ color: s.current ? P : "#94A3B8" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#374151" }}>{s.device}</p>
                    {s.current && <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, background: "#EEF2F9", color: P, padding: "1px 6px", borderRadius: 4, fontWeight: 700 }}>ATUAL</span>}
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#94A3B8" }}>{s.ip} · {s.location}</p>
                </div>
                <div className="text-right">
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>{s.time}</p>
                  {!s.current && <button onClick={() => toast.warning("Sessão encerrada")} style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: DANGER, fontWeight: 600 }}>Encerrar</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Roles table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14.5, fontWeight: 800, color: P }}>Perfis de Acesso</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                {["Perfil","Recebíveis","Pagamentos","Relatórios","Usuários","Billing","Export. Fiscal"].map(h => (
                  <th key={h} className="px-4 py-3 text-left" style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>{h.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Administrador", "total", "total", "total", "total", "total", "total"],
                ["Financeiro",    "total", "total", "total", "none",  "none",  "total"],
                ["Operacional",   "total", "write", "read",  "none",  "none",  "none"],
                ["Visualizador",  "read",  "read",  "read",  "none",  "none",  "none"],
                ["Contador Externo","read","read",  "total", "none",  "none",  "total"],
              ].map(([role, ...perms]) => (
                <tr key={role} className="hover:bg-slate-50 border-t" style={{ borderColor: "#F8FAFC" }}>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 rounded-xl text-xs font-semibold" style={{ fontFamily: "'Inter', sans-serif", background: roleConfig[role]?.bg, color: roleConfig[role]?.text }}>{role}</span>
                  </td>
                  {perms.map((p, i) => (
                    <td key={i} className="px-4 py-3">
                      {p === "total" && (
                        <span className="inline-flex items-center gap-1" style={{ color: SUCCESS }}>
                          <CheckCircle className="w-3.5 h-3.5" /><span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12 }}>Total</span>
                        </span>
                      )}
                      {p === "write" && (
                        <span className="inline-flex items-center gap-1" style={{ color: P }}>
                          <CheckCircle className="w-3.5 h-3.5" /><span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12 }}>Criar</span>
                        </span>
                      )}
                      {p === "read" && (
                        <span className="inline-flex items-center gap-1" style={{ color: "#64748B" }}>
                          <Eye className="w-3.5 h-3.5" /><span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12 }}>Ver</span>
                        </span>
                      )}
                      {p === "none" && (
                        <span className="inline-flex items-center gap-1" style={{ color: "#CBD5E1" }}>
                          <XCircle className="w-3.5 h-3.5" /><span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#CBD5E1" }}>–</span>
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#F1F5F9" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 16, fontWeight: 800, color: P }}>Convidar Usuário</h3>
              <button onClick={() => setShowInvite(false)} className="p-1.5 rounded-xl hover:bg-slate-100">
                <XCircle className="w-5 h-5" style={{ color: "#94A3B8" }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>E-mail do Usuário</label>
                <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="usuario@empresa.com.br"
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-all"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, background: "#F8FAFC", borderColor: "#E2E8F0" }}
                  onFocus={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                />
              </div>
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Perfil de Acesso</label>
                <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                  {Object.keys(roleConfig).map(r => <option key={r}>{r}</option>)}
                </select>
                {inviteRole && (
                  <div className="flex items-start gap-1.5 mt-1.5">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#94A3B8" }} />
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#64748B" }}>{roleConfig[inviteRole]?.desc}</p>
                  </div>
                )}
              </div>
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Expiração do Convite</label>
                <select value={inviteExpiry} onChange={(e) => setInviteExpiry(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border focus:outline-none"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                  <option value="1">1 dia</option>
                  <option value="7">7 dias</option>
                  <option value="30">30 dias</option>
                  <option value="0">Sem expiração</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="forceMfa" className="rounded" defaultChecked style={{ accentColor: P }} />
                <label htmlFor="forceMfa" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151" }}>Exigir MFA no primeiro acesso</label>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowInvite(false)} className="flex-1 py-2.5 rounded-xl border hover:bg-slate-50"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, borderColor: "#E2E8F0", color: "#64748B" }}>Cancelar</button>
              <button onClick={() => { setShowInvite(false); toast.success(`Convite enviado para ${inviteEmail || "o usuário"}!`); setInviteEmail(""); }}
                className="flex-1 py-2.5 rounded-xl text-white transition-all"
                style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 700 }}
                onMouseEnter={e => (e.currentTarget.style.background = PH)}
                onMouseLeave={e => (e.currentTarget.style.background = P)}>
                Enviar Convite
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}