import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";
import { Eye } from "lucide-react";

export default function CompetenciaPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-500/10 flex items-center justify-center">
            <Eye size={15} className="text-slate-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Spy Competencia</h1>
            <p className="text-xs text-gray-500">Analiza competidores y encuentra oportunidades</p>
          </div>
        </div>
        <AgentBrain agentId="competencia" />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="competencia"
          placeholder="Pega contenido de un competidor o pide un análisis..."
          suggestions={[
            "Analiza esta página de ventas de un competidor: [pega el texto]",
            "¿Cómo me diferencio de [nombre del competidor]?",
            "Analiza este anuncio de la competencia: [pega el copy]",
            "¿Qué estrategia de contenido usa [marca]?",
          ]}
        />
      </div>
    </div>
  );
}
