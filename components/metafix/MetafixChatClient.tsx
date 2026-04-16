"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Loader2, Bot, User, Copy, Check, CheckCircle2, Paperclip, X, Image as ImageIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { saveMessage, updateCaseStatus } from "@/lib/metafix/actions";
import { createClient } from "@/lib/supabase/client";
import type { MetafixMessage, MetafixStatus, TutorialImage } from "@/types";

interface Props {
  caseId: string;
  initialMessages: MetafixMessage[];
  currentStatus: MetafixStatus;
}

// ── Tutorial block ────────────────────────────────────────────────────────────

function TutorialBlock({ slug }: { slug: string }) {
  const [images, setImages]   = useState<TutorialImage[]>([]);
  const [title,  setTitle]    = useState("");
  const [loaded, setLoaded]   = useState(false);

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

  if (!loaded) return <div className="text-xs text-gray-500 animate-pulse py-2">Cargando tutorial...</div>;
  if (!images.length) return null;

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-blue-500/20" style={{ background: "#111827" }}>
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-blue-500/20" style={{ background: "rgba(37,99,235,0.1)" }}>
        <ImageIcon size={13} className="text-blue-400" />
        <span className="text-xs font-bold text-blue-300">{title}</span>
        <span className="text-[10px] text-blue-400/60 ml-auto">{images.length} pasos</span>
      </div>
      <div className="p-3 space-y-3">
        {images.map((img) => (
          <div key={img.id} className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {img.step_number}
              </span>
              {img.caption && <span className="text-xs text-gray-300">{img.caption}</span>}
            </div>
            <img
              src={img.public_url}
              alt={img.caption ?? `Paso ${img.step_number}`}
              className="w-full rounded-lg border border-gray-700 object-contain max-h-96"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Markdown components ───────────────────────────────────────────────────────

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-base font-bold text-white mb-2 mt-3 first:mt-0">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-sm font-bold text-white mb-1.5 mt-3 first:mt-0">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-semibold text-white mb-1 mt-2 first:mt-0">{children}</h3>,
  p:  ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
  ul: ({ children }: any) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
  ol: ({ children }: any) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
  li: ({ children }: any) => <li className="text-gray-100">{children}</li>,
  strong: ({ children }: any) => <strong className="font-semibold text-white">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-gray-200">{children}</em>,
  code: ({ children, className }: any) => {
    const isBlock = className?.includes("language-");
    return isBlock ? (
      <pre className="bg-gray-950 border border-gray-700 rounded-lg p-3 overflow-x-auto mb-2 mt-1">
        <code className="text-green-400 text-xs font-mono">{children}</code>
      </pre>
    ) : (
      <code className="bg-gray-950 text-green-400 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
    );
  },
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-blue-500 pl-3 italic text-gray-300 mb-2">{children}</blockquote>
  ),
  hr: () => <hr className="border-gray-700 my-3" />,
  // ── Tables ──
  table: ({ children }: any) => (
    <div className="overflow-x-auto my-3 rounded-xl border border-gray-700">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead style={{ background: "rgba(37,99,235,0.15)" }}>{children}</thead>
  ),
  tbody: ({ children }: any) => <tbody>{children}</tbody>,
  tr: ({ children }: any) => (
    <tr className="border-t border-gray-700 hover:bg-white/[0.02] transition-colors">{children}</tr>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2 text-left text-[11px] font-bold text-blue-300 uppercase tracking-wide">{children}</th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 text-gray-200">{children}</td>
  ),
};

// ── Parse assistant content with tutorial tags ────────────────────────────────

function AssistantContent({ content }: { content: string }) {
  const TUTORIAL_RE = /\[\[TUTORIAL:([^\]]+)\]\]/g;
  const parts: Array<{ type: "text"; text: string } | { type: "tutorial"; slug: string }> = [];
  let last = 0;
  let match;
  while ((match = TUTORIAL_RE.exec(content)) !== null) {
    if (match.index > last) parts.push({ type: "text", text: content.slice(last, match.index) });
    parts.push({ type: "tutorial", slug: match[1].trim() });
    last = match.index + match[0].length;
  }
  if (last < content.length) parts.push({ type: "text", text: content.slice(last) });

  return (
    <>
      {parts.map((p, i) =>
        p.type === "tutorial" ? (
          <TutorialBlock key={i} slug={p.slug} />
        ) : (
          <ReactMarkdown key={i} components={mdComponents} remarkPlugins={[remarkGfm]}>
            {p.text}
          </ReactMarkdown>
        )
      )}
    </>
  );
}

// ── Copy button ───────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); })}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-gray-700 text-gray-500 hover:text-gray-300"
      title="Copiar"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

const SUGGESTIONS = [
  "Mi cuenta publicitaria está bloqueada",
  "Error 131031 en WhatsApp Business API",
  "Error 131026 — mensaje fuera de ventana de 24h",
  "Mis anuncios están siendo rechazados",
  "Problema con verificación de negocio en BM",
  "El Píxel de Meta no registra eventos",
];

// ── Main component ────────────────────────────────────────────────────────────

export default function MetafixChatClient({ caseId, initialMessages, currentStatus }: Props) {
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string; imageUrl?: string }>>(
    initialMessages.map((m) => ({ role: m.role, content: m.content }))
  );
  const [input,          setInput]          = useState("");
  const [loading,        setLoading]        = useState(false);
  const [status,         setStatus]         = useState<MetafixStatus>(currentStatus);
  const [markingDone,    setMarkingDone]    = useState(false);
  const [pendingImage,   setPendingImage]   = useState<{ file: File; previewUrl: string } | null>(null);
  const [uploadingImg,   setUploadingImg]   = useState(false);

  const bottomRef    = useRef<HTMLDivElement>(null);
  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    setPendingImage({ file, previewUrl });
    e.target.value = "";
  }

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    setUploadingImg(true);
    try {
      const supabase = createClient();
      const ext  = file.name.split(".").pop();
      const path = `${caseId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("metafix-chat").upload(path, file, { upsert: true });
      if (error) return null;
      const { data } = supabase.storage.from("metafix-chat").getPublicUrl(path);
      return data.publicUrl;
    } finally {
      setUploadingImg(false);
    }
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

    // Persist user message
    const persistContent = imageUrl ? `${text.trim()}\n[imagen: ${imageUrl}]` : text.trim();
    await saveMessage(caseId, "user", persistContent);
    if (status === "open") setStatus("in_progress");

    setMessages([...newMessages, { role: "assistant", content: "" }]);

    // Build API messages with optional vision
    const apiMessages = newMessages.map((m) => {
      if (m.imageUrl) {
        return {
          role: m.role,
          content: [
            { type: "image_url", url: m.imageUrl },
            { type: "text",      text: m.content || "Analizá esta imagen y ayudame a diagnosticar el problema." },
          ],
        };
      }
      return { role: m.role, content: m.content };
    });

    try {
      const res = await fetch("/api/metafix/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages, caseId }),
      });

      if (!res.ok || !res.body) throw new Error("Error en la respuesta");

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: accumulated };
          return updated;
        });
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "Error al conectar con MetaFix. Verificá tu conexión e intentá de nuevo." };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  async function markResolved() {
    setMarkingDone(true);
    await updateCaseStatus(caseId, "resolved");
    setStatus("resolved");
    setMarkingDone(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 pb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
              <Bot size={24} className="text-blue-400" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-semibold text-sm">MetaFix está listo</p>
              <p className="text-gray-500 text-sm max-w-xs">Describí tu problema con Meta y te guío paso a paso para resolverlo.</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:border-blue-500 hover:text-white transition text-left border"
                  style={{ background: "#1c1b1b", borderColor: "rgba(255,255,255,0.07)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(59,130,246,0.2)" }}>
                <Bot size={14} className="text-blue-400" />
              </div>
            )}

            <div className="group relative max-w-[80%]">
              <div className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-tr-sm"
                  : "bg-gray-800 text-gray-100 rounded-tl-sm"
              }`}>
                {msg.role === "user" ? (
                  <div className="space-y-2">
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="adjunto" className="max-h-48 rounded-lg object-contain border border-white/20" />
                    )}
                    {msg.content && <span className="whitespace-pre-wrap">{msg.content}</span>}
                  </div>
                ) : msg.content === "" && loading ? (
                  <span className="inline-flex gap-1 items-center py-0.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                ) : (
                  <AssistantContent content={msg.content} />
                )}
              </div>
              {msg.role === "assistant" && msg.content && (
                <div className="flex justify-end mt-1">
                  <CopyButton text={msg.content} />
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <User size={14} className="text-gray-300" />
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Footer */}
      <div className="px-6 pb-6 pt-2 border-t border-gray-800 space-y-3">

        {/* Mark resolved */}
        {messages.length > 0 && status !== "resolved" && (
          <div className="flex justify-end">
            <button onClick={markResolved} disabled={markingDone || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:text-green-300 border border-green-500/20 hover:border-green-500/40 transition disabled:opacity-50"
              style={{ background: "rgba(34,197,94,0.05)" }}>
              <CheckCircle2 size={13} />
              {markingDone ? "Marcando..." : "Marcar como resuelto"}
            </button>
          </div>
        )}

        {status === "resolved" && (
          <div className="flex items-center justify-center gap-2 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.08)" }}>
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-xs text-green-400 font-medium">Caso resuelto</span>
          </div>
        )}

        {/* Image preview */}
        {pendingImage && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl border border-blue-500/30" style={{ background: "rgba(37,99,235,0.08)" }}>
            <img src={pendingImage.previewUrl} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-gray-600" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-300 truncate">{pendingImage.file.name}</p>
              <p className="text-[11px] text-gray-500">{(pendingImage.file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={() => { URL.revokeObjectURL(pendingImage.previewUrl); setPendingImage(null); }}
              className="text-gray-500 hover:text-gray-300 transition">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-end rounded-xl px-4 py-3 focus-within:border-blue-500 transition border"
          style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.1)" }}>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <button onClick={() => fileInputRef.current?.click()} disabled={loading}
            className="text-gray-500 hover:text-blue-400 transition disabled:opacity-40 flex-shrink-0 mb-0.5"
            title="Adjuntar imagen">
            {uploadingImg ? <Loader2 size={16} className="animate-spin" /> : <Paperclip size={16} />}
          </button>
          <textarea ref={textareaRef} value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder={status === "resolved" ? "Caso resuelto — podés seguir agregando mensajes" : "Describí tu problema con Meta... (Enter para enviar)"}
            rows={1}
            className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-gray-500 leading-relaxed"
          />
          <button onClick={() => sendMessage(input)}
            disabled={(!input.trim() && !pendingImage) || loading || uploadingImg}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#2563eb" }}>
            {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
        <p className="text-[11px] text-gray-600 text-center">Shift+Enter para nueva línea · Enter para enviar · Clip para adjuntar imagen</p>
      </div>
    </div>
  );
}
