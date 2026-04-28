import React, { useState } from "react";
import {
  Plus,
  Search,
  Download,
  Send,
  QrCode,
  FileText,
  MoreHorizontal,
  Eye,
  Edit2,
  Trash2,
  Bell,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { receivables, type Receivable } from "../data/mockData";
import { toast } from "sonner";

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
} from "../styles/tokens";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

const statusConfig: Record<
  Receivable["status"],
  { label: string; bg: string; text: string; icon: any }
> = {
  pago: { label: "Pago", bg: SUCCESS_BG, text: SUCCESS, icon: CheckCircle },
  pendente: { label: "Pendente", bg: "#EEF3F8", text: P, icon: Clock },
  vencido: { label: "Vencido", bg: DANGER_BG, text: DANGER, icon: XCircle },
  agendado: { label: "Agendado", bg: "#F5F1FF", text: "#6B4BAF", icon: Clock },
  parcial: {
    label: "Parcial",
    bg: WARNING_BG,
    text: WARNING,
    icon: AlertTriangle,
  },
};

const methodConfig: Record<
  Receivable["metodo"],
  { label: string; color: string; bg: string }
> = {
  pix: { label: "Pix", color: "#00907A", bg: "#F0FDFB" },
  boleto: { label: "Boleto", color: P, bg: "#EEF2F9" },
  cartao: { label: "Cartão", color: "#6B4BAF", bg: "#F5F1FF" },
  ted: { label: "TED", color: "#B07A1A", bg: "#FDF8EE" },
  link: { label: "Link", color: "#B0246A", bg: "#FFF0F7" },
};

// Extracted out of component to avoid react-hooks/static-components violation
function BtnPrimary({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-white transition-all ${className}`}
      style={{
        background: P,
        fontFamily: "'Inter', sans-serif",
        fontSize: 12.5,
        fontWeight: 700,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
      onMouseLeave={(e) => (e.currentTarget.style.background = P)}
    >
      {children}
    </button>
  );
}

export function ReceivablesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [methodFilter, setMethodFilter] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = receivables.filter((r) => {
    const ms =
      r.cliente.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.descricao.toLowerCase().includes(search.toLowerCase());
    return (
      ms &&
      (statusFilter === "todos" || r.status === statusFilter) &&
      (methodFilter === "todos" || r.metodo === methodFilter)
    );
  });

  const totals = {
    pendente: receivables
      .filter((r) => r.status === "pendente")
      .reduce((s, r) => s + r.valor, 0),
    vencido: receivables
      .filter((r) => r.status === "vencido")
      .reduce((s, r) => s + r.valor, 0),
    pago: receivables
      .filter((r) => r.status === "pago")
      .reduce((s, r) => s + r.valor, 0),
    agendado: receivables
      .filter((r) => r.status === "agendado")
      .reduce((s, r) => s + r.valor, 0),
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) {
      s.delete(id);
    } else {
      s.add(id);
    }
    setSelected(s);
  };

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
            Contas a Receber
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              color: "#64748B",
            }}
          >
            Gerencie cobranças, faturas e recebimentos
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="flex items-center gap-1.5 rounded-xl bg-white px-3 py-2 transition-colors"
            style={{ border: "1px solid #E2E8F0" }}
            onClick={() => toast.success("Exportando...")}
          >
            <Download className="h-3.5 w-3.5" style={{ color: "#64748B" }} />
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                color: "#374151",
              }}
            >
              Exportar
            </span>
          </button>
          <BtnPrimary
            onClick={() => {
              setShowModal(true);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Cobrança
          </BtnPrimary>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          {
            label: "Pendente",
            value: totals.pendente,
            color: P,
            count: receivables.filter((r) => r.status === "pendente").length,
          },
          {
            label: "Vencido",
            value: totals.vencido,
            color: DANGER,
            count: receivables.filter((r) => r.status === "vencido").length,
          },
          {
            label: "Recebido no Mês",
            value: totals.pago,
            color: SUCCESS,
            count: receivables.filter((r) => r.status === "pago").length,
          },
          {
            label: "Agendado",
            value: totals.agendado,
            color: "#6B4BAF",
            count: receivables.filter((r) => r.status === "agendado").length,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl bg-white p-4"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 19,
                fontWeight: 800,
                color: s.color,
              }}
            >
              {fmt(s.value)}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "#374151",
                marginTop: 1,
              }}
            >
              {s.label}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "#94A3B8",
                marginTop: 1,
              }}
            >
              {s.count} {s.count === 1 ? "fatura" : "faturas"}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="rounded-2xl bg-white p-4"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div
            className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-2"
            style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}
          >
            <Search className="h-4 w-4" style={{ color: "#94A3B8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              placeholder="Buscar por cliente, ID ou descrição..."
              className="flex-1 bg-transparent focus:outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#374151",
              }}
            />
          </div>
          <div className="flex gap-2">
            {[
              {
                value: statusFilter,
                onChange: setStatusFilter,
                opts: [
                  ["todos", "Todos os Status"],
                  ["pendente", "Pendente"],
                  ["pago", "Pago"],
                  ["vencido", "Vencido"],
                  ["agendado", "Agendado"],
                ],
              },
              {
                value: methodFilter,
                onChange: setMethodFilter,
                opts: [
                  ["todos", "Todos os Métodos"],
                  ["pix", "Pix"],
                  ["boleto", "Boleto"],
                  ["cartao", "Cartão"],
                  ["ted", "TED"],
                ],
              },
            ].map((sel, i) => (
              <select
                key={i}
                value={sel.value}
                onChange={(e) => {
                  sel.onChange(e.target.value);
                }}
                className="rounded-xl border bg-white px-3 py-2 focus:outline-none"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#374151",
                  borderColor: "#E2E8F0",
                }}
              >
                {sel.opts.map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            ))}
          </div>
        </div>
        {selected.size > 0 && (
          <div
            className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2"
            style={{ background: "#EEF2F9" }}
          >
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                color: P,
                fontWeight: 700,
              }}
            >
              {selected.size} selecionada(s)
            </span>
            <button
              onClick={() => toast.success("Lembretes enviados!")}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1 text-white"
              style={{
                background: P,
                fontFamily: "'Inter', sans-serif",
                fontSize: 11.5,
              }}
            >
              <Send className="h-3 w-3" />
              Enviar Lembrete
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div
        className="overflow-hidden rounded-2xl bg-white"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr
                style={{
                  background: "#F8FAFC",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    onChange={(e) => {
                      setSelected(
                        e.target.checked
                          ? new Set(filtered.map((r) => r.id))
                          : new Set(),
                      );
                    }}
                    className="rounded"
                  />
                </th>
                {[
                  "ID / Descrição",
                  "Cliente",
                  "Vencimento",
                  "Valor",
                  "Método",
                  "NF-e",
                  "Status",
                  "Ações",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left whitespace-nowrap"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "#94A3B8",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((rec) => {
                const sc = statusConfig[rec.status];
                const mc = methodConfig[rec.metodo];
                const Icon = sc.icon;
                return (
                  <tr
                    key={rec.id}
                    className="transition-colors hover:bg-slate-50"
                    style={{ borderTop: "1px solid #F8FAFC" }}
                  >
                    <td className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={selected.has(rec.id)}
                        onChange={() => {
                          toggleSelect(rec.id);
                        }}
                        className="rounded"
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#1E293B",
                        }}
                      >
                        {rec.id}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "#94A3B8",
                        }}
                        className="max-w-[170px] truncate"
                      >
                        {rec.descricao}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          fontWeight: 500,
                          color: "#374151",
                        }}
                      >
                        {rec.cliente}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10.5,
                          color: "#94A3B8",
                        }}
                      >
                        {rec.cnpj}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          fontWeight: rec.status === "vencido" ? 700 : 400,
                          color: rec.status === "vencido" ? DANGER : "#374151",
                        }}
                      >
                        {new Date(rec.vencimento).toLocaleDateString("pt-BR")}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: "#1E293B",
                        }}
                      >
                        {fmt(rec.valor)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="rounded-xl px-2.5 py-1"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          background: mc.bg,
                          color: mc.color,
                        }}
                      >
                        {mc.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {rec.nfEmitida ? (
                        <span
                          className="rounded-xl px-2.5 py-1"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            background: SUCCESS_BG,
                            color: SUCCESS,
                          }}
                        >
                          Emitida
                        </span>
                      ) : (
                        <button
                          onClick={() =>
                            toast.success(`NFS-e emitida para ${rec.cliente}`)
                          }
                          className="rounded-xl px-2.5 py-1"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            background: "#FDF8EE",
                            color: G,
                            border: `1px solid rgba(200,169,107,0.3)`,
                          }}
                        >
                          Emitir
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1"
                        style={{ background: sc.bg }}
                      >
                        <Icon className="h-3 w-3" style={{ color: sc.text }} />
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 11,
                            fontWeight: 700,
                            color: sc.text,
                          }}
                        >
                          {sc.label}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <button
                          onClick={() => {
                            setOpenMenu(openMenu === rec.id ? null : rec.id);
                          }}
                          className="rounded-lg p-1.5 hover:bg-slate-100"
                        >
                          <MoreHorizontal
                            className="h-4 w-4"
                            style={{ color: "#94A3B8" }}
                          />
                        </button>
                        {openMenu === rec.id && (
                          <div
                            className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-2xl bg-white py-1 shadow-xl"
                            style={{ border: "1px solid #E2E8F0" }}
                          >
                            {[
                              {
                                icon: Eye,
                                label: "Ver Detalhes",
                                action: "view",
                              },
                              {
                                icon: Bell,
                                label: "Enviar Lembrete",
                                action: "reminder",
                              },
                              {
                                icon: FileText,
                                label: "Emitir NF-e",
                                action: "nf",
                              },
                              { icon: Edit2, label: "Editar", action: "edit" },
                              {
                                icon: Trash2,
                                label: "Excluir",
                                action: "delete",
                              },
                            ].map((item) => (
                              <button
                                key={item.action}
                                onClick={() => {
                                  setOpenMenu(null);
                                  if (item.action === "reminder")
                                    toast.success(
                                      `Lembrete enviado para ${rec.cliente}`,
                                    );
                                  else if (item.action === "nf")
                                    toast.success("NFS-e emitida!");
                                  else if (item.action === "delete")
                                    toast.error(`${rec.id} excluído`);
                                  else toast.info("Abrindo...");
                                }}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50"
                              >
                                <item.icon
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color:
                                      item.action === "delete"
                                        ? DANGER
                                        : "#94A3B8",
                                  }}
                                />
                                <span
                                  style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 12.5,
                                    color:
                                      item.action === "delete"
                                        ? DANGER
                                        : "#374151",
                                  }}
                                >
                                  {item.label}
                                </span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div
          className="flex items-center justify-between border-t px-5 py-3"
          style={{ borderColor: "#F1F5F9" }}
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12,
              color: "#94A3B8",
            }}
          >
            Exibindo {filtered.length} de {receivables.length} cobranças
          </p>
          <div className="flex gap-1">
            {[1, 2, 3].map((pg) => (
              <button
                key={pg}
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background: pg === 1 ? P : "#F1F5F9",
                  color: pg === 1 ? "white" : "#64748B",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {pg}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* New Charge Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: "#F1F5F9" }}
            >
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: P,
                }}
              >
                Nova Cobrança
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                }}
                className="rounded-xl p-1.5 hover:bg-slate-100"
              >
                <XCircle className="h-5 w-5" style={{ color: "#94A3B8" }} />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: "#374151",
                    display: "block",
                    marginBottom: 8,
                  }}
                >
                  Método de Cobrança
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      icon: QrCode,
                      label: "Pix",
                      color: "#00907A",
                      bg: "#F0FDFB",
                      borderColor: "#00907A",
                    },
                    {
                      icon: FileText,
                      label: "Boleto",
                      color: P,
                      bg: "#EEF2F9",
                      borderColor: "#BDD0E8",
                    },
                    {
                      icon: RefreshCw,
                      label: "Recorrente",
                      color: "#6B4BAF",
                      bg: "#F5F1FF",
                      borderColor: "#C4B5F0",
                    },
                  ].map((m, i) => (
                    <button
                      key={m.label}
                      className="flex flex-col items-center gap-1.5 rounded-xl border-2 p-3 transition-all"
                      style={{
                        borderColor: i === 0 ? m.borderColor : "#E2E8F0",
                        background: i === 0 ? m.bg : "white",
                      }}
                    >
                      <m.icon className="h-5 w-5" style={{ color: m.color }} />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11.5,
                          fontWeight: 700,
                          color: i === 0 ? m.color : "#64748B",
                        }}
                      >
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              {[
                {
                  label: "Cliente / CNPJ",
                  placeholder: "Buscar cliente...",
                  type: "text",
                },
                {
                  label: "Descrição do Serviço",
                  placeholder: "Ex: Consultoria - Maio/26",
                  type: "text",
                },
                { label: "Valor (R$)", placeholder: "0,00", type: "text" },
                { label: "Vencimento", placeholder: "", type: "date" },
              ].map((f) => (
                <div key={f.label}>
                  <label
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "#374151",
                      display: "block",
                      marginBottom: 5,
                    }}
                  >
                    {f.label}
                  </label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    className="w-full rounded-xl border px-4 py-2.5 transition-all focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      background: "#F8FAFC",
                      borderColor: "#E2E8F0",
                      color: "#1E293B",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = P;
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#E2E8F0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                </div>
              ))}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Juros (%/mês)", ph: "1,00" },
                  { label: "Multa (%)", ph: "2,00" },
                  { label: "Desconto (%)", ph: "0,00" },
                ].map((f) => (
                  <div key={f.label}>
                    <label
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#374151",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {f.label}
                    </label>
                    <input
                      placeholder={f.ph}
                      className="w-full rounded-xl border px-3 py-2 focus:outline-none"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        borderColor: "#E2E8F0",
                      }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="emitirNF"
                  className="rounded"
                  style={{ accentColor: P }}
                />
                <label
                  htmlFor="emitirNF"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    color: "#374151",
                  }}
                >
                  Emitir NFS-e automaticamente ao confirmar pagamento
                </label>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => {
                  setShowModal(false);
                }}
                className="flex-1 rounded-xl border py-2.5 hover:bg-slate-50"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  borderColor: "#E2E8F0",
                  color: "#64748B",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  toast.success("Cobrança criada e enviada!");
                }}
                className="flex-1 rounded-xl py-2.5 text-white transition-all"
                style={{
                  background: P,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13.5,
                  fontWeight: 700,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                onMouseLeave={(e) => (e.currentTarget.style.background = P)}
              >
                Criar e Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
