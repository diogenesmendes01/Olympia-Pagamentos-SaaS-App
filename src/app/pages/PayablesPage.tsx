import { useState } from "react";
import {
  Plus, Search, Download, CheckCircle, Clock, XCircle, AlertTriangle,
  MoreHorizontal, Layers, Shield, CreditCard, Zap
} from "lucide-react";
import { payables, type Payable } from "../data/mockData";
import { toast } from "sonner";
import {
  PRIMARY as P, PRIMARY_HOVER as PH, GOLD as G,
  SUCCESS, SUCCESS_BG,
  WARNING, WARNING_BG, WARNING_BORDER,
  DANGER, DANGER_BG,
} from "../styles/tokens";

const fmt = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: any }> = {
  pago:      { label: "Pago",         bg: SUCCESS_BG, text: SUCCESS, icon: CheckCircle },
  pendente:  { label: "Pendente",     bg: "#EEF3F8",  text: P,       icon: Clock },
  vencido:   { label: "Vencido",      bg: DANGER_BG,  text: DANGER,  icon: XCircle },
  agendado:  { label: "Agendado",     bg: "#F5F1FF",  text: "#6B4BAF", icon: Clock },
  aprovacao: { label: "Em Aprovação", bg: WARNING_BG, text: WARNING, icon: AlertTriangle },
};

const approvalConfig: Record<string, { label: string; bg: string; text: string }> = {
  aprovado:   { label: "Aprovado",       bg: SUCCESS_BG, text: SUCCESS },
  pendente:   { label: "Ag. Aprovação",  bg: WARNING_BG, text: WARNING },
  rejeitado:  { label: "Rejeitado",      bg: DANGER_BG,  text: DANGER },
  automatico: { label: "Automático",     bg: "#EEF3F8",  text: P },
};

const categoriaColors: Record<string, string> = {
  Fornecedores:         P,
  Tecnologia:           P,
  Impostos:             DANGER,
  "Recursos Humanos":   SUCCESS,
  Infraestrutura:       WARNING,
  Seguros:              "#6B4BAF",
  Marketing:            "#B0246A",
};

export function PayablesPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [showModal, setShowModal] = useState(false);
  const [showBatch, setShowBatch] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const filtered = payables.filter((p) => {
    const matchSearch = p.fornecedor.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.descricao.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "todos" || p.status === statusFilter;
    const matchCat = categoryFilter === "todos" || p.categoria === categoryFilter;
    return matchSearch && matchStatus && matchCat;
  });

  const totalPendente = payables.filter(p => p.status === "pendente").reduce((s, p) => s + p.valor, 0);
  const totalVencido = payables.filter(p => p.status === "vencido").reduce((s, p) => s + p.valor, 0);
  const totalPago = payables.filter(p => p.status === "pago").reduce((s, p) => s + p.valor, 0);
  const totalAprovacao = payables.filter(p => p.aprovacao === "pendente").reduce((s, p) => s + p.valor, 0);

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const categories = [...new Set(payables.map(p => p.categoria))];

  return (
    <div className="p-5 lg:p-6 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 21, fontWeight: 800, color: P }}>Contas a Pagar</h1>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>Fornecedores, impostos, salários e obrigações</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowBatch(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white transition-colors" style={{ border: "1px solid #E2E8F0" }}>
            <Layers className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151" }}>Pagamento em Lote</span>
          </button>
          <button onClick={() => toast.info("Exportando CNAB...")} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white" style={{ border: "1px solid #E2E8F0" }}>
            <Download className="w-3.5 h-3.5" style={{ color: "#64748B" }} />
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151" }}>CNAB</span>
          </button>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-white transition-all"
            style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.background = PH)}
            onMouseLeave={e => (e.currentTarget.style.background = P)}>
            <Plus className="w-3.5 h-3.5" />Nova Conta
          </button>
        </div>
      </div>

      {/* Approval banner */}
      {payables.filter(p => p.aprovacao === "pendente").length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
          style={{ background: WARNING_BG, borderColor: WARNING_BORDER }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: WARNING }} />
          <div className="flex-1">
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#92400E" }}>
              {payables.filter(p => p.aprovacao === "pendente").length} pagamento(s) aguardando aprovação
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#B45309" }}>Total: {fmt(totalAprovacao)}</p>
          </div>
          <button onClick={() => toast.success("Todos aprovados e agendados!")}
            className="px-3 py-1.5 rounded-xl text-white"
            style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 700 }}>
            Aprovar Todos
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "A Pagar",       value: fmt(totalPendente), color: P,       sub: `${payables.filter(p => p.status === "pendente").length} contas` },
          { label: "Vencido",       value: fmt(totalVencido),  color: DANGER,  sub: `em atraso` },
          { label: "Pago no Mês",   value: fmt(totalPago),     color: SUCCESS, sub: `quitados` },
          { label: "Em Aprovação",  value: fmt(totalAprovacao),color: WARNING, sub: `aguardando revisão` },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-4" style={{ border: "1px solid #E2E8F0" }}>
            <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 19, fontWeight: 800, color: s.color }}>{s.value}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#374151", marginTop: 1 }}>{s.label}</p>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2 flex-1 rounded-xl px-3 py-2 border" style={{ background: "#F8FAFC", borderColor: "#E2E8F0" }}>
            <Search className="w-4 h-4" style={{ color: "#94A3B8" }} />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar fornecedor, ID, descrição..."
              className="flex-1 bg-transparent focus:outline-none"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#374151" }} />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-white focus:outline-none"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151", borderColor: "#E2E8F0" }}>
              {[["todos","Todos os Status"],["pendente","Pendente"],["pago","Pago"],["vencido","Vencido"],["agendado","Agendado"],["aprovacao","Em Aprovação"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border bg-white focus:outline-none"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151", borderColor: "#E2E8F0" }}>
              <option value="todos">Todas as Categorias</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-3 mt-3 px-3 py-2 rounded-xl" style={{ background: "#EEF2F9" }}>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: P, fontWeight: 700 }}>{selected.size} selecionada(s)</span>
            <button onClick={() => toast.success(`${selected.size} pagamentos agendados!`)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-white"
              style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 11.5, fontWeight: 600 }}>
              <Zap className="w-3 h-3" />Pagar em Lote
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden" style={{ border: "1px solid #E2E8F0" }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ background: "#F8FAFC", borderBottom: "1px solid #F1F5F9" }}>
                <th className="px-4 py-3">
                  <input type="checkbox" onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map(p => p.id)) : new Set())} className="rounded" />
                </th>
                {["ID / Descrição","Fornecedor","Categoria","Vencimento","Valor","Método","Aprovação","Status","Ações"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left whitespace-nowrap"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em" }}>
                    {h.toUpperCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pay) => {
                const sc = statusConfig[pay.status];
                const ac = approvalConfig[pay.aprovacao];
                const Icon = sc.icon;
                const catColor = categoriaColors[pay.categoria] || "#64748B";
                return (
                  <tr key={pay.id} className="hover:bg-slate-50 transition-colors" style={{ borderTop: "1px solid #F8FAFC" }}>
                    <td className="px-4 py-3.5">
                      <input type="checkbox" checked={selected.has(pay.id)} onChange={() => toggleSelect(pay.id)} className="rounded" />
                    </td>
                    <td className="px-4 py-3.5">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700, color: "#1E293B" }}>{pay.id}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#94A3B8" }} className="truncate max-w-[170px]">{pay.descricao}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 500, color: "#374151" }}>{pay.fornecedor}</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#94A3B8" }}>{pay.cnpj}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-xl" style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, background: `${catColor}12`, color: catColor }}>
                        {pay.categoria}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: pay.status === "vencido" ? DANGER : "#374151", fontWeight: pay.status === "vencido" ? 700 : 400 }}>
                        {new Date(pay.vencimento).toLocaleDateString("pt-BR")}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 700, color: "#1E293B" }}>{fmt(pay.valor)}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#374151" }}>
                        {pay.metodo === "ted" ? "TED" : (pay.metodo as string).charAt(0).toUpperCase() + (pay.metodo as string).slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2.5 py-1 rounded-xl" style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, background: ac.bg, color: ac.text }}>
                        {ac.label}
                      </span>
                      {pay.aprovacao === "pendente" && (
                        <div className="flex gap-1 mt-1">
                          <button onClick={() => toast.success("Aprovado!")} className="px-1.5 py-0.5 rounded text-white" style={{ fontSize: 10, background: SUCCESS, fontFamily: "'Inter', sans-serif" }}>✓</button>
                          <button onClick={() => toast.error("Rejeitado")}   className="px-1.5 py-0.5 rounded text-white" style={{ fontSize: 10, background: DANGER,  fontFamily: "'Inter', sans-serif" }}>✗</button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl" style={{ background: sc.bg }}>
                        <Icon className="w-3 h-3" style={{ color: sc.text }} />
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: sc.text }}>{sc.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative">
                        <button onClick={() => setOpenMenu(openMenu === pay.id ? null : pay.id)} className="p-1.5 rounded-lg hover:bg-slate-100">
                          <MoreHorizontal className="w-4 h-4" style={{ color: "#94A3B8" }} />
                        </button>
                        {openMenu === pay.id && (
                          <div className="absolute right-0 mt-1 w-44 bg-white rounded-2xl shadow-xl z-10 overflow-hidden py-1" style={{ border: "1px solid #E2E8F0" }}>
                            {[
                              { label: "Pagar Agora", icon: CreditCard, action: () => { setOpenMenu(null); toast.success("Pagamento efetuado!"); } },
                              { label: "Agendar",     icon: Clock,       action: () => { setOpenMenu(null); toast.info("Agendado"); } },
                              { label: "Aprovar",     icon: Shield,      action: () => { setOpenMenu(null); toast.success("Aprovado!"); } },
                              { label: "Excluir",     icon: XCircle,     action: () => { setOpenMenu(null); toast.error("Excluído"); }, danger: true },
                            ].map((item) => (
                              <button key={item.label} onClick={item.action} className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-slate-50 text-left">
                                <item.icon className="w-3.5 h-3.5" style={{ color: (item as any).danger ? DANGER : "#94A3B8" }} />
                                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: (item as any).danger ? DANGER : "#374151" }}>{item.label}</span>
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
        <div className="px-5 py-3 border-t flex items-center justify-between" style={{ borderColor: "#F1F5F9" }}>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#94A3B8" }}>Exibindo {filtered.length} de {payables.length} contas</p>
          <div className="flex gap-1">
            {[1,2].map(pg => (
              <button key={pg} className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: pg===1 ? P : "#F1F5F9", color: pg===1 ? "white" : "#64748B", fontFamily: "'Inter', sans-serif", fontSize: 12, fontWeight: 600 }}>{pg}</button>
            ))}
          </div>
        </div>
      </div>

      {/* New Payable Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#F1F5F9" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 16, fontWeight: 800, color: P }}>Nova Conta a Pagar</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-xl hover:bg-slate-100">
                <XCircle className="w-5 h-5" style={{ color: "#94A3B8" }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Fornecedor / CNPJ", placeholder: "Buscar fornecedor...", type: "text" },
                { label: "Descrição", placeholder: "Ex: Aluguel - Maio/26", type: "text" },
                { label: "Valor (R$)", placeholder: "0,00", type: "text" },
                { label: "Vencimento", placeholder: "", type: "date" },
              ].map((f) => (
                <div key={f.label}>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-all"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, background: "#F8FAFC", borderColor: "#E2E8F0" }}
                    onFocus={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.1)`; }}
                    onBlur={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }}
                  />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Categoria</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border focus:outline-none" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                    {["Tecnologia","Impostos","Recursos Humanos","Infraestrutura","Seguros","Serviços"].map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Método</label>
                  <select className="w-full px-4 py-2.5 rounded-xl border focus:outline-none" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, background: "#F8FAFC", borderColor: "#E2E8F0" }}>
                    {["Pix","Boleto","TED","Débito Automático"].map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="needApproval" className="rounded" style={{ accentColor: P }} />
                <label htmlFor="needApproval" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#374151" }}>Requer aprovação antes de pagar</label>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border hover:bg-slate-50"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, borderColor: "#E2E8F0", color: "#64748B" }}>Cancelar</button>
              <button onClick={() => { setShowModal(false); toast.success("Conta cadastrada!"); }}
                className="flex-1 py-2.5 rounded-xl text-white transition-all"
                style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 700 }}
                onMouseEnter={e => (e.currentTarget.style.background = PH)}
                onMouseLeave={e => (e.currentTarget.style.background = P)}>
                Cadastrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Modal */}
      {showBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#F1F5F9" }}>
              <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 16, fontWeight: 800, color: P }}>Pagamento em Lote</h3>
              <button onClick={() => setShowBatch(false)} className="p-1.5 rounded-xl hover:bg-slate-100">
                <XCircle className="w-5 h-5" style={{ color: "#94A3B8" }} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-4 rounded-2xl" style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 700, color: "#3D5E3E" }}>Resumo do Lote</p>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 22, fontWeight: 800, color: SUCCESS }}>{fmt(payables.filter(p => p.status !== "pago").reduce((s,p) => s+p.valor, 0))}</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#3D5E3E" }}>{payables.filter(p => p.status !== "pago").length} contas selecionadas</p>
              </div>
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Data de Pagamento</label>
                <input type="date" className="w-full px-4 py-2.5 rounded-xl border focus:outline-none" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, borderColor: "#E2E8F0" }} />
              </div>
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 5 }}>Método</label>
                <div className="grid grid-cols-2 gap-2">
                  {["Pix","TED","Boleto","CNAB 240"].map((m, i) => (
                    <button key={m} className="py-2 rounded-xl border-2 text-sm font-semibold transition-all"
                      style={{ fontFamily: "'Inter', sans-serif", borderColor: i===0 ? P : "#E2E8F0", color: i===0 ? P : "#64748B", background: i===0 ? "#EEF2F9" : "white" }}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowBatch(false)} className="flex-1 py-2.5 rounded-xl border hover:bg-slate-50"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, borderColor: "#E2E8F0", color: "#64748B" }}>Cancelar</button>
              <button onClick={() => { setShowBatch(false); toast.success("Lote enviado com sucesso!"); }}
                className="flex-1 py-2.5 rounded-xl text-white"
                style={{ background: P, fontFamily: "'Inter', sans-serif", fontSize: 13.5, fontWeight: 700 }}>
                Confirmar e Pagar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}