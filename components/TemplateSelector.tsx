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
      {/* Sidebar */}
      <div style={{ width: "28%", background: "#1c1b1b", padding: "8px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ width: "60%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#a78bfa,#7c3aed)", marginBottom: 4 }} />
        {[1,2,3,4].map(i => <div key={i} style={{ width: "80%", height: 4, borderRadius: 2, background: "#2a2a2a" }} />)}
        <div style={{ marginTop: "auto", width: "90%", height: 16, borderRadius: 6, background: "linear-gradient(90deg,#a78bfa,#7c3aed)" }} />
      </div>
      {/* Content */}
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
  data: (
    <div style={{ width: "100%", height: "100%", background: "#f4f6ff", borderRadius: 8, overflow: "hidden", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "28%", background: "#fff", borderRight: "1px solid #e8edf8", padding: "8px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ width: "60%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#7c3aed,#ec4899)", marginBottom: 4 }} />
        {[1,2,3,4].map(i => <div key={i} style={{ width: "80%", height: 4, borderRadius: 2, background: "#e8edf8" }} />)}
        <div style={{ marginTop: "auto", width: "90%", height: 14, borderRadius: 6, background: "linear-gradient(90deg,#7c3aed,#ec4899)" }} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ background: "#181825", borderRadius: 6, height: 38, padding: 6 }}>
          <div style={{ width: "30%", height: 3, borderRadius: 2, background: "#a78bfa", marginBottom: 3 }} />
          <div style={{ width: "85%", height: 5, borderRadius: 2, background: "#fff", marginBottom: 2 }} />
          <div style={{ width: "50%", height: 3, borderRadius: 2, background: "#666" }} />
        </div>
        {/* Metric cards */}
        <div style={{ display: "flex", gap: 3 }}>
          {["#7c3aed","#ec4899","#10b981"].map((c, i) => (
            <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 5, padding: 4, borderLeft: `3px solid ${c}` }}>
              <div style={{ width: "50%", height: 3, borderRadius: 2, background: "#e8edf8", marginBottom: 2 }} />
              <div style={{ width: "70%", height: 5, borderRadius: 2, background: c, opacity: 0.7 }} />
            </div>
          ))}
        </div>
        {/* Chart-like bars */}
        <div style={{ flex: 1, background: "#fff", borderRadius: 5, padding: 5, display: "flex", alignItems: "flex-end", gap: 3 }}>
          {[60,80,45,90,55,70].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}%`, borderRadius: "3px 3px 0 0", background: i % 2 === 0 ? "#7c3aed" : "#e8edf8" }} />
          ))}
        </div>
      </div>
    </div>
  ),
  bold: (
    <div style={{ width: "100%", height: "100%", background: "#f4f6ff", borderRadius: 8, overflow: "hidden", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "28%", background: "#fff", borderRight: "1px solid #e8edf8", padding: "8px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ width: "60%", height: 6, borderRadius: 3, background: "linear-gradient(90deg,#7c3aed,#ec4899)", marginBottom: 4 }} />
        {[1,2,3,4].map(i => <div key={i} style={{ width: "80%", height: 4, borderRadius: 2, background: "#e8edf8" }} />)}
        <div style={{ marginTop: "auto", width: "90%", height: 14, borderRadius: 6, background: "linear-gradient(90deg,#7c3aed,#ec4899)" }} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Gradient hero */}
        <div style={{ background: "linear-gradient(135deg,#7c3aed,#ec4899)", height: "40%", padding: 8 }}>
          <div style={{ width: "25%", height: 4, borderRadius: 10, background: "rgba(255,255,255,0.3)", marginBottom: 4 }} />
          <div style={{ width: "90%", height: 5, borderRadius: 2, background: "#fff", marginBottom: 2 }} />
          <div style={{ width: "60%", height: 5, borderRadius: 2, background: "#fff" }} />
        </div>
        {/* Cards below */}
        <div style={{ flex: 1, padding: 6, display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", gap: 3, flex: 1 }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 5, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#7c3aed", marginBottom: 4 }} />
                {[1,2].map(j => <div key={j} style={{ width: "100%", height: 3, borderRadius: 2, background: "#e8edf8", marginBottom: 2 }} />)}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            <div style={{ flex: 2, height: 16, borderRadius: 5, background: "linear-gradient(90deg,#1e1b4b,#312e81)" }} />
            <div style={{ flex: 1, height: 16, borderRadius: 5, background: "#f0f4ff" }} />
          </div>
        </div>
      </div>
    </div>
  ),
  elegant: (
    <div style={{ width: "100%", height: "100%", background: "#f4f6ff", borderRadius: 8, overflow: "hidden", display: "flex" }}>
      {/* Sidebar */}
      <div style={{ width: "28%", background: "#0c0c0e", padding: "8px 6px", display: "flex", flexDirection: "column", gap: 4 }}>
        <div style={{ width: "60%", height: 5, borderRadius: 3, background: "linear-gradient(90deg,#7c3aed,#ec4899)", marginBottom: 4 }} />
        {[1,2,3,4].map(i => <div key={i} style={{ width: "70%", height: 3, borderRadius: 2, background: "#222" }} />)}
        <div style={{ marginTop: "auto", width: "90%", height: 14, borderRadius: 16, background: "linear-gradient(90deg,#7c3aed,#ec4899)" }} />
      </div>
      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Hero with gradient overlay */}
        <div style={{ background: "linear-gradient(135deg,rgba(124,58,237,0.9),rgba(176,13,106,0.9))", height: "45%", padding: 8, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <div style={{ width: "20%", height: 3, borderRadius: 10, background: "rgba(255,255,255,0.4)", marginBottom: 4 }} />
          <div style={{ width: "95%", height: 6, borderRadius: 2, background: "#fff", marginBottom: 2 }} />
          <div style={{ width: "70%", height: 6, borderRadius: 2, background: "#fff" }} />
        </div>
        {/* Bento grid */}
        <div style={{ flex: 1, padding: 6, display: "flex", gap: 3 }}>
          <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            {[1,2].map(i => (
              <div key={i} style={{ flex: 1, background: "#fff", borderRadius: 5, padding: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                {[1,2].map(j => <div key={j} style={{ width: "80%", height: 3, borderRadius: 2, background: "#e8edf8", marginBottom: 2 }} />)}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
            <div style={{ flex: 2, background: "linear-gradient(135deg,#7c3aed,#ec4899)", borderRadius: 5 }} />
            <div style={{ flex: 1, background: "#f0f4ff", borderRadius: 5 }} />
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
