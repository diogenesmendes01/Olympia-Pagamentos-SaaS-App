import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import {
  CheckCircle, Zap, FileText, QrCode, BarChart3, MessageSquare,
  ShieldCheck, ChevronDown, ChevronUp, ArrowRight, Star, Play, X,
  Menu, CreditCard, TrendingUp, Clock, RefreshCw, Bell, Building2,
  Lock, ChevronLeft, ChevronRight, Landmark, BadgeCheck, PhoneCall,
  Users, Globe, Receipt
} from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

/* ══════════════════════════════════════════════════
   BRAND TOKENS
══════════════════════════════════════════════════ */
const P  = "#1F3A5F";
const PH = "#274872";
const G  = "#C8A96B";
const GH = "#B8943A";
const IV = "#F4EFE6";

/* ══════════════════════════════════════════════════
   PHOTOS
══════════════════════════════════════════════════ */
const PHOTO_A = "https://images.unsplash.com/photo-1758691737587-7630b4d31d16?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const PHOTO_B = "https://images.unsplash.com/photo-1713947503689-d5e1d303bb4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const PHOTO_C = "https://images.unsplash.com/photo-1753161617988-c5f43e441621?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const PHOTO_D = "https://images.unsplash.com/photo-1612299273045-362a39972259?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=200";
const DASH_IMG = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=1080";

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
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const N = 55;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .45,
      vy: (Math.random() - .5) * .45,
      r: Math.random() * 1.8 + .6,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(200,169,107,.7)";
        ctx.fill();

        for (let j = i + 1; j < N; j++) {
          const q = pts[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(200,169,107,${.22 * (1 - d / 110)})`;
            ctx.lineWidth = .7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

/* ══════════════════════════════════════════════════
   TYPING HEADLINE
══════════════════════════════════════════════════ */
const LINE1 = "Boleto que reflete a confiança da sua empresa.";
const LINE2 = "Controle financeiro sofisticado, estável e previsível.";

function TypingHeadline() {
  const [txt1, setTxt1] = useState("");
  const [txt2, setTxt2] = useState("");
  const [phase, setPhase] = useState<"l1"|"l2"|"done">("l1");

  useEffect(() => {
    if (phase === "l1") {
      if (txt1.length < LINE1.length) {
        const t = setTimeout(() => setTxt1(LINE1.slice(0, txt1.length + 1)), 32);
        return () => clearTimeout(t);
      } else { setPhase("l2"); }
    }
    if (phase === "l2") {
      if (txt2.length < LINE2.length) {
        const t = setTimeout(() => setTxt2(LINE2.slice(0, txt2.length + 1)), 28);
        return () => clearTimeout(t);
      } else { setPhase("done"); }
    }
  }, [txt1, txt2, phase]);

  return (
    <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "clamp(26px,3.4vw,48px)", lineHeight: 1.18, color: "#FFFFFF", marginBottom: 22, minHeight: "3.5em" }}>
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
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
    }, { threshold: 0.12 });
    document.querySelectorAll(".ol-reveal").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  });
}

/* ══════════════════════════════════════════════════
   3D CARD
═════════════════════════════════════════��════════ */
function Card3D({ children, className = "", style = {} }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const r = ref.current!.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - .5;
    const y = (e.clientY - r.top)  / r.height - .5;
    ref.current!.style.transform = `perspective(700px) rotateX(${-y*7}deg) rotateY(${x*7}deg) translateY(-6px)`;
  }, []);
  const onLeave = useCallback(() => {
    ref.current!.style.transform = "perspective(700px) rotateX(0) rotateY(0) translateY(0)";
  }, []);
  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      className={`ol-card-3d ${className}`} style={style}>
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════
   ANIMATED STAT COUNTER
══════════════════════════════════════════════════ */
function StatNum({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      let i = 0;
      const step = end / 55;
      const t = setInterval(() => { i = Math.min(i + step, end); setN(Math.floor(i)); if (i >= end) clearInterval(t); }, 22);
      obs.disconnect();
    }, { threshold: .5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{n.toLocaleString("pt-BR")}{suffix}</span>;
}

/* ══════════════════════════════════════════════════
   SVG ANIMATED CONNECTOR
══════════════════════════════════════════════════ */
function StepConnector() {
  const ref = useRef<SVGPathElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && ref.current) {
        ref.current.style.animation = "ol-draw 1.4s ease forwards";
        obs.disconnect();
      }
    }, { threshold: .3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <svg className="hidden md:block absolute top-[52px] left-[calc(33%+24px)] right-[calc(33%+24px)]"
      style={{ height: 4, overflow: "visible", pointerEvents: "none" }}
      viewBox="0 0 100 4" preserveAspectRatio="none">
      <path ref={ref} d="M0 2 Q50 0 100 2" fill="none" stroke={G} strokeWidth="1.5"
        strokeDasharray="200" strokeDashoffset="200" style={{ transition: "none" }} />
    </svg>
  );
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [videoOpen, setVideoOpen]       = useState(false);
  const [faqOpen, setFaqOpen]           = useState<number | null>(null);
  const [slide, setSlide]               = useState(0);
  const [scrolled, setScrolled]         = useState(false);

  useScrollReveal();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  /* ── Data ── */
  const testimonials = [
    { name: "Ana Clara Mendes", role: "Sócia – Mendes Contabilidade · Campinas, SP", stars: 5, photo: PHOTO_A,
      text: "O Bolepix transformou nossa cobrança. Reduzimos a inadimplência em 70% com uma plataforma que transmite a mesma confiança que nosso escritório." },
    { name: "Rafael Costa", role: "CEO – TechStore E-commerce", stars: 5, photo: PHOTO_B,
      text: "Emito centenas de boletos por mês e tudo se concilia sozinho. Uma solução elegante e eficiente que recomendo a todo empresário." },
    { name: "Juliana Ferreira", role: "Diretora Financeira – JF Serviços", stars: 5, photo: PHOTO_C,
      text: "A Olympia Pagamentos se tornou o braço financeiro da nossa empresa. Fluxo de caixa previsível e zero dor de cabeça." },
    { name: "Carlos Eduardo Lima", role: "Sócio-Gerente – Lima Distribuidora", stars: 5, photo: PHOTO_D,
      text: "Em poucos dias, a Olympia elevou o padrão do nosso controle financeiro. A visão de 90 dias de caixa mudou completamente como tomamos decisões." },
  ];

  const faqs = [
    { q: "O boleto é registrado automaticamente?", a: "Sim. Cada boleto emitido na plataforma já é registrado automaticamente no banco sacador, com código de barras, QR Code Pix (Bolepix) e todas as regras de juros, multa e desconto configuradas, em total conformidade com as normativas do Banco Central." },
    { q: "Há taxa por boleto emitido?", a: "Não. Você paga apenas a mensalidade do plano escolhido. No Pro e Enterprise a emissão de boletos e cobranças Pix é ilimitada, sem surpresas no final do mês." },
    { q: "Funciona com qualquer banco?", a: "Sim. Via Open Finance conectamos com as principais instituições financeiras do país — Itaú, Bradesco, Nubank, Banco do Brasil, Caixa, Santander, BTG e mais de 200 bancos homologados." },
    { q: "Meu contador tem acesso?", a: "Sim. Você pode convidar o contador como usuário com perfil 'Contador Externo' — ele tem acesso somente leitura ao dashboard, relatórios e pode exportar SPED, EFD e DCTF diretamente." },
    { q: "A plataforma é segura?", a: "Totalmente. Operamos em conformidade com a LGPD, certificação ISO 27001, criptografia AES-256 em repouso e TLS 1.3 em trânsito, além de autenticação MFA obrigatória para operações financeiras." },
    { q: "Como funciona o Pix Automático recorrente?", a: "Com um único consentimento do seu cliente (via Open Finance), você agenda débitos recorrentes — ideal para mensalidades e assinaturas — sem precisar emitir um boleto novo a cada ciclo." },
    { q: "Posso cancelar a qualquer momento?", a: "Sim, sem fidelidade e sem multa. Todos os seus dados são exportáveis em CSV/Excel e JSON via API antes de encerrar a conta." },
  ];

  return (
    <>
      {/* Inject global CSS */}
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <div style={{ fontFamily: "'Inter', sans-serif", background: "#fff", overflowX: "hidden" }}>

        {/* ═══════════════════════════════════════════
            NAVBAR
        ═══════════════════════════════════════════ */}
        <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{ background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
                   boxShadow: scrolled ? "0 1px 24px rgba(0,0,0,0.09)" : "none",
                   backdropFilter: scrolled ? "blur(14px)" : "none" }}>

          {/* Main nav */}
          <nav className="flex items-center gap-3 px-5 py-3 max-w-7xl mx-auto">
            <a href="/" className="flex items-center gap-2.5 flex-shrink-0">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: P, border: `1.5px solid ${G}`, boxShadow: `0 0 12px rgba(200,169,107,0.25)` }}>
                <span style={{ fontFamily: "'Cinzel', serif", fontSize: 15, fontWeight: 700, color: G }}>O</span>
              </div>
              <div className="hidden sm:block">
                <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11.5, fontWeight: 700, color: scrolled ? P : "#fff", letterSpacing: "0.16em", lineHeight: 1.1 }}>OLYMPIA</p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 7.5, fontWeight: 700, color: G, letterSpacing: "0.22em" }}>PAGAMENTOS</p>
              </div>
            </a>

            <div className="hidden lg:flex items-center gap-0.5 ml-5">
              {["Soluções","Boleto & PIX","Contas a Pagar","Integrações","Preços","Blog"].map(item => (
                <a key={item} href="#"
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-white/10"
                  style={{ color: scrolled ? "#374151" : "rgba(255,255,255,0.85)", textDecoration: "none" }}>
                  {item}
                </a>
              ))}
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button onClick={() => navigate("/login")}
                className="hidden sm:block px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-white/10"
                style={{ color: scrolled ? P : "rgba(255,255,255,0.85)", fontFamily: "'Inter', sans-serif" }}>
                Entrar
              </button>
              <button onClick={() => navigate("/login")} className="ol-btn-gold flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold"
                style={{ fontFamily: "'Inter', sans-serif", animation: "ol-pulse-g 3s 2s ease infinite" }}>
                Criar conta grátis <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button className="lg:hidden p-2 rounded-lg hover:bg-white/10" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" style={{ color: scrolled ? P : "#fff" }} />
                            : <Menu className="w-5 h-5" style={{ color: scrolled ? P : "#fff" }} />}
              </button>
            </div>
          </nav>

          {mobileOpen && (
            <div className="lg:hidden border-t px-5 py-4 space-y-1" style={{ background: "#fff", borderColor: "#E2E8F0" }}>
              {["Soluções","Boleto & PIX","Contas a Pagar","Integrações","Preços","Blog"].map(item => (
                <a key={item} href="#" className="block px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50"
                  style={{ color: "#374151", textDecoration: "none" }}>{item}</a>
              ))}
              <div className="pt-3 flex gap-2">
                <button onClick={() => navigate("/login")} className="flex-1 py-2.5 rounded-xl text-sm font-bold border"
                  style={{ borderColor: P, color: P }}>Entrar</button>
                <button onClick={() => navigate("/login")} className="ol-btn-gold flex-1 py-2.5 rounded-xl text-sm font-bold"
                  style={{ fontFamily: "'Inter', sans-serif" }}>Criar conta</button>
              </div>
            </div>
          )}
        </header>

        {/* ═══════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════ */}
        <section className="relative min-h-screen flex items-center pt-28 pb-20 overflow-hidden"
          style={{ background: `linear-gradient(168deg, #07111E 0%, #0F1F35 18%, ${P} 38%, #3A5878 62%, #C8B9A4 82%, ${IV} 100%)` }}>

          {/* Particle network */}
          <ParticleCanvas />

          {/* Subtle radial glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-15"
              style={{ background: G, filter: "blur(100px)" }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-5 w-full z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

              {/* Copy */}
              <div>
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-7"
                  style={{ background: "rgba(200,169,107,0.12)", border: `1px solid rgba(200,169,107,0.35)` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: G }} />
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.12em" }}>
                    PLATAFORMA FINANCEIRA BRASILEIRA
                  </span>
                </div>

                {/* Typing headline */}
                <TypingHeadline />

                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 16.5, lineHeight: 1.7, color: "rgba(200,215,235,0.88)", marginBottom: 34, maxWidth: 520 }}>
                  Emita boleto registrado com Bolepix, receba com a segurança de um banco privado e tenha fluxo de caixa em tempo real. A plataforma brasileira que une tradição e tecnologia de ponta.
                </p>

                {/* CTAs */}
                <div className="flex flex-wrap gap-3 mb-10">
                  <button onClick={() => navigate("/login")} className="ol-btn-gold flex items-center gap-2 px-7 py-4 rounded-xl font-bold text-base"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}>
                    Criar minha conta grátis (30 dias ilimitados)
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button onClick={() => setVideoOpen(true)} className="ol-btn-glass flex items-center gap-2.5 px-6 py-4 rounded-xl font-semibold text-base"
                    style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: G }}>
                      <Play className="w-3 h-3 ml-0.5" style={{ color: P }} />
                    </div>
                    Ver demonstração de 60 segundos
                  </button>
                </div>

                {/* Trust strip */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex -space-x-2">
                    {[PHOTO_A, PHOTO_B, PHOTO_C, PHOTO_D].map((p, i) => (
                      <div key={i} className="w-8 h-8 rounded-full overflow-hidden" style={{ border: `2px solid ${G}` }}>
                        <ImageWithFallback src={p} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex gap-0.5">{Array(5).fill(0).map((_, i) => <Star key={i} className="w-3 h-3 fill-current" style={{ color: G }} />)}</div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(200,215,235,0.7)" }}>+15.347 empresas já confiam na Olympia</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs">
                  {["Sem taxa de adesão", "Sem cartão de crédito", "Cancelamento quando quiser"].map(t => (
                    <div key={t} className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" style={{ color: "#22C55E" }} />
                      <span style={{ color: "rgba(200,215,235,0.65)", fontFamily: "'Inter', sans-serif" }}>{t}</span>
                    </div>
                  ))}
                </div>

                {/* Partner badges */}
                <div className="mt-7 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", color: "rgba(200,215,235,0.4)", marginBottom: 10 }}>INTEGRADO COM</p>
                  <div className="flex flex-wrap gap-2">
                    {["Itaú", "Nubank", "Bradesco", "Open Finance", "Receita Federal", "LGPD"].map(b => (
                      <span key={b} className="px-3 py-1 rounded-lg text-xs font-semibold"
                        style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(200,215,235,0.55)", fontFamily: "'Inter', sans-serif" }}>
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dashboard mockup */}
              <div className="relative hidden lg:block ol-float">
                <div className="rounded-3xl overflow-hidden" style={{
                  boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 0 1px rgba(200,169,107,0.2)`,
                  border: `1.5px solid rgba(200,169,107,0.25)`,
                }}>
                  <ImageWithFallback src={DASH_IMG} alt="Dashboard" className="w-full object-cover" style={{ height: 420 }} />
                  <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(31,58,95,0.08) 0%, rgba(31,58,95,0.55) 100%)` }} />
                  {/* KPIs overlay */}
                  <div className="absolute bottom-4 left-3 right-3 grid grid-cols-3 gap-2">
                    {[
                      { label: "Recebido Hoje",  value: "R$ 84.200",  color: "#22C55E" },
                      { label: "A Receber 30d",  value: "R$ 342.000", color: G },
                      { label: "Taxa Inadimp.",  value: "2,1%",       color: "#FF6B6B" },
                    ].map(k => (
                      <div key={k.label} className="rounded-xl p-3"
                        style={{ background: "rgba(8,18,32,0.85)", backdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14, fontWeight: 800, color: k.color }}>{k.value}</p>
                        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 9.5, color: "#6B8BAF" }}>{k.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Bolepix badge */}
                <div className="absolute -top-5 -right-5 rounded-2xl p-3.5"
                  style={{ background: "#0D1E35", border: `1.5px solid rgba(200,169,107,0.45)`, boxShadow: `0 0 30px rgba(200,169,107,0.18)` }}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,144,122,0.15)" }}>
                      <QrCode className="w-5 h-5" style={{ color: "#00907A" }} />
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, color: "#fff" }}>Bolepix emitido</p>
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#22C55E" }}>✓ Pago via Pix · agora</p>
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
        <section className="py-24 marble-bg">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-14 ol-reveal">
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: P, marginBottom: 10 }}>
                Chega de boleto que se perde e<br />controle financeiro improvisado
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Without */}
              <Card3D className="rounded-3xl p-6 border-2" style={{ background: "#FEF2F2", borderColor: "#FECACA" }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#FEE2E2" }}>
                  <X className="w-5 h-5" style={{ color: "#EF4444" }} />
                </div>
                <p className="uppercase tracking-widest text-xs font-bold mb-4" style={{ color: "#EF4444", fontFamily: "'Inter', sans-serif" }}>Sem Olympia Pagamentos</p>
                <ul className="space-y-3">
                  {["Boleto manual","Conciliação manual no banco","Horas perdidas toda semana","Inadimplência elevada","Fluxo de caixa imprevisível"].map(t => (
                    <li key={t} className="flex items-center gap-2">
                      <X className="w-4 h-4 flex-shrink-0" style={{ color: "#EF4444" }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#7F1D1D" }}>{t}</span>
                    </li>
                  ))}
                </ul>
              </Card3D>

              {/* Arrow */}
              <div className="flex flex-col items-center gap-3 py-4 ol-reveal">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: P, boxShadow: `0 8px 28px rgba(31,58,95,0.3)` }}>
                  <ArrowRight className="w-7 h-7 text-white" />
                </div>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 800, color: P, letterSpacing: "0.08em" }}>TRANSFORME AGORA</span>
              </div>

              {/* With */}
              <Card3D className="rounded-3xl p-6 border-2" style={{ background: "#F0FDF4", borderColor: "#BBF7D0" }}>
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center mb-4" style={{ background: "#DCFCE7" }}>
                  <CheckCircle className="w-5 h-5" style={{ color: "#16A34A" }} />
                </div>
                <p className="uppercase tracking-widest text-xs font-bold mb-4" style={{ color: "#16A34A", fontFamily: "'Inter', sans-serif" }}>Com Olympia Pagamentos</p>
                <ul className="space-y-3">
                  {["Boleto registrado com elegância em 8 segundos","Bolepix – pagamento instantâneo via PIX","Conciliação automática e precisa","Redução de até 68% na inadimplência","Fluxo de caixa previsível e sob controle"].map(t => (
                    <li key={t} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#16A34A" }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#14532D" }}>{t}</span>
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
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-14 ol-reveal">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5"
                style={{ background: `rgba(200,169,107,0.1)`, border: `1px solid rgba(200,169,107,0.3)` }}>
                <Zap className="w-3.5 h-3.5" style={{ color: G }} />
                <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.12em" }}>DIFERENCIAL COMPETITIVO</span>
              </div>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: P }}>
                Boleto + PIX: a combinação de<br />tradição e eficiência
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { Icon: QrCode,       color: "#00907A", bg: "#F0FDFB", title: "Boleto registrado com excelência",   desc: "Juros, multa e desconto automáticos. Segunda via enviada por WhatsApp com a sofisticação que sua empresa merece.", delay: "d1" },
                { Icon: Zap,          color: G,         bg: "#FDF8EE", title: "Bolepix – pagamento instantâneo",    desc: "Seu cliente paga o boleto com PIX em segundos. Você recebe no mesmo dia, com a segurança de quem valoriza o tempo.", delay: "d2" },
                { Icon: MessageSquare,color: "#22C55E", bg: "#F0FDF4", title: "Régua de cobrança inteligente",      desc: "Lembretes automáticos por WhatsApp, e-mail e SMS. Cobrança refinada, sem pressão desnecessária.", delay: "d3" },
                { Icon: RefreshCw,    color: P,         bg: "#EEF2F9", title: "Conciliação automática",             desc: "Tudo se reconcilia sozinho via Open Finance e CNAB. Nunca mais perca tempo com comprovantes.", delay: "d4" },
              ].map(c => (
                <Card3D key={c.title} className={`rounded-3xl p-6 border hover:shadow-lg transition-shadow ol-reveal ${c.delay}`}
                  style={{ borderColor: "#E2E8F0", background: "#fff" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: c.bg }}>
                    <c.Icon className="w-6 h-6" style={{ color: c.color }} />
                  </div>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14.5, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>{c.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#64748B", lineHeight: 1.65 }}>{c.desc}</p>
                </Card3D>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FUNCIONALIDADES — GRID 6
        ═══════════════════════════════════════════ */}
        <section className="py-24 marble-bg">
          <div className="max-w-6xl mx-auto px-5">
            <div className="text-center mb-14 ol-reveal">
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: P, marginBottom: 10 }}>
                Uma plataforma completa, projetada<br />com o mesmo rigor de um grande banco
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { Icon: QrCode,       color: "#00907A", bg: "#F0FDFB", title: "Boleto + Bolepix",                    desc: "Emissão ilimitada, registro automático e pagamento instantâneo.", badge: "Destaque",    delay: "d1" },
                { Icon: Zap,          color: G,         bg: "#FDF8EE", title: "PIX Cobrança e Pix Automático",       desc: "Cobranças recorrentes com consentimento único. Perfeito para mensalidades.", badge: null,     delay: "d2" },
                { Icon: CreditCard,   color: "#6B4BAF", bg: "#F5F1FF", title: "Contas a Pagar com aprovação",        desc: "Pagamentos em lote com workflow sofisticado de aprovação.", badge: null,                   delay: "d3" },
                { Icon: BarChart3,    color: P,         bg: "#EEF2F9", title: "Dashboard de Fluxo de Caixa",         desc: "Previsão inteligente para 30, 60 e 90 dias.", badge: null,                              delay: "d1" },
                { Icon: Landmark,     color: "#0891B2", bg: "#F0FDFE", title: "Open Finance + CNAB",                 desc: "Conecte todos os seus bancos em um único clique.", badge: null,                         delay: "d2" },
                { Icon: Users,        color: "#22C55E", bg: "#F0FDF4", title: "Portal do Cliente",                   desc: "Seu cliente acessa, paga e baixa documentos com um clique.", badge: null,               delay: "d3" },
              ].map(f => (
                <Card3D key={f.title} className={`relative bg-white rounded-3xl p-6 border group ol-reveal ${f.delay}`}
                  style={{ borderColor: "#E2E8F0" }}>
                  {f.badge && (
                    <div className="absolute -top-3.5 left-5">
                      <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: G, color: P, fontFamily: "'Inter', sans-serif" }}>{f.badge}</span>
                    </div>
                  )}
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ background: f.bg }}>
                    <f.Icon className="w-6 h-6" style={{ color: f.color }} />
                  </div>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 14.5, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>{f.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#64748B", lineHeight: 1.65 }}>{f.desc}</p>
                  <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, color: G }}>Saiba mais</span>
                    <ArrowRight className="w-3.5 h-3.5" style={{ color: G }} />
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
          <div className="relative max-w-5xl mx-auto px-5">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full opacity-10"
                style={{ background: G, filter: "blur(80px)" }} />
            </div>
            <div className="relative text-center mb-14 ol-reveal">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 800, color: G, letterSpacing: "0.15em", marginBottom: 10 }}>RESULTADOS DOS NOSSOS CLIENTES</p>
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: "#FFFFFF" }}>
                Resultados construídos com excelência
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {[
                { end: 68, suffix: "%",  label: "Menos inadimplência",                    sub: "Média dos clientes em 60 dias",       Icon: TrendingUp, color: "#22C55E" },
                { end: 18, suffix: "h",  label: "Economizadas por mês em conciliação",     sub: "Automação completa via Open Finance",  Icon: Clock,      color: G },
                { end: 42, suffix: "%",  label: "Mais previsibilidade no fluxo de caixa",  sub: "Com projeção inteligente de 90 dias",  Icon: BarChart3,  color: "#60A5FA" },
              ].map((s, i) => (
                <div key={s.label} className={`text-center rounded-3xl p-8 ol-reveal d${i+1}`}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(12px)" }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-5"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}35` }}>
                    <s.Icon className="w-6 h-6" style={{ color: s.color }} />
                  </div>
                  <div style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(42px,6vw,64px)", fontWeight: 900, color: G, lineHeight: 1 }}>
                    <StatNum end={s.end} suffix={s.suffix} />
                  </div>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 700, color: "#FFFFFF", margin: "10px 0 5px" }}>{s.label}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6B8BAF" }}>{s.sub}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-10 ol-reveal">
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, color: "rgba(200,215,235,0.6)", fontStyle: "italic" }}>
                "Em poucos dias, a Olympia Pagamentos elevou o padrão do nosso controle financeiro."
              </p>
              <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "rgba(200,215,235,0.4)", marginTop: 5 }}>
                — Depoimentos de empresas que valorizam precisão e sofisticação
              </p>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            DEPOIMENTOS
        ═══════════════════════════════════════════ */}
        <section className="py-24 marble-bg">
          <div className="max-w-4xl mx-auto px-5">
            <div className="text-center mb-14 ol-reveal">
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: P }}>
                A opinião de quem já elevou<br />seu padrão financeiro
              </h2>
            </div>

            <div className="relative ol-reveal">
              {/* Card */}
              <div className="rounded-3xl p-8 md:p-10 relative overflow-hidden"
                style={{ background: "#fff", border: `1.5px solid rgba(200,169,107,0.35)`, boxShadow: `0 20px 60px rgba(200,169,107,0.10), 0 4px 24px rgba(31,58,95,0.08)` }}>
                {/* Gold accent top-left */}
                <div className="absolute top-0 left-0 w-32 h-1 rounded-r-full" style={{ background: `linear-gradient(90deg, ${G}, transparent)` }} />
                <div className="absolute top-0 left-0 w-1 h-32 rounded-b-full" style={{ background: `linear-gradient(180deg, ${G}, transparent)` }} />

                <div className="flex gap-1 mb-6">
                  {Array(testimonials[slide].stars).fill(0).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" style={{ color: G }} />
                  ))}
                </div>
                <blockquote style={{ fontFamily: "'Inter', sans-serif", fontSize: 18, lineHeight: 1.75, color: "#1E293B", fontStyle: "italic", marginBottom: 28 }}>
                  "{testimonials[slide].text}"
                </blockquote>
                <div className="flex items-center gap-3.5">
                  <div className="w-13 h-13 rounded-full overflow-hidden flex-shrink-0" style={{ width: 52, height: 52, border: `2px solid ${G}` }}>
                    <ImageWithFallback src={testimonials[slide].photo} alt={testimonials[slide].name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 700, color: "#1E293B" }}>{testimonials[slide].name}</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#64748B" }}>{testimonials[slide].role}</p>
                  </div>
                </div>
              </div>

              {/* Nav */}
              <div className="flex items-center justify-center gap-4 mt-7">
                <button onClick={() => setSlide(s => (s - 1 + testimonials.length) % testimonials.length)}
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:border-[#C8A96B]"
                  style={{ borderColor: "#E2E8F0" }}>
                  <ChevronLeft className="w-4 h-4" style={{ color: "#64748B" }} />
                </button>
                <div className="flex gap-2">
                  {testimonials.map((_, i) => (
                    <button key={i} onClick={() => setSlide(i)}
                      className="rounded-full transition-all duration-300"
                      style={{ width: i === slide ? 26 : 8, height: 8, background: i === slide ? G : "#CBD5E1" }} />
                  ))}
                </div>
                <button onClick={() => setSlide(s => (s + 1) % testimonials.length)}
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-all hover:border-[#C8A96B]"
                  style={{ borderColor: "#E2E8F0" }}>
                  <ChevronRight className="w-4 h-4" style={{ color: "#64748B" }} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            COMO FUNCIONA — 3 PASSOS
        ═══════════════════════════════════════════ */}
        <section className="py-24" style={{ background: "#fff" }}>
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-16 ol-reveal">
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: P, marginBottom: 10 }}>
                Três passos simples para um controle<br />financeiro de alto padrão
              </h2>
            </div>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              <StepConnector />
              {[
                { n: "01", Icon: Building2, title: "Cadastre sua empresa com CNPJ",       sub: "Validação automática em segundos", delay: "d1" },
                { n: "02", Icon: FileText,  title: "Crie seu primeiro boleto ou PIX",      sub: "Com regras de juros, multa e Bolepix", delay: "d2" },
                { n: "03", Icon: CheckCircle, title: "Receba e acompanhe tudo em tempo real", sub: "Com a tranquilidade que seu negócio merece", delay: "d3" },
              ].map(s => (
                <div key={s.n} className={`relative bg-white rounded-3xl p-8 border text-center ol-reveal ${s.delay}`}
                  style={{ borderColor: "#E2E8F0", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
                  {/* Gold step circle */}
                  <div className="absolute -top-5 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ background: G, boxShadow: `0 4px 16px rgba(200,169,107,0.4)` }}>
                    <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 13, fontWeight: 900, color: P }}>{s.n}</span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 mt-5"
                    style={{ background: "#EEF2F9" }}>
                    <s.Icon className="w-7 h-7" style={{ color: P }} />
                  </div>
                  <h3 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 15, fontWeight: 800, color: "#1E293B", marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#64748B" }}>{s.sub}</p>
                </div>
              ))}
            </div>

            <div className="text-center mt-12 ol-reveal">
              <button onClick={() => navigate("/login")} className="ol-btn-gold inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}>
                Quero começar agora <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PREÇOS
        ═══════════════════════════════════════════ */}
        <section className="py-24 marble-bg">
          <div className="max-w-5xl mx-auto px-5">
            <div className="text-center mb-14 ol-reveal">
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(22px,3vw,36px)", fontWeight: 900, color: P, marginBottom: 10 }}>
                Investimento justo para quem valoriza<br />controle e sofisticação
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ol-reveal">
              {/* Starter */}
              <Card3D className="bg-white rounded-3xl p-7 border" style={{ borderColor: "#E2E8F0" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#94A3B8", marginBottom: 8 }}>STARTER</p>
                <div className="flex items-end gap-1 mb-2">
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 42, fontWeight: 900, color: "#1E293B", lineHeight: 1 }}>R$ 0</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#64748B", paddingBottom: 5 }}>/mês</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#94A3B8", marginBottom: 22 }}>Para começar a explorar</p>
                <ul className="space-y-3 mb-8">
                  {["Até 50 boletos/Pix por mês","Conciliação automática","Dashboard básico","Suporte por e-mail"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#16A34A" }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#374151" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate("/login")} className="w-full py-3 rounded-xl font-bold border-2 transition-all hover:bg-slate-50"
                  style={{ borderColor: P, color: P, fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                  Começar grátis
                </button>
              </Card3D>

              {/* Pro – featured */}
              <Card3D className="rounded-3xl p-7 border-2 relative"
                style={{ background: "#fff", borderColor: G, boxShadow: `0 20px 60px rgba(200,169,107,0.18)` }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1.5 rounded-full text-xs font-bold" style={{ background: G, color: P, fontFamily: "'Inter', sans-serif" }}>MAIS ESCOLHIDO</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: G, marginBottom: 8 }}>PRO</p>
                <div className="flex items-end gap-1 mb-2">
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 42, fontWeight: 900, color: P, lineHeight: 1 }}>R$ 89</span>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#64748B", paddingBottom: 5 }}>/mês</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#22C55E", fontWeight: 700, marginBottom: 22 }}>30 dias grátis para testar</p>
                <ul className="space-y-3 mb-8">
                  {["Boletos e PIX ilimitados","Bolepix + Pix Automático","Contas a Pagar completo","Relatórios avançados","Régua de cobrança automática","NF-e / NFS-e automática","Até 5 usuários","Suporte prioritário"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: "#16A34A" }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#374151" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate("/login")} className="ol-btn-gold w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: 14 }}>
                  Começar agora <ArrowRight className="w-4 h-4" />
                </button>
              </Card3D>

              {/* Enterprise */}
              <Card3D className="rounded-3xl p-7 border" style={{ background: P, borderColor: "#274872" }}>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: G, marginBottom: 8 }}>ENTERPRISE</p>
                <div className="flex items-end gap-1 mb-2">
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 28, fontWeight: 900, color: "#FFFFFF", lineHeight: 1.2 }}>A partir de R$ 249</span>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#6B8BAF", paddingBottom: 0, marginBottom: 22 }}>/mês</p>
                <ul className="space-y-3 mb-8">
                  {["Tudo do Pro + multi-empresa","Integrações personalizadas (SAP, Totvs)","White label","Gerente de contas dedicado","SLA 99,95% garantido","SSO + MFA avançado"].map(f => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: G }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "rgba(200,215,235,0.85)" }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <button className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  style={{ background: "rgba(200,169,107,0.15)", border: `1.5px solid ${G}`, color: G, fontFamily: "'Inter', sans-serif", fontSize: 14 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(200,169,107,0.25)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(200,169,107,0.15)")}>
                  <PhoneCall className="w-4 h-4" />
                  Falar com especialista
                </button>
              </Card3D>
            </div>

            <p className="text-center mt-8 ol-reveal" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#94A3B8" }}>
              30 dias grátis no Pro e Enterprise · Sem contrato anual · Cancele quando quiser
            </p>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            FAQ
        ═══════════════════════════════════════════ */}
        <section className="py-24" style={{ background: "#fff" }}>
          <div className="max-w-2xl mx-auto px-5">
            <div className="text-center mb-12 ol-reveal">
              <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(22px,3vw,34px)", fontWeight: 900, color: P, marginBottom: 10 }}>Perguntas frequentes</h2>
            </div>
            <div className="space-y-3 ol-reveal">
              {faqs.map((f, i) => (
                <div key={i} className="rounded-2xl border overflow-hidden transition-all"
                  style={{ borderColor: faqOpen === i ? G : "#E2E8F0", boxShadow: faqOpen === i ? `0 0 0 1px ${G}` : "none" }}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                    className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 14.5, fontWeight: 600, color: "#1E293B" }}>{f.q}</span>
                    {faqOpen === i
                      ? <ChevronUp className="w-5 h-5 flex-shrink-0" style={{ color: G }} />
                      : <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: "#94A3B8" }} />}
                  </button>
                  {faqOpen === i && (
                    <div className="px-5 pb-5">
                      <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#64748B", lineHeight: 1.75 }}>{f.a}</p>
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
        <section className="py-24 relative overflow-hidden"
          style={{ background: `linear-gradient(145deg, #07111E 0%, ${P} 45%, #3A5878 80%, #C8B9A4 100%)` }}>
          <ParticleCanvas />
          <div className="relative z-10 max-w-3xl mx-auto px-5 text-center ol-reveal">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-7"
              style={{ background: "rgba(200,169,107,0.12)", border: `1.5px solid ${G}`, boxShadow: `0 0 32px rgba(200,169,107,0.25)` }}>
              <span style={{ fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 700, color: G }}>O</span>
            </div>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "clamp(24px,3.5vw,44px)", fontWeight: 900, color: "#FFFFFF", marginBottom: 16 }}>
              Pronto para elevar o padrão do<br />controle financeiro da sua empresa?
            </h2>
            <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 17, color: "rgba(200,215,235,0.75)", marginBottom: 36 }}>
              Crie sua conta em 5 minutos com CNPJ e emita seu primeiro Bolepix ainda hoje. Sem cartão, sem burocracia.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate("/login")} className="ol-btn-gold inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-bold text-base"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}>
                Criar conta grátis agora <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => setVideoOpen(true)} className="ol-btn-glass inline-flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl font-semibold text-base"
                style={{ fontFamily: "'Inter', sans-serif", fontSize: 15 }}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: G }}>
                  <Play className="w-3 h-3 ml-0.5" style={{ color: P }} />
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
          <div className="max-w-6xl mx-auto px-5 py-14">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
              {/* Brand */}
              <div className="col-span-2">
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(200,169,107,0.1)", border: `1px solid ${G}` }}>
                    <span style={{ fontFamily: "'Cinzel', serif", fontSize: 14, fontWeight: 700, color: G }}>O</span>
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Cinzel', serif", fontSize: 11, fontWeight: 700, color: "#fff", letterSpacing: "0.16em" }}>OLYMPIA</p>
                    <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 7.5, fontWeight: 700, color: G, letterSpacing: "0.22em" }}>PAGAMENTOS</p>
                  </div>
                </div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, lineHeight: 1.7, color: "#334155", maxWidth: 240 }}>
                  Plataforma financeira completa para PMEs brasileiras. Boleto, Pix, fluxo de caixa e conciliação em um só lugar.
                </p>
                <div className="flex flex-wrap gap-2 mt-5">
                  {[
                    { label: "LGPD",     Icon: Lock },
                    { label: "ISO 27001",Icon: ShieldCheck },
                    { label: "Bacen",    Icon: BadgeCheck },
                  ].map(({ label, Icon }) => (
                    <div key={label} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <Icon className="w-3 h-3" style={{ color: G }} />
                      <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, fontWeight: 700, color: "#4B6680" }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {[
                { title: "Produto",  links: ["Boleto Registrado","Bolepix","Pix Cobrança","Contas a Pagar","Dashboard","Open Finance","Portal do Cliente"] },
                { title: "Empresa",  links: ["Sobre nós","Blog","Casos de uso","Parceiros","Carreiras"] },
                { title: "Suporte",  links: ["Central de Ajuda","Documentação API","Status","Contato","WhatsApp"] },
              ].map(col => (
                <div key={col.title}>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.12em", color: "#ffffff", marginBottom: 14 }}>{col.title.toUpperCase()}</p>
                  <ul className="space-y-2.5">
                    {col.links.map(link => (
                      <li key={link}>
                        <a href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#334155", textDecoration: "none" }}
                          onMouseEnter={e => (e.currentTarget.style.color = G)}
                          onMouseLeave={e => (e.currentTarget.style.color = "#334155")}>
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="pt-7 border-t flex flex-col sm:flex-row items-center justify-between gap-4"
              style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#1E293B" }}>
                  © Olympia Pagamentos 2026 – Todos os direitos reservados
                </p>
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#1A2535", marginTop: 2 }}>
                  Plataforma autorizada pelo Banco Central do Brasil
                </p>
              </div>
              <div className="flex gap-5">
                {["Privacidade","Termos de Uso","Cookies","LGPD"].map(l => (
                  <a key={l} href="#" style={{ fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#1E293B", textDecoration: "none" }}
                    onMouseEnter={e => (e.currentTarget.style.color = G)}
                    onMouseLeave={e => (e.currentTarget.style.color = "#1E293B")}>
                    {l}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

        {/* ═══════════════════════════════════════════
            VIDEO MODAL
        ═══════════════════════════════════════════ */}
        {videoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            style={{ backdropFilter: "blur(6px)" }} onClick={() => setVideoOpen(false)}>
            <div className="relative w-full max-w-3xl rounded-3xl overflow-hidden"
              style={{ border: `1.5px solid rgba(200,169,107,0.35)`, boxShadow: `0 40px 80px rgba(0,0,0,0.6)` }}
              onClick={e => e.stopPropagation()}>
              <button onClick={() => setVideoOpen(false)}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.2)" }}>
                <X className="w-4 h-4 text-white" />
              </button>
              <div className="aspect-video flex items-center justify-center" style={{ background: P }}>
                <div className="text-center">
                  <div className="w-18 h-18 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ width: 72, height: 72, background: G, boxShadow: `0 0 40px rgba(200,169,107,0.5)` }}>
                    <Play className="w-9 h-9 ml-1" style={{ color: P }} />
                  </div>
                  <p style={{ fontFamily: "'Montserrat', sans-serif", fontSize: 18, fontWeight: 800, color: "#fff" }}>Demonstração de 60 segundos</p>
                  <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 13.5, color: "#6B8BAF", marginTop: 6 }}>Conecte seu vídeo real neste espaço</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
