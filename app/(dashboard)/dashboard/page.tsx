import { LayoutDashboard, Share2, FileText, Search, BarChart2, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

const quickLinks = [
  { label: "Social Media", href: "/dashboard/social", icon: Share2, color: "bg-pink-500/10 text-pink-400", desc: "Posts, captions y estrategia" },
  { label: "Blog", href: "/dashboard/blog", icon: FileText, color: "bg-blue-500/10 text-blue-400", desc: "Artículos SEO optimizados" },
  { label: "SEO Rápido", href: "/dashboard/seo", icon: Search, color: "bg-green-500/10 text-green-400", desc: "Análisis y recomendaciones" },
  { label: "Hooks", href: "/dashboard/hooks", icon: Zap, color: "bg-yellow-500/10 text-yellow-400", desc: "Ganchos virales para cualquier formato" },
  { label: "SEO Suite", href: "/dashboard/seo-suite", icon: BarChart2, color: "bg-purple-500/10 text-purple-400", desc: "Dashboard GSC multi-cliente" },
];

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let hasProfile = false;
  if (user) {
    const { data } = await supabase
      .from("brand_profiles")
      .select("brand_name")
      .eq("user_id", user.id)
      .maybeSingle();
    hasProfile = !!data?.brand_name;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Bienvenido a MDF Tools</h1>
        <p className="text-gray-400 mt-1">Tu workspace de IA para marketing y SEO. Los agentes recuerdan tu marca.</p>
      </div>

      {hasProfile ? (
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
          <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
          <p className="text-green-300 text-sm">Perfil de marca configurado — todos los agentes tienen contexto de tu marca.</p>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-indigo-300 font-medium text-sm">Configura tu perfil de marca primero</p>
            <p className="text-gray-400 text-xs mt-0.5">Los agentes usan este contexto en cada respuesta. Solo necesitas hacerlo una vez.</p>
            <Link href="/dashboard/perfil" className="inline-block mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              Ir a Perfil de Marca →
            </Link>
          </div>
        </div>
      )}

      {/* Quick links */}
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Accesos rápidos</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickLinks.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="p-5 bg-gray-900 border border-gray-800 rounded-xl hover:border-gray-700 hover:bg-gray-800/50 transition group"
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${item.color}`}>
              <item.icon size={18} />
            </div>
            <p className="text-white font-semibold text-sm">{item.label}</p>
            <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
