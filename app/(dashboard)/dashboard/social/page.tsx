"use client";
import { useState } from "react";
import { Share2 } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import AgentBrain from "@/components/AgentBrain";

const PLATAFORMAS = ["Instagram", "TikTok", "LinkedIn", "Facebook", "X (Twitter)"];
const OBJETIVOS = ["Engagement", "Venta", "Educación", "Awareness"];

function Pills({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${value === o ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:text-white border border-gray-700"}`}>
          {o}
        </button>
      ))}
    </div>
  );
}

export default function SocialPage() {
  const [platform, setPlatform] = useState("Instagram");
  const [objetivo, setObjetivo] = useState("Engagement");
  const agentContext = `Plataforma: ${platform}. Objetivo: ${objetivo}.`;

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center"><Share2 size={15} className="text-pink-400" /></div>
            <div><h1 className="text-sm font-semibold text-white">Social Media</h1><p className="text-xs text-gray-500">Posts, captions y estrategia para redes</p></div>
          </div>
          <AgentBrain agentId="social" />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2"><span className="text-xs text-gray-500 w-16 flex-shrink-0">Plataforma</span><Pills options={PLATAFORMAS} value={platform} onChange={setPlatform} /></div>
          <div className="flex items-center gap-2"><span className="text-xs text-gray-500 w-16 flex-shrink-0">Objetivo</span><Pills options={OBJETIVOS} value={objetivo} onChange={setObjetivo} /></div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface agentId="social" agentContext={agentContext}
          placeholder={`Escribe qué contenido necesitas para ${platform}...`}
          suggestions={[`5 ideas de posts para ${platform}`, `Caption con CTA para ${platform}`, `Ideas virales para mi nicho en ${platform}`, `Post de ${objetivo.toLowerCase()} para ${platform}`]} />
      </div>
    </div>
  );
}
