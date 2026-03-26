"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";

const TIPOS = ["Todos", "Pregunta", "Dato impactante", "Historia", "Provocación", "Promesa"];
const FORMATOS = ["Video (3s)", "Post texto", "Email subject", "Anuncio headline"];

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

export default function HooksPage() {
  const [tipo, setTipo] = useState("Todos");
  const [formatoHook, setFormatoHook] = useState("Video (3s)");

  const agentContext = `Formato del hook: ${formatoHook}. Tipo de hook: ${tipo === "Todos" ? "variados (pregunta, dato, historia, provocación, promesa)" : tipo}. Genera siempre mínimo 10 variaciones.`;

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Zap size={15} className="text-yellow-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Hooks</h1>
              <p className="text-xs text-gray-500">Ganchos virales para cualquier formato</p>
            </div>
          </div>
          <AgentBrain agentId="hooks" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Tipo</span>
            <Pills options={TIPOS} value={tipo} onChange={setTipo} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Formato</span>
            <Pills options={FORMATOS} value={formatoHook} onChange={setFormatoHook} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="hooks"
          agentContext={agentContext}
          placeholder="¿Para qué tema o contenido necesitas el hook?"
          suggestions={[
            `10 hooks de ${tipo === "Todos" ? "distintos tipos" : tipo.toLowerCase()} para [tema]`,
            `Hooks para presentar un [producto/servicio] en ${formatoHook}`,
            "Hooks para el nicho de [tu industria]",
            "Mejora estos hooks que ya tengo: [pégalos aquí]",
          ]}
        />
      </div>
    </div>
  );
}
