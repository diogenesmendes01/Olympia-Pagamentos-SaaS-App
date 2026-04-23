import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  Users,
  BarChart3,
  Plug,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  ChevronDown,
  Building2,
  HelpCircle,
  Search,
  FileText,
  User,
} from "lucide-react";
import { currentUser } from "../data/mockData";
import { toast } from "sonner";
import {
  PRIMARY as P, PRIMARY_HOVER as PH, GOLD as G,
  DANGER, SUCCESS, WARNING,
} from "../styles/tokens";
import { OwnerOnboarding } from "../components/onboarding/OwnerOnboarding";
import { InvitedOnboarding } from "../components/onboarding/InvitedOnboarding";

const navItems = [
  { path: "/dashboard",    label: "Dashboard",         icon: LayoutDashboard },
  { path: "/receivables",  label: "Contas a Receber",  icon: ArrowDownCircle },
  { path: "/payables",     label: "Contas a Pagar",    icon: ArrowUpCircle },
  { path: "/invoices",     label: "Faturas / NF-e",    icon: FileText },
  { path: "/users",        label: "Usuários",          icon: Users },
  { path: "/reports",      label: "Relatórios",        icon: BarChart3 },
  { path: "/integrations", label: "Integrações",       icon: Plug },
  { path: "/settings",     label: "Configurações",     icon: Settings },
];

// Deep blue palette
const C = {
  primary:         P,
  hover:           PH,
  pressed:         "#162C47",
  gold:            G,
  goldLight:       "rgba(200,169,107,0.15)",
  sidebar:         P,
  sidebarHover:    "#274872",
  sidebarActive:   "#2D527A",
  sidebarBorder:   "rgba(255,255,255,0.08)",
  sidebarText:     "#A8BDD4",
  sidebarTextActive: "#FFFFFF",
};

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Onboarding state
  const [onboarding, setOnboarding] = useState<"owner" | "invited" | null>(() => {
    const val = localStorage.getItem("olympia_onboarding");
    if (val === "owner" || val === "invited") return val;
    return null;
  });

  const finishOnboarding = () => {
    localStorage.removeItem("olympia_onboarding");
    setOnboarding(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("olympia_auth");
    toast.success("Sessão encerrada com sucesso");
    navigate("/login");
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8FAFC" }}>
      {/* ──────────── SIDEBAR ──────────── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300
          lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        style={{ width: 258, background: C.sidebar, minHeight: "100vh", boxShadow: "4px 0 24px rgba(0,0,0,0.15)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5" style={{ borderBottom: `1px solid ${C.sidebarBorder}` }}>
          {/* Olympia icon — gold ring + O */}
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: "rgba(200,169,107,0.12)",
              border: `1.5px solid ${C.gold}`,
            }}
          >
            <span style={{ fontFamily: "'Cinzel', serif", fontSize: 16, fontWeight: 700, color: C.gold, lineHeight: 1 }}>O</span>
          </div>
          <div>
            <p style={{ fontFamily: "'Cinzel', serif", fontSize: 13, fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.12em" }}>OLYMPIA</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 500, color: C.gold, letterSpacing: "0.18em" }}>PAGAMENTOS</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-4 h-4" style={{ color: C.sidebarText }} />
          </button>
        </div>

        {/* Company chip */}
        <div className="mx-4 mt-4 mb-3 px-3 py-2.5 rounded-xl flex items-center gap-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.goldLight, border: `1px solid rgba(200,169,107,0.3)` }}>
            <Building2 style={{ width: 14, height: 14, color: C.gold }} />
          </div>
          <div className="min-w-0">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600, color: "#FFFFFF" }} className="truncate">Olympia Pagamentos</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, color: C.sidebarText }}>CNPJ 12.345.678/0001-90</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-1 overflow-y-auto">
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, fontWeight: 700, letterSpacing: "0.12em", color: C.gold, padding: "8px 10px 6px", opacity: 0.8 }}>
            NAVEGAÇÃO
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all relative"
                style={{
                  background: active ? C.sidebarActive : "transparent",
                  color: active ? C.sidebarTextActive : C.sidebarText,
                  textDecoration: "none",
                }}
              >
                {/* Gold left accent on active */}
                {active && (
                  <div
                    className="absolute left-0 rounded-r"
                    style={{ width: 3, height: 20, background: C.gold, top: "50%", transform: "translateY(-50%)" }}
                  />
                )}
                <Icon
                  style={{
                    width: 17, height: 17, flexShrink: 0,
                    color: active ? C.gold : C.sidebarText,
                  }}
                />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: active ? 600 : 400 }}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4" style={{ borderTop: `1px solid ${C.sidebarBorder}` }}>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all mb-1" style={{ color: C.sidebarText }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
          >
            <HelpCircle style={{ width: 17, height: 17 }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5 }}>Suporte</span>
          </button>

          {/* User */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl mt-1" style={{ background: "rgba(255,255,255,0.05)" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs flex-shrink-0"
              style={{ background: C.goldLight, border: `1.5px solid ${C.gold}`, color: C.gold, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#FFFFFF" }} className="truncate">{currentUser.name}</p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: C.sidebarText }}>{currentUser.role}</p>
            </div>
            <button onClick={handleLogout} title="Sair">
              <LogOut style={{ width: 15, height: 15, color: C.sidebarText }} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ──────────── MAIN ──────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 lg:px-6 py-3 bg-white border-b flex-shrink-0" style={{ borderColor: "#E2E8F0" }}>
          <button className="lg:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" style={{ color: "#64748B" }} />
          </button>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 max-w-md rounded-xl px-3 py-2 border" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <Search className="w-4 h-4" style={{ color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Buscar cobranças, clientes, pagamentos..."
              className="flex-1 bg-transparent placeholder-slate-400 focus:outline-none"
              style={{ fontSize: 13, color: "#374151", fontFamily: "'Inter', sans-serif" }}
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
                className="relative p-2 rounded-xl transition-colors"
                style={{ background: notifOpen ? "#EEF2F9" : "transparent" }}
                onMouseEnter={e => !notifOpen && (e.currentTarget.style.background = "#F8FAFC")}
                onMouseLeave={e => !notifOpen && (e.currentTarget.style.background = "transparent")}
              >
                <Bell className="w-5 h-5" style={{ color: "#64748B" }} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: DANGER }} />
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
                  <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "#F1F5F9" }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1E293B", fontFamily: "'Inter', sans-serif" }}>Notificações</span>
                    <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: DANGER, fontSize: 10 }}>3 novas</span>
                  </div>
                  {[
                    { title: "3 faturas vencidas hoje",    sub: "Total: R$ 12.400,00",                   dot: DANGER },
                    { title: "Pix recebido R$ 18.200,00",  sub: "Beta Indústria S/A",                    dot: SUCCESS },
                    { title: "DARF vence amanhã",          sub: "R$ 8.340,00 — saldo insuficiente",      dot: WARNING },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b" style={{ borderColor: "#F8FAFC" }}>
                      <div className="flex items-start gap-2">
                        <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: n.dot }} />
                        <div>
                          <p style={{ fontSize: 12.5, fontWeight: 600, color: "#1E293B", fontFamily: "'Inter', sans-serif" }}>{n.title}</p>
                          <p style={{ fontSize: 11.5, color: "#64748B" }}>{n.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="px-4 py-2.5 text-center">
                    <button style={{ fontSize: 12, color: C.primary, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Ver todas →</button>
                  </div>
                </div>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl transition-colors"
                style={{ background: userMenuOpen ? "#EEF2F9" : "transparent" }}
                onMouseEnter={e => !userMenuOpen && (e.currentTarget.style.background = "#F8FAFC")}
                onMouseLeave={e => !userMenuOpen && (e.currentTarget.style.background = "transparent")}
              >
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{ background: C.goldLight, border: `1.5px solid ${C.gold}`, color: C.primary, fontWeight: 700, fontFamily: "'Inter', sans-serif", fontSize: 11 }}>
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: "#1E293B", fontFamily: "'Inter', sans-serif" }}>{currentUser.name}</p>
                  <p style={{ fontSize: 10.5, color: "#64748B" }}>{currentUser.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5" style={{ color: "#94A3B8" }} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border z-50 overflow-hidden" style={{ borderColor: "#E2E8F0" }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: "#F1F5F9" }}>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: "#1E293B" }}>{currentUser.name}</p>
                    <p style={{ fontSize: 11, color: "#64748B" }}>{currentUser.email}</p>
                  </div>
                  {[{ label: "Meu Perfil", icon: User }, { label: "Configurações", icon: Settings }].map((item) => (
                    <button key={item.label} onClick={() => { setUserMenuOpen(false); navigate(item.label === "Meu Perfil" ? "/profile" : "/settings"); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 text-left">
                      <item.icon className="w-4 h-4" style={{ color: "#94A3B8" }} />
                      <span style={{ fontSize: 13, color: "#374151" }}>{item.label}</span>
                    </button>
                  ))}
                  <div className="border-t" style={{ borderColor: "#F1F5F9" }}>
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-left">
                      <LogOut className="w-4 h-4" style={{ color: DANGER }} />
                      <span style={{ fontSize: 13, color: DANGER }}>Sair</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "#F8FAFC" }}>
          <Outlet />
        </main>
      </div>

      {/* Onboarding overlays */}
      {onboarding === "owner"   && <OwnerOnboarding   onComplete={finishOnboarding} />}
      {onboarding === "invited" && <InvitedOnboarding onComplete={finishOnboarding} />}
    </div>
  );
}