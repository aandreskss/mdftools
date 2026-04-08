"use client";

import { useState, useEffect, useRef } from "react";
import {
  Save, CheckCircle, Loader2, Key, Eye, EyeOff, ExternalLink,
  Cpu, User, Palette, Upload, ChevronDown, BookOpen,
} from "lucide-react";
import type { BrandProfile } from "@/types";
import {
  CLAUDE_MODELS, GEMINI_MODELS,
  DEFAULT_MODEL_AGENTS, DEFAULT_MODEL_SEO,
  DEFAULT_MODEL_PROPOSALS, DEFAULT_MODEL_WORKFLOWS,
} from "@/lib/user-settings";

const STORAGE_KEY = "mdf_brand_profile";

const TONOS = [
  "Profesional y formal",
  "Cercano y conversacional",
  "Inspirador y motivador",
  "Divertido y desenfadado",
  "Técnico y experto",
  "Empático y humano",
];

const defaultProfile: BrandProfile = {
  nombre: "", descripcion: "", industria: "", tono: "",
  publicoObjetivo: "", webUrl: "", redesSociales: "", diferenciadores: "",
};

const MODEL_SECTIONS = [
  {
    key: "modelAgents" as const,
    label: "Agentes de IA",
    description: "Blog, redes sociales, emails, guiones, hooks, repurposing, calendario y competencia",
    default: DEFAULT_MODEL_AGENTS,
  },
  {
    key: "modelSeo" as const,
    label: "Suite SEO",
    description: "Análisis de keywords, auditorías, backlinks y reportes SEO",
    default: DEFAULT_MODEL_SEO,
  },
  {
    key: "modelProposals" as const,
    label: "Propuestas",
    description: "Generación de propuestas comerciales (markdown, HTML y presentación)",
    default: DEFAULT_MODEL_PROPOSALS,
  },
  {
    key: "modelWorkflows" as const,
    label: "CRM y Workflows",
    description: "Agente IA del constructor de workflows de ventas y automatización",
    default: DEFAULT_MODEL_WORKFLOWS,
  },
];

const MODEL_BADGE_COLORS: Record<string, string> = {
  green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  indigo: "bg-indigo-500/10  text-indigo-400  border-indigo-500/30",
  purple: "bg-purple-500/10  text-purple-400  border-purple-500/30",
  teal:   "bg-teal-500/10    text-teal-400    border-teal-500/30",
  blue:   "bg-blue-500/10    text-blue-400    border-blue-500/30",
  orange: "bg-orange-500/10  text-orange-400  border-orange-500/30",
};

const inputStyle = {
  background: "#201f1f",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "white" as const,
};
const labelStyle = { color: "#e5e2e1" };
const sublabelStyle = { color: "#938e9e" };

/* ── Collapsible section wrapper ───────────────────────────────────────── */
function Section({
  title, icon, badge, defaultOpen = false, children,
}: {
  title: string;
  icon: React.ReactNode;
  badge?: React.ReactNode;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#1c1b1b" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left transition hover:bg-white/[0.02]"
      >
        <span className="flex items-center gap-2 flex-1 min-w-0">
          <span style={{ color: "#cbbeff" }}>{icon}</span>
          <span className="text-sm font-semibold" style={labelStyle}>{title}</span>
          {badge}
        </span>
        <ChevronDown
          size={15}
          style={{ color: "#938e9e", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-5 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <div className="pt-5">{children}</div>
        </div>
      )}
    </div>
  );
}

/* ── Mini API guide ─────────────────────────────────────────────────────── */
function ApiGuide({ steps, href }: { steps: string[]; href: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-xl overflow-hidden" style={{ background: "#181717", border: "1px solid rgba(255,255,255,0.06)" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2.5 text-left transition hover:bg-white/[0.02]"
      >
        <BookOpen size={12} style={{ color: "#938e9e" }} />
        <span className="text-xs" style={{ color: "#938e9e" }}>¿Cómo obtener la API key?</span>
        <ChevronDown
          size={12}
          style={{ color: "#938e9e", marginLeft: "auto", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      {open && (
        <div className="px-3 pb-3 border-t" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          <ol className="mt-3 space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold"
                  style={{ background: "rgba(203,190,255,0.12)", color: "#cbbeff" }}
                >
                  {i + 1}
                </span>
                <span className="text-xs leading-relaxed" style={{ color: "#938e9e" }}>{step}</span>
              </li>
            ))}
          </ol>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition hover:opacity-80"
            style={{ background: "rgba(203,190,255,0.1)", color: "#cbbeff", border: "1px solid rgba(203,190,255,0.2)" }}
          >
            Ir a la consola <ExternalLink size={10} />
          </a>
        </div>
      )}
    </div>
  );
}

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

export default function PerfilPage() {
  const [profile, setProfile] = useState<BrandProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // API keys
  const [apiKeyInput, setApiKeyInput]       = useState("");
  const [hasApiKey, setHasApiKey]           = useState(false);
  const [showApiKey, setShowApiKey]         = useState(false);
  const [keySaved, setKeySaved]             = useState(false);
  const [geminiKeyInput, setGeminiKeyInput] = useState("");
  const [hasGeminiKey, setHasGeminiKey]     = useState(false);
  const [showGeminiKey, setShowGeminiKey]   = useState(false);

  // Model preferences
  const [modelAgents,    setModelAgents]    = useState(DEFAULT_MODEL_AGENTS);
  const [modelSeo,       setModelSeo]       = useState(DEFAULT_MODEL_SEO);
  const [modelProposals, setModelProposals] = useState(DEFAULT_MODEL_PROPOSALS);
  const [modelWorkflows, setModelWorkflows] = useState(DEFAULT_MODEL_WORKFLOWS);

  // Proposal branding
  const [logoUrl,             setLogoUrl]             = useState("");
  const [brandPrimaryColor,   setBrandPrimaryColor]   = useState("#7C3AED");
  const [brandSecondaryColor, setBrandSecondaryColor] = useState("#EC4899");
  const [proposalSenderName,  setProposalSenderName]  = useState("");
  const [termsConditions,     setTermsConditions]     = useState("");
  const [uploadingLogo,       setUploadingLogo]       = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Track if keys are loaded so Section defaults can react
  const [keysLoaded, setKeysLoaded] = useState(false);

  const modelState: Record<string, { get: string; set: (v: string) => void }> = {
    modelAgents:    { get: modelAgents,    set: setModelAgents },
    modelSeo:       { get: modelSeo,       set: setModelSeo },
    modelProposals: { get: modelProposals, set: setModelProposals },
    modelWorkflows: { get: modelWorkflows, set: setModelWorkflows },
  };

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
            if (data.modelAgents)    setModelAgents(data.modelAgents);
            if (data.modelSeo)       setModelSeo(data.modelSeo);
            if (data.modelProposals) setModelProposals(data.modelProposals);
            if (data.modelWorkflows) setModelWorkflows(data.modelWorkflows);
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
      } catch { /* auth check failed, continue to localStorage fallback */ }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try { setProfile(JSON.parse(raw)); setHasProfile(true); } catch { /* invalid JSON */ }
      }
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
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/proposals/upload-logo", { method: "POST", body: fd });
      if (res.ok) {
        const { url } = await res.json();
        if (url) setLogoUrl(url);
      }
    } catch { /* silent */ } finally {
      setUploadingLogo(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    const toSave = { ...profile, updatedAt: new Date().toISOString() };
    const body: Record<string, unknown> = {
      ...toSave,
      modelAgents, modelSeo, modelProposals, modelWorkflows,
      logoUrl, brandPrimaryColor, brandSecondaryColor, proposalSenderName, termsConditions,
    };
    if (apiKeyInput.trim())    body.anthropicApiKey = apiKeyInput.trim();
    if (geminiKeyInput.trim()) body.geminiApiKey    = geminiKeyInput.trim();

    try {
      await fetch("/api/brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (apiKeyInput.trim()) {
        setHasApiKey(true);
        setApiKeyInput("");
        setKeySaved(true);
        setTimeout(() => setKeySaved(false), 3000);
      }
      if (geminiKeyInput.trim()) {
        setHasGeminiKey(true);
        setGeminiKeyInput("");
      }
    } catch { /* silent */ }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setHasProfile(true);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading || !keysLoaded) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm" style={{ color: "#938e9e" }}>
        <Loader2 size={15} className="animate-spin" /> Cargando perfil...
      </div>
    );
  }

  return (
    <div className="p-6 xl:p-8 min-h-screen" style={{ background: "#131313" }}>
      <div className="max-w-2xl">

        {/* ── Hero header ─────────────────────────────────────────── */}
        <div
          className="relative flex flex-col justify-between p-8 rounded-2xl overflow-hidden mb-8"
          style={{ background: "#1c1b1b" }}
        >
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: "-30%", right: "-5%", width: "350px", height: "320px",
              background: "rgba(203,190,255,0.07)", filter: "blur(60px)",
            }}
          />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: "rgba(203,190,255,0.1)", border: "1px solid rgba(203,190,255,0.2)" }}
              >
                <User className="w-5 h-5" style={{ color: "#cbbeff" }} />
              </div>
              <div>
                <h1 className="font-extrabold text-[26px] text-white tracking-tight leading-tight">
                  Perfil de <span style={{ color: "#cbbeff" }}>Marca</span>
                </h1>
                <p className="text-[13px]" style={{ color: "#938e9e" }}>
                  Configura el contexto base que todos los agentes IA utilizan automáticamente
                </p>
              </div>
            </div>
            {hasProfile && (
              <span
                className="text-[11px] font-bold px-3 py-1.5 rounded-lg"
                style={{
                  background: "rgba(74,222,128,0.1)",
                  color: "#4ade80",
                  border: "1px solid rgba(74,222,128,0.2)",
                }}
              >
                ✓ Configurado
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">

          {/* ── 1. Información básica ────────────────────────────── */}
          <Section
            title="Información básica"
            icon={<User size={14} />}
            defaultOpen={true}
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                  Nombre de la marca <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.nombre}
                  onChange={(e) => handleChange("nombre", e.target.value)}
                  placeholder="Ej: MDF Agency"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                  Descripción del negocio <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={profile.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  placeholder="¿Qué hace tu empresa? ¿Qué problema resuelve?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition resize-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                  Industria / Sector <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.industria}
                  onChange={(e) => handleChange("industria", e.target.value)}
                  placeholder="Ej: Marketing digital, E-commerce, SaaS..."
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              </div>
            </div>
          </Section>

          {/* ── 2. Comunicación y presencia ─────────────────────── */}
          <Section
            title="Comunicación y presencia"
            icon={<User size={14} />}
            defaultOpen={true}
          >
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                  Tono de comunicación <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TONOS.map((tono) => (
                    <button
                      key={tono}
                      type="button"
                      onClick={() => handleChange("tono", tono)}
                      className="px-3 py-2 rounded-lg text-xs font-medium border transition text-left"
                      style={
                        profile.tono === tono
                          ? { background: "#cbbeff", color: "#1e0061", border: "1px solid #cbbeff" }
                          : { background: "#201f1f", color: "#938e9e", border: "1px solid rgba(255,255,255,0.08)" }
                      }
                    >
                      {tono}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={!TONOS.includes(profile.tono) ? profile.tono : ""}
                  onChange={(e) => handleChange("tono", e.target.value)}
                  placeholder="O escribe tu propio tono..."
                  className="mt-2 w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                  Público objetivo <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={profile.publicoObjetivo}
                  onChange={(e) => handleChange("publicoObjetivo", e.target.value)}
                  placeholder="¿A quién va dirigido? Edad, intereses, dolores..."
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition resize-none"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                  URL de la web
                </label>
                <input
                  type="url"
                  value={profile.webUrl}
                  onChange={(e) => handleChange("webUrl", e.target.value)}
                  placeholder="https://tuempresa.com"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                  Redes sociales activas
                </label>
                <input
                  type="text"
                  value={profile.redesSociales}
                  onChange={(e) => handleChange("redesSociales", e.target.value)}
                  placeholder="Ej: @marca en Instagram y TikTok"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              </div>
            </div>
          </Section>

          {/* ── 3. Estrategia ────────────────────────────────────── */}
          <Section
            title="Estrategia de marca"
            icon={<User size={14} />}
            defaultOpen={false}
          >
            <div>
              <label className="block text-sm font-medium mb-1.5" style={labelStyle}>
                Diferenciadores clave
              </label>
              <textarea
                value={profile.diferenciadores}
                onChange={(e) => handleChange("diferenciadores", e.target.value)}
                placeholder="¿Por qué elegiría alguien tu marca?"
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition resize-none"
                style={inputStyle}
              />
            </div>
          </Section>

          {/* ── 4. API Key Anthropic ─────────────────────────────── */}
          <Section
            title="API Key de Anthropic"
            icon={<Key size={14} />}
            defaultOpen={!hasApiKey}
            badge={
              hasApiKey && !keySaved ? (
                <span
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                >
                  <CheckCircle size={10} /> Configurada
                </span>
              ) : keySaved ? (
                <span
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                >
                  <CheckCircle size={10} /> ¡Key guardada!
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(251,191,36,0.1)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.2)" }}
                >
                  Requerida
                </span>
              )
            }
          >
            <div>
              {!hasApiKey && (
                <p className="text-xs text-amber-400 mb-3 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Necesaria para activar todos los agentes de IA.
                </p>
              )}
              {hasApiKey && (
                <p className="text-xs mb-3" style={sublabelStyle}>
                  Ya tienes una key configurada. Ingresa una nueva para reemplazarla.
                </p>
              )}
              <div className="relative">
                <input
                  type={showApiKey ? "text" : "password"}
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder={hasApiKey ? "sk-ant-... (vacío = mantener la actual)" : "sk-ant-api03-..."}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-white text-sm outline-none transition font-mono"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                  style={{ color: "#938e9e" }}
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <ApiGuide
                steps={ANTHROPIC_GUIDE_STEPS}
                href="https://console.anthropic.com/settings/keys"
              />
            </div>
          </Section>

          {/* ── 5. API Key Gemini ────────────────────────────────── */}
          <Section
            title="Google Gemini API Key"
            icon={<Key size={14} />}
            defaultOpen={!hasGeminiKey}
            badge={
              hasGeminiKey ? (
                <span
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                >
                  <CheckCircle size={10} /> Configurada
                </span>
              ) : (
                <span
                  className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg"
                  style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa", border: "1px solid rgba(96,165,250,0.2)" }}
                >
                  Opcional
                </span>
              )
            }
          >
            <div>
              {!hasGeminiKey && (
                <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: "rgba(96,165,250,0.8)" }}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                  Alternativa económica a Claude. Flash 2.0 cuesta ~10× menos que Haiku.
                </p>
              )}
              {hasGeminiKey && (
                <p className="text-xs mb-3" style={sublabelStyle}>
                  Ya tienes una key configurada. Ingresa una nueva para reemplazarla.
                </p>
              )}
              <div className="relative">
                <input
                  type={showGeminiKey ? "text" : "password"}
                  value={geminiKeyInput}
                  onChange={(e) => setGeminiKeyInput(e.target.value)}
                  placeholder={hasGeminiKey ? "AIza... (vacío = mantener la actual)" : "AIzaSy..."}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl text-white text-sm outline-none transition font-mono"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowGeminiKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                  style={{ color: "#938e9e" }}
                >
                  {showGeminiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <ApiGuide
                steps={GEMINI_GUIDE_STEPS}
                href="https://aistudio.google.com/app/apikey"
              />
            </div>
          </Section>

          {/* ── 6. Modelos de IA ─────────────────────────────────── */}
          <Section
            title="Modelos de IA por sección"
            icon={<Cpu size={14} />}
            defaultOpen={false}
          >
            <div className="space-y-6">
              {MODEL_SECTIONS.map((section) => {
                const current = modelState[section.key].get;
                const setCurrent = modelState[section.key].set;
                return (
                  <div key={section.key}>
                    <div className="text-sm font-medium mb-0.5" style={labelStyle}>
                      {section.label}
                    </div>
                    <div className="text-xs mb-3" style={sublabelStyle}>
                      {section.description}
                    </div>

                    {/* Claude models */}
                    <div className="mb-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "rgba(147,142,158,0.6)" }}>
                        <span className="w-3 h-3 rounded-sm bg-orange-500/20 inline-flex items-center justify-center text-orange-400 text-[8px] font-bold">A</span>
                        Anthropic / Claude
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {CLAUDE_MODELS.map((m) => {
                          const isSelected = current === m.id;
                          const needsKey = !hasApiKey;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setCurrent(m.id)}
                              className="p-3 rounded-xl border text-left transition"
                              style={
                                isSelected
                                  ? { background: "rgba(203,190,255,0.08)", border: "1px solid rgba(203,190,255,0.3)", boxShadow: "0 0 0 1px rgba(203,190,255,0.2)" }
                                  : needsKey
                                  ? { background: "#201f1f", border: "1px solid rgba(255,255,255,0.06)", opacity: 0.5, cursor: "not-allowed" }
                                  : { background: "#201f1f", border: "1px solid rgba(255,255,255,0.06)" }
                              }
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-white">{m.label}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${MODEL_BADGE_COLORS[m.color]}`}>{m.badge}</span>
                              </div>
                              <div className="text-[11px] leading-snug" style={sublabelStyle}>{m.description}</div>
                              {isSelected && (
                                <div className="mt-2 flex items-center gap-1 text-[10px]" style={{ color: "#cbbeff" }}>
                                  <CheckCircle size={10} /> Activo
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Gemini models */}
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: "rgba(147,142,158,0.6)" }}>
                        <span className="w-3 h-3 rounded-sm bg-blue-500/20 inline-flex items-center justify-center text-blue-400 text-[8px] font-bold">G</span>
                        Google / Gemini
                        {!hasGeminiKey && (
                          <span className="normal-case tracking-normal font-normal" style={{ color: "rgba(147,142,158,0.4)" }}>
                            — configura tu key para activar
                          </span>
                        )}
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        {GEMINI_MODELS.map((m) => {
                          const isSelected = current === m.id;
                          const needsKey = !hasGeminiKey;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => !needsKey && setCurrent(m.id)}
                              disabled={needsKey}
                              className="p-3 rounded-xl border text-left transition"
                              style={
                                isSelected
                                  ? { background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.3)", boxShadow: "0 0 0 1px rgba(96,165,250,0.2)" }
                                  : needsKey
                                  ? { background: "#201f1f", border: "1px solid rgba(255,255,255,0.06)", opacity: 0.4, cursor: "not-allowed" }
                                  : { background: "#201f1f", border: "1px solid rgba(255,255,255,0.06)" }
                              }
                            >
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-semibold text-white">{m.label}</span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${MODEL_BADGE_COLORS[m.color]}`}>{m.badge}</span>
                              </div>
                              <div className="text-[11px] leading-snug" style={sublabelStyle}>{m.description}</div>
                              {isSelected && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-400">
                                  <CheckCircle size={10} /> Activo
                                </div>
                              )}
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

          {/* ── 7. Identidad Visual ──────────────────────────────── */}
          <Section
            title="Identidad Visual para Propuestas"
            icon={<Palette size={14} />}
            defaultOpen={false}
          >
            <div className="space-y-5">
              <p className="text-xs" style={{ color: "#938e9e" }}>
                Personaliza el branding de tus propuestas HTML generadas por IA.
              </p>

              {/* Logo */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#e5e2e1" }}>
                  Logo de la agencia
                </label>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { if (e.target.files?.[0]) handleLogoUpload(e.target.files[0]); }}
                />
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      style={{ maxHeight: 40, maxWidth: 120, objectFit: "contain", borderRadius: 6, background: "#2a2929", padding: "4px 8px" }}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-50 transition"
                    style={{ background: "#201f1f", border: "1px solid rgba(255,255,255,0.08)", color: "#e5e2e1" }}
                  >
                    {uploadingLogo ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                    {logoUrl ? "Cambiar logo" : "Subir logo"}
                  </button>
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl("")}
                      className="text-xs px-2 py-1 rounded text-red-400 hover:bg-red-400/10 transition"
                    >
                      Quitar
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="O pega una URL de imagen directamente..."
                  className="mt-2 w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#e5e2e1" }}>Color primario</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandPrimaryColor}
                      onChange={e => setBrandPrimaryColor(e.target.value)}
                      style={{ width: 40, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", background: "transparent" }}
                    />
                    <input
                      type="text"
                      value={brandPrimaryColor}
                      onChange={e => setBrandPrimaryColor(e.target.value)}
                      placeholder="#7C3AED"
                      className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm outline-none transition font-mono"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5" style={{ color: "#e5e2e1" }}>Color secundario</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={brandSecondaryColor}
                      onChange={e => setBrandSecondaryColor(e.target.value)}
                      style={{ width: 40, height: 36, borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", background: "transparent" }}
                    />
                    <input
                      type="text"
                      value={brandSecondaryColor}
                      onChange={e => setBrandSecondaryColor(e.target.value)}
                      placeholder="#EC4899"
                      className="flex-1 px-3 py-2.5 rounded-xl text-white text-sm outline-none transition font-mono"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>

              {/* Sender name */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#e5e2e1" }}>
                  Nombre del remitente
                </label>
                <p className="text-xs mb-1.5" style={{ color: "#938e9e" }}>Aparece en el footer de las propuestas como "Presentado por: …"</p>
                <input
                  type="text"
                  value={proposalSenderName}
                  onChange={e => setProposalSenderName(e.target.value)}
                  placeholder="Ej: Andrés García, Director Creativo"
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              </div>

              {/* Terms */}
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#e5e2e1" }}>
                  Términos y condiciones
                </label>
                <p className="text-xs mb-1.5" style={{ color: "#938e9e" }}>Se incluye al final de cada propuesta generada.</p>
                <textarea
                  value={termsConditions}
                  onChange={e => setTermsConditions(e.target.value)}
                  placeholder="Ej: El precio incluye 3 rondas de revisión. El 50% se abona al inicio del proyecto..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition resize-none"
                  style={inputStyle}
                />
              </div>
            </div>
          </Section>

          {/* ── Save button ──────────────────────────────────────── */}
          <div className="pt-2 pb-8">
            <button
              onClick={handleSave}
              disabled={saving || !profile.nombre || !profile.descripcion || !profile.tono || !profile.publicoObjetivo}
              className="flex items-center gap-2 px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed font-semibold rounded-xl text-sm transition"
              style={{ background: "linear-gradient(90deg, #cbbeff 0%, #9d85ff 100%)", color: "#1e0061" }}
            >
              {saved ? (
                <><CheckCircle size={15} /> Guardado</>
              ) : saving ? (
                <><Loader2 size={15} className="animate-spin" /> Guardando...</>
              ) : (
                <><Save size={15} /> Guardar perfil</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
