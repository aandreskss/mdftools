"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";

const TIPOS = ["Bienvenida", "Nurturing", "Venta", "Reactivación", "Newsletter"];
const TEMPERATURA = ["Frío", "Tibio", "Caliente"];

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

export default function EmailsPage() {
  const [tipo, setTipo] = useState("Nurturing");
  const [temperatura, setTemperatura] = useState("Tibio");

  const agentContext = `Tipo de email/secuencia: ${tipo}. Temperatura del lead: ${temperatura} (${
    temperatura === "Frío" ? "no nos conoce, primera interacción" :
    temperatura === "Tibio" ? "nos conoce pero no ha comprado" :
    "interesado y listo para comprar"
  }). Incluye siempre 5 opciones de subject line por email.`;

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
              <Mail size={15} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Email Marketing</h1>
              <p className="text-xs text-gray-500">Secuencias, newsletters y subject lines</p>
            </div>
          </div>
          <AgentBrain agentId="emails" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-20 flex-shrink-0">Tipo</span>
            <Pills options={TIPOS} value={tipo} onChange={setTipo} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-20 flex-shrink-0">Lead</span>
            <Pills options={TEMPERATURA} value={temperatura} onChange={setTemperatura} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="emails"
          agentContext={agentContext}
          placeholder={`Escribe qué necesitas para tu secuencia de ${tipo.toLowerCase()}...`}
          suggestions={[
            `Secuencia de ${tipo.toLowerCase()} de 5 emails para lead ${temperatura.toLowerCase()}`,
            `Email individual de ${tipo.toLowerCase()} con 5 subject lines`,
            `Preview text optimizado para estos subjects: [pégalos]`,
            tipo === "Venta" ? "Email de urgencia para cierre de oferta" : `Estructura ideal para email de ${tipo.toLowerCase()}`,
          ]}
        />
      </div>
    </div>
  );
}
