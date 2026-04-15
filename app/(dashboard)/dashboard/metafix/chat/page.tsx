"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Wrench, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { createCase } from "@/lib/metafix/actions";
import MetafixChatClient from "@/components/metafix/MetafixChatClient";
import type { MetafixArea } from "@/types";

const AREAS: { value: MetafixArea; label: string }[] = [
  { value: "waba",             label: "WhatsApp Business API" },
  { value: "meta_ads",         label: "Meta Ads" },
  { value: "catalogs",         label: "Catálogos" },
  { value: "business_manager", label: "Business Manager" },
  { value: "pixel",            label: "Píxel de Meta" },
  { value: "other",            label: "Otro" },
];

export default function NewCasePage() {
  const searchParams = useSearchParams();
  const defaultArea  = (searchParams.get("area") as MetafixArea) || "";

  const [title,    setTitle]    = useState("");
  const [area,     setArea]     = useState<MetafixArea | "">(defaultArea);
  const [creating, setCreating] = useState(false);
  const [caseId,   setCaseId]   = useState<string | null>(null);
  const [error,    setError]    = useState("");

  async function handleCreate() {
    if (!title.trim()) { setError("Escribí un título para el caso."); return; }
    setCreating(true);
    setError("");
    try {
      const newCase = await createCase(title.trim(), area as MetafixArea || undefined);
      setCaseId(newCase.id);
    } catch {
      setError("Error al crear el caso. Intenta de nuevo.");
      setCreating(false);
    }
  }

  // Once case is created, show the chat
  if (caseId) {
    return (
      <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 flex-shrink-0">
          <Link href="/dashboard/metafix" className="text-gray-500 hover:text-gray-300 transition">
            <ArrowLeft size={16} />
          </Link>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Wrench size={14} className="text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{title}</p>
            <p className="text-[11px] text-gray-500">MetaFix · Caso nuevo</p>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          <MetafixChatClient caseId={caseId} initialMessages={[]} currentStatus="open" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen items-center justify-center p-6" style={{ background: "#131313" }}>
      <div className="w-full max-w-md space-y-6">

        {/* Icon + title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Wrench size={24} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Nuevo caso MetaFix</h1>
            <p className="text-sm text-gray-500 mt-1">Describí brevemente tu problema para empezar</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4 rounded-2xl p-6" style={{ background: "#1c1b1b" }}>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Título del caso</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              placeholder="Ej: Cuenta publicitaria bloqueada, Error 131031..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 transition"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Área de Meta (opcional)</label>
            <div className="grid grid-cols-2 gap-2">
              {AREAS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => setArea(area === a.value ? "" : a.value)}
                  className="px-3 py-2 rounded-lg text-xs font-medium transition border text-left"
                  style={{
                    background: area === a.value ? "rgba(37,99,235,0.2)" : "#131313",
                    borderColor: area === a.value ? "#3b82f6" : "rgba(255,255,255,0.07)",
                    color: area === a.value ? "#93c5fd" : "#9ca3af",
                  }}
                >
                  {a.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <button
            onClick={handleCreate}
            disabled={creating || !title.trim()}
            className="w-full py-3 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "#2563eb" }}
          >
            {creating ? <><Loader2 size={15} className="animate-spin" /> Creando caso...</> : "Iniciar diagnóstico →"}
          </button>
        </div>

        <div className="text-center">
          <Link href="/dashboard/metafix" className="text-xs text-gray-500 hover:text-gray-400 transition">
            ← Volver a mis casos
          </Link>
        </div>
      </div>
    </div>
  );
}
