"use client";

import ChatInterface from "@/components/ChatInterface";
import AgentPageHeader from "@/components/AgentPageHeader";
import { Search } from "lucide-react";

export default function SeoPage() {
  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      <AgentPageHeader
        title="SEO Rápido"
        description="Keywords, meta tags y análisis on-page"
        icon={<Search size={16} />}
        iconBg="rgba(52,211,153,0.15)"
        iconColor="#34d399"
        agentId="seo"
      />
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="seo"
          placeholder="Pide un análisis, keywords o mejoras SEO..."
          suggestions={[
            "Dame 20 keywords para mi nicho con intención de búsqueda",
            "Analiza este meta title y mejóralo",
            "¿Qué estructura debería tener una página de servicios?",
            "Genera meta title y description para [página]",
          ]}
        />
      </div>
    </div>
  );
}
