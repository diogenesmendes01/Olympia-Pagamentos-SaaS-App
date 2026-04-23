import { useState } from "react";
import {
  Building2,
  Users,
  Landmark,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Crown,
  Zap,
  ChevronDown,
  X,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  PRIMARY as P,
  PRIMARY_HOVER as PH,
  GOLD as G,
  SUCCESS,
  SUCCESS_BG,
  PRIMARY_SOFT,
} from "../../styles/tokens";

interface Props {
  onComplete: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { n: 1, label: "Bem-vindo" },
  { n: 2, label: "Empresa" },
  { n: 3, label: "Equipe" },
  { n: 4, label: "Banco" },
  { n: 5, label: "Pronto!" },
];

const SEGMENTS = [
  "Serviços",
  "Comércio",
  "Indústria",
  "Saúde",
  "Educação",
  "Tecnologia",
  "Construção",
  "Agronegócio",
  "Outros",
];
const SIZES = [
  "1–5 funcionários",
  "6–20 funcionários",
  "21–100 funcionários",
  "101–500 funcionários",
  "500+ funcionários",
];
const ROLES = ["Administrador", "Financeiro", "Operacional", "Visualizador"];
const BANKS = [
  { name: "Itaú", initial: "IU", color: "#B8872F" },
  { name: "Bradesco", initial: "BD", color: "#7A3535" },
  { name: "Nubank", initial: "NU", color: "#6B4BAF" },
  { name: "Banco do Brasil", initial: "BB", color: "#B8872F" },
  { name: "Caixa", initial: "CX", color: "#1A6BBA" },
  { name: "Santander", initial: "ST", color: "#7A3535" },
  { name: "BTG Pactual", initial: "BT", color: G },
  { name: "Inter", initial: "IN", color: "#B8872F" },
];

export function OwnerOnboarding({ onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [company, setCompany] = useState({
    nome: "Olympia Pagamentos",
    fantasia: "",
    cnpj: "12.345.678/0001-90",
    segmento: "",
    tamanho: "",
    faturamento: "",
  });
  const [invites, setInvites] = useState([{ email: "", role: "Financeiro" }]);
  const [selectedBanks, setSelectedBanks] = useState<string[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const addInvite = () => setInvites((v) => [...v, { email: "", role: "Financeiro" }]);
  const removeInvite = (i: number) => setInvites((v) => v.filter((_, idx) => idx !== i));
  const updateInvite = (i: number, key: "email" | "role", val: string) =>
    setInvites((v) => v.map((inv, idx) => (idx === i ? { ...inv, [key]: val } : inv)));

  const connectBank = async (name: string) => {
    setConnecting(name);
    await new Promise((r) => setTimeout(r, 1400));
    setConnecting(null);
    setSelectedBanks((b) => (b.includes(name) ? b : [...b, name]));
    toast.success(`${name} conectado via Open Finance!`);
  };

  const handleFinish = async () => {
    await new Promise((r) => setTimeout(r, 800));
    toast.success("Configuração concluída! Bem-vindo à Olympia.");
    onComplete();
  };

  const inputCls = "w-full px-4 py-2.5 rounded-xl border focus:outline-none transition-all";
  const inputSty = {
    fontFamily: "'Inter', sans-serif",
    fontSize: 13,
    color: "#374151",
    borderColor: "#CBD5E1",
    background: "#FFFFFF",
  };
  const onF = (e: any) => {
    e.currentTarget.style.borderColor = P;
    e.currentTarget.style.boxShadow = `0 0 0 3px rgba(31,58,95,0.08)`;
  };
  const onB = (e: any) => {
    e.currentTarget.style.borderColor = "#CBD5E1";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="flex w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        style={{ maxWidth: 620, maxHeight: "95vh" }}
      >
        {/* Top bar */}
        <div style={{ background: P, padding: "20px 24px 0" }}>
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: "rgba(200,169,107,0.15)", border: `1.5px solid ${G}` }}
              >
                <span
                  style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: G }}
                >
                  O
                </span>
              </div>
              <div>
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 12,
                    fontWeight: 700,
                    color: "#FFFFFF",
                    letterSpacing: "0.12em",
                  }}
                >
                  OLYMPIA
                </span>
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 9.5,
                    color: "rgba(255,255,255,0.5)",
                    letterSpacing: "0.1em",
                    display: "block",
                  }}
                >
                  PAGAMENTOS
                </span>
              </div>
            </div>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 11.5,
                color: "rgba(255,255,255,0.6)",
              }}
            >
              Passo {step} de {STEPS.length}
            </span>
          </div>

          {/* Step tabs */}
          <div className="flex gap-1 pb-0">
            {STEPS.map((s) => (
              <button
                key={s.n}
                onClick={() => step > s.n && setStep(s.n as Step)}
                className="flex-1 rounded-t-xl py-2.5 text-center transition-all"
                style={{
                  background: step === s.n ? "white" : "transparent",
                  cursor: step > s.n ? "pointer" : "default",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: step === s.n ? 700 : 400,
                    color:
                      step === s.n
                        ? P
                        : step > s.n
                          ? "rgba(255,255,255,0.8)"
                          : "rgba(255,255,255,0.4)",
                  }}
                >
                  {s.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: "#E2E8F0" }}>
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: G,
              transition: "width 0.4s ease",
            }}
          />
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* ── Step 1: Bem-vindo ── */}
          {step === 1 && (
            <div className="py-4 text-center">
              <div
                className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: PRIMARY_SOFT }}
              >
                <Sparkles className="h-8 w-8" style={{ color: P }} />
              </div>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#1E293B",
                  marginBottom: 8,
                }}
              >
                Bem-vindo à Olympia!
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: "#64748B",
                  lineHeight: 1.7,
                  maxWidth: 440,
                  margin: "0 auto 24px",
                }}
              >
                Vamos configurar sua empresa em poucos passos para que você possa começar a
                gerenciar seus pagamentos com total controle.
              </p>
              <div className="mb-6 grid grid-cols-2 gap-3 text-left">
                {[
                  {
                    icon: Building2,
                    title: "Dados da Empresa",
                    desc: "Configure seu perfil empresarial",
                  },
                  {
                    icon: Users,
                    title: "Convide sua Equipe",
                    desc: "Adicione colaboradores com funções",
                  },
                  {
                    icon: Landmark,
                    title: "Conecte seu Banco",
                    desc: "Open Finance integrado e seguro",
                  },
                  { icon: Zap, title: "Comece em minutos", desc: "Sem burocracia, setup rápido" },
                ].map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex items-start gap-3 rounded-2xl p-4"
                    style={{ background: "#F8FAFC", border: "1px solid #E2E8F0" }}
                  >
                    <div
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{ background: PRIMARY_SOFT }}
                    >
                      <Icon className="h-4 w-4" style={{ color: P }} />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: "#1E293B",
                        }}
                      >
                        {title}
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11.5,
                          color: "#64748B",
                        }}
                      >
                        {desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Step 2: Empresa ── */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1E293B",
                  }}
                >
                  Dados da Empresa
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>
                  Essas informações serão usadas nas notas fiscais e cobranças
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
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
                    Razão Social
                  </label>
                  <input
                    className={inputCls}
                    style={inputSty}
                    onFocus={onF}
                    onBlur={onB}
                    value={company.nome}
                    onChange={(e) => setCompany((c) => ({ ...c, nome: e.target.value }))}
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
                    Nome Fantasia
                  </label>
                  <input
                    className={inputCls}
                    style={inputSty}
                    onFocus={onF}
                    onBlur={onB}
                    placeholder="Opcional"
                    value={company.fantasia}
                    onChange={(e) => setCompany((c) => ({ ...c, fantasia: e.target.value }))}
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
                    CNPJ
                  </label>
                  <input
                    className={inputCls}
                    style={inputSty}
                    onFocus={onF}
                    onBlur={onB}
                    value={company.cnpj}
                    onChange={(e) => setCompany((c) => ({ ...c, cnpj: e.target.value }))}
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
                    Segmento
                  </label>
                  <select
                    className={inputCls}
                    style={{ ...inputSty, appearance: "none" }}
                    onFocus={onF}
                    onBlur={onB}
                    value={company.segmento}
                    onChange={(e) => setCompany((c) => ({ ...c, segmento: e.target.value }))}
                  >
                    <option value="">Selecione…</option>
                    {SEGMENTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
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
                    Tamanho
                  </label>
                  <select
                    className={inputCls}
                    style={{ ...inputSty, appearance: "none" }}
                    onFocus={onF}
                    onBlur={onB}
                    value={company.tamanho}
                    onChange={(e) => setCompany((c) => ({ ...c, tamanho: e.target.value }))}
                  >
                    <option value="">Selecione…</option>
                    {SIZES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
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
                    Faturamento Mensal Estimado
                  </label>
                  <select
                    className={inputCls}
                    style={{ ...inputSty, appearance: "none" }}
                    onFocus={onF}
                    onBlur={onB}
                    value={company.faturamento}
                    onChange={(e) => setCompany((c) => ({ ...c, faturamento: e.target.value }))}
                  >
                    <option value="">Selecione…</option>
                    {[
                      "Até R$ 20.000",
                      "R$ 20k – R$ 100k",
                      "R$ 100k – R$ 500k",
                      "R$ 500k – R$ 2M",
                      "Acima de R$ 2M",
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Equipe ── */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1E293B",
                  }}
                >
                  Convide sua Equipe
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>
                  Os convidados receberão um e-mail com link de acesso
                </p>
              </div>
              {invites.map((inv, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="email"
                    className={`${inputCls} flex-1`}
                    style={inputSty}
                    onFocus={onF}
                    onBlur={onB}
                    placeholder={`email${i + 1}@empresa.com.br`}
                    value={inv.email}
                    onChange={(e) => updateInvite(i, "email", e.target.value)}
                  />
                  <select
                    className="rounded-xl border px-3 py-2.5 focus:outline-none"
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12.5,
                      color: "#374151",
                      borderColor: "#CBD5E1",
                      background: "#FFFFFF",
                      minWidth: 130,
                    }}
                    value={inv.role}
                    onChange={(e) => updateInvite(i, "role", e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                  {invites.length > 1 && (
                    <button
                      onClick={() => removeInvite(i)}
                      className="flex-shrink-0 rounded-xl p-2 hover:bg-slate-100"
                    >
                      <Trash2 className="h-4 w-4" style={{ color: "#94A3B8" }} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addInvite}
                className="flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 hover:bg-slate-50"
                style={{ borderColor: "#E2E8F0", borderStyle: "dashed" }}
              >
                <Plus className="h-3.5 w-3.5" style={{ color: P }} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    color: P,
                    fontWeight: 600,
                  }}
                >
                  Adicionar mais
                </span>
              </button>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "#94A3B8",
                  textAlign: "center",
                }}
              >
                Pode pular por agora e convidar depois em Usuários
              </p>
            </div>
          )}

          {/* ── Step 4: Banco ── */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="mb-2">
                <h2
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#1E293B",
                  }}
                >
                  Conecte seu Banco
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>
                  Integração segura via Open Finance — autorizada pelo Banco Central
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {BANKS.map((bank) => {
                  const connected = selectedBanks.includes(bank.name);
                  const isConnecting = connecting === bank.name;
                  return (
                    <button
                      key={bank.name}
                      onClick={() => !connected && connectBank(bank.name)}
                      disabled={isConnecting}
                      className="flex items-center gap-3 rounded-2xl border-2 p-3 text-left transition-all"
                      style={{
                        borderColor: connected ? SUCCESS : "#E2E8F0",
                        background: connected ? SUCCESS_BG : "white",
                        opacity: isConnecting ? 0.7 : 1,
                      }}
                    >
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white"
                        style={{ background: bank.color, fontFamily: "'Inter', sans-serif" }}
                      >
                        {bank.initial}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 12.5,
                            fontWeight: 600,
                            color: "#1E293B",
                          }}
                        >
                          {bank.name}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 11,
                            color: connected ? SUCCESS : "#94A3B8",
                          }}
                        >
                          {isConnecting
                            ? "Conectando…"
                            : connected
                              ? "Conectado ✓"
                              : "Clique para conectar"}
                        </p>
                      </div>
                      {connected && (
                        <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: SUCCESS }} />
                      )}
                    </button>
                  );
                })}
              </div>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11.5,
                  color: "#94A3B8",
                  textAlign: "center",
                }}
              >
                Você pode conectar mais bancos depois em Integrações
              </p>
            </div>
          )}

          {/* ── Step 5: Pronto! ── */}
          {step === 5 && (
            <div className="py-4 text-center">
              <div
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full"
                style={{ background: SUCCESS_BG, border: `3px solid ${SUCCESS}` }}
              >
                <CheckCircle className="h-10 w-10" style={{ color: SUCCESS }} />
              </div>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: 24,
                  fontWeight: 800,
                  color: "#1E293B",
                  marginBottom: 8,
                }}
              >
                Tudo pronto, {company.nome.split(" ")[0]}!
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14,
                  color: "#64748B",
                  lineHeight: 1.7,
                  maxWidth: 400,
                  margin: "0 auto 24px",
                }}
              >
                Sua empresa está configurada. Comece agora criando sua primeira cobrança ou
                conectando mais integrações.
              </p>
              <div className="mx-auto mb-6 max-w-xs space-y-2 text-left">
                {[
                  { label: "Empresa configurada", done: true },
                  {
                    label: `${invites.filter((i) => i.email).length} convite(s) enviado(s)`,
                    done: invites.some((i) => i.email),
                  },
                  {
                    label: `${selectedBanks.length} banco(s) conectado(s)`,
                    done: selectedBanks.length > 0,
                  },
                  { label: "Dashboard pronto para uso", done: true },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div
                      className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ background: item.done ? SUCCESS_BG : "#F1F5F9" }}
                    >
                      {item.done ? (
                        <CheckCircle className="h-3.5 w-3.5" style={{ color: SUCCESS }} />
                      ) : (
                        <div className="h-2 w-2 rounded-full" style={{ background: "#CBD5E1" }} />
                      )}
                    </div>
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 13,
                        color: item.done ? "#374151" : "#94A3B8",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
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
            {step > 1 && step < 5 && (
              <button
                onClick={() => setStep((s) => (s - 1) as Step)}
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
            {step < 5 && step >= 3 && (
              <button
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="rounded-xl border px-4 py-2"
                style={{
                  borderColor: "#E2E8F0",
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12.5,
                  color: "#64748B",
                }}
              >
                Pular
              </button>
            )}
            {step < 5 ? (
              <button
                onClick={() => setStep((s) => (s + 1) as Step)}
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
                {step === 1 ? "Começar configuração" : "Continuar"}{" "}
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-white"
                style={{
                  background: P,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  fontWeight: 700,
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = PH)}
                onMouseLeave={(e) => (e.currentTarget.style.background = P)}
              >
                Ir para o Dashboard <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
