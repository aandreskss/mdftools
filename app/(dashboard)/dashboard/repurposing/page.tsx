"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";

const ENTRADA = ["Video / Podcast", "Artículo de blog", "Post social", "Hilo de Twitter"];
const SALIDA = ["Todos los formatos", "Solo Instagram", "Solo LinkedIn", "Solo email"];

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

export default function RepurposingPage() {
  const [tipoEntrada, setTipoEntrada] = useState("Video / Podcast");
  const [tipoSalida, setTipoSalida] = useState("Todos los formatos");

  const agentContext = `El contenido de entrada es: ${tipoEntrada}. Formatos de salida deseados: ${tipoSalida === "Todos los formatos" ? "Post Instagram, Thread Twitter, Artículo blog corto, Guión Reel, Email newsletter, Post LinkedIn" : tipoSalida}.`;

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center">
              <RefreshCw size={15} className="text-teal-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Repurposing</h1>
              <p className="text-xs text-gray-500">Un contenido entra, múltiples formatos salen</p>
            </div>
          </div>
          <AgentBrain agentId="repurposing" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Entrada</span>
            <Pills options={ENTRADA} value={tipoEntrada} onChange={setTipoEntrada} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Salida</span>
            <Pills options={SALIDA} value={tipoSalida} onChange={setTipoSalida} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="repurposing"
          agentContext={agentContext}
          placeholder={`Pega tu ${tipoEntrada.toLowerCase()} aquí para transformarlo...`}
          suggestions={[
            `Transforma este ${tipoEntrada.toLowerCase()} en ${tipoSalida === "Todos los formatos" ? "6 formatos distintos" : tipoSalida.replace("Solo ", "")}`,
            "Extrae las 5 ideas principales de este contenido",
            "Adapta este contenido al tono de mi marca",
          ]}
        />
      </div>
    </div>
  );
}
