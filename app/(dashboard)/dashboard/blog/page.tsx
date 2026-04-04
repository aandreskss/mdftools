"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentPageHeader, { AgentPills } from "@/components/AgentPageHeader";

const EXTENSIONES = ["Corto (600 palabras)", "Medio (1200 palabras)", "Largo (2500+ palabras)"];

export default function BlogPage() {
  const [extension, setExtension] = useState("Medio (1200 palabras)");
  const [keyword, setKeyword] = useState("");

  const agentContext = [
    `Extensión del artículo: ${extension}.`,
    keyword.trim() ? `Keyword principal: "${keyword.trim()}".` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      <AgentPageHeader
        title="Blog SEO"
        description="Artículos optimizados listos para publicar"
        icon={<FileText size={16} />}
        iconBg="rgba(96,165,250,0.15)"
        iconColor="#60a5fa"
        agentId="blog"
      >
        <AgentPills label="Extensión" options={EXTENSIONES} value={extension} onChange={setExtension} />
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium flex-shrink-0 w-16" style={{ color: "#938e9e" }}>
            Keyword
          </span>
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="keyword principal..."
            className="px-3 py-1 rounded-lg text-[11px] text-white outline-none transition w-48"
            style={{
              background: "#201f1f",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "white",
            }}
          />
        </div>
      </AgentPageHeader>
      <div className="flex-1 overflow-hidden">
        <ChatInterface
          agentId="blog"
          agentContext={agentContext}
          placeholder="¿Sobre qué tema quieres escribir?"
          suggestions={[
            keyword ? `Outline para artículo sobre "${keyword}"` : "Outline para artículo sobre [tema]",
            keyword ? `Artículo completo optimizado para "${keyword}"` : "Artículo completo de 1200 palabras",
            "Meta title y description para este artículo",
            "Reescribe esta intro para que sea más atractiva y SEO-friendly",
          ]}
        />
      </div>
    </div>
  );
}
