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
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gray-900 border-r border-gray-800 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-800">
        <span className="text-lg font-bold text-white tracking-tight">MDF<span className="text-indigo-400">Tools</span></span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5 text-sm">
        {navItems.map((item, i) => {
          if ("divider" in item) {
            return (
              <p key={i} className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest px-2 pt-4 pb-1">
                {item.label}
              </p>
            );
          }

          if (item.children) {
            return (
              <div key={i}>
                <button
                  onClick={() => setSeoOpen(!seoOpen)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
                >
                  <div className="flex items-center gap-2">
                    <item.icon size={15} />
                    {item.label}
                  </div>
                  <ChevronDown size={13} className={`transition-transform ${seoOpen ? "rotate-180" : ""}`} />
                </button>
                {seoOpen && (
                  <div className="ml-4 mt-0.5 space-y-0.5 border-l border-gray-800 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-2 py-1.5 rounded-lg text-xs transition ${
                          pathname === child.href
                            ? "text-white bg-gray-800"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
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
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition ${
                isActive
                  ? "bg-indigo-600 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <item.icon size={15} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 truncate">{userEmail || "Cargando..."}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
