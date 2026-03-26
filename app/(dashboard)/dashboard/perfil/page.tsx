"use client";

import { useState, useEffect } from "react";
import { Save, CheckCircle, Loader2 } from "lucide-react";
import type { BrandProfile } from "@/types";

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
  nombre: "",
  descripcion: "",
  industria: "",
  tono: "",
  publicoObjetivo: "",
  webUrl: "",
  redesSociales: "",
  diferenciadores: "",
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<BrandProfile>(defaultProfile);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      // Intenta cargar desde Supabase primero
      try {
        const res = await fetch("/api/brand-profile");
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setProfile(data);
            setHasProfile(true);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            setLoading(false);
            return;
          }
        }
      } catch {}

      // Fallback: localStorage
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        try {
          setProfile(JSON.parse(raw));
          setHasProfile(true);
        } catch {}
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

    // Guardar en Supabase
    try {
      await fetch("/api/brand-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toSave),
      });
    } catch {}

    // Guardar en localStorage como caché
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    setHasProfile(true);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-2 text-gray-500 text-sm">
        <Loader2 size={15} className="animate-spin" />
        Cargando perfil...
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
          <input
            type="text"
            value={profile.nombre}
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
          <textarea
            value={profile.descripcion}
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
          <input
            type="text"
            value={profile.industria}
            onChange={(e) => handleChange("industria", e.target.value)}
            placeholder="Ej: Marketing digital, E-commerce, SaaS, Salud, Educación..."
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
              <button
                key={tono}
                type="button"
                onClick={() => handleChange("tono", tono)}
                className={`px-3 py-2 rounded-lg text-xs font-medium border transition text-left ${
                  profile.tono === tono
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                }`}
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
            className="mt-2 w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Público objetivo */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Público objetivo <span className="text-red-400">*</span>
          </label>
          <textarea
            value={profile.publicoObjetivo}
            onChange={(e) => handleChange("publicoObjetivo", e.target.value)}
            placeholder="¿A quién va dirigido? Edad, intereses, dolores, aspiraciones..."
            rows={2}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>

        {/* Diferenciadores */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Diferenciadores clave
          </label>
          <textarea
            value={profile.diferenciadores}
            onChange={(e) => handleChange("diferenciadores", e.target.value)}
            placeholder="¿Por qué elegiría alguien tu marca sobre la competencia?"
            rows={2}
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition resize-none"
          />
        </div>

        {/* Web */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            URL de la web
          </label>
          <input
            type="url"
            value={profile.webUrl}
            onChange={(e) => handleChange("webUrl", e.target.value)}
            placeholder="https://tuempresa.com"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Redes sociales */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Redes sociales activas
          </label>
          <input
            type="text"
            value={profile.redesSociales}
            onChange={(e) => handleChange("redesSociales", e.target.value)}
            placeholder="Ej: @marca en Instagram y TikTok, LinkedIn como empresa"
            className="w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving || !profile.nombre || !profile.descripcion || !profile.tono || !profile.publicoObjetivo}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-sm transition"
          >
            {saved ? (
              <>
                <CheckCircle size={15} />
                Guardado
              </>
            ) : saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save size={15} />
                Guardar perfil
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
