"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Copy, Check, CheckCircle2, Paperclip, X, Image as ImageIcon, Wrench, Zap, BookmarkPlus } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveMessage, updateCaseStatus, sendCaseToKB } from "@/lib/metafix/actions";
import { createClient } from "@/lib/supabase/client";
import type { MetafixMessage, MetafixStatus, TutorialImage } from "@/types";

interface Props {
  caseId: string;
  initialMessages: MetafixMessage[];
  currentStatus: MetafixStatus;
}

// ── Tutorial block ─────────────────────────────────────────────────────────────

function TutorialBlock({ slug }: { slug: string }) {
  const [images, setImages] = useState<TutorialImage[]>([]);
  const [title,  setTitle]  = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("tutorial_folders")
      .select("title, tutorial_images(id, public_url, caption, step_number)")
      .eq("slug", slug)
      .eq("is_published", true)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title);
          const imgs = ((data as any).tutorial_images ?? []) as TutorialImage[];
          setImages(imgs.sort((a, b) => a.step_number - b.step_number));
        }
        setLoaded(true);
      });
  }, [slug]);

  if (!loaded) return (
    <div className="flex items-center gap-2 py-3 text-xs text-blue-400/60">
      <Loader2 size={12} className="animate-spin" /> Cargando tutorial...
    </div>
  );
  if (!images.length) return null;

  return (
    <div className="my-4 rounded-2xl overflow-hidden" style={{ background: "rgba(15,23,42,0.8)", border: "1px solid rgba(59,130,246,0.2)" }}>
      <div className="flex items-center gap-2.5 px-5 py-3" style={{ borderBottom: "1px solid rgba(59,130,246,0.15)", background: "rgba(37,99,235,0.08)" }}>
        <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "rgba(59,130,246,0.2)" }}>
          <ImageIcon size={12} className="text-blue-400" />
        </div>
        <span className="text-sm font-semibold text-blue-300">{title}</span>
        <span className="ml-auto text-[11px] text-blue-400/50 font-medium">{images.length} pasos</span>
      </div>
      <div className="p-4 space-y-4">
        {images.map((img) => (
          <div key={img.id}>
            <div className="flex items-center gap-2.5 mb-2">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #3b82f6, #1d4ed8)" }}>
                {img.step_number}
              </span>
              {img.caption && <span className="text-sm text-gray-300 font-medium">{img.caption}</span>}
            </div>
            <img src={img.public_url} alt={img.caption ?? `Paso ${img.step_number}`}
              className="w-full rounded-xl object-contain max-h-[400px]"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Markdown ───────────────────────────────────────────────────────────────────

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-lg font-bold text-white mb-3 mt-4 first:mt-0 pb-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-base font-bold text-white mb-2 mt-4 first:mt-0">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-semibold text-white/90 mb-1.5 mt-3 first:mt-0">{children}</h3>,
  p:  ({ children }: any) => <p className="mb-3 last:mb-0 leading-7 text-gray-200">{children}</p>,
  ul: ({ children }: any) => <ul className="mb-3 space-y-1.5 pl-1">{children}</ul>,
  ol: ({ children }: any) => <ol className="mb-3 space-y-1.5 pl-1 list-none counter-reset-[item]">{children}</ol>,
  li: ({ children }: any) => (
    <li className="flex gap-2.5 text-gray-200 leading-relaxed">
      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-2.5" />
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-gray-300">{children}</em>,
  code: ({ children, className }: any) => {
    const isBlock = className?.includes("language-");
    return isBlock ? (
      <div className="my-3 rounded-xl overflow-hidden" style={{ background: "#0d1117", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center px-4 py-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)" }}>
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">código</span>
        </div>
        <pre className="p-4 overflow-x-auto">
          <code className="text-green-400 text-xs font-mono leading-relaxed">{children}</code>
        </pre>
      </div>
    ) : (
      <code className="text-blue-300 text-[13px] font-mono px-1.5 py-0.5 rounded-md" style={{ background: "rgba(59,130,246,0.12)" }}>{children}</code>
    );
  },
  blockquote: ({ children }: any) => (
    <div className="my-3 pl-4 py-0.5 rounded-r-xl" style={{ borderLeft: "3px solid #3b82f6", background: "rgba(59,130,246,0.06)" }}>
      <div className="text-gray-300 italic">{children}</div>
    </div>
  ),
  hr: () => <div className="my-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }} />,
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-4 rounded-xl" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
      <table className="w-full text-sm border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => <thead style={{ background: "rgba(37,99,235,0.12)" }}>{children}</thead>,
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr:   ({ children }: any) => <tr style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }} className="hover:bg-white/[0.02] transition-colors">{children}</tr>,
  th:   ({ children }: any) => <th className="px-4 py-2.5 text-left text-xs font-bold text-blue-300 uppercase tracking-wider">{children}</th>,
  td:   ({ children }: any) => <td className="px-4 py-2.5 text-gray-300">{children}</td>,
};

// ── Assistant content parser ───────────────────────────────────────────────────

function AssistantContent({ content }: { content: string }) {
  const parts: Array<{ type: "text"; text: string } | { type: "tutorial"; slug: string }> = [];
  const re = /\[\[TUTORIAL:([^\]]+)\]\]/g;
  let last = 0, match;
  while ((match = re.exec(content)) !== null) {
    if (match.index > last) parts.push({ type: "text", text: content.slice(last, match.index) });
    parts.push({ type: "tutorial", slug: match[1].trim() });
    last = match.index + match[0].length;
  }
  if (last < content.length) parts.push({ type: "text", text: content.slice(last) });
  return (
    <>
      {parts.map((p, i) =>
        p.type === "tutorial"
          ? <TutorialBlock key={i} slug={p.slug} />
          : <ReactMarkdown key={i} components={mdComponents} remarkPlugins={[remarkGfm]}>{p.text}</ReactMarkdown>
      )}
    </>
  );
}

// ── Copy button ────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all opacity-0 group-hover:opacity-100"
      style={{ color: copied ? "#4ade80" : "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
      {copied ? <><Check size={11} />Copiado</> : <><Copy size={11} />Copiar</>}
    </button>
  );
}

// ── Typing indicator ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 px-1">
      {[0, 150, 300].map((delay) => (
        <span key={delay} className="w-2 h-2 rounded-full bg-blue-400/60"
          style={{ animation: `bounce 1.2s ${delay}ms infinite`, display: "inline-block" }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-6px)} }`}</style>
    </div>
  );
}

// ── Suggestions ────────────────────────────────────────────────────────────────

const SUGGESTIONS = [
  { icon: "🔒", text: "Cuenta publicitaria bloqueada" },
  { icon: "📱", text: "Error 131031 — número no válido" },
  { icon: "⏰", text: "Error 131026 — ventana de 24h expirada" },
  { icon: "🚫", text: "Anuncio rechazado por políticas" },
  { icon: "✅", text: "Verificación de negocio en BM" },
  { icon: "📊", text: "Píxel de Meta no registra eventos" },
];

// ── Main ───────────────────────────────────────────────────────────────────────

export default function MetafixChatClient({ caseId, initialMessages, currentStatus }: Props) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; imageUrl?: string }>>(
    initialMessages.map((m) => ({ role: m.role, content: m.content }))
  );
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [status,       setStatus]       = useState<MetafixStatus>(currentStatus);
  const [markingDone,  setMarkingDone]  = useState(false);
  const [savedToKB,    setSavedToKB]    = useState(false);
  const [savingToKB,   setSavingToKB]   = useState(false);
  const [pendingImage, setPendingImage] = useState<{ file: File; previewUrl: string } | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  }

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setUploadingImg(true);
    try {
      const supabase = createClient();
      const ext  = file.name.split(".").pop();
      const path = `${caseId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("metafix-chat").upload(path, file, { upsert: true });
      if (error) return null;
      return supabase.storage.from("metafix-chat").getPublicUrl(path).data.publicUrl;
    } finally { setUploadingImg(false); }
  }, [caseId]);

  async function sendMessage(text: string) {
    if ((!text.trim() && !pendingImage) || loading) return;

    let imageUrl: string | null = null;
    if (pendingImage) {
      imageUrl = await uploadImage(pendingImage.file);
      URL.revokeObjectURL(pendingImage.previewUrl);
      setPendingImage(null);
    }

    const userMsg = { role: "user" as const, content: text.trim(), imageUrl: imageUrl ?? undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    await saveMessage(caseId, "user", imageUrl ? `${text.trim()}\n[imagen: ${imageUrl}]` : text.trim());
    if (status === "open") setStatus("in_progress");
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    const apiMessages = newMessages.map((m) =>
      m.imageUrl
        ? { role: m.role, content: [{ type: "image_url", url: m.imageUrl }, { type: "text", text: m.content || "Analizá esta imagen." }] }
        : { role: m.role, content: m.content }
    );

    try {
      const res = await fetch("/api/metafix/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, caseId }),
      });
      if (!res.ok || !res.body) throw new Error();

      const reader = res.body.getReader();
      const dec    = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += dec.decode(value, { stream: true });
        setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: acc }; return u; });
      }
    } catch {
      setMessages((prev) => { const u = [...prev]; u[u.length - 1] = { role: "assistant", content: "Error al conectar. Verificá tu conexión e intentá de nuevo." }; return u; });
    } finally { setLoading(false); }
  }

  async function markResolved() {
    setMarkingDone(true);
    await updateCaseStatus(caseId, "resolved");
    setStatus("resolved");
    setMarkingDone(false);
  }

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f0f0f" }}>

      {/* ── Messages ── */}
      <div className="flex-1 overflow-y-auto">

        {/* Empty state */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 gap-8">
            <div className="text-center space-y-4">
              <div className="relative mx-auto w-16 h-16">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.3), rgba(29,78,216,0.1))", border: "1px solid rgba(59,130,246,0.3)" }}>
                  <Wrench size={28} className="text-blue-400" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Zap size={10} className="text-white" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">MetaFix listo para ayudarte</h2>
                <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
                  Soy tu experto en problemas del ecosistema Meta. Describí tu problema y te guío paso a paso.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button key={s.text} onClick={() => sendMessage(s.text)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm transition-all hover:scale-[1.02] group"
                  style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.07)", color: "#d1d5db" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(59,130,246,0.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)"; (e.currentTarget as HTMLElement).style.background = "#1a1a1a"; }}
                >
                  <span className="text-lg flex-shrink-0">{s.icon}</span>
                  <span className="text-[13px] font-medium leading-snug">{s.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages list */}
        {messages.length > 0 && (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

                {/* AI avatar */}
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.4), rgba(29,78,216,0.2))", border: "1px solid rgba(59,130,246,0.3)" }}>
                      <Wrench size={14} className="text-blue-400" />
                    </div>
                  </div>
                )}

                {/* Bubble / content */}
                <div className={`group ${msg.role === "user" ? "max-w-[75%]" : "flex-1 min-w-0"}`}>

                  {msg.role === "user" ? (
                    /* User bubble */
                    <div className="rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed text-white"
                      style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", boxShadow: "0 2px 12px rgba(37,99,235,0.25)" }}>
                      {msg.imageUrl && (
                        <img src={msg.imageUrl} alt="adjunto"
                          className="max-h-52 rounded-xl object-contain mb-2 w-full"
                          style={{ border: "1px solid rgba(255,255,255,0.15)" }} />
                      )}
                      {msg.content && <span className="whitespace-pre-wrap" style={{ overflowWrap: "anywhere" }}>{msg.content}</span>}
                    </div>

                  ) : msg.content === "" && loading ? (
                    /* Typing */
                    <div className="rounded-2xl rounded-tl-sm px-4 py-3" style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}>
                      <TypingDots />
                    </div>

                  ) : (
                    /* AI content — open layout like Claude.ai */
                    <div>
                      <div className="text-sm leading-relaxed text-gray-200">
                        <AssistantContent content={msg.content} />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <CopyBtn text={msg.content} />
                      </div>
                    </div>
                  )}
                </div>

                {/* User avatar */}
                {msg.role === "user" && (
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                      style={{ background: "linear-gradient(135deg, #374151, #1f2937)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      Tú
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <div className="px-6 pb-6 pt-3 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>

        {/* Mark resolved */}
        {messages.length > 0 && status !== "resolved" && (
          <div className="flex justify-end">
            <button onClick={markResolved} disabled={markingDone || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
              style={{ color: "#4ade80", background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
              <CheckCircle2 size={12} />
              {markingDone ? "Guardando..." : "Marcar como resuelto"}
            </button>
          </div>
        )}

        {status === "resolved" && (
          <div className="flex items-center justify-between gap-3 py-2.5 px-4 rounded-xl"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-400" />
              <span className="text-sm text-green-400 font-medium">Caso resuelto</span>
            </div>
            <button
              onClick={async () => {
                setSavingToKB(true);
                try {
                  const res = await sendCaseToKB(caseId);
                  setSavedToKB(true);
                  if (res.alreadySaved) setSavedToKB(true);
                } finally { setSavingToKB(false); }
              }}
              disabled={savingToKB || savedToKB}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-60"
              style={{
                background: savedToKB ? "rgba(34,197,94,0.15)" : "rgba(59,130,246,0.15)",
                border: savedToKB ? "1px solid rgba(34,197,94,0.3)" : "1px solid rgba(59,130,246,0.3)",
                color: savedToKB ? "#4ade80" : "#93c5fd",
              }}
            >
              {savingToKB
                ? <><Loader2 size={11} className="animate-spin" />Guardando...</>
                : savedToKB
                ? <><Check size={11} />Guardado en mi KB</>
                : <><BookmarkPlus size={11} />Guardar en mi KB</>
              }
            </button>
          </div>
        )}

        {/* Image preview */}
        {pendingImage && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
            style={{ background: "rgba(37,99,235,0.06)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <img src={pendingImage.previewUrl} alt="preview" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-300 truncate">{pendingImage.file.name}</p>
              <p className="text-[11px] text-gray-500">{(pendingImage.file.size / 1024).toFixed(0)} KB · Lista para enviar</p>
            </div>
            <button onClick={() => { URL.revokeObjectURL(pendingImage.previewUrl); setPendingImage(null); }}
              className="p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition flex-shrink-0">
              <X size={13} />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="relative rounded-2xl transition-all"
          style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) setPendingImage({ file: f, previewUrl: URL.createObjectURL(f) }); e.target.value = ""; }} />

          <textarea ref={textareaRef} value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
            placeholder={status === "resolved" ? "Podés seguir haciendo preguntas..." : "Describí tu problema con Meta..."}
            rows={1}
            className="w-full bg-transparent text-white text-sm resize-none outline-none placeholder-gray-600 leading-relaxed px-4 pt-4 pb-14"
          />

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button onClick={() => fileInputRef.current?.click()} disabled={loading}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-40"
                style={{ color: "#6b7280", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
                title="Adjuntar imagen">
                {uploadingImg ? <Loader2 size={12} className="animate-spin" /> : <Paperclip size={12} />}
                <span>Imagen</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-600 hidden sm:block">Enter para enviar · Shift+Enter para nueva línea</span>
              <button onClick={() => sendMessage(input)}
                disabled={(!input.trim() && !pendingImage) || loading || uploadingImg}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: loading ? "#1e3a8a" : "linear-gradient(135deg, #2563eb, #1d4ed8)", color: "white", boxShadow: loading ? "none" : "0 2px 8px rgba(37,99,235,0.4)" }}>
                {loading
                  ? <><Loader2 size={13} className="animate-spin" />Pensando</>
                  : <><Send size={13} />Enviar</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
