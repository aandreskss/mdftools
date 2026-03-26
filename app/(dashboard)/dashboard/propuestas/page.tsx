import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";
import { FileSignature } from "lucide-react";

export default function PropuestasPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FileSignature size={15} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Propuestas</h1>
            <p className="text-xs text-gray-500">Propuestas comerciales y presupuestos profesionales</p>
          </div>
        </div>
        <AgentBrain agentId="propuestas" />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="propuestas"
          placeholder="Describe el servicio o proyecto para la propuesta..."
          suggestions={[
            "Propuesta completa para gestión de redes sociales",
            "Presupuesto para un proyecto de SEO a 6 meses",
            "Propuesta de creación de contenido mensual",
            "Correo de seguimiento post-reunión con propuesta adjunta",
          ]}
        />
      </div>
    </div>
  );
}
