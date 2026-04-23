import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import {
  TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle,
  Wallet, AlertTriangle, CheckCircle, Info, Bell, RefreshCw,
  Plus, Send, QrCode, FileText, Zap, Clock, DollarSign, Activity
} from "lucide-react";
import {
  kpiData, cashFlowChartData, cashProjectionData,
  receivablesByMethod, alerts, recentTransactions
} from "../data/mockData";
import {
  PRIMARY as P, PRIMARY_HOVER as PH, GOLD as G,
  SUCCESS, SUCCESS_BG,
  WARNING, WARNING_BG,
  DANGER, DANGER_BG, DANGER_BORDER,
  INFO_BG, INFO_BORDER,
  CHART_SUCCESS, CHART_PRIMARY, CHART_COMPARE,
} from "../styles/tokens";

// Brand colors
const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(v);
const fmtFull = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white rounded-2xl p-3.5 shadow-xl" style={{ border: "1px solid #E2E8F0", minWidth: 160 }}>
        <p style={{ fontSize: 11.5, fontWeight: 700, color: "#374151", marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ fontSize: 12, color: p.color, fontFamily: "'Inter', sans-serif" }}>
            {p.name}: {fmt(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const KPICard = ({ title, value, trend, trendLabel, icon: Icon, color, suffix = "" }: any) => {
  const positive = trend > 0;
  return (
    <div className="bg-white rounded-2xl p-5 hover:shadow-md transition-all" style={{ border: "1px solid #E2E8F0" }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}12` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
          style={{ background: positive ? SUCCESS_BG : DANGER_BG }}>
          {positive
            ? <TrendingUp  className="w-3 h-3" style={{ color: SUCCESS }} />
            : <TrendingDown className="w-3 h-3" style={{ color: DANGER }} />}
          <span style={{ fontSize: 11, fontWeight: 700, color: positive ? SUCCESS : DANGER, fontFamily: "'Inter', sans-serif" }}>
            {positive ? "+" : ""}{trend}{suffix !== "" ? "" : "%"}
          </span>
        </div>
      </div>
      <p style={{ fontSize: 21, fontWeight: 800, color: "#1E293B", letterSpacing: "-0.02em", fontFamily: "'Inter', sans-serif" }}>
        {typeof value === "number" && value > 100 ? fmt(value) : value}{suffix}
      </p>
      <p style={{ fontSize: 12, color: "#374151", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{title}</p>
      <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 1, fontFamily: "'Inter', sans-serif" }}>{trendLabel}</p>
    </div>
  );
};

const AlertItem = ({ alert }: { alert: typeof alerts[0] }) => {
  const cfg: any = {
    danger:  { bg: DANGER_BG,  border: DANGER_BORDER, text: DANGER,  icon: AlertTriangle },
    warning: { bg: WARNING_BG, border: "#E8D5B0",     text: WARNING, icon: Clock },
    info:    { bg: INFO_BG,    border: INFO_BORDER,   text: P,       icon: Info },
    success: { bg: SUCCESS_BG, border: "#C9DEC9",     text: SUCCESS, icon: CheckCircle },
  };
  const c = cfg[alert.type];
  const Icon = c.icon;
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ background: c.bg, borderColor: c.border }}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: c.text }} />
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: 12.5, fontWeight: 600, color: c.text, fontFamily: "'Inter', sans-serif" }}>{alert.title}</p>
        <p style={{ fontSize: 11.5, color: "#64748B", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{alert.description}</p>
      </div>
      <span style={{ fontSize: 10, color: "#94A3B8", flexShrink: 0, fontFamily: "'Inter', sans-serif" }}>{alert.time}</span>
    </div>
  );
};

// Chart palette
const pieColors = [P, G, CHART_COMPARE, "#8B9BAD"];

export function DashboardPage() {
  const [period, setPeriod] = useState("6m");
  const now = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });

  return (
    <div className="p-5 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 21, fontWeight: 800, color: P }}>Dashboard</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B", textTransform: "capitalize" }}>{now}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white transition-colors" style={{ border: "1px solid #E2E8F0" }}>
            <RefreshCw className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
            <span style={{ fontSize: 12.5, color: "#374151", fontFamily: "'Inter', sans-serif" }}>Atualizar</span>
          </button>
          <button
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white transition-all"
            style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.background = PH)}
            onMouseLeave={e => (e.currentTarget.style.background = P)}
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Cobrança
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pix Cobrança", icon: QrCode, color: "#00907A", bg: "#F0FDFB" },
          { label: "Novo Boleto", icon: FileText, color: P, bg: "#EEF2F9" },
          { label: "Link de Pag.", icon: Send, color: "#6B4BAF", bg: "#F5F1FF" },
          { label: "Pagar Conta", icon: Zap, color: "#B07A1A", bg: "#FDF8EE" },
        ].map((a) => (
          <button
            key={a.label}
            className="flex items-center gap-2.5 px-3 py-3 rounded-2xl bg-white transition-all hover:shadow-md"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: a.bg }}>
              <a.icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "#374151", fontFamily: "'Inter', sans-serif" }}>{a.label}</span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard title="Recebido no Mês"  value={kpiData.recebidoMes}         trend={kpiData.recebidoMesTrend}      trendLabel="vs. mês anterior"     icon={ArrowDownCircle} color={SUCCESS} />
        <KPICard title="A Receber (30d)"  value={kpiData.aReceber30d}          trend={kpiData.aReceber30dTrend}      trendLabel="próximos 30 dias"      icon={DollarSign}      color={P} />
        <KPICard title="A Pagar (30d)"    value={kpiData.apagarProx30d}        trend={kpiData.apagarProx30dTrend}    trendLabel="próximas obrigações"   icon={ArrowUpCircle}   color={WARNING} />
        <KPICard title="Saldo em Conta"   value={kpiData.saldoConta}           trend={kpiData.saldoContaTrend}       trendLabel="todas as contas"       icon={Wallet}          color="#6B4BAF" />
        <KPICard title="Inadimplência"    value={kpiData.taxaInadimplencia}    trend={kpiData.taxaInadimplenciaTrend} trendLabel="taxa atual"           icon={AlertTriangle}   color={DANGER}  suffix="%" />
        <KPICard title="DSO"              value={`${kpiData.dso}d`}            trend={kpiData.dsoTrend}              trendLabel="dias para receber"     icon={Activity}        color="#0E7B85"  suffix="" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cash flow */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14.5, fontWeight: 800, color: P }}>Fluxo de Caixa</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#64748B" }}>Recebimentos vs. Pagamentos</p>
            </div>
            <div className="flex gap-1">
              {["3m", "6m", "12m"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className="px-3 py-1 rounded-lg transition-all"
                  style={{
                    fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 600,
                    background: period === p ? P : "#F1F5F9",
                    color: period === p ? "white" : "#64748B",
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={cashFlowChartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8, fontFamily: "Inter" }} />
              <Bar dataKey="recebido" name="Recebido" fill={CHART_SUCCESS} radius={[4, 4, 0, 0]} />
              <Bar dataKey="pago"     name="Pago"     fill={P}             radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14.5, fontWeight: 800, color: P, marginBottom: 2 }}>Recebimentos</h3>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#64748B", marginBottom: 14 }}>Por método — mês atual</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={receivablesByMethod} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {receivablesByMethod.map((_, i) => (
                  <Cell key={i} fill={pieColors[i % pieColors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {receivablesByMethod.map((m, i) => (
              <div key={m.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: pieColors[i % pieColors.length] }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#374151", flex: 1 }}>{m.name}</span>
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700, color: "#1E293B" }}>{m.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Projection + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Projection */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14.5, fontWeight: 800, color: P }}>Projeção de Caixa — 90 dias</h3>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#64748B" }}>Baseada em histórico + IA preditiva</p>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ background: SUCCESS_BG }}>
              <TrendingUp className="w-3.5 h-3.5" style={{ color: SUCCESS }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 700, color: SUCCESS }}>+49,7% em 90d</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={190}>
            <AreaChart data={cashProjectionData}>
              <defs>
                <linearGradient id="proj" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={P} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={P} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="saldo" name="Saldo Projetado" stroke={P} strokeWidth={2.5} fill="url(#proj)" dot={{ fill: P, r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-3 pt-3 border-t" style={{ borderColor: "#F1F5F9" }}>
            {[
              { label: "30 dias", valor: "R$ 395k", trend: "+15,7%" },
              { label: "60 dias", valor: "R$ 445k", trend: "+30,1%" },
              { label: "90 dias", valor: "R$ 512k", trend: "+49,7%" },
            ].map((p) => (
              <div key={p.label} className="text-center">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#94A3B8" }}>Em {p.label}</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B" }}>{p.valor}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: SUCCESS, fontWeight: 700 }}>{p.trend}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14.5, fontWeight: 800, color: P }}>Alertas</h3>
            <span className="text-xs px-2 py-0.5 rounded-full text-white" style={{ background: DANGER, fontSize: 10, fontWeight: 700 }}>
              2 urgentes
            </span>
          </div>
          <div className="space-y-2.5">
            {alerts.map((a) => <AlertItem key={a.id} alert={a} />)}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "#F1F5F9" }}>
          <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14.5, fontWeight: 800, color: P }}>Transações Recentes</h3>
          <button style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: P, fontWeight: 600 }}>Ver todas →</button>
        </div>
        <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
          {recentTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: tx.tipo === "recebido" ? SUCCESS_BG : WARNING_BG }}>
                {tx.tipo === "recebido"
                  ? <ArrowDownCircle className="w-4 h-4" style={{ color: SUCCESS }} />
                  : <ArrowUpCircle   className="w-4 h-4" style={{ color: WARNING }} />}
              </div>
              <div className="flex-1 min-w-0">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{tx.cliente}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8" }}>{tx.id} · {tx.metodo.toUpperCase()}</p>
              </div>
              <div className="text-right">
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 700, color: tx.tipo === "recebido" ? SUCCESS : WARNING }}>
                  {tx.tipo === "recebido" ? "+" : ""}{fmtFull(tx.valor)}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8" }}>{tx.horario}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}