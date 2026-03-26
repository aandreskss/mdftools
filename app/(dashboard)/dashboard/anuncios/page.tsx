import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";
import AdLibrary from "@/components/AdLibrary";
import { Megaphone } from "lucide-react";

export default function AnunciosPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Megaphone size={15} className="text-orange-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Anuncios</h1>
            <p className="text-xs text-gray-500">Copy para Meta Ads, Google Ads y TikTok Ads</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <AdLibrary />
          <AgentBrain agentId="anuncios" />
        </div>
      </div>
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
