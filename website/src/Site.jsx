import { useState, useEffect } from "react";
import {
  CheckCircle2,
  Shield,
  FileSearch,
  Building2,
  Globe2,
  Mail,
  MapPin,
  ArrowRight,
  TriangleAlert,
  Brain,
  LineChart,
  CircuitBoard,
  BookOpen,
} from "lucide-react";

/* assets placed in /public */
const logoSrc = "/logo-yb.png";   // put "logo YB consulting.png" as /public/logo-yb.png

/* i18n — minimal translations for top nav, hero & a few headings */
const translations = {
  en: {
    nav: { mission: "Mission", expertise: "Expertise", ai: "AI & BI Tools", evolution: "Evolution", method: "Method", team: "Team", contact: "Contact" },
    heroTitle: "Business Intelligence, Due Diligence & Risk Management",
    heroLead: "We combine field investigation and AI precision to turn uncertainty into clarity — and clarity into decisive action.",
    heroRegions: "Operating across Belgium, France, Luxembourg, Netherlands, Germany, Switzerland, and Spain.",
    ctas: { assess: "Request Strategic Assessment", explore: "Explore Our Expertise", dlEN: "Download Anti-Fraud Overview", dlFR: "Présentation (FR) PDF" },
    missionTitle: "Our Mission",
    axesTitle: "Our Three Axes of Intervention",
    cycleTitle: "The Intelligence Cycle — Detect • Handle • Secure",
    biTitle: "Business Intelligence Tools & AI Management",
    methodTitle: "Method — From Field to Data",
    sectorsTitle: "Sectors We Serve",
    casesTitle: "Case Studies (Anonymized)",
    aboutTitle: "About YB Consulting",
    coverageLabel: "European Coverage",
    whereWeOperate: "Where we operate",
    contactTitle: "Request a Strategic Assessment",
    contactHelp: "One click to clarity. Share your context — our Intelligence Desk will respond within 24 hours.",
  },
  fr: {
    nav: { mission: "Mission", expertise: "Expertise", ai: "Outils IA & BI", evolution: "Évolution", method: "Méthode", team: "Équipe", contact: "Contact" },
    heroTitle: "Intelligence économique, Due Diligence & Gestion des risques",
    heroLead: "Nous combinons l’investigation terrain et la précision de l’IA pour transformer l’incertitude en clarté — puis la clarté en action décisive.",
    heroRegions: "Présence : Belgique, France, Luxembourg, Pays-Bas, Allemagne, Suisse et Espagne.",
    ctas: { assess: "Demander un diagnostic stratégique", explore: "Explorer notre expertise", dlEN: "Brochure Anti-Fraude (EN)", dlFR: "Présentation (FR) PDF" },
    missionTitle: "Notre Mission",
    axesTitle: "Nos Trois Axes d’Intervention",
    cycleTitle: "Cycle d’Intelligence — Détecter • Structurer • Sécuriser",
    biTitle: "Outils de Business Intelligence & Pilotage IA",
    methodTitle: "Méthode — Du Terrain à la Donnée",
    sectorsTitle: "Secteurs Servis",
    casesTitle: "Cas (Anonymisés)",
    aboutTitle: "À propos de YB Consulting",
    coverageLabel: "Couverture européenne",
    whereWeOperate: "Zones d’intervention",
    contactTitle: "Demande de diagnostic stratégique",
    contactHelp: "Partagez votre contexte — notre cellule répond sous 24 h.",
  },
  de: {
    nav: { mission: "Mission", expertise: "Expertise", ai: "KI & BI Tools", evolution: "Evolution", method: "Methode", team: "Team", contact: "Kontakt" },
    heroTitle: "Business Intelligence, Due Diligence & Risikomanagement",
    heroLead: "Feld­ermittlung kombiniert mit KI-Präzision — Unsicherheit wird Klarheit, Klarheit wird Handlung.",
    heroRegions: "Einsatz in Belgien, Frankreich, Luxemburg, Niederlande, Deutschland, Schweiz und Spanien.",
    ctas: { assess: "Strategische Einschätzung anfordern", explore: "Unsere Expertise", dlEN: "Anti-Fraud Übersicht (EN)", dlFR: "Präsentation (FR) PDF" },
    missionTitle: "Unsere Mission",
    axesTitle: "Drei Handlungsachsen",
    cycleTitle: "Intelligence-Zyklus — Erkennen • Steuern • Absichern",
    biTitle: "Business-Intelligence-Tools & KI-Steuerung",
    methodTitle: "Methode — Vom Feld zur Datenbasis",
    sectorsTitle: "Branchen",
    casesTitle: "Fallstudien (anonymisiert)",
    aboutTitle: "Über YB Consulting",
    coverageLabel: "Europäische Abdeckung",
    whereWeOperate: "Regionen",
    contactTitle: "Strategische Einschätzung anfordern",
    contactHelp: "Beschreiben Sie kurz den Kontext — Antwort innerhalb von 24 h.",
  },
  es: {
    nav: { mission: "Misión", expertise: "Experiencia", ai: "Herramientas IA & BI", evolution: "Evolución", method: "Método", team: "Equipo", contact: "Contacto" },
    heroTitle: "Inteligencia de negocios, Due Diligence y Gestión de Riesgos",
    heroLead: "Investigación de campo y precisión de IA para transformar la incertidumbre en claridad — y la claridad en acción.",
    heroRegions: "Operamos en Bélgica, Francia, Luxemburgo, Países Bajos, Alemania, Suiza y España.",
    ctas: { assess: "Solicitar evaluación estratégica", explore: "Explorar nuestra experiencia", dlEN: "Resumen Anti-Fraude (EN)", dlFR: "Presentación (FR) PDF" },
    missionTitle: "Nuestra Misión",
    axesTitle: "Tres Ejes de Intervención",
    cycleTitle: "Ciclo de Inteligencia — Detectar • Ordenar • Asegurar",
    biTitle: "Herramientas de BI y Gestión de IA",
    methodTitle: "Método — Del Terreno al Dato",
    sectorsTitle: "Sectores",
    casesTitle: "Casos (Anonimizados)",
    aboutTitle: "Sobre YB Consulting",
    coverageLabel: "Cobertura europea",
    whereWeOperate: "Dónde operamos",
    contactTitle: "Solicitud de evaluación estratégica",
    contactHelp: "Comparta su contexto — respondemos en 24 h.",
  },
};

function getInitialLang() {
  const url = new URL(window.location.href);
  const qp = url.searchParams.get("lang");
  const saved = localStorage.getItem("yb_lang");
  const candidate = (qp || saved || "en").toLowerCase();
  return ["en", "fr", "de", "es"].includes(candidate) ? candidate : "en";
}

/* top stats */
const stats = [
  { value: "Detect", label: "Irregularities & weak signals" },
  { value: "Handle", label: "Structure the case into clarity" },
  { value: "Secure", label: "Prevent recurrence with fixes" },
];

/* high-level pillars */
const pillars = [
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Prevention — Due Diligence & Risk Mapping",
    text: "Background checks on partners and processes, document verification, and vulnerability mapping in procurement, logistics, finance, and governance. Outcome: trusted partnerships and controlled exposure.",
  },
  {
    icon: <FileSearch className="w-5 h-5" />,
    title: "Reaction — Investigations & Evidence Structuring",
    text: "Field investigations, targeted interviews, forensic document analysis, and AI-assisted link analysis. Outcome: legal-ready timelines, evidence packs, and clear next actions.",
  },
  {
    icon: <BookOpen className="w-5 h-5" />,
    title: "Litigation Support — Building the Case",
    text: "We organize complex documentation for legal teams: chronology, entity maps, and risk exposure models that transform complexity into credibility in court.",
  },
];

/* method cards */
const methods = [
  {
    icon: <Building2 className="w-5 h-5" />,
    title: "Verification",
    text: "On-site checks: warehouses, stocks, procedures, and controls—see reality beyond reports.",
  },
  {
    icon: <FileSearch className="w-5 h-5" />,
    title: "Interviews",
    text: "From operator to CEO: targeted interviews that surface ground truth and contradictions.",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Forensic Analysis",
    text: "Kbis, contracts, invoices—detect falsification patterns and internal collusion signals.",
  },
  {
    icon: <TriangleAlert className="w-5 h-5" />,
    title: "Simulation & Mitigation",
    text: "Apply controlled tests, propose preventive fixes, and close the gaps for good.",
  },
];

/* sectors (no finance/legal/insurance) */
const sectors = [
  "Industrial & Manufacturing SMEs",
  "Construction & Real Estate",
  "Logistics, Trade & Procurement Networks",
  "Emerging Technology & AI-driven Businesses",
];

/* impact metrics for the strip */
const impact = [
  { k: "72%", v: "Faster anomaly detection after AI dashboarding" },
  { k: "10 days", v: "Typical time to deliver a litigation-ready brief" },
  { k: "7+ countries", v: "Cross-border operations across the EU" },
];

export default function Site() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState("en");
  const t = translations[lang];

  /* tiny scroll-reveal for glass cards / photos / metrics */
  useEffect(() => {
    setLang(getInitialLang());
    const els = document.querySelectorAll(".yb-photo, .yb-glass, .yb-metric");
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.style.transform = "translateY(0)";
          e.target.style.opacity = "1";
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    els.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      el.style.transition = "opacity .6s ease, transform .6s ease";
      io.observe(el);
    });

    return () => io.disconnect();
  }, []);

  function switchLang(code) {
    setLang(code);
    localStorage.setItem("yb_lang", code);
    const url = new URL(window.location.href);
    url.searchParams.set("lang", code);
    window.history.replaceState({}, "", url.toString());
  }

  return (
    <div className="min-h-screen text-slate-900 bg-slate-50 bg-grid">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur bg-white/75 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="YB Consulting"
              className="w-9 h-9 rounded-xl ring-1 ring-slate-200 bg-white object-cover"
            />
            <div className="leading-tight">
              <div className="font-semibold tracking-tight">
                YB Consulting — Business Intelligence, Due Diligence & Risk Management
              </div>
              <div className="text-xs text-slate-500">
                Intelligence, clarity, action — from prevention to litigation.
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#mission" className="hover:text-slate-700">{t.nav.mission}</a>
            <a href="#services" className="hover:text-slate-700">{t.nav.expertise}</a>
            <a href="#bi" className="hover:text-slate-700">{t.nav.ai}</a>
            <a href="#evolution" className="hover:text-slate-700">{t.nav.evolution}</a>
            <a href="#method" className="hover:text-slate-700">{t.nav.method}</a>
            <a href="#team" className="hover:text-slate-700">{t.nav.team}</a>
            <a href="#contact" className="hover:text-slate-700">{t.nav.contact}</a>
          </nav>

          {/* Language picker */}
          <div className="hidden md:flex items-center gap-2">
            {["en","fr","de","es"].map(code => (
              <button
                key={code}
                onClick={() => switchLang(code)}
                className={`px-2 py-1 text-xs rounded-md border ${
                  lang === code ? "border-indigo-500 text-indigo-700" : "border-slate-200 text-slate-600"
                }`}
                aria-label={`Switch language to ${code.toUpperCase()}`}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded-xl border border-slate-200"
          >
            <span className="sr-only">Menu</span>
            <Globe2 className="w-5 h-5" />
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-slate-200">
            <div className="px-6 py-3 flex flex-col gap-3 text-sm">
              <div className="flex gap-2">
                {["en","fr","de","es"].map(code => (
                  <button
                    key={code}
                    onClick={() => switchLang(code)}
                    className={`px-2 py-1 text-xs rounded-md border ${
                      lang === code ? "border-indigo-500 text-indigo-700" : "border-slate-200 text-slate-600"
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
              <a href="#mission">{t.nav.mission}</a>
              <a href="#services">{t.nav.expertise}</a>
              <a href="#bi">{t.nav.ai}</a>
              <a href="#evolution">{t.nav.evolution}</a>
              <a href="#method">{t.nav.method}</a>
              <a href="#team">{t.nav.team}</a>
              <a href="#contact">{t.nav.contact}</a>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="hero-section relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-10 items-start">
            {/* Left: hero card */}
            <div className="yb-glass max-w-3xl backdrop-blur-xl bg-white/10 ring-1 ring-white/15 rounded-3xl p-8 md:p-10 text-white">
              <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
                {t.heroTitle}
              </h1>
              <p className="mt-4 text-lg/7 text-indigo-100">{t.heroLead}</p>
              <p className="mt-2 text-indigo-200 text-base">{t.heroRegions}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#contact" className="yb-btn inline-flex items-center gap-2">
                  {t.ctas.assess} <ArrowRight className="w-4 h-4" />
                </a>
                <a href="#services" className="yb-btn-ghost inline-flex items-center gap-2">
                  {t.ctas.explore}
                </a>
                {/* PDFs: EN and FR */}
                <a href="/OnePager.pdf" download download className="yb-btn-ghost inline-flex items-center gap-2">
                  {t.ctas.dlEN}
                </a>
                <a
                  href="/site%20YBC%20fran%C3%A7ais%20PDF.pdf"
                  download
                  className="yb-btn-ghost inline-flex items-center gap-2"
                >
                  {t.ctas.dlFR}
                </a>
              </div>

              <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="yb-glass rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 p-5">
                    <div className="text-2xl font-semibold">{s.value}</div>
                    <div className="text-sm text-indigo-100 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: collage */}
            <div className="space-y-4 md:mt-2">
              <figure className="yb-photo overflow-hidden rounded-3xl aspect-[16/10]">
                <img src="/img/ops-night.jpg" alt="Operations at night" className="w-full h-full object-cover" />
              </figure>
              <div className="grid grid-cols-2 gap-4">
                <figure className="yb-photo overflow-hidden rounded-3xl aspect-[16/10]">
                  <img src="/img/network-graph.jpg" alt="Network analysis" className="w-full h-full object-cover" />
                </figure>
                <figure className="yb-photo overflow-hidden rounded-3xl aspect-[16/10]">
                  <img src="/img/forensic-desk.jpg" alt="Forensic desk" className="w-full h-full object-cover" />
                </figure>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Metrics strip */}
      <section className="max-w-6xl mx-auto px-6 pb-6">
        <div className="grid yb-metrics grid-cols-1 sm:grid-cols-3 gap-3">
          {impact.map((m, i) => (
            <div key={i} className="yb-metric">
              <h4 className="text-2xl font-bold">{m.k}</h4>
              <p className="text-slate-300/85">{m.v}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold tracking-tight">{t.missionTitle}</h2>
          <p className="mt-3 text-slate-700 leading-relaxed max-w-4xl">
            We bring investigative experience and data intelligence together so businesses can see clearly,
            act decisively, and prevent losses before they occur. Three verbs define our philosophy:
            <strong> Detect</strong> what others miss, <strong>Handle</strong> complexity into structure, and
            <strong> Secure</strong> the future with preventive systems.
          </p>
        </div>
      </section>

      {/* Expertise */}
      <section id="services" className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold tracking-tight">{t.axesTitle}</h2>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-5">
            {pillars.map((p, i) => (
              <div key={i} className="yb-glass rounded-2xl border border-slate-200/60 bg-gradient-to-b from-slate-50/70 to-white p-6 shadow-sm hover:shadow-md hover:border-indigo-200 transition">
                <div className="flex items-center gap-2 text-indigo-700">{p.icon}<h3 className="font-semibold">{p.title}</h3></div>
                <p className="mt-2 text-sm text-slate-700">{p.text}</p>
                <div className="mt-4 text-sm text-slate-700">
                  <span className="font-medium">Why it matters:</span> reduce exposure, neutralize manipulations, and create legal-grade clarity.<br />
                  <span className="font-medium">How we work:</span> on-site checks + interviews + forensic docs + AI link analysis.<br />
                  <span className="font-medium">Deliverables:</span> due-diligence reports, risk maps, timelines, entity graphs, evidence packs.<br />
                  <span className="font-medium">Timeline:</span> calibrated per case volume (typically 1–4 weeks).
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detect • Handle • Secure */}
      <section id="cycle" className="py-20 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold mb-8">{t.cycleTitle}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <div className="yb-glass rounded-2xl bg-white/10 ring-1 ring-white/15 p-6">
              <h3 className="text-xl font-semibold mb-2 text-indigo-300">Detect — See What Others Miss</h3>
              <p className="text-slate-200">Due diligence, field verification, forensic document review, and AI anomaly detection reveal weak signals and hidden risks.</p>
            </div>
            <div className="yb-glass rounded-2xl bg-white/10 ring-1 ring-white/15 p-6">
              <h3 className="text-xl font-semibold mb-2 text-emerald-300">Handle — Control the Situation</h3>
              <p className="text-slate-200">We structure complexity into timelines, entity maps, and exposure models so decisions become objective and actionable.</p>
            </div>
            <div className="yb-glass rounded-2xl bg-white/10 ring-1 ring-white/15 p-6">
              <h3 className="text-xl font-semibold mb-2 text-blue-300">Secure — Protect the Future</h3>
              <p className="text-slate-200">We implement preventive fixes: dual-control approvals, segregation of duties, anomaly alerts, quarterly intelligence reviews.</p>
            </div>
          </div>
          <div className="mt-8 max-w-3xl mx-auto text-slate-300 text-sm leading-relaxed">
            <strong className="text-white">Preventive fixes</strong> convert insight into immunity. We redesign the processes that allowed the breach, deploy lightweight controls, train key staff, and monitor over time so the pattern cannot reoccur.
          </div>
        </div>
      </section>

      {/* BI & AI */}
      <section id="bi" className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold tracking-tight">{t.biTitle}</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 text-indigo-700"><LineChart className="w-5 h-5" /><h3 className="font-semibold">Decision Dashboards</h3></div>
              <p className="mt-2 text-slate-700 text-sm">Unify operations, risk and finance in one view. Real-time insights for owners and legal teams.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 text-indigo-700"><Brain className="w-5 h-5" /><h3 className="font-semibold">Anomaly Detection</h3></div>
              <p className="mt-2 text-slate-700 text-sm">AI flags unusual flows, forged patterns, and high-risk counterparties across documents and data.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6">
              <div className="flex items-center gap-2 text-indigo-700"><CircuitBoard className="w-5 h-5" /><h3 className="font-semibold">Lightweight Integration</h3></div>
              <p className="mt-2 text-slate-700 text-sm">Designed for SMEs: fast deployment, low footprint, and clear ownership of processes and data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Evolution */}
      <section id="evolution" className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-semibold text-slate-900 mb-4">
            The Evolution of Intelligence — From Magnifying Glass to AI Chip
          </h2>
          <p className="text-slate-600 leading-relaxed max-w-3xl mx-auto">
            Traditional investigation relied on manual scrutiny. We fuse deep human expertise with artificial intelligence so every document, transaction, and interaction becomes a signal in a living intelligence ecosystem.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-slate-200 p-6 shadow-sm">
              <h3 className="text-xl font-semibold text-indigo-700 mb-2">The Traditional Model</h3>
              <p className="text-slate-600">Manual verification, long cycles, fragmented data, intuition-led. Valuable but limited by scope and speed.</p>
              <div className="mt-3 text-sm text-slate-500 italic">🔍 Magnifying glass: precision by focus, limited by capacity.</div>
            </div>
            <div className="rounded-2xl bg-indigo-600/90 text-white ring-1 ring-indigo-300 p-6 shadow-lg">
              <h3 className="text-xl font-semibold mb-2">The AI-Driven Model</h3>
              <p className="text-indigo-100">Automated parsing, cross-document patterns, predictive alerts. Intelligence that doesn’t just observe — it anticipates.</p>
              <div className="mt-3 text-sm italic text-indigo-200">💠 AI chip: precision by scale, power by connection.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Method */}
      <section id="method" className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold tracking-tight">{t.methodTitle}</h2>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {methods.map((m, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 text-indigo-700">{m.icon}<h3 className="font-semibold">{m.title}</h3></div>
                <p className="mt-2 text-sm text-slate-700">{m.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Inspiration Gallery */}
      <section className="max-w-6xl mx-auto px-6 py-16" id="gallery">
        <h2 className="text-3xl font-semibold tracking-tight mb-6">The Work, Quietly</h2>
        <p className="text-slate-600 max-w-3xl">
          Investigation, pattern recognition, prevention. Traditional craft — upgraded with today’s intelligence.
        </p>

        <div className="mt-8 grid md:grid-cols-3 gap-5">
          <figure className="yb-photo"><img src="/img/ai-lens.jpg" alt="AI lens" /></figure>
          <figure className="yb-photo"><img src="/img/secure-systems.jpg" alt="Secure systems" /></figure>
          <figure className="yb-photo"><img src="/img/team-field.jpg" alt="Fieldwork" /></figure>
        </div>
      </section>

      {/* Sectors */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold">{t.sectorsTitle}</h2>
          <ul className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
            {sectors.map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5" />
                <span className="text-slate-700">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Case Studies */}
      <section id="cases" className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-semibold">{t.casesTitle}</h2>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { t: "Supplier Collusion in Manufacturing", d: "€250k exposure neutralized via entity mapping & interviews." },
              { t: "Document Falsification in Trade", d: "Forensic audit proved internal-external collusion, enabling action." },
              { t: "Risk Dashboard for Construction", d: "Anomaly alerts cut exposure by 68% within two quarters." },
            ].map((c, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm yb-glass">
                <h3 className="font-semibold">{c.t}</h3>
                <p className="mt-2 text-sm text-slate-700">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team / About Yves */}
      <section id="team" className="py-16 md:py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold tracking-tight">{t.aboutTitle}</h2>
          <div className="mt-4 text-slate-700 max-w-4xl leading-relaxed">
            <p>
              <strong>Yves B.</strong> — Founder & Director. 35 years of experience in business intelligence and risk management.
              Former leadership roles with Kroll Associates (NY), CITIGATE Global Intelligence, and Intelynx.
              Based in Geneva, Switzerland; active across Europe with trusted investigators, analysts, and technologists.
            </p>
            <p className="mt-3">
              Our ethos: discretion, evidence, and strategic precision. Where complexity hides, intelligence reveals.
            </p>
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <MapPin className="w-5 h-5" /> {t.coverageLabel}
            </div>
            <p className="mt-2 text-sm text-slate-600">
              Belgium • France • Luxembourg • Netherlands • Germany • Switzerland • Spain.
              Other regions available upon request.
            </p>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16 md:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute -inset-20 -z-10 bg-[radial-gradient(50%_50%_at_50%_50%,rgba(99,102,241,0.3),rgba(15,23,42,0))]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 yb-glass rounded-3xl bg-white/5 backdrop-blur-xl ring-1 ring-white/10 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-semibold">{t.contactTitle}</h2>
              <p className="mt-2 text-indigo-100">{t.contactHelp}</p>

              <div className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-4 py-2 font-medium shadow">
                <Mail className="w-4 h-4" />
                <a href="mailto:ybconsult.ai@proton.me">ybconsult.ai@proton.me</a>
              </div>

              <p className="mt-3 text-indigo-200 text-sm">
                Prefer to read first?{" "}
                <a href="/OnePager.pdf" download download className="underline decoration-indigo-300 hover:text-indigo-100">
                  Download our Anti-Fraud Overview (PDF)
                </a>{" "}
                ·{" "}
                <a
                  href="/site%20YBC%20fran%C3%A7ais%20PDF.pdf"
                  download
                  className="underline decoration-indigo-300 hover:text-indigo-100"
                >
                  Présentation FR (PDF)
                </a>
                .
              </p>

              <form
                action="https://formspree.io/f/xjkpneje"
                method="POST"
                className="mt-6 grid grid-cols-1 gap-4"
              >
                <input type="hidden" name="source" value="Main website inquiry" />
                <input type="hidden" name="_subject" value="YB Consulting — Website Inquiry" />
                <input type="hidden" name="_redirect" value="https://yb-dgm-phaseshift-solutions.netlify.app/thanks.html" />
                <input type="text" name="_gotcha" tabIndex="-1" autoComplete="off" style={{ display: "none" }} />

                {[
                  { name: "name", type: "text", label: "Name", required: true },
                  { name: "email", type: "email", label: "Email", required: true },
                  { name: "company", type: "text", label: "Company" },
                ].map((f) => (
                  <label key={f.name} className="relative block">
                    <input
                      name={f.name}
                      type={f.type}
                      required={!!f.required}
                      placeholder=" "
                      className="peer w-full rounded-2xl bg-white/10 ring-1 ring-white/20 px-4 py-4 outline-none text-white placeholder-transparent focus:ring-2 focus:ring-indigo-400"
                    />
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-indigo-200 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-indigo-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-200">
                      {f.label}
                    </span>
                  </label>
                ))}
                <label className="relative block">
                  <textarea
                    name="message"
                    placeholder=" "
                    className="peer min-h-[140px] w-full rounded-2xl bg-white/10 ring-1 ring-white/20 px-4 py-4 outline-none text-white placeholder-transparent focus:ring-2 focus:ring-indigo-400"
                  />
                  <span className="pointer-events-none absolute left-4 top-4 text-indigo-200 transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-indigo-300 peer-focus:top-2 peer-focus:text-xs peer-focus:text-indigo-200">
                    Your situation in 3 lines
                  </span>
                </label>

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-3xl bg-white text-slate-900 px-6 py-3 font-semibold shadow hover:shadow-md"
                >
                  Send request
                </button>

                <p className="text-xs text-indigo-200 mt-2">
                  Confidential • GDPR Compliant • Legal Methods • Field Verified
                </p>
              </form>
            </div>

            {/* Sidebar: privacy + ADDRESS */}
            <div className="lg:pl-2">
              <div className="rounded-2xl border border-indigo-300/40 bg-indigo-50/40 p-6 text-slate-800">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold">
                  <Shield className="w-5 h-5" /> Privacy & Compliance
                </div>
                <ul className="mt-3 space-y-2 text-sm">
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-indigo-700" /> Strict confidentiality</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-indigo-700" /> GDPR compliant</li>
                  <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-indigo-700" /> 100% legal methods</li>
                </ul>
              </div>

              {/* Address block */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center gap-2 font-semibold text-slate-800">
                  <MapPin className="w-5 h-5" /> {t.whereWeOperate}
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Belgium • France • Luxembourg • Netherlands • Germany • Switzerland • Spain. Others on request.
                </p>
                <div className="mt-4 text-sm text-slate-700">
                  <div className="font-medium">Registered Office (Geneva)</div>
                  <div>2 bis rue Saint Léger</div>
                  <div>1205 Genève, Switzerland</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-600">
            © {new Date().getFullYear()} YB Consulting — Business Intelligence & Risk Management Solutions
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <a href="/privacy.html" className="hover:underline">Privacy</a>
            <a href="/imprint.html" className="hover:underline">Imprint</a>
            <a href="/OnePager.pdf" download download className="hover:underline">Overview (PDF)</a>
            <a href="/site%20YBC%20fran%C3%A7ais%20PDF.pdf" download className="hover:underline">Présentation FR (PDF)</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

