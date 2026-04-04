"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentPageHeader, { AgentPills } from "@/components/AgentPageHeader";

const TIPOS = ["Todos", "Pregunta", "Dato impactante", "Historia", "Provocación", "Promesa"];
const FORMATOS = ["Video (3s)", "Post texto", "Email subject", "Anuncio headline"];

export default function HooksPage() {
  const [tipo, setTipo] = useState("Todos");
  const [formatoHook, setFormatoHook] = useState("Video (3s)");

  const agentContext = `Formato del hook: ${formatoHook}. Tipo de hook: ${
    tipo === "Todos"
      ? "variados (pregunta, dato, historia, provocación, promesa)"
      : tipo
  }. Genera siempre mínimo 10 variaciones.`;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      <AgentPageHeader
        title="Hooks"
        description="Ganchos virales para cualquier formato"
        icon={<Zap size={16} />}
        iconBg="rgba(250,204,21,0.15)"
        iconColor="#facc15"
        agentId="hooks"
      >
        <AgentPills label="Tipo" options={TIPOS} value={tipo} onChange={setTipo} />
        <AgentPills label="Formato" options={FORMATOS} value={formatoHook} onChange={setFormatoHook} />
      </AgentPageHeader>
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
