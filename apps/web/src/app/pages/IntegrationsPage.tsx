import { useState } from "react";
import {
  CheckCircle,
  Clock,
  Plus,
  Settings,
  ExternalLink,
  RefreshCw,
  Zap,
  Building2,
  Landmark,
  QrCode,
  FileText,
  MessageCircle,
  Receipt,
  Database,
  BarChart2,
  Package,
  FolderSync,
  Search,
  ShoppingCart,
  Copy,
  Bell,
  Link2,
} from "lucide-react";
import { integrations } from "../data/mockData";
import { toast } from "sonner";
import {
  PRIMARY as P,
  GOLD as G,
  SUCCESS,
  SUCCESS_BG,
  WARNING,
  WARNING_BG,
} from "../styles/tokens";

// Map icon key strings from mockData to actual Lucide components
const iconMap: Record<string, React.ElementType> = {
  landmark: Landmark,
  qrCode: QrCode,
  fileText: FileText,
  messageCircle: MessageCircle,
  receipt: Receipt,
  database: Database,
  barChart2: BarChart2,
  packageOpen: Package,
  folderSync: FolderSync,
  searchCode: Search,
  building2: Building2,
  shoppingCart: ShoppingCart,
};

// Accent colors per integration id — brand-aligned
const integrationColors: Record<number, { color: string; bg: string }> = {
  1: { color: P, bg: "#EEF2F9" },
  2: { color: "#00907A", bg: "#F0FDFB" },
  3: { color: P, bg: "#EEF2F9" },
  4: { color: SUCCESS, bg: SUCCESS_BG },
  5: { color: WARNING, bg: WARNING_BG },
  6: { color: "#6B4BAF", bg: "#F5F1FF" },
  7: { color: "#0E7B85", bg: "#F0FDFE" },
  8: { color: "#7A3535", bg: "#FDF0EE" },
  9: { color: P, bg: "#EEF2F9" },
  10: { color: "#6B4BAF", bg: "#F5F1FF" },
  11: { color: "#64748B", bg: "#F1F5F9" },
  12: { color: WARNING, bg: WARNING_BG },
};

// Bank initials + colors for the Open Finance modal
const banks = [
  { nome: "Itaú", initials: "IU", color: "#B8872F", status: "conectado" },
  { nome: "Bradesco", initials: "BD", color: "#7A3535", status: "conectado" },
  { nome: "Nubank", initials: "NU", color: "#6B4BAF", status: "conectado" },
  {
    nome: "Banco do Brasil",
    initials: "BB",
    color: "#B8872F",
    status: "disponivel",
  },
  { nome: "Caixa", initials: "CX", color: "#1A6BBA", status: "disponivel" },
  { nome: "Santander", initials: "ST", color: "#7A3535", status: "disponivel" },
  { nome: "BTG Pactual", initials: "BT", color: G, status: "disponivel" },
  { nome: "Sicoob", initials: "SC", color: SUCCESS, status: "disponivel" },
];

export function IntegrationsPage() {
  const [openBanks, setOpenBanks] = useState(false);
  const [connectingId, setConnectingId] = useState<number | null>(null);

  const handleConnect = async (id: number, nome: string) => {
    setConnectingId(id);
    await new Promise((r) => setTimeout(r, 1500));
    setConnectingId(null);
    toast.success(`${nome} conectado com sucesso!`);
  };

  const connectedCount = integrations.filter(
    (i) => i.status === "conectado",
  ).length;

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
              color: "#1F3A5F",
            }}
          >
            Integrações
          </h1>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              color: "#64748B",
            }}
          >
            Conecte seus bancos, ERPs e sistemas de pagamento
          </p>
        </div>
        <div
          className="flex items-center gap-2 rounded-xl border bg-white px-3 py-2"
          style={{ borderColor: "#E2E8F0" }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{ background: SUCCESS }}
          />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              color: "#374151",
            }}
          >
            {connectedCount} ativas de {integrations.length}
          </span>
        </div>
      </div>

      {/* Open Finance banner */}
      <div
        className="relative overflow-hidden rounded-2xl p-5"
        style={{ background: "#1F3A5F" }}
      >
        <div className="relative z-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <div
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
            style={{
              background: "rgba(200,169,107,0.15)",
              border: `1px solid rgba(200,169,107,0.3)`,
            }}
          >
            <Building2 className="h-6 w-6" style={{ color: "#C8A96B" }} />
          </div>
          <div className="flex-1">
            <p
              className="text-white"
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: 16,
                fontWeight: 800,
              }}
            >
              Open Finance Brazil — 3 bancos conectados
            </p>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                color: "#A8BDD4",
                fontSize: 13,
              }}
            >
              Itaú, Bradesco e Nubank · Conciliação automática ativa · Última
              sincronização: há 5 min
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {["Itaú", "Bradesco", "Nubank"].map((b) => (
                <span
                  key={b}
                  className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs"
                  style={{ background: SUCCESS_BG, color: SUCCESS }}
                >
                  <CheckCircle className="h-3 w-3" />
                  {b}
                </span>
              ))}
              <button
                onClick={() => {
                  setOpenBanks(true);
                }}
                className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs"
                style={{
                  background: `rgba(200,169,107,0.15)`,
                  color: "#C8A96B",
                }}
              >
                <Plus className="h-3 w-3" />
                Adicionar banco
              </button>
            </div>
          </div>
          <button
            onClick={() => toast.success("Sincronização iniciada!")}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-white"
            style={{
              background: "rgba(255,255,255,0.1)",
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sincronizar
          </button>
        </div>
      </div>

      {/* Categories */}
      {[
        { label: "Pagamentos & Cobrança", ids: [1, 2, 3] },
        { label: "Comunicação", ids: [4] },
        { label: "Fiscal & NF-e", ids: [5] },
        { label: "ERPs & Gestão", ids: [6, 7, 8, 11] },
        { label: "Bancário & Remessa", ids: [9, 10] },
        { label: "E-commerce", ids: [12] },
      ].map((cat) => {
        const catIntegrations = integrations.filter((i) =>
          cat.ids.includes(i.id),
        );
        return (
          <div key={cat.label}>
            <h3
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 700,
                color: "#64748B",
                marginBottom: 12,
                letterSpacing: "0.06em",
              }}
            >
              {cat.label.toUpperCase()}
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {catIntegrations.map((integ) => (
                <IntegrationCard
                  key={integ.id}
                  integ={integ}
                  connecting={connectingId === integ.id}
                  onConnect={() => handleConnect(integ.id, integ.nome)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* API */}
      <div
        className="rounded-2xl bg-white p-5"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <Zap className="h-4 w-4" style={{ color: "#1F3A5F" }} />
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: "#1F3A5F",
                }}
              >
                API REST — Integração Personalizada
              </h3>
            </div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13,
                color: "#64748B",
              }}
            >
              Conecte qualquer sistema via API completa com webhooks
            </p>
          </div>
          <button
            onClick={() => toast.info("Abrindo documentação...")}
            className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border px-3 py-2 hover:bg-slate-50"
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              borderColor: "#E2E8F0",
            }}
          >
            <ExternalLink
              className="h-3.5 w-3.5"
              style={{ color: "#64748B" }}
            />
            Documentação
          </button>
        </div>
        <div
          className="mt-4 rounded-xl p-3.5"
          style={{ background: "#1F3A5F" }}
        >
          <code
            style={{ fontSize: 12, color: "#A8C8E8", fontFamily: "monospace" }}
          >
            curl -X GET https://api.olympiapag.com.br/v1/receivables \<br />
            &nbsp;&nbsp;-H "Authorization: Bearer{" "}
            <span style={{ color: "#C8A96B" }}>$YOUR_API_KEY</span>" \<br />
            &nbsp;&nbsp;-H "Content-Type: application/json"
          </code>
        </div>
        <div className="mt-3 flex gap-3">
          {[
            { label: "Copiar API Key", Icon: Copy },
            { label: "Gerar Nova Chave", Icon: RefreshCw },
            { label: "Configurar Webhooks", Icon: Bell },
          ].map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => toast.info(`${label}...`)}
              className="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 hover:bg-slate-50"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 12.5,
                borderColor: "#E2E8F0",
                color: "#374151",
              }}
            >
              <Icon className="h-3.5 w-3.5" style={{ color: "#64748B" }} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Add bank modal */}
      {openBanks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
            <div
              className="flex items-center justify-between border-b px-6 py-4"
              style={{ borderColor: "#F1F5F9" }}
            >
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#1F3A5F",
                }}
              >
                Conectar via Open Finance
              </h3>
              <button
                onClick={() => {
                  setOpenBanks(false);
                }}
                className="rounded-xl p-1.5 hover:bg-slate-100"
                style={{ color: "#94A3B8", fontSize: 18 }}
              >
                ✕
              </button>
            </div>
            <div className="p-6">
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  color: "#64748B",
                  marginBottom: 16,
                }}
              >
                Selecione o banco para autorizar acesso via Open Finance Brazil
              </p>
              <div className="grid grid-cols-2 gap-3">
                {banks.map((b) => (
                  <button
                    key={b.nome}
                    onClick={() => {
                      if (b.status !== "conectado") {
                        setOpenBanks(false);
                        toast.success(`${b.nome} conectado!`);
                      }
                    }}
                    className="flex items-center gap-2.5 rounded-xl border-2 p-3 text-left transition-all"
                    style={{
                      borderColor:
                        b.status === "conectado" ? SUCCESS : "#E2E8F0",
                      background:
                        b.status === "conectado" ? SUCCESS_BG : "white",
                    }}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold"
                      style={{
                        background: b.color + "18",
                        color: b.color,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      {b.initials}
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: "#374151",
                        }}
                      >
                        {b.nome}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1">
                        {b.status === "conectado" ? (
                          <>
                            <CheckCircle
                              className="h-3 w-3"
                              style={{ color: SUCCESS }}
                            />
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 10.5,
                                color: SUCCESS,
                              }}
                            >
                              Conectado
                            </span>
                          </>
                        ) : (
                          <span
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 10.5,
                              color: "#94A3B8",
                            }}
                          >
                            Clique para conectar
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationCard({
  integ,
  connecting,
  onConnect,
}: {
  integ: any;
  connecting: boolean;
  onConnect: () => void;
}) {
  const P = "#1F3A5F";
  const PH = "#274872";
  const ic = integrationColors[integ.id] ?? { color: "#64748B", bg: "#F1F5F9" };
  const IconComponent = iconMap[integ.icone] ?? Link2;

  const statusConfig: any = {
    conectado: {
      label: "Conectado",
      bg: SUCCESS_BG,
      text: SUCCESS,
      icon: CheckCircle,
    },
    pendente: {
      label: "Configurar",
      bg: WARNING_BG,
      text: WARNING,
      icon: Clock,
    },
    disponivel: { label: "Conectar", bg: "#EEF2F9", text: P, icon: Plus },
  };
  const sc = statusConfig[integ.status];
  const StatusIcon = sc.icon;

  return (
    <div
      className="rounded-2xl bg-white p-4 transition-all hover:shadow-md"
      style={{ border: "1px solid #E2E8F0" }}
    >
      <div className="mb-3 flex items-start justify-between">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-xl"
          style={{ background: ic.bg }}
        >
          <IconComponent className="h-5 w-5" style={{ color: ic.color }} />
        </div>
        <span
          className="flex items-center gap-1 rounded-xl px-2 py-0.5"
          style={{ background: sc.bg }}
        >
          <StatusIcon className="h-3 w-3" style={{ color: sc.text }} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 10.5,
              fontWeight: 700,
              color: sc.text,
            }}
          >
            {sc.label}
          </span>
        </span>
      </div>
      <p
        style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: 13.5,
          fontWeight: 700,
          color: "#1E293B",
          marginBottom: 4,
        }}
      >
        {integ.nome}
      </p>
      <p
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 12,
          color: "#64748B",
          lineHeight: 1.5,
        }}
      >
        {integ.descricao}
      </p>
      {integ.bancos?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {integ.bancos.map((b: string) => (
            <span
              key={b}
              className="rounded px-1.5 py-0.5 text-xs"
              style={{
                fontFamily: "'Inter', sans-serif",
                background: "#F1F5F9",
                color: "#64748B",
              }}
            >
              {b}
            </span>
          ))}
        </div>
      )}
      <div className="mt-4 flex gap-2">
        {integ.status === "conectado" ? (
          <>
            <button
              onClick={() => toast.success("Configurações...")}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-1.5 hover:bg-slate-50"
              style={{ borderColor: "#E2E8F0" }}
            >
              <Settings className="h-3.5 w-3.5" style={{ color: "#64748B" }} />
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#374151",
                }}
              >
                Configurar
              </span>
            </button>
            <button
              onClick={() => toast.success("Sincronizando...")}
              className="rounded-xl border p-1.5 hover:bg-slate-50"
              style={{ borderColor: "#E2E8F0" }}
            >
              <RefreshCw className="h-3.5 w-3.5" style={{ color: "#64748B" }} />
            </button>
          </>
        ) : (
          <button
            onClick={onConnect}
            disabled={connecting}
            className="flex-1 rounded-xl py-1.5 text-white transition-all"
            style={{
              background: connecting ? "#CBD5E1" : P,
              fontFamily: "'Inter', sans-serif",
              fontSize: 12.5,
              fontWeight: 700,
            }}
            onMouseEnter={(e) =>
              !connecting && (e.currentTarget.style.background = PH)
            }
            onMouseLeave={(e) =>
              !connecting && (e.currentTarget.style.background = P)
            }
          >
            {connecting
              ? "Conectando..."
              : integ.status === "pendente"
                ? "Configurar"
                : "Conectar"}
          </button>
        )}
      </div>
    </div>
  );
}
