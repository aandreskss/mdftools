"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentPageHeader, { AgentPills } from "@/components/AgentPageHeader";

const ENTRADA = ["Video / Podcast", "Artículo de blog", "Post social", "Hilo de Twitter"];
const SALIDA = ["Todos los formatos", "Solo Instagram", "Solo LinkedIn", "Solo email"];

export default function RepurposingPage() {
  const [tipoEntrada, setTipoEntrada] = useState("Video / Podcast");
  const [tipoSalida, setTipoSalida] = useState("Todos los formatos");

  const agentContext = `El contenido de entrada es: ${tipoEntrada}. Formatos de salida deseados: ${
    tipoSalida === "Todos los formatos"
      ? "Post Instagram, Thread Twitter, Artículo blog corto, Guión Reel, Email newsletter, Post LinkedIn"
      : tipoSalida
  }.`;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      <AgentPageHeader
        title="Repurposing"
        description="Un contenido entra, múltiples formatos salen"
        icon={<RefreshCw size={16} />}
        iconBg="rgba(167,139,250,0.15)"
        iconColor="#a78bfa"
        agentId="repurposing"
      >
        <AgentPills label="Entrada" options={ENTRADA} value={tipoEntrada} onChange={setTipoEntrada} />
        <AgentPills label="Salida" options={SALIDA} value={tipoSalida} onChange={setTipoSalida} />
      </AgentPageHeader>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="repurposing"
          agentContext={agentContext}
          placeholder={`Pega tu ${tipoEntrada.toLowerCase()} aquí para transformarlo...`}
          suggestions={[
            `Transforma este ${tipoEntrada.toLowerCase()} en ${
              tipoSalida === "Todos los formatos"
                ? "6 formatos distintos"
                : tipoSalida.replace("Solo ", "")
            }`,
            "Extrae las 5 ideas principales de este contenido",
            "Adapta este contenido al tono de mi marca",
          ]}
        />
      </div>
    </div>
  );
}
