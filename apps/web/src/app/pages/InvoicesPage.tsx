import { useState } from "react";
import {
  Plus,
  Search,
  Download,
  FileText,
  Eye,
  Send,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  Trash2,
  ArrowRight,
  ArrowLeft,
  MoreHorizontal,
  Mail,
  MessageCircle,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import {
  invoices as mockInvoices,
  type Invoice,
  type InvoiceItem,
} from "../data/mockData";
import {
  PRIMARY as P,
  PRIMARY_HOVER as PH,
  GOLD as G,
  SUCCESS,
  SUCCESS_BG,
  SUCCESS_BORDER,
  WARNING,
  WARNING_BG,
  WARNING_BORDER,
  DANGER,
  DANGER_BG,
  DANGER_BORDER,
  PRIMARY_SOFT,
} from "../styles/tokens";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    v,
  );

const statusConfig: Record<
  Invoice["status"],
  { label: string; bg: string; text: string; border: string; icon: any }
> = {
  emitida: {
    label: "Emitida",
    bg: PRIMARY_SOFT,
    text: P,
    border: "#C3D0E4",
    icon: FileText,
  },
  enviada: {
    label: "Enviada",
    bg: WARNING_BG,
    text: WARNING,
    border: WARNING_BORDER,
    icon: Send,
  },
  paga: {
    label: "Paga",
    bg: SUCCESS_BG,
    text: SUCCESS,
    border: SUCCESS_BORDER,
    icon: CheckCircle,
  },
  cancelada: {
    label: "Cancelada",
    bg: DANGER_BG,
    text: DANGER,
    border: DANGER_BORDER,
    icon: XCircle,
  },
  rascunho: {
    label: "Rascunho",
    bg: "#F1F5F9",
    text: "#64748B",
    border: "#E2E8F0",
    icon: Clock,
  },
};

// ─── Invoice creation wizard ──────────────────────────────────────────────────
type WizardItem = InvoiceItem;

interface WizardData {
  // step 1
  tipo: "nfse" | "nfe";
  cliente: string;
  cnpj: string;
  email: string;
  descricao: string;
  vencimento: string;
  // step 2
  items: WizardItem[];
  // step 3 (computed)
}

const emptyWizard: WizardData = {
  tipo: "nfse",
  cliente: "",
  cnpj: "",
  email: "",
  descricao: "",
  vencimento: "",
  items: [{ id: "1", descricao: "", qtd: 1, unitario: 0, total: 0 }],
};

function InvoiceWizard({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (inv: Invoice) => void;
}) {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>(emptyWizard);
  const [saving, setSaving] = useState(false);

  const totalBruto = data.items.reduce((s, i) => s + i.total, 0);
  const aliquota = data.tipo === "nfse" ? 0.08 : 0.12; // ISS ou ICMS+PIS+COFINS
  const impostos = totalBruto * aliquota;
  const liquido = totalBruto - impostos;

  const updateItem = (id: string, key: keyof WizardItem, val: any) => {
    setData((d) => ({
      ...d,
      items: d.items.map((it) => {
        if (it.id !== id) return it;
        const updated = { ...it, [key]: val };
        if (key === "qtd" || key === "unitario") {
          updated.total =
            (key === "qtd" ? val : it.qtd) *
            (key === "unitario" ? val : it.unitario);
        }
        return updated;
      }),
    }));
  };

  const addItem = () => {
    setData((d) => ({
      ...d,
      items: [
        ...d.items,
        {
          id: String(Date.now()),
          descricao: "",
          qtd: 1,
          unitario: 0,
          total: 0,
        },
      ],
    }));
  };

  const removeItem = (id: string) => {
    setData((d) => ({ ...d, items: d.items.filter((i) => i.id !== id) }));
  };

  const handleEmit = async (asDraft = false) => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    const newInv: Invoice = {
      // eslint-disable-next-line react-hooks/purity -- Math.random in submit handler (not render), Figma Make generated
      id: `INV-${2607 + Math.floor(Math.random() * 100)}`,
      numero: String(2607),
      cliente: data.cliente || "Cliente Demo",
      cnpj: data.cnpj,
      email: data.email,
      descricao: data.descricao,
      valor: totalBruto,
      impostos,
      valorLiquido: liquido,
      emissao: new Date().toISOString().split("T")[0],
      vencimento: data.vencimento,
      status: asDraft ? "rascunho" : "emitida",
      tipo: data.tipo,
      chaveAcesso: asDraft
        ? undefined
        : // eslint-disable-next-line react-hooks/purity -- Math.random in submit handler (not render), Figma Make generated
          `3526041234567800019055001000002607${Math.floor(Math.random() * 1e10)}`,
      items: data.items,
    };
    onSave(newInv);
    toast.success(
      asDraft ? "Rascunho salvo com sucesso!" : "NF emitida com sucesso!",
    );
  };

  const inputClass =
    "w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-all";
  const inputStyle = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: "#374151",
    borderColor: "#CBD5E1",
    background: "#FFFFFF",
  };
  const onFocus = (e: any) => {
    e.currentTarget.style.borderColor = P;
    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.08)`;
  };
  const onBlur = (e: any) => {
    e.currentTarget.style.borderColor = "#CBD5E1";
    e.currentTarget.style.boxShadow = "none";
  };

  const steps = ["Cliente & Detalhes", "Itens & Impostos", "Revisão & Emissão"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="flex w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ maxHeight: "92vh" }}
      >
        {/* Header */}
        <div
          className="flex-shrink-0 border-b px-6 pt-5 pb-4"
          style={{ borderColor: "#F1F5F9" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 17,
                fontWeight: 800,
                color: P,
              }}
            >
              Nova Fatura / Nota Fiscal
            </h3>
            <button
              onClick={onClose}
              className="rounded-xl p-1.5 hover:bg-slate-100"
            >
              <XCircle className="h-5 w-5" style={{ color: "#94A3B8" }} />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => {
              const n = i + 1;
              const done = step > n;
              const active = step === n;
              return (
                <div key={s} className="flex flex-1 items-center gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <div
                      className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: done ? SUCCESS : active ? P : "#E2E8F0",
                        color: done || active ? "white" : "#94A3B8",
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {done ? <CheckCircle className="h-3.5 w-3.5" /> : n}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12,
                        fontWeight: active ? 700 : 400,
                        color: active ? P : "#94A3B8",
                      }}
                      className="hidden truncate sm:block"
                    >
                      {s}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className="mx-1 h-px flex-1"
                      style={{ background: done ? SUCCESS : "#E2E8F0" }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4">
              {/* Tipo */}
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
                  Tipo de Documento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      val: "nfse" as const,
                      label: "NFS-e",
                      desc: "Nota Fiscal de Serviço Eletrônica",
                    },
                    {
                      val: "nfe" as const,
                      label: "NF-e",
                      desc: "Nota Fiscal de Produto Eletrônica",
                    },
                  ].map((opt) => (
                    <button
                      key={opt.val}
                      onClick={() => {
                        setData((d) => ({ ...d, tipo: opt.val }));
                      }}
                      className="rounded-xl border-2 p-4 text-left transition-all"
                      style={{
                        borderColor: data.tipo === opt.val ? P : "#E2E8F0",
                        background:
                          data.tipo === opt.val ? PRIMARY_SOFT : "white",
                      }}
                    >
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: data.tipo === opt.val ? P : "#1E293B",
                        }}
                      >
                        {opt.label}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "#64748B",
                          marginTop: 2,
                        }}
                      >
                        {opt.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
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
                    Cliente / Tomador
                  </label>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="Nome ou Razão Social"
                    value={data.cliente}
                    onChange={(e) => {
                      setData((d) => ({ ...d, cliente: e.target.value }));
                    }}
                  />
                </div>
                <div>
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
                    CNPJ / CPF
                  </label>
                  <input
                    className={inputClass}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="00.000.000/0001-00"
                    value={data.cnpj}
                    onChange={(e) => {
                      setData((d) => ({ ...d, cnpj: e.target.value }));
                    }}
                  />
                </div>
                <div>
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
                    E-mail do Cliente
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder="financeiro@cliente.com.br"
                    value={data.email}
                    onChange={(e) => {
                      setData((d) => ({ ...d, email: e.target.value }));
                    }}
                  />
                </div>
                <div>
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
                    Vencimento
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    style={inputStyle}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    value={data.vencimento}
                    onChange={(e) => {
                      setData((d) => ({ ...d, vencimento: e.target.value }));
                    }}
                  />
                </div>
              </div>

              <div>
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
                  Descrição do Serviço / Mercadoria
                </label>
                <textarea
                  className={inputClass}
                  style={{ ...inputStyle, resize: "none" }}
                  rows={3}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  placeholder="Descreva o serviço ou produto…"
                  value={data.descricao}
                  onChange={(e) => {
                    setData((d) => ({ ...d, descricao: e.target.value }));
                  }}
                />
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#1E293B",
                  }}
                >
                  Itens / Serviços
                </p>
                <button
                  onClick={addItem}
                  className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-white"
                  style={{
                    background: P,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Adicionar Item
                </button>
              </div>

              {/* Table header */}
              <div
                className="grid gap-2 px-3 pb-1"
                style={{ gridTemplateColumns: "1fr 60px 100px 90px 24px" }}
              >
                {["Descrição", "Qtd", "Valor Unit.", "Total", ""].map((h) => (
                  <span
                    key={h}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10.5,
                      fontWeight: 700,
                      color: "#94A3B8",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {h.toUpperCase()}
                  </span>
                ))}
              </div>

              {data.items.map((item) => (
                <div
                  key={item.id}
                  className="grid items-center gap-2 rounded-xl p-3"
                  style={{
                    gridTemplateColumns: "1fr 60px 100px 90px 24px",
                    background: "#F8FAFC",
                    border: "1px solid #E2E8F0",
                  }}
                >
                  <input
                    className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      borderColor: "#CBD5E1",
                    }}
                    placeholder="Descrição do item"
                    value={item.descricao}
                    onChange={(e) => {
                      updateItem(item.id, "descricao", e.target.value);
                    }}
                  />
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border px-2 py-1.5 text-center text-sm focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      borderColor: "#CBD5E1",
                    }}
                    value={item.qtd}
                    onChange={(e) => {
                      updateItem(item.id, "qtd", Number(e.target.value));
                    }}
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border px-2 py-1.5 text-sm focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      borderColor: "#CBD5E1",
                    }}
                    value={item.unitario}
                    onChange={(e) => {
                      updateItem(item.id, "unitario", Number(e.target.value));
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: "#1E293B",
                    }}
                  >
                    {fmt(item.total)}
                  </span>
                  <button
                    onClick={() => {
                      removeItem(item.id);
                    }}
                    disabled={data.items.length === 1}
                  >
                    <Trash2
                      className="h-4 w-4"
                      style={{
                        color: data.items.length === 1 ? "#E2E8F0" : DANGER,
                      }}
                    />
                  </button>
                </div>
              ))}

              {/* Totals */}
              <div
                className="space-y-2 rounded-xl p-4"
                style={{
                  background: PRIMARY_SOFT,
                  border: `1px solid #C3D0E4`,
                }}
              >
                <div className="flex justify-between">
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    Subtotal
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#1E293B",
                    }}
                  >
                    {fmt(totalBruto)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      color: "#374151",
                    }}
                  >
                    {data.tipo === "nfse"
                      ? "ISS (8%)"
                      : "ICMS + PIS + COFINS (12%)"}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      color: WARNING,
                    }}
                  >
                    - {fmt(impostos)}
                  </span>
                </div>
                <div
                  className="flex justify-between border-t pt-2"
                  style={{ borderColor: "#C3D0E4" }}
                >
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      fontWeight: 700,
                      color: P,
                    }}
                  >
                    Valor Líquido
                  </span>
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 16,
                      fontWeight: 800,
                      color: P,
                    }}
                  >
                    {fmt(liquido)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3 — Preview */}
          {step === 3 && (
            <div className="space-y-4">
              <div
                className="overflow-hidden rounded-2xl"
                style={{ border: "1px solid #E2E8F0" }}
              >
                {/* NF Header */}
                <div
                  className="flex items-center justify-between px-5 py-4"
                  style={{ background: P }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: G,
                        letterSpacing: "0.1em",
                      }}
                    >
                      OLYMPIA PAGAMENTOS
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.7)",
                        marginTop: 2,
                      }}
                    >
                      CNPJ 12.345.678/0001-90
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.7)",
                      }}
                    >
                      {data.tipo === "nfse" ? "NFS-e" : "NF-e"}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 16,
                        fontWeight: 800,
                        color: "#FFFFFF",
                      }}
                    >
                      Nº 2607
                    </p>
                  </div>
                </div>

                {/* NF Body */}
                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          color: "#94A3B8",
                        }}
                      >
                        TOMADOR
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#1E293B",
                          marginTop: 2,
                        }}
                      >
                        {data.cliente || "—"}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11.5,
                          color: "#64748B",
                        }}
                      >
                        {data.cnpj || "—"}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11.5,
                          color: "#64748B",
                        }}
                      >
                        {data.email || "—"}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10.5,
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          color: "#94A3B8",
                        }}
                      >
                        EMISSÃO / VENCIMENTO
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          color: "#374151",
                          marginTop: 2,
                        }}
                      >
                        {new Date().toLocaleDateString("pt-BR")} /{" "}
                        {data.vencimento
                          ? new Date(
                              data.vencimento + "T00:00:00",
                            ).toLocaleDateString("pt-BR")
                          : "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 10.5,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        color: "#94A3B8",
                      }}
                    >
                      DESCRIÇÃO
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        color: "#374151",
                        marginTop: 2,
                      }}
                    >
                      {data.descricao || "—"}
                    </p>
                  </div>

                  <table
                    className="w-full"
                    style={{ borderCollapse: "collapse" }}
                  >
                    <thead>
                      <tr
                        style={{
                          background: "#F8FAFC",
                          borderBottom: "1px solid #E2E8F0",
                        }}
                      >
                        {["Descrição", "Qtd", "Unit.", "Total"].map((h) => (
                          <th
                            key={h}
                            className="px-3 py-2 text-left"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 10.5,
                              fontWeight: 700,
                              color: "#94A3B8",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.items.map((it) => (
                        <tr
                          key={it.id}
                          style={{ borderBottom: "1px solid #F1F5F9" }}
                        >
                          <td
                            className="px-3 py-2"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              color: "#374151",
                            }}
                          >
                            {it.descricao || "—"}
                          </td>
                          <td
                            className="px-3 py-2"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              color: "#374151",
                              textAlign: "center",
                            }}
                          >
                            {it.qtd}
                          </td>
                          <td
                            className="px-3 py-2"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              color: "#374151",
                            }}
                          >
                            {fmt(it.unitario)}
                          </td>
                          <td
                            className="px-3 py-2"
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 12.5,
                              fontWeight: 700,
                              color: "#1E293B",
                            }}
                          >
                            {fmt(it.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="space-y-1 pt-2">
                    {[
                      {
                        label: "Subtotal Bruto",
                        val: fmt(totalBruto),
                        bold: false,
                      },
                      {
                        label:
                          data.tipo === "nfse"
                            ? "(-) ISS 8%"
                            : "(-) ICMS + PIS + COFINS 12%",
                        val: `- ${fmt(impostos)}`,
                        bold: false,
                      },
                      {
                        label: "Valor Líquido a Receber",
                        val: fmt(liquido),
                        bold: true,
                      },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex justify-between px-3"
                        style={{
                          borderTop: row.bold ? "1px solid #E2E8F0" : "none",
                          paddingTop: row.bold ? 8 : 0,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: row.bold ? 13 : 12.5,
                            fontWeight: row.bold ? 700 : 400,
                            color: row.bold ? P : "#64748B",
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: row.bold ? 14 : 12.5,
                            fontWeight: row.bold ? 800 : 600,
                            color: row.bold ? P : "#374151",
                          }}
                        >
                          {row.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Send options */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { icon: Mail, label: "Enviar por E-mail" },
                  { icon: MessageCircle, label: "Enviar por WhatsApp" },
                  { icon: Printer, label: "Imprimir / PDF" },
                ].map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => toast.info(opt.label)}
                    className="flex flex-col items-center gap-2 rounded-xl border py-3 transition-colors hover:bg-slate-50"
                    style={{ borderColor: "#E2E8F0" }}
                  >
                    <opt.icon className="h-4 w-4" style={{ color: P }} />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11.5,
                        color: "#374151",
                        textAlign: "center",
                      }}
                    >
                      {opt.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex flex-shrink-0 items-center justify-between border-t px-6 py-4"
          style={{ borderColor: "#F1F5F9" }}
        >
          <div>
            {step > 1 && (
              <button
                onClick={() => {
                  setStep((s) => s - 1);
                }}
                className="flex items-center gap-1.5 rounded-xl border px-4 py-2 hover:bg-slate-50"
                style={{
                  borderColor: "#E2E8F0",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#374151",
                }}
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Voltar
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step === 3 && (
              <button
                onClick={() => handleEmit(true)}
                disabled={saving}
                className="rounded-xl border px-4 py-2"
                style={{
                  borderColor: "#E2E8F0",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#374151",
                }}
              >
                Salvar Rascunho
              </button>
            )}
            {step < 3 ? (
              <button
                onClick={() => {
                  setStep((s) => s + 1);
                }}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-white"
                style={{
                  background: P,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                onMouseLeave={(e) => (e.currentTarget.style.background = P)}
              >
                Continuar <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={() => handleEmit(false)}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-xl px-5 py-2 text-white"
                style={{
                  background: saving ? "#94A3B8" : SUCCESS,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                {saving ? (
                  "Emitindo..."
                ) : (
                  <>
                    Emitir Nota Fiscal <CheckCircle className="h-3.5 w-3.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Invoice Detail Modal ─────────────────────────────────────────────────────
function InvoiceDetail({
  inv,
  onClose,
}: {
  inv: Invoice;
  onClose: () => void;
}) {
  const sc = statusConfig[inv.status];
  const StatusIcon = sc.icon;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ maxHeight: "92vh", overflowY: "auto" }}
      >
        <div
          className="flex items-center justify-between border-b px-6 py-4"
          style={{ borderColor: "#F1F5F9" }}
        >
          <div>
            <h3
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 16,
                fontWeight: 800,
                color: P,
              }}
            >
              Fatura {inv.id}
            </h3>
            <span
              className="mt-1 inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1"
              style={{ background: sc.bg, border: `1px solid ${sc.border}` }}
            >
              <StatusIcon className="h-3 w-3" style={{ color: sc.text }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: sc.text,
                }}
              >
                {sc.label}
              </span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-1.5 hover:bg-slate-100"
          >
            <XCircle className="h-5 w-5" style={{ color: "#94A3B8" }} />
          </button>
        </div>

        <div className="space-y-5 p-6">
          {/* Client info */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Cliente", val: inv.cliente },
              { label: "CNPJ", val: inv.cnpj },
              { label: "E-mail", val: inv.email },
              {
                label: "Vencimento",
                val: new Date(inv.vencimento + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                ),
              },
              {
                label: "Emissão",
                val: new Date(inv.emissao + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                ),
              },
              { label: "Tipo", val: inv.tipo === "nfse" ? "NFS-e" : "NF-e" },
            ].map(({ label, val }) => (
              <div key={label}>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    color: "#94A3B8",
                  }}
                >
                  {label.toUpperCase()}
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: "#374151",
                    marginTop: 2,
                  }}
                >
                  {val}
                </p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#94A3B8",
                marginBottom: 8,
              }}
            >
              ITENS
            </p>
            <div
              className="overflow-hidden rounded-xl"
              style={{ border: "1px solid #E2E8F0" }}
            >
              {inv.items.map((it, i) => (
                <div
                  key={it.id}
                  className="flex items-center justify-between px-4 py-3"
                  style={{
                    borderBottom:
                      i < inv.items.length - 1 ? "1px solid #F1F5F9" : "none",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        color: "#374151",
                      }}
                    >
                      {it.descricao}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11,
                        color: "#94A3B8",
                      }}
                    >
                      {it.qtd}x {fmt(it.unitario)}
                    </p>
                  </div>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#1E293B",
                    }}
                  >
                    {fmt(it.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div
            className="space-y-1.5 rounded-xl p-4"
            style={{ background: PRIMARY_SOFT }}
          >
            {[
              { l: "Valor Bruto", v: fmt(inv.valor), big: false },
              {
                l: "Impostos retidos",
                v: `- ${fmt(inv.impostos)}`,
                big: false,
              },
              { l: "Valor Líquido", v: fmt(inv.valorLiquido), big: true },
            ].map((row) => (
              <div
                key={row.l}
                className="flex justify-between"
                style={{
                  borderTop: row.big ? "1px solid #C3D0E4" : "none",
                  paddingTop: row.big ? 6 : 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: row.big ? 13 : 12.5,
                    fontWeight: row.big ? 700 : 400,
                    color: row.big ? P : "#64748B",
                  }}
                >
                  {row.l}
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: row.big ? 15 : 12.5,
                    fontWeight: row.big ? 800 : 600,
                    color: row.big ? P : "#374151",
                  }}
                >
                  {row.v}
                </span>
              </div>
            ))}
          </div>

          {/* Chave de acesso */}
          {inv.chaveAcesso && (
            <div
              className="rounded-xl px-4 py-3"
              style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
            >
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  color: "#94A3B8",
                  marginBottom: 4,
                }}
              >
                CHAVE DE ACESSO
              </p>
              <div className="flex items-center gap-2">
                <p
                  style={{
                    fontFamily: "'Courier New', monospace",
                    fontSize: 11,
                    color: "#374151",
                    wordBreak: "break-all",
                    flex: 1,
                  }}
                >
                  {inv.chaveAcesso}
                </p>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inv.chaveAcesso!);
                    toast.success("Chave copiada!");
                  }}
                >
                  <Copy className="h-4 w-4" style={{ color: "#94A3B8" }} />
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => toast.info("Enviando por e-mail…")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 hover:bg-slate-50"
              style={{ borderColor: "#E2E8F0" }}
            >
              <Mail className="h-4 w-4" style={{ color: P }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#374151",
                }}
              >
                E-mail
              </span>
            </button>
            <button
              onClick={() => toast.info("Enviando via WhatsApp…")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 hover:bg-slate-50"
              style={{ borderColor: "#E2E8F0" }}
            >
              <MessageCircle className="h-4 w-4" style={{ color: P }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#374151",
                }}
              >
                WhatsApp
              </span>
            </button>
            <button
              onClick={() => toast.info("Gerando PDF…")}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 hover:bg-slate-50"
              style={{ borderColor: "#E2E8F0" }}
            >
              <Download className="h-4 w-4" style={{ color: P }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#374151",
                }}
              >
                PDF
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function InvoicesPage() {
  const [list, setList] = useState<Invoice[]>(mockInvoices);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showWizard, setShowWizard] = useState(false);
  const [detailInv, setDetailInv] = useState<Invoice | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = list.filter((inv) => {
    const matchSearch =
      inv.cliente.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.descricao.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const kpis = [
    {
      label: "Total Emitido",
      value: fmt(
        list.reduce(
          (s, i) =>
            s +
            (i.status !== "rascunho" && i.status !== "cancelada" ? i.valor : 0),
          0,
        ),
      ),
      color: P,
      sub: `${list.filter((i) => i.status !== "rascunho").length} notas`,
    },
    {
      label: "A Receber",
      value: fmt(
        list
          .filter((i) => i.status === "emitida" || i.status === "enviada")
          .reduce((s, i) => s + i.valorLiquido, 0),
      ),
      color: WARNING,
      sub: "aguardando pagamento",
    },
    {
      label: "Pagas",
      value: fmt(
        list
          .filter((i) => i.status === "paga")
          .reduce((s, i) => s + i.valorLiquido, 0),
      ),
      color: SUCCESS,
      sub: `${list.filter((i) => i.status === "paga").length} notas quitadas`,
    },
    {
      label: "Rascunhos",
      value: String(list.filter((i) => i.status === "rascunho").length),
      color: "#64748B",
      sub: "aguardando emissão",
    },
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
            Faturas & Notas Fiscais
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              color: "#64748B",
            }}
          >
            Emissão e gestão de NF-e e NFS-e
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toast.info("Exportando CSV…")}
            className="flex items-center gap-1.5 rounded-xl border bg-white px-3 py-2 hover:bg-slate-50"
            style={{ border: "1px solid #E2E8F0" }}
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
          <button
            onClick={() => {
              setShowWizard(true);
            }}
            className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-white"
            style={{
              background: P,
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              fontWeight: 700,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
            onMouseLeave={(e) => (e.currentTarget.style.background = P)}
          >
            <Plus className="h-3.5 w-3.5" />
            Nova Fatura
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div
            key={k.label}
            className="rounded-2xl bg-white p-4 transition-all hover:shadow-sm"
            style={{ border: "1px solid #E2E8F0" }}
          >
            <p
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 20,
                fontWeight: 800,
                color: k.color,
              }}
            >
              {k.value}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                color: "#374151",
                marginTop: 1,
              }}
            >
              {k.label}
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11,
                color: "#94A3B8",
                marginTop: 1,
              }}
            >
              {k.sub}
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
              placeholder="Buscar cliente, ID, descrição…"
              className="flex-1 bg-transparent focus:outline-none"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#374151",
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
            className="rounded-xl border bg-white px-3 py-2 focus:outline-none"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              color: "#374151",
              borderColor: "#E2E8F0",
            }}
          >
            {[
              ["todos", "Todos os Status"],
              ["emitida", "Emitida"],
              ["enviada", "Enviada"],
              ["paga", "Paga"],
              ["cancelada", "Cancelada"],
              ["rascunho", "Rascunho"],
            ].map(([v, l]) => (
              <option key={v} value={v}>
                {l}
              </option>
            ))}
          </select>
        </div>
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
                {[
                  "Nº / ID",
                  "Cliente",
                  "Descrição",
                  "Emissão",
                  "Vencimento",
                  "Valor Bruto",
                  "Líquido",
                  "Tipo",
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
              {filtered.map((inv) => {
                const sc = statusConfig[inv.status];
                const StatusIcon = sc.icon;
                return (
                  <tr
                    key={inv.id}
                    className="transition-colors hover:bg-slate-50"
                    style={{ borderTop: "1px solid #F8FAFC" }}
                  >
                    <td className="px-4 py-3.5">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#1E293B",
                        }}
                      >
                        Nº {inv.numero}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "#94A3B8",
                        }}
                      >
                        {inv.id}
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
                        {inv.cliente}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          color: "#94A3B8",
                        }}
                      >
                        {inv.cnpj}
                      </p>
                    </td>
                    <td className="max-w-[180px] px-4 py-3.5">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
                          color: "#374151",
                        }}
                        className="truncate"
                      >
                        {inv.descricao}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          color: "#374151",
                        }}
                      >
                        {new Date(inv.emissao + "T00:00:00").toLocaleDateString(
                          "pt-BR",
                        )}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          color: "#374151",
                        }}
                      >
                        {new Date(
                          inv.vencimento + "T00:00:00",
                        ).toLocaleDateString("pt-BR")}
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
                        {fmt(inv.valor)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          fontWeight: 700,
                          color: SUCCESS,
                        }}
                      >
                        {fmt(inv.valorLiquido)}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="rounded-lg px-2.5 py-1"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          background: PRIMARY_SOFT,
                          color: P,
                        }}
                      >
                        {inv.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1"
                        style={{
                          background: sc.bg,
                          border: `1px solid ${sc.border}`,
                        }}
                      >
                        <StatusIcon
                          className="h-3 w-3"
                          style={{ color: sc.text }}
                        />
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
                            setOpenMenu(openMenu === inv.id ? null : inv.id);
                          }}
                          className="rounded-lg p-1.5 hover:bg-slate-100"
                        >
                          <MoreHorizontal
                            className="h-4 w-4"
                            style={{ color: "#94A3B8" }}
                          />
                        </button>
                        {openMenu === inv.id && (
                          <div
                            className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-2xl bg-white py-1 shadow-xl"
                            style={{ border: "1px solid #E2E8F0" }}
                          >
                            {[
                              {
                                label: "Ver detalhes",
                                icon: Eye,
                                action: () => {
                                  setDetailInv(inv);
                                  setOpenMenu(null);
                                },
                              },
                              {
                                label: "Enviar por e-mail",
                                icon: Mail,
                                action: () => {
                                  toast.info("Enviando…");
                                  setOpenMenu(null);
                                },
                              },
                              {
                                label: "Baixar PDF",
                                icon: Download,
                                action: () => {
                                  toast.info("Gerando PDF…");
                                  setOpenMenu(null);
                                },
                              },
                              {
                                label: "Cancelar NF",
                                icon: XCircle,
                                action: () => {
                                  setList((l) =>
                                    l.map((i) =>
                                      i.id === inv.id
                                        ? { ...i, status: "cancelada" }
                                        : i,
                                    ),
                                  );
                                  setOpenMenu(null);
                                  toast.warning("Nota cancelada");
                                },
                                danger: true,
                              },
                            ].map((item) => (
                              <button
                                key={item.label}
                                onClick={item.action}
                                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left hover:bg-slate-50"
                              >
                                <item.icon
                                  className="h-3.5 w-3.5"
                                  style={{
                                    color: (item as any).danger
                                      ? DANGER
                                      : "#94A3B8",
                                  }}
                                />
                                <span
                                  style={{
                                    fontFamily: "'Inter', sans-serif",
                                    fontSize: 12.5,
                                    color: (item as any).danger
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
            Exibindo {filtered.length} de {list.length} faturas
          </p>
          <div className="flex gap-1">
            {[1].map((pg) => (
              <button
                key={pg}
                className="flex h-7 w-7 items-center justify-center rounded-lg"
                style={{
                  background: P,
                  color: "white",
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

      {showWizard && (
        <InvoiceWizard
          onClose={() => {
            setShowWizard(false);
          }}
          onSave={(inv) => {
            setList((l) => [inv, ...l]);
            setShowWizard(false);
          }}
        />
      )}
      {detailInv && (
        <InvoiceDetail
          inv={detailInv}
          onClose={() => {
            setDetailInv(null);
          }}
        />
      )}
    </div>
  );
}
