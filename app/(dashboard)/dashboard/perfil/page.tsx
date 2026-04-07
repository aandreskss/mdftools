"use client";

import { useState, useEffect, useRef } from "react";
import { Save, CheckCircle, Loader2, Key, Eye, EyeOff, ExternalLink, Cpu, User, Palette, Upload } from "lucide-react";
import type { BrandProfile } from "@/types";
import { CLAUDE_MODELS, GEMINI_MODELS, DEFAULT_MODEL_AGENTS, DEFAULT_MODEL_SEO, DEFAULT_MODEL_PROPOSALS, DEFAULT_MODEL_WORKFLOWS } from "@/lib/user-settings";

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

  // Proposal branding fields
  const [logoUrl,             setLogoUrl]             = useState("");
  const [brandPrimaryColor,   setBrandPrimaryColor]   = useState("#7C3AED");
  const [brandSecondaryColor, setBrandSecondaryColor] = useState("#EC4899");
  const [proposalSenderName,  setProposalSenderName]  = useState("");
  const [termsConditions,     setTermsConditions]     = useState("");
  const [uploadingLogo,       setUploadingLogo]       = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
            setLoading(false);
            return;
          }
        }
      } catch { /* auth check failed, continue to localStorage fallback */ }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try { setProfile(JSON.parse(raw)); setHasProfile(true); } catch { /* invalid JSON in localStorage */ }
      }
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
      modelAgents,
      modelSeo,
      modelProposals,
      modelWorkflows,
      logoUrl,
      brandPrimaryColor,
      brandSecondaryColor,
      proposalSenderName,
      termsConditions,
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
    } catch { /* save failed silently */ }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setHasProfile(true);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-sm" style={{ color: "#938e9e" }}>
        <Loader2 size={15} className="animate-spin" /> Cargando perfil...
      </div>
    );
  }

  return (
    <div className="p-6 xl:p-8 min-h-screen" style={{ background: "#131313" }}>
      <div className="max-w-2xl">

        {/* Hero header */}
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

        <div className="space-y-5">

          {/* ── Card: Información básica ──────────────────────────── */}
          <div
            className="p-5 rounded-2xl space-y-5"
            style={{ background: "#1c1b1b" }}
          >
            {/* Nombre */}
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

            {/* Descripción */}
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

            {/* Industria */}
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

          {/* ── Card: Comunicación ───────────────────────────────── */}
          <div
            className="p-5 rounded-2xl space-y-5"
            style={{ background: "#1c1b1b" }}
          >
            {/* Tono */}
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

            {/* Público objetivo */}
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

            {/* Web */}
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

            {/* Redes sociales */}
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

          {/* ── Card: Estrategia ─────────────────────────────────── */}
          <div
            className="p-5 rounded-2xl space-y-5"
            style={{ background: "#1c1b1b" }}
          >
            {/* Diferenciadores */}
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
          </div>

          {/* ── Card: API Key Anthropic ──────────────────────────── */}
          <div
            className="p-5 rounded-2xl"
            style={{ background: "#1c1b1b" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Key size={14} style={{ color: "#cbbeff" }} />
              <label className="block text-sm font-medium" style={labelStyle}>
                API Key de Anthropic
              </label>
              {hasApiKey && !keySaved && (
                <span
                  className="ml-auto flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                >
                  <CheckCircle size={11} /> Configurada
                </span>
              )}
              {keySaved && (
                <span
                  className="ml-auto flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
                  style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                >
                  <CheckCircle size={11} /> ¡Key guardada!
                </span>
              )}
            </div>

            {!hasApiKey && (
              <p className="text-xs text-amber-400 mb-2 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
                Requerida para usar los agentes de IA.{" "}
                <a
                  href="https://console.anthropic.com/settings/keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:text-amber-200 flex items-center gap-0.5"
                >
                  Obtener key <ExternalLink size={10} />
                </a>
              </p>
            )}
            {hasApiKey && (
              <p className="text-xs mb-2" style={sublabelStyle}>
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
          </div>

          {/* ── Card: API Key Gemini ─────────────────────────────── */}
          <div
            className="p-5 rounded-2xl"
            style={{ background: "#1c1b1b" }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Key size={14} className="text-blue-400" />
                <h3 className="text-sm font-medium" style={labelStyle}>
                  Google Gemini API Key
                </h3>
                {hasGeminiKey && (
                  <span
                    className="flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg"
                    style={{ background: "rgba(74,222,128,0.1)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
                  >
                    <CheckCircle size={11} /> Configurada
                  </span>
                )}
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-400 underline hover:text-blue-200 flex items-center gap-0.5"
              >
                Obtener key <ExternalLink size={10} />
              </a>
            </div>

            {!hasGeminiKey && (
              <p className="text-xs text-blue-400/70 mb-2 flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                Alternativa económica a Claude. Flash 2.0 cuesta ~10x menos que Haiku.
              </p>
            )}
            {hasGeminiKey && (
              <p className="text-xs mb-2" style={sublabelStyle}>
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
          </div>

          {/* ── Card: Modelos de IA ───────────────────────────────── */}
          <div
            className="p-5 rounded-2xl"
            style={{ background: "#1c1b1b" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Cpu size={14} style={{ color: "#cbbeff" }} />
              <h3 className="text-sm font-medium" style={labelStyle}>
                Modelo de IA por sección
              </h3>
              <span className="text-xs" style={{ color: "rgba(147,142,158,0.6)" }}>
                — elige el proveedor y modelo para cada función
              </span>
            </div>

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
          </div>

          {/* ── Card: Propuestas — Identidad Visual ─────────────────── */}
          <div
            className="p-5 rounded-2xl space-y-5"
            style={{ background: "#1c1b1b" }}
          >
            <div className="flex items-center gap-2 mb-1">
              <Palette size={14} style={{ color: "#cbbeff" }} />
              <h3 className="text-sm font-medium" style={{ color: "#e5e2e1" }}>
                Identidad Visual para Propuestas
              </h3>
            </div>
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
              {logoUrl && (
                <input
                  type="text"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="O pega una URL de imagen..."
                  className="mt-2 w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              )}
              {!logoUrl && (
                <input
                  type="text"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="O pega una URL de imagen directamente..."
                  className="mt-2 w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={inputStyle}
                />
              )}
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#e5e2e1" }}>
                  Color primario
                </label>
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
                <label className="block text-sm font-medium mb-1.5" style={{ color: "#e5e2e1" }}>
                  Color secundario
                </label>
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

          {/* Save button */}
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
