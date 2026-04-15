import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Lightbulb, CheckCircle2, Shield, MessageSquarePlus } from "lucide-react";
import AreaBadge from "@/components/metafix/AreaBadge";
import type { KnowledgeArticle, MetafixArea } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

const DIFFICULTY_COLORS = { easy: "text-green-400", medium: "text-yellow-400", hard: "text-red-400" };
const DIFFICULTY_LABELS = { easy: "Fácil", medium: "Dificultad media", hard: "Complejo" };

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("knowledge_base")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (error || !data) notFound();

  const article = data as KnowledgeArticle;

  // Increment view count (fire and forget)
  supabase.from("knowledge_base").update({ view_count: (article.view_count ?? 0) + 1 }).eq("id", article.id);

  return (
    <div className="p-6 xl:p-8 min-h-screen" style={{ background: "#131313" }}>
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Back */}
        <Link href="/dashboard/metafix/knowledge" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition">
          <ArrowLeft size={14} />
          Base de Conocimiento
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <AreaBadge area={article.area as MetafixArea} />
            {article.error_codes?.map((code) => (
              <span key={code} className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                {code}
              </span>
            ))}
            <span className={`text-[11px] font-medium ${DIFFICULTY_COLORS[article.difficulty]}`}>
              {DIFFICULTY_LABELS[article.difficulty]}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white leading-snug">{article.title}</h1>
        </div>

        {/* Sections */}
        <div className="space-y-4">

          {/* Problem */}
          <div className="rounded-2xl p-5 space-y-2" style={{ background: "#1c1b1b", border: "1px solid rgba(239,68,68,0.15)" }}>
            <div className="flex items-center gap-2">
              <AlertCircle size={14} className="text-red-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-red-400">El problema</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{article.problem}</p>
          </div>

          {/* Cause */}
          <div className="rounded-2xl p-5 space-y-2" style={{ background: "#1c1b1b", border: "1px solid rgba(234,179,8,0.15)" }}>
            <div className="flex items-center gap-2">
              <Lightbulb size={14} className="text-yellow-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-yellow-400">Causa raíz</h2>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{article.cause}</p>
          </div>

          {/* Solution */}
          <div className="rounded-2xl p-5 space-y-2" style={{ background: "#1c1b1b", border: "1px solid rgba(34,197,94,0.15)" }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-green-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-green-400">Solución paso a paso</h2>
            </div>
            <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{article.solution}</div>
          </div>

          {/* Prevention */}
          {article.prevention && (
            <div className="rounded-2xl p-5 space-y-2" style={{ background: "#1c1b1b", border: "1px solid rgba(59,130,246,0.15)" }}>
              <div className="flex items-center gap-2">
                <Shield size={14} className="text-blue-400" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400">Cómo evitarlo</h2>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{article.prevention}</p>
            </div>
          )}
        </div>

        {/* CTA chat */}
        <div className="rounded-2xl p-5 flex items-center justify-between gap-4" style={{ background: "rgba(37,99,235,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
          <div>
            <p className="text-sm font-semibold text-white">¿Todavía tenés problemas?</p>
            <p className="text-xs text-gray-400 mt-0.5">Abrí un caso y MetaFix te guía paso a paso.</p>
          </div>
          <Link
            href={`/dashboard/metafix/chat?area=${article.area}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition hover:opacity-90 flex-shrink-0"
            style={{ background: "#2563eb" }}
          >
            <MessageSquarePlus size={14} />
            Abrir caso
          </Link>
        </div>
      </div>
    </div>
  );
}
