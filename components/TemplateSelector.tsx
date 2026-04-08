"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { TemplateId } from "@/lib/proposal-templates/types";
import { TEMPLATE_META } from "@/lib/proposal-templates/types";

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: TemplateId) => void;
  isGenerating: boolean;
}

const TEMPLATE_PREVIEWS: Record<TemplateId, React.ReactNode> = {
  dark: (
    <div style={{ width: "100%", height: "100%", background: "#131313", borderRadius: 8, overflow: "hidden", display: "flex" }}>
      <div style={{ width: "28%", background: "#1c1b1b", padding: "8px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ width: "60%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#a78bfa,#7c3aed)", marginBottom: 4 }} />
        {[1,2,3,4].map(i => <div key={i} style={{ width: "80%", height: 4, borderRadius: 2, background: "#2a2a2a" }} />)}
        <div style={{ marginTop: "auto", width: "90%", height: 16, borderRadius: 6, background: "linear-gradient(90deg,#a78bfa,#7c3aed)" }} />
      </div>
      <div style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ background: "linear-gradient(135deg,#1a1040,#0d0d1a)", borderRadius: 6, height: 40, padding: 6 }}>
          <div style={{ width: "40%", height: 4, borderRadius: 2, background: "#a78bfa", marginBottom: 4 }} />
          <div style={{ width: "80%", height: 4, borderRadius: 2, background: "#fff" }} />
          <div style={{ width: "60%", height: 3, borderRadius: 2, background: "#666", marginTop: 3 }} />
        </div>
        <div style={{ display: "flex", gap: 4, flex: 1 }}>
          <div style={{ flex: 1, background: "#1c1b1b", borderRadius: 5, padding: 5 }}>
            {[1,2,3].map(i => <div key={i} style={{ width: "100%", height: 3, borderRadius: 2, background: "#2a2a2a", marginBottom: 3 }} />)}
          </div>
          <div style={{ flex: 1, background: "#1c1b1b", borderRadius: 5, padding: 5 }}>
            {[1,2,3].map(i => <div key={i} style={{ width: "100%", height: 3, borderRadius: 2, background: "#2a2a2a", marginBottom: 3 }} />)}
          </div>
        </div>
      </div>
    </div>
  ),
  modern: (
    // Luminary — light, hero con badge, cards flotantes
    <div style={{ width: "100%", height: "100%", background: "#f8fafc", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Navbar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", height: 14, display: "flex", alignItems: "center", padding: "0 8px", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: "linear-gradient(135deg,#6366f1,#f43f5e)" }} />
          <div style={{ width: 20, height: 3, borderRadius: 2, background: "#111" }} />
        </div>
        <div style={{ width: 20, height: 6, borderRadius: 4, background: "linear-gradient(90deg,#6366f1,#f43f5e)" }} />
      </div>
      {/* Hero card */}
      <div style={{ margin: "6px 8px", background: "linear-gradient(135deg,#eef2ff,#fdf2f8)", borderRadius: 8, padding: "10px 10px 8px", flex: "0 0 auto" }}>
        <div style={{ width: 28, height: 5, borderRadius: 10, background: "linear-gradient(90deg,#6366f1,#f43f5e)", marginBottom: 5, opacity: 0.5 }} />
        <div style={{ width: "90%", height: 6, borderRadius: 2, background: "#1e1b4b", marginBottom: 3 }} />
        <div style={{ width: "70%", height: 6, borderRadius: 2, background: "#1e1b4b", marginBottom: 8 }} />
        <div style={{ display: "flex", gap: 4 }}>
          <div style={{ width: 30, height: 8, borderRadius: 4, background: "linear-gradient(90deg,#6366f1,#f43f5e)" }} />
          <div style={{ width: 26, height: 8, borderRadius: 4, background: "#e2e8f0" }} />
        </div>
      </div>
      {/* Cards grid */}
      <div style={{ flex: 1, padding: "0 8px 8px", display: "flex", gap: 4 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 6, padding: 6, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", borderTop: `2px solid ${i === 0 ? "#6366f1" : i === 1 ? "#f43f5e" : "#10b981"}` }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: i === 0 ? "#eef2ff" : i === 1 ? "#fdf2f8" : "#ecfdf5", marginBottom: 4 }} />
            {[1,2].map(j => <div key={j} style={{ width: "100%", height: 3, borderRadius: 2, background: "#f1f5f9", marginBottom: 2 }} />)}
          </div>
        ))}
      </div>
    </div>
  ),
  minimal: (
    // Slate Minimal — tipografía, single column, elegante
    <div style={{ width: "100%", height: "100%", background: "#fff", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* Header line */}
      <div style={{ borderBottom: "1px solid #e8e8e8", padding: "6px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 24, height: 4, borderRadius: 2, background: "#111" }} />
        <div style={{ width: 16, height: 6, borderRadius: 3, border: "1px solid #111" }} />
      </div>
      {/* Hero */}
      <div style={{ padding: "16px 12px 10px" }}>
        <div style={{ width: 20, height: 3, borderRadius: 2, background: "#e94560", marginBottom: 6 }} />
        <div style={{ width: "95%", height: 8, borderRadius: 2, background: "#0a0a0a", marginBottom: 3 }} />
        <div style={{ width: "75%", height: 8, borderRadius: 2, background: "#0a0a0a", marginBottom: 8 }} />
        <div style={{ width: 48, height: 3, borderRadius: 2, background: "#0a0a0a", marginBottom: 8 }} />
        <div style={{ width: "90%", height: 3, borderRadius: 2, background: "#ccc", marginBottom: 3 }} />
        <div style={{ width: "80%", height: 3, borderRadius: 2, background: "#ccc" }} />
      </div>
      {/* Section rows */}
      <div style={{ flex: 1, padding: "0 12px", borderTop: "1px solid #f0f0f0" }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #f8f8f8", alignItems: "flex-start" }}>
            <div style={{ width: 16, height: 16, borderRadius: 2, background: "#f0f0f0", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ width: "70%", height: 4, borderRadius: 2, background: "#0a0a0a", marginBottom: 3 }} />
              <div style={{ width: "100%", height: 3, borderRadius: 2, background: "#e0e0e0" }} />
            </div>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div style={{ padding: "8px 12px", borderTop: "2px solid #0a0a0a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ width: 30, height: 3, borderRadius: 2, background: "#aaa" }} />
        <div style={{ width: 26, height: 8, borderRadius: 3, background: "#0a0a0a" }} />
      </div>
    </div>
  ),
  corporate: (
    // Corporate Pro — sidebar oscuro + contenido estructurado
    <div style={{ width: "100%", height: "100%", background: "#f8fafc", borderRadius: 8, overflow: "hidden", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "30%", background: "linear-gradient(180deg,#0f172a,#1e293b)", padding: "10px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
        <div style={{ display: "flex", gap: 4, alignItems: "center", marginBottom: 6 }}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: "rgba(255,255,255,0.15)" }} />
          <div style={{ width: 22, height: 4, borderRadius: 2, background: "#fff" }} />
        </div>
        <div style={{ width: "70%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.2)", marginBottom: 2 }} />
        <div style={{ width: "55%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)" }} />
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 2 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: "flex", gap: 4, alignItems: "center" }}>
              <div style={{ width: 4, height: 4, borderRadius: "50%", background: i === 1 ? "#6366f1" : "rgba(255,255,255,0.2)" }} />
              <div style={{ width: "70%", height: 3, borderRadius: 2, background: i === 1 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.15)" }} />
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", background: "linear-gradient(135deg,#6366f1,#f43f5e)", borderRadius: 6, padding: 6 }}>
          <div style={{ width: "60%", height: 3, borderRadius: 2, background: "rgba(255,255,255,0.5)", marginBottom: 4 }} />
          <div style={{ width: "80%", height: 6, borderRadius: 2, background: "#fff" }} />
        </div>
      </div>
      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Topbar */}
        <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", height: 14, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px" }}>
          <div style={{ width: 40, height: 3, borderRadius: 2, background: "#94a3b8" }} />
          <div style={{ width: 22, height: 7, borderRadius: 4, background: "linear-gradient(90deg,#6366f1,#f43f5e)" }} />
        </div>
        {/* Content blocks */}
        <div style={{ flex: 1, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ background: "#fff", borderRadius: 6, padding: 6, border: "1px solid #e2e8f0" }}>
            <div style={{ width: "85%", height: 5, borderRadius: 2, background: "#0f172a", marginBottom: 4 }} />
            <div style={{ width: "95%", height: 3, borderRadius: 2, background: "#e2e8f0", marginBottom: 2 }} />
            <div style={{ width: "70%", height: 3, borderRadius: 2, background: "#e2e8f0" }} />
          </div>
          <div style={{ display: "flex", gap: 3, flex: 1 }}>
            <div style={{ flex: 1, background: "linear-gradient(135deg,#0f172a,#1e293b)", borderRadius: 6, padding: 5, display: "flex", flexDirection: "column", gap: 3 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ background: "rgba(255,255,255,0.08)", borderRadius: 4, padding: 4 }}>
                  <div style={{ width: "50%", height: 6, borderRadius: 2, background: "rgba(255,255,255,0.6)", marginBottom: 2 }} />
                  <div style={{ width: "80%", height: 2, borderRadius: 2, background: "rgba(255,255,255,0.25)" }} />
                </div>
              ))}
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
              {[1,2].map(i => (
                <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 5, padding: 4, border: "1px solid #e2e8f0", borderLeft: `3px solid ${i === 1 ? "#6366f1" : "#f43f5e"}` }}>
                  {[1,2].map(j => <div key={j} style={{ width: "80%", height: 3, borderRadius: 2, background: "#f1f5f9", marginBottom: 2 }} />)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  ),
};

export default function TemplateSelector({ isOpen, onClose, onSelect, isGenerating }: TemplateSelectorProps) {
  const [selected, setSelected] = useState<TemplateId | null>(null);

  if (!isOpen) return null;

  const templates = Object.entries(TEMPLATE_META) as [TemplateId, { name: string; description: string }][];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <div
        className="relative w-full max-w-2xl rounded-2xl p-6"
        style={{ background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-white font-bold text-lg">Selecciona una plantilla</h2>
            <p className="text-slate-400 text-sm mt-0.5">La IA generará el HTML con la plantilla y colores de tu marca</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-white transition-colors rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grid 2x2 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {templates.map(([id, meta]) => (
            <button
              key={id}
              onClick={() => setSelected(id)}
              className="text-left rounded-xl overflow-hidden transition-all"
              style={{
                border: selected === id
                  ? "2px solid #a78bfa"
                  : "2px solid rgba(255,255,255,0.06)",
                boxShadow: selected === id ? "0 0 20px rgba(167,139,250,0.25)" : "none",
              }}
            >
              {/* Thumbnail */}
              <div style={{ height: 140, padding: 8, background: "#111" }}>
                {TEMPLATE_PREVIEWS[id]}
              </div>
              {/* Label */}
              <div
                className="px-4 py-3"
                style={{ background: selected === id ? "rgba(167,139,250,0.1)" : "#141414" }}
              >
                <div className="font-bold text-sm text-white">{meta.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{meta.description}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Action */}
        <button
          onClick={() => { if (selected) onSelect(selected); }}
          disabled={!selected || isGenerating}
          className="w-full py-3 text-sm font-bold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(90deg,#a78bfa,#7c3aed)",
            color: "#fff",
            boxShadow: selected ? "0 0 20px rgba(124,58,237,0.3)" : "none",
          }}
        >
          {isGenerating ? "Generando…" : selected ? `Generar con "${TEMPLATE_META[selected].name}"` : "Selecciona una plantilla"}
        </button>
      </div>
    </div>
  );
}
