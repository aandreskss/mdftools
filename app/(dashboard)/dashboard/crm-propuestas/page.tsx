"use client";

import { useState, useEffect } from "react";
import {
  Kanban, Loader2, Building2, FileText, DollarSign,
  TrendingUp, Award, Eye, Megaphone, Palette, ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CRMProposal {
  id: string;
  client_name: string;
  industry: string;
  status: string;
  created_at: string;
  module: "Marketing" | "Diseño";
  form_data?: {
    clientLogo?: string;
    price?: string;
    currency?: string;
  };
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CRM_COLUMNS = [
  { key: "draft",        label: "Borrador",   color: "border-slate-700",  hdr: "bg-slate-500/10 text-slate-400" },
  { key: "generada",     label: "Generada",   color: "border-emerald-700", hdr: "bg-emerald-500/10 text-emerald-400" },
  { key: "sent",         label: "Enviada",    color: "border-brand-700",  hdr: "bg-brand-500/10 text-brand-400" },
  { key: "negotiating",  label: "Negociando", color: "border-amber-700",  hdr: "bg-amber-500/10 text-amber-400" },
  { key: "closed_won",   label: "Ganada",     color: "border-green-700",  hdr: "bg-green-500/10 text-green-400" },
  { key: "closed_lost",  label: "Perdida",    color: "border-red-700",    hdr: "bg-red-500/10 text-red-400" },
];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:        { label: "Borrador",    color: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
  generada:     { label: "Generada",   color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  sent:         { label: "Enviada",    color: "bg-brand-500/10 text-brand-400 border border-brand-500/20" },
  negotiating:  { label: "Negociando", color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  closed_won:   { label: "Ganada ✓",   color: "bg-green-500/10 text-green-400 border border-green-500/20" },
  closed_lost:  { label: "Perdida ✗",  color: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const MODULE_BADGE: Record<string, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  Marketing: { label: "Marketing", color: "bg-brand-500/15 text-brand-300 border border-brand-500/25",   icon: Megaphone },
  Diseño:    { label: "Diseño",    color: "bg-violet-500/15 text-violet-300 border border-violet-500/25", icon: Palette },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function CRMPropuestasPage() {
  const [proposals, setProposals] = useState<CRMProposal[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filterModule, setFilterModule] = useState<"all" | "Marketing" | "Diseño">("all");

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
    { label: "Total Propuestas", value: filtered.length.toString(),                                         icon: FileText,   color: "text-brand-400" },
    { label: "Valor Total",      value: totalValue > 0 ? `$${totalValue.toLocaleString()}` : "—",           icon: DollarSign, color: "text-emerald-400" },
    { label: "Activas",          value: active.toString(),                                                   icon: TrendingUp, color: "text-purple-400" },
    { label: "Tasa de Cierre",   value: `${winRate.toFixed(0)}%`,                                           icon: Award,      color: "text-yellow-400" },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Kanban className="w-7 h-7 text-brand-400" />
          <h1 className="text-3xl font-bold tracking-tight text-white">CRM Propuestas</h1>
        </div>
        <p className="text-slate-400 text-sm ml-10">Pipeline unificado de todas tus propuestas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="rounded-xl border border-white/[0.07] bg-navy-900/40 p-5">
            <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <div className={`rounded-lg bg-white/[0.05] p-2.5 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Module filter */}
      <div className="flex items-center gap-2 mb-6">
        {(["all", "Marketing", "Diseño"] as const).map(mod => (
          <button
            key={mod}
            onClick={() => setFilterModule(mod)}
            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all border ${
              filterModule === mod
                ? "bg-white text-navy-950 border-white shadow-md"
                : "border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20"
            }`}
          >
            {mod === "all" ? "Todos" : mod}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500">{filtered.length} propuesta{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-slate-400 text-sm py-12">
          <Loader2 size={18} className="animate-spin text-brand-400" /> Cargando...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.05] bg-navy-900/20 py-20">
          <Kanban className="w-12 h-12 text-slate-700 mb-4" />
          <p className="text-white font-bold text-lg mb-2">No hay propuestas</p>
          <p className="text-slate-500 text-sm">Crea propuestas desde los módulos de Marketing o Diseño.</p>
        </div>
      ) : (
        /* Kanban */
        <div className="overflow-x-auto pb-6 -mx-8 px-8">
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
                  <div className={`mb-4 rounded-xl border ${col.color} bg-navy-900/40 p-4`}>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-white text-sm">{col.label}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${col.hdr}`}>{cards.length}</span>
                    </div>
                    {colVal > 0 && (
                      <p className="text-xs text-slate-400">${colVal.toLocaleString()}</p>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="space-y-3 flex-1">
                    {cards.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-white/[0.04] bg-navy-900/20 p-4 text-center">
                        <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest">vacío</p>
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
                            className="group rounded-xl border border-white/[0.08] bg-navy-900/40 p-4 transition-all hover:border-brand-500/30 hover:shadow-lg hover:shadow-brand/5"
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
                                <img src={logo} alt="" className="w-8 h-8 rounded-lg object-cover bg-navy-950 border border-white/10 flex-shrink-0" />
                              ) : (
                                <div className="w-8 h-8 rounded-lg bg-navy-950 border border-white/[0.05] flex items-center justify-center flex-shrink-0 text-slate-600 group-hover:text-brand-400 transition-colors">
                                  <Building2 size={14} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="text-white text-sm font-semibold truncate group-hover:text-brand-300 transition-colors block">{p.client_name}</span>
                                {p.industry && (
                                  <span className="text-slate-500 text-[10px] truncate block">{p.industry}</span>
                                )}
                              </div>
                            </div>

                            {value && (
                              <p className="text-emerald-400 text-xs font-bold mb-3 bg-emerald-500/10 px-2 py-0.5 rounded-md w-fit">{value}</p>
                            )}

                            <div className="flex items-center justify-between">
                              <span className="text-slate-500 text-[10px] font-bold uppercase">
                                {new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                              </span>
                              <select
                                value={p.status}
                                onChange={e => updateStatus(p.id, e.target.value)}
                                className="text-[10px] font-bold bg-navy-950 text-slate-400 rounded-lg border border-white/[0.08] outline-none cursor-pointer hover:border-brand-500/40 transition-colors px-1.5 py-1"
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
