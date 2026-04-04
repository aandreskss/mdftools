"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Sparkles, Save, Loader2, Plus, Trash2,
  Link2, Check, Send, Calendar, FileText, ChevronDown, ChevronUp,
  Copy, ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RequiredAsset {
  name: string;
  description: string;
  format: string;
  deadline: string;
}

interface BriefData {
  projectSummary: string;
  mainObjectives: string[];
  successMetrics: string[];
  targetAudience: string;
  styleKeywords: string[];
  requiredAssets: RequiredAsset[];
}

interface Milestone {
  name: string;
  description: string;
  date: string;
  deliverables: string[];
  status: "pending" | "in_progress" | "done";
}

interface RevisionRound {
  roundNumber: number;
  date: string;
  durationDays: number;
  status: "pending" | "done";
}

interface CalendarData {
  projectStartDate: string;
  projectEndDate: string;
  milestones: Milestone[];
  revisionRounds: RevisionRound[];
  finalDeliveryDate: string;
  finalDeliverables: string[];
}

interface Proposal {
  id: string;
  client_name: string;
  industry: string;
  status: string;
  form_data: any;
  generated_content: string;
  brief_data: BriefData | null;
  calendar_data: CalendarData | null;
  brief_status: "none" | "draft" | "sent" | "approved";
  brief_token: string | null;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const emptyBrief = (): BriefData => ({
  projectSummary: "",
  mainObjectives: [""],
  successMetrics: [""],
  targetAudience: "",
  styleKeywords: [""],
  requiredAssets: [{ name: "", description: "", format: "", deadline: "" }],
});

const emptyCalendar = (): CalendarData => ({
  projectStartDate: new Date().toISOString().split("T")[0],
  projectEndDate: "",
  milestones: [],
  revisionRounds: [],
  finalDeliveryDate: "",
  finalDeliverables: [""],
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-white/[0.08] bg-[#0e0e0e] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all";
const textareaCls = `${inputCls} resize-none`;

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold uppercase tracking-[1.5px] mb-4" style={{ color: "#a78bfa" }}>
      {children}
    </h3>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.07] p-6 ${className}`} style={{ background: "#1a1a1a" }}>
      {children}
    </div>
  );
}

function BriefStatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    none:     { label: "Sin brief",         cls: "bg-white/5 text-slate-500" },
    draft:    { label: "Borrador",           cls: "bg-violet-500/10 text-violet-400" },
    sent:     { label: "Enviado al cliente", cls: "bg-blue-500/10 text-blue-400" },
    approved: { label: "✓ Aprobado",         cls: "bg-emerald-500/10 text-emerald-400" },
  };
  const s = map[status] ?? map.none;
  return (
    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${s.cls}`}>{s.label}</span>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function BriefPage() {
  const params = useParams();
  const router = useRouter();
  const proposalId = params.id as string;

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading,  setLoading]  = useState(true);

  const [brief,    setBrief]    = useState<BriefData>(emptyBrief());
  const [calendar, setCalendar] = useState<CalendarData>(emptyCalendar());

  const [genBrief,    setGenBrief]    = useState(false);
  const [genCalendar, setGenCalendar] = useState(false);
  const [savingBrief, setSavingBrief] = useState(false);
  const [savingCal,   setSavingCal]   = useState(false);
  const [sending,     setSending]     = useState(false);

  const [briefSaved,    setBriefSaved]    = useState(false);
  const [calSaved,      setCalSaved]      = useState(false);
  const [briefStatus,   setBriefStatus]   = useState<Proposal["brief_status"]>("none");
  const [briefToken,    setBriefToken]    = useState<string | null>(null);
  const [briefLink,     setBriefLink]     = useState<string | null>(null);
  const [copiedLink,    setCopiedLink]    = useState(false);
  const [projectDuration, setProjectDuration] = useState(30);

  // Accordion state
  const [briefOpen,    setBriefOpen]    = useState(true);
  const [calOpen,      setCalOpen]      = useState(false);
  const [sendOpen,     setSendOpen]     = useState(false);

  // ── Load proposal ──────────────────────────────────────────────────────────

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/design-proposals/${proposalId}`);
    if (res.ok) {
      const data: Proposal = await res.json();
      setProposal(data);
      if (data.brief_data)    setBrief(data.brief_data);
      if (data.calendar_data) setCalendar(data.calendar_data);
      setBriefStatus(data.brief_status ?? "none");
      setBriefToken(data.brief_token ?? null);
      if (data.brief_token) setBriefLink(`${window.location.origin}/brief/${data.brief_token}`);
    }
    setLoading(false);
  }, [proposalId]);

  useEffect(() => { load(); }, [load]);

  // ── Brief generation ───────────────────────────────────────────────────────

  async function generateBrief() {
    if (!proposal) return;
    setGenBrief(true);
    try {
      const res = await fetch("/api/design-proposals/brief/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal }),
      });
      if (res.ok) {
        const data: BriefData = await res.json();
        setBrief(data);
        setCalOpen(false);
      }
    } finally {
      setGenBrief(false);
    }
  }

  // ── Calendar generation ────────────────────────────────────────────────────

  async function generateCalendar() {
    if (!proposal || !brief.projectSummary) return;
    setGenCalendar(true);
    try {
      const res = await fetch("/api/design-proposals/calendar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proposal, brief, projectDuration }),
      });
      if (res.ok) {
        const data: CalendarData = await res.json();
        setCalendar(data);
      }
    } finally {
      setGenCalendar(false);
    }
  }

  // ── Save brief ─────────────────────────────────────────────────────────────

  async function saveBrief() {
    setSavingBrief(true);
    const res = await fetch("/api/design-proposals/brief/save", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: proposalId, brief_data: brief, brief_status: "draft" }),
    });
    setSavingBrief(false);
    if (res.ok) {
      setBriefSaved(true);
      setBriefStatus("draft");
      setTimeout(() => setBriefSaved(false), 2000);
      setCalOpen(true);
    }
  }

  // ── Save calendar ──────────────────────────────────────────────────────────

  async function saveCalendar() {
    setSavingCal(true);
    const res = await fetch("/api/design-proposals/brief/save", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: proposalId, calendar_data: calendar }),
    });
    setSavingCal(false);
    if (res.ok) {
      setCalSaved(true);
      setTimeout(() => setCalSaved(false), 2000);
      setSendOpen(true);
    }
  }

  // ── Send to client ─────────────────────────────────────────────────────────

  async function sendToClient() {
    setSending(true);
    const res = await fetch("/api/design-proposals/brief/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: proposalId }),
    });
    setSending(false);
    if (res.ok) {
      const { token } = await res.json();
      setBriefToken(token);
      setBriefStatus("sent");
      const link = `${window.location.origin}/brief/${token}`;
      setBriefLink(link);
    }
  }

  async function copyLink() {
    if (!briefLink) return;
    await navigator.clipboard.writeText(briefLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  // ─── Brief form helpers ────────────────────────────────────────────────────

  function updateBriefList(key: keyof BriefData, index: number, value: string) {
    setBrief(prev => {
      const arr = [...(prev[key] as string[])];
      arr[index] = value;
      return { ...prev, [key]: arr };
    });
  }
  function addBriefItem(key: keyof BriefData) {
    setBrief(prev => ({ ...prev, [key]: [...(prev[key] as string[]), ""] }));
  }
  function removeBriefItem(key: keyof BriefData, index: number) {
    setBrief(prev => {
      const arr = (prev[key] as string[]).filter((_, i) => i !== index);
      return { ...prev, [key]: arr.length ? arr : [""] };
    });
  }

  function updateAsset(index: number, field: keyof RequiredAsset, value: string) {
    setBrief(prev => {
      const assets = [...prev.requiredAssets];
      assets[index] = { ...assets[index], [field]: value };
      return { ...prev, requiredAssets: assets };
    });
  }
  function addAsset() {
    setBrief(prev => ({ ...prev, requiredAssets: [...prev.requiredAssets, { name: "", description: "", format: "", deadline: "" }] }));
  }
  function removeAsset(index: number) {
    setBrief(prev => ({ ...prev, requiredAssets: prev.requiredAssets.filter((_, i) => i !== index) }));
  }

  // ─── Calendar form helpers ─────────────────────────────────────────────────

  function updateMilestone(index: number, field: keyof Milestone, value: any) {
    setCalendar(prev => {
      const ms = [...prev.milestones];
      ms[index] = { ...ms[index], [field]: value };
      return { ...prev, milestones: ms };
    });
  }
  function addMilestone() {
    setCalendar(prev => ({
      ...prev,
      milestones: [...prev.milestones, { name: "", description: "", date: "", deliverables: [""], status: "pending" }],
    }));
  }
  function removeMilestone(index: number) {
    setCalendar(prev => ({ ...prev, milestones: prev.milestones.filter((_, i) => i !== index) }));
  }
  function updateMilestoneDeliverable(mi: number, di: number, value: string) {
    setCalendar(prev => {
      const ms = [...prev.milestones];
      const dels = [...ms[mi].deliverables];
      dels[di] = value;
      ms[mi] = { ...ms[mi], deliverables: dels };
      return { ...prev, milestones: ms };
    });
  }

  function updateRevision(index: number, field: keyof RevisionRound, value: any) {
    setCalendar(prev => {
      const rr = [...prev.revisionRounds];
      rr[index] = { ...rr[index], [field]: value };
      return { ...prev, revisionRounds: rr };
    });
  }
  function addRevision() {
    setCalendar(prev => ({
      ...prev,
      revisionRounds: [...prev.revisionRounds, { roundNumber: prev.revisionRounds.length + 1, date: "", durationDays: 3, status: "pending" }],
    }));
  }
  function removeRevision(index: number) {
    setCalendar(prev => ({ ...prev, revisionRounds: prev.revisionRounds.filter((_, i) => i !== index) }));
  }

  function updateFinalDel(index: number, value: string) {
    setCalendar(prev => {
      const arr = [...prev.finalDeliverables];
      arr[index] = value;
      return { ...prev, finalDeliverables: arr };
    });
  }

  // ─── Render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: "#131313" }}>
        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#a78bfa" }} />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4" style={{ background: "#131313" }}>
        <p className="text-slate-400">Propuesta no encontrada</p>
        <button onClick={() => router.push("/dashboard/propuestas/diseno")} className="text-violet-400 hover:text-violet-300 text-sm flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Volver
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 xl:p-8" style={{ background: "#131313" }}>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/dashboard/propuestas/diseno")}
          className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Mis propuestas de diseño
        </button>
        <BriefStatusBadge status={briefStatus} />
      </div>

      {/* Proposal info banner */}
      <div className="rounded-2xl border border-white/[0.07] p-6 mb-6" style={{ background: "#1a1a1a" }}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.1)" }}>
            <FileText className="w-5 h-5" style={{ color: "#a78bfa" }} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-white text-lg leading-snug">{proposal.client_name}</h1>
            <p className="text-sm text-slate-400">
              {proposal.industry}{proposal.form_data?.clientCompany ? ` · ${proposal.form_data.clientCompany}` : ""}
              {proposal.form_data?.price ? ` · ${proposal.form_data.currency ?? "USD"} ${proposal.form_data.price}` : ""}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div className="font-semibold text-slate-400 mb-1">Duración del proyecto</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={7}
                max={365}
                value={projectDuration}
                onChange={e => setProjectDuration(Number(e.target.value))}
                className="w-16 px-2 py-1.5 rounded-lg border border-white/[0.08] bg-[#0e0e0e] text-white text-xs text-center focus:outline-none focus:border-violet-500/50"
              />
              <span className="text-slate-500 text-xs">días</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-w-5xl">

        {/* ── BRIEF SECTION ── */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "#1a1a1a" }}>
          <button
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
            onClick={() => setBriefOpen(o => !o)}
          >
            <div className="flex items-center gap-3">
              <FileText className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <span className="font-bold text-white">Brief de Kickoff</span>
              {briefStatus !== "none" && <BriefStatusBadge status={briefStatus} />}
            </div>
            {briefOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {briefOpen && (
            <div className="px-6 pb-6 border-t border-white/[0.05] pt-6 space-y-6">

              {/* Generate button */}
              <button
                onClick={generateBrief}
                disabled={genBrief}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: genBrief ? "rgba(167,139,250,0.1)" : "rgba(167,139,250,0.15)", color: "#a78bfa", border: "1px solid rgba(167,139,250,0.25)" }}
              >
                {genBrief ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {genBrief ? "Generando brief..." : "Generar Brief con IA"}
              </button>

              {/* Resumen */}
              <div>
                <SectionTitle>Resumen ejecutivo</SectionTitle>
                <textarea
                  className={textareaCls}
                  rows={4}
                  placeholder="Describe el proyecto, para quién es y su propósito principal..."
                  value={brief.projectSummary}
                  onChange={e => setBrief(p => ({ ...p, projectSummary: e.target.value }))}
                />
              </div>

              {/* Objetivos */}
              <div>
                <SectionTitle>Objetivos principales</SectionTitle>
                <div className="space-y-2">
                  {brief.mainObjectives.map((obj, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className={inputCls}
                        placeholder={`Objetivo ${i + 1}`}
                        value={obj}
                        onChange={e => updateBriefList("mainObjectives", i, e.target.value)}
                      />
                      <button onClick={() => removeBriefItem("mainObjectives", i)} className="p-2.5 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addBriefItem("mainObjectives")} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors mt-1">
                    <Plus className="w-3.5 h-3.5" /> Agregar objetivo
                  </button>
                </div>
              </div>

              {/* Métricas */}
              <div>
                <SectionTitle>Métricas de éxito</SectionTitle>
                <div className="space-y-2">
                  {brief.successMetrics.map((m, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        className={inputCls}
                        placeholder={`Métrica ${i + 1}`}
                        value={m}
                        onChange={e => updateBriefList("successMetrics", i, e.target.value)}
                      />
                      <button onClick={() => removeBriefItem("successMetrics", i)} className="p-2.5 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addBriefItem("successMetrics")} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors mt-1">
                    <Plus className="w-3.5 h-3.5" /> Agregar métrica
                  </button>
                </div>
              </div>

              {/* Audiencia */}
              <div>
                <SectionTitle>Audiencia objetivo</SectionTitle>
                <textarea
                  className={textareaCls}
                  rows={3}
                  placeholder="Descripción demográfica, comportamientos y preferencias..."
                  value={brief.targetAudience}
                  onChange={e => setBrief(p => ({ ...p, targetAudience: e.target.value }))}
                />
              </div>

              {/* Keywords */}
              <div>
                <SectionTitle>Keywords de estilo</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {brief.styleKeywords.map((kw, i) => (
                    <div key={i} className="flex items-center gap-1 bg-violet-500/10 border border-violet-500/20 rounded-full pl-3 pr-1 py-1">
                      <input
                        className="bg-transparent text-violet-300 text-xs font-semibold w-24 focus:outline-none"
                        value={kw}
                        placeholder="keyword"
                        onChange={e => updateBriefList("styleKeywords", i, e.target.value)}
                      />
                      <button onClick={() => removeBriefItem("styleKeywords", i)} className="text-violet-500 hover:text-red-400 transition-colors p-0.5">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => addBriefItem("styleKeywords")} className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors px-3 py-1.5 rounded-full border border-violet-500/20 hover:border-violet-500/40">
                    <Plus className="w-3 h-3" /> Agregar
                  </button>
                </div>
              </div>

              {/* Assets requeridos */}
              <div>
                <SectionTitle>Assets requeridos del cliente</SectionTitle>
                <div className="space-y-3">
                  {brief.requiredAssets.map((asset, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.06] p-4 space-y-2" style={{ background: "#0e0e0e" }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Asset {i + 1}</span>
                        <button onClick={() => removeAsset(i)} className="ml-auto text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inputCls} placeholder="Nombre del asset" value={asset.name} onChange={e => updateAsset(i, "name", e.target.value)} />
                        <input className={inputCls} placeholder="Formato (PDF, AI, PNG...)" value={asset.format} onChange={e => updateAsset(i, "format", e.target.value)} />
                      </div>
                      <input className={inputCls} placeholder="Descripción de qué necesitamos" value={asset.description} onChange={e => updateAsset(i, "description", e.target.value)} />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-slate-500 w-24 flex-shrink-0">Fecha límite</label>
                        <input type="date" className={inputCls} value={asset.deadline} onChange={e => updateAsset(i, "deadline", e.target.value)} />
                      </div>
                    </div>
                  ))}
                  <button onClick={addAsset} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Agregar asset
                  </button>
                </div>
              </div>

              {/* Save brief */}
              <div className="flex justify-end pt-2 border-t border-white/[0.05]">
                <button
                  onClick={saveBrief}
                  disabled={savingBrief}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: "linear-gradient(90deg,#a78bfa,#7c3aed)", color: "#fff", opacity: savingBrief ? 0.7 : 1 }}
                >
                  {savingBrief ? <Loader2 className="w-4 h-4 animate-spin" /> : briefSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {savingBrief ? "Guardando..." : briefSaved ? "¡Guardado!" : "Guardar Brief"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── CALENDAR SECTION ── */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "#1a1a1a" }}>
          <button
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
            onClick={() => setCalOpen(o => !o)}
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <span className="font-bold text-white">Calendario del Proyecto</span>
              {calSaved && <span className="text-[10px] font-bold text-emerald-400">Guardado</span>}
            </div>
            {calOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {calOpen && (
            <div className="px-6 pb-6 border-t border-white/[0.05] pt-6 space-y-6">

              {/* Generate button */}
              <button
                onClick={generateCalendar}
                disabled={genCalendar || !brief.projectSummary}
                title={!brief.projectSummary ? "Guarda el brief primero" : ""}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: genCalendar ? "rgba(167,139,250,0.1)" : "rgba(167,139,250,0.15)",
                  color: "#a78bfa",
                  border: "1px solid rgba(167,139,250,0.25)",
                  opacity: !brief.projectSummary ? 0.5 : 1,
                }}
              >
                {genCalendar ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {genCalendar ? "Generando calendario..." : "Generar Calendario con IA"}
              </button>

              {/* Dates */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fecha de inicio</label>
                  <input type="date" className={inputCls} value={calendar.projectStartDate} onChange={e => setCalendar(p => ({ ...p, projectStartDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Fecha de fin</label>
                  <input type="date" className={inputCls} value={calendar.projectEndDate} onChange={e => setCalendar(p => ({ ...p, projectEndDate: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Entrega final</label>
                  <input type="date" className={inputCls} value={calendar.finalDeliveryDate} onChange={e => setCalendar(p => ({ ...p, finalDeliveryDate: e.target.value }))} />
                </div>
              </div>

              {/* Milestones */}
              <div>
                <SectionTitle>Milestones</SectionTitle>
                <div className="space-y-3">
                  {calendar.milestones.map((m, i) => (
                    <div key={i} className="rounded-xl border border-white/[0.06] p-4 space-y-2" style={{ background: "#0e0e0e" }}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-violet-400">Hito {i + 1}</span>
                        <button onClick={() => removeMilestone(i)} className="ml-auto text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input className={inputCls} placeholder="Nombre del hito" value={m.name} onChange={e => updateMilestone(i, "name", e.target.value)} />
                        <input type="date" className={inputCls} value={m.date} onChange={e => updateMilestone(i, "date", e.target.value)} />
                      </div>
                      <input className={inputCls} placeholder="Descripción" value={m.description} onChange={e => updateMilestone(i, "description", e.target.value)} />
                      <div>
                        <label className="text-[11px] text-slate-500 mb-1.5 block">Entregables del hito</label>
                        <div className="space-y-1.5">
                          {m.deliverables.map((d, di) => (
                            <div key={di} className="flex gap-2">
                              <input className={inputCls} placeholder="Entregable" value={d} onChange={e => updateMilestoneDeliverable(i, di, e.target.value)} />
                              <button onClick={() => {
                                const dels = m.deliverables.filter((_, idx) => idx !== di);
                                updateMilestone(i, "deliverables", dels.length ? dels : [""]);
                              }} className="p-2 text-slate-600 hover:text-red-400 transition-colors">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button onClick={() => updateMilestone(i, "deliverables", [...m.deliverables, ""])} className="text-violet-400 hover:text-violet-300 text-xs font-semibold flex items-center gap-1 transition-colors">
                            <Plus className="w-3 h-3" /> Agregar entregable
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <label className="text-xs text-slate-500">Estado</label>
                        <select value={m.status} onChange={e => updateMilestone(i, "status", e.target.value)} className="text-xs bg-[#0e0e0e] text-slate-300 border border-white/[0.08] rounded-lg px-2 py-1.5 focus:outline-none">
                          <option value="pending">Pendiente</option>
                          <option value="in_progress">En progreso</option>
                          <option value="done">Completado</option>
                        </select>
                      </div>
                    </div>
                  ))}
                  <button onClick={addMilestone} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Agregar hito
                  </button>
                </div>
              </div>

              {/* Revision rounds */}
              <div>
                <SectionTitle>Rondas de revisión</SectionTitle>
                <div className="space-y-2">
                  {calendar.revisionRounds.map((r, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-white/[0.06] p-3" style={{ background: "#0e0e0e" }}>
                      <span className="text-xs font-bold text-slate-400 w-16 flex-shrink-0">Ronda {r.roundNumber}</span>
                      <input type="date" className={inputCls} value={r.date} onChange={e => updateRevision(i, "date", e.target.value)} />
                      <div className="flex items-center gap-1.5">
                        <input type="number" min={1} max={14} className={`${inputCls} w-16`} value={r.durationDays} onChange={e => updateRevision(i, "durationDays", Number(e.target.value))} />
                        <span className="text-xs text-slate-500 flex-shrink-0">días</span>
                      </div>
                      <button onClick={() => removeRevision(i)} className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addRevision} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Agregar ronda de revisión
                  </button>
                </div>
              </div>

              {/* Final deliverables */}
              <div>
                <SectionTitle>Entregables finales</SectionTitle>
                <div className="space-y-2">
                  {calendar.finalDeliverables.map((d, i) => (
                    <div key={i} className="flex gap-2">
                      <input className={inputCls} placeholder={`Entregable final ${i + 1}`} value={d} onChange={e => updateFinalDel(i, e.target.value)} />
                      <button onClick={() => setCalendar(p => ({ ...p, finalDeliverables: p.finalDeliverables.filter((_, idx) => idx !== i) || [""] }))} className="p-2.5 text-slate-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/10">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => setCalendar(p => ({ ...p, finalDeliverables: [...p.finalDeliverables, ""] }))} className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs font-semibold transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Agregar entregable
                  </button>
                </div>
              </div>

              {/* Save calendar */}
              <div className="flex justify-end pt-2 border-t border-white/[0.05]">
                <button
                  onClick={saveCalendar}
                  disabled={savingCal}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                  style={{ background: "linear-gradient(90deg,#a78bfa,#7c3aed)", color: "#fff", opacity: savingCal ? 0.7 : 1 }}
                >
                  {savingCal ? <Loader2 className="w-4 h-4 animate-spin" /> : calSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {savingCal ? "Guardando..." : calSaved ? "¡Guardado!" : "Guardar Calendario"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── SEND SECTION ── */}
        <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "#1a1a1a" }}>
          <button
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
            onClick={() => setSendOpen(o => !o)}
          >
            <div className="flex items-center gap-3">
              <Send className="w-4 h-4" style={{ color: "#a78bfa" }} />
              <span className="font-bold text-white">Enviar al Cliente</span>
              {briefStatus === "approved" && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400">✓ Aprobado por el cliente</span>
              )}
            </div>
            {sendOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>

          {sendOpen && (
            <div className="px-6 pb-6 border-t border-white/[0.05] pt-6 space-y-4">

              {briefStatus === "approved" ? (
                <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.2)" }}>
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-emerald-400 font-bold text-sm">Brief aprobado por el cliente</p>
                    <p className="text-emerald-500/70 text-xs mt-0.5">El cliente revisó y aprobó el brief y calendario. El proyecto puede comenzar.</p>
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 text-sm">
                  Genera un enlace para que el cliente pueda revisar y aprobar el brief y calendario. Una vez aprobado, el proyecto puede comenzar.
                </p>
              )}

              {/* Generate / show link */}
              {!briefLink ? (
                <button
                  onClick={sendToClient}
                  disabled={sending || briefStatus === "none"}
                  title={briefStatus === "none" ? "Guarda el brief primero" : ""}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all"
                  style={{
                    background: "linear-gradient(90deg,#a78bfa,#7c3aed)",
                    color: "#fff",
                    opacity: (sending || briefStatus === "none") ? 0.6 : 1,
                  }}
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                  {sending ? "Generando enlace..." : "Generar enlace para el cliente"}
                </button>
              ) : (
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-slate-400">Enlace para el cliente</label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.08] bg-[#0e0e0e] text-violet-300 text-sm font-mono truncate">
                      {briefLink}
                    </div>
                    <button
                      onClick={copyLink}
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all flex-shrink-0"
                      style={{ borderColor: "rgba(167,139,250,0.3)", color: copiedLink ? "#34d399" : "#a78bfa", background: copiedLink ? "rgba(52,211,153,0.1)" : "rgba(167,139,250,0.1)" }}
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedLink ? "Copiado" : "Copiar"}
                    </button>
                    <a
                      href={briefLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/[0.08] text-xs font-bold text-slate-400 hover:text-white hover:border-white/20 transition-all flex-shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Ver
                    </a>
                  </div>

                  {/* Regenerate */}
                  <button
                    onClick={sendToClient}
                    disabled={sending}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
                  >
                    <Link2 className="w-3 h-3" /> Regenerar enlace
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
