import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Wrench, Plus, MessageSquare, BookOpen, Clock, ArrowRight } from "lucide-react";
import CaseStatusBadge from "@/components/metafix/CaseStatusBadge";
import AreaBadge from "@/components/metafix/AreaBadge";
import type { MetafixCase } from "@/types";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs  = Math.floor(mins / 60);
  const days = Math.floor(hrs / 24);
  if (days > 0) return `hace ${days}d`;
  if (hrs > 0)  return `hace ${hrs}h`;
  if (mins > 0) return `hace ${mins}m`;
  return "ahora mismo";
}

const AREA_SHORTCUTS = [
  { label: "WABA",             area: "waba",             color: "#22c55e" },
  { label: "Meta Ads",         area: "meta_ads",         color: "#3b82f6" },
  { label: "Catálogos",        area: "catalogs",         color: "#f59e0b" },
  { label: "Business Manager", area: "business_manager", color: "#a855f7" },
  { label: "Píxel",            area: "pixel",            color: "#ef4444" },
];

export default async function MetafixPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const [casesRes, kbRes] = await Promise.all([
    supabase
      .from("cases")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("knowledge_base")
      .select("id, slug, title, area, error_codes, difficulty")
      .eq("is_published", true)
      .order("view_count", { ascending: false })
      .limit(4),
  ]);

  const cases = (casesRes.data ?? []) as MetafixCase[];
  const articles = kbRes.data ?? [];

  const openCount     = cases.filter((c) => c.status === "open").length;
  const inProgCount   = cases.filter((c) => c.status === "in_progress").length;
  const resolvedCount = cases.filter((c) => c.status === "resolved").length;

  return (
    <div className="p-6 xl:p-8 min-h-screen space-y-6" style={{ background: "#131313" }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
            <Wrench size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">MetaFix</h1>
            <p className="text-xs text-gray-500">Solucionador de problemas del ecosistema Meta</p>
          </div>
        </div>
        <Link
          href="/dashboard/metafix/chat"
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90"
          style={{ background: "#2563eb" }}
        >
          <Plus size={15} />
          Nuevo caso
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Abiertos",     value: openCount,     color: "#60a5fa" },
          { label: "En progreso",  value: inProgCount,   color: "#facc15" },
          { label: "Resueltos",    value: resolvedCount, color: "#4ade80" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-5 flex flex-col gap-1" style={{ background: "#1c1b1b" }}>
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#938e9e" }}>{s.label}</span>
            <span className="text-3xl font-extrabold" style={{ color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Quick start by area */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "#938e9e" }}>Iniciar caso por área</p>
        <div className="flex flex-wrap gap-2">
          {AREA_SHORTCUTS.map((s) => (
            <Link
              key={s.area}
              href={`/dashboard/metafix/chat?area=${s.area}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition hover:opacity-80"
              style={{ background: "#1c1b1b", borderColor: "rgba(255,255,255,0.07)", color: s.color }}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Cases list */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <MessageSquare size={14} className="text-blue-400" />
              Mis casos
            </h2>
          </div>

          <div className="rounded-2xl overflow-hidden" style={{ background: "#1c1b1b" }}>
            {cases.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <Clock className="w-8 h-8" style={{ color: "#484553" }} />
                <p className="text-sm text-gray-500">Sin casos todavía</p>
                <Link
                  href="/dashboard/metafix/chat"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition"
                >
                  Crear tu primer caso →
                </Link>
              </div>
            ) : (
              cases.map((c, i) => (
                <Link
                  key={c.id}
                  href={`/dashboard/metafix/${c.id}`}
                  className="flex items-center gap-4 px-5 py-4 group hover:bg-white/[0.02] transition-colors"
                  style={{ borderBottom: i < cases.length - 1 ? "1px solid rgba(72,69,83,0.15)" : "none" }}
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="font-semibold text-[13px] truncate text-white group-hover:text-blue-300 transition-colors">
                      {c.title}
                    </p>
                    <div className="flex items-center gap-2">
                      <CaseStatusBadge status={c.status} />
                      <AreaBadge area={c.area} />
                      <span className="text-[11px] text-gray-600">{timeAgo(c.updated_at)}</span>
                    </div>
                  </div>
                  <ArrowRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Knowledge base sidebar */}
        <div className="col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen size={14} className="text-blue-400" />
              Base de conocimiento
            </h2>
            <Link href="/dashboard/metafix/knowledge" className="text-[11px] text-blue-400 hover:text-blue-300 transition">
              Ver todo →
            </Link>
          </div>

          <div className="rounded-2xl overflow-hidden space-y-px" style={{ background: "#1c1b1b" }}>
            {articles.length === 0 ? (
              <p className="text-xs text-gray-500 p-5 text-center">Sin artículos todavía</p>
            ) : (
              articles.map((a) => (
                <Link
                  key={a.id}
                  href={`/dashboard/metafix/knowledge/${a.slug}`}
                  className="flex flex-col gap-1 px-4 py-3 hover:bg-white/[0.02] transition-colors group"
                  style={{ borderBottom: "1px solid rgba(72,69,83,0.1)" }}
                >
                  <p className="text-[12px] font-medium text-gray-200 group-hover:text-white transition-colors line-clamp-2">
                    {a.title}
                  </p>
                  {a.error_codes?.length > 0 && (
                    <p className="text-[10px] text-blue-400 font-mono">{a.error_codes.join(", ")}</p>
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
