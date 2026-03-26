import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";
import { Search } from "lucide-react";

export default function SeoPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Search size={15} className="text-green-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">SEO Rápido</h1>
            <p className="text-xs text-gray-500">Keywords, meta tags y análisis on-page</p>
          </div>
        </div>
        <AgentBrain agentId="seo" />
      </div>
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
