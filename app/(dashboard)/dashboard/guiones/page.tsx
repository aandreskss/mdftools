"use client";

import { useState } from "react";
import { Video } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentPageHeader, { AgentPills } from "@/components/AgentPageHeader";

const FORMATOS = ["YouTube", "Reel / Short", "TikTok", "Podcast", "Presentación"];
const DURACIONES = ["Corto (30-60s)", "Medio (3-5min)", "Largo (10min+)"];

export default function GuionesPage() {
  const [formato, setFormato] = useState("YouTube");
  const [duracion, setDuracion] = useState("Medio (3-5min)");

  const agentContext = `Formato de video: ${formato}. Duración objetivo: ${duracion}.`;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      <AgentPageHeader
        title="Guiones"
        description="Videos, reels, podcasts y presentaciones"
        icon={<Video size={16} />}
        iconBg="rgba(239,68,68,0.15)"
        iconColor="#ef4444"
        agentId="guiones"
      >
        <AgentPills label="Formato" options={FORMATOS} value={formato} onChange={setFormato} />
        <AgentPills label="Duración" options={DURACIONES} value={duracion} onChange={setDuracion} />
      </AgentPageHeader>
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
