"use client";

import { useState, useEffect, useRef } from "react";
import {
  TrendingUp, Plus, ArrowLeft, ArrowRight, Sparkles,
  Copy, Check, Save, Loader2, Trash2, FileText, Calendar,
  Code, Download, RefreshCw, Pencil,
  MessageCircle, Building2, X, FileDown, Link2,
  DollarSign, Award, Mail,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SalesForm {
  // Step 0 — Solution type
  salesSolutionType: string;
  // Step 1 — Client
  clientName: string;
  clientCompany: string;
  clientIndustry: string;
  clientEmail: string;
  clientWhatsapp: string;
  // Step 2 — Diagnosis
  currentTools: string;
  salesTeamSize: string;
  monthlyVolume: string;
  currentMetrics: string;
  // Step 3 — Pain points
  painPoints: string;
  implementationUrgency: string;
  // Step 4 — Proposal
  deliverables: string;
  price: string;
  currency: string;
  paymentTerms: string;
  includeProjections: boolean;
}

interface SalesProposal {
  id: string;
  client_name: string;
  industry: string;
  status: string;
  created_at: string;
  generated_content: string;
  html_content?: string;
  html_expires_at?: string;
  form_data?: SalesForm;
}

const defaultForm: SalesForm = {
  salesSolutionType: "",
  clientName: "", clientCompany: "", clientIndustry: "", clientEmail: "", clientWhatsapp: "",
  currentTools: "", salesTeamSize: "", monthlyVolume: "", currentMetrics: "",
  painPoints: "", implementationUrgency: "",
  deliverables: "", price: "", currency: "USD", paymentTerms: "", includeProjections: false,
};

const SOLUTION_TYPES = [
  { id: "crm",          label: "CRM / Software de Ventas",      desc: "Implementación y gestión de sistemas CRM" },
  { id: "consultoria",  label: "Consultoría Comercial",         desc: "Estrategia y optimización del proceso de ventas" },
  { id: "automatizacion", label: "Automatización de Ventas",    desc: "Flujos automáticos, seguimiento y nurturing" },
  { id: "capacitacion", label: "Capacitación de Equipos",       desc: "Training, metodologías y habilidades comerciales" },
  { id: "outsourcing",  label: "Outsourcing Comercial",         desc: "Equipo externo dedicado a tus ventas" },
  { id: "estrategia",   label: "Estrategia Integral de Ventas", desc: "Plan completo de crecimiento comercial" },
];

const URGENCY_OPTIONS = [
  "Inmediata (1 mes)",
  "Corto plazo (2-3 meses)",
  "Mediano plazo (3-6 meses)",
];

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "ARS", "PEN", "CLP"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:        { label: "Borrador",    color: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
  generada:     { label: "Generada",   color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  sent:         { label: "Enviada",    color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  negotiating:  { label: "Negociando", color: "bg-orange-500/10 text-orange-400 border border-orange-500/20" },
  closed_won:   { label: "Cerrada ✓",  color: "bg-green-500/10 text-green-400 border border-green-500/20" },
  closed_lost:  { label: "Cerrada ✗",  color: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const CRM_COLUMNS = [
  { key: "draft",       label: "Borrador" },
  { key: "generada",    label: "Generada" },
  { key: "sent",        label: "Enviada" },
  { key: "negotiating", label: "Negociando" },
  { key: "closed_won",  label: "Ganada" },
  { key: "closed_lost", label: "Perdida" },
];

const STEPS = ["Solución", "Cliente", "Diagnóstico", "Problemas", "Propuesta", "Finalizar"];

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
          {label} {required && <span style={{ color: "#f59e0b" }}>*</span>}
        </label>
        {hint && <span className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none transition-all duration-200" as const;
const textareaCls = `${inputCls} resize-none min-h-[100px]` as const;
const inputStyle = { background: "#131313" };

// ─── Main component ────────────────────────────────────────────────────────────

export default function PropuestasVentasPage() {
  const [view, setView]           = useState<"list" | "form" | "result">("list");
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState<SalesForm>(defaultForm);
  const [proposals, setProposals] = useState<SalesProposal[]>([]);
  const [loadingList, setLoadingList]       = useState(true);
  const [generating, setGenerating]         = useState(false);
  const [generatingHtml, setGeneratingHtml] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [htmlContent, setHtmlContent]     = useState("");

  const [previewId, setPreviewId]         = useState<string | null>(null);
  const [htmlIframeKey, setHtmlIframeKey] = useState(0);
  const [resultTab, setResultTab] = useState<"propuesta" | "html">("propuesta");
  const [viewingProposal, setViewingProposal] = useState<SalesProposal | null>(null);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [htmlExpiresAt, setHtmlExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft]   = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchProposals(); }, []);

  useEffect(() => {
    if (generating) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [generatedContent, generating]);

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

  useEffect(() => {
    if (!viewingProposal) return;
    setSavedProposalId(viewingProposal.id);
    setPreviewId(viewingProposal.id);
    setGeneratedContent(viewingProposal.generated_content ?? "");
    setHtmlContent(viewingProposal.html_content ?? "");
    setHtmlExpiresAt(viewingProposal.html_expires_at ?? null);
    if (viewingProposal.form_data) setForm({ ...defaultForm, ...viewingProposal.form_data });
    if (viewingProposal.html_content) setHtmlIframeKey(k => k + 1);
  }, [viewingProposal]);

  function jsonToMarkdown(data: any): string {
    if (!data) return "";
    return `
# ${data.tipoSolucion}

## Resumen Ejecutivo
${data.resumenEjecutivo}

## Diagnóstico
${data.diagnostico?.map((p: any) => `### ${p.titulo}\n${p.descripcion}`).join("\n\n")}

## Nuestra Solución
${data.solucion?.descripcion}
${data.solucion?.puntosClave?.map((k: any) => `- ${k}`).join("\n")}

## Metodología
${data.metodologia?.map((s: any) => `${s.numero}. **${s.titulo}**: ${s.descripcion}`).join("\n")}

## Entregables
${data.entregables?.map((e: any) => `- ${e}`).join("\n")}

## KPIs y Métricas
${data.kpis?.map((k: any) => `- ${k}`).join("\n")}

${data.roi?.proyeccion ? `## Proyección de ROI\n${data.roi.proyeccion}\n${data.roi.supuestos?.map((s: any) => `- ${s}`).join("\n")}` : ""}

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

  async function fetchProposals() {
    setLoadingList(true);
    const res = await fetch("/api/sales-proposals");
    if (res.ok) setProposals(await res.json());
    setLoadingList(false);
  }

  async function updateProposalStatus(id: string, status: string) {
    await fetch("/api/sales-proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  function sendViaWhatsApp(proposal: SalesProposal | null) {
    const phone = (proposal?.form_data?.clientWhatsapp ?? form.clientWhatsapp).replace(/\D/g, "");
    const name = proposal?.client_name ?? form.clientName;
    const company = proposal?.form_data?.clientCompany ?? form.clientCompany;
    const id = savedProposalId ?? proposal?.id;
    const link = id ? `\n\n🔗 Ver propuesta online: ${window.location.origin}/view/sales/${id}` : "";
    const msg = encodeURIComponent(
      `Hola ${name || ""}! 👋\n\nTe comparto la propuesta de ventas que preparamos especialmente para ${company || name || "ti"}.${link}\n\nQuedo disponible para cualquier consulta. ¡Espero tu respuesta!`
    );
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  }

  function sendViaEmail(proposal: SalesProposal | null) {
    const email = proposal?.form_data?.clientEmail ?? form.clientEmail;
    const name = proposal?.client_name ?? form.clientName;
    const id = savedProposalId ?? proposal?.id;
    const link = id ? `\n\n🔗 Ver propuesta online: ${window.location.origin}/view/sales/${id}` : "";
    const subject = encodeURIComponent(`Propuesta de ventas para ${name}`);
    const body = encodeURIComponent(
      `Hola ${name},\n\nTe comparto la propuesta de ventas que preparamos para ti.${link}\n\nEstamos a tu disposición para resolver cualquier duda.\n\n¡Saludos!`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  }

  function set(field: keyof SalesForm, value: string | boolean) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function canNext(): boolean {
    if (step === 0) return !!form.salesSolutionType;
    if (step === 1) return !!form.clientName && !!form.clientIndustry;
    if (step === 2) return true;
    if (step === 3) return !!form.painPoints;
    if (step === 4) return !!form.price && !!form.paymentTerms;
    return true;
  }

  async function generate() {
    setGenerating(true);
    setSaved(false);
    setGeneratedContent("");
    setHtmlContent("");

    try {
      const res = await fetch("/api/sales-proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || errBody.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const md = jsonToMarkdown(data);
      setGeneratedContent(md);

      setViewingProposal(prev =>
        prev ? { ...prev, generated_content: md, status: "generada", form_data: form } : null
      );

      setView("result");
      setResultTab("propuesta");

      const existingId = savedProposalId || viewingProposal?.id;
      if (existingId && md) {
        await fetch("/api/sales-proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existingId,
            generated_content: md,
            status: "generada",
            client_name: form.clientName,
            industry: form.clientIndustry,
            form_data: form,
          }),
        });
        await fetchProposals();
      } else if (md) {
        const saveRes = await fetch("/api/sales-proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: form.clientName,
            clientIndustry: form.clientIndustry,
            formData: form,
            generatedContent: md,
            status: "generada",
          }),
        });
        if (saveRes.ok) {
          const saveData = await saveRes.json();
          if (saveData.id) {
            setSavedProposalId(saveData.id);
            setPreviewId(saveData.id);
          }
        }
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
      const res = await fetch("/api/sales-proposals/html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: markdownContent,
          clientName: viewingProposal?.client_name ?? form.clientName,
          clientCompany: form.clientCompany,
          proposalId: savedProposalId ?? viewingProposal?.id,
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

      const id = savedProposalId ?? viewingProposal?.id;
      if (id && accumulated) {
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
        await fetch("/api/sales-proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, html_content: stripFences(accumulated), html_expires_at: expires }),
        });
        setHtmlExpiresAt(expires);
        setPreviewId(id);
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
    a.download = `propuesta-ventas-${(viewingProposal?.client_name ?? form.clientName).toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function saveProposal() {
    setSaving(true);
    const id = savedProposalId || viewingProposal?.id;

    try {
      if (id) {
        const res = await fetch("/api/sales-proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            client_name: form.clientName,
            industry: form.clientIndustry,
            form_data: form,
            generated_content: generatedContent,
            html_content: htmlContent,
            status: "draft",
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Error al actualizar");
        }
      } else {
        const res = await fetch("/api/sales-proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: form.clientName,
            clientIndustry: form.clientIndustry,
            formData: form,
            generatedContent,
            htmlContent,
            status: "draft",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            setSavedProposalId(data.id);
            setPreviewId(data.id);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || "Error al crear");
        }
      }
      await fetchProposals();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      alert(`No se pudo guardar: ${err.message || "Error desconocido"}`);
    } finally {
      setSaving(false);
    }
  }

  async function deleteProposal(id: string) {
    await fetch("/api/sales-proposals", {
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
    const url = `${window.location.origin}/view/sales/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  async function renewShareLink() {
    const id = savedProposalId ?? viewingProposal?.id;
    if (!id) return;
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await fetch("/api/sales-proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, html_expires_at: expires }),
    });
    setHtmlExpiresAt(expires);
  }

  function downloadPdf() {
    const win = window.open("", "_blank");
    if (!win) return;
    const printCss = `
      <style>
        @page { margin: 1.5cm; size: A4; }
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { font-size: 11pt; line-height: 1.5; }
          h1 { font-size: 18pt; page-break-after: avoid; }
          h2 { font-size: 14pt; page-break-after: avoid; }
          h3 { font-size: 12pt; page-break-after: avoid; }
          p, li { orphans: 3; widows: 3; }
          table { page-break-inside: avoid; }
          .no-print, nav, button, [class*="btn"] { display: none !important; }
          a { color: inherit !important; text-decoration: none !important; }
        }
      </style>`;
    const withPrintCss = htmlContent.includes("</head>")
      ? htmlContent.replace("</head>", `${printCss}</head>`)
      : printCss + htmlContent;
    const htmlWithPrint = withPrintCss.replace(
      "</body>",
      `<script>window.onload=function(){setTimeout(function(){window.print();},600);}<\/script></body>`
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

  // ─── Views ───────────────────────────────────────────────────────────────────

  function renderList() {
    const totalValue = proposals.reduce((sum, p) => {
      const price = parseFloat((p.form_data?.price ?? "").replace(/,/g, "") || "0");
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    const activeProposals = proposals.filter(p => ["sent", "negotiating", "generada"].includes(p.status)).length;
    const closedWon = proposals.filter(p => p.status === "closed_won").length;
    const closedTotal = proposals.filter(p => ["closed_won", "closed_lost"].includes(p.status)).length;
    const winRate = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;

    const stats = [
      { label: "Total Propuestas", value: proposals.length.toString(),                                       icon: FileText,   accent: "#f59e0b" },
      { label: "Valor Total",      value: totalValue > 0 ? `$${totalValue.toLocaleString()}` : "—",          icon: DollarSign, accent: "#4ade80" },
      { label: "Activas",          value: activeProposals.toString(),                                         icon: TrendingUp, accent: "#fbbf24" },
      { label: "Tasa de Cierre",   value: `${winRate.toFixed(0)}%`,                                          icon: Award,      accent: "#fb923c" },
    ];

    return (
      <div className="p-6 xl:p-8 min-h-screen" style={{ background: "#131313" }}>

        {/* Hero header */}
        <div
          className="relative flex flex-col justify-between p-8 rounded-2xl overflow-hidden mb-6"
          style={{ background: "#1c1b1b" }}
        >
          <div
            className="absolute rounded-full pointer-events-none"
            style={{ top: "-30%", right: "-5%", width: "380px", height: "340px", background: "rgba(251,191,36,0.07)", filter: "blur(60px)" }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-[32px] text-white tracking-tight leading-tight mb-1">
                Propuestas <span style={{ color: "#fbbf24" }}>Ventas</span>
              </h1>
              <p className="text-[14px]" style={{ color: "#938e9e" }}>
                Genera propuestas comerciales de ventas con IA
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setView("form"); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex-shrink-0"
              style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)", color: "#1a0a00", boxShadow: "0 0 20px rgba(245,158,11,0.25)" }}
            >
              <Plus size={16} /> Nueva Propuesta
            </button>
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

        {/* List */}
        {loadingList ? (
          <div className="flex items-center gap-3 text-slate-400 text-sm py-12">
            <Loader2 size={18} className="animate-spin" style={{ color: "#f59e0b" }} /> Cargando propuestas...
          </div>
        ) : proposals.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20"
            style={{ borderColor: "rgba(255,255,255,0.05)" }}
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-slate-600"
              style={{ background: "rgba(28,27,27,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}
            >
              <FileText size={28} />
            </div>
            <p className="text-white font-bold text-lg mb-2">No hay propuestas de ventas todavía</p>
            <p className="text-slate-500 text-sm max-w-xs text-center mb-8">
              Comienza creando tu primera propuesta comercial de ventas con IA.
            </p>
            <button
              onClick={() => { resetForm(); setView("form"); }}
              className="px-6 py-3 text-sm font-bold rounded-xl shadow-lg transition-all"
              style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)", color: "#1a0a00", boxShadow: "0 0 20px rgba(245,158,11,0.2)" }}
            >
              Crear Primera Propuesta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {proposals.map((p) => {
              const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.draft;
              const value = p.form_data?.price ? `${p.form_data.currency ?? "USD"} ${p.form_data.price}` : null;

              return (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-xl p-6 transition-all duration-200 cursor-pointer"
                  style={{ background: "#1c1b1b", border: "1px solid rgba(255,255,255,0.06)" }}
                  onClick={() => { setViewingProposal(p); setResultTab("propuesta"); setView("result"); }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(245,158,11,0.3)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}
                >
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-slate-600 group-hover:text-amber-400 transition-colors"
                        style={{ background: "#131313", border: "1px solid rgba(255,255,255,0.06)" }}
                      >
                        <Building2 size={18} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white group-hover:text-amber-300 transition-colors truncate leading-snug">
                          {p.client_name}
                        </h3>
                        {p.industry && (
                          <p className="text-sm text-slate-400 truncate">{p.industry}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${status.color}`}>
                        {status.label}
                      </span>
                      <button
                        onClick={e => { e.stopPropagation(); deleteProposal(p.id); }}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    {value && (
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={13} className="text-slate-500" />
                        <span className="font-bold text-emerald-400">{value}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-slate-500" />
                      <span className="text-slate-400 text-xs">
                        {new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <div className="ml-auto" onClick={e => e.stopPropagation()}>
                      <select
                        value={p.status}
                        onChange={e => updateProposalStatus(p.id, e.target.value)}
                        className="text-[10px] font-bold text-slate-400 rounded-lg border border-white/[0.08] outline-none cursor-pointer transition-colors px-2 py-1"
                        style={{ background: "#131313" }}
                      >
                        {CRM_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  function renderForm() {
    return (
      <div className="p-8 max-w-4xl mx-auto" style={{ background: "#131313", minHeight: "100%" }}>
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => step === 0 ? setView("list") : setStep(s => s - 1)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-all flex-shrink-0"
            style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(28,27,27,0.4)" }}
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {viewingProposal ? "Editar Propuesta" : "Nueva Propuesta de Ventas"}
            </h2>
            <p className="text-sm text-slate-400">Paso {step + 1} de {STEPS.length} — {STEPS[step]}</p>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-1.5 mb-8 overflow-x-auto pb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5 flex-shrink-0">
              <div
                className="flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold transition-all"
                style={
                  i < step
                    ? { background: "linear-gradient(90deg,#fbbf24,#f59e0b)", color: "#1a0a00" }
                    : i === step
                    ? { background: "#fff", color: "#1a0a00" }
                    : { background: "rgba(28,27,27,0.5)", color: "#938e9e", border: "1px solid rgba(255,255,255,0.05)" }
                }
              >
                {i < step ? "✓" : i + 1}
              </div>
              <span className="text-[11px] font-semibold hidden md:block" style={{ color: i === step ? "#fff" : "#938e9e" }}>{s}</span>
              {i < STEPS.length - 1 && (
                <div
                  className="w-5 h-[2px] rounded-full mx-0.5 flex-shrink-0"
                  style={{ background: i < step ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.05)" }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step card */}
        <div
          className="rounded-xl p-8 mb-6 relative overflow-hidden"
          style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(28,27,27,0.4)" }}
        >
          <div
            className="absolute top-0 right-0 w-64 h-64 pointer-events-none"
            style={{ background: "rgba(245,158,11,0.05)", filter: "blur(80px)", right: "-128px", top: "-128px" }}
          />
          <div className="relative z-10 space-y-8">

            {/* PASO 0 — Solución */}
            {step === 0 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Tipo de Solución</h2>
                  <p className="text-slate-400 text-sm">Selecciona la solución de ventas que ofrecerás a este cliente.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {SOLUTION_TYPES.map(opt => {
                    const active = form.salesSolutionType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => set("salesSolutionType", opt.id)}
                        className="p-5 rounded-xl border-2 text-left transition-all duration-200 group"
                        style={active
                          ? { background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.4)" }
                          : { background: "rgba(19,19,19,0.5)", borderColor: "rgba(255,255,255,0.06)" }
                        }
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className="text-sm font-bold transition-colors"
                            style={{ color: active ? "#f59e0b" : "#cbd5e1" }}
                          >
                            {opt.label}
                          </span>
                          <div
                            className="w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0"
                            style={active
                              ? { background: "#f59e0b", borderColor: "#f59e0b" }
                              : { borderColor: "rgba(255,255,255,0.1)" }
                            }
                          >
                            {active && <Check size={11} className="text-white" />}
                          </div>
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PASO 1 — Cliente */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Datos del Cliente</h2>
                  <p className="text-slate-400 text-sm">Personaliza la propuesta con la identidad del cliente.</p>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Nombre de Contacto" required>
                      <input className={inputCls} style={inputStyle} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="Ej: Juan Martínez" />
                    </Field>
                    <Field label="Empresa">
                      <input className={inputCls} style={inputStyle} value={form.clientCompany} onChange={e => set("clientCompany", e.target.value)} placeholder="Ej: TechFlow S.A." />
                    </Field>
                  </div>
                  <Field label="Industria / Sector" required>
                    <input className={inputCls} style={inputStyle} value={form.clientIndustry} onChange={e => set("clientIndustry", e.target.value)} placeholder="Ej: SaaS, Retail, Manufactura..." />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Email corporativo">
                      <input className={inputCls} style={inputStyle} type="email" value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} placeholder="hola@cliente.com" />
                    </Field>
                    <Field label="WhatsApp / Teléfono">
                      <input className={inputCls} style={inputStyle} type="tel" value={form.clientWhatsapp} onChange={e => set("clientWhatsapp", e.target.value)} placeholder="+52 1 234 567 890" />
                    </Field>
                  </div>
                </div>
              </div>
            )}

            {/* PASO 2 — Diagnóstico */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Diagnóstico Comercial</h2>
                  <p className="text-slate-400 text-sm">Aporta contexto sobre la situación actual de ventas del cliente.</p>
                </div>
                <div className="space-y-6">
                  <Field label="Herramientas y CRM actuales" hint="Opcional">
                    <textarea className={textareaCls} style={inputStyle} value={form.currentTools} onChange={e => set("currentTools", e.target.value)}
                      placeholder="Ej: Usan Excel, Notion y WhatsApp para seguimiento. No tienen CRM." />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Field label="Tamaño del equipo de ventas">
                      <input className={inputCls} style={inputStyle} type="number" value={form.salesTeamSize} onChange={e => set("salesTeamSize", e.target.value)} placeholder="Ej: 5" />
                    </Field>
                    <Field label="Volumen de ventas mensual">
                      <input className={inputCls} style={inputStyle} value={form.monthlyVolume} onChange={e => set("monthlyVolume", e.target.value)} placeholder="Ej: 50 deals / $80,000 USD" />
                    </Field>
                  </div>
                  <Field label="Métricas actuales" hint="Opcional">
                    <textarea className={textareaCls} style={inputStyle} value={form.currentMetrics} onChange={e => set("currentMetrics", e.target.value)}
                      placeholder="Ej: Tasa de conversión 8%, ciclo de ventas 45 días, ticket promedio $1,600 USD." />
                  </Field>
                </div>
              </div>
            )}

            {/* PASO 3 — Problemas */}
            {step === 3 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Problemas y Urgencia</h2>
                  <p className="text-slate-400 text-sm">Identifica los puntos de dolor que motivan esta propuesta.</p>
                </div>
                <div className="space-y-6">
                  <Field label="Principales problemas detectados" required>
                    <textarea className={textareaCls} style={inputStyle} value={form.painPoints} onChange={e => set("painPoints", e.target.value)}
                      placeholder="Ej: Falta de seguimiento sistemático, leads fríos, vendedores sin metodología, pipeline desordenado..." />
                  </Field>
                  <Field label="Urgencia de implementación">
                    <div className="space-y-2">
                      {URGENCY_OPTIONS.map(opt => (
                        <label
                          key={opt}
                          className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                          style={{
                            background: form.implementationUrgency === opt ? "rgba(245,158,11,0.08)" : "rgba(19,19,19,0.5)",
                            border: `1px solid ${form.implementationUrgency === opt ? "rgba(245,158,11,0.3)" : "rgba(255,255,255,0.06)"}`,
                          }}
                        >
                          <input
                            type="radio"
                            name="urgency"
                            value={opt}
                            checked={form.implementationUrgency === opt}
                            onChange={() => set("implementationUrgency", opt)}
                            className="accent-amber-400"
                          />
                          <span className="text-sm font-medium text-slate-200">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </Field>
                </div>
              </div>
            )}

            {/* PASO 4 — Propuesta */}
            {step === 4 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Estructura de la Propuesta</h2>
                  <p className="text-slate-400 text-sm">Define los entregables, inversión y condiciones comerciales.</p>
                </div>
                <div className="space-y-6">
                  <Field label="Entregables Concretos" required>
                    <textarea className={textareaCls} style={inputStyle} value={form.deliverables} onChange={e => set("deliverables", e.target.value)}
                      placeholder="Ej: Implementación CRM, 3 meses de soporte, capacitación del equipo (8h), dashboards personalizados..." />
                  </Field>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <Field label="Moneda">
                      <select className={inputCls} style={inputStyle} value={form.currency} onChange={e => set("currency", e.target.value)}>
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </Field>
                    <Field label="Valor del Servicio" required>
                      <input className={inputCls} style={inputStyle} type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="Ej: 3500" />
                    </Field>
                    <Field label="Proyección de ROI">
                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <input
                          type="checkbox"
                          checked={form.includeProjections}
                          onChange={e => set("includeProjections", e.target.checked)}
                          className="accent-amber-400 w-4 h-4"
                        />
                        <span className="text-sm text-slate-300">Incluir proyección</span>
                      </label>
                    </Field>
                  </div>
                  <Field label="Términos de Pago y Garantías" required>
                    <textarea className={textareaCls} style={inputStyle} value={form.paymentTerms} onChange={e => set("paymentTerms", e.target.value)}
                      placeholder="Ej: 50% al inicio, 50% al completar la implementación. Garantía de 30 días..." />
                  </Field>
                </div>
              </div>
            )}

            {/* PASO 5 — Finalizar */}
            {step === 5 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Confirmación Final</h2>
                  <p className="text-slate-400 text-sm">Todo listo para que la IA redacte tu propuesta de ventas.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  {[
                    { label: "Solución", val: SOLUTION_TYPES.find(s => s.id === form.salesSolutionType)?.label ?? form.salesSolutionType, icon: TrendingUp },
                    { label: "Cliente", val: `${form.clientName} (${form.clientCompany || "Particular"})`, icon: Building2 },
                    { label: "Inversión", val: `${form.currency} ${form.price}`, icon: DollarSign },
                    { label: "Urgencia", val: form.implementationUrgency || "No especificada", icon: Calendar },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-xl"
                      style={{ background: "rgba(19,19,19,0.6)", border: "1px solid rgba(255,255,255,0.05)" }}
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                        style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }}
                      >
                        <item.icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">{item.label}</p>
                        <p className="text-white font-bold text-sm truncate">{item.val}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div
                  className="p-7 rounded-xl relative overflow-hidden group"
                  style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)" }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                  <p className="text-white font-bold text-lg mb-2 relative z-10 flex items-center gap-2">
                    <Sparkles size={18} /> Inteligencia Artificial Activada
                  </p>
                  <p className="text-amber-900 text-sm leading-relaxed relative z-10">
                    Claude redactará una propuesta de ventas de alto impacto con diagnóstico, solución, metodología, proyección de ROI y próximos pasos listos para cerrar el deal.
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
            className="flex items-center gap-2 px-5 py-2.5 text-slate-400 hover:text-white text-sm font-semibold transition-all hover:bg-white/[0.05] rounded-xl"
          >
            <ArrowLeft size={15} /> {step === 0 ? "Salir" : "Atrás"}
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-7 py-3 text-sm font-bold rounded-xl transition-all active:scale-95 disabled:opacity-20 disabled:grayscale"
              style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)", color: "#1a0a00", boxShadow: "0 0 20px rgba(245,158,11,0.2)" }}
            >
              Continuar <ArrowRight size={15} />
            </button>
          ) : (
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-3 px-9 py-3.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-sm font-black rounded-xl transition-all shadow-2xl shadow-white/10 active:scale-95"
              style={{ color: "#1a0a00" }}
            >
              {generating
                ? <><Loader2 size={18} className="animate-spin" /> Redactando...</>
                : <><Sparkles size={18} /> Generar Propuesta de Ventas</>}
            </button>
          )}
        </div>

        {/* Streaming preview */}
        {generating && generatedContent && (
          <div
            className="mt-10 rounded-xl p-8"
            style={{ border: "1px solid rgba(245,158,11,0.2)", background: "rgba(28,27,27,0.4)" }}
          >
            <div className="flex items-center gap-3 mb-6 text-sm font-bold uppercase tracking-widest" style={{ color: "#f59e0b" }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(245,158,11,0.1)" }}>
                <Sparkles size={14} />
              </div>
              Generando en Tiempo Real...
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
    const clientEmail = viewingProposal?.form_data?.clientEmail ?? form.clientEmail;
    const clientCompany = viewingProposal?.form_data?.clientCompany ?? form.clientCompany;
    const clientWhatsapp = viewingProposal?.form_data?.clientWhatsapp ?? form.clientWhatsapp;
    const value = viewingProposal?.form_data?.price
      ? `${viewingProposal.form_data.currency ?? "USD"} ${viewingProposal.form_data.price}`
      : form.price ? `${form.currency} ${form.price}` : null;
    const status = STATUS_LABELS[viewingProposal?.status ?? "generada"] ?? STATUS_LABELS.generada;

    return (
      <div className="min-h-full" style={{ background: "#131313" }}>
        {/* Sticky sub-header */}
        <div className="sticky top-0 z-30 border-b border-white/[0.06] backdrop-blur-md" style={{ background: "rgba(19,19,19,0.97)" }}>
          <div className="px-8 py-3.5">
            <div className="flex items-center justify-between">
              <button
                onClick={() => { setView("list"); setViewingProposal(null); }}
                className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white text-sm font-semibold transition-all hover:bg-white/[0.05] rounded-lg"
              >
                <ArrowLeft size={15} /> Volver
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => sendViaWhatsApp(viewingProposal)}
                  className="flex items-center gap-2 px-3.5 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 transition-all"
                >
                  <MessageCircle size={13} /> WhatsApp
                </button>
                <button
                  onClick={saveProposal}
                  disabled={saving || saved}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                  style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)", color: "#1a0a00" }}
                >
                  {saved
                    ? <><Check size={13} /> Guardado</>
                    : saving
                    ? <><Loader2 size={13} className="animate-spin" /> Guardando...</>
                    : <><Save size={13} /> Guardar</>}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main content — 2/3 */}
            <div className="lg:col-span-2">
              <div className="mb-6">
                <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 ${status.color}`}>
                  {status.label}
                </span>
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
                  >
                    <TrendingUp size={20} style={{ color: "#f59e0b" }} />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                    {clientCompany && <p className="text-slate-400 mt-0.5">{clientCompany}</p>}
                  </div>
                </div>

                {/* Meta grid */}
                <div className="grid grid-cols-2 gap-4 rounded-2xl p-5" style={{ background: "#201f1f" }}>
                  {value && (
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: "rgba(245,158,11,0.1)" }}>
                        <DollarSign className="h-4 w-4" style={{ color: "#f59e0b" }} />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Inversión</p>
                        <p className="text-lg font-bold text-white">{value}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-500/10 p-2.5 flex-shrink-0">
                      <Calendar className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Creada</p>
                      <p className="font-semibold text-white text-sm">
                        {new Date(viewingProposal?.created_at ?? Date.now()).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div
                className="flex items-center gap-1 rounded-xl p-1 border mb-5 w-fit"
                style={{ background: "rgba(28,27,27,0.5)", borderColor: "rgba(255,255,255,0.06)" }}
              >
                <button
                  onClick={() => setResultTab("propuesta")}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={resultTab === "propuesta"
                    ? { background: "#fff", color: "#1a0a00" }
                    : { color: "#938e9e" }
                  }
                >
                  Propuesta
                </button>
                <button
                  onClick={() => { setResultTab("html"); if (!htmlContent) generateHtml(markdownContent); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all"
                  style={resultTab === "html"
                    ? { background: "#fff", color: "#1a0a00" }
                    : { color: "#938e9e" }
                  }
                >
                  <Code size={13} /> Vista Web
                </button>
              </div>

              {/* Propuesta tab */}
              {resultTab === "propuesta" && (
                <div className="rounded-2xl overflow-hidden" style={{ background: "#1c1b1b" }}>
                  <div className="overflow-y-auto max-h-[72vh] p-8 custom-scrollbar">
                    <div className="prose prose-invert max-w-none prose-headings:tracking-tight">
                      <ReactMarkdown components={mdComponents}>{markdownContent}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}

              {/* HTML / Vista Web tab */}
              {resultTab === "html" && (
                <div className="rounded-2xl overflow-hidden h-[750px] relative" style={{ background: "#1c1b1b" }}>
                  {generatingHtml && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-20" style={{ background: "rgba(28,27,27,0.7)" }}>
                      <Loader2 size={36} className="animate-spin mb-4" style={{ color: "#f59e0b" }} />
                      <p className="text-white font-bold">Generando experiencia interactiva...</p>
                    </div>
                  )}
                  {!generatingHtml && htmlContent ? (
                    <iframe
                      key={htmlIframeKey}
                      srcDoc={htmlContent.replace("</head>", `<style>#accept-btn,.floating-cta{display:none!important}</style></head>`)}
                      className="w-full h-full bg-white"
                      title="Propuesta Interactiva"
                    />
                  ) : !generatingHtml && (
                    <div className="flex flex-col items-center justify-center h-full p-12 text-center" style={{ background: "#1c1b1b" }}>
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-slate-600 mb-5"
                        style={{ border: "1px solid rgba(255,255,255,0.05)", background: "#131313" }}
                      >
                        <Code size={28} />
                      </div>
                      <p className="text-slate-400 font-semibold mb-5">La versión web aún no ha sido generada</p>
                      <button
                        onClick={() => generateHtml(markdownContent)}
                        className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all"
                        style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)", color: "#1a0a00" }}
                      >
                        Generar Vista Web
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar — 1/3 */}
            <div className="space-y-4">

              {/* Quick Actions */}
              <div className="rounded-2xl p-5" style={{ background: "#201f1f", borderLeft: "3px solid #f59e0b" }}>
                <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: "#f59e0b" }}>
                  <Sparkles className="h-4 w-4" /> Acciones Rápidas
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => { setHtmlContent(""); generate(); }}
                    disabled={generating}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all disabled:opacity-50"
                    style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", borderColor: "rgba(245,158,11,0.2)" }}
                  >
                    <RefreshCw size={13} className={generating ? "animate-spin" : ""} />
                    Regenerar con IA
                  </button>
                  <button
                    onClick={() => { setStep(0); setView("form"); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-200 text-xs font-bold rounded-lg border transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.05)" }}
                  >
                    <Pencil size={13} /> Editar Parámetros
                  </button>
                  <button
                    onClick={() => copyContent(markdownContent)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-200 text-xs font-bold rounded-lg border transition-all"
                    style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.05)" }}
                  >
                    {copied
                      ? <><Check size={13} className="text-emerald-400" /> Copiado</>
                      : <><Copy size={13} /> Copiar Texto</>}
                  </button>
                </div>
              </div>

              {/* Export */}
              {htmlContent && (
                <div className="rounded-2xl p-5" style={{ background: "#201f1f", borderLeft: "3px solid #4ade80" }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: "#4ade80" }}>Exportar</h3>
                  <div className="space-y-2">
                    <button
                      onClick={downloadPdf}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all"
                      style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", borderColor: "rgba(245,158,11,0.2)" }}
                    >
                      <FileDown size={13} /> Descargar PDF
                    </button>
                    <button
                      onClick={downloadHtml}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-200 text-xs font-bold rounded-lg border transition-all"
                      style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.05)" }}
                    >
                      <Download size={13} /> Descargar HTML
                    </button>
                  </div>
                </div>
              )}

              {/* Share */}
              <div className="rounded-2xl p-5" style={{ background: "#201f1f", borderLeft: "3px solid #60a5fa" }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: "#60a5fa" }}>Compartir</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => sendViaWhatsApp(viewingProposal)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 transition-all"
                  >
                    <MessageCircle size={13} /> Enviar por WhatsApp
                  </button>
                  {clientEmail && (
                    <button
                      onClick={() => sendViaEmail(viewingProposal)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold rounded-lg border transition-all"
                      style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", borderColor: "rgba(245,158,11,0.2)" }}
                    >
                      <Mail size={13} /> Enviar por Email
                    </button>
                  )}
                  {(savedProposalId || viewingProposal?.id) && htmlContent && timeLeft && (
                    <>
                      {timeLeft === "expirado" ? (
                        <>
                          <p className="text-[10px] text-amber-400/80 text-center">⚠️ El enlace ha expirado.</p>
                          <button
                            onClick={renewShareLink}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border"
                            style={{ background: "rgba(245,158,11,0.1)", color: "#fbbf24", borderColor: "rgba(245,158,11,0.2)" }}
                          >
                            <RefreshCw size={13} /> Renovar Enlace (24h)
                          </button>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyShareLink(savedProposalId ?? viewingProposal!.id)}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border"
                              style={copiedLink
                                ? { background: "rgba(74,222,128,0.1)", color: "#4ade80", borderColor: "rgba(74,222,128,0.2)" }
                                : { background: "rgba(255,255,255,0.04)", color: "#e2e8f0", borderColor: "rgba(255,255,255,0.05)" }
                              }
                            >
                              {copiedLink
                                ? <><Check size={13} /> Copiado</>
                                : <><Link2 size={13} /> Copiar enlace</>}
                            </button>
                            <button
                              onClick={() => generateHtml(markdownContent)}
                              disabled={generatingHtml}
                              title="Regenerar enlace con el contenido actualizado"
                              className="flex items-center justify-center p-2.5 rounded-lg text-xs font-bold transition-all border text-slate-400 disabled:opacity-40"
                              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.05)" }}
                            >
                              <RefreshCw size={13} className={generatingHtml ? "animate-spin" : ""} />
                            </button>
                          </div>
                          <p className="text-[10px] text-slate-500 text-center mt-1">⏱ Expira en {timeLeft}</p>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Client info */}
              {(clientEmail || clientWhatsapp || clientCompany) && (
                <div className="rounded-2xl p-5" style={{ background: "#201f1f", borderLeft: "3px solid #fb923c" }}>
                  <h3 className="text-sm font-bold mb-4" style={{ color: "#fb923c" }}>Información del Cliente</h3>
                  <div className="space-y-3 text-sm">
                    {clientCompany && (
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Empresa</p>
                        <p className="font-semibold text-white">{clientCompany}</p>
                      </div>
                    )}
                    {clientEmail && (
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Email</p>
                        <p className="font-semibold truncate" style={{ color: "#fbbf24" }}>{clientEmail}</p>
                      </div>
                    )}
                    {clientWhatsapp && (
                      <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">WhatsApp</p>
                        <p className="font-semibold text-white">{clientWhatsapp}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Status update */}
              {viewingProposal && (
                <div className="rounded-2xl p-5" style={{ background: "#201f1f", borderLeft: "3px solid #fbbf24" }}>
                  <h3 className="text-sm font-bold mb-3" style={{ color: "#fbbf24" }}>Estado</h3>
                  <select
                    value={viewingProposal.status}
                    onChange={e => {
                      updateProposalStatus(viewingProposal.id, e.target.value);
                      setViewingProposal(prev => prev ? { ...prev, status: e.target.value } : null);
                    }}
                    className="w-full px-4 py-2.5 border border-white/[0.08] rounded-xl text-white text-sm font-semibold outline-none cursor-pointer transition-colors"
                    style={{ background: "#131313" }}
                  >
                    {CRM_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Page shell ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313" }}>
      {/* Module header */}
      <div
        className="px-8 py-5 border-b flex items-center justify-between flex-shrink-0 backdrop-blur-md z-30"
        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(19,19,19,0.8)" }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(90deg,#fbbf24,#f59e0b)", boxShadow: "0 0 20px rgba(245,158,11,0.2)" }}
          >
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">Propuestas de Ventas</h1>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Pipeline comercial & Generación IA</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {view === "list"   && renderList()}
        {view === "form"   && renderForm()}
        {view === "result" && renderResult()}
      </div>
    </div>
  );
}
