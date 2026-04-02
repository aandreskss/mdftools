"use client";

import { useState } from "react";
import { X, TrendingUp, TrendingDown, Minus, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";

interface Competitor {
  name: string;
  domain: string;
  score: number;
  change: number;
  trend: "up" | "down" | "stable";
  strengths: string[];
  weaknesses: string[];
  vsUs: {
    metric: string;
    them: string;
    us: string;
    winner: "them" | "us" | "tie";
  }[];
  improvements: string[];
}

interface Props {
  brandName?: string;
  industry?: string;
}

function getCompetitors(brandName: string, industry: string): Competitor[] {
  // Generate contextual mock competitors based on brand profile
  const base = industry?.toLowerCase() || "marketing";
  return [
    {
      name: "ContentPeak Agency",
      domain: "contentpeak.io",
      score: 78,
      change: 12.4,
      trend: "up",
      strengths: ["Alta frecuencia de publicación (2x/día)", "SEO técnico sólido", "Fuerte presencia en LinkedIn"],
      weaknesses: ["Engagement bajo en Instagram", "Sin estrategia de video", "Copy repetitivo"],
      vsUs: [
        { metric: "Tráfico orgánico",   them: "42K/mes",  us: "18K/mes",   winner: "them" },
        { metric: "Seguidores totales",  them: "28K",      us: "12K",       winner: "them" },
        { metric: "Engagement rate",    them: "2.1%",     us: "4.8%",      winner: "us" },
        { metric: "Propuestas cerradas", them: "~15/mes", us: "en proceso", winner: "tie" },
      ],
      improvements: [
        "Aumentar frecuencia de publicación en LinkedIn",
        "Crear contenido de video corto (Reels/TikTok)",
        "Optimizar meta descriptions para SEO",
      ],
    },
    {
      name: "GrowthLab Media",
      domain: "growthlabmedia.co",
      score: 61,
      change: 3.1,
      trend: "stable",
      strengths: ["Buena estrategia de email marketing", "Casos de éxito bien documentados"],
      weaknesses: ["Presencia en redes sociales limitada", "Blog poco actualizado", "Sin video marketing"],
      vsUs: [
        { metric: "Tráfico orgánico",   them: "22K/mes",  us: "18K/mes",   winner: "them" },
        { metric: "Seguidores totales",  them: "9K",       us: "12K",       winner: "us" },
        { metric: "Engagement rate",    them: "1.9%",     us: "4.8%",      winner: "us" },
        { metric: "Frecuencia blog",    them: "2x/mes",   us: "en proceso", winner: "tie" },
      ],
      improvements: [
        "Superar su estrategia de email con mayor personalización",
        "Publicar casos de éxito propios con métricas reales",
        "Capitalizar su baja frecuencia en redes sociales",
      ],
    },
    {
      name: "NovaBrand Studio",
      domain: "novabrand.studio",
      score: 44,
      change: -5.2,
      trend: "down",
      strengths: ["Diseño visual fuerte", "Nicho bien definido"],
      weaknesses: ["Muy poco contenido SEO", "Sin automatización de marketing", "Alta rotación de clientes"],
      vsUs: [
        { metric: "Tráfico orgánico",   them: "8K/mes",  us: "18K/mes",  winner: "us" },
        { metric: "Seguidores totales",  them: "5K",      us: "12K",      winner: "us" },
        { metric: "Engagement rate",    them: "3.2%",    us: "4.8%",     winner: "us" },
        { metric: "Posicionamiento SEO", them: "Bajo",   us: "Medio",    winner: "us" },
      ],
      improvements: [
        "Mantener ventaja con contenido SEO consistente",
        "Destacar automatización IA como diferenciador clave",
        "Capturar su audiencia con mejor propuesta de valor",
      ],
    },
  ];
}

export default function CompetitorSpyCard({ brandName = "Tu Marca", industry = "marketing" }: Props) {
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedComp, setSelectedComp] = useState<Competitor | null>(null);

  const competitors = getCompetitors(brandName, industry);

  function openPanel(comp: Competitor) {
    setSelectedComp(comp);
    setPanelOpen(true);
  }

  return (
    <>
      <div
        className="flex flex-col gap-4 p-6 rounded-2xl h-full"
        style={{ background: "#2a2a2a" }}
      >
        <h3 className="font-bold text-[16px] text-white">Competitor Spy</h3>

        <div className="flex flex-col gap-3 flex-1">
          {competitors.map((comp) => (
            <div key={comp.name} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px]" style={{ color: "#cac4d5" }}>{comp.name}</span>
                <span
                  className="text-[12px] font-medium"
                  style={{ color: comp.trend === "up" ? "#4ade80" : comp.trend === "down" ? "#ffb4ab" : "#cbbeff" }}
                >
                  {comp.trend === "up" ? "+" : ""}{comp.change}%
                </span>
              </div>
              <div className="h-1.5 rounded-full" style={{ background: "#0e0e0e" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${comp.score}%`,
                    background: comp.score >= 70 ? "#cbbeff" : comp.score >= 50 ? "#9d85ff" : "#6b5aaa",
                  }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px]" style={{ color: "#938e9e" }}>Índice: {comp.score}/100</span>
                <button
                  onClick={() => openPanel(comp)}
                  className="text-[10px] font-medium transition-colors"
                  style={{ color: "rgba(203,190,255,0.6)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#cbbeff")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(203,190,255,0.6)")}
                >
                  Ver análisis →
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => openPanel(competitors[0])}
          className="w-full py-2 rounded-lg text-[12px] font-bold text-center transition-all"
          style={{
            color: "#cbbeff",
            border: "1px solid rgba(203,190,255,0.2)",
            background: "transparent",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(203,190,255,0.08)";
            e.currentTarget.style.borderColor = "rgba(203,190,255,0.4)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "rgba(203,190,255,0.2)";
          }}
        >
          Analizar Métricas
        </button>
      </div>

      {/* ── Analysis Panel ── */}
      {panelOpen && selectedComp && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setPanelOpen(false)}
          />

          {/* Slide-in panel */}
          <div
            className="fixed top-0 right-0 h-screen z-50 overflow-y-auto"
            style={{
              width: "min(640px, 95vw)",
              background: "#131313",
              borderLeft: "1px solid rgba(203,190,255,0.15)",
              boxShadow: "-8px 0 32px rgba(0,0,0,0.6)",
              animation: "slideInRight 0.25s ease",
            }}
          >
            {/* Panel header */}
            <div
              className="sticky top-0 flex items-center justify-between px-6 py-4 z-10"
              style={{
                background: "rgba(19,19,19,0.95)",
                borderBottom: "1px solid rgba(203,190,255,0.1)",
                backdropFilter: "blur(12px)",
              }}
            >
              <div>
                <h2 className="font-bold text-white text-[18px]">{selectedComp.name}</h2>
                <a
                  href={`https://${selectedComp.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] flex items-center gap-1"
                  style={{ color: "#938e9e" }}
                >
                  {selectedComp.domain} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex items-center gap-3">
                {/* Competitor selector */}
                <div className="flex gap-1">
                  {competitors.map(c => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedComp(c)}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-all"
                      style={{
                        background: selectedComp.name === c.name ? "rgba(203,190,255,0.15)" : "rgba(255,255,255,0.04)",
                        color: selectedComp.name === c.name ? "#cbbeff" : "#938e9e",
                        border: `1px solid ${selectedComp.name === c.name ? "rgba(203,190,255,0.3)" : "transparent"}`,
                      }}
                    >
                      {c.name.split(" ")[0]}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPanelOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ color: "#938e9e", background: "rgba(255,255,255,0.04)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#e5e2e1")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#938e9e")}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Score overview */}
              <div
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{ background: "#1c1b1b", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                <div className="text-center">
                  <div className="text-[32px] font-extrabold" style={{ color: "#cbbeff" }}>{selectedComp.score}</div>
                  <div className="text-[10px] uppercase tracking-wider" style={{ color: "#938e9e" }}>Índice</div>
                </div>
                <div className="flex-1">
                  <div className="h-2 rounded-full mb-2" style={{ background: "#0e0e0e" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${selectedComp.score}%`,
                        background: "linear-gradient(90deg, #cbbeff, #9d85ff)",
                      }}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedComp.trend === "up"
                      ? <TrendingUp className="w-4 h-4" style={{ color: "#4ade80" }} />
                      : selectedComp.trend === "down"
                      ? <TrendingDown className="w-4 h-4" style={{ color: "#ffb4ab" }} />
                      : <Minus className="w-4 h-4" style={{ color: "#cbbeff" }} />
                    }
                    <span
                      className="text-[13px] font-medium"
                      style={{ color: selectedComp.trend === "up" ? "#4ade80" : selectedComp.trend === "down" ? "#ffb4ab" : "#cbbeff" }}
                    >
                      {selectedComp.trend === "up" ? "+" : ""}{selectedComp.change}% este mes
                    </span>
                  </div>
                </div>
              </div>

              {/* Métricas comparativas */}
              <div>
                <h4 className="font-bold text-[13px] uppercase tracking-wider mb-3" style={{ color: "#938e9e" }}>
                  Comparativa de métricas
                </h4>
                <div className="space-y-2">
                  {selectedComp.vsUs.map(m => (
                    <div
                      key={m.metric}
                      className="flex items-center gap-3 p-3 rounded-lg"
                      style={{ background: "#1c1b1b" }}
                    >
                      <div className="flex-1">
                        <div className="text-[12px] font-medium" style={{ color: "#cac4d5" }}>{m.metric}</div>
                      </div>
                      <div className="flex items-center gap-2 text-[12px]">
                        <span
                          className="px-2 py-0.5 rounded font-medium"
                          style={{
                            background: m.winner === "them" ? "rgba(255,180,171,0.1)" : "rgba(255,255,255,0.05)",
                            color: m.winner === "them" ? "#ffb4ab" : "#938e9e",
                          }}
                        >
                          {m.them}
                        </span>
                        <span style={{ color: "#484553" }}>vs</span>
                        <span
                          className="px-2 py-0.5 rounded font-medium"
                          style={{
                            background: m.winner === "us" ? "rgba(74,222,128,0.1)" : "rgba(255,255,255,0.05)",
                            color: m.winner === "us" ? "#4ade80" : "#938e9e",
                          }}
                        >
                          {m.us}
                        </span>
                      </div>
                      <div>
                        {m.winner === "us"
                          ? <CheckCircle className="w-4 h-4" style={{ color: "#4ade80" }} />
                          : m.winner === "them"
                          ? <AlertTriangle className="w-4 h-4" style={{ color: "#ffb4ab" }} />
                          : <Minus className="w-4 h-4" style={{ color: "#938e9e" }} />
                        }
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-2 px-1 text-[10px]" style={{ color: "#938e9e" }}>
                  <span className="flex items-center gap-1"><span style={{ color: "#ffb4ab" }}>●</span> Ellos lideran</span>
                  <span className="flex items-center gap-1"><span style={{ color: "#4ade80" }}>●</span> Nosotros lideramos</span>
                  <span className="flex items-center gap-1"><span style={{ color: "#938e9e" }}>●</span> Empate</span>
                </div>
              </div>

              {/* Fortalezas */}
              <div>
                <h4 className="font-bold text-[13px] uppercase tracking-wider mb-3" style={{ color: "#938e9e" }}>
                  Sus fortalezas
                </h4>
                <div className="space-y-2">
                  {selectedComp.strengths.map(s => (
                    <div key={s} className="flex items-start gap-2 text-[13px]" style={{ color: "#cac4d5" }}>
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#ffb4ab" }} />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Debilidades */}
              <div>
                <h4 className="font-bold text-[13px] uppercase tracking-wider mb-3" style={{ color: "#938e9e" }}>
                  Sus debilidades
                </h4>
                <div className="space-y-2">
                  {selectedComp.weaknesses.map(w => (
                    <div key={w} className="flex items-start gap-2 text-[13px]" style={{ color: "#cac4d5" }}>
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#4ade80" }} />
                      {w}
                    </div>
                  ))}
                </div>
              </div>

              {/* Oportunidades de mejora */}
              <div
                className="p-5 rounded-xl"
                style={{ background: "rgba(203,190,255,0.06)", border: "1px solid rgba(203,190,255,0.15)" }}
              >
                <h4 className="font-bold text-[13px] uppercase tracking-wider mb-3" style={{ color: "#cbbeff" }}>
                  Acciones recomendadas
                </h4>
                <div className="space-y-3">
                  {selectedComp.improvements.map((imp, i) => (
                    <div key={i} className="flex items-start gap-3 text-[13px]" style={{ color: "#cac4d5" }}>
                      <span
                        className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                        style={{ background: "rgba(203,190,255,0.2)", color: "#cbbeff" }}
                      >
                        {i + 1}
                      </span>
                      {imp}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
