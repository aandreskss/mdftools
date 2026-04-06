"use client";
import { useState } from "react";
import { Share2 } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentPageHeader, { AgentPills } from "@/components/AgentPageHeader";

const PLATAFORMAS = ["Instagram", "TikTok", "LinkedIn", "Facebook", "X (Twitter)"];
const OBJETIVOS = ["Engagement", "Venta", "Educación", "Awareness"];

export default function SocialPage() {
  const [platform, setPlatform] = useState("Instagram");
  const [objetivo, setObjetivo] = useState("Engagement");
  const agentContext = `Plataforma: ${platform}. Objetivo: ${objetivo}.`;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      <AgentPageHeader
        title="Social Media"
        description="Posts, captions y estrategia para redes"
        icon={<Share2 size={16} />}
        iconBg="rgba(236,72,153,0.15)"
        iconColor="#ec4899"
        agentId="social"
      >
        <AgentPills label="Plataforma" options={PLATAFORMAS} value={platform} onChange={setPlatform} />
        <AgentPills label="Objetivo" options={OBJETIVOS} value={objetivo} onChange={setObjetivo} />
      </AgentPageHeader>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="social"
          agentContext={agentContext}
          placeholder={`Escribe qué contenido necesitas para ${platform}...`}
          suggestions={[
            `5 ideas de posts para ${platform}`,
            `Caption con CTA para ${platform}`,
            `Ideas virales para mi nicho en ${platform}`,
            `Post de ${objetivo.toLowerCase()} para ${platform}`,
          ]}
        />
      </div>
    </div>
  );
}
