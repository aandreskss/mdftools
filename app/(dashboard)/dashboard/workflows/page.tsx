"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Mail, MessageCircle, Smartphone, Phone, Clock, GitBranch, Tag, StickyNote,
  Plus, Trash2, ChevronDown, Send, Bot, X, Play, Square, Save, ArrowLeft,
  Workflow, Pencil, Check, MoreHorizontal, Copy, Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkflowNode {
  id: string;
  type: "trigger" | "email" | "whatsapp" | "sms" | "call" | "wait" | "condition" | "tag" | "note";
  label: string;
  description?: string;
  config: { [key: string]: any };
  branch?: "yes" | "no";
  parent_id?: string;
  integrations?: string[];
}

interface WorkflowRecord {
  id: string;
  name: string;
  description: string;
  nodes: WorkflowNode[];
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  workflowApplied?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_INTEGRATIONS: Record<string, string[]> = {
  email: ["SendGrid", "Mailchimp", "Gmail API", "Outlook", "ActiveCampaign"],
  whatsapp: ["Twilio", "Meta Business API", "ManyChat", "WATI", "Respond.io"],
  sms: ["Twilio", "Vonage", "AWS SNS", "Telnyx"],
  call: ["Twilio", "Aircall", "RingCentral", "JustCall"],
  trigger: ["HubSpot", "Salesforce", "Pipedrive", "Webhook", "Zapier"],
  tag: ["HubSpot", "Salesforce", "Pipedrive", "Notion", "Airtable"],
  condition: [],
  wait: [],
  note: [],
};

const NODE_ICONS: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  trigger: Zap,
  email: Mail,
  whatsapp: MessageCircle,
  sms: Smartphone,
  call: Phone,
  wait: Clock,
  condition: GitBranch,
  tag: Tag,
  note: StickyNote,
};

const NODE_COLORS: Record<string, { bg: string; border: string; icon: string }> = {
  trigger: { bg: "rgba(250,204,21,0.1)", border: "rgba(250,204,21,0.3)", icon: "#facc15" },
  email: { bg: "rgba(96,165,250,0.1)", border: "rgba(96,165,250,0.3)", icon: "#60a5fa" },
  whatsapp: { bg: "rgba(74,222,128,0.1)", border: "rgba(74,222,128,0.3)", icon: "#4ade80" },
  sms: { bg: "rgba(167,139,250,0.1)", border: "rgba(167,139,250,0.3)", icon: "#a78bfa" },
  call: { bg: "rgba(251,146,60,0.1)", border: "rgba(251,146,60,0.3)", icon: "#fb923c" },
  wait: { bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", icon: "#94a3b8" },
  condition: { bg: "rgba(244,114,182,0.1)", border: "rgba(244,114,182,0.3)", icon: "#f472b4" },
  tag: { bg: "rgba(52,211,153,0.1)", border: "rgba(52,211,153,0.3)", icon: "#34d399" },
  note: { bg: "rgba(203,190,255,0.08)", border: "rgba(203,190,255,0.2)", icon: "#cbbeff" },
};

const NODE_PALETTE = [
  {
    group: "Disparadores",
    items: [
      { type: "trigger" as const, label: "Lead nuevo", description: "Cuando entra un lead" },
      { type: "trigger" as const, label: "Formulario", description: "Formulario enviado" },
      { type: "trigger" as const, label: "Manual", description: "Inicio manual" },
      { type: "trigger" as const, label: "Webhook", description: "Evento externo" },
    ],
  },
  {
    group: "Acciones",
    items: [
      { type: "email" as const, label: "Email", description: "Enviar email" },
      { type: "whatsapp" as const, label: "WhatsApp", description: "Enviar mensaje" },
      { type: "sms" as const, label: "SMS", description: "Enviar SMS" },
      { type: "call" as const, label: "Llamada", description: "Llamada telefónica" },
    ],
  },
  {
    group: "Lógica",
    items: [
      { type: "wait" as const, label: "Esperar", description: "Tiempo de espera" },
      { type: "condition" as const, label: "Condición", description: "Bifurcación Si/No" },
      { type: "tag" as const, label: "Etiquetar", description: "Agregar etiqueta" },
      { type: "note" as const, label: "Nota", description: "Nota interna" },
    ],
  },
];

function genId() {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkflowsPage() {
  const [view, setView] = useState<"list" | "builder">("list");
  const [workflows, setWorkflows] = useState<WorkflowRecord[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowRecord | null>(null);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [workflowName, setWorkflowName] = useState("Nuevo Workflow");
  const [editingName, setEditingName] = useState(false);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewStep, setPreviewStep] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { role: "assistant", content: "¡Hola! Soy tu agente de workflows. Puedo ayudarte a diseñar automaciones de ventas efectivas.\n\nPuedes pedirme:\n• **Crear un workflow** de recontacto, nurturing, onboarding, etc.\n• **Recomendar estrategias** para tu proceso de ventas\n• **Optimizar** el workflow actual\n\n¿Por dónde empezamos?" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Load workflows list
  useEffect(() => {
    if (view === "list") {
      setLoadingList(true);
      fetch("/api/workflows")
        .then(r => r.json())
        .then(d => { setWorkflows(Array.isArray(d) ? d : []); setLoadingList(false); })
        .catch(() => setLoadingList(false));
    }
  }, [view]);

  // Scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Preview animation
  useEffect(() => {
    if (!previewMode) { setPreviewStep(0); return; }
    if (nodes.length === 0) { setPreviewMode(false); return; }
    setPreviewStep(0);
    const interval = setInterval(() => {
      setPreviewStep(prev => {
        if (prev >= nodes.length - 1) { setPreviewMode(false); clearInterval(interval); return 0; }
        return prev + 1;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [previewMode, nodes.length]);

  // Focus name input
  useEffect(() => {
    if (editingName) nameInputRef.current?.focus();
  }, [editingName]);

  // ── Node operations ──

  const addNode = useCallback((type: WorkflowNode["type"], label: string, afterIndex?: number) => {
    const defaultConfigs: Record<string, any> = {
      email: { subject: "", body: "" },
      whatsapp: { message: "" },
      sms: { message: "" },
      call: { message: "" },
      wait: { duration: 1, unit: "days" },
      condition: { condition: "¿Respondió?", yes_label: "Sí", no_label: "No" },
      tag: { tag_name: "" },
      note: { message: "" },
      trigger: { trigger_type: "lead_nuevo" },
    };
    const newNode: WorkflowNode = {
      id: genId(),
      type,
      label,
      description: "",
      config: defaultConfigs[type] ?? {},
      integrations: DEFAULT_INTEGRATIONS[type] ?? [],
    };
    setNodes(prev => {
      if (afterIndex !== undefined) {
        const next = [...prev];
        next.splice(afterIndex + 1, 0, newNode);
        return next;
      }
      return [...prev, newNode];
    });
  }, []);

  const removeNode = useCallback((id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    setSelectedNode(prev => prev?.id === id ? null : prev);
  }, []);

  const updateNode = useCallback((id: string, changes: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(n => n.id === id ? { ...n, ...changes } : n));
    setSelectedNode(prev => prev?.id === id ? { ...prev, ...changes } : prev);
  }, []);

  // ── Save ──

  const saveWorkflow = async () => {
    setSaving(true);
    try {
      const payload = { name: workflowName, description: "", nodes };
      if (currentWorkflow?.id) {
        await fetch(`/api/workflows/${currentWorkflow.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setCurrentWorkflow(prev => prev ? { ...prev, ...payload } : null);
      } else {
        const res = await fetch("/api/workflows", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const created = await res.json();
        setCurrentWorkflow(created);
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Load workflow ──

  const loadWorkflow = (wf: WorkflowRecord) => {
    setCurrentWorkflow(wf);
    setNodes(Array.isArray(wf.nodes) ? wf.nodes : []);
    setWorkflowName(wf.name);
    setSelectedNode(null);
    setView("builder");
  };

  const newWorkflow = () => {
    setCurrentWorkflow(null);
    setNodes([]);
    setWorkflowName("Nuevo Workflow");
    setSelectedNode(null);
    setView("builder");
  };

  // ── Delete workflow ──

  const deleteWorkflow = async (id: string) => {
    await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  // ── Chat ──

  const sendMessage = async (text?: string) => {
    const content = text ?? chatInput.trim();
    if (!content || chatLoading) return;
    setChatInput("");
    const userMsg: ChatMessage = { role: "user", content };
    setChatMessages(prev => [...prev, userMsg]);
    setChatLoading(true);

    const allMessages = [...chatMessages, userMsg].map(m => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/workflows/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: allMessages, currentNodes: nodes }),
      });
      if (!res.body) throw new Error("No stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";
      const assistantMsg: ChatMessage = { role: "assistant", content: "" };
      setChatMessages(prev => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += decoder.decode(value, { stream: true });
        setChatMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: "assistant", content: full };
          return updated;
        });
      }

      // Parse WORKFLOW_ACTION
      const actionMarker = "___WORKFLOW_ACTION___";
      if (full.includes(actionMarker)) {
        const parts = full.split(actionMarker);
        const jsonStr = parts[1]?.trim();
        try {
          const action = JSON.parse(jsonStr);
          if (action.action === "set_workflow" && Array.isArray(action.nodes)) {
            setNodes(action.nodes);
            if (action.name) setWorkflowName(action.name);
            setChatMessages(prev => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: parts[0].trim(),
                workflowApplied: true,
              };
              return updated;
            });
          }
        } catch {
          // JSON parse failed, show message as-is without the marker
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: parts[0].trim(),
            };
            return updated;
          });
        }
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Error al conectar con el agente. Intenta de nuevo." }]);
    } finally {
      setChatLoading(false);
    }
  };

  // ─── Views ────────────────────────────────────────────────────────────────

  if (view === "list") {
    return <WorkflowList workflows={workflows} loading={loadingList} onNew={newWorkflow} onLoad={loadWorkflow} onDelete={deleteWorkflow} />;
  }

  return (
    <div className="flex flex-col h-screen" style={{ background: "#131313", color: "#e5e2e1" }}>
      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(203,190,255,0.1)", background: "rgba(28,27,27,0.8)" }}
      >
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-1.5 text-[12px] transition-colors"
          style={{ color: "rgba(203,190,255,0.5)" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#cbbeff")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(203,190,255,0.5)")}
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Workflows
        </button>
        <span style={{ color: "rgba(203,190,255,0.2)" }}>/</span>

        {/* Editable name */}
        {editingName ? (
          <input
            ref={nameInputRef}
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={e => e.key === "Enter" && setEditingName(false)}
            className="bg-transparent border-b outline-none text-[14px] font-semibold"
            style={{ borderColor: "#cbbeff", color: "#e5e2e1", minWidth: "120px" }}
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="flex items-center gap-1.5 text-[14px] font-semibold transition-colors group"
            style={{ color: "#e5e2e1" }}
          >
            {workflowName}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          </button>
        )}

        <div className="flex-1" />

        {/* Preview */}
        <button
          onClick={() => setPreviewMode(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          style={{
            background: previewMode ? "rgba(203,190,255,0.15)" : "rgba(255,255,255,0.05)",
            color: previewMode ? "#cbbeff" : "rgba(203,190,255,0.6)",
            border: `1px solid ${previewMode ? "rgba(203,190,255,0.3)" : "rgba(203,190,255,0.1)"}`,
          }}
        >
          {previewMode ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
          {previewMode ? "Detener" : "Preview"}
        </button>

        {/* Save */}
        <button
          onClick={saveWorkflow}
          disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all"
          style={{
            background: "linear-gradient(90deg, #cbbeff 0%, #9d85ff 100%)",
            color: "#1e0061",
            opacity: saving ? 0.7 : 1,
          }}
        >
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
          Guardar
        </button>
      </div>

      {/* Builder body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Node Palette ── */}
        <div
          className="w-[200px] flex-shrink-0 overflow-y-auto py-4 px-3 space-y-5"
          style={{ borderRight: "1px solid rgba(203,190,255,0.1)", background: "rgba(20,19,19,0.6)" }}
        >
          {NODE_PALETTE.map(group => (
            <div key={group.group}>
              <p className="text-[9px] font-bold uppercase tracking-[1.5px] mb-2 px-1" style={{ color: "#938e9e" }}>
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map(item => {
                  const Icon = NODE_ICONS[item.type];
                  const colors = NODE_COLORS[item.type];
                  return (
                    <button
                      key={item.label}
                      onClick={() => addNode(item.type, item.label)}
                      className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all group"
                      style={{ border: `1px solid rgba(203,190,255,0.06)`, background: "rgba(255,255,255,0.02)" }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                        (e.currentTarget as HTMLElement).style.background = colors.bg;
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.06)";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                      }}
                    >
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                      >
                        <Icon className="w-3 h-3" style={{ color: colors.icon }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium truncate" style={{ color: "#e5e2e1" }}>{item.label}</p>
                        <p className="text-[9px] truncate" style={{ color: "#938e9e" }}>{item.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ── Canvas ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6" style={{ background: "#131313" }}>
          {nodes.length === 0 ? (
            <EmptyCanvas onAdd={(type, label) => addNode(type, label)} />
          ) : (
            <div className="max-w-[480px] mx-auto space-y-0">
              {nodes.map((node, idx) => (
                <React.Fragment key={node.id}>
                  <CanvasNode
                    node={node}
                    isSelected={selectedNode?.id === node.id}
                    isPreviewActive={previewMode && previewStep === idx}
                    onClick={() => setSelectedNode(prev => prev?.id === node.id ? null : node)}
                    onDelete={() => removeNode(node.id)}
                  />
                  {/* Add between button */}
                  <div className="flex justify-center relative">
                    {idx < nodes.length - 1 && (
                      <>
                        {/* Connector line */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: "rgba(203,190,255,0.15)" }} />
                        <button
                          onClick={() => {
                            // Add a generic node after this index — pick first palette action
                            addNode("email", "Email", idx);
                          }}
                          className="relative z-10 w-5 h-5 rounded-full flex items-center justify-center my-1.5 transition-all"
                          style={{ background: "rgba(203,190,255,0.1)", border: "1px solid rgba(203,190,255,0.2)", color: "rgba(203,190,255,0.5)" }}
                          onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.2)";
                            (e.currentTarget as HTMLElement).style.color = "#cbbeff";
                          }}
                          onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.1)";
                            (e.currentTarget as HTMLElement).style.color = "rgba(203,190,255,0.5)";
                          }}
                          title="Insertar nodo"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </>
                    )}
                    {idx === nodes.length - 1 && (
                      <div className="h-4 w-px" style={{ background: "rgba(203,190,255,0.15)" }} />
                    )}
                  </div>
                </React.Fragment>
              ))}
              {/* Add at end */}
              <button
                onClick={() => addNode("email", "Email")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-medium mt-2 transition-all"
                style={{ border: "1px dashed rgba(203,190,255,0.2)", color: "rgba(203,190,255,0.4)" }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.4)";
                  (e.currentTarget as HTMLElement).style.color = "#cbbeff";
                  (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.04)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.2)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(203,190,255,0.4)";
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <Plus className="w-3.5 h-3.5" />
                Agregar nodo
              </button>
            </div>
          )}
        </div>

        {/* ── Right Panel: Node Detail or Chat ── */}
        <div
          className="w-[340px] flex-shrink-0 flex flex-col"
          style={{ borderLeft: "1px solid rgba(203,190,255,0.1)", background: "rgba(20,19,19,0.6)" }}
        >
          {selectedNode ? (
            <NodeDetailPanel
              node={selectedNode}
              onUpdate={(changes) => updateNode(selectedNode.id, changes)}
              onDelete={() => removeNode(selectedNode.id)}
              onClose={() => setSelectedNode(null)}
              onAskAgent={(msg) => {
                setSelectedNode(null);
                sendMessage(msg);
              }}
            />
          ) : (
            <ChatPanel
              messages={chatMessages}
              input={chatInput}
              loading={chatLoading}
              chatEndRef={chatEndRef}
              onInputChange={setChatInput}
              onSend={() => sendMessage()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── WorkflowList ─────────────────────────────────────────────────────────────

function WorkflowList({
  workflows,
  loading,
  onNew,
  onLoad,
  onDelete,
}: {
  workflows: WorkflowRecord[];
  loading: boolean;
  onNew: () => void;
  onLoad: (wf: WorkflowRecord) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="p-8" style={{ background: "#131313", minHeight: "100vh", color: "#e5e2e1" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#e5e2e1" }}>Workflows</h1>
          <p className="text-[13px] mt-1" style={{ color: "#938e9e" }}>Automatizaciones de ventas y seguimiento de clientes</p>
        </div>
        <button
          onClick={onNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px] transition-all"
          style={{ background: "linear-gradient(90deg, #cbbeff 0%, #9d85ff 100%)", color: "#1e0061" }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          <Plus className="w-4 h-4" />
          Nuevo Workflow
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#cbbeff" }} />
        </div>
      ) : workflows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(203,190,255,0.08)", border: "1px solid rgba(203,190,255,0.15)" }}
          >
            <Workflow className="w-8 h-8" style={{ color: "#cbbeff" }} />
          </div>
          <h3 className="text-[16px] font-semibold mb-2" style={{ color: "#e5e2e1" }}>Sin workflows todavía</h3>
          <p className="text-[13px] mb-6 max-w-xs" style={{ color: "#938e9e" }}>
            Crea tu primer workflow de automatización con la ayuda de nuestro agente IA.
          </p>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[13px]"
            style={{ background: "rgba(203,190,255,0.1)", border: "1px solid rgba(203,190,255,0.2)", color: "#cbbeff" }}
          >
            <Plus className="w-4 h-4" />
            Crear workflow
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map(wf => (
            <WorkflowCard key={wf.id} workflow={wf} onLoad={onLoad} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkflowCard({
  workflow,
  onLoad,
  onDelete,
}: {
  workflow: WorkflowRecord;
  onLoad: (wf: WorkflowRecord) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const nodeCount = Array.isArray(workflow.nodes) ? workflow.nodes.length : 0;

  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3 relative group transition-all"
      style={{ background: "#1c1b1b", border: "1px solid rgba(203,190,255,0.08)" }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.18)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.08)")}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(203,190,255,0.1)", border: "1px solid rgba(203,190,255,0.2)" }}
        >
          <Workflow className="w-4 h-4" style={{ color: "#cbbeff" }} />
        </div>
        <button
          onClick={() => setMenuOpen(v => !v)}
          className="w-7 h-7 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "#938e9e", background: "rgba(255,255,255,0.04)" }}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
        {menuOpen && (
          <div
            className="absolute right-3 top-12 rounded-xl py-1 z-50 min-w-[130px]"
            style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.15)", boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}
          >
            <button
              onClick={() => { setMenuOpen(false); onLoad(workflow); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors"
              style={{ color: "#e5e2e1" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Pencil className="w-3 h-3" /> Editar
            </button>
            <button
              onClick={() => { setMenuOpen(false); onDelete(workflow.id); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] transition-colors"
              style={{ color: "#ffb4ab" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,180,171,0.06)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
            >
              <Trash2 className="w-3 h-3" /> Eliminar
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        <h3 className="text-[14px] font-semibold mb-1" style={{ color: "#e5e2e1" }}>{workflow.name}</h3>
        {workflow.description && (
          <p className="text-[12px] line-clamp-2" style={{ color: "#938e9e" }}>{workflow.description}</p>
        )}
      </div>

      {/* Meta */}
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-3">
          <span className="text-[11px]" style={{ color: "#938e9e" }}>{nodeCount} nodos</span>
          <span className="text-[11px]" style={{ color: "#938e9e" }}>{formatDate(workflow.updated_at)}</span>
        </div>
        <button
          onClick={() => onLoad(workflow)}
          className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
          style={{ background: "rgba(203,190,255,0.1)", color: "#cbbeff", border: "1px solid rgba(203,190,255,0.2)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(203,190,255,0.18)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(203,190,255,0.1)")}
        >
          Editar
        </button>
      </div>
    </div>
  );
}

// ─── CanvasNode ───────────────────────────────────────────────────────────────

function CanvasNode({
  node,
  isSelected,
  isPreviewActive,
  onClick,
  onDelete,
}: {
  node: WorkflowNode;
  isSelected: boolean;
  isPreviewActive: boolean;
  onClick: () => void;
  onDelete: () => void;
}) {
  const Icon = NODE_ICONS[node.type];
  const colors = NODE_COLORS[node.type];

  return (
    <div
      onClick={onClick}
      className="relative rounded-2xl p-4 cursor-pointer transition-all group"
      style={{
        background: isPreviewActive ? colors.bg : "#1c1b1b",
        border: `1.5px solid ${isSelected ? "#cbbeff" : isPreviewActive ? colors.border : "rgba(203,190,255,0.1)"}`,
        boxShadow: isSelected ? "0 0 0 3px rgba(203,190,255,0.12)" : isPreviewActive ? `0 0 16px ${colors.icon}33` : "none",
        transition: "all 0.2s",
      }}
    >
      {/* Preview pulse */}
      {isPreviewActive && (
        <span
          className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full animate-pulse"
          style={{ background: colors.icon }}
        />
      )}

      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <Icon className="w-4 h-4" style={{ color: colors.icon }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold truncate" style={{ color: "#e5e2e1" }}>{node.label}</span>
            <span
              className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md flex-shrink-0"
              style={{ background: colors.bg, color: colors.icon, border: `1px solid ${colors.border}` }}
            >
              {node.type}
            </span>
          </div>
          {node.description && (
            <p className="text-[11px] mt-0.5 truncate" style={{ color: "#938e9e" }}>{node.description}</p>
          )}
          {/* Config preview */}
          <ConfigPreview node={node} />
          {/* Integration badges */}
          {node.integrations && node.integrations.length > 0 && (
            <div className="flex gap-1 mt-1.5 flex-wrap">
              {node.integrations.slice(0, 3).map(integ => (
                <span
                  key={integ}
                  className="text-[9px] px-1.5 py-0.5 rounded-md"
                  style={{ background: "rgba(203,190,255,0.06)", color: "#938e9e", border: "1px solid rgba(203,190,255,0.12)" }}
                >
                  {integ}
                </span>
              ))}
              {node.integrations.length > 3 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-md" style={{ color: "#938e9e" }}>+{node.integrations.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={e => { e.stopPropagation(); onDelete(); }}
          className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          style={{ color: "#ffb4ab", background: "rgba(255,180,171,0.08)" }}
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

function ConfigPreview({ node }: { node: WorkflowNode }) {
  const { type, config } = node;
  if (type === "wait" && config.duration)
    return <p className="text-[11px] mt-0.5" style={{ color: "#938e9e" }}>Esperar {config.duration} {config.unit}</p>;
  if (type === "email" && config.subject)
    return <p className="text-[11px] mt-0.5 truncate" style={{ color: "#938e9e" }}>Asunto: {config.subject}</p>;
  if ((type === "whatsapp" || type === "sms") && config.message)
    return <p className="text-[11px] mt-0.5 truncate" style={{ color: "#938e9e" }}>{config.message}</p>;
  if (type === "condition" && config.condition)
    return <p className="text-[11px] mt-0.5 truncate" style={{ color: "#938e9e" }}>{config.condition}</p>;
  if (type === "tag" && config.tag_name)
    return <p className="text-[11px] mt-0.5" style={{ color: "#938e9e" }}>Tag: {config.tag_name}</p>;
  return null;
}

// ─── EmptyCanvas ──────────────────────────────────────────────────────────────

function EmptyCanvas({ onAdd }: { onAdd: (type: WorkflowNode["type"], label: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(203,190,255,0.06)", border: "1px dashed rgba(203,190,255,0.2)" }}
      >
        <GitBranch className="w-7 h-7" style={{ color: "rgba(203,190,255,0.3)" }} />
      </div>
      <p className="text-[14px] font-medium mb-1" style={{ color: "#e5e2e1" }}>Canvas vacío</p>
      <p className="text-[12px] mb-6 max-w-xs" style={{ color: "#938e9e" }}>
        Agrega nodos desde la paleta izquierda o pídele al agente IA que genere un workflow.
      </p>
      <button
        onClick={() => onAdd("trigger", "Lead nuevo")}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold"
        style={{ background: "rgba(203,190,255,0.1)", border: "1px solid rgba(203,190,255,0.2)", color: "#cbbeff" }}
      >
        <Plus className="w-3.5 h-3.5" />
        Agregar trigger
      </button>
    </div>
  );
}

// ─── NodeDetailPanel ──────────────────────────────────────────────────────────

function NodeDetailPanel({
  node,
  onUpdate,
  onDelete,
  onClose,
  onAskAgent,
}: {
  node: WorkflowNode;
  onUpdate: (changes: Partial<WorkflowNode>) => void;
  onDelete: () => void;
  onClose: () => void;
  onAskAgent: (msg: string) => void;
}) {
  const Icon = NODE_ICONS[node.type];
  const colors = NODE_COLORS[node.type];
  const integrations = node.integrations?.length ? node.integrations : DEFAULT_INTEGRATIONS[node.type] ?? [];

  const updateConfig = (key: string, value: any) => {
    onUpdate({ config: { ...node.config, [key]: value } });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(203,190,255,0.1)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
        >
          <Icon className="w-4 h-4" style={{ color: colors.icon }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold truncate" style={{ color: "#e5e2e1" }}>{node.label}</p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: colors.icon }}>{node.type}</p>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ color: "#938e9e", background: "rgba(255,255,255,0.04)" }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Fields */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Label */}
        <div>
          <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Nombre del nodo</label>
          <input
            value={node.label}
            onChange={e => onUpdate({ label: e.target.value })}
            className="w-full px-3 py-2 rounded-xl text-[12px] outline-none transition-all"
            style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Descripción</label>
          <input
            value={node.description ?? ""}
            onChange={e => onUpdate({ description: e.target.value })}
            placeholder="Descripción opcional..."
            className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
            style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
          />
        </div>

        {/* Type-specific config */}
        {(node.type === "email") && (
          <>
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Asunto</label>
              <input
                value={node.config.subject ?? ""}
                onChange={e => updateConfig("subject", e.target.value)}
                placeholder="Asunto del email..."
                className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Cuerpo del email</label>
              <textarea
                value={node.config.body ?? ""}
                onChange={e => updateConfig("body", e.target.value)}
                placeholder="Contenido del email..."
                rows={4}
                className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
                style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
              />
            </div>
          </>
        )}

        {(node.type === "whatsapp" || node.type === "sms") && (
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Mensaje</label>
            <textarea
              value={node.config.message ?? ""}
              onChange={e => updateConfig("message", e.target.value)}
              placeholder="Escribe el mensaje..."
              rows={4}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
              style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
            />
          </div>
        )}

        {node.type === "call" && (
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Script de llamada</label>
            <textarea
              value={node.config.message ?? ""}
              onChange={e => updateConfig("message", e.target.value)}
              placeholder="Script para la llamada..."
              rows={5}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
              style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
            />
          </div>
        )}

        {node.type === "wait" && (
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Duración</label>
              <input
                type="number"
                min={1}
                value={node.config.duration ?? 1}
                onChange={e => updateConfig("duration", parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Unidad</label>
              <select
                value={node.config.unit ?? "days"}
                onChange={e => updateConfig("unit", e.target.value)}
                className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
              >
                <option value="minutes">Minutos</option>
                <option value="hours">Horas</option>
                <option value="days">Días</option>
              </select>
            </div>
          </div>
        )}

        {node.type === "condition" && (
          <>
            <div>
              <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Condición</label>
              <input
                value={node.config.condition ?? ""}
                onChange={e => updateConfig("condition", e.target.value)}
                placeholder="¿Respondió el lead?"
                className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
                onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Label "Sí"</label>
                <input
                  value={node.config.yes_label ?? "Sí"}
                  onChange={e => updateConfig("yes_label", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                  style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
                />
              </div>
              <div className="flex-1">
                <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Label "No"</label>
                <input
                  value={node.config.no_label ?? "No"}
                  onChange={e => updateConfig("no_label", e.target.value)}
                  className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
                  style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
                />
              </div>
            </div>
          </>
        )}

        {node.type === "tag" && (
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Nombre del tag</label>
            <input
              value={node.config.tag_name ?? ""}
              onChange={e => updateConfig("tag_name", e.target.value)}
              placeholder="cliente-nuevo, interesado, etc."
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
              style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
            />
          </div>
        )}

        {node.type === "note" && (
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Nota interna</label>
            <textarea
              value={node.config.message ?? ""}
              onChange={e => updateConfig("message", e.target.value)}
              placeholder="Nota para el equipo..."
              rows={4}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none resize-none"
              style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
              onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
              onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
            />
          </div>
        )}

        {node.type === "trigger" && (
          <div>
            <label className="block text-[11px] font-medium mb-1.5" style={{ color: "#938e9e" }}>Tipo de disparador</label>
            <select
              value={node.config.trigger_type ?? "lead_nuevo"}
              onChange={e => updateConfig("trigger_type", e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-[12px] outline-none"
              style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
            >
              <option value="lead_nuevo">Lead nuevo</option>
              <option value="formulario">Formulario enviado</option>
              <option value="manual">Inicio manual</option>
              <option value="webhook">Webhook externo</option>
              <option value="tag">Tag asignado</option>
            </select>
          </div>
        )}

        {/* Integrations */}
        {integrations.length > 0 && (
          <div>
            <label className="block text-[11px] font-medium mb-2" style={{ color: "#938e9e" }}>Integraciones disponibles</label>
            <div className="flex flex-wrap gap-1.5">
              {integrations.map(integ => (
                <span
                  key={integ}
                  className="text-[11px] px-2 py-1 rounded-lg"
                  style={{
                    background: "rgba(203,190,255,0.08)",
                    border: "1px solid rgba(203,190,255,0.15)",
                    color: "#cbbeff",
                  }}
                >
                  {integ}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Ask agent */}
        <button
          onClick={() => onAskAgent(`Dame recomendaciones de integración para un nodo de tipo "${node.type}" llamado "${node.label}". ¿Cuál es la mejor herramienta para conectarlo?`)}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-medium transition-all"
          style={{ background: "rgba(203,190,255,0.06)", border: "1px solid rgba(203,190,255,0.15)", color: "rgba(203,190,255,0.7)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.12)";
            (e.currentTarget as HTMLElement).style.color = "#cbbeff";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "rgba(203,190,255,0.7)";
          }}
        >
          <Bot className="w-3.5 h-3.5" />
          Pedir al agente opciones
        </button>
      </div>

      {/* Delete */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid rgba(203,190,255,0.1)" }}>
        <button
          onClick={onDelete}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-medium transition-all"
          style={{ background: "rgba(255,180,171,0.08)", border: "1px solid rgba(255,180,171,0.15)", color: "#ffb4ab" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,180,171,0.14)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,180,171,0.08)")}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Eliminar nodo
        </button>
      </div>
    </div>
  );
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────

function ChatPanel({
  messages,
  input,
  loading,
  chatEndRef,
  onInputChange,
  onSend,
}: {
  messages: ChatMessage[];
  input: string;
  loading: boolean;
  chatEndRef: React.RefObject<HTMLDivElement>;
  onInputChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(203,190,255,0.1)" }}
      >
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(203,190,255,0.1)", border: "1px solid rgba(203,190,255,0.2)" }}
        >
          <Bot className="w-4 h-4" style={{ color: "#cbbeff" }} />
        </div>
        <div>
          <p className="text-[13px] font-semibold" style={{ color: "#e5e2e1" }}>Agente Workflows</p>
          <p className="text-[10px]" style={{ color: "#938e9e" }}>IA experta en automatización</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[90%] rounded-2xl px-3 py-2.5 text-[12px] leading-relaxed"
              style={{
                background: msg.role === "user" ? "rgba(203,190,255,0.15)" : "#201f1f",
                border: msg.role === "user" ? "1px solid rgba(203,190,255,0.25)" : "1px solid rgba(203,190,255,0.08)",
                color: "#e5e2e1",
              }}
            >
              <ChatMessageContent content={msg.content} />
              {msg.workflowApplied && (
                <div
                  className="flex items-center gap-1.5 mt-2 pt-2 text-[10px] font-semibold"
                  style={{ borderTop: "1px solid rgba(203,190,255,0.12)", color: "#4ade80" }}
                >
                  <Check className="w-3 h-3" />
                  Workflow generado en el canvas
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div
              className="px-3 py-2.5 rounded-2xl flex items-center gap-2 text-[12px]"
              style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.08)", color: "#938e9e" }}
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Generando...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid rgba(203,190,255,0.1)" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Pide un workflow, estrategia..."
            className="flex-1 px-3 py-2 rounded-xl text-[12px] outline-none"
            style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.12)", color: "#e5e2e1" }}
            onFocus={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.35)")}
            onBlur={e => (e.currentTarget.style.borderColor = "rgba(203,190,255,0.12)")}
          />
          <button
            onClick={onSend}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
            style={{
              background: input.trim() && !loading ? "linear-gradient(90deg, #cbbeff 0%, #9d85ff 100%)" : "rgba(203,190,255,0.1)",
              color: input.trim() && !loading ? "#1e0061" : "rgba(203,190,255,0.3)",
            }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ChatMessageContent ───────────────────────────────────────────────────────
// Simple markdown-lite renderer for bold (**text**) and line breaks

function ChatMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/\*\*(.*?)\*\*/g);
        return (
          <p key={i}>
            {parts.map((part, j) =>
              j % 2 === 1 ? <strong key={j} style={{ color: "#cbbeff" }}>{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
}
