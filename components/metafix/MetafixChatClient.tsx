"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, Bot, User, Copy, Check, CheckCircle2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { saveMessage, updateCaseStatus } from "@/lib/metafix/actions";
import type { MetafixMessage, MetafixStatus } from "@/types";

interface Props {
  caseId: string;
  initialMessages: MetafixMessage[];
  currentStatus: MetafixStatus;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      }}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-gray-700 text-gray-500 hover:text-gray-300"
      title="Copiar"
    >
      {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
    </button>
  );
}

const mdComponents = {
  h1: ({ children }: any) => <h1 className="text-base font-bold text-white mb-2 mt-3 first:mt-0">{children}</h1>,
  h2: ({ children }: any) => <h2 className="text-sm font-bold text-white mb-1.5 mt-3 first:mt-0">{children}</h2>,
  h3: ({ children }: any) => <h3 className="text-sm font-semibold text-white mb-1 mt-2 first:mt-0">{children}</h3>,
  p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
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
};

const SUGGESTIONS = [
  "Mi cuenta publicitaria está bloqueada",
  "Error 131031 en WhatsApp Business API",
  "Error 131026 — mensaje fuera de ventana de 24h",
  "Mis anuncios están siendo rechazados",
  "Problema con verificación de negocio en BM",
  "El Píxel de Meta no registra eventos",
];

export default function MetafixChatClient({ caseId, initialMessages, currentStatus }: Props) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>(
    initialMessages.map((m) => ({ role: m.role, content: m.content }))
  );
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus]   = useState<MetafixStatus>(currentStatus);
  const [markingResolved, setMarkingResolved] = useState(false);

  const bottomRef   = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;

    const userMsg = { role: "user" as const, content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    // Persist user message
    await saveMessage(caseId, "user", userMsg.content);
    if (status === "open") setStatus("in_progress");

    // Optimistic assistant placeholder
    setMessages([...newMessages, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/metafix/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, caseId }),
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
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Error al conectar con MetaFix. Verifica tu conexión e intenta de nuevo.",
        };
        return updated;
      });
    } finally {
      setLoading(false);
    }
  }

  async function markResolved() {
    setMarkingResolved(true);
    await updateCaseStatus(caseId, "resolved");
    setStatus("resolved");
    setMarkingResolved(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
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
              <p className="text-gray-500 text-sm max-w-xs">
                Describí tu problema con Meta y te guío paso a paso para resolverlo.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-lg">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:border-blue-500 hover:text-white transition text-left border"
                  style={{ background: "#1c1b1b", borderColor: "rgba(255,255,255,0.07)" }}
                >
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

            <div className={`group relative max-w-[78%]`}>
              <div
                className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white rounded-tr-sm"
                    : "bg-gray-800 text-gray-100 rounded-tl-sm"
                }`}
              >
                {msg.role === "user" ? (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                ) : msg.content === "" && loading ? (
                  <span className="inline-flex gap-1 items-center py-0.5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </span>
                ) : (
                  <ReactMarkdown components={mdComponents}>{msg.content}</ReactMarkdown>
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
        {/* Mark as resolved */}
        {messages.length > 0 && status !== "resolved" && (
          <div className="flex justify-end">
            <button
              onClick={markResolved}
              disabled={markingResolved || loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-green-400 hover:text-green-300 border border-green-500/20 hover:border-green-500/40 transition disabled:opacity-50"
              style={{ background: "rgba(34,197,94,0.05)" }}
            >
              <CheckCircle2 size={13} />
              {markingResolved ? "Marcando..." : "Marcar como resuelto"}
            </button>
          </div>
        )}

        {status === "resolved" && (
          <div className="flex items-center justify-center gap-2 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.08)" }}>
            <CheckCircle2 size={14} className="text-green-400" />
            <span className="text-xs text-green-400 font-medium">Caso resuelto</span>
          </div>
        )}

        {/* Input */}
        <div className="flex gap-2 items-end rounded-xl px-4 py-3 focus-within:border-blue-500 transition border"
          style={{ background: "#1a1a1a", borderColor: "rgba(255,255,255,0.1)" }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => { setInput(e.target.value); autoResize(); }}
            onKeyDown={handleKeyDown}
            placeholder={status === "resolved" ? "Caso resuelto — podés seguir agregando mensajes" : "Describí tu problema con Meta... (Enter para enviar)"}
            rows={1}
            className="flex-1 bg-transparent text-white text-sm resize-none outline-none placeholder-gray-500 leading-relaxed"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#2563eb" }}
          >
            {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
        <p className="text-[11px] text-gray-600 text-center">Shift+Enter para nueva línea · Enter para enviar</p>
      </div>
    </div>
  );
}
