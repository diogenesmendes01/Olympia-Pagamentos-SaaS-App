import { useState } from "react";
import {
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  BarChart3,
  DollarSign,
  Clock,
  AlertTriangle,
  Receipt,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import { cashFlowChartData, dreData, agingData } from "../data/mockData";
import {
  PRIMARY as P,
  PRIMARY_HOVER as PH,
  GOLD as G,
  SUCCESS,
  SUCCESS_BG,
  WARNING,
  WARNING_BG,
  DANGER,
  DANGER_BG,
  CHART_SUCCESS,
} from "../styles/tokens";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Math.abs(v));

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="rounded-2xl bg-white p-3.5 shadow-xl"
        style={{ border: "1px solid #E2E8F0", minWidth: 160 }}
      >
        <p
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "#374151",
            marginBottom: 4,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {label}
        </p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ fontSize: 12, color: p.color, fontFamily: "'Inter', sans-serif" }}>
            {p.name}:{" "}
            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ReportsPage() {
  const [activeReport, setActiveReport] = useState("dre");
  const [period, setPeriod] = useState("abril-2026");

  const reportTypes = [
    { id: "dre", label: "DRE", Icon: BarChart3, desc: "Demonstração do Resultado" },
    { id: "cashflow", label: "Fluxo de Caixa", Icon: DollarSign, desc: "Entradas e saídas" },
    { id: "aging", label: "Aging (Vencimentos)", Icon: Clock, desc: "Análise por faixa de prazo" },
    {
      id: "inadimplencia",
      label: "Inadimplência",
      Icon: AlertTriangle,
      desc: "Clientes em atraso",
    },
    { id: "fiscal", label: "Relatórios Fiscais", Icon: Receipt, desc: "SPED, EFD, DCTF" },
  ];

  const inadimplenciaData = [
    { cliente: "Tech Solutions ME", valor: 32000, diasAtraso: 2, risco: "alto" },
    { cliente: "Grupo Nexus Ltda", valor: 5600, diasAtraso: 2, risco: "medio" },
    { cliente: "MK Distribuidora", valor: 3800, diasAtraso: 2, risco: "baixo" },
  ];

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
              color: P,
            }}
          >
            Relatórios & Análises
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>
            Dados financeiros consolidados para decisão estratégica
          </p>
        </div>
        <div className="flex gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border bg-white px-3 py-2 focus:outline-none"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, borderColor: "#E2E8F0" }}
          >
            <option value="abril-2026">Abril 2026</option>
            <option value="marco-2026">Março 2026</option>
            <option value="q1-2026">Q1 2026</option>
            <option value="2026">Ano 2026</option>
          </select>
          {["PDF", "Excel"].map((f) => (
            <button
              key={f}
              onClick={() => toast.success(`Exportado em ${f}!`)}
              className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 hover:bg-slate-50"
              style={{
                border: "1px solid #E2E8F0",
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
              }}
            >
              <Download className="h-3.5 w-3.5" style={{ color: "#64748B" }} />
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Report nav */}
        <div className="rounded-2xl bg-white p-2" style={{ border: "1px solid #E2E8F0" }}>
          {reportTypes.map((r) => (
            <button
              key={r.id}
              onClick={() => setActiveReport(r.id)}
              className="mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all"
              style={{ background: activeReport === r.id ? "#EEF2F9" : "transparent" }}
            >
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
                style={{ background: activeReport === r.id ? P + "18" : "#F1F5F9" }}
              >
                <r.Icon
                  className="h-4 w-4"
                  style={{ color: activeReport === r.id ? P : "#94A3B8" }}
                />
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: activeReport === r.id ? P : "#374151",
                  }}
                >
                  {r.label}
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8" }}>
                  {r.desc}
                </p>
              </div>
              {activeReport === r.id && (
                <ChevronRight className="ml-auto h-4 w-4" style={{ color: P }} />
              )}
            </button>
          ))}

          <div className="mt-4 border-t pt-4" style={{ borderColor: "#F1F5F9" }}>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10,
                fontWeight: 700,
                color: "#94A3B8",
                letterSpacing: "0.1em",
                marginBottom: 8,
                padding: "0 10px",
              }}
            >
              EXPORTAÇÕES FISCAIS
            </p>
            {["SPED Fiscal", "EFD Contribuições", "DCTF", "Balancete"].map((f) => (
              <button
                key={f}
                onClick={() => toast.success(`${f} exportado!`)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-slate-50"
              >
                <FileText className="h-3.5 w-3.5" style={{ color: "#94A3B8" }} />
                <span
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151" }}
                >
                  {f}
                </span>
                <Download className="ml-auto h-3 w-3" style={{ color: "#94A3B8" }} />
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 lg:col-span-3">
          {activeReport === "dre" && (
            <div
              className="overflow-hidden rounded-2xl bg-white"
              style={{ border: "1px solid #E2E8F0" }}
            >
              <div
                className="flex items-center justify-between border-b px-5 py-4"
                style={{ borderColor: "#F1F5F9" }}
              >
                <div>
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: P,
                    }}
                  >
                    Demonstração do Resultado — DRE
                  </h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>
                    Período: Abril 2026
                  </p>
                </div>
                <button
                  onClick={() => toast.success("DRE exportada!")}
                  className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 hover:bg-slate-50"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <Download className="h-3.5 w-3.5" style={{ color: "#64748B" }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12 }}>Exportar</span>
                </button>
              </div>
              <div>
                {dreData.map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-t px-5 py-3 transition-colors hover:bg-slate-50"
                    style={{
                      background: item.tipo === "resultado" ? "#F8FAFC" : "transparent",
                      borderColor: "#F8FAFC",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: item.tipo === "resultado" ? 700 : 400,
                        color: item.tipo === "resultado" ? "#1E293B" : "#374151",
                        paddingLeft: item.tipo !== "resultado" ? 16 : 0,
                      }}
                    >
                      {item.categoria}
                    </p>
                    <div className="flex items-center gap-2">
                      {item.tipo === "resultado" && item.valor > 0 && (
                        <TrendingUp className="h-3.5 w-3.5" style={{ color: SUCCESS }} />
                      )}
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: item.tipo === "resultado" ? 14 : 12.5,
                          fontWeight: item.tipo === "resultado" ? 800 : 500,
                          color:
                            item.valor > 0
                              ? item.tipo === "resultado"
                                ? "#1E293B"
                                : "#374151"
                              : DANGER,
                        }}
                      >
                        {item.valor < 0 ? "-" : ""}
                        {fmt(item.valor)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div
                className="grid grid-cols-3 gap-3 border-t p-5"
                style={{ borderColor: "#F1F5F9" }}
              >
                {[
                  { label: "Receita Bruta", value: "R$ 284.500", trend: "+12,4%", color: SUCCESS },
                  { label: "EBITDA", value: "R$ 102.120", trend: "35,9% margem", color: P },
                  { label: "Lucro Líquido", value: "R$ 74.940", trend: "26,3% margem", color: G },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border p-3.5 text-center"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 18,
                        fontWeight: 800,
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11.5,
                        color: "#374151",
                        marginTop: 2,
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: s.color,
                      }}
                    >
                      {s.trend}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === "cashflow" && (
            <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: P,
                  marginBottom: 4,
                }}
              >
                Fluxo de Caixa — Últimos 6 Meses
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 16,
                }}
              >
                Recebimentos, pagamentos e saldo líquido
              </p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={cashFlowChartData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="mes"
                    tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11, fontFamily: "Inter" }}
                  />
                  <Bar
                    dataKey="recebido"
                    name="Recebido"
                    fill={CHART_SUCCESS}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar dataKey="pago" name="Pago" fill={P} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="saldo" name="Saldo" fill={G} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Total Recebido",
                    value: cashFlowChartData.reduce((s, d) => s + d.recebido, 0),
                    color: SUCCESS,
                  },
                  {
                    label: "Total Pago",
                    value: cashFlowChartData.reduce((s, d) => s + d.pago, 0),
                    color: P,
                  },
                  {
                    label: "Saldo Acumulado",
                    value: cashFlowChartData.reduce((s, d) => s + d.saldo, 0),
                    color: G,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border p-3 text-center"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 16,
                        fontWeight: 800,
                        color: s.color,
                      }}
                    >
                      {fmt(s.value)}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11.5,
                        color: "#64748B",
                      }}
                    >
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === "aging" && (
            <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: P,
                  marginBottom: 4,
                }}
              >
                Análise de Aging — Contas a Receber
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 16,
                }}
              >
                Distribuição por faixa de vencimento
              </p>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={agingData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94A3B8", fontFamily: "Inter" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `R$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="faixa"
                    tick={{ fontSize: 11.5, fill: "#374151", fontFamily: "Inter" }}
                    axisLine={false}
                    tickLine={false}
                    width={110}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="valor" name="Valor" fill={P} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["Faixa", "Qtd. Faturas", "Valor Total", "% do Total"].map((h) => (
                        <th
                          key={h}
                          className="px-4 py-2 text-left"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 10.5,
                            fontWeight: 700,
                            color: "#94A3B8",
                          }}
                        >
                          {h.toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agingData.map((d, i) => {
                      const total = agingData.reduce((s, r) => s + r.valor, 0);
                      const pct = ((d.valor / total) * 100).toFixed(1);
                      const overdue = d.faixa.includes("Vencido");
                      return (
                        <tr
                          key={i}
                          className="border-t hover:bg-slate-50"
                          style={{ borderColor: "#F8FAFC" }}
                        >
                          <td
                            className="px-4 py-2.5"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              color: overdue ? DANGER : "#374151",
                              fontWeight: overdue ? 700 : 400,
                            }}
                          >
                            {d.faixa}
                          </td>
                          <td
                            className="px-4 py-2.5"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              color: "#374151",
                            }}
                          >
                            {d.qtd}
                          </td>
                          <td
                            className="px-4 py-2.5"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: overdue ? DANGER : "#1E293B",
                            }}
                          >
                            {fmt(d.valor)}
                          </td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 flex-1 rounded-full bg-slate-100">
                                <div
                                  className="h-1.5 rounded-full"
                                  style={{ width: `${pct}%`, background: overdue ? DANGER : P }}
                                />
                              </div>
                              <span
                                style={{
                                  fontFamily: "'Inter', sans-serif",
                                  fontSize: 11.5,
                                  color: "#64748B",
                                }}
                              >
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeReport === "inadimplencia" && (
            <div
              className="overflow-hidden rounded-2xl bg-white"
              style={{ border: "1px solid #E2E8F0" }}
            >
              <div className="border-b px-5 py-4" style={{ borderColor: "#F1F5F9" }}>
                <h3
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: P,
                  }}
                >
                  Análise de Inadimplência
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>
                  Clientes com pagamentos em atraso
                </p>
              </div>
              <div
                className="grid grid-cols-3 gap-4 border-b p-5"
                style={{ borderColor: "#F1F5F9" }}
              >
                {[
                  { label: "Taxa de Inadimplência", value: "3,2%", trend: "-0,8%", positive: true },
                  {
                    label: "Valor Total em Atraso",
                    value: "R$ 41.400",
                    trend: "+R$ 2.100",
                    positive: false,
                  },
                  {
                    label: "Clientes Inadimplentes",
                    value: "3",
                    trend: "0 novos hoje",
                    positive: true,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="rounded-2xl border p-3.5"
                    style={{ borderColor: "#F1F5F9" }}
                  >
                    <p
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 18,
                        fontWeight: 800,
                        color: "#1E293B",
                      }}
                    >
                      {s.value}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11.5,
                        color: "#64748B",
                      }}
                    >
                      {s.label}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11.5,
                        fontWeight: 700,
                        color: s.positive ? SUCCESS : DANGER,
                      }}
                    >
                      {s.trend}
                    </p>
                  </div>
                ))}
              </div>
              <div className="divide-y" style={{ borderColor: "#F8FAFC" }}>
                {inadimplenciaData.map((c, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-slate-50">
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
                      style={{
                        background:
                          c.risco === "alto" ? DANGER : c.risco === "medio" ? WARNING : "#64748B",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {c.diasAtraso}d
                    </div>
                    <div className="flex-1">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13.5,
                          fontWeight: 600,
                          color: "#1E293B",
                        }}
                      >
                        {c.cliente}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          color: "#94A3B8",
                        }}
                      >
                        {c.diasAtraso} dias em atraso
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        style={{
                          fontFamily: "'Montserrat', sans-serif",
                          fontSize: 14,
                          fontWeight: 800,
                          color: "#DC2626",
                        }}
                      >
                        {fmt(c.valor)}
                      </p>
                      <span
                        className="rounded px-2 py-0.5 text-xs font-bold"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          background:
                            c.risco === "alto"
                              ? DANGER_BG
                              : c.risco === "medio"
                                ? WARNING_BG
                                : "#F1F5F9",
                          color:
                            c.risco === "alto" ? DANGER : c.risco === "medio" ? WARNING : "#64748B",
                        }}
                      >
                        Risco {c.risco.toUpperCase()}
                      </span>
                    </div>
                    <button
                      onClick={() => toast.success(`Lembrete enviado para ${c.cliente}`)}
                      className="ml-2 rounded-xl px-3 py-1.5 text-xs font-semibold text-white transition-all"
                      style={{ background: P, fontFamily: "'Inter', sans-serif" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                      onMouseLeave={(e) => (e.currentTarget.style.background = P)}
                    >
                      Cobrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeReport === "fiscal" && (
            <div
              className="overflow-hidden rounded-2xl bg-white"
              style={{ border: "1px solid #E2E8F0" }}
            >
              <div className="border-b px-5 py-4" style={{ borderColor: "#F1F5F9" }}>
                <h3
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: P,
                  }}
                >
                  Relatórios Fiscais e Obrigações
                </h3>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#64748B" }}>
                  Competência: Abril 2026
                </p>
              </div>
              <div className="space-y-3 p-5">
                {[
                  {
                    nome: "SPED Fiscal (EFD ICMS/IPI)",
                    prazo: "15/05/2026",
                    status: "pendente",
                    tipo: "Mensal",
                  },
                  {
                    nome: "EFD Contribuições (PIS/COFINS)",
                    prazo: "15/05/2026",
                    status: "pendente",
                    tipo: "Mensal",
                  },
                  {
                    nome: "DCTF (Declaração de Débitos)",
                    prazo: "15/05/2026",
                    status: "pendente",
                    tipo: "Mensal",
                  },
                  {
                    nome: "DIRF (Retenções na Fonte)",
                    prazo: "28/02/2026",
                    status: "entregue",
                    tipo: "Anual",
                  },
                  {
                    nome: "ECF (Imposto de Renda PJ)",
                    prazo: "31/07/2026",
                    status: "em-preparo",
                    tipo: "Anual",
                  },
                ].map((o) => (
                  <div
                    key={o.nome}
                    className="flex items-center gap-3 rounded-2xl border p-3.5 transition-colors hover:bg-slate-50"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-xl"
                      style={{ background: "#F8FAFC" }}
                    >
                      <FileText className="h-4 w-4" style={{ color: "#64748B" }} />
                    </div>
                    <div className="flex-1">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1E293B",
                        }}
                      >
                        {o.nome}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11.5,
                          color: "#94A3B8",
                        }}
                      >
                        Prazo: {o.prazo} · {o.tipo}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-bold"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        background:
                          o.status === "entregue"
                            ? SUCCESS_BG
                            : o.status === "pendente"
                              ? WARNING_BG
                              : "#EEF2F9",
                        color:
                          o.status === "entregue" ? SUCCESS : o.status === "pendente" ? WARNING : P,
                      }}
                    >
                      {o.status === "entregue" && <CheckCircle className="h-3 w-3" />}
                      {o.status === "pendente" && <Clock className="h-3 w-3" />}
                      {o.status === "em-preparo" && <RefreshCw className="h-3 w-3" />}
                      {o.status === "entregue"
                        ? "Entregue"
                        : o.status === "pendente"
                          ? "Pendente"
                          : "Em Preparo"}
                    </span>
                    <button
                      onClick={() => toast.success(`${o.nome} exportado!`)}
                      className="rounded-xl p-1.5 hover:bg-slate-100"
                    >
                      <Download className="h-4 w-4" style={{ color: "#94A3B8" }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
