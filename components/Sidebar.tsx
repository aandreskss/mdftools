"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, User, Share2, Video, FileText, Search,
  Megaphone, Eye, FileSignature, Mail, Zap, RefreshCw,
  Calendar, BarChart2, ChevronDown, LogOut
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Perfil de Marca", href: "/dashboard/perfil", icon: User },
  { divider: true, label: "AGENTES" },
  { label: "Social Media", href: "/dashboard/social", icon: Share2 },
  { label: "Guiones", href: "/dashboard/guiones", icon: Video },
  { label: "Blog", href: "/dashboard/blog", icon: FileText },
  { label: "SEO Rápido", href: "/dashboard/seo", icon: Search },
  { label: "Anuncios", href: "/dashboard/anuncios", icon: Megaphone },
  { label: "Spy Competencia", href: "/dashboard/competencia", icon: Eye },
  { label: "Email Marketing", href: "/dashboard/emails", icon: Mail },
  { label: "Hooks", href: "/dashboard/hooks", icon: Zap },
  { label: "Repurposing", href: "/dashboard/repurposing", icon: RefreshCw },
  { label: "Calendario", href: "/dashboard/calendario", icon: Calendar },
  { divider: true, label: "NEGOCIOS" },
  { label: "Propuestas", href: "/dashboard/propuestas", icon: FileSignature },
  { divider: true, label: "SEO SUITE" },
  {
    label: "SEO Suite",
    icon: BarChart2,
    children: [
      { label: "Dashboard GSC", href: "/dashboard/seo-suite" },
      { label: "Keywords", href: "/dashboard/seo-suite/keywords" },
      { label: "Position Tracker", href: "/dashboard/seo-suite/tracker" },
      { label: "Backlinks", href: "/dashboard/seo-suite/backlinks" },
      { label: "Auditoría", href: "/dashboard/seo-suite/auditoria" },
      { label: "Competidores", href: "/dashboard/seo-suite/competidores" },
      { label: "Reportes", href: "/dashboard/seo-suite/reportes" },
      { label: "Oportunidades IA", href: "/dashboard/seo-suite/oportunidades" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [seoOpen, setSeoOpen] = useState(pathname.startsWith("/dashboard/seo-suite"));
  const [userEmail, setUserEmail] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserEmail(data.user.email ?? "");
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : "U";

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-navy-950 border-r border-white/[0.05] flex flex-col z-40">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/[0.05]">
        <span className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white shadow-lg shadow-brand/20">
            <LayoutDashboard size={18} />
          </div>
          MDF<span className="text-brand-400">Tools</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1 text-sm custom-scrollbar">
        {navItems.map((item, i) => {
          if ("divider" in item) {
            return (
              <p key={i} className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 pt-6 pb-2">
                {item.label}
              </p>
            );
          }

          if (item.children) {
            return (
              <div key={i} className="space-y-1">
                <button
                  onClick={() => setSeoOpen(!seoOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-all group"
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon size={18} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${seoOpen ? "rotate-180" : ""}`} />
                </button>
                {seoOpen && (
                  <div className="ml-4 mt-1 space-y-1 border-l border-white/[0.05] pl-4">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                          pathname === child.href
                            ? "text-brand-400 bg-brand/10 shadow-sm shadow-brand/5"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href!}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all font-medium ${
                isActive
                  ? "brand-gradient text-white shadow-lg shadow-brand/20 translate-x-1"
                  : "text-slate-400 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <item.icon size={18} className={isActive ? "text-white" : "text-slate-500 group-hover:text-brand-400 transition-colors"} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-5 py-5 border-t border-white/[0.05] bg-navy-950/50 backdrop-blur-md">
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-10 h-10 rounded-xl brand-gradient flex items-center justify-center text-sm font-bold text-white flex-shrink-0 shadow-lg shadow-brand/10">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{userEmail.split('@')[0] || "Usuario"}</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail || "Cargando..."}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
