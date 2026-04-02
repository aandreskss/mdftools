"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Share2, FileText, Search, Megaphone, Video,
  Mail, RefreshCw, BarChart2, FileSignature, ChevronDown, X,
} from "lucide-react";

const TOOLS = [
  { id: "hooks",      label: "AI Hook Generator",  desc: "Ganchos virales en segundos",   href: "/dashboard/hooks",       icon: Zap,           color: "#cbbeff" },
  { id: "social",     label: "Social Media",        desc: "Posts para todas las redes",    href: "/dashboard/social",      icon: Share2,        color: "#60a5fa" },
  { id: "blog",       label: "Blog Builder",        desc: "Artículos SEO optimizados",     href: "/dashboard/blog",        icon: FileText,      color: "#34d399" },
  { id: "seo",        label: "SEO Rápido",          desc: "Análisis y recomendaciones",    href: "/dashboard/seo",         icon: Search,        color: "#f59e0b" },
  { id: "anuncios",   label: "Ads Manager",         desc: "Crea tus anuncios con IA",      href: "/dashboard/anuncios",    icon: Megaphone,     color: "#f87171" },
  { id: "guiones",    label: "Guiones",             desc: "Scripts para video y podcast",  href: "/dashboard/guiones",     icon: Video,         color: "#a78bfa" },
  { id: "emails",     label: "Email Marketing",     desc: "Correos que convierten",        href: "/dashboard/emails",      icon: Mail,          color: "#fb923c" },
  { id: "repurposing",label: "Repurposing",         desc: "Reutiliza tu contenido",        href: "/dashboard/repurposing", icon: RefreshCw,     color: "#4ade80" },
  { id: "seo-suite",  label: "SEO Suite",           desc: "Dashboard GSC multi-cliente",   href: "/dashboard/seo-suite",   icon: BarChart2,     color: "#818cf8" },
  { id: "propuestas", label: "Propuestas",          desc: "Propuestas comerciales con IA", href: "/dashboard/propuestas",  icon: FileSignature, color: "#f472b6" },
];

interface Props {
  defaultToolId?: string;
}

export default function QuickAccessCard({ defaultToolId = "hooks" }: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState(defaultToolId);
  const [pickerOpen, setPickerOpen] = useState(false);

  const tool = TOOLS.find(t => t.id === selectedId) ?? TOOLS[0];
  const Icon = tool.icon;

  return (
    <div
      className="relative flex flex-col items-center justify-center p-8 rounded-2xl h-full"
      style={{
        background: "linear-gradient(141deg, rgba(203,190,255,0.18) 0%, #2a2a2a 100%)",
        border: "1px solid rgba(203,190,255,0.12)",
      }}
    >
      {/* Picker toggle */}
      <button
        onClick={() => setPickerOpen(v => !v)}
        className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-all"
        style={{
          color: "rgba(203,190,255,0.6)",
          background: "rgba(203,190,255,0.08)",
          border: "1px solid rgba(203,190,255,0.15)",
        }}
        onMouseEnter={e => (e.currentTarget.style.color = "#cbbeff")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(203,190,255,0.6)")}
      >
        Cambiar <ChevronDown className="w-3 h-3" />
      </button>

      {/* Picker dropdown */}
      {pickerOpen && (
        <div
          className="absolute top-10 right-3 z-50 rounded-xl overflow-hidden"
          style={{
            background: "#1c1b1b",
            border: "1px solid rgba(203,190,255,0.15)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            width: "220px",
          }}
        >
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#938e9e]">Acceso Rápido</span>
            <button onClick={() => setPickerOpen(false)}>
              <X className="w-3.5 h-3.5 text-[#938e9e] hover:text-white transition-colors" />
            </button>
          </div>
          <div className="p-2 max-h-64 overflow-y-auto custom-scrollbar">
            {TOOLS.map(t => {
              const TIcon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedId(t.id); setPickerOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all"
                  style={{
                    background: selectedId === t.id ? "rgba(203,190,255,0.08)" : "transparent",
                    color: selectedId === t.id ? "#cbbeff" : "#cac4d5",
                  }}
                  onMouseEnter={e => {
                    if (selectedId !== t.id) e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                  }}
                  onMouseLeave={e => {
                    if (selectedId !== t.id) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <TIcon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: t.color }} />
                  <span className="text-[13px] font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tool icon */}
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(203,190,255,0.15)", border: "1px solid rgba(203,190,255,0.2)" }}
      >
        <Icon className="w-6 h-6" style={{ color: tool.color }} />
      </div>

      {/* Tool info */}
      <h3 className="font-bold text-[18px] text-white text-center tracking-tight mb-2">{tool.label}</h3>
      <p className="text-[13px] text-center mb-6" style={{ color: "#cac4d5" }}>{tool.desc}</p>

      {/* Launch button */}
      <button
        onClick={() => router.push(tool.href)}
        className="px-5 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider transition-all"
        style={{
          color: "#cbbeff",
          border: "1px solid rgba(203,190,255,0.3)",
          background: "transparent",
          letterSpacing: "1.2px",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = "rgba(203,190,255,0.1)";
          e.currentTarget.style.borderColor = "rgba(203,190,255,0.5)";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.borderColor = "rgba(203,190,255,0.3)";
        }}
      >
        Abrir
      </button>
    </div>
  );
}
