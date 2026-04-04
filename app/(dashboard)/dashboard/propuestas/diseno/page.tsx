"use client";

import { useState, useEffect } from "react";
import {
  Palette, Plus, ArrowLeft, ArrowRight, Sparkles,
  Copy, Check, Save, Loader2, Trash2, ChevronRight, Eye,
  Download, RefreshCw, Mail, MessageCircle,
  FileDown, Link2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DesignForm {
  // Step 1 — Project type
  designType: string[];
  applications: string;
  // Step 2 — Client info
  clientName: string;
  clientCompany: string;
  clientIndustry: string;
  clientEmail: string;
  clientWhatsapp: string;
  briefDescription: string;
  // Step 3 — Creative brief
  stylePreference: string;
  colorPalette: string;
  typographyPreference: string;
  visualReferences: string;
  competidores: string;
  // Step 4 — Scope
  deliverables: string;
  revisions: string;
  sourceFiles: boolean;
  usageRights: string;
  portfolioPermission: boolean;
  timeline: string;
  // Step 5 — Investment
  price: string;
  currency: string;
  paymentTerms: string;
}

interface DesignProposal {
  id: string;
  client_name: string;
  industry: string;
  status: string;
  created_at: string;
  generated_content: string;
  html_content?: string;
  html_expires_at?: string;
  form_data?: DesignForm;
}

const defaultForm: DesignForm = {
  designType: [],
  applications: "",
  clientName: "", clientCompany: "", clientIndustry: "", clientEmail: "",
  clientWhatsapp: "", briefDescription: "",
  stylePreference: "", colorPalette: "", typographyPreference: "",
  visualReferences: "", competidores: "",
  deliverables: "", revisions: "3", sourceFiles: false,
  usageRights: "Digital e Impreso", portfolioPermission: true,
  timeline: "",
  price: "", currency: "USD", paymentTerms: "",
};

const DESIGN_TYPES = [
  { id: "branding",      label: "Branding / Identidad Visual",     desc: "Logo, paleta, tipografía, brand book" },
  { id: "web",           label: "Diseño Web",                       desc: "Landing pages, sitios, microsites" },
  { id: "uiux",          label: "UI/UX",                            desc: "Apps, interfaces, prototipos interactivos" },
  { id: "packaging",     label: "Packaging",                        desc: "Empaques, etiquetas, presentación de producto" },
  { id: "editorial",     label: "Editorial / Print",                desc: "Catálogos, revistas, libros, flyers" },
  { id: "motion",        label: "Motion & Video",                   desc: "Animaciones, intros, video corporativo" },
  { id: "ilustracion",   label: "Ilustración",                      desc: "Ilustraciones personalizadas y arte digital" },
  { id: "socialkit",     label: "Social Media Kit",                 desc: "Templates para Instagram, LinkedIn, TikTok" },
  { id: "pitch",         label: "Pitch Deck / Presentaciones",      desc: "Decks para inversores, clientes o eventos" },
  { id: "integral",      label: "Diseño Integral",                  desc: "Proyecto completo multiplataforma" },
];

const STYLE_OPTIONS = [
  "Minimalista", "Corporativo / Formal", "Creativo / Experimental",
  "Elegante / Lujoso", "Amigable / Casual", "Moderno / Tecnológico",
  "Vintage / Retro", "Orgánico / Natural",
];

const USAGE_RIGHTS = [
  "Solo uso digital", "Solo uso impreso",
  "Digital e Impreso", "Ilimitado / Todo uso",
];

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "ARS", "PEN", "CLP"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:        { label: "Borrador",        color: "bg-slate-500/10 text-slate-400 border border-slate-500/20" },
  generada:     { label: "Generada",        color: "bg-violet-500/10 text-violet-400 border border-violet-500/20" },
  sent:         { label: "Enviada",         color: "bg-blue-500/10 text-blue-400 border border-blue-500/20" },
  negotiating:  { label: "Negociando",      color: "bg-amber-500/10 text-amber-400 border border-amber-500/20" },
  closed_won:   { label: "Aceptada ✓",      color: "bg-green-500/10 text-green-400 border border-green-500/20" },
  closed_lost:  { label: "Cerrada ✗",       color: "bg-red-500/10 text-red-400 border border-red-500/20" },
};

const CRM_COLUMNS = [
  { key: "draft",       label: "Borrador",   color: "border-slate-700" },
  { key: "generada",    label: "Generada",   color: "border-violet-700" },
  { key: "sent",        label: "Enviada",    color: "border-blue-700" },
  { key: "negotiating", label: "Negociando", color: "border-amber-700" },
  { key: "closed_won",  label: "Ganada",     color: "border-green-700" },
  { key: "closed_lost", label: "Perdida",    color: "border-red-700" },
];

const STEPS = ["Proyecto", "Cliente", "Brief", "Alcance", "Inversión", "Finalizar"];

// ─── Markdown components ──────────────────────────────────────────────────────

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-2xl font-bold text-white mb-4 mt-6 first:mt-0">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-xl font-bold text-white mb-3 mt-5 first:mt-0">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-lg font-semibold text-white mb-2 mt-4 first:mt-0">{children}</h3>,
  p: ({ children }: any) => <p className="mb-3 last:mb-0 leading-relaxed text-slate-300">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-300">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-300">{children}</ol>,
  li: ({ children }: any) => <li className="text-slate-300">{children}</li>,
  strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
  hr: () => <hr className="border-white/10 my-6" />,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-200">
          {label} {required && <span className="text-violet-400">*</span>}
        </label>
        {hint && <span className="text-slate-500 font-medium text-[10px] uppercase tracking-wider">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-3 bg-navy-950 border border-white/[0.08] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-4 focus:ring-violet-500/10 transition-all duration-200";
const textareaCls = `${inputCls} resize-none min-h-[100px]`;

// ─── Main component ───────────────────────────────────────────────────────────

export default function DisenoPropuestasPage() {
  const [view, setView]           = useState<"list" | "form" | "result">("list");
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState<DesignForm>(defaultForm);
  const [proposals, setProposals] = useState<DesignProposal[]>([]);
  const [loadingList, setLoadingList]       = useState(true);
  const [generating, setGenerating]         = useState(false);
  const [generatingHtml, setGeneratingHtml] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [structuredContent, setStructuredContent] = useState<any>(null);
  const [htmlContent, setHtmlContent]     = useState("");
  const [resultTab, setResultTab] = useState<"propuesta" | "html">("propuesta");
  const [viewingProposal, setViewingProposal] = useState<DesignProposal | null>(null);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [htmlExpiresAt, setHtmlExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft]   = useState<string | null>(null);
  const [htmlIframeKey, setHtmlIframeKey] = useState(0);

  useEffect(() => { fetchProposals(); }, []);

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
    setGeneratedContent(viewingProposal.generated_content ?? "");
    setStructuredContent(null);
    setHtmlContent(viewingProposal.html_content ?? "");
    setHtmlExpiresAt(viewingProposal.html_expires_at ?? null);
    if (viewingProposal.form_data) setForm({ ...defaultForm, ...viewingProposal.form_data });
    if (viewingProposal.html_content) setHtmlIframeKey(k => k + 1);
  }, [viewingProposal]);

  function jsonToMarkdown(data: any): string {
    if (!data) return "";
    return `
# ${data.tipoProyecto}

## Resumen Creativo
${data.resumenCreativo}

## Comprensión del Cliente
${data.entendimientoDelCliente}

## Retos Detectados
${data.retosDetectados?.map((r: any) => `### ${r.titulo}\n${r.descripcion}`).join("\n\n")}

## Enfoque Creativo
${data.enfoqueCreativo?.descripcion}
${data.enfoqueCreativo?.pilares?.map((p: any) => `- ${p}`).join("\n")}

## Entregables
${data.entregables?.map((e: any) => `- ${e}`).join("\n")}

## Fases del Proyecto
${data.fases?.map((f: any) => `${f.numero}. **${f.titulo}** (${f.duracion}): ${f.descripcion}`).join("\n")}

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

  async function fetchProposals() {
    setLoadingList(true);
    const res = await fetch("/api/design-proposals");
    if (res.ok) setProposals(await res.json());
    setLoadingList(false);
  }

  async function updateProposalStatus(id: string, status: string) {
    await fetch("/api/design-proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setProposals(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  }

  function sendViaWhatsApp(proposal: DesignProposal | null) {
    const phone = (proposal?.form_data?.clientWhatsapp ?? form.clientWhatsapp).replace(/\D/g, "");
    const name = proposal?.client_name ?? form.clientName;
    const company = proposal?.form_data?.clientCompany ?? form.clientCompany;
    const id = savedProposalId ?? proposal?.id;
    const link = id ? `\n\n🎨 Ver propuesta de diseño: ${window.location.origin}/view/design/${id}` : "";
    const msg = encodeURIComponent(
      `Hola ${name || ""}! 👋\n\nTe comparto la propuesta de diseño que preparamos especialmente para ${company || name || "ti"}.${link}\n\nQuedo disponible para cualquier consulta. ¡Espero tu respuesta!`
    );
    const url = phone ? `https://wa.me/${phone}?text=${msg}` : `https://wa.me/?text=${msg}`;
    window.open(url, "_blank");
  }

  function sendViaEmail(proposal: DesignProposal | null) {
    const email = proposal?.form_data?.clientEmail ?? form.clientEmail;
    const name = proposal?.client_name ?? form.clientName;
    const id = savedProposalId ?? proposal?.id;
    const link = id ? `\n\n🎨 Ver propuesta online: ${window.location.origin}/view/design/${id}` : "";
    const subject = encodeURIComponent(`Propuesta de diseño para ${name}`);
    const body = encodeURIComponent(
      `Hola ${name},\n\nTe comparto la propuesta de diseño que preparamos para ti.${link}\n\n¡Estamos a tu disposición!\n\nSaludos`
    );
    window.open(`mailto:${email}?subject=${subject}&body=${body}`, "_blank");
  }

  function set(field: keyof DesignForm, value: string | boolean) {
    setForm(p => ({ ...p, [field]: value }));
  }

  function toggleDesignType(id: string) {
    setForm(prev => ({
      ...prev,
      designType: prev.designType.includes(id)
        ? prev.designType.filter(d => d !== id)
        : [...prev.designType, id],
    }));
  }

  function canNext(): boolean {
    if (step === 0) return form.designType.length > 0;
    if (step === 1) return !!form.clientName && !!form.clientIndustry;
    if (step === 2) return !!form.stylePreference;
    if (step === 3) return !!form.deliverables && !!form.timeline;
    if (step === 4) return !!form.price && !!form.paymentTerms;
    return true;
  }

  async function generate() {
    setGenerating(true);
    setSaved(false);
    setGeneratedContent("");
    setHtmlContent("");
    setStructuredContent(null);

    try {
      const res = await fetch("/api/design-proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setStructuredContent(data);
      const md = jsonToMarkdown(data);
      setGeneratedContent(md);

      setViewingProposal(prev =>
        prev ? { ...prev, generated_content: md, status: "generada", form_data: form } : null
      );

      setView("result");
      setResultTab("propuesta");

      const existingId = savedProposalId || viewingProposal?.id;
      if (existingId && md) {
        await fetch("/api/design-proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: existingId,
            generated_content: md,
            status: "draft",
            client_name: form.clientName,
            industry: form.clientIndustry,
            form_data: form,
          }),
        });
        await fetchProposals();
      } else if (md) {
        const saveRes = await fetch("/api/design-proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: form.clientName,
            clientIndustry: form.clientIndustry,
            formData: form,
            generatedContent: md,
            status: "draft",
          }),
        });
        if (saveRes.ok) {
          const saved = await saveRes.json();
          if (saved.id) setSavedProposalId(saved.id);
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
      .replace(/^```html\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```\s*$/, "").trim();
  }

  async function generateHtml(markdownContent: string) {
    setGeneratingHtml(true);
    setHtmlContent("");
    setResultTab("html");

    try {
      const res = await fetch("/api/design-proposals/html", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: markdownContent,
          clientName: viewingProposal?.client_name ?? form.clientName,
          clientCompany: form.clientCompany,
          price: `${form.currency} ${form.price}`,
          structuredContent,
          proposalId: savedProposalId ?? viewingProposal?.id,
        }),
      });

      if (res.status === 402) {
        setResultTab("propuesta");
        alert("⚠️ Debes configurar tu API key en Perfil de Marca para usar esta función.");
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
        await fetch("/api/design-proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, html_content: stripFences(accumulated), html_expires_at: expires }),
        });
        setHtmlExpiresAt(expires);
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
    a.download = `propuesta-diseno-${(viewingProposal?.client_name ?? form.clientName).toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    const printCss = `<style>
      @page { margin: 1.5cm; size: A4; }
      @media print {
        * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
        body { -webkit-print-color-adjust: exact !important; }
        .hero-glow-1, .hero-glow-2 { display: none !important; }
      }
    </style>`;
    const withCss = htmlContent.includes("</head>")
      ? htmlContent.replace("</head>", `${printCss}</head>`)
      : printCss + htmlContent;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(withCss);
    win.document.close();
    setTimeout(() => { win.print(); }, 800);
  }

  async function saveProposal() {
    setSaving(true);
    const id = savedProposalId || viewingProposal?.id;
    try {
      if (id) {
        const res = await fetch("/api/design-proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id, client_name: form.clientName, industry: form.clientIndustry,
            form_data: form, generated_content: generatedContent,
            html_content: htmlContent, status: "draft",
          }),
        });
        if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Error");
      } else {
        const res = await fetch("/api/design-proposals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            clientName: form.clientName, clientIndustry: form.clientIndustry,
            formData: form, generatedContent, htmlContent, status: "draft",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) setSavedProposalId(data.id);
        } else throw new Error((await res.json().catch(() => ({}))).error || "Error");
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
    await fetch("/api/design-proposals", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setProposals(p => p.filter(x => x.id !== id));
  }

  function copyContent(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyShareLink(id: string) {
    const url = `${window.location.origin}/view/design/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  }

  async function renewShareLink() {
    const id = savedProposalId ?? viewingProposal?.id;
    if (!id) return;
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await fetch("/api/design-proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, html_expires_at: expires }),
    });
    setHtmlExpiresAt(expires);
  }

  function startNew() {
    setForm(defaultForm);
    setStep(0);
    setGeneratedContent("");
    setHtmlContent("");
    setStructuredContent(null);
    setSavedProposalId(null);
    setViewingProposal(null);
    setHtmlExpiresAt(null);
    setView("form");
  }

  function openProposal(p: DesignProposal) {
    setViewingProposal(p);
    setView("result");
    setResultTab(p.html_content ? "html" : "propuesta");
  }

  // ─── Render: List view ─────────────────────────────────────────────────────

  if (view === "list") {
    const totalValue = proposals.reduce((sum, p) => {
      const price = parseFloat((p.form_data?.price ?? "").replace(/,/g, "") || "0");
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
    const activeProposals = proposals.filter(p => ["sent", "negotiating", "generada"].includes(p.status)).length;
    const closedWon   = proposals.filter(p => p.status === "closed_won").length;
    const closedTotal = proposals.filter(p => ["closed_won", "closed_lost"].includes(p.status)).length;
    const winRate     = closedTotal > 0 ? (closedWon / closedTotal) * 100 : 0;

    const stats = [
      { label: "Total Propuestas", value: proposals.length.toString(),                                      accent: "#a78bfa" },
      { label: "Valor Total",      value: totalValue > 0 ? `$${totalValue.toLocaleString()}` : "—",         accent: "#4ade80" },
      { label: "Activas",          value: activeProposals.toString(),                                        accent: "#c084fc" },
      { label: "Tasa de Cierre",   value: `${winRate.toFixed(0)}%`,                                         accent: "#fb923c" },
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
            style={{ top: "-30%", right: "-5%", width: "380px", height: "340px", background: "rgba(167,139,250,0.07)", filter: "blur(60px)" }}
          />
          <div className="relative flex items-center justify-between">
            <div>
              <h1 className="font-extrabold text-[32px] text-white tracking-tight leading-tight mb-1">
                Propuestas <span style={{ color: "#a78bfa" }}>Diseño</span>
              </h1>
              <p className="text-[14px]" style={{ color: "#938e9e" }}>
                Genera propuestas creativas y profesionales para tus clientes
              </p>
            </div>
            <button
              onClick={startNew}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl transition-all flex-shrink-0"
              style={{ background: "linear-gradient(90deg,#a78bfa,#7c3aed)", color: "#fff", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
            >
              <Plus className="w-4 h-4" /> Nueva Propuesta
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
              <span className="text-[10px] font-bold uppercase tracking-[1px] mb-1" style={{ color: "#938e9e" }}>
                {stat.label}
              </span>
              <div className="font-bold text-[24px] text-white leading-tight">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* List */}
        {loadingList ? (
          <div className="flex items-center gap-3 text-slate-400 text-sm py-12">
            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#a78bfa" }} /> Cargando propuestas...
          </div>
        ) : proposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/[0.05] py-20" style={{ background: "rgba(167,139,250,0.03)" }}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(167,139,250,0.1)" }}>
              <Palette className="w-7 h-7" style={{ color: "#a78bfa" }} />
            </div>
            <p className="text-white font-bold text-lg mb-2">Sin propuestas de diseño</p>
            <p className="text-slate-500 text-sm max-w-xs text-center mb-8">
              Crea tu primera propuesta de diseño profesional asistida por IA.
            </p>
            <button
              onClick={startNew}
              className="px-6 py-3 text-white text-sm font-bold rounded-xl transition-all"
              style={{ background: "linear-gradient(90deg,#a78bfa,#7c3aed)", boxShadow: "0 0 20px rgba(124,58,237,0.25)" }}
            >
              Crear Primera Propuesta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {proposals.map(p => {
              const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.draft;
              const value  = p.form_data?.price ? `${p.form_data.currency ?? "USD"} ${p.form_data.price}` : null;
              return (
                <div
                  key={p.id}
                  className="group relative overflow-hidden rounded-xl border border-white/[0.08] p-6 transition-all duration-200 cursor-pointer"
                  style={{ background: "#1c1b1b" }}
                  onClick={() => openProposal(p)}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(167,139,250,0.3)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(124,58,237,0.08)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "none";
                  }}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.1)" }}>
                        <Palette className="w-5 h-5" style={{ color: "#a78bfa" }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white truncate leading-snug group-hover:text-violet-300 transition-colors">
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
                        onClick={e => { e.stopPropagation(); if (confirm(`¿Eliminar propuesta de ${p.client_name}?`)) deleteProposal(p.id); }}
                        className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div className="flex items-center gap-4 text-sm">
                    {value && (
                      <span className="font-bold text-emerald-400 text-xs">{value}</span>
                    )}
                    {(p.form_data?.designType?.length ?? 0) > 0 && (
                      <span className="text-xs text-slate-500 truncate">
                        {(p.form_data?.designType as string[] ?? []).slice(0, 2).join(", ")}
                      </span>
                    )}
                    <span className="text-slate-500 text-xs ml-auto">
                      {new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <div className="flex items-center gap-1.5 ml-auto" onClick={e => e.stopPropagation()}>
                      <select
                        value={p.status}
                        onChange={e => updateProposalStatus(p.id, e.target.value)}
                        className="text-[10px] font-bold bg-navy-950 text-slate-400 rounded-lg border border-white/[0.08] outline-none cursor-pointer hover:border-violet-500/40 transition-colors px-1.5 py-1"
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

  // ─── Render: Form ──────────────────────────────────────────────────────────

  if (view === "form") {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        {/* Back */}
        <button onClick={() => setView("list")} className="flex items-center gap-2 text-slate-500 hover:text-white text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Mis propuestas de diseño
        </button>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => i < step && setStep(i)}
                  className={`flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    i < step ? "bg-violet-500 text-white cursor-pointer hover:bg-violet-400"
                    : i === step ? "bg-violet-500/20 text-violet-400 border border-violet-500/40"
                    : "bg-white/5 text-slate-600"
                  }`}
                >
                  {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </button>
                <span className={`text-sm ${i === step ? "text-white font-semibold" : "text-slate-600"}`}>
                  {s}
                </span>
                {i < STEPS.length - 1 && <div className="w-8 h-px bg-white/10 mx-1" />}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-surface-800 rounded-2xl border border-white/[0.06] p-8">

          {/* STEP 0 — Tipo de Proyecto */}
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">¿Qué tipo de proyecto es?</h2>
                <p className="text-slate-500 text-sm">Selecciona uno o varios tipos de diseño que necesita el cliente</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DESIGN_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => toggleDesignType(type.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      form.designType.includes(type.id)
                        ? "bg-violet-500/15 border-violet-500/50 text-white"
                        : "bg-navy-950 border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-white"
                    }`}
                  >
                    <div className="font-semibold text-sm mb-0.5">{type.label}</div>
                    <div className="text-xs opacity-60">{type.desc}</div>
                  </button>
                ))}
              </div>
              <Field label="¿Dónde se usará?" hint="Aplicaciones">
                <textarea
                  className={textareaCls}
                  rows={3}
                  placeholder="Ej: Web, impresión, redes sociales, packaging, presentaciones..."
                  value={form.applications}
                  onChange={e => set("applications", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* STEP 1 — Cliente */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Información del cliente</h2>
                <p className="text-slate-500 text-sm">¿Para quién estamos creando este diseño?</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nombre del cliente" required>
                  <input className={inputCls} placeholder="Ej: María González" value={form.clientName} onChange={e => set("clientName", e.target.value)} />
                </Field>
                <Field label="Empresa / Marca">
                  <input className={inputCls} placeholder="Ej: Florería Luna" value={form.clientCompany} onChange={e => set("clientCompany", e.target.value)} />
                </Field>
              </div>
              <Field label="Industria o Nicho" required>
                <input className={inputCls} placeholder="Ej: Moda sostenible, Restaurantes, Tecnología..." value={form.clientIndustry} onChange={e => set("clientIndustry", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email">
                  <input className={inputCls} type="email" placeholder="cliente@empresa.com" value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} />
                </Field>
                <Field label="WhatsApp">
                  <input className={inputCls} placeholder="+52 55 1234 5678" value={form.clientWhatsapp} onChange={e => set("clientWhatsapp", e.target.value)} />
                </Field>
              </div>
              <Field label="Descripción del negocio y qué quieren comunicar" hint="Cuanto más detalle, mejor">
                <textarea
                  className={textareaCls}
                  rows={4}
                  placeholder="Ej: Tienda de moda sostenible fundada en 2020. Quieren transmitir elegancia, consciencia ambiental y modernidad. Su público son mujeres de 25-40 años..."
                  value={form.briefDescription}
                  onChange={e => set("briefDescription", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* STEP 2 — Brief Creativo */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Brief creativo</h2>
                <p className="text-slate-500 text-sm">Define la dirección visual del proyecto</p>
              </div>
              <Field label="Estilo visual preferido" required>
                <div className="grid grid-cols-2 gap-2">
                  {STYLE_OPTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => set("stylePreference", s)}
                      className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                        form.stylePreference === s
                          ? "bg-violet-500/15 border-violet-500/50 text-white"
                          : "bg-navy-950 border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </Field>
              <Field label="Paleta de colores" hint="Opcional">
                <input
                  className={inputCls}
                  placeholder="Ej: Azul marino, dorado y blanco. O: sin preferencia."
                  value={form.colorPalette}
                  onChange={e => set("colorPalette", e.target.value)}
                />
              </Field>
              <Field label="Preferencias tipográficas" hint="Opcional">
                <input
                  className={inputCls}
                  placeholder="Ej: Sans-serif moderno, o serif clásico para el tagline"
                  value={form.typographyPreference}
                  onChange={e => set("typographyPreference", e.target.value)}
                />
              </Field>
              <Field label="Referencias visuales" hint="URLs o descripciones">
                <textarea
                  className={textareaCls}
                  rows={3}
                  placeholder="Ej: Nos inspira el estilo de Apple.com, marcas como Zara o Aesop. O pega URLs de imágenes..."
                  value={form.visualReferences}
                  onChange={e => set("visualReferences", e.target.value)}
                />
              </Field>
              <Field label="Competidores o referentes del mercado" hint="Opcional">
                <input
                  className={inputCls}
                  placeholder="Ej: Sus competidores son Zara Home, H&M Living y Pottery Barn"
                  value={form.competidores}
                  onChange={e => set("competidores", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* STEP 3 — Alcance */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Alcance del proyecto</h2>
                <p className="text-slate-500 text-sm">Define qué incluye la propuesta</p>
              </div>
              <Field label="Entregables específicos" required hint="Qué recibirá el cliente">
                <textarea
                  className={textareaCls}
                  rows={4}
                  placeholder="Ej: Logotipo en 3 variantes, paleta de colores, tipografías, manual de marca (20 páginas), archivos en AI, PDF y PNG..."
                  value={form.deliverables}
                  onChange={e => set("deliverables", e.target.value)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Rondas de revisión incluidas">
                  <input
                    className={inputCls}
                    type="number"
                    min="1"
                    max="10"
                    value={form.revisions}
                    onChange={e => set("revisions", e.target.value)}
                  />
                </Field>
                <Field label="Duración estimada" required>
                  <input
                    className={inputCls}
                    placeholder="Ej: 3 semanas, 15 días hábiles"
                    value={form.timeline}
                    onChange={e => set("timeline", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Derechos de uso">
                <div className="grid grid-cols-2 gap-2">
                  {USAGE_RIGHTS.map(u => (
                    <button
                      key={u}
                      onClick={() => set("usageRights", u)}
                      className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${
                        form.usageRights === u
                          ? "bg-violet-500/15 border-violet-500/50 text-white"
                          : "bg-navy-950 border-white/[0.06] text-slate-400 hover:border-white/20 hover:text-white"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => set("sourceFiles", !form.sourceFiles)}
                    className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.sourceFiles ? "bg-violet-500" : "bg-white/10"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${form.sourceFiles ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">Incluir archivos fuente editables</div>
                    <div className="text-xs text-slate-500">AI, PSD, Figma, etc.</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => set("portfolioPermission", !form.portfolioPermission)}
                    className={`w-10 h-6 rounded-full transition-colors flex-shrink-0 ${form.portfolioPermission ? "bg-violet-500" : "bg-white/10"}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white mt-1 transition-transform ${form.portfolioPermission ? "translate-x-5" : "translate-x-1"}`} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">Permiso para usar en portafolio</div>
                    <div className="text-xs text-slate-500">El proyecto puede mostrarse en nuestro portafolio</div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* STEP 4 — Inversión */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Inversión del proyecto</h2>
                <p className="text-slate-500 text-sm">Define el precio y condiciones de pago</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <Field label="Moneda">
                    <select className={inputCls} value={form.currency} onChange={e => set("currency", e.target.value)}>
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </Field>
                </div>
                <div className="col-span-2">
                  <Field label="Precio total" required>
                    <input
                      className={inputCls}
                      placeholder="Ej: 3500"
                      value={form.price}
                      onChange={e => set("price", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
              <Field label="Condiciones de pago" required>
                <textarea
                  className={textareaCls}
                  rows={3}
                  placeholder="Ej: 50% al inicio del proyecto, 50% al entregar el diseño final"
                  value={form.paymentTerms}
                  onChange={e => set("paymentTerms", e.target.value)}
                />
              </Field>
            </div>
          )}

          {/* STEP 5 — Finalizar */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Listo para generar</h2>
                <p className="text-slate-500 text-sm">Revisa el resumen y genera la propuesta con IA</p>
              </div>
              <div className="space-y-3">
                {[
                  ["Tipo de proyecto", form.designType.map(d => DESIGN_TYPES.find(t => t.id === d)?.label).filter(Boolean).join(", ")],
                  ["Cliente", `${form.clientName}${form.clientCompany ? ` · ${form.clientCompany}` : ""}`],
                  ["Industria", form.clientIndustry],
                  ["Estilo", form.stylePreference],
                  ["Entregables", form.deliverables.slice(0, 80) + (form.deliverables.length > 80 ? "..." : "")],
                  ["Duración", form.timeline],
                  ["Revisiones", `${form.revisions} ronda(s)`],
                  ["Inversión", `${form.currency} ${form.price}`],
                ].map(([k, v]) => v ? (
                  <div key={k} className="flex gap-3 py-2 border-b border-white/[0.05]">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider w-28 flex-shrink-0 pt-0.5">{k}</span>
                    <span className="text-sm text-slate-300">{v}</span>
                  </div>
                ) : null)}
              </div>
              <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-4">
                <p className="text-xs text-violet-300 font-medium">
                  ✦ La IA generará una propuesta personalizada con enfoque creativo, fases del proyecto, entregables detallados y argumentos de venta adaptados al cliente.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => step > 0 ? setStep(s => s - 1) : setView("list")}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 hover:text-white hover:border-white/20 text-sm font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Anterior
          </button>

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canNext() && setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-all"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 disabled:opacity-50 text-white text-sm font-semibold transition-all"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Generando..." : "Generar Propuesta"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Render: Result ────────────────────────────────────────────────────────

  const currentId = savedProposalId ?? viewingProposal?.id;
  const title        = viewingProposal?.client_name ?? form.clientName;
  const clientEmail  = viewingProposal?.form_data?.clientEmail   ?? form.clientEmail;
  const clientWa     = viewingProposal?.form_data?.clientWhatsapp ?? form.clientWhatsapp;
  const clientCo     = viewingProposal?.form_data?.clientCompany  ?? form.clientCompany;
  const value        = viewingProposal?.form_data?.price
    ? `${viewingProposal.form_data.currency ?? "USD"} ${viewingProposal.form_data.price}`
    : form.price ? `${form.currency} ${form.price}` : null;
  const status = STATUS_LABELS[viewingProposal?.status ?? "generada"] ?? STATUS_LABELS.generada;
  const markdownContent = generatedContent || viewingProposal?.generated_content || "";

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
              <ArrowLeft className="w-4 h-4" /> Volver
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => sendViaWhatsApp(viewingProposal)}
                className="flex items-center gap-2 px-3.5 py-2 bg-green-500/10 hover:bg-green-500/20 text-green-400 text-xs font-bold rounded-lg border border-green-500/20 transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
              </button>
              <button
                onClick={saveProposal}
                disabled={saving || saved}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
                style={{ background: "linear-gradient(90deg,#a78bfa,#7c3aed)", color: "#fff" }}
              >
                {saved
                  ? <><Check className="w-3.5 h-3.5" /> Guardado</>
                  : saving
                  ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Guardando...</>
                  : <><Save className="w-3.5 h-3.5" /> Guardar</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content — 2/3 */}
          <div className="lg:col-span-2">
            {/* Status + title */}
            <div className="mb-6">
              <span className={`inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 ${status.color}`}>
                {status.label}
              </span>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(167,139,250,0.15)" }}>
                  <Palette className="w-6 h-6" style={{ color: "#a78bfa" }} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-tight">{title}</h1>
                  {clientCo && <p className="text-slate-400 mt-0.5">{clientCo}</p>}
                </div>
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-4 rounded-2xl p-5" style={{ background: "#201f1f" }}>
                {value && (
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: "rgba(167,139,250,0.1)" }}>
                      <ChevronRight className="h-4 w-4" style={{ color: "#a78bfa" }} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-0.5">Inversión</p>
                      <p className="text-lg font-bold text-white">{value}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="rounded-lg p-2.5 flex-shrink-0" style={{ background: "rgba(74,222,128,0.1)" }}>
                    <Eye className="h-4 w-4" style={{ color: "#4ade80" }} />
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
            <div className="flex items-center gap-1 rounded-xl p-1 border border-white/[0.06] mb-5 w-fit" style={{ background: "rgba(32,31,31,0.5)" }}>
              <button
                onClick={() => setResultTab("propuesta")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${resultTab === "propuesta" ? "bg-white text-[#131313] shadow-md" : "text-slate-400 hover:text-white"}`}
              >
                Propuesta
              </button>
              <button
                onClick={() => { setResultTab("html"); if (!htmlContent && generatedContent) generateHtml(generatedContent); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${resultTab === "html" ? "bg-white text-[#131313] shadow-md" : "text-slate-400 hover:text-white"}`}
              >
                <Eye className="w-3.5 h-3.5" /> Vista Web
              </button>
            </div>

            {/* Propuesta tab */}
            {resultTab === "propuesta" && (
              <div className="rounded-2xl overflow-hidden" style={{ background: "#1c1b1b" }}>
                <div className="overflow-y-auto max-h-[72vh] p-8 custom-scrollbar">
                  {generating && !generatedContent ? (
                    <div className="flex items-center gap-3 text-sm" style={{ color: "#a78bfa" }}>
                      <Loader2 className="w-4 h-4 animate-spin" /> Generando propuesta creativa...
                    </div>
                  ) : (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown components={mdComponents}>{markdownContent}</ReactMarkdown>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HTML tab */}
            {resultTab === "html" && (
              <div className="rounded-2xl overflow-hidden h-[750px] relative" style={{ background: "#1c1b1b" }}>
                {generatingHtml && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center backdrop-blur-sm z-20" style={{ background: "rgba(19,19,19,0.7)" }}>
                    <Loader2 className="w-9 h-9 animate-spin mb-4" style={{ color: "#a78bfa" }} />
                    <p className="text-white font-bold">Generando experiencia interactiva...</p>
                  </div>
                )}
                {!generatingHtml && htmlContent ? (
                  <iframe
                    key={htmlIframeKey}
                    srcDoc={htmlContent.replace("</head>", '<style>#accept-btn,.floating-cta{display:none!important}</style></head>')}
                    className="w-full h-full bg-white"
                    title="Propuesta de Diseño"
                  />
                ) : !generatingHtml && (
                  <div className="flex flex-col items-center justify-center h-full p-12 text-center" style={{ background: "#1c1b1b" }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 border border-white/[0.05]" style={{ background: "#131313" }}>
                      <Eye className="w-7 h-7 text-slate-600" />
                    </div>
                    <p className="text-slate-400 font-semibold mb-5">La versión web aún no ha sido generada</p>
                    <button
                      onClick={() => generateHtml(markdownContent)}
                      className="px-5 py-2.5 text-white text-sm font-bold rounded-xl transition-all"
                      style={{ background: "linear-gradient(90deg,#a78bfa,#7c3aed)", boxShadow: "0 0 20px rgba(124,58,237,0.25)" }}
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
            <div className="rounded-2xl p-5" style={{ background: "#201f1f", borderLeft: "3px solid #a78bfa" }}>
              <h3 className="flex items-center gap-2 text-sm font-bold mb-4" style={{ color: "#a78bfa" }}>
                <Sparkles className="h-4 w-4" /> Acciones Rápidas
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => { setHtmlContent(""); generate(); }}
                  disabled={generating}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 border"
                  style={{ background: "rgba(167,139,250,0.1)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.2)" }}
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${generating ? "animate-spin" : ""}`} /> Regenerar con IA
                </button>
                <button
                  onClick={() => { setStep(0); setView("form"); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-bold rounded-lg border border-white/[0.05] transition-all"
                >
                  <ChevronRight className="w-3.5 h-3.5" /> Editar Parámetros
                </button>
                <button
                  onClick={() => copyContent(markdownContent)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-bold rounded-lg border border-white/[0.05] transition-all"
                >
                  {copied
                    ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copiado</>
                    : <><Copy className="w-3.5 h-3.5" /> Copiar Texto</>}
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
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border"
                    style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", borderColor: "rgba(74,222,128,0.2)" }}
                  >
                    <FileDown className="w-3.5 h-3.5" /> Descargar PDF
                  </button>
                  <button
                    onClick={downloadHtml}
                    className="w-full flex items-center gap-3 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 text-xs font-bold rounded-lg border border-white/[0.05] transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Descargar HTML
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
                  <MessageCircle className="w-3.5 h-3.5" /> Enviar por WhatsApp
                </button>
                {clientEmail && (
                  <button
                    onClick={() => sendViaEmail(viewingProposal)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all"
                    style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", borderColor: "rgba(96,165,250,0.2)" }}
                  >
                    <Mail className="w-3.5 h-3.5" /> Enviar por Email
                  </button>
                )}
                {currentId && htmlContent && timeLeft && (
                  timeLeft === "expirado" ? (
                    <>
                      <p className="text-[10px] text-amber-400/80 text-center">⚠️ El enlace ha expirado.</p>
                      <button
                        onClick={renewShareLink}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold border transition-all"
                        style={{ background: "rgba(96,165,250,0.08)", color: "#60a5fa", borderColor: "rgba(96,165,250,0.2)" }}
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Renovar Enlace (24h)
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => copyShareLink(currentId)}
                          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                            copiedLink ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/[0.04] text-slate-200 border-white/[0.05] hover:bg-white/[0.08]"
                          }`}
                        >
                          {copiedLink ? <><Check className="w-3.5 h-3.5" /> Copiado</> : <><Link2 className="w-3.5 h-3.5" /> Copiar enlace</>}
                        </button>
                        <button
                          onClick={renewShareLink}
                          disabled={generatingHtml}
                          className="flex items-center justify-center p-2.5 rounded-lg text-xs font-bold border bg-white/[0.04] text-slate-400 border-white/[0.05] hover:bg-white/10 disabled:opacity-40 transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${generatingHtml ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-500 text-center mt-1">⏱ Expira en {timeLeft}</p>
                    </>
                  )
                )}
              </div>
            </div>

            {/* Client info */}
            {(clientEmail || clientWa || clientCo) && (
              <div className="rounded-2xl p-5" style={{ background: "#201f1f", borderLeft: "3px solid #fb923c" }}>
                <h3 className="text-sm font-bold mb-4" style={{ color: "#fb923c" }}>Información del Cliente</h3>
                <div className="space-y-3 text-sm">
                  {clientCo && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Empresa</p>
                      <p className="font-semibold text-white">{clientCo}</p>
                    </div>
                  )}
                  {clientEmail && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Email</p>
                      <p className="font-semibold truncate" style={{ color: "#a78bfa" }}>{clientEmail}</p>
                    </div>
                  )}
                  {clientWa && (
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">WhatsApp</p>
                      <p className="font-semibold text-white">{clientWa}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status */}
            {viewingProposal && (
              <div className="rounded-2xl p-5" style={{ background: "#201f1f", borderLeft: "3px solid #c084fc" }}>
                <h3 className="text-sm font-bold mb-3" style={{ color: "#c084fc" }}>Estado</h3>
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
