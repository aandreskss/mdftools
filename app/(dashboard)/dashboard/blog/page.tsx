"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";

const EXTENSIONES = ["Corto (600 palabras)", "Medio (1200 palabras)", "Largo (2500+ palabras)"];

function Pills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
            value === o
              ? "bg-indigo-600 text-white"
              : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

export default function BlogPage() {
  const [extension, setExtension] = useState("Medio (1200 palabras)");
  const [keyword, setKeyword] = useState("");

  const agentContext = [
    `Extensión del artículo: ${extension}.`,
    keyword.trim() ? `Keyword principal: "${keyword.trim()}".` : "",
  ].filter(Boolean).join(" ");

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <FileText size={15} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-white">Blog SEO</h1>
              <p className="text-xs text-gray-500">Artículos optimizados listos para publicar</p>
            </div>
          </div>
          <AgentBrain agentId="blog" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Extensión</span>
            <Pills options={EXTENSIONES} value={extension} onChange={setExtension} />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 w-16 flex-shrink-0">Keyword</span>
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="keyword principal..."
              className="px-3 py-1 bg-gray-800 border border-gray-700 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition w-48"
            />
          </div>
        </div>
      </div>
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
