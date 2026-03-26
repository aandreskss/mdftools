"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, Loader2, Key, Eye, EyeOff, ExternalLink, Cpu } from "lucide-react";
import type { BrandProfile } from "@/types";
import { CLAUDE_MODELS, DEFAULT_MODEL_AGENTS, DEFAULT_MODEL_SEO, DEFAULT_MODEL_PROPOSALS } from "@/lib/user-settings";

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
];

const MODEL_BADGE_COLORS: Record<string, string> = {
  green:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  indigo: "bg-indigo-500/10  text-indigo-400  border-indigo-500/30",
  purple: "bg-purple-500/10  text-purple-400  border-purple-500/30",
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<BrandProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  // API key
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  // Model preferences
  const [modelAgents,    setModelAgents]    = useState(DEFAULT_MODEL_AGENTS);
  const [modelSeo,       setModelSeo]       = useState(DEFAULT_MODEL_SEO);
  const [modelProposals, setModelProposals] = useState(DEFAULT_MODEL_PROPOSALS);

  const modelState: Record<string, { get: string; set: (v: string) => void }> = {
    modelAgents:    { get: modelAgents,    set: setModelAgents },
    modelSeo:       { get: modelSeo,       set: setModelSeo },
    modelProposals: { get: modelProposals, set: setModelProposals },
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
            if (data.modelAgents)    setModelAgents(data.modelAgents);
            if (data.modelSeo)       setModelSeo(data.modelSeo);
            if (data.modelProposals) setModelProposals(data.modelProposals);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setLoading(false);
            return;
          }
        }
      } catch {}

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try { setProfile(JSON.parse(raw)); setHasProfile(true); } catch {}
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  function handleChange(field: keyof BrandProfile, value: string) {
    setProfile((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    const toSave = { ...profile, updatedAt: new Date().toISOString() };

    const body: Record<string, unknown> = {
      ...toSave,
      modelAgents,
      modelSeo,
      modelProposals,
    };
    if (apiKeyInput.trim()) body.anthropicApiKey = apiKeyInput.trim();

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
    } catch {}

    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setHasProfile(true);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 size={15} className="animate-spin" /> Cargando perfil...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Perfil de Marca</h1>
        <p className="text-gray-400 mt-1 text-sm">
          Este contexto se inyecta automáticamente en todos los agentes. Solo necesitas configurarlo una vez.
        </p>
      </div>

      {hasProfile && (
        <div className="mb-6 p-3 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-2">
          <CheckCircle size={15} className="text-green-400 flex-shrink-0" />
          <p className="text-green-300 text-sm">Perfil configurado — los agentes ya tienen contexto de tu marca.</p>
        </div>
      )}

      <div className="space-y-5">

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Nombre de la marca <span className="text-red-400">*</span>
          </label>
          <input type="text" value={profile.nombre}
            onChange={(e) => handleChange("nombre", e.target.value)}
            placeholder="Ej: MDF Agency"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Descripción del negocio <span className="text-red-400">*</span>
          </label>
          <textarea value={profile.descripcion}
            onChange={(e) => handleChange("descripcion", e.target.value)}
            placeholder="¿Qué hace tu empresa? ¿Qué problema resuelve?"
            rows={3}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>

        {/* Industria */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Industria / Sector <span className="text-red-400">*</span>
          </label>
          <input type="text" value={profile.industria}
            onChange={(e) => handleChange("industria", e.target.value)}
            placeholder="Ej: Marketing digital, E-commerce, SaaS..."
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Tono */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Tono de comunicación <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TONOS.map((tono) => (
              <button key={tono} type="button" onClick={() => handleChange("tono", tono)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition text-left ${
                  profile.tono === tono
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                }`}
              >{tono}</button>
            ))}
          </div>
          <input type="text"
            value={!TONOS.includes(profile.tono) ? profile.tono : ""}
            onChange={(e) => handleChange("tono", e.target.value)}
            placeholder="O escribe tu propio tono..."
            className="mt-2 w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Público objetivo */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Público objetivo <span className="text-red-400">*</span>
          </label>
          <textarea value={profile.publicoObjetivo}
            onChange={(e) => handleChange("publicoObjetivo", e.target.value)}
            placeholder="¿A quién va dirigido? Edad, intereses, dolores..."
            rows={2}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>

        {/* Diferenciadores */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Diferenciadores clave</label>
          <textarea value={profile.diferenciadores}
            onChange={(e) => handleChange("diferenciadores", e.target.value)}
            placeholder="¿Por qué elegiría alguien tu marca?"
            rows={2}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>

        {/* Web */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">URL de la web</label>
          <input type="url" value={profile.webUrl}
            onChange={(e) => handleChange("webUrl", e.target.value)}
            placeholder="https://tuempresa.com"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Redes sociales */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Redes sociales activas</label>
          <input type="text" value={profile.redesSociales}
            onChange={(e) => handleChange("redesSociales", e.target.value)}
            placeholder="Ej: @marca en Instagram y TikTok"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* ── API Key ──────────────────────────────────────────────── */}
        <div className="pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-1.5">
            <Key size={14} className="text-indigo-400" />
            <label className="block text-sm font-medium text-gray-300">API Key de Anthropic</label>
            {hasApiKey && !keySaved && (
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
                <CheckCircle size={11} /> Configurada
              </span>
            )}
            {keySaved && (
              <span className="ml-auto flex items-center gap-1 text-xs text-green-400">
                <CheckCircle size={11} /> ¡Key guardada!
              </span>
            )}
          </div>

          {!hasApiKey && (
            <p className="text-xs text-amber-400 mb-2 flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              Requerida para usar los agentes de IA.{" "}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noopener noreferrer"
                className="underline hover:text-amber-200 flex items-center gap-0.5">
                Obtener key <ExternalLink size={10} />
              </a>
            </p>
          )}
          {hasApiKey && (
            <p className="text-xs text-gray-500 mb-2">Ya tienes una key configurada. Ingresa una nueva para reemplazarla.</p>
          )}

          <div className="relative">
            <input
              type={showApiKey ? "text" : "password"}
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={hasApiKey ? "sk-ant-... (vacío = mantener la actual)" : "sk-ant-api03-..."}
              className="w-full px-4 py-2.5 pr-10 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition font-mono"
            />
            <button type="button" onClick={() => setShowApiKey((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition">
              {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
        </div>

        {/* ── Modelos de IA ────────────────────────────────────────── */}
        <div className="pt-2 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-4">
            <Cpu size={14} className="text-indigo-400" />
            <h3 className="text-sm font-medium text-gray-300">Modelo de IA por sección</h3>
          </div>

          <div className="space-y-5">
            {MODEL_SECTIONS.map((section) => {
              const current = modelState[section.key].get;
              const setCurrent = modelState[section.key].set;
              return (
                <div key={section.key}>
                  <div className="text-sm font-medium text-gray-300 mb-0.5">{section.label}</div>
                  <div className="text-xs text-gray-500 mb-3">{section.description}</div>
                  <div className="grid grid-cols-3 gap-2">
                    {CLAUDE_MODELS.map((m) => {
                      const isSelected = current === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setCurrent(m.id)}
                          className={`p-3 rounded-xl border text-left transition ${
                            isSelected
                              ? "bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500/50"
                              : "bg-gray-900 border-gray-700 hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-white">{m.label}</span>
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${MODEL_BADGE_COLORS[m.color]}`}>
                              {m.badge}
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-400 leading-snug">{m.description}</div>
                          {isSelected && (
                            <div className="mt-2 flex items-center gap-1 text-[10px] text-indigo-400">
                              <CheckCircle size={10} /> Seleccionado
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !profile.nombre || !profile.descripcion || !profile.tono || !profile.publicoObjetivo}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition"
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
  );
}
