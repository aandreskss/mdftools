"use client";

import { useState, useEffect } from "react";
import {
  Kanban, Loader2, Building2, FileText, DollarSign,
  TrendingUp, Award, Megaphone, Palette,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CRMProposal {
  id: string;
  client_name: string;
  industry: string;
  status: string;
  created_at: string;
  module: "Marketing" | "Diseño" | "Ventas";
  form_data?: {
    clientLogo?: string;
    price?: string;
    currency?: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CRM_COLUMNS = [
  { key: "draft",        label: "Borrador",   color: "border-slate-700",   hdr: "bg-slate-500/10 text-slate-400" },
  { key: "generada",     label: "Generada",   color: "border-emerald-700", hdr: "bg-emerald-500/10 text-emerald-400" },
  { key: "sent",         label: "Enviada",    color: "border-blue-700",    hdr: "bg-blue-500/10 text-blue-400" },
  { key: "negotiating",  label: "Negociando", color: "border-amber-700",   hdr: "bg-amber-500/10 text-amber-400" },
  { key: "closed_won",   label: "Ganada",     color: "border-green-700",   hdr: "bg-green-500/10 text-green-400" },
  { key: "closed_lost",  label: "Perdida",    color: "border-red-700",     hdr: "bg-red-500/10 text-red-400" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:        { label: "Borrador",    color: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
  generada:     { label: "Generada",   color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  sent:         { label: "Enviada",    color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  negotiating:  { label: "Negociando", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  closed_won:   { label: "Ganada ✓",   color: "bg-green-500/10 text-green-400 border border-green-500/20" },
  closed_lost:  { label: "Perdida ✗",  color: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const MODULE_BADGE: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  Marketing: { label: "Marketing", color: "bg-violet-500/15 text-violet-300 border border-violet-500/25",   icon: Megaphone },
  Diseño:    { label: "Diseño",    color: "bg-blue-500/15 text-blue-300 border border-blue-500/25",         icon: Palette },
  Ventas:    { label: "Ventas",    color: "bg-amber-500/15 text-amber-300 border border-amber-500/25",      icon: TrendingUp },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CRMPropuestasPage() {
  const [proposals, setProposals] = useState<CRMProposal[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterModule, setFilterModule] = useState<"all" | "Marketing" | "Diseño" | "Ventas">("all");

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    setLoading(true);
    const res = await fetch("/api/crm-proposals");
    if (res.ok) setProposals(await res.json());
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    await fetch("/api/crm-proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
  }

  const filtered = filterModule === "all" ? proposals : proposals.filter(p => p.module === filterModule);

  // Stats
  const totalValue = filtered.reduce((s, p) => {
    const price = parseFloat((p.form_data?.price ?? "").replace(/,/g, "") || "0");
    return s + (isNaN(price) ? 0 : price);
  }, 0);
  const active   = filtered.filter(p => ["sent", "negotiating", "generada"].includes(p.status)).length;
  const won      = filtered.filter(p => p.status === "closed_won").length;
  const closedN  = filtered.filter(p => ["closed_won", "closed_lost"].includes(p.status)).length;
  const winRate  = closedN > 0 ? (won / closedN) * 100 : 0;

  const stats = [
    { label: "Total Propuestas", value: filtered.length.toString(),                                       icon: FileText,   accent: "#cbbeff" },
    { label: "Valor Total",      value: totalValue > 0 ? `$${totalValue.toLocaleString()}` : "—",         icon: DollarSign, accent: "#4ade80" },
    { label: "Activas",          value: active.toString(),                                                 icon: TrendingUp, accent: "#a78bfa" },
    { label: "Tasa de Cierre",   value: `${winRate.toFixed(0)}%`,                                         icon: Award,      accent: "#fb923c" },
  ];

  return (
    <div className="min-h-screen p-6 xl:p-8" style={{ background: "#131313" }}>

      {/* Hero header */}
      <div
        className="relative flex flex-col justify-between p-8 rounded-2xl overflow-hidden mb-6"
        style={{ background: "#1c1b1b" }}
      >
        <div
          className="absolute rounded-full pointer-events-none"
          style={{ top: "-30%", right: "-5%", width: "380px", height: "340px", background: "rgba(203,190,255,0.07)", filter: "blur(60px)" }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Kanban className="w-7 h-7" style={{ color: "#cbbeff" }} />
              <h1 className="font-extrabold text-[32px] text-white tracking-tight leading-tight">
                CRM <span style={{ color: "#cbbeff" }}>Pipeline</span>
              </h1>
            </div>
            <p className="text-[14px] ml-10" style={{ color: "#938e9e" }}>
              Pipeline unificado de todas tus propuestas
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="text-xs font-bold px-3 py-1.5 rounded-lg" style={{ background: "rgba(203,190,255,0.1)", color: "#cbbeff" }}>
              {filtered.length} propuesta{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-1 p-6 rounded-2xl"
            style={{ background: "#201f1f", borderLeft: `3px solid ${stat.accent}` }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-[1px]" style={{ color: "#938e9e" }}>
                {stat.label}
              </span>
              <stat.icon className="w-3.5 h-3.5" style={{ color: stat.accent }} />
            </div>
            <div className="font-bold text-[24px] text-white leading-tight">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Module filter */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "Marketing", "Diseño", "Ventas"] as const).map(mod => (
          <button
            key={mod}
            onClick={() => setFilterModule(mod)}
            className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border"
            style={filterModule === mod
              ? { background: "#cbbeff", color: "#1e0061", borderColor: "#cbbeff" }
              : { background: "transparent", color: "#938e9e", borderColor: "rgba(255,255,255,0.08)" }
            }
          >
            {mod === "all" ? "Todos" : mod}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-sm py-12" style={{ color: "#938e9e" }}>
          <Loader2 size={18} className="animate-spin" style={{ color: "#cbbeff" }} /> Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20"
          style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(28,27,27,0.4)" }}
        >
          <Kanban className="w-12 h-12 mb-4" style={{ color: "#2a2a2a" }} />
          <p className="text-white font-bold text-lg mb-2">No hay propuestas</p>
          <p className="text-sm" style={{ color: "#938e9e" }}>Crea propuestas desde los módulos de Marketing, Diseño o Ventas.</p>
        </div>
      ) : (
        /* Kanban */
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-5" style={{ minWidth: `${CRM_COLUMNS.length * 268}px` }}>
            {CRM_COLUMNS.map(col => {
              const cards  = filtered.filter(p => p.status === col.key);
              const colVal = cards.reduce((s, p) => {
                const price = parseFloat((p.form_data?.price ?? "").replace(/,/g, "") || "0");
                return s + (isNaN(price) ? 0 : price);
              }, 0);

              return (
                <div key={col.key} className="w-64 flex-shrink-0 flex flex-col">
                  {/* Column header */}
                  <div
                    className="mb-4 rounded-2xl p-4"
                    style={{ background: "#1c1b1b" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white text-sm">{col.label}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.hdr}`}>{cards.length}</span>
                    </div>
                    {colVal > 0 && (
                      <p className="text-xs" style={{ color: "#938e9e" }}>${colVal.toLocaleString()}</p>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="space-y-3 flex-1">
                    {cards.length === 0 ? (
                      <div
                        className="rounded-xl border-2 border-dashed p-4 text-center"
                        style={{ borderColor: "rgba(255,255,255,0.04)" }}
                      >
                        <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#2a2a2a" }}>vacío</p>
                      </div>
                    ) : (
                      cards.map(p => {
                        const logo  = p.form_data?.clientLogo;
                        const value = p.form_data?.price
                          ? `${p.form_data.currency ?? "USD"} ${p.form_data.price}`
                          : null;
                        const mod = MODULE_BADGE[p.module];
                        const ModIcon = mod?.icon;

                        return (
                          <div
                            key={p.id}
                            className="group rounded-xl p-4 transition-all"
                            style={{
                              background: "#201f1f",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.2)")}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                          >
                            {/* Module badge */}
                            <div className="mb-3">
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${mod?.color}`}>
                                {ModIcon && <ModIcon className="w-2.5 h-2.5" />}
                                {p.module}
                              </span>
                            </div>

                            {/* Client */}
                            <div className="flex items-center gap-2.5 mb-3">
                              {logo ? (
                                <img src={logo} alt="" className="w-8 h-8 rounded-lg object-cover border border-white/10 flex-shrink-0" style={{ background: "#131313" }} />
                              ) : (
                                <div
                                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors"
                                  style={{ background: "#131313", border: "1px solid rgba(255,255,255,0.05)", color: "#3a3a3a" }}
                                >
                                  <Building2 size={14} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="text-white text-sm font-semibold truncate block">{p.client_name}</span>
                                {p.industry && (
                                  <span className="text-[10px] truncate block" style={{ color: "#938e9e" }}>{p.industry}</span>
                                )}
                              </div>
                            </div>

                            {value && (
                              <p className="text-xs font-bold mb-3 px-2 py-0.5 rounded-md w-fit" style={{ color: "#4ade80", background: "rgba(74,222,128,0.1)" }}>{value}</p>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold uppercase" style={{ color: "#938e9e" }}>
                                {new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                              </span>
                              <select
                                value={p.status}
                                onChange={e => updateStatus(p.id, e.target.value)}
                                className="text-[10px] font-bold rounded-lg outline-none cursor-pointer transition-colors px-1.5 py-1"
                                style={{ background: "#131313", color: "#938e9e", border: "1px solid rgba(255,255,255,0.08)" }}
                                onClick={e => e.stopPropagation()}
                              >
                                {CRM_COLUMNS.map(c => (
                                  <option key={c.key} value={c.key}>{c.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
