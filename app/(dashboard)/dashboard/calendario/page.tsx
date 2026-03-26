import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";
import { Calendar } from "lucide-react";

export default function CalendarioPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Calendar size={15} className="text-violet-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Calendario Editorial</h1>
            <p className="text-xs text-gray-500">Planificación estratégica de contenido</p>
          </div>
        </div>
        <AgentBrain agentId="calendario" />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="calendario"
          placeholder="¿Qué período quieres planificar?"
          suggestions={[
            "Calendario de contenido para las próximas 4 semanas",
            "Plan mensual para Instagram y TikTok",
            "Ideas de contenido para [mes] con fechas importantes",
            "Calendario de lanzamiento para [producto/servicio]",
          ]}
        />
      </div>
    </div>
  );
}
