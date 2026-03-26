"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";

const FORMATOS = ["YouTube", "Reel / Short", "TikTok", "Podcast", "Presentación"];
const DURACIONES = ["Corto (30-60s)", "Medio (3-5min)", "Largo (10min+)"];

function Pills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
            value === o
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function GuionesPage() {
  const [formato, setFormato] = useState("YouTube");
  const [duracion, setDuracion] = useState("Medio (3-5min)");

  const agentContext = `Formato de video: ${formato}. Duración objetivo: ${duracion}.`;

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Video size={15} className="text-red-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Guiones</h1>
              <p className="text-xs text-gray-500">Videos, reels, podcasts y presentaciones</p>
            </div>
          </div>
          <AgentBrain agentId="guiones" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Formato</span>
            <Pills options={FORMATOS} value={formato} onChange={setFormato} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Duración</span>
            <Pills options={DURACIONES} value={duracion} onChange={setDuracion} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="guiones"
          agentContext={agentContext}
          placeholder={`Describe el video de ${formato} que quieres guionizar...`}
          suggestions={[
            `Guion de ${formato} de ${duracion.toLowerCase()} sobre [tema]`,
            `Hook de 3 segundos para un video de ${formato}`,
            `Estructura completa con B-roll para video de ${duracion.toLowerCase()}`,
            `Guion con CTA al final para ${formato}`,
          ]}
        />
      </div>
    </div>
  );
}
