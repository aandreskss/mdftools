"use client";

import { useState, useEffect, useRef } from "react";
import { Brain, X, Save, Upload, Trash2, FileText, CheckCircle, Loader2 } from "lucide-react";

interface AgentFile {
  id: string;
  file_name: string;
  file_size: number;
  created_at: string;
}

interface Props {
  agentId: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AgentBrain({ agentId }: Props) {
  const [open, setOpen] = useState(false);
  const [context, setContext] = useState("");
  const [savedContext, setSavedContext] = useState("");
  const [files, setFiles] = useState<AgentFile[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) loadData();
  }, [open, agentId]);

  async function loadData() {
    setLoading(true);
    const [ctxRes, filesRes] = await Promise.all([
      fetch(`/api/agent-context?agentId=${agentId}`).then(r => r.json()),
      fetch(`/api/agent-files?agentId=${agentId}`).then(r => r.json()),
    ]);
    setContext(ctxRes.context ?? "");
    setSavedContext(ctxRes.context ?? "");
    setFiles(filesRes.files ?? []);
    setLoading(false);
  }

  async function handleSaveContext() {
    setSaving(true);
    await fetch("/api/agent-context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ agentId, contextText: context }),
    });
    setSavedContext(context);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("agentId", agentId);

    const res = await fetch("/api/agent-files", { method: "POST", body: formData });

    if (res.ok) {
      const { file: newFile } = await res.json();
      setFiles(prev => [newFile, ...prev]);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDelete(fileId: string) {
    await fetch(`/api/agent-files?id=${fileId}`, { method: "DELETE" });
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }

  const hasUnsavedChanges = context !== savedContext;

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setOpen(true)}
        title="Cerebro del agente"
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
          files.length > 0 || savedContext
            ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/30"
            : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white hover:border-gray-600"
        }`}
      >
        <Brain size={13} />
        Cerebro
        {(files.length > 0 || savedContext) && (
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        )}
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <div className="relative w-80 h-full bg-gray-900 border-l border-gray-800 flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-indigo-400" />
                <div>
                  <p className="text-sm font-semibold text-white">Cerebro del agente</p>
                  <p className="text-xs text-gray-500">Memoria permanente</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition">
                <X size={15} />
              </button>
            </div>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader2 size={20} className="text-gray-500 animate-spin" />
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto">
                {/* Context section */}
                <div className="p-5 border-b border-gray-800">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Instrucciones permanentes
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    El agente siempre seguirá estas instrucciones en todas las conversaciones.
                  </p>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder={`Ej: Siempre usa un tono cercano y directo. Nunca uses palabras formales. Cuando generes posts para Instagram, incluye siempre emojis relevantes...`}
                    rows={6}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition resize-none leading-relaxed"
                  />
                  <button
                    onClick={handleSaveContext}
                    disabled={saving || !hasUnsavedChanges}
                    className="mt-2 w-full flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition"
                  >
                    {saving ? (
                      <Loader2 size={12} className="animate-spin" />
                    ) : saved ? (
                      <CheckCircle size={12} className="text-green-400" />
                    ) : (
                      <Save size={12} />
                    )}
                    {saved ? "Guardado" : hasUnsavedChanges ? "Guardar instrucciones" : "Sin cambios"}
                  </button>
                </div>

                {/* Files section */}
                <div className="p-5">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Base de conocimiento
                  </p>
                  <p className="text-xs text-gray-500 mb-3">
                    Sube documentos (.txt, .md, .json) que el agente usará como referencia.
                  </p>

                  {/* Upload button */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt,.md,.json,.csv"
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full flex items-center justify-center gap-2 py-2.5 border border-dashed border-gray-600 hover:border-indigo-500 rounded-xl text-xs text-gray-400 hover:text-white transition disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Upload size={13} />
                    )}
                    {uploading ? "Subiendo..." : "Subir documento"}
                  </button>
                  <p className="text-[10px] text-gray-600 mt-1.5 text-center">
                    .txt · .md · .json · .csv — máx. 5MB
                  </p>

                  {/* Files list */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center gap-2 p-2.5 bg-gray-800 rounded-lg border border-gray-700 group">
                          <FileText size={13} className="text-indigo-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white truncate">{file.file_name}</p>
                            <p className="text-[10px] text-gray-500">{formatBytes(file.file_size)}</p>
                          </div>
                          <button
                            onClick={() => handleDelete(file.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {files.length === 0 && (
                    <p className="text-center text-xs text-gray-600 mt-4">
                      Sin documentos cargados
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
