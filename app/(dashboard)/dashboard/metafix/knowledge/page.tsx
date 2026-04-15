import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, ArrowLeft, ArrowRight, Search } from "lucide-react";
import AreaBadge from "@/components/metafix/AreaBadge";
import type { KnowledgeArticle, MetafixArea } from "@/types";

const AREA_FILTERS: { value: string; label: string }[] = [
  { value: "all",              label: "Todos" },
  { value: "waba",             label: "WABA" },
  { value: "meta_ads",         label: "Meta Ads" },
  { value: "catalogs",         label: "Catálogos" },
  { value: "business_manager", label: "Business Manager" },
  { value: "pixel",            label: "Píxel" },
  { value: "general",          label: "General" },
];

const DIFFICULTY_COLORS = {
  easy:   "text-green-400",
  medium: "text-yellow-400",
  hard:   "text-red-400",
};

const DIFFICULTY_LABELS = {
  easy:   "Fácil",
  medium: "Medio",
  hard:   "Difícil",
};

interface Props {
  searchParams: Promise<{ area?: string; q?: string }>;
}

export default async function KnowledgePage({ searchParams }: Props) {
  const { area, q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("knowledge_base")
    .select("*")
    .eq("is_published", true)
    .order("view_count", { ascending: false });

  if (area && area !== "all") {
    query = query.eq("area", area);
  }

  const { data } = await query;
  let articles = (data ?? []) as KnowledgeArticle[];

  // Client-side text filter (simple contains)
  if (q?.trim()) {
    const lower = q.toLowerCase();
    articles = articles.filter((a) =>
      a.title.toLowerCase().includes(lower) ||
      a.problem.toLowerCase().includes(lower) ||
      a.error_codes?.some((c) => c.includes(lower))
    );
  }

  return (
    <div className="p-6 xl:p-8 min-h-screen space-y-6" style={{ background: "#131313" }}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/metafix" className="text-gray-500 hover:text-gray-300 transition">
          <ArrowLeft size={16} />
        </Link>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(59,130,246,0.15)" }}>
          <BookOpen size={18} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Base de Conocimiento</h1>
          <p className="text-xs text-gray-500">Soluciones a problemas comunes del ecosistema Meta</p>
        </div>
      </div>

      {/* Search + filters */}
      <div className="space-y-3">
        <form className="flex gap-2">
          <div className="flex-1 flex items-center gap-2 rounded-xl px-4 py-2.5 border border-gray-700 focus-within:border-blue-500 transition" style={{ background: "#1c1b1b" }}>
            <Search size={14} className="text-gray-500 flex-shrink-0" />
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Buscar por error, síntoma o código..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 rounded-xl text-sm font-medium text-white transition" style={{ background: "#2563eb" }}>
            Buscar
          </button>
        </form>

        <div className="flex flex-wrap gap-2">
          {AREA_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={`/dashboard/metafix/knowledge?area=${f.value}${q ? `&q=${q}` : ""}`}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border transition"
              style={{
                background: (area ?? "all") === f.value ? "rgba(37,99,235,0.2)" : "#1c1b1b",
                borderColor: (area ?? "all") === f.value ? "#3b82f6" : "rgba(255,255,255,0.07)",
                color: (area ?? "all") === f.value ? "#93c5fd" : "#9ca3af",
              }}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Articles */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <BookOpen className="w-8 h-8 text-gray-700" />
          <p className="text-sm text-gray-500">No se encontraron artículos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/metafix/knowledge/${a.slug}`}
              className="group flex flex-col gap-3 p-5 rounded-2xl border transition hover:border-blue-500/40"
              style={{ background: "#1c1b1b", borderColor: "rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {a.title}
                </h3>
                <ArrowRight size={14} className="text-gray-600 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5" />
              </div>

              <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{a.problem}</p>

              <div className="flex items-center gap-2 flex-wrap mt-auto pt-1">
                <AreaBadge area={a.area as MetafixArea} />
                {a.error_codes?.length > 0 && (
                  <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                    {a.error_codes.slice(0, 2).join(", ")}
                  </span>
                )}
                <span className={`text-[10px] font-medium ml-auto ${DIFFICULTY_COLORS[a.difficulty]}`}>
                  {DIFFICULTY_LABELS[a.difficulty]}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
