"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save, CheckCircle, Loader2, Key, Eye, EyeOff, ExternalLink,
  Cpu, User, Palette, Upload, ChevronDown, BookOpen,
  Globe, MessageSquare, Target, Sparkles,
} from "lucide-react";
import type { BrandProfile } from "@/types";
import {
  CLAUDE_MODELS, GEMINI_MODELS,
  DEFAULT_MODEL_AGENTS, DEFAULT_MODEL_SEO,
  DEFAULT_MODEL_PROPOSALS, DEFAULT_MODEL_WORKFLOWS,
} from "@/lib/user-settings";

/* ─── Styles ──────────────────────────────────────────────────────────────── */
const ANIM_STYLES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    33%       { transform: translateY(-8px) rotate(1deg); }
    66%       { transform: translateY(-4px) rotate(-1deg); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 20px rgba(203,190,255,0.15); }
    50%       { box-shadow: 0 0 40px rgba(203,190,255,0.30), 0 0 80px rgba(203,190,255,0.10); }
  }
  @keyframes orb-drift {
    0%   { transform: translate(0, 0) scale(1); }
    33%  { transform: translate(30px, -20px) scale(1.05); }
    66%  { transform: translate(-20px, 10px) scale(0.97); }
    100% { transform: translate(0, 0) scale(1); }
  }
  @keyframes shimmer-text {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes spin-slow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  .anim-1 { animation: fadeInUp 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.05s; }
  .anim-2 { animation: fadeInUp 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.15s; }
  .anim-3 { animation: fadeInUp 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.25s; }
  .anim-4 { animation: fadeInUp 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.35s; }
  .anim-5 { animation: fadeInUp 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.45s; }
  .anim-6 { animation: fadeInUp 0.55s cubic-bezier(0.22,1,0.36,1) both; animation-delay: 0.55s; }
  .card-hover {
    transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  }
  .card-hover:hover {
    border-color: rgba(203,190,255,0.22) !important;
    box-shadow: 0 8px 40px rgba(203,190,255,0.07), 0 0 0 1px rgba(203,190,255,0.08);
    transform: translateY(-1px);
  }
  .card-blue-hover {
    transition: border-color 0.3s ease, box-shadow 0.3s ease, transform 0.2s ease;
  }
  .card-blue-hover:hover {
    border-color: rgba(96,165,250,0.22) !important;
    box-shadow: 0 8px 40px rgba(96,165,250,0.07), 0 0 0 1px rgba(96,165,250,0.08);
    transform: translateY(-1px);
  }
  .section-open-anim { animation: fadeIn 0.2s ease both; }
  .input-focus:focus {
    border-color: rgba(203,190,255,0.35) !important;
    box-shadow: 0 0 0 3px rgba(203,190,255,0.08);
    outline: none;
  }
  .shimmer-title {
    background: linear-gradient(90deg, #cbbeff 0%, #e4dbff 30%, #9d85ff 60%, #cbbeff 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmer-text 4s linear infinite;
  }
`;

/* ─── Constants ───────────────────────────────────────────────────────────── */
const STORAGE_KEY = "mdf_brand_profile";

const TONOS = [
  "Profesional y formal", "Cercano y conversacional",
  "Inspirador y motivador", "Divertido y desenfadado",
  "Técnico y experto", "Empático y humano",
];

const defaultProfile: BrandProfile = {
  nombre: "", descripcion: "", industria: "", tono: "",
  publicoObjetivo: "", webUrl: "", redesSociales: "", diferenciadores: "",
};

const MODEL_SECTIONS = [
  { key: "modelAgents" as const, label: "Agentes de IA", description: "Blog, redes sociales, emails, guiones, hooks, repurposing, calendario y competencia", default: DEFAULT_MODEL_AGENTS },
  { key: "modelSeo" as const, label: "Suite SEO", description: "Análisis de keywords, auditorías, backlinks y reportes SEO", default: DEFAULT_MODEL_SEO },
  { key: "modelProposals" as const, label: "Propuestas", description: "Generación de propuestas comerciales (markdown, HTML y presentación)", default: DEFAULT_MODEL_PROPOSALS },
  { key: "modelWorkflows" as const, label: "CRM y Workflows", description: "Agente IA del constructor de workflows de ventas y automatización", default: DEFAULT_MODEL_WORKFLOWS },
];

const MODEL_BADGE_COLORS: Record<string, string> = {
  green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  indigo: "bg-indigo-500/10  text-indigo-400  border-indigo-500/30",
  purple: "bg-purple-500/10  text-purple-400  border-purple-500/30",
  teal:   "bg-teal-500/10    text-teal-400    border-teal-500/30",
  blue:   "bg-blue-500/10    text-blue-400    border-blue-500/30",
  orange: "bg-orange-500/10  text-orange-400  border-orange-500/30",
};

const inputStyle = { background: "#1a1919", border: "1px solid rgba(255,255,255,0.08)", color: "white" as const };
const labelStyle = { color: "#dedad8" };
const sublabelStyle = { color: "#7a7585" };

const ANTHROPIC_GUIDE_STEPS = [
  "Ve a console.anthropic.com e inicia sesión (o crea una cuenta gratuita).",
  "En el menú lateral haz clic en «Settings» → «API Keys».",
  "Pulsa «Create Key», dale un nombre (ej: MDF Tools) y cópiala.",
  "Pégala en el campo de arriba y guarda el perfil.",
];

const GEMINI_GUIDE_STEPS = [
  "Ve a aistudio.google.com e inicia sesión con tu cuenta de Google.",
  "Haz clic en el botón «Get API Key» en la barra lateral izquierda.",
  "Selecciona «Create API Key in new project» (o elige un proyecto existente).",
  "Copia la key generada, pégala aquí y guarda el perfil.",
];

/* ─── Collapsible Section ─────────────────────────────────────────────────── */
function Section({
  title, icon, badge, defaultOpen = false, accentColor = "#cbbeff", children,
}: {
  title: string; icon: React.ReactNode; badge?: React.ReactNode;
  defaultOpen?: boolean; accentColor?: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div
      className="rounded-2xl overflow-hidden card-hover"
      style={{ background: "linear-gradient(145deg, #181717 0%, #141313 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4 text-left"
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}14`, border: `1px solid ${accentColor}28` }}
          >
            <span style={{ color: accentColor }}>{icon}</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: "#dedad8" }}>{title}</span>
          {badge && <span className="ml-2">{badge}</span>}
        </div>
        <ChevronDown
          size={15}
          style={{ color: "#5a5465", transition: "transform 0.25s cubic-bezier(0.4,0,0.2,1)", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="border-t section-open-anim" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="px-6 pt-5 pb-6 space-y-5">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ─── API Guide ───────────────────────────────────────────────────────────── */
function ApiGuide({ steps, href, color = "#cbbeff" }: { steps: string[]; href: string; color?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ background: "#111010", border: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left transition hover:bg-white/[0.02]"
      >
        <BookOpen size={12} style={{ color }} />
        <span className="text-xs" style={{ color: "#6b6478" }}>¿Cómo obtener la API key?</span>
        <ChevronDown size={11} style={{ color: "#4a4455", marginLeft: "auto", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }} />
      </button>
      {open && (
        <div className="section-open-anim px-3.5 pb-4 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <ol className="mt-3 space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${color}18`, color }}>
                  {i + 1}
                </span>
                <span className="text-xs leading-relaxed" style={{ color: "#6b6478" }}>{step}</span>
              </li>
            ))}
          </ol>
          <a href={href} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-75"
            style={{ background: `${color}12`, color, border: `1px solid ${color}22` }}>
            Abrir consola <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Card wrapper for main sections ─────────────────────────────────────── */
function MainCard({ title, icon, accentColor = "#cbbeff", className = "", children }: {
  title: string; icon: React.ReactNode; accentColor?: string;
  className?: string; children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl overflow-hidden flex flex-col ${accentColor === "#cbbeff" ? "card-hover" : "card-blue-hover"} ${className}`}
      style={{ background: "linear-gradient(145deg, #181717 0%, #141313 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      {/* Card top accent bar */}
      <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${accentColor}40, transparent)` }} />
      <div className="px-6 pt-5 pb-1 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${accentColor}12`, border: `1px solid ${accentColor}22` }}>
          <span style={{ color: accentColor, display: "flex" }}>{icon}</span>
        </div>
        <h3 className="text-sm font-semibold" style={{ color: "#dedad8" }}>{title}</h3>
      </div>
      <div className="px-6 pt-4 pb-6 flex-1 space-y-5">{children}</div>
    </div>
  );
}

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function PerfilPage() {
  const [profile, setProfile] = useState<BrandProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const [apiKeyInput, setApiKeyInput]       = useState("");
  const [hasApiKey, setHasApiKey]           = useState(false);
  const [showApiKey, setShowApiKey]         = useState(false);
  const [keySaved, setKeySaved]             = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [hasGeminiKey, setHasGeminiKey]     = useState(false);
  const [showGeminiKey, setShowGeminiKey]   = useState(false);

  const [modelAgents,    setModelAgents]    = useState(DEFAULT_MODEL_AGENTS);
  const [modelSeo,       setModelSeo]       = useState(DEFAULT_MODEL_SEO);
  const [modelProposals, setModelProposals] = useState(DEFAULT_MODEL_PROPOSALS);
  const [modelWorkflows, setModelWorkflows] = useState(DEFAULT_MODEL_WORKFLOWS);

  const [logoUrl,             setLogoUrl]             = useState("");
  const [brandPrimaryColor,   setBrandPrimaryColor]   = useState("#7C3AED");
  const [brandSecondaryColor, setBrandSecondaryColor] = useState("#EC4899");
  const [proposalSenderName,  setProposalSenderName]  = useState("");
  const [termsConditions,     setTermsConditions]     = useState("");
  const [uploadingLogo,       setUploadingLogo]       = useState(false);
  const [keysLoaded,          setKeysLoaded]          = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const modelState: Record<string, { get: string; set: (v: string) => void }> = {
    modelAgents:    { get: modelAgents,    set: setModelAgents },
    modelSeo:       { get: modelSeo,       set: setModelSeo },
    modelProposals: { get: modelProposals, set: setModelProposals },
    modelWorkflows: { get: modelWorkflows, set: setModelWorkflows },
  };

  // Completion score
  const fields = [profile.nombre, profile.descripcion, profile.industria, profile.tono, profile.publicoObjetivo];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/brand-profile");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setProfile(data);
            setHasProfile(true);
            setHasApiKey(!!data.hasApiKey);
            setHasGeminiKey(!!data.hasGeminiKey);
            if (data.modelAgents)         setModelAgents(data.modelAgents);
            if (data.modelSeo)            setModelSeo(data.modelSeo);
            if (data.modelProposals)      setModelProposals(data.modelProposals);
            if (data.modelWorkflows)      setModelWorkflows(data.modelWorkflows);
            if (data.logoUrl)             setLogoUrl(data.logoUrl);
            if (data.brandPrimaryColor)   setBrandPrimaryColor(data.brandPrimaryColor);
            if (data.brandSecondaryColor) setBrandSecondaryColor(data.brandSecondaryColor);
            if (data.proposalSenderName)  setProposalSenderName(data.proposalSenderName);
            if (data.termsConditions)     setTermsConditions(data.termsConditions);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setKeysLoaded(true);
            setLoading(false);
            return;
          }
        }
      } catch { /* fallback */ }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { try { setProfile(JSON.parse(raw)); setHasProfile(true); } catch { /* invalid */ } }
      setKeysLoaded(true);
      setLoading(false);
    }
    loadProfile();
  }, []);

  function handleChange(field: keyof BrandProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleLogoUpload(file: File) {
    setUploadingLogo(true);
    try {
      const fd = new FormData(); fd.append("file", file);
      const res = await fetch("/api/proposals/upload-logo", { method: "POST", body: fd });
      if (res.ok) { const { url } = await res.json(); if (url) setLogoUrl(url); }
    } catch { /* silent */ } finally { setUploadingLogo(false); }
  }

  async function handleSave() {
    setSaving(true);
    const toSave = { ...profile, updatedAt: new Date().toISOString() };
    const body: Record<string, unknown> = { ...toSave, modelAgents, modelSeo, modelProposals, modelWorkflows, logoUrl, brandPrimaryColor, brandSecondaryColor, proposalSenderName, termsConditions };
    if (apiKeyInput.trim())    body.anthropicApiKey = apiKeyInput.trim();
    if (geminiKeyInput.trim()) body.geminiApiKey    = geminiKeyInput.trim();
    try {
      await fetch("/api/brand-profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (apiKeyInput.trim())    { setHasApiKey(true);    setApiKeyInput("");    setKeySaved(true); setTimeout(() => setKeySaved(false), 3000); }
      if (geminiKeyInput.trim()) { setHasGeminiKey(true); setGeminiKeyInput(""); }
    } catch { /* silent */ }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setHasProfile(true); setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading || !keysLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0c0b0b" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(203,190,255,0.08)", border: "1px solid rgba(203,190,255,0.15)", animation: "pulse-glow 2s ease-in-out infinite" }}>
            <Sparkles size={18} style={{ color: "#cbbeff" }} />
          </div>
          <span className="text-sm" style={{ color: "#5a5465" }}>Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ANIM_STYLES }} />

      <div className="min-h-screen w-full" style={{ background: "#0c0b0b" }}>
        <div className="px-6 xl:px-10 py-8 max-w-screen-xl mx-auto">

          {/* ── HERO ──────────────────────────────────────────────────── */}
          <div
            className="anim-1 relative rounded-3xl overflow-hidden mb-8 p-8 xl:p-10"
            style={{ background: "linear-gradient(135deg, #141313 0%, #0f0e0e 50%, #120f1a 100%)", border: "1px solid rgba(255,255,255,0.07)", minHeight: 180 }}
          >
            {/* Orbs */}
            <div className="absolute pointer-events-none" style={{ top: "-40%", right: "-5%", width: 480, height: 420, background: "radial-gradient(circle, rgba(203,190,255,0.09) 0%, transparent 70%)", filter: "blur(40px)", animation: "orb-drift 12s ease-in-out infinite" }} />
            <div className="absolute pointer-events-none" style={{ bottom: "-50%", left: "10%", width: 320, height: 280, background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)", filter: "blur(50px)", animation: "orb-drift 18s ease-in-out infinite reverse" }} />
            <div className="absolute pointer-events-none" style={{ top: "10%", left: "40%", width: 200, height: 200, background: "radial-gradient(circle, rgba(96,165,250,0.05) 0%, transparent 70%)", filter: "blur(30px)", animation: "orb-drift 15s ease-in-out infinite 3s" }} />

            {/* Subtle grid texture */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Floating icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, rgba(203,190,255,0.15), rgba(139,92,246,0.08))", border: "1px solid rgba(203,190,255,0.2)", animation: "float 6s ease-in-out infinite", boxShadow: "0 8px 32px rgba(203,190,255,0.12), inset 0 1px 0 rgba(255,255,255,0.08)" }}
                >
                  <User className="w-6 h-6" style={{ color: "#cbbeff" }} />
                </div>
                <div>
                  <h1 className="font-black text-3xl xl:text-4xl tracking-tight leading-none mb-1.5">
                    <span className="text-white">Perfil de </span>
                    <span className="shimmer-title">Marca</span>
                  </h1>
                  <p className="text-sm" style={{ color: "#5a5465" }}>
                    Contexto base que todos los agentes IA utilizan automáticamente
                  </p>
                </div>
              </div>

              {/* Right side: completion + status */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Completion ring */}
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
                      <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="15" fill="none" stroke="#cbbeff" strokeWidth="2.5"
                        strokeDasharray={`${(pct / 100) * 94.2} 94.2`}
                        strokeLinecap="round"
                        style={{ transition: "stroke-dasharray 1s cubic-bezier(0.4,0,0.2,1)", filter: "drop-shadow(0 0 6px rgba(203,190,255,0.5))" }}
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold" style={{ color: "#cbbeff" }}>{pct}%</span>
                  </div>
                  <div>
                    <div className="text-xs font-semibold" style={{ color: "#dedad8" }}>Completo</div>
                    <div className="text-[11px]" style={{ color: "#4a4455" }}>{filled}/{fields.length} campos</div>
                  </div>
                </div>

                {hasProfile && (
                  <div
                    className="flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl"
                    style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.18)", boxShadow: "0 0 20px rgba(74,222,128,0.08)" }}
                  >
                    <CheckCircle size={12} /> Configurado
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── TWO MAIN CARDS SIDE BY SIDE ────────────────────────────── */}
          <div className="anim-2 grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

            {/* Card 1: Información básica */}
            <MainCard title="Información básica" icon={<User size={14} />} accentColor="#cbbeff">
              <div>
                <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={labelStyle}>
                  Nombre de la marca <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" value={profile.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Ej: MDF Agency"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition input-focus"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>
                  Descripción del negocio <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={profile.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  placeholder="¿Qué hace tu empresa? ¿Qué problema resuelve?"
                  rows={4} className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition resize-none input-focus"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>
                  Industria / Sector <span className="text-red-400">*</span>
                </label>
                <input
                  type="text" value={profile.industria}
                  onChange={(e) => handleChange("industria", e.target.value)}
                  placeholder="Ej: Marketing digital, E-commerce, SaaS..."
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition input-focus"
                  style={inputStyle}
                />
              </div>
            </MainCard>

            {/* Card 2: Comunicación y presencia */}
            <MainCard title="Comunicación y presencia" icon={<MessageSquare size={14} />} accentColor="#7dd3fc">
              <div>
                <label className="block text-xs font-semibold mb-2" style={labelStyle}>
                  Tono de comunicación <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TONOS.map((tono) => (
                    <button key={tono} type="button" onClick={() => handleChange("tono", tono)}
                      className="px-3 py-2 rounded-lg text-[11px] font-medium border transition-all text-left"
                      style={profile.tono === tono
                        ? { background: "rgba(125,211,252,0.15)", color: "#7dd3fc", border: "1px solid rgba(125,211,252,0.35)" }
                        : { background: "#1a1919", color: "#5a5465", border: "1px solid rgba(255,255,255,0.07)" }
                      }
                    >{tono}</button>
                  ))}
                </div>
                <input
                  type="text" value={!TONOS.includes(profile.tono) ? profile.tono : ""}
                  onChange={(e) => handleChange("tono", e.target.value)}
                  placeholder="O escribe tu propio tono..."
                  className="mt-2 w-full px-4 py-2.5 rounded-xl text-white text-sm transition input-focus"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>
                  Público objetivo <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={profile.publicoObjetivo}
                  onChange={(e) => handleChange("publicoObjetivo", e.target.value)}
                  placeholder="¿A quién va dirigido? Edad, intereses, dolores..."
                  rows={2} className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition resize-none input-focus"
                  style={inputStyle}
                />
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 flex items-center gap-1.5" style={labelStyle}>
                    <Globe size={11} style={{ color: "#7dd3fc" }} /> URL de la web
                  </label>
                  <input type="url" value={profile.webUrl}
                    onChange={(e) => handleChange("webUrl", e.target.value)}
                    placeholder="https://tuempresa.com"
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition input-focus"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>
                    Redes sociales activas
                  </label>
                  <input type="text" value={profile.redesSociales}
                    onChange={(e) => handleChange("redesSociales", e.target.value)}
                    placeholder="Ej: @marca en Instagram y TikTok"
                    className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition input-focus"
                    style={inputStyle}
                  />
                </div>
              </div>
            </MainCard>
          </div>

          {/* ── COLLAPSIBLE SECTIONS ───────────────────────────────────── */}
          <div className="space-y-3">

            {/* Estrategia */}
            <div className="anim-3">
              <Section title="Estrategia de marca" icon={<Target size={14} />} accentColor="#a78bfa" defaultOpen={false}>
                <div>
                  <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>Diferenciadores clave</label>
                  <textarea value={profile.diferenciadores}
                    onChange={(e) => handleChange("diferenciadores", e.target.value)}
                    placeholder="¿Por qué elegiría alguien tu marca?"
                    rows={3} className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition resize-none input-focus"
                    style={inputStyle}
                  />
                </div>
              </Section>
            </div>

            {/* API Keys — side by side */}
            <div className="anim-4 grid grid-cols-1 lg:grid-cols-2 gap-3">

              {/* Anthropic */}
              <Section
                title="API Key de Anthropic" icon={<Key size={14} />} accentColor="#cbbeff"
                defaultOpen={!hasApiKey}
                badge={
                  hasApiKey && !keySaved
                    ? <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}><CheckCircle size={9}/> Activa</span>
                    : keySaved
                    ? <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}><CheckCircle size={9}/> ¡Guardada!</span>
                    : <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}>Requerida</span>
                }
              >
                {!hasApiKey && <p className="text-xs text-amber-400/80 mb-3 flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"/>Necesaria para activar todos los agentes.</p>}
                {hasApiKey && <p className="text-xs mb-3" style={sublabelStyle}>Key configurada. Ingresa una nueva para reemplazarla.</p>}
                <div className="relative">
                  <input type={showApiKey ? "text" : "password"} value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={hasApiKey ? "sk-ant-... (vacío = mantener)" : "sk-ant-api03-..."}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-white text-sm transition font-mono input-focus"
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowApiKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: "#4a4455" }}>
                    {showApiKey ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                <ApiGuide steps={ANTHROPIC_GUIDE_STEPS} href="https://console.anthropic.com/settings/keys" color="#cbbeff" />
              </Section>

              {/* Gemini */}
              <Section
                title="Google Gemini API Key" icon={<Key size={14} />} accentColor="#60a5fa"
                defaultOpen={!hasGeminiKey}
                badge={
                  hasGeminiKey
                    ? <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}><CheckCircle size={9}/> Activa</span>
                    : <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}>Opcional</span>
                }
              >
                {!hasGeminiKey && <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: "rgba(96,165,250,0.7)" }}><span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"/>Alternativa económica. Flash 2.0 cuesta ~10× menos que Haiku.</p>}
                {hasGeminiKey && <p className="text-xs mb-3" style={sublabelStyle}>Key configurada. Ingresa una nueva para reemplazarla.</p>}
                <div className="relative">
                  <input type={showGeminiKey ? "text" : "password"} value={geminiKeyInput}
                    onChange={(e) => setGeminiKeyInput(e.target.value)}
                    placeholder={hasGeminiKey ? "AIza... (vacío = mantener)" : "AIzaSy..."}
                    className="w-full px-4 py-2.5 pr-10 rounded-xl text-white text-sm transition font-mono input-focus"
                    style={inputStyle}
                  />
                  <button type="button" onClick={() => setShowGeminiKey(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition" style={{ color: "#4a4455" }}>
                    {showGeminiKey ? <EyeOff size={14}/> : <Eye size={14}/>}
                  </button>
                </div>
                <ApiGuide steps={GEMINI_GUIDE_STEPS} href="https://aistudio.google.com/app/apikey" color="#60a5fa" />
              </Section>
            </div>

            {/* Modelos IA */}
            <div className="anim-5">
              <Section title="Modelos de IA por sección" icon={<Cpu size={14} />} accentColor="#f59e0b" defaultOpen={false}>
                <div className="space-y-6">
                  {MODEL_SECTIONS.map((section) => {
                    const current = modelState[section.key].get;
                    const setCurrent = modelState[section.key].set;
                    return (
                      <div key={section.key}>
                        <div className="text-sm font-semibold mb-0.5" style={labelStyle}>{section.label}</div>
                        <div className="text-xs mb-3" style={sublabelStyle}>{section.description}</div>
                        <div className="mb-2">
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#3a3445" }}>
                            <span className="w-3 h-3 rounded-sm bg-orange-500/20 inline-flex items-center justify-center text-orange-400 text-[8px] font-bold">A</span>
                            Anthropic / Claude
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {CLAUDE_MODELS.map((m) => {
                              const isSelected = current === m.id;
                              const needsKey = !hasApiKey;
                              return (
                                <button key={m.id} type="button" onClick={() => setCurrent(m.id)}
                                  className="p-3 rounded-xl border text-left transition"
                                  style={isSelected
                                    ? { background: "rgba(203,190,255,0.08)", border: "1px solid rgba(203,190,255,0.3)" }
                                    : needsKey
                                    ? { background: "#1a1919", border: "1px solid rgba(255,255,255,0.05)", opacity: 0.5, cursor: "not-allowed" }
                                    : { background: "#1a1919", border: "1px solid rgba(255,255,255,0.06)" }
                                  }
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-white">{m.label}</span>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${MODEL_BADGE_COLORS[m.color]}`}>{m.badge}</span>
                                  </div>
                                  <div className="text-[11px] leading-snug" style={sublabelStyle}>{m.description}</div>
                                  {isSelected && <div className="mt-2 flex items-center gap-1 text-[10px]" style={{ color: "#cbbeff" }}><CheckCircle size={10}/> Activo</div>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "#3a3445" }}>
                            <span className="w-3 h-3 rounded-sm bg-blue-500/20 inline-flex items-center justify-center text-blue-400 text-[8px] font-bold">G</span>
                            Google / Gemini
                            {!hasGeminiKey && <span className="normal-case tracking-normal font-normal" style={{ color: "#2a2535" }}>— configura tu key para activar</span>}
                          </p>
                          <div className="grid grid-cols-3 gap-2">
                            {GEMINI_MODELS.map((m) => {
                              const isSelected = current === m.id;
                              const needsKey = !hasGeminiKey;
                              return (
                                <button key={m.id} type="button" onClick={() => !needsKey && setCurrent(m.id)} disabled={needsKey}
                                  className="p-3 rounded-xl border text-left transition"
                                  style={isSelected
                                    ? { background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.3)" }
                                    : needsKey
                                    ? { background: "#1a1919", border: "1px solid rgba(255,255,255,0.05)", opacity: 0.4, cursor: "not-allowed" }
                                    : { background: "#1a1919", border: "1px solid rgba(255,255,255,0.06)" }
                                  }
                                >
                                  <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-white">{m.label}</span>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${MODEL_BADGE_COLORS[m.color]}`}>{m.badge}</span>
                                  </div>
                                  <div className="text-[11px] leading-snug" style={sublabelStyle}>{m.description}</div>
                                  {isSelected && <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400"><CheckCircle size={10}/> Activo</div>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Section>
            </div>

            {/* Identidad Visual */}
            <div className="anim-6">
              <Section title="Identidad Visual para Propuestas" icon={<Palette size={14} />} accentColor="#f472b6" defaultOpen={false}>
                <p className="text-xs -mt-1" style={sublabelStyle}>Personaliza el branding de tus propuestas HTML generadas por IA.</p>
                <div className="space-y-5">
                  {/* Logo */}
                  <div>
                    <label className="block text-xs font-semibold mb-2" style={labelStyle}>Logo de la agencia</label>
                    <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); }} />
                    <div className="flex items-center gap-3 flex-wrap">
                      {logoUrl && <img src={logoUrl} alt="Logo" style={{ maxHeight: 40, maxWidth: 120, objectFit: "contain", borderRadius: 8, background: "#1a1919", padding: "4px 8px", border: "1px solid rgba(255,255,255,0.08)" }} />}
                      <button type="button" onClick={() => logoInputRef.current?.click()} disabled={uploadingLogo}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 transition hover:bg-white/[0.04]"
                        style={{ background: "#1a1919", border: "1px solid rgba(255,255,255,0.08)", color: "#dedad8" }}>
                        {uploadingLogo ? <Loader2 size={13} className="animate-spin"/> : <Upload size={13}/>}
                        {logoUrl ? "Cambiar logo" : "Subir logo"}
                      </button>
                      {logoUrl && <button type="button" onClick={() => setLogoUrl("")} className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-400/10 transition">Quitar</button>}
                    </div>
                    <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)}
                      placeholder="O pega una URL de imagen directamente..."
                      className="mt-2 w-full px-4 py-2.5 rounded-xl text-white text-sm transition input-focus"
                      style={inputStyle}
                    />
                  </div>
                  {/* Colors */}
                  <div className="grid grid-cols-2 gap-4">
                    {[["Color primario", brandPrimaryColor, setBrandPrimaryColor, "#7C3AED"], ["Color secundario", brandSecondaryColor, setBrandSecondaryColor, "#EC4899"]].map(([label, val, setter, placeholder]) => (
                      <div key={label as string}>
                        <label className="block text-xs font-semibold mb-1.5" style={labelStyle}>{label as string}</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)}
                            style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", background: "transparent" }}
                          />
                          <input type="text" value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)}
                            placeholder={placeholder as string}
                            className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm transition font-mono input-focus"
                            style={inputStyle}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Sender */}
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={labelStyle}>Nombre del remitente</label>
                    <p className="text-xs mb-1.5" style={sublabelStyle}>Aparece en el footer de las propuestas como "Presentado por: …"</p>
                    <input type="text" value={proposalSenderName} onChange={e => setProposalSenderName(e.target.value)}
                      placeholder="Ej: Andrés García, Director Creativo"
                      className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition input-focus"
                      style={inputStyle}
                    />
                  </div>
                  {/* Terms */}
                  <div>
                    <label className="block text-xs font-semibold mb-1" style={labelStyle}>Términos y condiciones</label>
                    <p className="text-xs mb-1.5" style={sublabelStyle}>Se incluye al final de cada propuesta generada.</p>
                    <textarea value={termsConditions} onChange={e => setTermsConditions(e.target.value)}
                      placeholder="Ej: El precio incluye 3 rondas de revisión. El 50% se abona al inicio..."
                      rows={4} className="w-full px-4 py-2.5 rounded-xl text-white text-sm transition resize-none input-focus"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </Section>
            </div>

            {/* ── SAVE BUTTON ────────────────────────────────────────────── */}
            <div className="anim-6 pt-2 pb-10 flex items-center gap-4">
              <button
                onClick={handleSave}
                disabled={saving || !profile.nombre || !profile.descripcion || !profile.tono || !profile.publicoObjetivo}
                className="relative flex items-center gap-2.5 px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed font-bold rounded-2xl text-sm transition overflow-hidden"
                style={{ background: "linear-gradient(135deg, #cbbeff 0%, #9d85ff 50%, #7c5cd6 100%)", color: "#1a0050", boxShadow: saved ? "0 0 40px rgba(203,190,255,0.4)" : "0 4px 20px rgba(203,190,255,0.2)" }}
              >
                {/* Shimmer overlay on hover */}
                <span className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity rounded-2xl" />
                <span className="relative flex items-center gap-2.5">
                  {saved
                    ? <><CheckCircle size={15}/> Guardado con éxito</>
                    : saving
                    ? <><Loader2 size={15} className="animate-spin"/> Guardando...</>
                    : <><Save size={15}/> Guardar perfil</>
                  }
                </span>
              </button>
              {!profile.nombre && <p className="text-xs" style={{ color: "#3a3445" }}>Completa los campos obligatorios para guardar</p>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
