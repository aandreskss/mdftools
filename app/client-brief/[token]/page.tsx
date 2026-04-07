"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, ChevronRight, ChevronLeft, Paperclip, X, CheckCircle2, Send, AlertCircle } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BriefQuestion {
  id: string;
  category: string;
  question: string;
  placeholder?: string;
  type: "text" | "textarea" | "file" | "url" | "scale";
  required: boolean;
  hint?: string;
}

interface BriefData {
  id: string;
  client_name: string;
  project_name: string;
  questions: BriefQuestion[];
  status: "pending" | "submitted";
}

interface UploadedFile {
  questionId: string;
  url: string;
  name: string;
  size: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ClientBriefPage() {
  const params = useParams();
  const token = params.token as string;

  const [brief, setBrief] = useState<BriefData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  // Paso actual (índice de categoría)
  const [step, setStep] = useState(0);

  // Respuestas: { questionId: value }
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Archivos subidos
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeUploadQuestion = useRef<string | null>(null);

  // ── Fetch brief ────────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/client-briefs/public/${token}`);
        if (!res.ok) { setNotFound(true); return; }
        const data = await res.json();
        if (data.status === "submitted") { setAlreadySubmitted(true); return; }
        setBrief(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090909] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center gap-4 px-6">
        <AlertCircle className="w-12 h-12 text-red-400" />
        <h1 className="text-white text-xl font-semibold text-center">Enlace inválido o expirado</h1>
        <p className="text-slate-500 text-sm text-center max-w-sm">
          Este enlace no existe o ya no está disponible. Contacta a quien te lo envió.
        </p>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center gap-4 px-6">
        <CheckCircle2 className="w-14 h-14 text-emerald-400" />
        <h1 className="text-white text-2xl font-bold text-center">Brief ya enviado</h1>
        <p className="text-slate-400 text-sm text-center max-w-sm">
          Ya recibimos tu información. Nos pondremos en contacto contigo pronto.
        </p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#090909] flex flex-col items-center justify-center gap-6 px-6">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-400" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-white text-2xl font-bold">¡Brief enviado!</h1>
          <p className="text-slate-400 text-sm max-w-sm">
            Recibimos toda tu información. En breve recibirás nuestra propuesta. ¡Gracias!
          </p>
        </div>
      </div>
    );
  }

  if (!brief) return null;

  // ── Categorías ─────────────────────────────────────────────────────────────
  const categories = [...new Set(brief.questions.map((q) => q.category))];
  const currentCategory = categories[step];
  const currentQuestions = brief.questions.filter((q) => q.category === currentCategory);
  const isLast = step === categories.length - 1;
  const isFirst = step === 0;

  // Validar paso actual: todas las requeridas tienen valor
  function stepValid(): boolean {
    return currentQuestions
      .filter((q) => q.required)
      .every((q) => {
        if (q.type === "file") {
          // archivos no son estrictamente requeridos en el flow (se puede omitir)
          return true;
        }
        return responses[q.id]?.trim().length > 0;
      });
  }

  // ── Upload ─────────────────────────────────────────────────────────────────
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const qId = activeUploadQuestion.current;
    if (!qId) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFor(qId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("questionId", qId);
      const res = await fetch(`/api/client-briefs/public/${token}/upload`, { method: "POST", body: fd });
      if (!res.ok) { const d = await res.json(); alert(d.error ?? "Error al subir el archivo"); return; }
      const data = await res.json();
      setUploadedFiles((prev) => [...prev, { questionId: qId, url: data.url, name: data.name, size: data.size }]);
    } finally {
      setUploadingFor(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function removeFile(url: string) {
    setUploadedFiles((prev) => prev.filter((f) => f.url !== url));
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`/api/client-briefs/public/${token}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ responses, files: uploadedFiles }),
      });
      if (!res.ok) { const d = await res.json(); setSubmitError(d.error ?? "Error al enviar"); return; }
      setSubmitted(true);
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  const progressPct = ((step + 1) / categories.length) * 100;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#090909] text-white">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-[#0d0d0d]">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Brief de Exploración</p>
            <h1 className="text-white font-bold text-base leading-tight">
              {brief.project_name || `Proyecto de ${brief.client_name}`}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-slate-500">Sección {step + 1} de {categories.length}</p>
            <p className="text-xs text-violet-400 font-semibold">{currentCategory}</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="h-0.5 bg-white/[0.04]">
          <div
            className="h-full bg-violet-500 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </header>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Category header */}
        <div className="mb-8">
          <span className="text-[10px] font-bold uppercase tracking-widest text-violet-400">
            {currentCategory}
          </span>
          <p className="text-slate-500 text-sm mt-1">
            Responde con la mayor honestidad posible. Esta información es confidencial.
          </p>
        </div>

        {/* Questions */}
        <div className="space-y-8">
          {currentQuestions.map((q, i) => (
            <div key={q.id} className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                {i + 1}. {q.question}
                {q.required && <span className="text-violet-400 ml-1">*</span>}
              </label>
              {q.hint && (
                <p className="text-xs text-slate-500 leading-relaxed">{q.hint}</p>
              )}

              {/* Input types */}
              {q.type === "textarea" && (
                <textarea
                  rows={4}
                  placeholder={q.placeholder}
                  value={responses[q.id] ?? ""}
                  onChange={(e) => setResponses((p) => ({ ...p, [q.id]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#111] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all resize-none"
                />
              )}

              {(q.type === "text" || q.type === "url") && (
                <input
                  type={q.type === "url" ? "url" : "text"}
                  placeholder={q.placeholder}
                  value={responses[q.id] ?? ""}
                  onChange={(e) => setResponses((p) => ({ ...p, [q.id]: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-white/[0.08] bg-[#111] text-white text-sm placeholder-slate-600 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/10 transition-all"
                />
              )}

              {q.type === "file" && (
                <div className="space-y-2">
                  {/* Archivos ya subidos para esta pregunta */}
                  {uploadedFiles.filter((f) => f.questionId === q.id).map((f) => (
                    <div key={f.url} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
                      <Paperclip className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <a href={f.url} target="_blank" rel="noreferrer" className="text-xs text-slate-300 hover:text-white truncate flex-1">
                        {f.name}
                      </a>
                      <span className="text-[10px] text-slate-600">{formatSize(f.size)}</span>
                      <button onClick={() => removeFile(f.url)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}

                  <button
                    onClick={() => {
                      activeUploadQuestion.current = q.id;
                      fileInputRef.current?.click();
                    }}
                    disabled={uploadingFor === q.id}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/[0.12] text-slate-400 text-xs hover:border-violet-500/40 hover:text-violet-400 transition-all disabled:opacity-50"
                  >
                    {uploadingFor === q.id ? (
                      <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Subiendo…</>
                    ) : (
                      <><Paperclip className="w-3.5 h-3.5" /> Adjuntar archivo</>
                    )}
                  </button>
                  <p className="text-[10px] text-slate-600">Imágenes, PDFs, documentos. Máx 10 MB por archivo.</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Nav buttons */}
        <div className="mt-12 flex items-center justify-between">
          <button
            onClick={() => setStep((s) => s - 1)}
            disabled={isFirst}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/[0.08] text-slate-400 text-sm hover:text-white hover:border-white/20 transition-all disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft className="w-4 h-4" /> Anterior
          </button>

          {!isLast ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!stepValid()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!stepValid() || submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Enviando…</>
              ) : (
                <><Send className="w-4 h-4" /> Enviar Brief</>
              )}
            </button>
          )}
        </div>

        {submitError && (
          <p className="mt-4 text-center text-sm text-red-400">{submitError}</p>
        )}

        {/* Dots navigation */}
        <div className="mt-8 flex items-center justify-center gap-1.5">
          {categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => { if (i <= step) setStep(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-all ${
                i === step ? "bg-violet-400 w-4" : i < step ? "bg-violet-600/60" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </main>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.ai,.psd,.sketch,.fig,.png,.jpg,.jpeg,.gif,.webp,.svg,.zip"
        onChange={handleFileChange}
      />
    </div>
  );
}
