"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileSignature, Plus, ArrowLeft, ArrowRight, Sparkles,
  Copy, Check, Save, Loader2, Trash2, ChevronRight, FileText,
  Code, Download, Layers, RefreshCw, Pencil, Upload, Mail,
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
  generada:     { label: "Generada",         color: "bg-emerald-500/20 text-emerald-400" },
  draft:        { label: "Borrador",         color: "bg-gray-500/20 text-gray-400" },
  sent:         { label: "Enviada",         color: "bg-blue-500/20 text-blue-400" },
  negotiating:  { label: "En negociación",  color: "bg-yellow-500/20 text-yellow-400" },
  closed_won:   { label: "Cerrada ✓",       color: "bg-green-500/20 text-green-400" },
  closed_lost:  { label: "Cerrada ✗",       color: "bg-red-500/20 text-red-400" },
};

const STEPS = ["Tipo", "Cliente", "Servicio", "Objetivos", "Alcance", "Diagnóstico", "Inversión", "Generar"];

// ─── Markdown components ───────────────────────────────────────────────────────

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-lg font-bold text-white mb-3 mt-4 first:mt-0">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold text-white mb-2 mt-4 first:mt-0">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-semibold text-white mb-1.5 mt-3 first:mt-0">{children}</h3>,
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed text-gray-200">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
  li: ({ children }: any) => <li className="text-gray-200">{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
  hr: () => <hr className="border-gray-700 my-4" />,
};

// ─── Input helpers ─────────────────────────────────────────────────────────────

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
        {hint && <span className="text-gray-500 font-normal ml-1 text-xs">({hint})</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 transition";
const textareaCls = `${inputCls} resize-none`;

// ─── Main component ────────────────────────────────────────────────────────────

const CRM_COLUMNS = [
  { key: "draft",        label: "Borrador",        color: "border-gray-700" },
  { key: "generada",     label: "Generada",         color: "border-emerald-700" },
  { key: "sent",         label: "Enviada",          color: "border-blue-700" },
  { key: "negotiating",  label: "Negociando",       color: "border-yellow-700" },
  { key: "closed_won",   label: "Cerrada ✓",        color: "border-green-700" },
  { key: "closed_lost",  label: "Perdida",          color: "border-red-700" },
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
  const [generatingSlides, setGeneratingSlides] = useState(false);
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
  const [slidesContent, setSlidesContent] = useState("");
  const [previewId, setPreviewId]         = useState<string | null>(null);
  const [previewTs, setPreviewTs]         = useState(0);
  const [htmlIframeKey, setHtmlIframeKey]     = useState(0);
  const [slidesIframeKey, setSlidesIframeKey] = useState(0);
  const [resultTab, setResultTab] = useState<"propuesta" | "html" | "slides">("propuesta");
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [htmlExpiresAt, setHtmlExpiresAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft]   = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const htmlIframeRef    = useRef<HTMLIFrameElement>(null);
  const slidesIframeRef  = useRef<HTMLIFrameElement>(null);
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
    setSlidesContent(viewingProposal.slides_content ?? "");
    setHtmlExpiresAt(viewingProposal.html_expires_at ?? null);
    setPreviewTs(Date.now());
    if (viewingProposal.form_data) setForm(viewingProposal.form_data);
    if (viewingProposal.html_content) setHtmlIframeKey(k => k + 1);
    if (viewingProposal.slides_content) setSlidesIframeKey(k => k + 1);
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

  useEffect(() => {
    if (!slidesContent || resultTab !== "slides") return;
    const write = () => {
      const iframe = slidesIframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument ?? iframe.contentWindow?.document;
      if (doc) { doc.open(); doc.write(slidesContent); doc.close(); }
    };
    const t = setTimeout(write, 100);
    return () => clearTimeout(t);
  }, [slidesContent, slidesIframeKey, resultTab]);

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
      `Hola ${name}! 👋\n\nTe comparto la propuesta comercial que preparamos especialmente para ${company || name}.${link}\n\nQuedo disponible para cualquier consulta o para agendar una llamada. ¡Espero tu respuesta!`
    );
    window.open(`https://wa.me/${phone}?text=${msg}`, "_blank");
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
    setSlidesContent("");
    setStructuredContent(null);

    try {
      const res = await fetch("/api/proposals/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form }),
      });

      if (!res.ok) throw new Error();
      
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
    } catch {
      setGeneratedContent("Error al generar la propuesta. Intenta de nuevo.");
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
        slidesContent,
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

  // ─── Generate Slides (Reveal.js) ────────────────────────────────────────────

  async function generateSlides(markdownContent: string) {
    setGeneratingSlides(true);
    setSlidesContent("");
    setResultTab("slides");

    try {
      const res = await fetch("/api/proposals/slides", {
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
        setSlidesContent("");
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
        setSlidesContent(stripFences(accumulated));
      }

      // Auto-guardar en Supabase
      const id = savedProposalId ?? viewingProposal?.id;
      if (id && accumulated) {
        await fetch("/api/proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, slides_content: stripFences(accumulated) }),
        });
        setPreviewId(id);
        setPreviewTs(Date.now());
        setSlidesIframeKey(k => k + 1);
        await fetchProposals();
      }
    } catch {
      setSlidesContent("<p>Error al generar la presentación.</p>");
    } finally {
      setGeneratingSlides(false);
    }
  }

  function downloadSlides() {
    const blob = new Blob([slidesContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slides-${(viewingProposal?.client_name ?? form.clientName).toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    URL.revokeObjectURL(url);
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
    setSlidesContent("");
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
      <div className="p-6">
        <div className="flex items-center justify-between mb-6 gap-4">
          {/* Vista toggle */}
          <div className="flex items-center bg-gray-900 border border-gray-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => setCrmMode(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${!crmMode ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              <List size={12} /> Lista
            </button>
            <button
              onClick={() => setCrmMode(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${crmMode ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
            >
              <LayoutGrid size={12} /> CRM
            </button>
          </div>
          <button
            onClick={() => { resetForm(); setView("form"); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition"
          >
            <Plus size={14} /> Nueva propuesta
          </button>
        </div>

        {/* CRM Kanban */}
        {crmMode && !loadingList && (
          <div className="overflow-x-auto pb-4 -mx-6 px-6">
            <div className="flex gap-4" style={{ minWidth: `${CRM_COLUMNS.length * 220}px` }}>
              {CRM_COLUMNS.map(col => {
                const cards = proposals.filter(p => p.status === col.key);
                const st = STATUS_LABELS[col.key] ?? STATUS_LABELS.draft;
                return (
                  <div key={col.key} className="w-52 flex-shrink-0">
                    <div className={`flex items-center justify-between mb-3 pb-2 border-b ${col.color}`}>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${st.color}`}>{col.label}</span>
                      <span className="text-xs text-gray-600">{cards.length}</span>
                    </div>
                    <div className="space-y-2">
                      {cards.map(p => {
                        const logo = p.form_data?.clientLogo;
                        const value = p.form_data?.price ? `${p.form_data.currency ?? "USD"} ${p.form_data.price}` : null;
                        const nextStatuses = CRM_COLUMNS.filter(c => c.key !== p.status);
                        return (
                          <div key={p.id} className="p-3 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition group">
                            {/* Logo + nombre */}
                            <div className="flex items-center gap-2 mb-2">
                              {logo ? (
                                <img src={logo} alt="" className="w-7 h-7 rounded-lg object-cover flex-shrink-0 bg-gray-800" />
                              ) : (
                                <div className="w-7 h-7 rounded-lg bg-gray-800 flex items-center justify-center flex-shrink-0">
                                  <Building2 size={12} className="text-gray-600" />
                                </div>
                              )}
                              <span className="text-white text-xs font-medium truncate">{p.client_name}</span>
                            </div>
                            {p.industry && <p className="text-gray-500 text-xs mb-1 truncate">{p.industry}</p>}
                            {value && <p className="text-emerald-400 text-xs font-semibold mb-2">{value}</p>}
                            <p className="text-gray-600 text-xs mb-3">{new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}</p>
                            {/* Acciones */}
                            <div className="flex items-center gap-1 flex-wrap">
                              <button
                                onClick={() => { setViewingProposal(p); setResultTab("propuesta"); setView("result"); }}
                                className="px-2 py-1 text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition"
                              >Ver</button>
                              {/* Mover a estado */}
                              <select
                                value={p.status}
                                onChange={e => updateProposalStatus(p.id, e.target.value)}
                                className="px-1 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg border-0 outline-none cursor-pointer"
                              >
                                {CRM_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                              </select>
                            </div>
                          </div>
                        );
                      })}
                      {cards.length === 0 && (
                        <div className="py-6 text-center text-gray-700 text-xs border border-dashed border-gray-800 rounded-xl">vacío</div>
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
            <div className="flex items-center gap-2 text-gray-500 text-sm py-8">
              <Loader2 size={14} className="animate-spin" /> Cargando...
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <FileText size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay propuestas todavía.</p>
              <p className="text-xs mt-1">Crea tu primera propuesta con el botón de arriba.</p>
            </div>
          ) : (
            <div className="space-y-3 max-w-3xl">
              {proposals.map((p) => {
                const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.draft;
                const logo = p.form_data?.clientLogo;
                const value = p.form_data?.price ? `${p.form_data.currency ?? "USD"} ${p.form_data.price}` : null;
                return (
                  <div key={p.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {logo ? (
                        <img src={logo} alt="" className="w-9 h-9 rounded-xl object-cover flex-shrink-0 bg-gray-800" />
                      ) : (
                        <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                          <Building2 size={14} className="text-gray-600" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-white font-medium text-sm truncate">{p.client_name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${status.color}`}>{status.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <p className="text-gray-500 text-xs truncate">{p.industry}</p>
                          {value && <span className="text-emerald-400 text-xs font-medium flex-shrink-0">{value}</span>}
                          <span className="text-gray-700 text-xs flex-shrink-0">{new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={p.status}
                        onChange={e => updateProposalStatus(p.id, e.target.value)}
                        className="px-2 py-1.5 text-xs bg-gray-800 text-gray-400 rounded-lg border border-gray-700 outline-none cursor-pointer"
                      >
                        {CRM_COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                      <button
                        onClick={() => { setViewingProposal(p); setResultTab("propuesta"); setView("result"); }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-lg transition"
                      >
                        Ver <ChevronRight size={12} />
                      </button>
                      <button onClick={() => deleteProposal(p.id)} className="p-1.5 text-gray-600 hover:text-red-400 transition">
                        <Trash2 size={14} />
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
      <div className="p-6 max-w-2xl">
        {/* Step indicators */}
        <div className="flex items-center gap-1 mb-8 flex-wrap">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold transition flex-shrink-0 ${
                i < step ? "bg-emerald-600 text-white" :
                i === step ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-500"
              }`}>
                {i < step ? "✓" : i + 1}
              </div>
              <span className={`text-xs hidden sm:block ${i === step ? "text-white font-medium" : "text-gray-500"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className={`w-4 h-px ${i < step ? "bg-emerald-600" : "bg-gray-800"}`} />}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="space-y-5 mb-8">

          {/* PASO 0 — Tipo de propuesta (scope multi-select) */}
          {step === 0 && (
            <>
              <h2 className="text-base font-semibold text-white mb-1">¿Qué servicios incluye esta propuesta?</h2>
              <p className="text-xs text-gray-500 mb-5">Selecciona uno o varios. El prompt se adaptará automáticamente al alcance elegido.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SERVICE_SCOPE_OPTIONS.map(opt => {
                  const active = form.serviceScope.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => toggleScope(opt.id)}
                      className={`p-4 rounded-xl border text-left transition ${
                        active
                          ? "bg-indigo-600/20 border-indigo-500 text-white"
                          : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{opt.label}</span>
                        {active && <span className="text-xs text-indigo-400 font-bold">✓</span>}
                      </div>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* PASO 1 — Cliente */}
          {step === 1 && (
            <>
              <h2 className="text-base font-semibold text-white mb-4">Datos del cliente</h2>

              {/* Logo upload */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Logo / Imagen del cliente</label>
                <div className="flex items-center gap-4">
                  {form.clientLogo ? (
                    <div className="relative flex-shrink-0">
                      <img src={form.clientLogo} alt="Logo" className="w-16 h-16 rounded-xl object-cover bg-gray-800" />
                      <button
                        type="button"
                        onClick={() => setForm(p => ({ ...p, clientLogo: "" }))}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
                      >
                        <X size={10} className="text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gray-800 border-2 border-dashed border-gray-700 flex items-center justify-center flex-shrink-0">
                      <Building2 size={20} className="text-gray-600" />
                    </div>
                  )}
                  <div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]); }}
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-60 text-gray-300 text-xs rounded-xl transition"
                    >
                      {uploadingLogo ? <><Loader2 size={12} className="animate-spin" /> Subiendo...</> : <><Upload size={12} /> {form.clientLogo ? "Cambiar logo" : "Subir logo"}</>}
                    </button>
                    <p className="text-xs text-gray-600 mt-1">PNG, JPG o SVG. Se mostrará en el CRM y en la propuesta.</p>
                  </div>
                </div>
              </div>

              <Field label="Nombre del cliente" required>
                <input className={inputCls} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="Ej: Juan Martínez" />
              </Field>
              <Field label="Empresa">
                <input className={inputCls} value={form.clientCompany} onChange={e => set("clientCompany", e.target.value)} placeholder="Ej: Empresa S.A." />
              </Field>
              <Field label="Industria" required>
                <input className={inputCls} value={form.clientIndustry} onChange={e => set("clientIndustry", e.target.value)} placeholder="Ej: Salud, E-commerce, Educación..." />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Email del cliente">
                  <input className={inputCls} type="email" value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} placeholder="Ej: juan@empresa.com" />
                </Field>
                <Field label="WhatsApp del cliente">
                  <input className={inputCls} type="tel" value={form.clientWhatsapp} onChange={e => set("clientWhatsapp", e.target.value)} placeholder="Ej: +521234567890" />
                </Field>
              </div>
            </>
          )}

          {/* PASO 2 — Servicio */}
          {step === 2 && (
            <>
              <h2 className="text-base font-semibold text-white mb-1">Descripción del servicio</h2>
              <p className="text-xs text-gray-500 mb-5">
                Servicios seleccionados: <span className="text-indigo-400 font-medium">{form.serviceScope.map(id => SERVICE_SCOPE_OPTIONS.find(o => o.id === id)?.label).join(", ")}</span>
              </p>
              <Field label="Describe el servicio en detalle" required>
                <textarea className={textareaCls} rows={5} value={form.serviceDescription} onChange={e => set("serviceDescription", e.target.value)}
                  placeholder="Describe qué vas a ofrecer, cómo trabajarás, tu metodología, qué hace especial tu propuesta..." />
              </Field>
            </>
          )}

          {/* PASO 3 — Objetivos + KPIs */}
          {step === 3 && (
            <>
              <h2 className="text-base font-semibold text-white mb-4">Objetivos del cliente</h2>
              <Field label="¿Qué quiere lograr el cliente?" required>
                <textarea className={textareaCls} rows={3} value={form.clientGoals} onChange={e => set("clientGoals", e.target.value)}
                  placeholder="Ej: Aumentar ventas online, mejorar presencia en redes, generar leads..." />
              </Field>
              <Field label="Situación actual del cliente">
                <textarea className={textareaCls} rows={3} value={form.currentSituation} onChange={e => set("currentSituation", e.target.value)}
                  placeholder="Ej: No tiene presencia digital, tiene web pero sin tráfico, competencia muy activa..." />
              </Field>

              <div className="pt-2">
                <p className="text-sm font-medium text-gray-300 mb-1">KPIs con objetivos numéricos <span className="text-gray-500 font-normal text-xs">(opcional pero muy recomendado)</span></p>
                <p className="text-xs text-gray-500 mb-4">Define métricas concretas que harán la propuesta más persuasiva.</p>
                {[1, 2, 3].map(n => (
                  <div key={n} className="grid grid-cols-3 gap-3 mb-3">
                    <Field label={`KPI ${n} — Métrica`}>
                      <input className={inputCls} value={(form as any)[`kpi${n}Name`]} onChange={e => set(`kpi${n}Name` as keyof ProposalForm, e.target.value)}
                        placeholder={n === 1 ? "Seguidores IG" : n === 2 ? "Leads/mes" : "ROAS"} />
                    </Field>
                    <Field label="Valor actual">
                      <input className={inputCls} value={(form as any)[`kpi${n}Start`]} onChange={e => set(`kpi${n}Start` as keyof ProposalForm, e.target.value)}
                        placeholder={n === 1 ? "1,200" : n === 2 ? "5" : "—"} />
                    </Field>
                    <Field label="Objetivo">
                      <input className={inputCls} value={(form as any)[`kpi${n}Goal`]} onChange={e => set(`kpi${n}Goal` as keyof ProposalForm, e.target.value)}
                        placeholder={n === 1 ? "5,000" : n === 2 ? "40" : "3x"} />
                    </Field>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* PASO 4 — Alcance */}
          {step === 4 && (
            <>
              <h2 className="text-base font-semibold text-white mb-4">Alcance del proyecto</h2>
              <Field label="Entregables concretos" required>
                <textarea className={textareaCls} rows={4} value={form.deliverables} onChange={e => set("deliverables", e.target.value)}
                  placeholder="Ej: 12 posts/mes para Instagram y Facebook, 1 reels/semana, reportes mensuales..." />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Duración del contrato" required>
                  <input className={inputCls} value={form.duration} onChange={e => set("duration", e.target.value)} placeholder="Ej: 3 meses, 6 meses..." />
                </Field>
                <Field label="Frecuencia de trabajo">
                  <input className={inputCls} value={form.frequency} onChange={e => set("frequency", e.target.value)} placeholder="Ej: 3 posts/semana" />
                </Field>
              </div>
              <Field label="¿Qué NO incluye?">
                <textarea className={textareaCls} rows={2} value={form.notIncluded} onChange={e => set("notIncluded", e.target.value)}
                  placeholder="Ej: No incluye diseño gráfico, fotografía, pauta publicitaria..." />
              </Field>
            </>
          )}

          {/* PASO 5 — Diagnóstico + Buyer Persona */}
          {step === 5 && (
            <>
              <h2 className="text-base font-semibold text-white mb-1">Diagnóstico del cliente</h2>
              <p className="text-xs text-gray-500 mb-5">Todos los campos son opcionales. Cuanto más detailles, más personalizada será la propuesta.</p>

              <Field label="Problemas generales detectados" hint="opcional">
                <textarea className={textareaCls} rows={3} value={form.problemasDetectados} onChange={e => set("problemasDetectados", e.target.value)}
                  placeholder="Ej: No tienen estrategia de contenido definida, sin identidad visual consistente..." />
              </Field>

              <Field label="Problemas en redes sociales" hint="opcional">
                <textarea className={textareaCls} rows={3} value={form.problemaRedesSociales} onChange={e => set("problemaRedesSociales", e.target.value)}
                  placeholder="Ej: Publicaciones irregulares, bajo engagement, sin uso de reels ni stories, sin bio optimizada..." />
              </Field>

              <Field label="Problemas en web / landing page" hint="opcional">
                <textarea className={textareaCls} rows={3} value={form.problemaWebLanding} onChange={e => set("problemaWebLanding", e.target.value)}
                  placeholder="Ej: Carga lenta, sin SEO, sin CTA claros, diseño desactualizado, sin versión móvil..." />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Debilidades detectadas" hint="opcional">
                  <textarea className={textareaCls} rows={3} value={form.debilidadesDetectadas} onChange={e => set("debilidadesDetectadas", e.target.value)}
                    placeholder="Ej: Sin presupuesto para ads, equipo pequeño, competencia muy activa..." />
                </Field>
                <Field label="Fortalezas detectadas" hint="opcional">
                  <textarea className={textareaCls} rows={3} value={form.fortalezasDetectadas} onChange={e => set("fortalezasDetectadas", e.target.value)}
                    placeholder="Ej: Producto de calidad, buenas reseñas, base de clientes fieles, ubicación estratégica..." />
                </Field>
              </div>

              <div className="border-t border-gray-800 pt-5 mt-2">
                <p className="text-sm font-medium text-gray-300 mb-1">Buyer persona y dolores del cliente final <span className="text-gray-500 font-normal text-xs">(opcional)</span></p>
                <p className="text-xs text-gray-500 mb-4">Información sobre el cliente final del negocio (no el cliente que te contrata). Esto hará la propuesta mucho más empática.</p>
                <Field label="¿Quién es el cliente final del negocio?" hint="opcional">
                  <textarea className={textareaCls} rows={2} value={form.buyerPersona} onChange={e => set("buyerPersona", e.target.value)}
                    placeholder="Ej: Mujeres 30-50 años con dolor crónico, profesionistas de oficina que buscan alivio sin medicación..." />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  <Field label="Dolores funcionales" hint="opcional">
                    <textarea className={textareaCls} rows={3} value={form.doloresFuncionales} onChange={e => set("doloresFuncionales", e.target.value)}
                      placeholder="Ej: No saben dónde encontrar un fisioterapeuta confiable, citas difíciles de conseguir..." />
                  </Field>
                  <Field label="Dolores emocionales" hint="opcional">
                    <textarea className={textareaCls} rows={3} value={form.doloresEmocionales} onChange={e => set("doloresEmocionales", e.target.value)}
                      placeholder="Ej: Frustración por no ver resultados, miedo a que el dolor sea crónico, vergüenza..." />
                  </Field>
                </div>
                <Field label="Objeciones frecuentes del cliente final" hint="opcional">
                  <textarea className={textareaCls} rows={2} value={form.objecionesCliente} onChange={e => set("objecionesCliente", e.target.value)}
                    placeholder="Ej: 'Es muy caro', 'No tengo tiempo', 'Ya lo intenté antes y no funcionó'..." />
                </Field>
              </div>
            </>
          )}

          {/* PASO 6 — Inversión */}
          {step === 6 && (
            <>
              <h2 className="text-base font-semibold text-white mb-4">Inversión</h2>
              <div className="flex gap-3">
                <Field label="Moneda">
                  <select className={inputCls} value={form.currency} onChange={e => set("currency", e.target.value)}>
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Precio" required>
                  <input className={inputCls} value={form.price} onChange={e => set("price", e.target.value)} placeholder="Ej: 800/mes, 2400 total..." />
                </Field>
              </div>
              <Field label="Términos de pago" required>
                <textarea className={textareaCls} rows={2} value={form.paymentTerms} onChange={e => set("paymentTerms", e.target.value)}
                  placeholder="Ej: 50% anticipo, 50% al finalizar el mes. Pago por transferencia bancaria." />
              </Field>
            </>
          )}

          {/* PASO 7 — Revisar y generar */}
          {step === 7 && (
            <>
              <h2 className="text-base font-semibold text-white mb-4">Revisar y generar</h2>
              <div className="space-y-3 text-sm">
                {[
                  ["Servicios", form.serviceScope.map(id => SERVICE_SCOPE_OPTIONS.find(o => o.id === id)?.label).join(", ")],
                  ["Cliente", `${form.clientName}${form.clientCompany ? ` · ${form.clientCompany}` : ""} · ${form.clientIndustry}`],
                  ["Duración", form.duration],
                  ["Inversión", `${form.currency} ${form.price}`],
                  ["Pago", form.paymentTerms],
                  ...(form.kpi1Name ? [["KPIs", `${form.kpi1Name}${form.kpi2Name ? `, ${form.kpi2Name}` : ""}${form.kpi3Name ? `, ${form.kpi3Name}` : ""}`]] : []),
                  ...(form.problemasDetectados || form.problemaRedesSociales || form.problemaWebLanding
                    ? [["Diagnóstico", "Incluido ✓"]] : []),
                  ...(form.buyerPersona ? [["Buyer persona", "Incluido ✓"]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-gray-500 w-28 flex-shrink-0">{k}</span>
                    <span className="text-gray-200">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-indigo-300 text-sm">Claude generará una propuesta completa y profesional lista para enviar al cliente. También podrás exportarla como HTML o Slides.</p>
              </div>
            </>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => step === 0 ? setView("list") : setStep(s => s - 1)}
            className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white text-sm transition"
          >
            <ArrowLeft size={14} /> {step === 0 ? "Cancelar" : "Anterior"}
          </button>

          {step < 7 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition"
            >
              Siguiente <ArrowRight size={14} />
            </button>
          ) : (
            <button
              onClick={generate}
              disabled={generating}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition"
            >
              {generating ? <><Loader2 size={14} className="animate-spin" /> Generando...</> : <><Sparkles size={14} /> Generar propuesta</>}
            </button>
          )}
        </div>

        {/* Streaming preview */}
        {generating && generatedContent && (
          <div className="mt-8 p-5 bg-gray-900 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 text-xs font-medium">
              <Sparkles size={12} /> Generando propuesta...
            </div>
            <div className="text-sm">
              <ReactMarkdown components={mdComponents}>{generatedContent}</ReactMarkdown>
            </div>
            <div ref={bottomRef} />
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
    const clientWhatsapp = viewingProposal?.form_data?.clientWhatsapp ?? form.clientWhatsapp;

    return (
      <div className="p-6 max-w-4xl">
        {/* Header — dos filas para evitar que los botones se expandan con títulos largos */}
        <div className="mb-5 space-y-3">
          {/* Fila 1: navegación + título + logo */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => { setView("list"); setViewingProposal(null); }}
              className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition flex-shrink-0"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <span className="text-gray-600 flex-shrink-0">·</span>
            {clientLogo && (
              <img src={clientLogo} alt="" className="w-7 h-7 rounded-lg object-cover bg-gray-800 flex-shrink-0" />
            )}
            <span className="text-white font-medium text-sm truncate">Propuesta — {title}</span>
          </div>

          {/* Toolbar — 3 secciones con título */}
          <div className="flex flex-wrap items-start gap-3">

            {/* ── Sección 1: Generar contenido ── */}
            <div>
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5 px-1">Generar contenido</p>
              <div className="flex items-center gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl">
                <button
                  onClick={() => generateSlides(markdownContent)}
                  disabled={generatingSlides}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap disabled:opacity-60 ${slidesContent ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "bg-violet-600 hover:bg-violet-500 text-white"}`}
                >
                  {generatingSlides ? <><Loader2 size={11} className="animate-spin" /> Generando...</> : <><Layers size={11} /> {slidesContent ? "Regen. Slides" : "Slides"}</>}
                </button>
                <button
                  onClick={() => generateHtml(markdownContent)}
                  disabled={generatingHtml}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap disabled:opacity-60 ${htmlContent ? "text-gray-300 hover:bg-gray-800 hover:text-white" : "bg-indigo-600 hover:bg-indigo-500 text-white"}`}
                >
                  {generatingHtml ? <><Loader2 size={11} className="animate-spin" /> Generando...</> : <><Code size={11} /> {htmlContent ? "Regen. HTML" : "HTML"}</>}
                </button>
                {(htmlContent || slidesContent) && (
                  <div className="w-px h-4 bg-gray-800 mx-0.5" />
                )}
                {htmlContent && (
                  <button onClick={downloadHtml} title="Descargar HTML" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition">
                    <Download size={11} />
                  </button>
                )}
                {htmlContent && (
                  <button onClick={downloadPdf} title="Descargar PDF" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition">
                    <FileDown size={11} />
                  </button>
                )}
                {slidesContent && (
                  <button onClick={downloadSlides} title="Descargar Slides" className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-gray-300 transition">
                    <Download size={11} />
                  </button>
                )}
              </div>
            </div>

            {/* ── Sección 2: Generar propuesta ── */}
            <div>
              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider mb-1.5 px-1">Generar propuesta</p>
              <div className="flex items-center gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl">
                <button
                  onClick={() => { setHtmlContent(""); setSlidesContent(""); generate(); }}
                  disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-white disabled:opacity-60 transition whitespace-nowrap"
                >
                  {generating ? <><Loader2 size={11} className="animate-spin" /> Repensando...</> : <><RefreshCw size={11} /> Repensar</>}
                </button>
                <button
                  onClick={() => { setStep(0); setView("form"); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:bg-gray-800 hover:text-white transition whitespace-nowrap"
                >
                  <Pencil size={11} /> Editar datos
                </button>
                {!savedProposalId && !viewingProposal && (
                  <button
                    onClick={saveProposal}
                    disabled={saving || saved}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white rounded-lg text-xs font-medium transition whitespace-nowrap"
                  >
                    {saved ? <><Check size={11} /> Guardada</> : saving ? <><Loader2 size={11} className="animate-spin" /> Guardando...</> : <><Save size={11} /> Guardar</>}
                  </button>
                )}
              </div>
            </div>

            {/* ── Sección 3: Compartir con cliente ── */}
            <div>
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wider">Compartir con cliente</p>
                {/* Badge de expiración */}
                {htmlContent && timeLeft && (
                  timeLeft === "expirado"
                    ? <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400">⏱ Expirado</span>
                    : <span className="flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-400">⏱ {timeLeft}</span>
                )}
              </div>
              <div className="flex items-center gap-1 p-1 bg-gray-900 border border-gray-800 rounded-xl">
                {/* Botón enlace — dinámico según estado */}
                {(savedProposalId || viewingProposal?.id) && (
                  timeLeft === "expirado" || (htmlContent && !htmlExpiresAt) ? (
                    // HTML sin expiración definida o expirado → "Generar enlace"
                    <button
                      onClick={() => generateHtml(markdownContent)}
                      disabled={generatingHtml}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white rounded-lg text-xs font-medium transition whitespace-nowrap"
                    >
                      {generatingHtml ? <><Loader2 size={11} className="animate-spin" /> Generando...</> : <><Link2 size={11} /> Generar enlace</>}
                    </button>
                  ) : htmlContent && timeLeft ? (
                    // HTML válido con tiempo restante → "Copiar enlace"
                    <button
                      onClick={() => copyShareLink(savedProposalId ?? viewingProposal!.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${copiedLink ? "bg-emerald-600/20 text-emerald-400" : "text-gray-400 hover:bg-gray-800 hover:text-white"}`}
                    >
                      {copiedLink ? <><Check size={11} className="text-emerald-400" /> ¡Copiado!</> : <><Link2 size={11} /> Copiar enlace</>}
                    </button>
                  ) : null
                )}
                {clientWhatsapp && (
                  <button
                    onClick={() => sendViaWhatsApp(viewingProposal)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs font-medium transition whitespace-nowrap"
                  >
                    <MessageCircle size={11} /> WhatsApp
                  </button>
                )}
                {clientEmail && (
                  <button
                    onClick={() => sendViaEmail(viewingProposal)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-xs font-medium transition whitespace-nowrap"
                  >
                    <Mail size={11} /> Email
                  </button>
                )}
                {!clientWhatsapp && !clientEmail && !(savedProposalId || viewingProposal?.id) && (
                  <span className="px-3 py-1.5 text-xs text-gray-600">Guarda la propuesta primero</span>
                )}
              </div>
            </div>

          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
          <button
            onClick={() => setResultTab("propuesta")}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition ${resultTab === "propuesta" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            Propuesta (Markdown)
          </button>
          <button
            onClick={() => { setResultTab("html"); if (!htmlContent) generateHtml(markdownContent); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${resultTab === "html" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            <Code size={11} /> HTML
            {htmlContent && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
          <button
            onClick={() => { setResultTab("slides"); if (!slidesContent) generateSlides(markdownContent); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${resultTab === "slides" ? "bg-gray-700 text-white" : "text-gray-500 hover:text-gray-300"}`}
          >
            <Layers size={11} /> Slides
            {slidesContent && <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />}
          </button>
        </div>

        {/* Propuesta tab */}
        {resultTab === "propuesta" && (
          <div className="p-6 bg-gray-900 border border-gray-800 rounded-xl text-sm">
            <ReactMarkdown components={mdComponents}>{markdownContent}</ReactMarkdown>
          </div>
        )}

        {/* HTML tab */}
        {resultTab === "html" && (
          <div className="rounded-xl overflow-hidden border border-gray-800">
            {generatingHtml && (
              <div className="flex items-center gap-2 p-6 text-gray-500 text-sm bg-gray-900">
                <Loader2 size={14} className="animate-spin" /> Generando versión HTML...
              </div>
            )}
            {!generatingHtml && htmlContent && (
              <iframe
                key={htmlIframeKey}
                ref={htmlIframeRef}
                className="w-full bg-white"
                style={{ height: "700px", border: "none" }}
                title="Propuesta HTML"
              />
            )}
            {!generatingHtml && !htmlContent && (
              <div className="p-8 text-gray-500 text-sm bg-gray-900 text-center">
                Haz click en "Generar HTML" para crear la versión visual.
              </div>
            )}
          </div>
        )}

        {/* Slides tab */}
        {resultTab === "slides" && (
          <div className="rounded-xl overflow-hidden border border-gray-800 bg-gray-950">
            {generatingSlides && (
              <div className="flex items-center gap-2 p-6 text-gray-500 text-sm">
                <Loader2 size={14} className="animate-spin" /> Generando presentación...
              </div>
            )}
            {!generatingSlides && slidesContent && (
              <>
                <iframe
                  key={slidesIframeKey}
                  ref={slidesIframeRef}
                  className="w-full"
                  style={{ height: "520px", border: "none" }}
                  title="Presentación Slides"
                />
                <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between">
                  <p className="text-xs text-gray-500">← → para navegar · F para pantalla completa · ESC para salir</p>
                  <button
                    onClick={downloadSlides}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium rounded-lg transition"
                  >
                    <Download size={12} /> Descargar y abrir en pantalla completa
                  </button>
                </div>
              </>
            )}
            {!generatingSlides && !slidesContent && (
              <div className="p-8 text-gray-500 text-sm text-center">
                Haz click en "Generar Slides" para crear la presentación.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ─── Page shell ──────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <FileSignature size={15} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-white">Propuestas</h1>
            <p className="text-xs text-gray-500">Propuestas comerciales generadas con IA</p>
          </div>
        </div>
        <AgentBrain agentId="propuestas" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === "list" && renderList()}
        {view === "form" && renderForm()}
        {view === "result" && renderResult()}
      </div>
    </div>
  );
}
