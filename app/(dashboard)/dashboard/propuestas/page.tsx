"use client";

import { useState, useEffect, useRef } from "react";
import {
  FileSignature, Plus, ArrowLeft, ArrowRight, Sparkles,
  Copy, Check, Save, Loader2, Trash2, ChevronRight, FileText,
  Code, Download, Layers,
} from "lucide-react";
import AgentBrain from "@/components/AgentBrain";
import ReactMarkdown from "react-markdown";

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormData {
  clientName: string; clientCompany: string; clientIndustry: string; clientEmail: string;
  serviceType: string; serviceDescription: string;
  clientGoals: string; currentSituation: string;
  deliverables: string; duration: string; frequency: string; notIncluded: string;
  problemasDetectados: string; problemaRedesSociales: string;
  problemaWebLanding: string; debilidadesDetectadas: string; fortalezasDetectadas: string;
  price: string; currency: string; paymentTerms: string;
}

interface Proposal {
  id: string; client_name: string; industry: string;
  status: string; created_at: string; generated_content: string;
  html_content?: string; slides_content?: string;
}

const defaultForm: FormData = {
  clientName: "", clientCompany: "", clientIndustry: "", clientEmail: "",
  serviceType: "", serviceDescription: "",
  clientGoals: "", currentSituation: "",
  deliverables: "", duration: "", frequency: "", notIncluded: "",
  problemasDetectados: "", problemaRedesSociales: "",
  problemaWebLanding: "", debilidadesDetectadas: "", fortalezasDetectadas: "",
  price: "", currency: "USD", paymentTerms: "",
};

const SERVICE_TYPES = [
  "Gestión de redes sociales", "Creación de contenido",
  "SEO y posicionamiento", "Publicidad pagada (Meta/Google Ads)",
  "Diseño web / Landing page", "Email marketing",
  "Consultoría de marketing", "Otro",
];

const CURRENCIES = ["USD", "EUR", "MXN", "COP", "ARS", "PEN", "CLP"];

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft:        { label: "Borrador",        color: "bg-gray-500/20 text-gray-400" },
  sent:         { label: "Enviada",         color: "bg-blue-500/20 text-blue-400" },
  negotiating:  { label: "En negociación",  color: "bg-yellow-500/20 text-yellow-400" },
  closed_won:   { label: "Cerrada ✓",       color: "bg-green-500/20 text-green-400" },
  closed_lost:  { label: "Cerrada ✗",       color: "bg-red-500/20 text-red-400" },
};

const STEPS = ["Cliente", "Servicio", "Objetivos", "Alcance", "Diagnóstico", "Inversión", "Generar"];

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

export default function PropuestasPage() {
  const [view, setView]           = useState<"list" | "form" | "result">("list");
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState<FormData>(defaultForm);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loadingList, setLoadingList]       = useState(true);
  const [generating, setGenerating]         = useState(false);
  const [generatingHtml, setGeneratingHtml] = useState(false);
  const [generatingSlides, setGeneratingSlides] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [htmlContent, setHtmlContent]     = useState("");
  const [slidesContent, setSlidesContent] = useState("");
  const [previewId, setPreviewId]         = useState<string | null>(null);
  const [previewTs, setPreviewTs]         = useState(0);
  const [htmlIframeKey, setHtmlIframeKey]     = useState(0);
  const [slidesIframeKey, setSlidesIframeKey] = useState(0);
  const [resultTab, setResultTab] = useState<"propuesta" | "html" | "slides">("propuesta");
  const [viewingProposal, setViewingProposal] = useState<Proposal | null>(null);
  const [savedProposalId, setSavedProposalId] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const htmlIframeRef    = useRef<HTMLIFrameElement>(null);
  const slidesIframeRef  = useRef<HTMLIFrameElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchProposals(); }, []);

  useEffect(() => {
    if (generating) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [generatedContent, generating]);

  // Al abrir propuesta guardada: inicializar IDs y contenido
  useEffect(() => {
    if (!viewingProposal) return;
    setSavedProposalId(viewingProposal.id);
    setPreviewId(viewingProposal.id);
    setHtmlContent(viewingProposal.html_content ?? "");
    setSlidesContent(viewingProposal.slides_content ?? "");
    setPreviewTs(Date.now());
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

  function set(field: keyof FormData, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  function canNext(): boolean {
    if (step === 0) return !!form.clientName && !!form.clientIndustry;
    if (step === 1) return !!form.serviceType && !!form.serviceDescription;
    if (step === 2) return !!form.clientGoals;
    if (step === 3) return !!form.deliverables && !!form.duration;
    if (step === 4) return true; // Diagnóstico: todos opcionales
    if (step === 5) return !!form.price && !!form.paymentTerms;
    return true;
  }

  // ─── Generate proposal (markdown) ───────────────────────────────────────────

  async function generate() {
    setGenerating(true);
    setGeneratedContent("");
    setHtmlContent("");

    const diagnostico = [
      form.problemasDetectados    && `**Problemas generales detectados:**\n${form.problemasDetectados}`,
      form.problemaRedesSociales  && `**Problemas en redes sociales:**\n${form.problemaRedesSociales}`,
      form.problemaWebLanding     && `**Problemas en web / landing page:**\n${form.problemaWebLanding}`,
      form.debilidadesDetectadas  && `**Debilidades detectadas:**\n${form.debilidadesDetectadas}`,
      form.fortalezasDetectadas   && `**Fortalezas detectadas:**\n${form.fortalezasDetectadas}`,
    ].filter(Boolean).join("\n\n");

    const prompt = `Genera una propuesta comercial completa, profesional y persuasiva con los siguientes datos:

**CLIENTE:** ${form.clientName}${form.clientCompany ? ` — ${form.clientCompany}` : ""}
**INDUSTRIA:** ${form.clientIndustry}${form.clientEmail ? ` | Contacto: ${form.clientEmail}` : ""}

**SERVICIO OFRECIDO:** ${form.serviceType}
${form.serviceDescription}

**OBJETIVOS DEL CLIENTE:**
${form.clientGoals}
${form.currentSituation ? `\n**SITUACIÓN ACTUAL:**\n${form.currentSituation}` : ""}

**ALCANCE Y ENTREGABLES:**
${form.deliverables}
- Duración: ${form.duration}
${form.frequency ? `- Frecuencia: ${form.frequency}` : ""}
${form.notIncluded ? `- NO incluye: ${form.notIncluded}` : ""}
${diagnostico ? `\n**DIAGNÓSTICO PREVIO:**\n${diagnostico}` : ""}

**INVERSIÓN:** ${form.currency} ${form.price}
**TÉRMINOS DE PAGO:** ${form.paymentTerms}

La propuesta debe incluir:
1. Carta de presentación personalizada al cliente
2. Diagnóstico: problemas detectados y por qué son urgentes de resolver
3. Nuestra propuesta y metodología de trabajo
4. Entregables y alcance detallado
5. Inversión y condiciones de pago
6. Por qué elegirnos (fortalezas y diferenciadores)
7. Próximos pasos y llamada a la acción

Tono profesional y cercano. Personaliza con el nombre del cliente. Si hay diagnóstico previo, úsalo para reforzar la urgencia y el valor de la propuesta.`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          agentId: "propuestas",
          agentContext: "",
        }),
      });

      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setGeneratedContent(accumulated);
      }

      setView("result");
      setResultTab("propuesta");
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
        await fetch("/api/proposals", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, html_content: stripFences(accumulated) }),
        });
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

  function resetForm() {
    setForm(defaultForm);
    setStep(0);
    setGeneratedContent("");
    setHtmlContent("");
    setSlidesContent("");
    setSavedProposalId(null);
    setPreviewId(null);
    setSaved(false);
    setViewingProposal(null);
    setResultTab("propuesta");
  }

  // ─── Views ──────────────────────────────────────────────────────────────────

  function renderList() {
    return (
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Propuestas guardadas</h2>
          <button
            onClick={() => { resetForm(); setView("form"); }}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl transition"
          >
            <Plus size={14} /> Nueva propuesta
          </button>
        </div>

        {loadingList ? (
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
          <div className="space-y-3">
            {proposals.map((p) => {
              const status = STATUS_LABELS[p.status] ?? STATUS_LABELS.draft;
              return (
                <div key={p.id} className="flex items-center justify-between p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 transition">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium text-sm truncate">{p.client_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    <p className="text-gray-500 text-xs">{p.industry} · {new Date(p.created_at).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
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

          {/* PASO 1 — Cliente */}
          {step === 0 && (
            <>
              <h2 className="text-base font-semibold text-white mb-4">Datos del cliente</h2>
              <Field label="Nombre del cliente" required>
                <input className={inputCls} value={form.clientName} onChange={e => set("clientName", e.target.value)} placeholder="Ej: Juan Martínez" />
              </Field>
              <Field label="Empresa">
                <input className={inputCls} value={form.clientCompany} onChange={e => set("clientCompany", e.target.value)} placeholder="Ej: Empresa S.A." />
              </Field>
              <Field label="Industria" required>
                <input className={inputCls} value={form.clientIndustry} onChange={e => set("clientIndustry", e.target.value)} placeholder="Ej: Salud, E-commerce, Educación..." />
              </Field>
              <Field label="Email / Contacto">
                <input className={inputCls} value={form.clientEmail} onChange={e => set("clientEmail", e.target.value)} placeholder="Ej: juan@empresa.com" />
              </Field>
            </>
          )}

          {/* PASO 2 — Servicio */}
          {step === 1 && (
            <>
              <h2 className="text-base font-semibold text-white mb-4">Servicio a cotizar</h2>
              <Field label="Tipo de servicio" required>
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_TYPES.map(s => (
                    <button key={s} type="button" onClick={() => set("serviceType", s)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium border text-left transition ${
                        form.serviceType === s
                          ? "bg-indigo-600 border-indigo-500 text-white"
                          : "bg-gray-900 border-gray-700 text-gray-400 hover:border-gray-600 hover:text-white"
                      }`}
                    >{s}</button>
                  ))}
                </div>
              </Field>
              <Field label="Descripción del servicio" required>
                <textarea className={textareaCls} rows={4} value={form.serviceDescription} onChange={e => set("serviceDescription", e.target.value)}
                  placeholder="Describe en detalle qué vas a ofrecer, cómo trabajarás, tu metodología..." />
              </Field>
            </>
          )}

          {/* PASO 3 — Objetivos */}
          {step === 2 && (
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
            </>
          )}

          {/* PASO 4 — Alcance */}
          {step === 3 && (
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

          {/* PASO 5 — Diagnóstico */}
          {step === 4 && (
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
            </>
          )}

          {/* PASO 6 — Inversión */}
          {step === 5 && (
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
          {step === 6 && (
            <>
              <h2 className="text-base font-semibold text-white mb-4">Revisar y generar</h2>
              <div className="space-y-3 text-sm">
                {[
                  ["Cliente", `${form.clientName}${form.clientCompany ? ` · ${form.clientCompany}` : ""} · ${form.clientIndustry}`],
                  ["Servicio", form.serviceType],
                  ["Duración", form.duration],
                  ["Inversión", `${form.currency} ${form.price}`],
                  ["Pago", form.paymentTerms],
                  ...(form.problemasDetectados || form.problemaRedesSociales || form.problemaWebLanding
                    ? [["Diagnóstico", "Incluido ✓"]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-3">
                    <span className="text-gray-500 w-24 flex-shrink-0">{k}</span>
                    <span className="text-gray-200">{v}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-indigo-300 text-sm">Claude generará una propuesta completa y profesional lista para enviar al cliente. También podrás exportarla como HTML.</p>
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

          {step < 6 ? (
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
    const markdownContent = viewingProposal ? viewingProposal.generated_content : generatedContent;
    const title = viewingProposal ? viewingProposal.client_name : form.clientName;

    return (
      <div className="p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => { setView("list"); setViewingProposal(null); }}
              className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition"
            >
              <ArrowLeft size={14} /> Volver
            </button>
            <span className="text-gray-600">·</span>
            <span className="text-white font-medium text-sm">Propuesta — {title}</span>
          </div>
          <div className="flex items-center gap-2">
            {resultTab === "propuesta" && (
              <button
                onClick={() => copyContent(markdownContent)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-lg transition"
              >
                {copied ? <><Check size={12} className="text-green-400" /> Copiado</> : <><Copy size={12} /> Copiar</>}
              </button>
            )}
            {resultTab === "html" && htmlContent && (
              <button
                onClick={downloadHtml}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-lg transition"
              >
                <Download size={12} /> Descargar HTML
              </button>
            )}
            {resultTab === "slides" && slidesContent && (
              <button
                onClick={downloadSlides}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs rounded-lg transition"
              >
                <Download size={12} /> Descargar Slides
              </button>
            )}
            <button
              onClick={() => generateHtml(markdownContent)}
              disabled={generatingHtml}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition"
            >
              {generatingHtml ? <><Loader2 size={12} className="animate-spin" /> Generando HTML...</> : <><Code size={12} /> {htmlContent ? "Regenerar HTML" : "Generar HTML"}</>}
            </button>
            <button
              onClick={() => generateSlides(markdownContent)}
              disabled={generatingSlides}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition"
            >
              {generatingSlides ? <><Loader2 size={12} className="animate-spin" /> Generando...</> : <><Layers size={12} /> {slidesContent ? "Regenerar Slides" : "Generar Slides"}</>}
            </button>
            {!viewingProposal && (
              <button
                onClick={saveProposal}
                disabled={saving || saved}
                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-medium rounded-lg transition"
              >
                {saved ? <><Check size={12} /> Guardada</> : saving ? <><Loader2 size={12} className="animate-spin" /> Guardando...</> : <><Save size={12} /> Guardar</>}
              </button>
            )}
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
