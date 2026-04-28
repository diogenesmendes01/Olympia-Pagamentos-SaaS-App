import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle,
  Zap,
  FileText,
  QrCode,
  BarChart3,
  MessageSquare,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Star,
  Play,
  X,
  Menu,
  CreditCard,
  TrendingUp,
  Clock,
  RefreshCw,
  Building2,
  Lock,
  ChevronLeft,
  ChevronRight,
  Landmark,
  BadgeCheck,
  PhoneCall,
  Users,
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

/* ══════════════════════════════════════════════════
   BRAND TOKENS
══════════════════════════════════════════════════ */
const P = "#1F3A5F";
const G = "#C8A96B";
const GH = "#B8943A";
const IV = "#F4EFE6";

/* ══════════════════════════════════════════════════
   PHOTOS
══════════════════════════════════════════════════ */
const PHOTO_A =
  "https://images.unsplash.com/photo-1758691737587-7630b4d31d16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const PHOTO_B =
  "https://images.unsplash.com/photo-1713947503689-d5e1d303bb4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const PHOTO_C =
  "https://images.unsplash.com/photo-1753161617988-c5f43e441621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const PHOTO_D =
  "https://images.unsplash.com/photo-1612299273045-362a39972259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const DASH_IMG =
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

/* ══════════════════════════════════════════════════
   GLOBAL CSS INJECTED ONCE
══════════════════════════════════════════════════ */
const CSS = `
@keyframes ol-fade-up   { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
@keyframes ol-cursor    { 0%,100%{ opacity:1 } 50%{ opacity:0 } }
@keyframes ol-draw      { to { stroke-dashoffset: 0 } }
@keyframes ol-pulse-g   { 0%,100%{ box-shadow:0 0 0 0 rgba(200,169,107,0.5) } 60%{ box-shadow:0 0 0 12px rgba(200,169,107,0) } }
@keyframes ol-float     { 0%,100%{ transform:translateY(0) } 50%{ transform:translateY(-8px) } }

.ol-reveal          { opacity:0; transform:translateY(28px); transition:opacity .65s ease, transform .65s ease; }
.ol-reveal.visible  { opacity:1; transform:none; }
.ol-reveal.d1       { transition-delay:.1s }
.ol-reveal.d2       { transition-delay:.2s }
.ol-reveal.d3       { transition-delay:.3s }
.ol-reveal.d4       { transition-delay:.4s }
.ol-reveal.d5       { transition-delay:.5s }

.ol-card-3d         { transition: transform .18s ease, box-shadow .18s ease; transform-style:preserve-3d; }
.ol-card-3d:hover   { box-shadow: 0 24px 64px rgba(200,169,107,0.22), 0 0 0 1.5px rgba(200,169,107,0.55) !important; }

.ol-btn-gold        { background:${G}; color:${P}; transition:background .18s, transform .18s, box-shadow .18s; }
.ol-btn-gold:hover  { background:${GH}; transform:translateY(-2px); box-shadow:0 8px 28px rgba(200,169,107,0.45); }

.ol-btn-glass       { background:rgba(255,255,255,0.10); border:1.5px solid rgba(255,255,255,0.22); color:#fff;
                      backdrop-filter:blur(8px); transition:background .18s, transform .18s; }
.ol-btn-glass:hover { background:rgba(255,255,255,0.18); transform:translateY(-2px); }

.ol-cursor-blink    { animation: ol-cursor 1.1s step-start infinite; color:${G}; }
.ol-float           { animation: ol-float 4s ease-in-out infinite; }

.marble-bg {
  background-color:${IV};
  background-image:
    radial-gradient(ellipse at 15% 25%, rgba(200,169,107,.07) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 75%, rgba(31,58,95,.05) 0%, transparent 55%),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23n)' opacity='.025'/%3E%3C/svg%3E");
}
`;

/* ══════════════════════════════════════════════════
   PARTICLE CANVAS
══════════════════════════════════════════════════ */
function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf: number;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const N = 55;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      r: Math.random() * 1.8 + 0.6,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,169,107,.7)";
        ctx.fill();

        for (let j = i + 1; j < N; j++) {
          const q = pts[j];
          const dx = p.x - q.x,
            dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(200,169,107,${0.22 * (1 - d / 110)})`;
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

/* ══════════════════════════════════════════════════
   TYPING HEADLINE
══════════════════════════════════════════════════ */
const LINE1 = "Cobranças e tesouraria";
const LINE2 = "automatizadas por IA";

function TypingHeadline() {
  const [txt1, setTxt1] = useState("");
  const [txt2, setTxt2] = useState("");
  const [phase, setPhase] = useState<"l1" | "l2" | "done">("l1");

  useEffect(() => {
    if (phase === "l1") {
      if (txt1.length < LINE1.length) {
        const t = setTimeout(() => {
          setTxt1(LINE1.slice(0, txt1.length + 1));
        }, 32);
        return () => {
          clearTimeout(t);
        };
      } else {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional typewriter state machine, Figma Make generated
        setPhase("l2");
      }
    }
    if (phase === "l2") {
      if (txt2.length < LINE2.length) {
        const t = setTimeout(() => {
          setTxt2(LINE2.slice(0, txt2.length + 1));
        }, 28);
        return () => {
          clearTimeout(t);
        };
      } else {
        setPhase("done");
      }
    }
  }, [txt1, txt2, phase]);

  return (
    <h1
      style={{
        fontFamily: "'Montserrat', sans-serif",
        fontWeight: 900,
        fontSize: "clamp(26px,3.4vw,48px)",
        lineHeight: 1.18,
        color: "#FFFFFF",
        marginBottom: 22,
        minHeight: "3.5em",
      }}
    >
      <span>{txt1}</span>
      {phase === "l1" && <span className="ol-cursor-blink">|</span>}
      {(phase === "l2" || phase === "done") && (
        <>
          <br />
          <span style={{ color: G }}>{txt2}</span>
          {phase === "l2" && <span className="ol-cursor-blink">|</span>}
        </>
      )}
    </h1>
  );
}

/* ══════════════════════════════════════════════════
   SCROLL REVEAL HOOK
══════════════════════════════════════════════════ */
function useScrollReveal() {
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".ol-reveal").forEach((el) => {
      obs.observe(el);
    });
    return () => {
      obs.disconnect();
    };
  });
}

/* ══════════════════════════════════════════════════
   3D CARD
═════════════════════════════════════════��════════ */
function Card3D({ children, className = "", style = {} }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    ref.current!.style.transform = `perspective(700px) rotateX(${-y * 7}deg) rotateY(${x * 7}deg) translateY(-6px)`;
  }, []);
  const onLeave = useCallback(() => {
    ref.current!.style.transform =
      "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
  }, []);
  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`ol-card-3d ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ANIMATED STAT COUNTER
══════════════════════════════════════════════════ */
function StatNum({
  end,
  suffix = "",
  prefix = "",
}: {
  end: number;
  suffix?: string;
  prefix?: string;
}) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        let i = 0;
        const step = end / 55;
        const t = setInterval(() => {
          i = Math.min(i + step, end);
          setN(Math.floor(i));
          if (i >= end) clearInterval(t);
        }, 22);
        obs.disconnect();
      },
      { threshold: 0.5 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => {
      obs.disconnect();
    };
  }, [end]);
  return (
    <span ref={ref}>
      {prefix}
      {n.toLocaleString("pt-BR")}
      {suffix}
    </span>
  );
}

/* ══════════════════════════════════════════════════
   SVG ANIMATED CONNECTOR
══════════════════════════════════════════════════ */
function StepConnector() {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && ref.current) {
          ref.current.style.animation = "ol-draw 1.4s ease forwards";
          obs.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    if (ref.current) obs.observe(ref.current);
    return () => {
      obs.disconnect();
    };
  }, []);
  return (
    <svg
      className="absolute top-[52px] right-[calc(33%+24px)] left-[calc(33%+24px)] hidden md:block"
      style={{ height: 4, overflow: "visible", pointerEvents: "none" }}
      viewBox="0 0 100 4"
      preserveAspectRatio="none"
    >
      <path
        ref={ref}
        d="M0 2 Q50 0 100 2"
        fill="none"
        stroke={G}
        strokeWidth="1.5"
        strokeDasharray="200"
        strokeDashoffset="200"
        style={{ transition: "none" }}
      />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useScrollReveal();

  useEffect(() => {
    const h = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", h);
    return () => {
      window.removeEventListener("scroll", h);
    };
  }, []);

  /* ── Data ── */
  const testimonials = [
    {
      name: "Ana Clara Mendes",
      role: "Sócia – Mendes Contabilidade · Campinas, SP",
      stars: 5,
      photo: PHOTO_A,
      text: "O Bolepix transformou nossa cobrança. Reduzimos a inadimplência em 70% com uma plataforma que transmite a mesma confiança que nosso escritório.",
    },
    {
      name: "Rafael Costa",
      role: "CEO – TechStore E-commerce",
      stars: 5,
      photo: PHOTO_B,
      text: "Emito centenas de boletos por mês e tudo se concilia sozinho. Uma solução elegante e eficiente que recomendo a todo empresário.",
    },
    {
      name: "Juliana Ferreira",
      role: "Diretora Financeira – JF Serviços",
      stars: 5,
      photo: PHOTO_C,
      text: "A Olympia Pagamentos se tornou o braço financeiro da nossa empresa. Fluxo de caixa previsível e zero dor de cabeça.",
    },
    {
      name: "Carlos Eduardo Lima",
      role: "Sócio-Gerente – Lima Distribuidora",
      stars: 5,
      photo: PHOTO_D,
      text: "Em poucos dias, a Olympia elevou o padrão do nosso controle financeiro. A visão de 90 dias de caixa mudou completamente como tomamos decisões.",
    },
  ];

  const faqs = [
    {
      q: "A IA da Olympia substitui meu time financeiro?",
      a: "Não. Ela tira do seu time todo o trabalho repetitivo — conciliação, cobrança, auditoria — e libera as pessoas pra decisões estratégicas. Quem ganha é o time, que para de operar planilha e passa a usar inteligência.",
    },
    {
      q: "Como a IA garante que não vai errar uma cobrança ou conciliação?",
      a: "Cada operação passa por modelos treinados com milhões de transações reais e por uma camada de validação automática. Em caso de divergência, a IA não age sozinha: ela alerta o responsável antes de qualquer movimentação.",
    },
    {
      q: "Preciso entender de IA pra usar a plataforma?",
      a: "Não. A IA é nativa e invisível — você só vê os resultados: relatórios prontos, cobranças enviadas, conciliações fechadas e previsões de caixa atualizadas em tempo real.",
    },
    {
      q: "A Olympia conecta com meu ERP atual?",
      a: "Sim. Temos integrações nativas com os principais ERPs do mercado (SAP, Totvs, Oracle, Omie, Conta Azul) e API aberta pra qualquer sistema. Conexão em minutos, sem reescrever nada.",
    },
    {
      q: "Meus dados financeiros estão seguros com IA?",
      a: "Totalmente. Operamos em conformidade com a LGPD, certificação ISO 27001, criptografia AES-256 em repouso e TLS 1.3 em trânsito. A IA roda em ambiente isolado e nenhum dado da sua empresa treina modelos de terceiros.",
    },
    {
      q: "Quanto tempo leva pra ver resultado?",
      a: "Os primeiros ganhos aparecem na primeira semana — conciliações que levavam horas passam a ser instantâneas. Em 30 dias, a maioria dos clientes reduz mais de 80% do tempo gasto no financeiro.",
    },
    {
      q: "Posso cancelar a qualquer momento?",
      a: "Sim, sem fidelidade e sem multa. Você testa por 30 dias com IA completa liberada e, se quiser sair, exporta todos os dados em CSV/Excel e JSON via API antes de encerrar a conta.",
    },
  ];

  return (
    <>
      {/* Inject global CSS */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div
        style={{
          fontFamily: "'Inter', sans-serif",
          background: "#fff",
          overflowX: "hidden",
        }}
      >
        {/* ═══════════════════════════════════════════
            NAVBAR
        ═══════════════════════════════════════════ */}
        <header
          className="fixed top-0 right-0 left-0 z-50 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
            boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.09)" : "none",
            backdropFilter: scrolled ? "blur(14px)" : "none",
          }}
        >
          {/* Main nav */}
          <nav className="mx-auto flex max-w-7xl items-center gap-3 px-5 py-3">
            <a href="/" className="flex flex-shrink-0 items-center gap-2.5">
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: P,
                  border: `1.5px solid ${G}`,
                  boxShadow: `0 0 12px rgba(200,169,107,0.25)`,
                }}
              >
                <span
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 15,
                    fontWeight: 700,
                    color: G,
                  }}
                >
                  O
                </span>
              </div>
              <div className="hidden sm:block">
                <p
                  style={{
                    fontFamily: "'Cinzel', serif",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: scrolled ? P : "#fff",
                    letterSpacing: "0.16em",
                    lineHeight: 1.1,
                  }}
                >
                  OLYMPIA
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 7.5,
                    fontWeight: 700,
                    color: G,
                    letterSpacing: "0.22em",
                  }}
                >
                  PAGAMENTOS
                </p>
              </div>
            </a>

            <div className="ml-5 hidden items-center gap-0.5 lg:flex">
              {[
                "Soluções",
                "Boleto & PIX",
                "Contas a Pagar",
                "Integrações",
                "Preços",
                "Blog",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                  style={{
                    color: scrolled ? "#374151" : "rgba(255,255,255,0.85)",
                    textDecoration: "none",
                  }}
                >
                  {item}
                </a>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="hidden rounded-lg px-4 py-2 text-sm font-semibold transition-all hover:bg-white/10 sm:block"
                style={{
                  color: scrolled ? P : "rgba(255,255,255,0.85)",
                  fontFamily: "'Inter', sans-serif",
                }}
              >
                Entrar
              </button>
              <button
                onClick={() => navigate("/login")}
                className="ol-btn-gold flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-bold"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  animation: "ol-pulse-g 3s 2s ease infinite",
                }}
              >
                Criar conta grátis <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
                onClick={() => {
                  setMobileOpen(!mobileOpen);
                }}
              >
                {mobileOpen ? (
                  <X
                    className="h-5 w-5"
                    style={{ color: scrolled ? P : "#fff" }}
                  />
                ) : (
                  <Menu
                    className="h-5 w-5"
                    style={{ color: scrolled ? P : "#fff" }}
                  />
                )}
              </button>
            </div>
          </nav>

          {mobileOpen && (
            <div
              className="space-y-1 border-t px-5 py-4 lg:hidden"
              style={{ background: "#fff", borderColor: "#E2E8F0" }}
            >
              {[
                "Soluções",
                "Boleto & PIX",
                "Contas a Pagar",
                "Integrações",
                "Preços",
                "Blog",
              ].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-slate-50"
                  style={{ color: "#374151", textDecoration: "none" }}
                >
                  {item}
                </a>
              ))}
              <div className="flex gap-2 pt-3">
                <button
                  onClick={() => navigate("/login")}
                  className="flex-1 rounded-xl border py-2.5 text-sm font-bold"
                  style={{ borderColor: P, color: P }}
                >
                  Entrar
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="ol-btn-gold flex-1 rounded-xl py-2.5 text-sm font-bold"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Criar conta
                </button>
              </div>
            </div>
          )}
        </header>

        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <section
          className="relative flex min-h-screen items-center overflow-hidden pt-28 pb-20"
          style={{
            background: `linear-gradient(168deg, #07111E 0%, #0F1F35 18%, ${P} 38%, #3A5878 62%, #C8B9A4 82%, ${IV} 100%)`,
          }}
        >
          {/* Particle network */}
          <ParticleCanvas />

          {/* Subtle radial glow */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute top-1/3 left-1/2 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-15"
              style={{ background: G, filter: "blur(100px)" }}
            />
          </div>

          <div className="relative z-10 mx-auto w-full max-w-7xl px-5">
            <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
              {/* Copy */}
              <div>
                {/* Badge */}
                <div
                  className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                  style={{
                    background: "rgba(200,169,107,0.12)",
                    border: `1px solid rgba(200,169,107,0.35)`,
                  }}
                >
                  <div
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: G }}
                  />
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 11,
                      fontWeight: 800,
                      color: G,
                      letterSpacing: "0.12em",
                    }}
                  >
                    PLATAFORMA FINANCEIRA BRASILEIRA
                  </span>
                </div>

                {/* Typing headline */}
                <TypingHeadline />

                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 16.5,
                    lineHeight: 1.7,
                    color: "rgba(200,215,235,0.88)",
                    marginBottom: 34,
                    maxWidth: 520,
                  }}
                >
                  Conecte seu ERP aos bancos via API e deixe nossa IA nativa
                  cuidar de tudo: auditoria financeira automática, conciliação
                  instantânea, previsão de fluxo de caixa e cobranças
                  inteligentes. Mais agilidade. Zero erro manual. Auditoria
                  confiável.
                </p>

                {/* CTAs */}
                <div className="mb-10 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="ol-btn-gold flex items-center gap-2 rounded-xl px-7 py-4 text-base font-bold"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}
                  >
                    Testar IA nas minhas cobranças agora
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      setVideoOpen(true);
                    }}
                    className="ol-btn-glass flex items-center gap-2.5 rounded-xl px-6 py-4 text-base font-semibold"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}
                  >
                    <div
                      className="flex h-7 w-7 items-center justify-center rounded-full"
                      style={{ background: G }}
                    >
                      <Play className="ml-0.5 h-3 w-3" style={{ color: P }} />
                    </div>
                    Ver demonstração de 60 segundos
                  </button>
                </div>

                {/* Trust strip */}
                <div className="mb-6 flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[PHOTO_A, PHOTO_B, PHOTO_C, PHOTO_D].map((p, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 overflow-hidden rounded-full"
                        style={{ border: `2px solid ${G}` }}
                      >
                        <ImageWithFallback
                          src={p}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className="h-3 w-3 fill-current"
                            style={{ color: G }}
                          />
                        ))}
                    </div>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12,
                        color: "rgba(200,215,235,0.7)",
                      }}
                    >
                      +15.347 empresas já aceleraram o financeiro com IA
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {[
                    "Sem taxa de adesão",
                    "Sem cartão de crédito",
                    "Cancelamento quando quiser",
                  ].map((t) => (
                    <div key={t} className="flex items-center gap-1">
                      <CheckCircle
                        className="h-3.5 w-3.5"
                        style={{ color: "#22C55E" }}
                      />
                      <span
                        style={{
                          color: "rgba(200,215,235,0.65)",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {t}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Partner badges */}
                <div
                  className="mt-7 pt-6"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      color: "rgba(200,215,235,0.4)",
                      marginBottom: 10,
                    }}
                  >
                    INTEGRADO COM
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Itaú",
                      "Nubank",
                      "Bradesco",
                      "Open Finance",
                      "Receita Federal",
                      "LGPD",
                    ].map((b) => (
                      <span
                        key={b}
                        className="rounded-lg px-3 py-1 text-xs font-semibold"
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "rgba(200,215,235,0.55)",
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="ol-float relative hidden lg:block">
                <div
                  className="overflow-hidden rounded-3xl"
                  style={{
                    boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,169,107,0.2)`,
                    border: `1.5px solid rgba(200,169,107,0.25)`,
                  }}
                >
                  <ImageWithFallback
                    src={DASH_IMG}
                    alt="Dashboard"
                    className="w-full object-cover"
                    style={{ height: 420 }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(180deg, rgba(31,58,95,0.08) 0%, rgba(31,58,95,0.55) 100%)`,
                    }}
                  />
                  {/* KPIs overlay */}
                  <div className="absolute right-3 bottom-4 left-3 grid grid-cols-3 gap-2">
                    {[
                      {
                        label: "Recebido Hoje",
                        value: "R$ 84.200",
                        color: "#22C55E",
                      },
                      { label: "A Receber 30d", value: "R$ 342.000", color: G },
                      {
                        label: "Taxa Inadimp.",
                        value: "2,1%",
                        color: "#FF6B6B",
                      },
                    ].map((k) => (
                      <div
                        key={k.label}
                        className="rounded-xl p-3"
                        style={{
                          background: "rgba(8,18,32,0.85)",
                          backdropFilter: "blur(14px)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "'Montserrat', sans-serif",
                            fontSize: 14,
                            fontWeight: 800,
                            color: k.color,
                          }}
                        >
                          {k.value}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 9.5,
                            color: "#6B8BAF",
                          }}
                        >
                          {k.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Bolepix badge */}
                <div
                  className="absolute -top-5 -right-5 rounded-2xl p-3.5"
                  style={{
                    background: "#0D1E35",
                    border: `1.5px solid rgba(200,169,107,0.45)`,
                    boxShadow: `0 0 30px rgba(200,169,107,0.18)`,
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-xl"
                      style={{ background: "rgba(0,144,122,0.15)" }}
                    >
                      <QrCode
                        className="h-5 w-5"
                        style={{ color: "#00907A" }}
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        Bolepix emitido
                      </p>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10,
                          color: "#22C55E",
                        }}
                      >
                        ✓ Pago via Pix · agora
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PROBLEMA × SOLUÇÃO
        ═══════════════════════════════════════════ */}
        <section className="marble-bg py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="ol-reveal mb-14 text-center">
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 900,
                  color: P,
                  marginBottom: 10,
                }}
              >
                Chega de planilhas, erros e auditorias
                <br />
                que tomam dias
              </h2>
            </div>
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-3">
              {/* Without */}
              <Card3D
                className="rounded-3xl border-2 p-6"
                style={{ background: "#FEF2F2", borderColor: "#FECACA" }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: "#FEE2E2" }}
                >
                  <X className="h-5 w-5" style={{ color: "#EF4444" }} />
                </div>
                <p
                  className="mb-4 text-xs font-bold tracking-widest uppercase"
                  style={{
                    color: "#EF4444",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Sem Olympia
                </p>
                <ul className="space-y-3">
                  {[
                    "Conciliação manual e lenta",
                    "Auditoria financeira demorada e sujeita a erro humano",
                    "Fluxo de caixa sem previsão confiável",
                    "Cobranças perdidas por falta de agilidade",
                    "Horas perdidas toda semana",
                  ].map((t) => (
                    <li key={t} className="flex items-center gap-2">
                      <X
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "#EF4444" }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          color: "#7F1D1D",
                        }}
                      >
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card3D>

              {/* Arrow */}
              <div className="ol-reveal flex flex-col items-center gap-3 py-4">
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    background: P,
                    boxShadow: `0 8px 28px rgba(31,58,95,0.3)`,
                  }}
                >
                  <ArrowRight className="h-7 w-7 text-white" />
                </div>
                <span
                  style={{
                    fontFamily: "'Montserrat', sans-serif",
                    fontSize: 13,
                    fontWeight: 800,
                    color: P,
                    letterSpacing: "0.08em",
                  }}
                >
                  TRANSFORME AGORA
                </span>
              </div>

              {/* With */}
              <Card3D
                className="rounded-3xl border-2 p-6"
                style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl"
                  style={{ background: "#DCFCE7" }}
                >
                  <CheckCircle
                    className="h-5 w-5"
                    style={{ color: "#16A34A" }}
                  />
                </div>
                <p
                  className="mb-4 text-xs font-bold tracking-widest uppercase"
                  style={{
                    color: "#16A34A",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  Com Olympia + IA
                </p>
                <ul className="space-y-3">
                  {[
                    "Auditoria financeira automática com IA em segundos",
                    "Conciliação instantânea via IA + Open Finance",
                    "Previsão de caixa com 95%+ de precisão",
                    "Cobranças automáticas e inteligentes",
                    "Redução de até 85% no tempo de auditoria e reconciliação",
                  ].map((t) => (
                    <li key={t} className="flex items-start gap-2">
                      <CheckCircle
                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                        style={{ color: "#16A34A" }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          color: "#14532D",
                        }}
                      >
                        {t}
                      </span>
                    </li>
                  ))}
                </ul>
              </Card3D>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            BOLETO + PIX — BENEFÍCIOS
        ═══════════════════════════════════════════ */}
        <section className="py-24" style={{ background: "#fff" }}>
          <div className="mx-auto max-w-6xl px-5">
            <div className="ol-reveal mb-14 text-center">
              <div
                className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5"
                style={{
                  background: `rgba(200,169,107,0.1)`,
                  border: `1px solid rgba(200,169,107,0.3)`,
                }}
              >
                <Zap className="h-3.5 w-3.5" style={{ color: G }} />
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    color: G,
                    letterSpacing: "0.12em",
                  }}
                >
                  DIFERENCIAL COMPETITIVO
                </span>
              </div>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 900,
                  color: P,
                }}
              >
                IA nativa que audita, agiliza e otimiza
                <br />
                seu financeiro
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  Icon: QrCode,
                  color: "#00907A",
                  bg: "#F0FDFB",
                  title: "Boleto registrado com excelência",
                  desc: "Emissão automática via ERP com IA que valida dados em tempo real e registra instantaneamente.",
                  delay: "d1",
                },
                {
                  Icon: Zap,
                  color: G,
                  bg: "#FDF8EE",
                  title: "Bolepix – pagamento instantâneo",
                  desc: "PIX automático gerado pela IA com conciliação imediata e zero intervenção manual.",
                  delay: "d2",
                },
                {
                  Icon: MessageSquare,
                  color: "#22C55E",
                  bg: "#F0FDF4",
                  title: "Régua de cobrança inteligente",
                  desc: "IA analisa o perfil do cliente e envia lembretes personalizados no momento ideal (WhatsApp, e-mail, SMS).",
                  delay: "d3",
                },
                {
                  Icon: RefreshCw,
                  color: P,
                  bg: "#EEF2F9",
                  title: "Conciliação automática",
                  desc: "IA cruza ERP, bancos e documentos em tempo real com 99,9% de acerto automático.",
                  delay: "d4",
                },
              ].map((c) => (
                <Card3D
                  key={c.title}
                  className={`ol-reveal rounded-3xl border p-6 transition-shadow hover:shadow-lg ${c.delay}`}
                  style={{ borderColor: "#E2E8F0", background: "#fff" }}
                >
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: c.bg }}
                  >
                    <c.Icon className="h-6 w-6" style={{ color: c.color }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: "#1E293B",
                      marginBottom: 8,
                    }}
                  >
                    {c.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      color: "#64748B",
                      lineHeight: 1.65,
                    }}
                  >
                    {c.desc}
                  </p>
                </Card3D>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FUNCIONALIDADES — GRID 6
        ═══════════════════════════════════════════ */}
        <section className="marble-bg py-24">
          <div className="mx-auto max-w-6xl px-5">
            <div className="ol-reveal mb-14 text-center">
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 900,
                  color: P,
                  marginBottom: 10,
                }}
              >
                Uma plataforma completa com IA para quem quer
                <br />
                velocidade e auditoria impecável
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  Icon: QrCode,
                  color: "#00907A",
                  bg: "#F0FDFB",
                  title: "Boleto + Bolepix",
                  desc: "IA que emite, registra e concilia automaticamente com máxima eficiência.",
                  badge: "Destaque",
                  delay: "d1",
                },
                {
                  Icon: Zap,
                  color: G,
                  bg: "#FDF8EE",
                  title: "PIX Cobrança e Pix Automático",
                  desc: "Cobranças recorrentes com consentimento único e IA que gerencia todo o ciclo.",
                  badge: null,
                  delay: "d2",
                },
                {
                  Icon: CreditCard,
                  color: "#6B4BAF",
                  bg: "#F5F1FF",
                  title: "Contas a Pagar com aprovação",
                  desc: "IA sugere pagamentos, detecta duplicidades e aprova em lote com workflow seguro.",
                  badge: null,
                  delay: "d3",
                },
                {
                  Icon: BarChart3,
                  color: P,
                  bg: "#EEF2F9",
                  title: "Dashboard de Fluxo de Caixa",
                  desc: "Visão completa com previsões automáticas geradas pela IA em tempo real.",
                  badge: null,
                  delay: "d1",
                },
                {
                  Icon: Landmark,
                  color: "#0891B2",
                  bg: "#F0FDFE",
                  title: "Open Finance + CNAB",
                  desc: "Conexão direta com bancos via Open Finance e IA que processa CNAB sozinho.",
                  badge: null,
                  delay: "d2",
                },
                {
                  Icon: Users,
                  color: "#22C55E",
                  bg: "#F0FDF4",
                  title: "Portal do Cliente",
                  desc: "Autoatendimento inteligente com IA que responde dúvidas e facilita a quitação.",
                  badge: null,
                  delay: "d3",
                },
              ].map((f) => (
                <Card3D
                  key={f.title}
                  className={`group ol-reveal relative rounded-3xl border bg-white p-6 ${f.delay}`}
                  style={{ borderColor: "#E2E8F0" }}
                >
                  {f.badge && (
                    <div className="absolute -top-3.5 left-5">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{
                          background: G,
                          color: P,
                          fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {f.badge}
                      </span>
                    </div>
                  )}
                  <div
                    className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{ background: f.bg }}
                  >
                    <f.Icon className="h-6 w-6" style={{ color: f.color }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 14.5,
                      fontWeight: 800,
                      color: "#1E293B",
                      marginBottom: 8,
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      color: "#64748B",
                      lineHeight: 1.65,
                    }}
                  >
                    {f.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        fontWeight: 600,
                        color: G,
                      }}
                    >
                      Saiba mais
                    </span>
                    <ArrowRight className="h-3.5 w-3.5" style={{ color: G }} />
                  </div>
                </Card3D>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            RESULTADOS REAIS
        ═══════════════════════════════════════════ */}
        <section className="py-24" style={{ background: P }}>
          <div className="relative mx-auto max-w-5xl px-5">
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute top-0 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full opacity-10"
                style={{ background: G, filter: "blur(80px)" }}
              />
            </div>
            <div className="ol-reveal relative mb-14 text-center">
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 800,
                  color: G,
                  letterSpacing: "0.15em",
                  marginBottom: 10,
                }}
              >
                RESULTADOS DOS NOSSOS CLIENTES
              </p>
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 900,
                  color: "#FFFFFF",
                }}
              >
                Resultados que a IA está entregando
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
              {[
                {
                  end: 85,
                  prefix: "-",
                  suffix: "%",
                  label: "No tempo de auditoria e conciliação",
                  sub: "Com IA que cruza ERP, bancos e documentos em segundos",
                  Icon: TrendingUp,
                  color: "#22C55E",
                },
                {
                  end: 150,
                  prefix: "-",
                  suffix: "h",
                  label: "Economizadas por mês em tarefas manuais",
                  sub: "A IA elimina o trabalho repetitivo do financeiro",
                  Icon: Clock,
                  color: G,
                },
                {
                  end: 98,
                  prefix: "+",
                  suffix: "%",
                  label: "De precisão na previsão de fluxo de caixa",
                  sub: "Modelos de IA que aprendem com seu histórico",
                  Icon: BarChart3,
                  color: "#60A5FA",
                },
              ].map((s, i) => (
                <div
                  key={s.label}
                  className={`ol-reveal rounded-3xl p-8 text-center d${i + 1}`}
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <div
                    className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                    style={{
                      background: `${s.color}15`,
                      border: `1px solid ${s.color}35`,
                    }}
                  >
                    <s.Icon className="h-6 w-6" style={{ color: s.color }} />
                  </div>
                  <div
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: "clamp(42px,6vw,64px)",
                      fontWeight: 900,
                      color: G,
                      lineHeight: 1,
                    }}
                  >
                    <StatNum end={s.end} suffix={s.suffix} prefix={s.prefix} />
                  </div>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14.5,
                      fontWeight: 700,
                      color: "#FFFFFF",
                      margin: "10px 0 5px",
                    }}
                  >
                    {s.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 12,
                      color: "#6B8BAF",
                    }}
                  >
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>
            <div className="ol-reveal mt-10 text-center">
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 14.5,
                  color: "rgba(200,215,235,0.6)",
                  fontStyle: "italic",
                }}
              >
                "A IA da Olympia audita nossos recebíveis sozinha e devolveu 3
                dias úteis da nossa equipe financeira por mês. É absurdo o
                quanto agiliza tudo."
              </p>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 12,
                  color: "rgba(200,215,235,0.4)",
                  marginTop: 5,
                }}
              >
                — Ana Clara Mendes, Sócia – Mendes Contabilidade, Campinas/SP
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            DEPOIMENTOS
        ═══════════════════════════════════════════ */}
        <section className="marble-bg py-24">
          <div className="mx-auto max-w-4xl px-5">
            <div className="ol-reveal mb-14 text-center">
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 900,
                  color: P,
                }}
              >
                A opinião de quem já elevou
                <br />
                seu padrão financeiro
              </h2>
            </div>

            <div className="ol-reveal relative">
              {/* Card */}
              <div
                className="relative overflow-hidden rounded-3xl p-8 md:p-10"
                style={{
                  background: "#fff",
                  border: `1.5px solid rgba(200,169,107,0.35)`,
                  boxShadow: `0 20px 60px rgba(200,169,107,0.10), 0 4px 24px rgba(31,58,95,0.08)`,
                }}
              >
                {/* Gold accent top-left */}
                <div
                  className="absolute top-0 left-0 h-1 w-32 rounded-r-full"
                  style={{
                    background: `linear-gradient(90deg, ${G}, transparent)`,
                  }}
                />
                <div
                  className="absolute top-0 left-0 h-32 w-1 rounded-b-full"
                  style={{
                    background: `linear-gradient(180deg, ${G}, transparent)`,
                  }}
                />

                <div className="mb-6 flex gap-1">
                  {Array(testimonials[slide].stars)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-current"
                        style={{ color: G }}
                      />
                    ))}
                </div>
                <blockquote
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 18,
                    lineHeight: 1.75,
                    color: "#1E293B",
                    fontStyle: "italic",
                    marginBottom: 28,
                  }}
                >
                  "{testimonials[slide].text}"
                </blockquote>
                <div className="flex items-center gap-3.5">
                  <div
                    className="h-13 w-13 flex-shrink-0 overflow-hidden rounded-full"
                    style={{ width: 52, height: 52, border: `2px solid ${G}` }}
                  >
                    <ImageWithFallback
                      src={testimonials[slide].photo}
                      alt={testimonials[slide].name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: "#1E293B",
                      }}
                    >
                      {testimonials[slide].name}
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        color: "#64748B",
                      }}
                    >
                      {testimonials[slide].role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <div className="mt-7 flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setSlide(
                      (s) =>
                        (s - 1 + testimonials.length) % testimonials.length,
                    );
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:border-[#C8A96B]"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <ChevronLeft
                    className="h-4 w-4"
                    style={{ color: "#64748B" }}
                  />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setSlide(i);
                      }}
                      className="rounded-full transition-all duration-300"
                      style={{
                        width: i === slide ? 26 : 8,
                        height: 8,
                        background: i === slide ? G : "#CBD5E1",
                      }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                    setSlide((s) => (s + 1) % testimonials.length);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border transition-all hover:border-[#C8A96B]"
                  style={{ borderColor: "#E2E8F0" }}
                >
                  <ChevronRight
                    className="h-4 w-4"
                    style={{ color: "#64748B" }}
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            COMO FUNCIONA — 3 PASSOS
        ═══════════════════════════════════════════ */}
        <section className="py-24" style={{ background: "#fff" }}>
          <div className="mx-auto max-w-5xl px-5">
            <div className="ol-reveal mb-16 text-center">
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 900,
                  color: P,
                  marginBottom: 10,
                }}
              >
                Três passos para colocar IA
                <br />
                no seu financeiro
              </h2>
            </div>

            <div className="relative grid grid-cols-1 gap-6 md:grid-cols-3">
              <StepConnector />
              {[
                {
                  n: "01",
                  Icon: Building2,
                  title: "Cadastre sua empresa com CNPJ e conecte seu ERP",
                  sub: "Validação automática em segundos",
                  delay: "d1",
                },
                {
                  n: "02",
                  Icon: FileText,
                  title:
                    "Ative a IA e configure as regras de auditoria e automação",
                  sub: "Setup guiado, sem fricção",
                  delay: "d2",
                },
                {
                  n: "03",
                  Icon: CheckCircle,
                  title: "Acompanhe tudo em tempo real — a IA cuida do resto",
                  sub: "Você ganha tempo, previsibilidade e paz no financeiro",
                  delay: "d3",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className={`ol-reveal relative rounded-3xl border bg-white p-8 text-center ${s.delay}`}
                  style={{
                    borderColor: "#E2E8F0",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
                  }}
                >
                  {/* Gold step circle */}
                  <div
                    className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full"
                    style={{
                      background: G,
                      boxShadow: `0 4px 16px rgba(200,169,107,0.4)`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Montserrat', sans-serif",
                        fontSize: 13,
                        fontWeight: 900,
                        color: P,
                      }}
                    >
                      {s.n}
                    </span>
                  </div>
                  <div
                    className="mx-auto mt-5 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
                    style={{ background: "#EEF2F9" }}
                  >
                    <s.Icon className="h-7 w-7" style={{ color: P }} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 15,
                      fontWeight: 800,
                      color: "#1E293B",
                      marginBottom: 8,
                    }}
                  >
                    {s.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      color: "#64748B",
                    }}
                  >
                    {s.sub}
                  </p>
                </div>
              ))}
            </div>

            <div className="ol-reveal mt-12 text-center">
              <button
                onClick={() => navigate("/login")}
                className="ol-btn-gold inline-flex items-center gap-2 rounded-xl px-8 py-4 text-base font-bold"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}
              >
                Quero começar agora <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PREÇOS
        ═══════════════════════════════════════════ */}
        <section className="marble-bg py-24">
          <div className="mx-auto max-w-5xl px-5">
            <div className="ol-reveal mb-14 text-center">
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(22px,3vw,36px)",
                  fontWeight: 900,
                  color: P,
                  marginBottom: 10,
                }}
              >
                Investimento justo para quem valoriza
                <br />
                controle e sofisticação
              </h2>
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 16,
                  lineHeight: 1.6,
                  color: "#475569",
                  marginTop: 18,
                  maxWidth: 680,
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Escolha o plano ideal e coloque IA nativa para trabalhar no seu
                financeiro. Auditoria automática, conciliação instantânea e
                previsão de caixa com precisão que só a inteligência artificial
                entrega.
              </p>
            </div>

            <div className="ol-reveal grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* Starter */}
              <Card3D
                className="rounded-3xl border bg-white p-7"
                style={{ borderColor: "#E2E8F0" }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    color: "#94A3B8",
                    marginBottom: 8,
                  }}
                >
                  STARTER
                </p>
                <div className="mb-2 flex items-end gap-1">
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 42,
                      fontWeight: 900,
                      color: "#1E293B",
                      lineHeight: 1,
                    }}
                  >
                    R$ 197
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      color: "#64748B",
                      paddingBottom: 5,
                    }}
                  >
                    /mês
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    color: "#94A3B8",
                    marginBottom: 22,
                  }}
                >
                  Perfeito para quem está começando a automatizar
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Até 300 cobranças/mês",
                    "IA básica de conciliação e auditoria",
                    "Dashboard de fluxo de caixa",
                    "Suporte por e-mail",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "#16A34A" }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13.5,
                          color: "#374151",
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/login")}
                  className="w-full rounded-xl border-2 py-3 font-bold transition-all hover:bg-slate-50"
                  style={{
                    borderColor: P,
                    color: P,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                  }}
                >
                  Começar grátis
                </button>
              </Card3D>

              {/* Pro – featured */}
              <Card3D
                className="relative rounded-3xl border-2 p-7"
                style={{
                  background: "#fff",
                  borderColor: G,
                  boxShadow: `0 20px 60px rgba(200,169,107,0.18)`,
                }}
              >
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span
                    className="rounded-full px-4 py-1.5 text-xs font-bold"
                    style={{
                      background: G,
                      color: P,
                      fontFamily: "'Inter', sans-serif",
                    }}
                  >
                    MAIS ESCOLHIDO
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    color: G,
                    marginBottom: 8,
                  }}
                >
                  PRO
                </p>
                <div className="mb-2 flex items-end gap-1">
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 42,
                      fontWeight: 900,
                      color: P,
                      lineHeight: 1,
                    }}
                  >
                    R$ 497
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 14,
                      color: "#64748B",
                      paddingBottom: 5,
                    }}
                  >
                    /mês
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    color: "#475569",
                    marginBottom: 22,
                  }}
                >
                  IA completa para empresas que querem velocidade e controle
                  total
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Cobranças ilimitadas",
                    "IA avançada de auditoria, régua inteligente e previsões",
                    "Conciliação automática com 99,9% de acerto",
                    "Workflow de aprovação de pagamentos",
                    "Suporte prioritário + assistente IA",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: "#16A34A" }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13.5,
                          color: "#374151",
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/login")}
                  className="ol-btn-gold flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 14 }}
                >
                  Começar agora <ArrowRight className="h-4 w-4" />
                </button>
              </Card3D>

              {/* Enterprise */}
              <Card3D
                className="rounded-3xl border p-7"
                style={{ background: P, borderColor: "#274872" }}
              >
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    color: G,
                    marginBottom: 8,
                  }}
                >
                  ENTERPRISE
                </p>
                <div className="mb-2 flex items-end gap-1">
                  <span
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 28,
                      fontWeight: 900,
                      color: "#FFFFFF",
                      lineHeight: 1.2,
                    }}
                  >
                    Sob consulta
                  </span>
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13,
                    color: "rgba(200,215,235,0.75)",
                    paddingBottom: 0,
                    marginBottom: 22,
                    lineHeight: 1.5,
                  }}
                >
                  IA dedicada, integrações sob medida e SLA premium para grandes
                  operações
                </p>
                <ul className="mb-8 space-y-3">
                  {[
                    "Tudo do Pro + IA personalizada para seu negócio",
                    "Integrações sob medida (SAP, Totvs, Oracle)",
                    "Multi-empresa e multi-CNPJ ilimitados",
                    "Gerente de contas dedicado + onboarding IA",
                    "SLA 99,95% garantido + SSO/MFA avançado",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle
                        className="h-4 w-4 flex-shrink-0"
                        style={{ color: G }}
                      />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 13.5,
                          color: "rgba(200,215,235,0.85)",
                        }}
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-bold transition-all"
                  style={{
                    background: "rgba(200,169,107,0.15)",
                    border: `1.5px solid ${G}`,
                    color: G,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(200,169,107,0.25)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(200,169,107,0.15)")
                  }
                >
                  <PhoneCall className="h-4 w-4" />
                  Falar com especialista
                </button>
              </Card3D>
            </div>

            <p
              className="ol-reveal mt-8 text-center"
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 13.5,
                color: "#94A3B8",
              }}
            >
              Garantia: Teste grátis por 30 dias. Cancele quando quiser. Sem
              multa.
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FAQ
        ═══════════════════════════════════════════ */}
        <section className="py-24" style={{ background: "#fff" }}>
          <div className="mx-auto max-w-2xl px-5">
            <div className="ol-reveal mb-12 text-center">
              <h2
                style={{
                  fontFamily: "'Montserrat', sans-serif",
                  fontSize: "clamp(22px,3vw,34px)",
                  fontWeight: 900,
                  color: P,
                  marginBottom: 10,
                }}
              >
                Perguntas frequentes
              </h2>
            </div>
            <div className="ol-reveal space-y-3">
              {faqs.map((f, i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-2xl border transition-all"
                  style={{
                    borderColor: faqOpen === i ? G : "#E2E8F0",
                    boxShadow: faqOpen === i ? `0 0 0 1px ${G}` : "none",
                  }}
                >
                  <button
                    onClick={() => {
                      setFaqOpen(faqOpen === i ? null : i);
                    }}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
                  >
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 14.5,
                        fontWeight: 600,
                        color: "#1E293B",
                      }}
                    >
                      {f.q}
                    </span>
                    {faqOpen === i ? (
                      <ChevronUp
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: G }}
                      />
                    ) : (
                      <ChevronDown
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: "#94A3B8" }}
                      />
                    )}
                  </button>
                  {faqOpen === i && (
                    <div className="px-5 pb-5">
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 14,
                          color: "#64748B",
                          lineHeight: 1.75,
                        }}
                      >
                        {f.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            CTA FINAL (pre-footer)
        ═══════════════════════════════════════════ */}
        <section
          className="relative overflow-hidden py-24"
          style={{
            background: `linear-gradient(145deg, #07111E 0%, ${P} 45%, #3A5878 80%, #C8B9A4 100%)`,
          }}
        >
          <ParticleCanvas />
          <div className="ol-reveal relative z-10 mx-auto max-w-3xl px-5 text-center">
            <div
              className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{
                background: "rgba(200,169,107,0.12)",
                border: `1.5px solid ${G}`,
                boxShadow: `0 0 32px rgba(200,169,107,0.25)`,
              }}
            >
              <span
                style={{
                  fontFamily: "'Cinzel', serif",
                  fontSize: 26,
                  fontWeight: 700,
                  color: G,
                }}
              >
                O
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "clamp(24px,3.5vw,44px)",
                fontWeight: 900,
                color: "#FFFFFF",
                marginBottom: 16,
              }}
            >
              Pronto para colocar IA pra cuidar
              <br />
              do seu financeiro?
            </h2>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 17,
                color: "rgba(200,215,235,0.75)",
                marginBottom: 36,
              }}
            >
              Crie sua conta em 5 minutos e veja a IA da Olympia operar em tempo
              real. Sem cartão. Sem burocracia. Resultado já no primeiro dia.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <button
                onClick={() => navigate("/login")}
                className="ol-btn-gold inline-flex items-center justify-center gap-2 rounded-xl px-8 py-4 text-base font-bold"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}
              >
                Ativar IA no meu financeiro agora{" "}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setVideoOpen(true);
                }}
                className="ol-btn-glass inline-flex items-center justify-center gap-2.5 rounded-xl px-7 py-4 text-base font-semibold"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: G }}
                >
                  <Play className="ml-0.5 h-3 w-3" style={{ color: P }} />
                </div>
                Ver demonstração
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════ */}
        <footer style={{ background: "#07111E", color: "#4B6680" }}>
          <div className="mx-auto max-w-6xl px-5 py-14">
            <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-5">
              {/* Brand */}
              <div className="col-span-2">
                <div className="mb-4 flex items-center gap-2.5">
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-xl"
                    style={{
                      background: "rgba(200,169,107,0.1)",
                      border: `1px solid ${G}`,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: 14,
                        fontWeight: 700,
                        color: G,
                      }}
                    >
                      O
                    </span>
                  </div>
                  <div>
                    <p
                      style={{
                        fontFamily: "'Cinzel', serif",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        letterSpacing: "0.16em",
                      }}
                    >
                      OLYMPIA
                    </p>
                    <p
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 7.5,
                        fontWeight: 700,
                        color: G,
                        letterSpacing: "0.22em",
                      }}
                    >
                      PAGAMENTOS
                    </p>
                  </div>
                </div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 13.5,
                    lineHeight: 1.7,
                    color: "#334155",
                    maxWidth: 240,
                  }}
                >
                  Plataforma SaaS com IA nativa para automação financeira:
                  cobranças, conciliação, auditoria e previsão de caixa em um só
                  lugar.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {[
                    { label: "LGPD", Icon: Lock },
                    { label: "ISO 27001", Icon: ShieldCheck },
                    { label: "Bacen", Icon: BadgeCheck },
                  ].map(({ label, Icon }) => (
                    <div
                      key={label}
                      className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                      }}
                    >
                      <Icon className="h-3 w-3" style={{ color: G }} />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: 10,
                          fontWeight: 700,
                          color: "#4B6680",
                        }}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {[
                {
                  title: "Produto",
                  links: [
                    "Boleto Registrado",
                    "Bolepix",
                    "Pix Cobrança",
                    "Contas a Pagar",
                    "Dashboard",
                    "Open Finance",
                    "Portal do Cliente",
                  ],
                },
                {
                  title: "Empresa",
                  links: [
                    "Sobre nós",
                    "Blog",
                    "Casos de uso",
                    "Parceiros",
                    "Carreiras",
                  ],
                },
                {
                  title: "Suporte",
                  links: [
                    "Central de Ajuda",
                    "Documentação API",
                    "Status",
                    "Contato",
                    "WhatsApp",
                  ],
                },
              ].map((col) => (
                <div key={col.title}>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 10.5,
                      fontWeight: 800,
                      letterSpacing: "0.12em",
                      color: "#ffffff",
                      marginBottom: 14,
                    }}
                  >
                    {col.title.toUpperCase()}
                  </p>
                  <ul className="space-y-2.5">
                    {col.links.map((link) => (
                      <li key={link}>
                        <a
                          href="#"
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: 13.5,
                            color: "#334155",
                            textDecoration: "none",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.color = G)
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.color = "#334155")
                          }
                        >
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div
              className="flex flex-col items-center justify-between gap-4 border-t pt-7 sm:flex-row"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12.5,
                    color: "#1E293B",
                  }}
                >
                  © Olympia Pagamentos 2026 – Todos os direitos reservados
                </p>
                <p
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11.5,
                    color: "#1A2535",
                    marginTop: 2,
                  }}
                >
                  Plataforma autorizada pelo Banco Central do Brasil
                </p>
              </div>
              <div className="flex gap-5">
                {["Privacidade", "Termos de Uso", "Cookies", "LGPD"].map(
                  (l) => (
                    <a
                      key={l}
                      href="#"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        fontSize: 12.5,
                        color: "#1E293B",
                        textDecoration: "none",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = G)}
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = "#1E293B")
                      }
                    >
                      {l}
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>
        </footer>

        {/* ═══════════════════════════════════════════
            VIDEO MODAL
        ═══════════════════════════════════════════ */}
        {videoOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            style={{ backdropFilter: "blur(6px)" }}
            onClick={() => {
              setVideoOpen(false);
            }}
          >
            <div
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl"
              style={{
                border: `1.5px solid rgba(200,169,107,0.35)`,
                boxShadow: `0 40px 80px rgba(0,0,0,0.6)`,
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <button
                onClick={() => {
                  setVideoOpen(false);
                }}
                className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full"
                style={{
                  background: "rgba(0,0,0,0.6)",
                  border: "1px solid rgba(255,255,255,0.2)",
                }}
              >
                <X className="h-4 w-4 text-white" />
              </button>
              <div
                className="flex aspect-video items-center justify-center"
                style={{ background: P }}
              >
                <div className="text-center">
                  <div
                    className="mx-auto mb-4 flex h-18 w-18 items-center justify-center rounded-full"
                    style={{
                      width: 72,
                      height: 72,
                      background: G,
                      boxShadow: `0 0 40px rgba(200,169,107,0.5)`,
                    }}
                  >
                    <Play className="ml-1 h-9 w-9" style={{ color: P }} />
                  </div>
                  <p
                    style={{
                      fontFamily: "'Montserrat', sans-serif",
                      fontSize: 18,
                      fontWeight: 800,
                      color: "#fff",
                    }}
                  >
                    Demonstração de 60 segundos
                  </p>
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: 13.5,
                      color: "#6B8BAF",
                      marginTop: 6,
                    }}
                  >
                    Conecte seu vídeo real neste espaço
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
