import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  FileSignature, TrendingUp, Layers,
  Clock, ArrowRight, Sparkles,
} from "lucide-react";
import QuickAccessCard from "@/components/dashboard/QuickAccessCard";
import CompetitorSpyCard from "@/components/dashboard/CompetitorSpyCard";
import PlansCard from "@/components/dashboard/PlansCard";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hrs   = Math.floor(mins / 60);
  const days  = Math.floor(hrs / 24);
  if (days > 0)  return `hace ${days}d`;
  if (hrs > 0)   return `hace ${hrs}h`;
  if (mins > 0)  return `hace ${mins}m`;
  return "ahora mismo";
}

function getUsageMessage(proposalCount: number, agentCount: number, hasProfile: boolean): string {
  if (!hasProfile) return "Configura tu Perfil de Marca para que los agentes IA conozcan tu negocio y generen contenido personalizado.";
  if (proposalCount === 0 && agentCount < 3) return "Empieza generando tu primera propuesta comercial o chatea con cualquier agente IA.";
  if (proposalCount > 5) return `Has generado ${proposalCount} propuestas. Tus agentes IA están listos para escalar tu estrategia de marketing.`;
  if (agentCount > 10) return `${agentCount} interacciones con los agentes registradas. Tu workspace está activo y creciendo.`;
  return "Tus agentes IA tienen el contexto de tu marca. Crea contenido, analiza competencia y escala tu negocio.";
}

// ─── Metric card colors ────────────────────────────────────────────────────────

const metricCards = [
  { key: "proposals", label: "Propuestas",    icon: FileSignature, accent: "#cbbeff" },
  { key: "agents",    label: "Agentes activos", icon: Sparkles,    accent: "#4ade80" },
  { key: "contexts",  label: "Contextos config.", icon: Layers,    accent: "#60a5fa" },
  { key: "activity",  label: "Actividad reciente", icon: TrendingUp, accent: "#fb923c" },
];

// ─── Agent labels ─────────────────────────────────────────────────────────────

const AGENT_LABELS: Record<string, string> = {
  social: "Social Media", guiones: "Guiones", blog: "Blog", seo: "SEO Rápido",
  anuncios: "Anuncios", competencia: "Spy Competencia", emails: "Email Marketing",
  hooks: "Hooks", repurposing: "Repurposing", calendario: "Calendario",
};

const AGENT_ICONS: Record<string, string> = {
  social: "📱", guiones: "🎬", blog: "📝", seo: "🔍",
  anuncios: "📢", competencia: "🕵️", emails: "📧",
  hooks: "⚡", repurposing: "♻️", calendario: "📅",
};

function statusColor(status: string) {
  if (status === "sent")      return { bg: "rgba(74,222,128,0.1)",    text: "#4ade80",  label: "ENVIADA" };
  if (status === "draft")     return { bg: "rgba(203,190,255,0.1)",   text: "#cbbeff",  label: "BORRADOR" };
  if (status === "viewed")    return { bg: "rgba(96,165,250,0.1)",    text: "#60a5fa",  label: "VISTA" };
  if (status === "accepted")  return { bg: "rgba(74,222,128,0.15)",   text: "#4ade80",  label: "ACEPTADA" };
  if (status === "rejected")  return { bg: "rgba(255,180,171,0.1)",   text: "#ffb4ab",  label: "RECHAZADA" };
  return { bg: "rgba(255,255,255,0.06)", text: "#938e9e", label: status.toUpperCase() };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Parallel data fetching
  const [profileRes, proposalsRes, contextsRes] = await Promise.all([
    supabase.from("brand_profiles").select("brand_name, industry, tone_of_voice").eq("user_id", user?.id ?? "").maybeSingle(),
    supabase.from("proposals").select("id, client_name, industry, status, created_at").eq("user_id", user?.id ?? "").order("created_at", { ascending: false }).limit(5),
    supabase.from("agent_contexts").select("agent_type, updated_at").eq("user_id", user?.id ?? ""),
  ]);

  const profile       = profileRes.data;
  const proposals     = proposalsRes.data ?? [];
  const contexts      = contextsRes.data ?? [];
  const hasProfile    = !!profile?.brand_name;

  const proposalCount = proposals.length;
  const agentCount    = contexts.length;

  const username  = user?.email ? user.email.split("@")[0] : "Usuario";
  const usageMsg  = getUsageMessage(proposalCount, agentCount, hasProfile);

  // Build recent activity combining proposals + agent contexts
  type ActivityItem = { type: string; label: string; sub: string; time: string; emoji: string; status?: string; href: string };
  const activity: ActivityItem[] = [
    ...proposals.slice(0, 3).map(p => ({
      type:   "proposal",
      label:  `Propuesta: ${p.client_name || "Sin nombre"}`,
      sub:    p.industry || "General",
      time:   timeAgo(p.created_at),
      emoji:  "📄",
      status: p.status,
      href:   "/dashboard/propuestas",
    })),
    ...contexts.slice(0, 3).map(c => ({
      type:  "agent",
      label: AGENT_LABELS[c.agent_type] || c.agent_type,
      sub:   "Contexto configurado",
      time:  timeAgo(c.updated_at),
      emoji: AGENT_ICONS[c.agent_type] || "🤖",
      href:  `/dashboard/${c.agent_type}`,
    })),
  ]
    .sort((a, b) => {
      // Sort by recency — approximate from label (already timeAgo'd, rough)
      return 0; // keep insertion order (proposals first, contexts after)
    })
    .slice(0, 5);

  // Metrics values
  const metrics = {
    proposals: { value: proposalCount.toString(), trend: proposalCount > 0 ? `${proposalCount} generadas` : "Sin propuestas aún", positive: proposalCount > 0 },
    agents:    { value: `${agentCount}/10`,    trend: agentCount > 0 ? `${agentCount} configurados` : "Sin contexto aún", positive: agentCount > 0 },
    contexts:  { value: hasProfile ? "Listo" : "Pendiente", trend: hasProfile ? "Marca configurada" : "Configura tu perfil", positive: hasProfile },
    activity:  { value: `${proposalCount + agentCount}`, trend: "acciones registradas", positive: (proposalCount + agentCount) > 0 },
  };

  return (
    <div className="p-8 min-h-screen" style={{ background: "#131313" }}>
      <div className="max-w-[960px] mx-auto space-y-6">

        {/* ── Row 1: Hero + Quick Access ── */}
        <div className="grid grid-cols-3 gap-5" style={{ minHeight: "220px" }}>
          {/* Welcome banner */}
          <div
            className="col-span-2 relative flex flex-col justify-between p-8 rounded-2xl overflow-hidden"
            style={{ background: "#1c1b1b" }}
          >
            {/* Decorative blur */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                top: "-20%", right: "-5%", width: "400px", height: "360px",
                background: "rgba(203,190,255,0.08)",
                filter: "blur(60px)",
              }}
            />

            <div className="relative space-y-2">
              <h1 className="font-extrabold text-[32px] text-white tracking-tight leading-tight">
                Bienvenido, <span style={{ color: "#cbbeff" }}>{username}.</span>
              </h1>
              <p className="text-[15px] leading-relaxed max-w-[460px]" style={{ color: "#cac4d5" }}>
                {usageMsg}
              </p>
            </div>

            <div className="relative flex items-center gap-3 mt-6">
              <Link
                href="/dashboard/propuestas"
                className="px-5 py-2 rounded-lg font-bold text-[13px] text-black transition-all"
                style={{ background: "white" }}
              >
                Ver propuestas
              </Link>
              {!hasProfile && (
                <Link
                  href="/dashboard/perfil"
                  className="px-5 py-2 rounded-lg font-bold text-[13px] transition-all"
                  style={{ background: "#353534", color: "white" }}
                >
                  Configurar marca
                </Link>
              )}
              {hasProfile && (
                <Link
                  href="/dashboard/hooks"
                  className="px-5 py-2 rounded-lg font-bold text-[13px] transition-all"
                  style={{ background: "#353534", color: "white" }}
                >
                  Crear contenido
                </Link>
              )}
            </div>
          </div>

          {/* Quick Access card */}
          <div className="col-span-1" style={{ minHeight: "220px" }}>
            <QuickAccessCard defaultToolId="hooks" />
          </div>
        </div>

        {/* ── Row 2: 4 Metric Cards ── */}
        <div className="grid grid-cols-4 gap-4">
          {metricCards.map((card) => {
            const m = metrics[card.key as keyof typeof metrics];
            const Icon = card.icon;
            return (
              <div
                key={card.key}
                className="flex flex-col gap-1 p-6 rounded-2xl"
                style={{
                  background: "#201f1f",
                  borderLeft: `3px solid ${card.accent}`,
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[1px]"
                    style={{ color: "#938e9e" }}
                  >
                    {card.label}
                  </span>
                  <Icon className="w-3.5 h-3.5" style={{ color: card.accent }} />
                </div>
                <div className="font-bold text-[24px] text-white leading-tight">{m.value}</div>
                <div className="flex items-center gap-1 mt-1">
                  <span
                    className="text-[10px]"
                    style={{ color: m.positive ? "#4ade80" : "#938e9e" }}
                  >
                    {m.trend}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Row 3: Activity + Right column ── */}
        <div className="grid grid-cols-3 gap-5">

          {/* Recent Activity (2/3) */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-bold text-[16px] text-white">Actividad Reciente</h2>
              <Link
                href="/dashboard/propuestas"
                className="text-[12px] font-medium transition-colors"
                style={{ color: "rgba(203,190,255,0.7)" }}
              >
                Ver todo →
              </Link>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: "#1c1b1b" }}>
              {activity.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Clock className="w-8 h-8" style={{ color: "#484553" }} />
                  <p className="text-[13px]" style={{ color: "#938e9e" }}>Sin actividad todavía</p>
                  <Link
                    href="/dashboard/hooks"
                    className="text-[12px] font-medium"
                    style={{ color: "#cbbeff" }}
                  >
                    Empieza con el generador de hooks →
                  </Link>
                </div>
              ) : (
                <div>
                  {activity.map((item, i) => {
                    const sc = item.status ? statusColor(item.status) : null;
                    return (
                      <Link
                        key={i}
                        href={item.href}
                        className="flex items-center gap-4 px-5 py-4 transition-all group"
                        style={{
                          borderBottom: i < activity.length - 1 ? "1px solid rgba(72,69,83,0.15)" : "none",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.02)")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        {/* Emoji icon */}
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        >
                          {item.emoji}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13.5px] truncate" style={{ color: "#e5e2e1" }}>
                            {item.label}
                          </p>
                          <p className="text-[12px]" style={{ color: "#938e9e" }}>
                            {item.sub} · {item.time}
                          </p>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {sc && (
                            <span
                              className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                              style={{ background: sc.bg, color: sc.text }}
                            >
                              {sc.label}
                            </span>
                          )}
                          <ArrowRight
                            className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ color: "#cbbeff" }}
                          />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent agents accessed */}
            {contexts.length > 0 && (
              <div>
                <h3 className="font-bold text-[13px] uppercase tracking-wider mb-3 px-1" style={{ color: "#938e9e" }}>
                  Agentes configurados
                </h3>
                <div className="flex flex-wrap gap-2">
                  {contexts.slice(0, 8).map(c => (
                    <Link
                      key={c.agent_type}
                      href={`/dashboard/${c.agent_type}`}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all"
                      style={{
                        background: "#1c1b1b",
                        color: "#cac4d5",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(203,190,255,0.25)";
                        (e.currentTarget as HTMLElement).style.color = "#cbbeff";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLElement).style.color = "#cac4d5";
                      }}
                    >
                      <span>{AGENT_ICONS[c.agent_type] || "🤖"}</span>
                      {AGENT_LABELS[c.agent_type] || c.agent_type}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column (1/3) */}
          <div className="col-span-1 flex flex-col gap-5">

            {/* Competitor Spy */}
            <CompetitorSpyCard
              brandName={profile?.brand_name ?? "Tu Marca"}
              industry={profile?.industry ?? "marketing"}
            />

            {/* Plans & Upgrade card */}
            <PlansCard />
          </div>
        </div>
      </div>
    </div>
  );
}
