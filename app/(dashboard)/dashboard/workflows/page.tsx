"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Zap, Mail, MessageCircle, Smartphone, Phone, Clock, GitBranch, Tag, StickyNote,
  Plus, Trash2, Send, Bot, X, Play, Square, Save, ArrowLeft,
  Workflow, Pencil, Check, MoreHorizontal, Loader2, AlertTriangle,
  AlertCircle, Lightbulb, ChevronRight,
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

interface ValidationResult {
  id: string;
  type: "error" | "warning" | "tip";
  message: string;
  fix?: {
    label: string;
    nodes: WorkflowNode[];
  };
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

// ─── Plantillas predefinidas ──────────────────────────────────────────────────

const WORKFLOW_TEMPLATES = [
  {
    name: "Recontacto 3 días",
    description: "Ideal para leads fríos que no respondieron",
    icon: "🔁",
    nodes: [
      { id: "t1", type: "trigger" as const, label: "Lead sin respuesta", description: "El lead no respondió en 3 días", config: { trigger_type: "manual" }, integrations: ["HubSpot", "Pipedrive"] },
      { id: "t2", type: "whatsapp" as const, label: "WhatsApp recordatorio", description: "Mensaje amigable recordando la conversación", config: { message: "Hola [nombre], quería saber si pudiste revisar lo que te compartí. ¿Tienes alguna pregunta?" }, integrations: ["ManyChat", "WATI", "Twilio"] },
      { id: "t3", type: "wait" as const, label: "Esperar 1 día", config: { duration: 1, unit: "days" }, integrations: [] },
      { id: "t4", type: "email" as const, label: "Email de seguimiento", description: "Email con más información o propuesta de valor", config: { subject: "¿Podemos ayudarte?", body: "Hola [nombre], te escribo para ver si tienes dudas sobre nuestros servicios..." }, integrations: ["SendGrid", "Mailchimp"] },
      { id: "t5", type: "wait" as const, label: "Esperar 2 días", config: { duration: 2, unit: "days" }, integrations: [] },
      { id: "t6", type: "condition" as const, label: "¿Respondió?", config: { condition: "¿El lead respondió?", yes_label: "Sí respondió", no_label: "Sin respuesta" }, integrations: [] },
    ],
  },
  {
    name: "Lead Meta → WhatsApp + Email",
    description: "Para leads que vienen de Facebook/Instagram Ads",
    icon: "📱",
    nodes: [
      { id: "m1", type: "trigger" as const, label: "Lead de Meta Ads", description: "Lead capturado desde Facebook o Instagram", config: { trigger_type: "meta_lead" }, integrations: ["Meta Lead Ads", "Zapier", "ManyChat"] },
      { id: "m2", type: "whatsapp" as const, label: "WhatsApp inmediato", description: "Contacto en los primeros 5 minutos — clave para conversión", config: { message: "Hola [nombre], recibí tu solicitud de información. ¿Tienes 5 minutos para contarme qué necesitas?" }, integrations: ["ManyChat", "WATI", "Respond.io"] },
      { id: "m3", type: "wait" as const, label: "Esperar 30 min", config: { duration: 30, unit: "minutes" }, integrations: [] },
      { id: "m4", type: "condition" as const, label: "¿Respondió en WhatsApp?", config: { condition: "¿Respondió el WhatsApp?", yes_label: "Sí → continuar", no_label: "No → email" }, integrations: [] },
      { id: "m5", type: "tag" as const, label: "Capturar Email", description: "Pide el email en la conversación o recupéralo del formulario de Meta", config: { tag_name: "email_capturado" }, integrations: ["HubSpot", "ActiveCampaign"] },
      { id: "m6", type: "email" as const, label: "Email de bienvenida", description: "Email con propuesta de valor y próximos pasos", config: { subject: "¡Hola [nombre]! Aquí está lo que necesitas saber", body: "Gracias por tu interés..." }, integrations: ["SendGrid", "Mailchimp", "ActiveCampaign"] },
    ],
  },
  {
    name: "Nurturing post-demo",
    description: "Para prospectos que vieron una demo pero no cerraron",
    icon: "🎯",
    nodes: [
      { id: "n1", type: "trigger" as const, label: "Demo completada", description: "El prospecto vio la demo pero no compró", config: { trigger_type: "demo_done" }, integrations: ["HubSpot", "Calendly"] },
      { id: "n2", type: "email" as const, label: "Email post-demo", description: "Resumen de la demo y propuesta formal", config: { subject: "Resumen de nuestra reunión", body: "Fue un placer hablar contigo..." }, integrations: ["SendGrid", "Mailchimp"] },
      { id: "n3", type: "wait" as const, label: "Esperar 2 días", config: { duration: 2, unit: "days" }, integrations: [] },
      { id: "n4", type: "whatsapp" as const, label: "WhatsApp seguimiento", description: "Seguimiento casual para resolver dudas", config: { message: "Hola [nombre], ¿pudiste revisar la propuesta? ¿Tienes alguna pregunta?" }, integrations: ["WATI", "ManyChat"] },
      { id: "n5", type: "wait" as const, label: "Esperar 3 días", config: { duration: 3, unit: "days" }, integrations: [] },
      { id: "n6", type: "condition" as const, label: "¿Interesado?", config: { condition: "¿Mostró interés?", yes_label: "Sí → cerrar", no_label: "No → último intento" }, integrations: [] },
      { id: "n7", type: "call" as const, label: "Llamada de cierre", description: "Última llamada para resolver objeciones y cerrar", config: { message: "Script: Hola [nombre], te llamo para ver si podemos avanzar juntos..." }, integrations: ["Aircall", "JustCall", "Twilio"] },
    ],
  },
  {
    name: "Onboarding nuevo cliente",
    description: "Para clientes que acaban de cerrar contrato",
    icon: "🎉",
    nodes: [
      { id: "o1", type: "trigger" as const, label: "Contrato firmado", description: "El cliente acaba de cerrar", config: { trigger_type: "deal_won" }, integrations: ["HubSpot", "Pipedrive", "Salesforce"] },
      { id: "o2", type: "email" as const, label: "Email de bienvenida", description: "Bienvenida oficial con próximos pasos y recursos", config: { subject: "¡Bienvenido a bordo, [nombre]!", body: "Estamos emocionados de trabajar contigo..." }, integrations: ["SendGrid", "Mailchimp"] },
      { id: "o3", type: "tag" as const, label: "Etiquetar como Cliente", description: "Cambia el estado en tu CRM de lead a cliente activo", config: { tag_name: "cliente_activo" }, integrations: ["HubSpot", "Pipedrive", "Notion"] },
      { id: "o4", type: "wait" as const, label: "Esperar 1 día", config: { duration: 1, unit: "days" }, integrations: [] },
      { id: "o5", type: "whatsapp" as const, label: "WhatsApp de confirmación", description: "Mensaje personal confirmando el inicio del trabajo", config: { message: "Hola [nombre], ¡qué emoción empezar a trabajar juntos! Mañana te contactamos para coordinar el kickoff." }, integrations: ["WATI", "ManyChat"] },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId() {
  return `node_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Validación ───────────────────────────────────────────────────────────────

function validateWorkflow(nodes: WorkflowNode[]): ValidationResult[] {
  const results: ValidationResult[] = [];

  if (nodes.length === 0) return results;

  // 1. Sin trigger al inicio
  const hasTrigger = nodes.some(n => n.type === "trigger");
  if (!hasTrigger) {
    const fixNodes: WorkflowNode[] = [
      { id: genId(), type: "trigger", label: "Lead nuevo", description: "Punto de inicio del workflow", config: { trigger_type: "lead_nuevo" }, integrations: DEFAULT_INTEGRATIONS.trigger },
      ...nodes,
    ];
    results.push({
      id: "no_trigger",
      type: "error",
      message: "Tu workflow no tiene un punto de inicio. ¿Cómo llegarán los leads?",
      fix: { label: "Agregar trigger al inicio", nodes: fixNodes },
    });
  }

  // 2. Email sin captura previa
  const emailIndex = nodes.findIndex(n => n.type === "email");
  if (emailIndex !== -1) {
    const nodesBeforeEmail = nodes.slice(0, emailIndex);
    const hasEmailSource = nodesBeforeEmail.some(n => {
      if (n.type === "trigger") {
        const tt = n.config?.trigger_type ?? "";
        return tt.includes("form") || tt.includes("email") || tt.includes("meta");
      }
      if (n.type === "tag") {
        const tn = (n.config?.tag_name ?? "").toLowerCase();
        return tn.includes("email") || tn.includes("correo");
      }
      return false;
    });
    if (!hasEmailSource) {
      const captureNode: WorkflowNode = {
        id: genId(),
        type: "tag",
        label: "Capturar Email",
        description: "Asegúrate de tener el email antes de este paso. Usa un formulario o tu CRM.",
        config: { tag_name: "email_capturado" },
        integrations: ["HubSpot", "ActiveCampaign"],
      };
      const fixNodes = [...nodes];
      fixNodes.splice(emailIndex, 0, captureNode);
      results.push({
        id: "email_no_capture",
        type: "warning",
        message: "Estás enviando un email pero no hay un paso donde captures el email del contacto. Sin el email, este paso no funcionará.",
        fix: { label: "Insertar paso de captura de email", nodes: fixNodes },
      });
    }
  }

  // 3. WhatsApp sin número
  const actionNodes = nodes.filter(n => ["email", "whatsapp", "sms", "call"].includes(n.type));
  const firstAction = actionNodes[0];
  if (firstAction?.type === "whatsapp") {
    const triggerNode = nodes.find(n => n.type === "trigger");
    if (triggerNode) {
      const tt = triggerNode.config?.trigger_type ?? "";
      const hasPhone = tt.includes("meta") || tt.includes("whatsapp") || tt.includes("phone");
      if (!hasPhone) {
        results.push({
          id: "whatsapp_no_number",
          type: "warning",
          message: "Para enviar WhatsApp necesitas tener el número del contacto. ¿Tu fuente de leads te lo proporciona?",
        });
      }
    }
  }

  // 4. Dos acciones seguidas sin espera
  const actionTypes = new Set(["email", "whatsapp", "sms", "call"]);
  for (let i = 0; i < nodes.length - 1; i++) {
    if (actionTypes.has(nodes[i].type) && actionTypes.has(nodes[i + 1].type)) {
      const waitNode: WorkflowNode = {
        id: genId(),
        type: "wait",
        label: "Esperar 1 día",
        config: { duration: 1, unit: "days" },
        integrations: [],
      };
      const fixNodes = [...nodes];
      fixNodes.splice(i + 1, 0, waitNode);
      results.push({
        id: `consecutive_actions_${i}`,
        type: "warning",
        message: `Estás enviando dos mensajes seguidos sin esperar. Esto puede parecer spam. Te recomendamos esperar al menos 1 día entre mensajes.`,
        fix: { label: "Insertar espera de 1 día", nodes: fixNodes },
      });
      break; // report only first occurrence
    }
  }

  // 5. Workflow termina en condición
  const lastNode = nodes[nodes.length - 1];
  if (lastNode?.type === "condition") {
    results.push({
      id: "ends_in_condition",
      type: "warning",
      message: "Tu workflow termina en una condición sin definir qué pasa en cada rama. Agrega pasos para el camino 'Sí' y para el 'No'.",
    });
  }

  // 6. Sin ninguna acción
  const hasAction = nodes.some(n => actionTypes.has(n.type));
  if (!hasAction) {
    results.push({
      id: "no_action",
      type: "error",
      message: "Tu workflow no tiene ninguna acción de comunicación. Agrega un Email, WhatsApp, SMS o Llamada.",
    });
  }

  return results;
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
    {
      role: "assistant",
      content: "¡Hola! Soy tu agente de workflows, aquí para ayudarte a crear automaciones de ventas que realmente funcionen.\n\n¿Eres nuevo en esto? No te preocupes — puedo guiarte paso a paso.\n\nPuedo ayudarte a:\n• **Crear un workflow desde cero** para tu negocio específico\n• **Optimizar** el workflow que ya tienes en el canvas\n• **Explicar** qué hace cada tipo de nodo y cuándo usarlo\n• **Recomendar** las mejores herramientas para cada paso\n\n¿Por dónde quieres empezar?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [validations, setValidations] = useState<ValidationResult[]>([]);
  const [dismissedValidations, setDismissedValidations] = useState<Set<string>>(new Set());
  const [insertPopover, setInsertPopover] = useState<{ open: boolean; afterIndex: number | null }>({ open: false, afterIndex: null });
  const [onboardingChoice, setOnboardingChoice] = useState<null | "agent" | "template" | "scratch">(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

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

  // Validación reactiva
  useEffect(() => {
    if (nodes.length > 0) {
      const results = validateWorkflow(nodes);
      setValidations(results);
    } else {
      setValidations([]);
    }
    setDismissedValidations(new Set()); // reset dismissals on node change
  }, [nodes]);

  // Cerrar popover al hacer click afuera
  useEffect(() => {
    if (!insertPopover.open) return;
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setInsertPopover({ open: false, afterIndex: null });
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [insertPopover.open]);

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
    setInsertPopover({ open: false, afterIndex: null });
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
    setOnboardingChoice(null);
    setView("builder");
  };

  const newWorkflow = () => {
    setCurrentWorkflow(null);
    setNodes([]);
    setWorkflowName("Nuevo Workflow");
    setSelectedNode(null);
    setOnboardingChoice(null);
    setView("builder");
  };

  // ── Delete workflow ──

  const deleteWorkflow = async (id: string) => {
    await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    setWorkflows(prev => prev.filter(w => w.id !== id));
  };

  // ── Chat ──

  const sendMessage = useCallback(async (text?: string) => {
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
            setOnboardingChoice("scratch"); // exit onboarding once agent sets nodes
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
          setChatMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: parts[0].trim() };
            return updated;
          });
        }
      }
    } catch {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Error al conectar con el agente. Intenta de nuevo." }]);
    } finally {
      setChatLoading(false);
    }
  }, [chatInput, chatLoading, chatMessages, nodes]);

  // ─── Views ────────────────────────────────────────────────────────────────

  if (view === "list") {
    return <WorkflowList workflows={workflows} loading={loadingList} onNew={newWorkflow} onLoad={loadWorkflow} onDelete={deleteWorkflow} />;
  }

  const visibleValidations = validations.filter(v => !dismissedValidations.has(v.id));

  const applyTemplate = (tpl: typeof WORKFLOW_TEMPLATES[0]) => {
    setNodes(tpl.nodes as WorkflowNode[]);
    setWorkflowName(tpl.name);
    setOnboardingChoice("scratch");
  };

  const handleOnboardingAgent = () => {
    setOnboardingChoice("agent");
    sendMessage("Hola, no sé nada de workflows de ventas. ¿Puedes guiarme paso a paso para crear mi primer workflow?");
  };

  const isCanvasEmpty = nodes.length === 0;
  const showOnboarding = isCanvasEmpty && onboardingChoice === null;

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

      {/* Validation bar */}
      {visibleValidations.length > 0 && (
        <div
          className="flex-shrink-0 px-4 py-2 space-y-1.5"
          style={{ borderBottom: "1px solid rgba(203,190,255,0.08)", background: "rgba(20,19,19,0.8)" }}
        >
          {visibleValidations.map(v => (
            <ValidationBanner
              key={v.id}
              validation={v}
              onDismiss={() => setDismissedValidations(prev => { const s = new Set(prev); s.add(v.id); return s; })}
              onApplyFix={(fixNodes) => { setNodes(fixNodes); }}
            />
          ))}
        </div>
      )}

      {/* Builder body */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Node Palette ── */}
        {(!showOnboarding || onboardingChoice === "scratch") && (
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
                        className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left transition-all"
                        style={{ border: "1px solid rgba(203,190,255,0.06)", background: "rgba(255,255,255,0.02)" }}
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
        )}

        {/* ── Canvas ── */}
        <div className="flex-1 overflow-y-auto" style={{ background: "#131313" }}>
          {showOnboarding ? (
            <OnboardingScreen
              onAgent={handleOnboardingAgent}
              onTemplate={(tpl) => applyTemplate(tpl)}
              onScratch={() => {
                setOnboardingChoice("scratch");
                addNode("trigger", "Lead nuevo");
              }}
            />
          ) : (
            <div className="px-8 py-6">
              {nodes.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: "rgba(203,190,255,0.06)", border: "1px dashed rgba(203,190,255,0.2)" }}
                  >
                    <GitBranch className="w-7 h-7" style={{ color: "rgba(203,190,255,0.3)" }} />
                  </div>
                  <p className="text-[14px] font-medium mb-1" style={{ color: "#e5e2e1" }}>Canvas vacío</p>
                  <p className="text-[12px] mb-6 max-w-xs" style={{ color: "#938e9e" }}>
                    Agrega nodos desde la paleta izquierda o pídele al agente que genere un workflow.
                  </p>
                  <button
                    onClick={() => addNode("trigger", "Lead nuevo")}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-semibold"
                    style={{ background: "rgba(203,190,255,0.1)", border: "1px solid rgba(203,190,255,0.2)", color: "#cbbeff" }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Agregar trigger
                  </button>
                </div>
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

                      {/* Connector + Insert button */}
                      <div className="flex justify-center relative h-8">
                        <div className="absolute top-0 bottom-0 left-1/2 w-px" style={{ background: "rgba(203,190,255,0.15)" }} />
                        {/* Insert popover trigger */}
                        <div className="relative z-10 flex items-center justify-center" ref={insertPopover.afterIndex === idx ? popoverRef : undefined}>
                          <button
                            onClick={() => setInsertPopover(prev =>
                              prev.open && prev.afterIndex === idx
                                ? { open: false, afterIndex: null }
                                : { open: true, afterIndex: idx }
                            )}
                            className="w-5 h-5 rounded-full flex items-center justify-center transition-all"
                            style={{ background: "rgba(203,190,255,0.1)", border: "1px solid rgba(203,190,255,0.2)", color: "rgba(203,190,255,0.5)" }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.2)";
                              (e.currentTarget as HTMLElement).style.color = "#cbbeff";
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.1)";
                              (e.currentTarget as HTMLElement).style.color = "rgba(203,190,255,0.5)";
                            }}
                            title="Insertar nodo aquí"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>

                          {/* Popover */}
                          {insertPopover.open && insertPopover.afterIndex === idx && (
                            <InsertPopover
                              afterIndex={idx}
                              onAdd={(type, label) => addNode(type, label, idx)}
                              onClose={() => setInsertPopover({ open: false, afterIndex: null })}
                            />
                          )}
                        </div>
                      </div>
                    </React.Fragment>
                  ))}

                  {/* Add at end */}
                  <div className="relative">
                    <button
                      onClick={() => setInsertPopover(prev =>
                        prev.open && prev.afterIndex === nodes.length - 1
                          ? { open: false, afterIndex: null }
                          : { open: true, afterIndex: nodes.length - 1 }
                      )}
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
                    {insertPopover.open && insertPopover.afterIndex === nodes.length - 1 && (
                      <div ref={popoverRef} className="absolute left-1/2 -translate-x-1/2 z-50 mt-2">
                        <InsertPopover
                          afterIndex={nodes.length - 1}
                          onAdd={(type, label) => addNode(type, label)}
                          onClose={() => setInsertPopover({ open: false, afterIndex: null })}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Chat Panel (siempre visible, fijo 360px) ── */}
        <div
          className="w-[360px] flex-shrink-0 flex flex-col"
          style={{ borderLeft: "1px solid rgba(203,190,255,0.1)", background: "rgba(20,19,19,0.6)" }}
        >
          <ChatPanel
            messages={chatMessages}
            input={chatInput}
            loading={chatLoading}
            chatEndRef={chatEndRef}
            onInputChange={setChatInput}
            onSend={() => sendMessage()}
          />
        </div>
      </div>

      {/* Node Detail Modal */}
      {selectedNode && (
        <NodeDetailModal
          node={selectedNode}
          onUpdate={(changes) => updateNode(selectedNode.id, changes)}
          onDelete={() => { removeNode(selectedNode.id); setSelectedNode(null); }}
          onClose={() => setSelectedNode(null)}
          onAskAgent={(msg) => {
            setSelectedNode(null);
            sendMessage(msg);
          }}
        />
      )}
    </div>
  );
}

// ─── InsertPopover ────────────────────────────────────────────────────────────

function InsertPopover({
  afterIndex: _afterIndex,
  onAdd,
  onClose,
}: {
  afterIndex: number;
  onAdd: (type: WorkflowNode["type"], label: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute left-1/2 -translate-x-1/2 z-50 rounded-2xl p-3 min-w-[260px]"
      style={{ background: "#201f1f", border: "1px solid rgba(203,190,255,0.2)", boxShadow: "0 12px 32px rgba(0,0,0,0.5)", top: "calc(100% + 6px)" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[1.5px] mb-2 px-1" style={{ color: "#938e9e" }}>
        Insertar nodo
      </p>
      {NODE_PALETTE.map(group => (
        <div key={group.group} className="mb-2">
          <p className="text-[9px] uppercase tracking-wider mb-1.5 px-1" style={{ color: "rgba(147,142,158,0.6)" }}>{group.group}</p>
          <div className="grid grid-cols-2 gap-1">
            {group.items.map(item => {
              const Icon = NODE_ICONS[item.type];
              const colors = NODE_COLORS[item.type];
              return (
                <button
                  key={item.label}
                  onClick={() => { onAdd(item.type, item.label); onClose(); }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all"
                  style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(203,190,255,0.06)" }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = colors.bg;
                    (e.currentTarget as HTMLElement).style.borderColor = colors.border;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.06)";
                  }}
                >
                  <div
                    className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                    style={{ background: colors.bg, border: `1px solid ${colors.border}` }}
                  >
                    <Icon className="w-2.5 h-2.5" style={{ color: colors.icon }} />
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: "#e5e2e1" }}>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── ValidationBanner ─────────────────────────────────────────────────────────

function ValidationBanner({
  validation,
  onDismiss,
  onApplyFix,
}: {
  validation: ValidationResult;
  onDismiss: () => void;
  onApplyFix: (nodes: WorkflowNode[]) => void;
}) {
  const iconMap = {
    error: { Icon: AlertCircle, color: "#ff6b6b", bg: "rgba(255,107,107,0.08)", border: "rgba(255,107,107,0.2)" },
    warning: { Icon: AlertTriangle, color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.2)" },
    tip: { Icon: Lightbulb, color: "#60a5fa", bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.2)" },
  };
  const { Icon, color, bg, border } = iconMap[validation.type];

  return (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-[11px]"
      style={{ background: bg, border: `1px solid ${border}` }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <p className="flex-1" style={{ color: "#e5e2e1" }}>{validation.message}</p>
      {validation.fix && (
        <button
          onClick={() => onApplyFix(validation.fix!.nodes)}
          className="flex items-center gap-1 px-2 py-1 rounded-lg font-semibold flex-shrink-0 transition-all"
          style={{ background: "rgba(203,190,255,0.12)", color: "#cbbeff", border: "1px solid rgba(203,190,255,0.2)", fontSize: "10px" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(203,190,255,0.2)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(203,190,255,0.12)")}
        >
          <Check className="w-2.5 h-2.5" />
          {validation.fix.label}
        </button>
      )}
      <button
        onClick={onDismiss}
        className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ color: "rgba(229,226,225,0.3)" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#e5e2e1")}
        onMouseLeave={e => (e.currentTarget.style.color = "rgba(229,226,225,0.3)")}
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}

// ─── OnboardingScreen ─────────────────────────────────────────────────────────

function OnboardingScreen({
  onAgent,
  onTemplate,
  onScratch,
}: {
  onAgent: () => void;
  onTemplate: (tpl: typeof WORKFLOW_TEMPLATES[0]) => void;
  onScratch: () => void;
}) {
  const [showTemplates, setShowTemplates] = useState(false);

  return (
    <div className="flex flex-col items-center justify-center min-h-full px-6 py-12 text-center">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold mb-2" style={{ color: "#e5e2e1" }}>
          ¿Cómo quieres empezar?
        </h2>
        <p className="text-[13px] mb-8" style={{ color: "#938e9e" }}>
          Construye tu workflow de ventas
        </p>

        <div className="space-y-3">
          {/* Agent */}
          <button
            onClick={onAgent}
            className="w-full text-left rounded-2xl p-5 transition-all group"
            style={{ background: "#1c1b1b", border: "1px solid rgba(203,190,255,0.1)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.3)";
              (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.1)";
              (e.currentTarget as HTMLElement).style.background = "#1c1b1b";
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">🤖</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold mb-1" style={{ color: "#e5e2e1" }}>
                  Ayúdame a crear uno
                </p>
                <p className="text-[12px]" style={{ color: "#938e9e" }}>
                  El agente IA te pregunta sobre tu negocio y diseña el workflow perfecto para ti, paso a paso.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#cbbeff" }} />
            </div>
          </button>

          {/* Templates */}
          <div>
            <button
              onClick={() => setShowTemplates(v => !v)}
              className="w-full text-left rounded-2xl p-5 transition-all group"
              style={{ background: "#1c1b1b", border: "1px solid rgba(203,190,255,0.1)" }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.3)";
                (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.04)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.1)";
                (e.currentTarget as HTMLElement).style.background = "#1c1b1b";
              }}
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl flex-shrink-0">⚡</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold mb-1" style={{ color: "#e5e2e1" }}>
                    Usar una plantilla
                  </p>
                  <p className="text-[12px]" style={{ color: "#938e9e" }}>
                    Empieza con una plantilla probada. Elige el caso de uso que más se parezca al tuyo.
                  </p>
                </div>
                <ChevronRight
                  className="w-4 h-4 flex-shrink-0 mt-0.5 transition-all"
                  style={{ color: "#cbbeff", transform: showTemplates ? "rotate(90deg)" : "rotate(0deg)" }}
                />
              </div>
            </button>

            {showTemplates && (
              <div className="mt-2 space-y-2 pl-2">
                {WORKFLOW_TEMPLATES.map(tpl => (
                  <button
                    key={tpl.name}
                    onClick={() => onTemplate(tpl)}
                    className="w-full text-left rounded-xl px-4 py-3 transition-all"
                    style={{ background: "rgba(203,190,255,0.04)", border: "1px solid rgba(203,190,255,0.1)" }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.25)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.08)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.1)";
                      (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.04)";
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{tpl.icon}</span>
                      <div>
                        <p className="text-[12px] font-semibold" style={{ color: "#e5e2e1" }}>{tpl.name}</p>
                        <p className="text-[11px]" style={{ color: "#938e9e" }}>{tpl.description} · {tpl.nodes.length} nodos</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Scratch */}
          <button
            onClick={onScratch}
            className="w-full text-left rounded-2xl p-5 transition-all group"
            style={{ background: "#1c1b1b", border: "1px solid rgba(203,190,255,0.1)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.3)";
              (e.currentTarget as HTMLElement).style.background = "rgba(203,190,255,0.04)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.1)";
              (e.currentTarget as HTMLElement).style.background = "#1c1b1b";
            }}
          >
            <div className="flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">✏️</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold mb-1" style={{ color: "#e5e2e1" }}>
                  Construir desde cero
                </p>
                <p className="text-[12px]" style={{ color: "#938e9e" }}>
                  Empieza con un trigger inicial y construye tu workflow nodo a nodo con la paleta.
                </p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#cbbeff" }} />
            </div>
          </button>
        </div>

        <p className="text-[11px] mt-8 px-4" style={{ color: "rgba(147,142,158,0.7)" }}>
          Más del 70% de los leads se pierden por falta de seguimiento. Un buen workflow lo soluciona.
        </p>
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

      <div>
        <h3 className="text-[14px] font-semibold mb-1" style={{ color: "#e5e2e1" }}>{workflow.name}</h3>
        {workflow.description && (
          <p className="text-[12px] line-clamp-2" style={{ color: "#938e9e" }}>{workflow.description}</p>
        )}
      </div>

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
          <ConfigPreview node={node} />
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

// ─── NodeDetailModal ──────────────────────────────────────────────────────────

function NodeDetailModal({
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

  // Close on backdrop click
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdrop}
    >
      <div
        className="w-full max-w-md rounded-2xl flex flex-col mx-4"
        style={{ background: "#1c1b1b", border: "1px solid rgba(203,190,255,0.15)", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", maxHeight: "85vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
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
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: "#938e9e", background: "rgba(255,255,255,0.04)" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e5e2e1")}
            onMouseLeave={e => (e.currentTarget.style.color = "#938e9e")}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Fields */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
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

          {node.type === "email" && (
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
                <option value="meta_lead">Lead de Meta Ads</option>
                <option value="demo_done">Demo completada</option>
                <option value="deal_won">Contrato firmado</option>
                <option value="tag">Tag asignado</option>
              </select>
            </div>
          )}

          {integrations.length > 0 && (
            <div>
              <label className="block text-[11px] font-medium mb-2" style={{ color: "#938e9e" }}>Integraciones disponibles</label>
              <div className="flex flex-wrap gap-1.5">
                {integrations.map(integ => (
                  <span
                    key={integ}
                    className="text-[11px] px-2 py-1 rounded-lg"
                    style={{ background: "rgba(203,190,255,0.08)", border: "1px solid rgba(203,190,255,0.15)", color: "#cbbeff" }}
                  >
                    {integ}
                  </span>
                ))}
              </div>
            </div>
          )}

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

        {/* Footer */}
        <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: "1px solid rgba(203,190,255,0.1)" }}>
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
  chatEndRef: React.RefObject<HTMLDivElement | null>;
  onInputChange: (v: string) => void;
  onSend: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
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
          <p className="text-[10px]" style={{ color: "#938e9e" }}>IA experta en automatización de ventas</p>
        </div>
      </div>

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

      <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: "1px solid rgba(203,190,255,0.1)" }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSend()}
            placeholder="Pide un workflow, estrategia, consejo..."
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

function ChatMessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
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
