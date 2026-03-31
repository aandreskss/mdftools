"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileSignature, Plus, ArrowLeft, ArrowRight, Sparkles,
  Copy, Check, Save, Loader2, Trash2, ChevronRight, FileText, Eye,
  Code, Download, RefreshCw, Pencil, Upload, Mail,
  MessageCircle, LayoutGrid, List, Building2, X, FileDown, Link2,
} from "lucide-react";
import AgentBrain from "@/components/AgentBrain";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProposalForm {
  // Tipo de propuesta (multi-select)
  serviceScope: string[];
  // Cliente
  clientName: string; clientCompany: string; clientIndustry: string; clientEmail: string;
  clientWhatsapp: string; clientLogo: string;
  // Servicio
  serviceType: string; serviceDescription: string;
  // Objetivos + KPIs
  clientGoals: string; currentSituation: string;
  kpi1Name: string; kpi1Start: string; kpi1Goal: string;
  kpi2Name: string; kpi2Start: string; kpi2Goal: string;
  kpi3Name: string; kpi3Start: string; kpi3Goal: string;
  // Alcance
  deliverables: string; duration: string; frequency: string; notIncluded: string;
  // Diagnóstico
  problemasDetectados: string; problemaRedesSociales: string;
  problemaWebLanding: string; debilidadesDetectadas: string; fortalezasDetectadas: string;
  // Buyer persona y dolores del cliente final
  buyerPersona: string; doloresFuncionales: string;
  doloresEmocionales: string; objecionesCliente: string;
  // Inversión
  price: string; currency: string; paymentTerms: string;
}

interface Proposal {
  id: string; client_name: string; industry: string;
  status: string; created_at: string; generated_content: string;
  html_content?: string; slides_content?: string;
  html_expires_at?: string;
  form_data?: ProposalForm;
}

const defaultForm: ProposalForm = {
  serviceScope: [],
  clientName: "", clientCompany: "", clientIndustry: "", clientEmail: "",
  clientWhatsapp: "", clientLogo: "",
  serviceType: "", serviceDescription: "",
  clientGoals: "", currentSituation: "",
  kpi1Name: "", kpi1Start: "", kpi1Goal: "",
  kpi2Name: "", kpi2Start: "", kpi2Goal: "",
  kpi3Name: "", kpi3Start: "", kpi3Goal: "",
  deliverables: "", duration: "", frequency: "", notIncluded: "",
  problemasDetectados: "", problemaRedesSociales: "",
  problemaWebLanding: "", debilidadesDetectadas: "", fortalezasDetectadas: "",
  buyerPersona: "", doloresFuncionales: "", doloresEmocionales: "", objecionesCliente: "",
  price: "", currency: "USD", paymentTerms: "",
};

const SERVICE_SCOPE_OPTIONS = [
  { id: "contenido",   label: "Contenido & Redes Sociales", desc: "Posts, Reels, Stories, calendario editorial" },
  { id: "meta_ads",    label: "Meta Ads",                   desc: "Publicidad en Instagram, Facebook y WhatsApp" },
  { id: "google_ads",  label: "Google Ads",                 desc: "Search, Display, Shopping y YouTube" },
  { id: "seo",         label: "SEO Orgánico",               desc: "Posicionamiento, keywords y link building" },
  { id: "sem",         label: "SEM",                        desc: "Búsqueda pagada, CPC y conversiones" },
  { id: "email",       label: "Email Marketing",            desc: "Campañas, automatizaciones y flows" },
  { id: "estrategia",  label: "Estrategia Integral",        desc: "Consultoría y plan de marketing completo" },
];

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "ARS", "PEN", "CLP"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  generada:     { label: "Generada",         color: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" },
  draft:        { label: "Borrador",         color: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
  sent:         { label: "Enviada",         color: "bg-brand-500/10 text-brand-400 border border-brand-500/20" },
  negotiating:  { label: "En negociación",  color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  closed_won:   { label: "Cerrada ✓",       color: "bg-green-500/10 text-green-400 border border-green-500/20" },
  closed_lost:  { label: "Cerrada ✗",       color: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const STEPS = ["Alcance", "Cliente", "Servicio", "Objetivos", "Detalle", "Diagnóstico", "Inversión", "Finalizar"];

// ─── Markdown components ───────────────────────────────────────────────────────

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0 tracking-tight">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl font-bold text-white mb-3 mt-5 first:mt-0 tracking-tight">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg font-semibold text-white mb-2 mt-4 first:mt-0 tracking-tight">{children}</h3>,
  p: ({ children }: any) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-300">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-300">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-300">{children}</ol>,
  li: ({ children }: any) => <li className="text-slate-300">{children}</li>,
  strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
  hr: () => <hr className="border-white/10 my-6" />,
};

// ─── Input helpers ─────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-200">
          {label} {required && <span className="text-brand-400">*</span>}
        </label>
        {hint && <span className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-navy-950 border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-brand-500/50 focus:ring-4 focus:ring-brand-500/10 transition-all duration-200";
const textareaCls = `${inputCls} resize-none min-h-[100px]`;

// ─── Main component ────────────────────────────────────────────────────────────

const CRM_COLUMNS = [
  { key: "draft",        label: "Borrador",        color: "border-slate-800" },
  { key: "generada",     label: "Generada",         color: "border-emerald-800" },
  { key: "sent",         label: "Enviada",          color: "border-brand-800" },
  { key: "negotiating",  label: "Negociando",       color: "border-amber-800" },
  { key: "closed_won",   label: "Ganada",           color: "border-green-800" },
  { key: "closed_lost",  label: "Perdida",          color: "border-red-800" },
];

export default function PropuestasPage() {
  const [view, setView]           = useState<"list" | "form" | "result">("list");
  const [crmMode, setCrmMode]     = useState(false);
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState<ProposalForm>(defaultForm);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingList, setLoadingList]       = useState(true);
  const [generating, setGenerating]         = useState(false);
  const [generatingHtml, setGeneratingHtml] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [structuredContent, setStructuredContent] = useState<any>(null);
  const [htmlContent, setHtmlContent]     = useState("");


  // Helper para convertir JSON a Markdown (para la pestaña "Propuesta")
  function jsonToMarkdown(data: any): string {
    if (!data) return "";
    return `
# ${data.tipoServicio}

## Resumen Ejecutivo
${data.resumenEjecutivo}

## Problemas Detectados
${data.problemasDetectados?.map((p: any) => `### ${p.titulo}\n${p.descripcion}`).join("\n\n")}

## Nuestra Solución
${data.solucion?.descripcion}
${data.solucion?.puntosClave?.map((k: any) => `- ${k}`).join("\n")}

## Entregables
${data.entregables?.map((e: any) => `- ${e}`).join("\n")}

## Metodología: Cómo Trabajamos
${data.proceso?.map((s: any) => `${s.numero}. **${s.titulo}**: ${s.descripcion}`).join("\n")}

## Resultados Esperados
${data.resultadosEsperados?.map((r: any) => `- ${r}`).join("\n")}

## Inversión
**Total:** ${data.inversion?.total}
**Incluye:**
${data.inversion?.incluye?.map((i: any) => `- ${i}`).join("\n")}
**Términos:** ${data.inversion?.terminos}

## ¿Por Qué Nosotros?
${data.porQueNosotros?.map((d: any) => `### ${d.titulo}\n${d.descripcion}`).join("\n\n")}

## Próximos Pasos
${data.proximosPasos?.map((s: any) => `- ${s}`).join("\n")}
    `.trim();
  }
  const [previewId, setPreviewId]         = useState<string | null>(null);
  const [previewTs, setPreviewTs]         = useState(0);
  const [htmlIframeKey, setHtmlIframeKey]     = useState(0);
  const [resultTab, setResultTab] = useState<"propuesta" | "html">("propuesta");
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [htmlExpiresAt, setHtmlExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft]   = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const htmlIframeRef    = useRef<HTMLIFrameElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchProposals(); }, []);

  useEffect(() => {
    if (generating) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [generatedContent, generating]);

  // Countdown del enlace HTML
  useEffect(() => {
    if (!htmlExpiresAt) { setTimeLeft(null); return; }
    const update = () => {
      const diff = new Date(htmlExpiresAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("expirado"); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      setTimeLeft(h > 0 ? `${h}h ${m}m` : `${m}m`);
    };
    update();
    const t = setInterval(update, 60_000);
    return () => clearInterval(t);
  }, [htmlExpiresAt]);

  // Al abrir propuesta guardada: inicializar IDs, contenido y form para poder regenerar/editar
  useEffect(() => {
    if (!viewingProposal) return;
    setSavedProposalId(viewingProposal.id);
    setPreviewId(viewingProposal.id);
    setGeneratedContent(viewingProposal.generated_content ?? "");
    setStructuredContent(null);
    setHtmlContent(viewingProposal.html_content ?? "");
    setHtmlExpiresAt(viewingProposal.html_expires_at ?? null);
    setPreviewTs(Date.now());
    if (viewingProposal.form_data) setForm({ ...defaultForm, ...viewingProposal.form_data });
    if (viewingProposal.html_content) setHtmlIframeKey(k => k + 1);
  }, [viewingProposal]);

  // Escribir HTML directamente al DOM del iframe (hereda origen del padre → CDN funciona)
  // IMPORTANTE: resultTab en dependencias para que dispare cuando el iframe monta al cambiar de tab
  useEffect(() => {
    if (!htmlContent || resultTab !== "html") return;
    const write = () => {
      const iframe = htmlIframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (doc) { doc.open(); doc.write(htmlContent); doc.close(); }
    };
    const t = setTimeout(write, 100);
    return () => clearTimeout(t);
  }, [htmlContent, htmlIframeKey, resultTab]);

  async function fetchProposals() {
    setLoadingList(true);
    const res = await fetch("/api/proposals");
    if (res.ok) setProposals(await res.json());
    setLoadingList(false);
  }

  async function uploadLogo(file: File) {
    setUploadingLogo(true);
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/proposals/upload-logo", { method: "POST", body: fd });
    if (res.ok) {
      const { url } = await res.json();
      setForm(p => ({ ...p, clientLogo: url }));
    }
    setUploadingLogo(false);
  }

  async function updateProposalStatus(id: string, status: string) {
    await fetch("/api/proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  function sendViaWhatsApp(proposal: Proposal | null) {
    const phone = (proposal?.form_data?.clientWhatsapp ?? form.clientWhatsapp).replace(/\D/g, "");
    const name = proposal?.client_name ?? form.clientName;
    const company = proposal?.form_data?.clientCompany ?? form.clientCompany;
    const id = savedProposalId ?? proposal?.id;
    const link = id ? `\n\n🔗 Ver propuesta online: ${window.location.origin}/p/${id}` : "";
    const msg = encodeURIComponent(
      `Hola ${name || ""}! 👋\n\nTe comparto la propuesta comercial que preparamos especialmente para ${company || name || "ti"}.${link}\n\nQuedo disponible para cualquier consulta o para agendar una llamada. ¡Espero tu respuesta!`
    );
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  }

  function sendViaEmail(proposal: Proposal | null) {
    const email = proposal?.form_data?.clientEmail ?? form.clientEmail;
    const name = proposal?.client_name ?? form.clientName;
    const id = savedProposalId ?? proposal?.id;
    const link = id ? `\n\n🔗 Ver propuesta online: ${window.location.origin}/p/${id}` : "";
    const subject = encodeURIComponent(`Propuesta comercial para ${name}`);
    const body = encodeURIComponent(
      `Hola ${name},\n\nTe comparto la propuesta comercial que preparamos para ti.${link}\n\nEstamos a tu disposición para resolver cualquier duda.\n\n¡Saludos!`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  }

  function set(field: keyof ProposalForm, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function toggleScope(id: string) {
    setForm(prev => ({
      ...prev,
      serviceScope: prev.serviceScope.includes(id)
        ? prev.serviceScope.filter(s => s !== id)
        : [...prev.serviceScope, id],
    }));
  }

  function canNext(): boolean {
    if (step === 0) return form.serviceScope.length > 0;
    if (step === 1) return !!form.clientName && !!form.clientIndustry;
    if (step === 2) return !!form.serviceDescription;
    if (step === 3) return !!form.clientGoals;
    if (step === 4) return !!form.deliverables && !!form.duration;
    if (step === 5) return true; // Diagnóstico: todos opcionales
    if (step === 6) return !!form.price && !!form.paymentTerms;
    return true;
  }

  // ─── Generate proposal (unificada) ───────────────────────────────────────────

  async function generate() {
    setGenerating(true);
    setGeneratedContent("");
    setHtmlContent("");
    setStructuredContent(null);

    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || errBody.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setStructuredContent(data);
      
      const md = jsonToMarkdown(data);
      setGeneratedContent(md);

      // Actualiza viewingProposal en estado para que renderResult muestre el nuevo contenido
      setViewingProposal(prev =>
        prev ? { ...prev, generated_content: md, status: "generada", form_data: form } : null
      );

      setView("result");
      setResultTab("propuesta");

      // Si la propuesta ya estaba guardada, sincroniza todo en Supabase
      if (savedProposalId && md) {
        await fetch("/api/proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: savedProposalId,
            generated_content: md,
            status: "generada",
            client_name: form.clientName,
            industry: form.clientIndustry,
            form_data: form,
          }),
        });
        await fetchProposals();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      setGeneratedContent(`⚠️ Error al generar la propuesta\n\n**Detalle:** ${msg}\n\nRevisa tu API key y modelo en Perfil de Marca.`);
      setView("result");
    } finally {
      setGenerating(false);
    }
  }

  // ─── Generate HTML ───────────────────────────────────────────────────────────

  function stripFences(content: string): string {
    return content
      .replace(/^```html\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();
  }

  async function generateHtml(markdownContent: string) {
    setGeneratingHtml(true);
    setHtmlContent("");
    setResultTab("html");

    try {
      const res = await fetch("/api/proposals/html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: markdownContent,
          clientName: viewingProposal?.client_name ?? form.clientName,
          clientCompany: form.clientCompany,
          price: `${form.currency} ${form.price}`,
          structuredContent: structuredContent, // Pasamos el JSON si existe
        }),
      });

      if (res.status === 402) {
        setHtmlContent("");
        setResultTab("propuesta");
        alert("⚠️ Debes configurar tu API key de Anthropic en Perfil de Marca para usar esta función.");
        return;
      }
      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setHtmlContent(stripFences(accumulated));
      }

      // Auto-guardar en Supabase
      const id = savedProposalId ?? viewingProposal?.id;
      if (id && accumulated) {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await fetch("/api/proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, html_content: stripFences(accumulated), html_expires_at: expires }),
        });
        setHtmlExpiresAt(expires);
        setPreviewId(id);
        setPreviewTs(Date.now());
        setHtmlIframeKey(k => k + 1);
        await fetchProposals();
      }
    } catch {
      setHtmlContent("<p>Error al generar el HTML.</p>");
    } finally {
      setGeneratingHtml(false);
    }
  }

  function downloadHtml() {
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `propuesta-${(viewingProposal?.client_name ?? form.clientName).toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Save / Delete ───────────────────────────────────────────────────────────

  async function saveProposal() {
    setSaving(true);
    const res = await fetch("/api/proposals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clientName: form.clientName,
        clientIndustry: form.clientIndustry,
        formData: form,
        generatedContent,
        htmlContent,
        status: "generada",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.id) { setSavedProposalId(data.id); setPreviewId(data.id); setPreviewTs(Date.now()); }
    }
    await fetchProposals();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function deleteProposal(id: string) {
    await fetch("/api/proposals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setProposals((p) => p.filter((x) => x.id !== id));
  }

  function copyContent(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyShareLink(id: string) {
    const url = `${window.location.origin}/p/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  function downloadPdf() {
    const win = window.open("", "_blank");
    if (!win) return;
    const htmlWithPrint = htmlContent.replace(
      "</body>",
      `<script>window.onload=function(){window.print();}<\/script></body>`
    );
    win.document.open();
    win.document.write(htmlWithPrint);
    win.document.close();
  }

  function resetForm() {
    setForm(defaultForm);
    setStep(0);
    setGeneratedContent("");
    setHtmlContent("");
    setHtmlExpiresAt(null);
    setSavedProposalId(null);
    setPreviewId(null);
    setSaved(false);
    setViewingProposal(null);
    setResultTab("propuesta");
  }

  // ─── Views ──────────────────────────────────────────────────────────────────

  function renderList() {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          {/* Vista toggle */}
          <div className="flex items-center glass-card rounded-2xl p-1.5 gap-1.5 border-white/[0.05]">
            <button
              onClick={() => setCrmMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${!crmMode ? "brand-gradient text-white shadow-lg shadow-brand/20" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
            >
              <List size={14} /> Lista
            </button>
            <button
              onClick={() => setCrmMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all ${crmMode ? "brand-gradient text-white shadow-lg shadow-brand/20" : "text-slate-400 hover:text-white hover:bg-white/10"}`}
            >
              <LayoutGrid size={14} /> Pipeline CRM
            </button>
          </div>
          <button
            onClick={() => { resetForm(); setView("form"); }}
            className="flex items-center gap-2 px-5 py-2.5 brand-gradient hover:opacity-90 text-white text-[13px] font-bold rounded-xl transition-all shadow-lg shadow-brand/20"
          >
            <Plus size={16} /> Crear Propuesta
          </button>
        </div>

        {/* CRM Kanban */}
        {crmMode && !loadingList && (
          <div className="overflow-x-auto pb-6 -mx-8 px-8 custom-scrollbar">
            <div className="flex gap-6" style={{ minWidth: `${CRM_COLUMNS.length * 280}px` }}>
              {CRM_COLUMNS.map(col => {
                const cards = proposals.filter(p => p.status === col.key);
                const st = STATUS_LABELS[col.key] ?? STATUS_LABELS.draft;
                return (
                  <div key={col.key} className="w-64 flex-shrink-0 flex flex-col">
                    <div className={`flex items-center justify-between mb-4 pb-3 border-b-2 ${col.color}`}>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${st.color}`}>{col.label}</span>
                      <span className="text-[11px] font-bold text-slate-500 bg-white/[0.03] px-2 py-0.5 rounded-md">{cards.length}</span>
                    </div>
                    <div className="space-y-3 flex-1">
                      {cards.map(p => {
                        const logo = p.form_data?.clientLogo;
                        const value = p.form_data?.price ? `${p.form_data.currency ?? "USD"} ${p.form_data.price}` : null;
                        return (
                          <div key={p.id} className="p-4 glass-card rounded-2xl border-white/[0.05] hover:border-brand-500/30 hover:shadow-2xl hover:shadow-brand/5 transition-all group relative cursor-default">
                            {/* Logo + nombre */}
                            <div className="flex items-center gap-3 mb-3">
                              {logo ? (
                                <img src={logo} alt="" className="w-10 h-10 rounded-xl object-cover flex-shrink-0 bg-navy-950 border border-white/10" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-navy-950 border border-white/[0.05] flex items-center justify-center flex-shrink-0 text-slate-500 group-hover:text-brand-400 transition-colors">
                                  <Building2 size={18} />
                                </div>
                              )}
                              <div className="min-w-0">
                                <span className="text-white text-sm font-bold truncate block group-hover:text-brand-300 transition-colors">{p.client_name}</span>
                                {p.industry && <p className="text-slate-500 text-[11px] truncate font-medium">{p.industry}</p>}
                              </div>
                            </div>

                            {value && (
                              <div className="mb-3">
                                <span className="text-emerald-400 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{value}</span>
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                              <span className="text-slate-500 text-[10px] font-bold uppercase">{new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => { setViewingProposal(p); setResultTab("propuesta"); setView("result"); }}
                                  className="p-1.5 bg-white/[0.05] hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 rounded-lg transition-all"
                                  title="Ver Propuesta"
                                >
                                  <Eye size={14} />
                                </button>
                                <select
                                  value={p.status}
                                  onChange={e => updateProposalStatus(p.id, e.target.value)}
                                  className="w-8 h-8 opacity-0 absolute bottom-4 right-4 cursor-pointer"
                                  title="Cambiar estado"
                                >
                                  {CRM_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                                </select>
                                <div className="p-1.5 bg-white/[0.05] text-slate-400 rounded-lg pointer-events-none">
                                  <RefreshCw size={14} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {cards.length === 0 && (
                        <div className="py-12 text-center text-slate-600 text-[11px] font-bold border-2 border-dashed border-white/[0.03] rounded-3xl uppercase tracking-widest">vacío</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista normal */}
        {!crmMode && (
          loadingList ? (
            <div className="flex items-center gap-3 text-slate-400 text-sm py-12 font-medium">
              <Loader2 size={18} className="animate-spin text-brand-400" /> Cargando propuestas...
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-24 glass-card rounded-3xl border-dashed border-2 border-white/[0.05]">
              <div className="w-16 h-16 bg-navy-950 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-700">
                <FileText size={32} />
              </div>
              <p className="text-slate-300 font-bold text-lg mb-2">No hay propuestas todavía</p>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">Comienza creando tu primera propuesta comercial asistida por inteligencia artificial.</p>
              <button
                onClick={() => { resetForm(); setView("form"); }}
                className="mt-8 px-6 py-3 brand-gradient text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20 hover:scale-105 transition-transform"
              >
                Crear Propuesta Ahora
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 max-w-5xl">
              {proposals.map((p) => {
                const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.draft;
                const logo = p.form_data?.clientLogo;
                const value = p.form_data?.price ? `${p.form_data.currency ?? "USD"} ${p.form_data.price}` : null;
                return (
                  <div key={p.id} className="flex items-center justify-between p-5 glass-card rounded-3xl border-white/[0.05] hover:border-brand-500/20 hover:shadow-2xl transition-all group">
                    <div className="flex items-center gap-5 flex-1 min-w-0">
                      {logo ? (
                        <img src={logo} alt="" className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 bg-navy-950 border border-white/10 shadow-inner" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-navy-950 border border-white/[0.05] flex items-center justify-center flex-shrink-0 text-slate-600 group-hover:text-brand-400 transition-colors">
                          <Building2 size={24} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                          <span className="text-white font-bold text-base truncate tracking-tight">{p.client_name}</span>
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${status.color}`}>{status.label}</span>
                        </div>
                        <div className="flex items-center gap-4 text-[13px]">
                          <p className="text-slate-400 font-medium">{p.industry}</p>
                          {value && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-slate-700" />
                              <span className="text-emerald-400 font-bold">{value}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5">
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-slate-500 font-bold uppercase text-[10px]">{new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-6">
                      <select
                        value={p.status}
                        onChange={e => updateProposalStatus(p.id, e.target.value)}
                        className="px-4 py-2 text-xs font-bold bg-navy-950 text-slate-400 rounded-xl border border-white/[0.08] outline-none cursor-pointer hover:border-brand-500/50 transition-colors"
                      >
                        {CRM_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                      <button
                        onClick={() => { setViewingProposal(p); setResultTab("propuesta"); setView("result"); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/[0.05] hover:bg-brand-500/10 text-slate-200 hover:text-brand-300 text-sm font-bold rounded-xl transition-all border border-white/[0.05]"
                      >
                        Ver Propuesta <ChevronRight size={16} />
                      </button>
                      <button onClick={() => deleteProposal(p.id)} className="p-2.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>
    );
  }

  function renderForm() {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-12 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold transition-all duration-300 ${
                i < step ? "brand-gradient text-white shadow-lg shadow-brand/20" :
                i === step ? "bg-white text-navy-950 shadow-xl scale-110" : "bg-white/[0.03] text-slate-600 border border-white/[0.05]"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-[11px] font-bold uppercase tracking-wider hidden md:block ${i === step ? "text-white" : "text-slate-600"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-6 h-[2px] rounded-full mx-1 ${i < step ? "bg-brand-500/50" : "bg-white/[0.05]"}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="glass-card rounded-[2.5rem] border-white/[0.05] p-10 mb-8 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute top-0 right-0 w-64 h-64 brand-gradient opacity-[0.03] blur-[100px] -mr-32 -mt-32" />

          <div className="relative z-10 space-y-8">
            {/* PASO 0 — Tipo de propuesta (scope multi-select) */}
            {step === 0 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Alcance de la Propuesta</h2>
                  <p className="text-slate-400 text-sm font-medium">Selecciona los servicios que formarán parte de este proyecto.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SERVICE_SCOPE_OPTIONS.map(opt => {
                    const active = form.serviceScope.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => toggleScope(opt.id)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 group ${
                          active
                            ? "bg-brand-500/10 border-brand-500/50 shadow-2xl shadow-brand/10"
                            : "bg-navy-950/50 border-white/[0.05] hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-sm font-bold transition-colors ${active ? "text-brand-300" : "text-slate-300 group-hover:text-white"}`}>{opt.label}</span>
                          <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${active ? "bg-brand-500 border-brand-500" : "border-white/10"}`}>
                            {active && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 font-medium leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 1 — Cliente */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Datos del Cliente</h2>
                  <p className="text-slate-400 text-sm font-medium">Personaliza la propuesta con la identidad de tu cliente.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                  {/* Logo upload */}
                  <div className="flex-shrink-0">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center md:text-left">Logo del Cliente</label>
                    <div className="relative group mx-auto md:mx-0">
                      <div className="w-32 h-32 rounded-[2rem] bg-navy-950 border-2 border-dashed border-white/10 flex items-center justify-center overflow-hidden transition-all group-hover:border-brand-500/50 relative">
                        {form.clientLogo ? (
                          <>
                            <img src={form.clientLogo} alt="Logo" className="w-full h-full object-cover p-2" />
                            <div className="absolute inset-0 bg-brand-600/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setForm(p => ({ ...p, clientLogo: "" })); }}
                                className="p-2 bg-white rounded-full text-brand-600 shadow-xl"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-slate-700 group-hover:text-brand-500 transition-colors flex flex-col items-center gap-2">
                            <Upload size={24} />
                            <span className="text-[10px] font-bold uppercase">Subir</span>
                          </div>
                        )}
                        <input
                          ref={logoInputRef}
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]); }}
                        />
                      </div>
                      {uploadingLogo && (
                        <div className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm rounded-[2rem] flex items-center justify-center">
                          <Loader2 size={24} className="animate-spin text-brand-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Nombre de Contacto" required>
                        <input className={inputCls} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="Ej: Juan Martínez" />
                      </Field>
                      <Field label="Empresa">
                        <input className={inputCls} value={form.clientCompany} onChange={e => set("clientCompany", e.target.value)} placeholder="Ej: TechFlow S.A." />
                      </Field>
                    </div>
                    <Field label="Industria / Sector" required>
                      <input className={inputCls} value={form.clientIndustry} onChange={e => set("clientIndustry", e.target.value)} placeholder="Ej: Salud, E-commerce, Inmobiliaria..." />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <Field label="Email corporativo">
                        <input className={inputCls} type="email" value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} placeholder="hola@cliente.com" />
                      </Field>
                      <Field label="WhatsApp / Teléfono">
                        <input className={inputCls} type="tel" value={form.clientWhatsapp} onChange={e => set("clientWhatsapp", e.target.value)} placeholder="+52 1 234 567 890" />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2 — Servicio */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Descripción del Servicio</h2>
                  <p className="text-slate-400 text-sm font-medium">
                    Servicios activos: <span className="text-brand-400 font-bold">{form.serviceScope.map(id => SERVICE_SCOPE_OPTIONS.find(o => o.id === id)?.label).join(", ")}</span>
                  </p>
                </div>
                <Field label="¿Qué incluye tu solución?" required hint="Sé detallado">
                  <textarea className={textareaCls} value={form.serviceDescription} onChange={e => set("serviceDescription", e.target.value)}
                    placeholder="Describe tu propuesta de valor, metodología de trabajo y por qué eres la mejor opción para este cliente..." />
                </Field>
              </div>
            )}

            {/* PASO 3 — Objetivos + KPIs */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Objetivos y KPIs</h2>
                  <p className="text-slate-400 text-sm font-medium">Define metas claras para que el cliente visualice el éxito.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Field label="Metas del Cliente" required>
                    <textarea className={textareaCls} value={form.clientGoals} onChange={e => set("clientGoals", e.target.value)}
                      placeholder="Ej: Aumentar la facturación mensual en un 20% mediante pauta digital..." />
                  </Field>
                  <Field label="Situación Actual">
                    <textarea className={textareaCls} value={form.currentSituation} onChange={e => set("currentSituation", e.target.value)}
                      placeholder="Ej: Actualmente dependen de referidos y no tienen un sistema de captación de leads..." />
                  </Field>
                </div>

                <div className="mt-10 p-6 bg-navy-950/50 rounded-3xl border border-white/[0.05]">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Métricas de Rendimiento (KPIs)</p>
                  {[1, 2, 3].map(n => (
                    <div key={n} className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 last:mb-0">
                      <input className={inputCls} value={(form as any)[`kpi${n}Name`]} onChange={e => set(`kpi${n}Name` as keyof ProposalForm, e.target.value)}
                        placeholder={`Métrica ${n} (ej: ROAS)`} />
                      <input className={inputCls} value={(form as any)[`kpi${n}Start`]} onChange={e => set(`kpi${n}Start` as keyof ProposalForm, e.target.value)}
                        placeholder="Valor Actual" />
                      <input className={inputCls} value={(form as any)[`kpi${n}Goal`]} onChange={e => set(`kpi${n}Goal` as keyof ProposalForm, e.target.value)}
                        placeholder="Meta" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PASO 4 — Alcance */}
            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Detalles Operativos</h2>
                  <p className="text-slate-400 text-sm font-medium">Define los entregables y tiempos de ejecución.</p>
                </div>
                <Field label="Entregables Concretos" required>
                  <textarea className={textareaCls} value={form.deliverables} onChange={e => set("deliverables", e.target.value)}
                    placeholder="Ej: 8 piezas gráficas mensuales, 4 reportes semanales, gestión de 2 campañas de Meta Ads..." />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                  <Field label="Duración Estimada" required>
                    <input className={inputCls} value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="Ej: 6 meses (con renovación)" />
                  </Field>
                  <Field label="Frecuencia / Ritmo">
                    <input className={inputCls} value={form.frequency} onChange={e => set("frequency", e.target.value)} placeholder="Ej: Reunión quincenal de seguimiento" />
                  </Field>
                </div>
                <div className="mt-6">
                  <Field label="Exclusiones (Fuera de Alcance)">
                    <textarea className={textareaCls} rows={2} value={form.notIncluded} onChange={e => set("notIncluded", e.target.value)}
                      placeholder="Ej: No incluye costos de pauta publicitaria ni compra de licencias de software..." />
                  </Field>
                </div>
              </div>
            )}

            {/* PASO 5 — Diagnóstico */}
            {step === 5 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Diagnóstico Especializado</h2>
                  <p className="text-slate-400 text-sm font-medium">Aporta valor detectando problemas que el cliente ignora.</p>
                </div>

                <div className="space-y-6">
                  <Field label="Problemas en Ecosistema Digital" hint="Opcional">
                    <textarea className={textareaCls} value={form.problemasDetectados} onChange={e => set("problemasDetectados", e.target.value)}
                      placeholder="Ej: Desconexión entre los anuncios y la landing page, alta tasa de rebote..." />
                  </Field>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Auditoría Social Media">
                      <textarea className={textareaCls} value={form.problemaRedesSociales} onChange={e => set("problemaRedesSociales", e.target.value)}
                        placeholder="Ej: Contenido estático sin uso de reels, baja interacción histórica..." />
                    </Field>
                    <Field label="Auditoría Web/SEO">
                      <textarea className={textareaCls} value={form.problemaWebLanding} onChange={e => set("problemaWebLanding", e.target.value)}
                        placeholder="Ej: No está optimizada para dispositivos móviles, carga lenta (4.5s)..." />
                    </Field>
                  </div>

                  <div className="pt-6 border-t border-white/[0.05]">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Análisis del Cliente Final (Buyer Persona)</p>
                    <Field label="¿A quién le vendemos?">
                      <textarea className={textareaCls} rows={2} value={form.buyerPersona} onChange={e => set("buyerPersona", e.target.value)}
                        placeholder="Ej: Dueños de PYMES que buscan automatizar procesos pero temen a la tecnología..." />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                      <Field label="Puntos de Dolor Funcionales">
                        <textarea className={textareaCls} value={form.doloresFuncionales} onChange={e => set("doloresFuncionales", e.target.value)}
                          placeholder="Ej: Pierden 4 horas al día en tareas manuales..." />
                      </Field>
                      <Field label="Puntos de Dolor Emocionales">
                        <textarea className={textareaCls} value={form.doloresEmocionales} onChange={e => set("doloresEmocionales", e.target.value)}
                          placeholder="Ej: Sensación de estancamiento, miedo a perder competitividad..." />
                      </Field>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 6 — Inversión */}
            {step === 6 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Estructura de Inversión</h2>
                  <p className="text-slate-400 text-sm font-medium">Define el valor de tu trabajo y las condiciones comerciales.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <Field label="Moneda">
                    <select className={inputCls} value={form.currency} onChange={e => set("currency", e.target.value)}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Valor del Servicio" required>
                    <input className={inputCls} value={form.price} onChange={e => set("price", e.target.value)} placeholder="Ej: 1,500" />
                  </Field>
                  <Field label="Periodicidad">
                    <select className={inputCls}>
                      <option>Pago Único</option>
                      <option>Mensual (Retainer)</option>
                      <option>Trimestral</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-6">
                  <Field label="Términos de Pago y Garantías" required>
                    <textarea className={textareaCls} rows={3} value={form.paymentTerms} onChange={e => set("paymentTerms", e.target.value)}
                      placeholder="Ej: 50% de anticipo para reserva, 50% al entregar el primer hito comercial..." />
                  </Field>
                </div>
              </div>
            )}

            {/* PASO 7 — Revisar y generar */}
            {step === 7 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Confirmación Final</h2>
                  <p className="text-slate-400 text-sm font-medium">Todo listo para que la IA redacte tu propuesta maestra.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Servicios", val: form.serviceScope.map(id => SERVICE_SCOPE_OPTIONS.find(o => o.id === id)?.label).join(", "), icon: LayoutGrid },
                    { label: "Cliente", val: `${form.clientName} (${form.clientCompany || 'Particular'})`, icon: Building2 },
                    { label: "Inversión", val: `${form.currency} ${form.price}`, icon: FileSignature },
                    { label: "Duración", val: form.duration, icon: Calendar },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-navy-950/50 rounded-2xl border border-white/[0.05]">
                      <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-white flex-shrink-0">
                        <item.icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                        <p className="text-white font-bold text-sm truncate">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-10 p-8 brand-gradient rounded-[2rem] shadow-2xl shadow-brand/20 relative overflow-hidden group">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
                   <p className="text-white font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                     <Sparkles size={20} /> Inteligencia Artificial Activada
                   </p>
                   <p className="text-brand-100 text-sm leading-relaxed relative z-10 font-medium">
                     Claude redactará una propuesta comercial de alto impacto, utilizando técnicas de copywriting persuasivo, neuroventas y estructurando cada sección para maximizar tu tasa de cierre.
                   </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step === 0 ? setView("list") : setStep(s => s - 1)}
            className="flex items-center gap-2 px-6 py-3 text-slate-500 hover:text-white text-sm font-bold transition-all hover:bg-white/5 rounded-xl"
          >
            <ArrowLeft size={16} /> {step === 0 ? "Salir" : "Atrás"}
          </button>

          {step < 7 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-8 py-3.5 brand-gradient hover:opacity-90 disabled:opacity-20 disabled:grayscale text-white text-sm font-bold rounded-xl transition-all shadow-xl shadow-brand/20 active:scale-95"
            >
              Continuar <ArrowRight size={16} />
            </button>
          ) : (
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-3 px-10 py-4 bg-white text-navy-950 hover:bg-slate-100 disabled:opacity-50 text-base font-black rounded-2xl transition-all shadow-2xl shadow-white/10 active:scale-95"
            >
              {generating ? <><Loader2 size={20} className="animate-spin" /> Redactando...</> : <><Sparkles size={20} /> Generar Propuesta Maestra</>}
            </button>
          )}
        </div>

        {/* Streaming preview */}
        {generating && generatedContent && (
          <div className="mt-12 glass-card rounded-[2.5rem] p-10 border-brand-500/20 animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-8 text-brand-400 text-sm font-bold uppercase tracking-widest">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <Sparkles size={16} />
              </div>
              Generando Propuesta en Tiempo Real...
            </div>
            <div className="text-sm prose prose-invert max-w-none">
              <ReactMarkdown components={mdComponents}>{generatedContent}</ReactMarkdown>
            </div>
            <div ref={bottomRef} className="h-10" />
          </div>
        )}
      </div>
    );
  }

  function renderResult() {
    const markdownContent = generatedContent || viewingProposal?.generated_content || "";
    const title = viewingProposal ? viewingProposal.client_name : form.clientName;
    const clientLogo = viewingProposal?.form_data?.clientLogo ?? form.clientLogo;
    const clientEmail = viewingProposal?.form_data?.clientEmail ?? form.clientEmail;

    return (
      <div className="p-8 max-w-5xl mx-auto">
        {/* Header toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => { setView("list"); setViewingProposal(null); }}
              className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="flex items-center gap-3 min-w-0">
              {clientLogo && (
                <img src={clientLogo} alt="" className="w-10 h-10 rounded-xl object-cover bg-navy-950 border border-white/10 flex-shrink-0 shadow-lg" />
              )}
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-white truncate tracking-tight">{title}</h1>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Propuesta Comercial Asistida</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
             <div className="flex items-center glass-card rounded-xl p-1 border-white/[0.05]">
                <button
                  onClick={() => setResultTab("propuesta")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${resultTab === "propuesta" ? "bg-white text-navy-950 shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                  Propuesta
                </button>
                <button
                  onClick={() => { setResultTab("html"); if (!htmlContent) generateHtml(markdownContent); }}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${resultTab === "html" ? "bg-white text-navy-950 shadow-lg" : "text-slate-400 hover:text-white"}`}
                >
                  <Code size={14} /> Vista Web
                </button>
             </div>

             <div className="h-8 w-[1px] bg-white/10 mx-1" />

             <button
                onClick={() => sendViaWhatsApp(viewingProposal)}
                className="flex items-center gap-2 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-xl border border-green-500/20 transition-all"
              >
                <MessageCircle size={14} /> WhatsApp
              </button>

              <button
                onClick={saveProposal}
                disabled={saving || saved || !!savedProposalId || !!viewingProposal}
                className="flex items-center gap-2 px-4 py-2.5 brand-gradient text-white text-xs font-bold rounded-xl shadow-lg shadow-brand/20 hover:opacity-90 disabled:opacity-50 disabled:grayscale transition-all"
              >
                {saved ? <><Check size={14} /> Guardado</> : saving ? <><Loader2 size={14} className="animate-spin" /> Guardando...</> : <><Save size={14} /> Guardar</>}
              </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {resultTab === "propuesta" && (
              <div className="glass-card rounded-[2.5rem] border-white/[0.05] p-10 animate-in fade-in duration-700">
                <div className="prose prose-invert max-w-none prose-headings:tracking-tight prose-a:text-brand-400">
                  <ReactMarkdown components={mdComponents}>{markdownContent}</ReactMarkdown>
                </div>
              </div>
            )}

            {resultTab === "html" && (
              <div className="glass-card rounded-[2.5rem] border-white/[0.05] overflow-hidden animate-in zoom-in-95 duration-700 h-[800px] relative">
                {generatingHtml && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-navy-900/50 backdrop-blur-sm z-20">
                    <Loader2 size={40} className="animate-spin text-brand-400 mb-4" />
                    <p className="text-white font-bold text-lg">Generando experiencia interactiva...</p>
                  </div>
                )}
                {!generatingHtml && htmlContent ? (
                  <iframe
                    key={htmlIframeKey}
                    ref={htmlIframeRef}
                    className="w-full h-full bg-white"
                    title="Propuesta Interactiva"
                  />
                ) : !generatingHtml && (
                  <div className="flex flex-col items-center justify-center h-full p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-navy-950 flex items-center justify-center text-slate-700 mb-6">
                      <Code size={32} />
                    </div>
                    <p className="text-slate-400 font-bold mb-4">La versión interactiva aún no ha sido generada.</p>
                    <button
                      onClick={() => generateHtml(markdownContent)}
                      className="px-6 py-3 brand-gradient text-white text-sm font-bold rounded-xl shadow-lg shadow-brand/20"
                    >
                      Generar Vista Web Ahora
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-card rounded-3xl border-white/[0.05] p-6 space-y-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Acciones Rápidas</p>
              
              <div className="space-y-2">
                <button
                  onClick={() => { setHtmlContent(""); generate(); }}
                  disabled={generating}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 text-xs font-bold rounded-xl transition-all border border-white/[0.05]"
                >
                  <RefreshCw size={14} className={generating ? "animate-spin text-brand-400" : ""} />
                  Regenerar Propuesta
                </button>
                <button
                  onClick={() => { setStep(0); setView("form"); }}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 text-xs font-bold rounded-xl transition-all border border-white/[0.05]"
                >
                  <Pencil size={14} />
                  Editar Parámetros
                </button>
              </div>

              {htmlContent && (
                <div className="pt-6 border-t border-white/[0.05] space-y-2">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Exportar</p>
                  <button
                    onClick={downloadPdf}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 text-xs font-bold rounded-xl border border-brand-500/20 transition-all"
                  >
                    <FileDown size={14} />
                    Descargar como PDF
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 text-xs font-bold rounded-xl border border-white/[0.05] transition-all"
                  >
                    <Download size={14} />
                    Descargar HTML
                  </button>
                </div>
              )}

              {(savedProposalId || viewingProposal?.id) && htmlContent && timeLeft && (
                 <div className="pt-6 border-t border-white/[0.05]">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Compartir Enlace</p>
                    <button
                      onClick={() => copyShareLink(savedProposalId ?? viewingProposal!.id)}
                      className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all ${copiedLink ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-navy-950 border border-white/[0.1] text-white"}`}
                    >
                      {copiedLink ? <><Check size={14} /> ¡Copiado!</> : <><Link2 size={14} /> Copiar Link Público</>}
                    </button>
                    <p className="mt-3 text-[10px] text-slate-500 text-center font-medium">
                      {timeLeft === "expirado" ? "⚠️ El enlace ha expirado." : `⏱ Expira en ${timeLeft}`}
                    </p>
                 </div>
              )}
            </div>

            {clientEmail && (
              <div className="glass-card rounded-3xl border-white/[0.05] p-6 bg-brand-500/5 border-brand-500/10">
                <p className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-4">Email de Contacto</p>
                <p className="text-white text-sm font-bold truncate mb-4">{clientEmail}</p>
                <button
                  onClick={() => sendViaEmail(viewingProposal)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-brand/20 hover:opacity-90 transition-all"
                >
                  <Mail size={14} /> Enviar por Email
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── Page shell ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-navy-950">
      <div className="px-8 py-6 border-b border-white/[0.05] flex items-center justify-between flex-shrink-0 bg-navy-950/50 backdrop-blur-md z-30">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center shadow-lg shadow-brand/20">
            <FileSignature size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Propuestas Inteligentes</h1>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Pipeline comercial & Generación de Contenido</p>
          </div>
        </div>
        <AgentBrain agentId="propuestas" />
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {view === "list" && renderList()}
        {view === "form" && renderForm()}
        {view === "result" && renderResult()}
      </div>
    </div>
  );
}
