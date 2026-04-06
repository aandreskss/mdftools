"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentPageHeader, { AgentPills } from "@/components/AgentPageHeader";

const TIPOS = ["Bienvenida", "Nurturing", "Venta", "Reactivación", "Newsletter"];
const TEMPERATURA = ["Frío", "Tibio", "Caliente"];

export default function EmailsPage() {
  const [tipo, setTipo] = useState("Nurturing");
  const [temperatura, setTemperatura] = useState("Tibio");

  const agentContext = `Tipo de email/secuencia: ${tipo}. Temperatura del lead: ${temperatura} (${
    temperatura === "Frío"
      ? "no nos conoce, primera interacción"
      : temperatura === "Tibio"
      ? "nos conoce pero no ha comprado"
      : "interesado y listo para comprar"
  }). Incluye siempre 5 opciones de subject line por email.`;

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      <AgentPageHeader
        title="Email Marketing"
        description="Secuencias, newsletters y subject lines"
        icon={<Mail size={16} />}
        iconBg="rgba(96,165,250,0.15)"
        iconColor="#60a5fa"
        agentId="emails"
      >
        <AgentPills label="Tipo" options={TIPOS} value={tipo} onChange={setTipo} />
        <AgentPills label="Lead" options={TEMPERATURA} value={temperatura} onChange={setTemperatura} />
      </AgentPageHeader>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="emails"
          agentContext={agentContext}
          placeholder={`Escribe qué necesitas para tu secuencia de ${tipo.toLowerCase()}...`}
          suggestions={[
            `Secuencia de ${tipo.toLowerCase()} de 5 emails para lead ${temperatura.toLowerCase()}`,
            `Email individual de ${tipo.toLowerCase()} con 5 subject lines`,
            `Preview text optimizado para estos subjects: [pégalos]`,
            tipo === "Venta"
              ? "Email de urgencia para cierre de oferta"
              : `Estructura ideal para email de ${tipo.toLowerCase()}`,
          ]}
        />
      </div>
    </div>
  );
}
