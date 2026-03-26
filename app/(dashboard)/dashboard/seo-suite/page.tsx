import ChatInterface from "@/components/ChatInterface";
import { BarChart2 } from "lucide-react";

export default function SeoSuitePage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <BarChart2 size={15} className="text-purple-400" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-white">Dashboard GSC</h1>
          <p className="text-xs text-gray-500">Google Search Console — análisis y estrategia</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="seo-suite"
          placeholder="Pega tus datos de GSC o pide un análisis..."
          suggestions={[
            "Analiza estas keywords de GSC y prioriza oportunidades",
            "¿Qué páginas debería mejorar primero según estas métricas?",
            "Explica qué significa un CTR del 2% para esta posición",
            "Dame una estrategia de contenido basada en estas búsquedas",
          ]}
        />
      </div>
    </div>
  );
}
