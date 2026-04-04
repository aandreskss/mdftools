"use client";

import ChatInterface from "@/components/ChatInterface";
import AgentPageHeader from "@/components/AgentPageHeader";
import AdLibrary from "@/components/AdLibrary";
import { Megaphone } from "lucide-react";

export default function AnunciosPage() {
  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      <AgentPageHeader
        title="Anuncios"
        description="Copy para Meta Ads, Google Ads y TikTok Ads"
        icon={<Megaphone size={16} />}
        iconBg="rgba(251,191,36,0.15)"
        iconColor="#fbbf24"
        agentId="anuncios"
        extraActions={<AdLibrary />}
      />
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="anuncios"
          placeholder="¿Qué producto o servicio quieres anunciar?"
          suggestions={[
            "Crea 3 variaciones de anuncio para Meta Ads de mi servicio",
            "Headlines para Google Ads con keyword [término]",
            "Anuncio de conversión para un curso online",
            "Copy de retargeting para personas que visitaron mi web",
          ]}
        />
      </div>
    </div>
  );
}
