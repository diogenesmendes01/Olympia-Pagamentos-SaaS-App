import { useState } from "react";
import {
  Building2,
  Bell,
  Shield,
  CreditCard,
  Palette,
  Globe,
  Save,
  ChevronRight,
  CheckCircle,
  Smartphone,
  Mail,
  MessageSquare,
  Moon,
  Sun,
  Monitor,
  Fingerprint,
  Upload,
} from "lucide-react";
import { currentUser } from "../data/mockData";
import { toast } from "sonner";

const P = "#1F3A5F";
const PH = "#274872";
const G = "#C8A96B";

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState("empresa");
  const [emailNotif, setEmailNotif] = useState(true);
  const [whatsappNotif, setWhatsappNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [theme, setTheme] = useState("light");
  const [currency, setCurrency] = useState("BRL");
  const [timezone, setTimezone] = useState("America/Sao_Paulo");
  const [mfaType, setMfaType] = useState("app");
  const [autoNF, setAutoNF] = useState(true);
  const [autoReconcile, setAutoReconcile] = useState(true);
  const [reminderDays, setReminderDays] = useState("3");

  const sections = [
    { id: "empresa", label: "Empresa", icon: Building2 },
    { id: "notificacoes", label: "Notificações", icon: Bell },
    { id: "seguranca", label: "Segurança & MFA", icon: Shield },
    { id: "cobranca", label: "Regras de Cobrança", icon: CreditCard },
    { id: "aparencia", label: "Aparência", icon: Palette },
    { id: "localizacao", label: "Localização", icon: Globe },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className="relative flex-shrink-0 rounded-full transition-colors"
      style={{ width: 40, height: 22, background: checked ? P : "#CBD5E1" }}
    >
      <div
        className="absolute top-0.5 rounded-full bg-white transition-transform"
        style={{
          width: 18,
          height: 18,
          transform: checked ? "translateX(20px)" : "translateX(2px)",
          transition: "transform 0.2s",
        }}
      />
    </button>
  );

  return (
    <div className="p-5 lg:p-6">
      <div className="mb-5">
        <h1
          style={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: 21,
            fontWeight: 800,
            color: P,
          }}
        >
          Configurações
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>
          Personalize o Olympia Pagamentos para sua empresa
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Side nav */}
        <div className="rounded-2xl bg-white p-2" style={{ border: "1px solid #E2E8F0" }}>
          {sections.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSection(s.id);
                }}
                className="mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all"
                style={{ background: activeSection === s.id ? "#EEF2F9" : "transparent" }}
              >
                <Icon
                  className="h-4 w-4"
                  style={{ color: activeSection === s.id ? P : "#94A3B8" }}
                />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    fontWeight: activeSection === s.id ? 600 : 400,
                    color: activeSection === s.id ? P : "#374151",
                  }}
                >
                  {s.label}
                </span>
                {activeSection === s.id && (
                  <ChevronRight className="ml-auto h-4 w-4" style={{ color: P }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-4 lg:col-span-3">
          {activeSection === "empresa" && (
            <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: P,
                  marginBottom: 16,
                }}
              >
                Dados da Empresa
              </h3>
              <div className="space-y-4">
                {[
                  { label: "Razão Social", value: "Olympia Pagamentos Ltda", type: "text" },
                  { label: "Nome Fantasia", value: "Olympia Pagamentos", type: "text" },
                  { label: "CNPJ", value: currentUser.cnpj, type: "text" },
                  { label: "E-mail Corporativo", value: currentUser.email, type: "email" },
                  { label: "Telefone / WhatsApp", value: "+55 (11) 98765-4321", type: "tel" },
                  { label: "Site", value: "https://olympiapag.com.br", type: "url" },
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
                      defaultValue={f.value}
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
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "CEP", value: "01310-100" },
                    { label: "Cidade / UF", value: "São Paulo / SP" },
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
                        defaultValue={f.value}
                        className="w-full rounded-xl border px-4 py-2.5 focus:outline-none"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          background: "#F8FAFC",
                          borderColor: "#E2E8F0",
                        }}
                      />
                    </div>
                  ))}
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
                    Regime Tributário
                  </label>
                  <select
                    className="w-full rounded-xl border px-4 py-2.5 focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13,
                      background: "#F8FAFC",
                      borderColor: "#E2E8F0",
                    }}
                  >
                    {["Simples Nacional", "Lucro Presumido", "Lucro Real", "MEI"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={() => toast.success("Dados salvos!")}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-white transition-all"
                  style={{ background: P, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                  onMouseLeave={(e) => (e.currentTarget.style.background = P)}
                >
                  <Save className="h-4 w-4" />
                  Salvar Alterações
                </button>
              </div>
            </div>
          )}

          {activeSection === "notificacoes" && (
            <div className="space-y-4">
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
                  Canais de Notificação
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: "#64748B",
                    marginBottom: 16,
                  }}
                >
                  Configure como deseja receber alertas
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: "E-mail",
                      sub: "Alertas, faturas e relatórios",
                      icon: Mail,
                      checked: emailNotif,
                      toggle: () => {
                        setEmailNotif(!emailNotif);
                      },
                    },
                    {
                      label: "WhatsApp Business",
                      sub: "Cobranças, lembretes e confirmações",
                      icon: MessageSquare,
                      checked: whatsappNotif,
                      toggle: () => {
                        setWhatsappNotif(!whatsappNotif);
                      },
                    },
                    {
                      label: "SMS",
                      sub: "Alertas críticos e autenticação",
                      icon: Smartphone,
                      checked: smsNotif,
                      toggle: () => {
                        setSmsNotif(!smsNotif);
                      },
                    },
                  ].map((n) => (
                    <div
                      key={n.label}
                      className="flex items-center justify-between rounded-2xl border p-3.5"
                      style={{ borderColor: "#E2E8F0" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-xl"
                          style={{ background: "#EEF2F9" }}
                        >
                          <n.icon className="h-4 w-4" style={{ color: P }} />
                        </div>
                        <div>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            {n.label}
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 11.5,
                              color: "#94A3B8",
                            }}
                          >
                            {n.sub}
                          </p>
                        </div>
                      </div>
                      <Toggle checked={n.checked} onChange={n.toggle} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
                <h3
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: P,
                    marginBottom: 12,
                  }}
                >
                  Lembretes de Cobrança
                </h3>
                <select
                  value={reminderDays}
                  onChange={(e) => {
                    setReminderDays(e.target.value);
                  }}
                  className="mb-4 w-full rounded-xl border px-4 py-2.5 focus:outline-none"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    borderColor: "#E2E8F0",
                  }}
                >
                  {[
                    ["1", "1 dia antes"],
                    ["3", "3 dias antes"],
                    ["5", "5 dias antes"],
                    ["7", "7 dias antes"],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                <div className="space-y-2">
                  {[
                    "Lembrete 3 dias antes",
                    "Lembrete no dia do vencimento",
                    "Lembrete 1 dia após vencimento",
                    "Lembrete semanal após vencimento",
                  ].map((r, i) => (
                    <div key={r} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={i < 3}
                        className="rounded"
                        style={{ accentColor: P }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {r}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => toast.success("Notificações salvas!")}
                  className="mt-4 flex items-center gap-2 rounded-xl px-5 py-2.5 text-white"
                  style={{ background: P, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                >
                  <Save className="h-4 w-4" />
                  Salvar
                </button>
              </div>
            </div>
          )}

          {activeSection === "seguranca" && (
            <div className="space-y-4">
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
                  Autenticação Multifator (MFA)
                </h3>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    color: "#64748B",
                    marginBottom: 16,
                  }}
                >
                  Proteção extra em todas as sessões
                </p>
                <div className="space-y-3">
                  {[
                    {
                      id: "app",
                      label: "App Autenticador",
                      sub: "Google Authenticator, Authy, Microsoft",
                      Icon: Smartphone,
                      recommended: true,
                    },
                    {
                      id: "sms",
                      label: "SMS",
                      sub: "Código enviado por mensagem de texto",
                      Icon: MessageSquare,
                      recommended: false,
                    },
                    {
                      id: "email",
                      label: "E-mail",
                      sub: "Código enviado para seu e-mail",
                      Icon: Mail,
                      recommended: false,
                    },
                    {
                      id: "passkey",
                      label: "Passkey / WebAuthn",
                      sub: "Face ID, Touch ID — autenticação biométrica",
                      Icon: Fingerprint,
                      recommended: true,
                    },
                  ].map((m) => (
                    <label
                      key={m.id}
                      className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-3.5 transition-all"
                      style={{
                        borderColor: mfaType === m.id ? P : "#E2E8F0",
                        background: mfaType === m.id ? "#EEF2F9" : "white",
                      }}
                    >
                      <input
                        type="radio"
                        name="mfa"
                        value={m.id}
                        checked={mfaType === m.id}
                        onChange={() => {
                          setMfaType(m.id);
                        }}
                        className="sr-only"
                      />
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                        style={{ background: mfaType === m.id ? P + "18" : "#F1F5F9" }}
                      >
                        <m.Icon
                          className="h-4 w-4"
                          style={{ color: mfaType === m.id ? P : "#94A3B8" }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: "#374151",
                            }}
                          >
                            {m.label}
                          </p>
                          {m.recommended && (
                            <span
                              style={{
                                fontFamily: "'Inter', sans-serif",
                                fontSize: 9.5,
                                background: "#EDF4EE",
                                color: "#5E7A5F",
                                padding: "1px 6px",
                                borderRadius: 4,
                                fontWeight: 700,
                                letterSpacing: "0.06em",
                              }}
                            >
                              RECOMENDADO
                            </span>
                          )}
                        </div>
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 11.5,
                            color: "#94A3B8",
                          }}
                        >
                          {m.sub}
                        </p>
                      </div>
                      {mfaType === m.id && (
                        <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: P }} />
                      )}
                    </label>
                  ))}
                </div>
                <button
                  onClick={() => toast.success("MFA configurado!")}
                  className="mt-4 flex items-center gap-2 rounded-xl px-5 py-2.5 text-white"
                  style={{ background: P, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                >
                  <Shield className="h-4 w-4" />
                  Configurar MFA
                </button>
              </div>
              <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
                <h3
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 14.5,
                    fontWeight: 800,
                    color: P,
                    marginBottom: 12,
                  }}
                >
                  Política de Senhas
                </h3>
                <div className="space-y-3">
                  {[
                    { label: "Mínimo 8 caracteres", checked: true },
                    { label: "Maiúsculas e minúsculas obrigatórias", checked: true },
                    { label: "Caracteres especiais obrigatórios", checked: true },
                    { label: "Expiração de senha a cada 90 dias", checked: false },
                    { label: "Bloquear após 5 tentativas falhas", checked: true },
                    { label: "CAPTCHA após 3 tentativas", checked: true },
                  ].map((pol) => (
                    <div key={pol.label} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        defaultChecked={pol.checked}
                        className="rounded"
                        style={{ accentColor: P }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          color: "#374151",
                        }}
                      >
                        {pol.label}
                      </span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => toast.success("Política de senhas atualizada!")}
                  className="mt-4 flex items-center gap-2 rounded-xl px-5 py-2.5 text-white"
                  style={{ background: P, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                >
                  <Save className="h-4 w-4" />
                  Salvar Política
                </button>
              </div>
            </div>
          )}

          {activeSection === "cobranca" && (
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
                Regras Automáticas de Cobrança
              </h3>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#64748B",
                  marginBottom: 16,
                }}
              >
                Juros, multas, descontos e automações
              </p>
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Juros ao mês (%)", ph: "1,00", help: "Aplicado após vencimento" },
                    {
                      label: "Multa por atraso (%)",
                      ph: "2,00",
                      help: "Percentual único no 1º dia",
                    },
                    {
                      label: "Desconto pontualidade (%)",
                      ph: "0,00",
                      help: "Se pago com antecedência",
                    },
                  ].map((f) => (
                    <div key={f.label}>
                      <label
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12,
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
                        className="w-full rounded-xl border px-3 py-2.5 focus:outline-none"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13,
                          background: "#F8FAFC",
                          borderColor: "#E2E8F0",
                        }}
                      />
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10.5,
                          color: "#94A3B8",
                          marginTop: 3,
                        }}
                      >
                        {f.help}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4" style={{ borderColor: "#F1F5F9" }}>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: "#374151",
                      marginBottom: 10,
                    }}
                  >
                    Automações
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Emitir NF-e/NFS-e automaticamente ao confirmar pagamento",
                        checked: autoNF,
                        toggle: () => {
                          setAutoNF(!autoNF);
                        },
                      },
                      {
                        label: "Conciliação automática via Open Finance",
                        checked: autoReconcile,
                        toggle: () => {
                          setAutoReconcile(!autoReconcile);
                        },
                      },
                      {
                        label: "Escalonamento automático: email → WhatsApp → SMS",
                        checked: true,
                        // eslint-disable-next-line @typescript-eslint/no-empty-function -- demo UI noop toggle
                        toggle: () => {},
                      },
                      {
                        label: "Protesto automático após 15 dias de atraso",
                        checked: false,
                        // eslint-disable-next-line @typescript-eslint/no-empty-function -- demo UI noop toggle
                        toggle: () => {},
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between rounded-2xl border p-3.5"
                        style={{ borderColor: "#E2E8F0" }}
                      >
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 13,
                            color: "#374151",
                          }}
                        >
                          {item.label}
                        </p>
                        <Toggle checked={item.checked} onChange={item.toggle} />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => toast.success("Regras atualizadas!")}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-white"
                  style={{ background: P, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                >
                  <Save className="h-4 w-4" />
                  Salvar Regras
                </button>
              </div>
            </div>
          )}

          {activeSection === "aparencia" && (
            <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: P,
                  marginBottom: 16,
                }}
              >
                Tema & Aparência
              </h3>
              <div className="mb-6 grid grid-cols-3 gap-3">
                {[
                  { id: "light", label: "Claro", icon: Sun },
                  { id: "dark", label: "Escuro", icon: Moon },
                  { id: "system", label: "Sistema", icon: Monitor },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                    }}
                    className="flex flex-col items-center gap-2 rounded-2xl border-2 p-4 transition-all"
                    style={{
                      borderColor: theme === t.id ? P : "#E2E8F0",
                      background: theme === t.id ? "#EEF2F9" : "white",
                    }}
                  >
                    <t.icon className="h-5 w-5" style={{ color: theme === t.id ? P : "#94A3B8" }} />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        fontWeight: 600,
                        color: theme === t.id ? P : "#374151",
                      }}
                    >
                      {t.label}
                    </span>
                  </button>
                ))}
              </div>
              <div className="mb-6">
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: 10,
                  }}
                >
                  Cor Principal da Marca
                </p>
                <div className="flex items-center gap-3">
                  {[P, "#162C47", "#1E4080", "#00507A", "#3B4A6B", "#2D3E6B"].map((c) => (
                    <button
                      key={c}
                      className="h-8 w-8 rounded-full border-2 transition-transform hover:scale-110"
                      style={{
                        background: c,
                        borderColor: c === P ? G : "transparent",
                        boxShadow: c === P ? `0 0 0 3px rgba(200,169,107,0.4)` : "none",
                      }}
                    />
                  ))}
                  <div className="ml-2 flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full" style={{ background: G }} />
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 11.5,
                        color: "#64748B",
                      }}
                    >
                      Dourado (destaque)
                    </span>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border p-3.5" style={{ borderColor: "#E2E8F0" }}>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  White Label — Logo personalizado
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11.5,
                    color: "#94A3B8",
                    marginTop: 2,
                  }}
                >
                  SVG ou PNG, máx 2MB, fundo transparente recomendado
                </p>
                <button
                  onClick={() => toast.info("Selecione o arquivo...")}
                  className="mt-3 flex items-center gap-1.5 rounded-xl border px-3 py-1.5 hover:bg-slate-50"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    borderColor: "#E2E8F0",
                  }}
                >
                  <Upload className="h-3.5 w-3.5" style={{ color: "#64748B" }} />
                  Fazer Upload do Logo
                </button>
              </div>
              <button
                onClick={() => toast.success("Aparência atualizada!")}
                className="mt-4 flex items-center gap-2 rounded-xl px-5 py-2.5 text-white"
                style={{ background: P, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
              >
                <Save className="h-4 w-4" />
                Salvar Aparência
              </button>
            </div>
          )}

          {activeSection === "localizacao" && (
            <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid #E2E8F0" }}>
              <h3
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 14.5,
                  fontWeight: 800,
                  color: P,
                  marginBottom: 16,
                }}
              >
                Localização & Moeda
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Moeda Principal",
                    id: "currency",
                    options: [
                      ["BRL", "BRL — Real Brasileiro (R$)"],
                      ["USD", "USD — Dólar Americano ($)"],
                      ["EUR", "EUR — Euro (€)"],
                    ],
                    value: currency,
                    onChange: setCurrency,
                  },
                  {
                    label: "Fuso Horário",
                    id: "timezone",
                    options: [
                      ["America/Sao_Paulo", "America/São Paulo (UTC-3)"],
                      ["America/Manaus", "America/Manaus (UTC-4)"],
                    ],
                    value: timezone,
                    onChange: setTimezone,
                  },
                ].map((f) => (
                  <div key={f.id}>
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
                    <select
                      value={f.value}
                      onChange={(e) => {
                        f.onChange(e.target.value);
                      }}
                      className="w-full rounded-xl border px-4 py-2.5 focus:outline-none"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        background: "#F8FAFC",
                        borderColor: "#E2E8F0",
                      }}
                    >
                      {f.options.map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                {[
                  {
                    label: "Formato de Data",
                    opts: ["DD/MM/AAAA (padrão Brasil)", "MM/DD/AAAA", "AAAA-MM-DD (ISO 8601)"],
                  },
                  {
                    label: "Idioma da Plataforma",
                    opts: ["Português (Brasil)", "English (US)", "Español"],
                  },
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
                    <select
                      className="w-full rounded-xl border px-4 py-2.5 focus:outline-none"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        background: "#F8FAFC",
                        borderColor: "#E2E8F0",
                      }}
                    >
                      {f.opts.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                ))}
                <button
                  onClick={() => toast.success("Preferências salvas!")}
                  className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-white"
                  style={{ background: P, fontFamily: "'Inter', sans-serif", fontWeight: 700 }}
                >
                  <Save className="h-4 w-4" />
                  Salvar Preferências
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
