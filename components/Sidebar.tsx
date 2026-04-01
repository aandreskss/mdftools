"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, User, Share2, Video, FileText, Search,
  Megaphone, Eye, FileSignature, Mail, Zap, RefreshCw,
  Calendar, BarChart2, ChevronDown, LogOut, Sparkles,
  PanelLeftClose, PanelLeft, Settings, Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Navigation data ──────────────────────────────────────────────────────────

const navSections = [
  {
    id: "core",
    label: "Core",
    items: [
      { id: "dashboard",  label: "Dashboard",      href: "/dashboard",         icon: LayoutDashboard },
      { id: "perfil",     label: "Perfil de Marca", href: "/dashboard/perfil",  icon: User },
    ],
  },
  {
    id: "agentes",
    label: "Agentes IA",
    collapsible: true,
    items: [
      { id: "social",       label: "Social Media",    href: "/dashboard/social",      icon: Share2 },
      { id: "guiones",      label: "Guiones",         href: "/dashboard/guiones",     icon: Video },
      { id: "blog",         label: "Blog",            href: "/dashboard/blog",        icon: FileText },
      { id: "seo",          label: "SEO Rápido",      href: "/dashboard/seo",         icon: Search },
      { id: "anuncios",     label: "Anuncios",        href: "/dashboard/anuncios",    icon: Megaphone },
      { id: "competencia",  label: "Spy Competencia", href: "/dashboard/competencia", icon: Eye },
      { id: "emails",       label: "Email Marketing", href: "/dashboard/emails",      icon: Mail },
      { id: "hooks",        label: "Hooks",           href: "/dashboard/hooks",       icon: Zap },
      { id: "repurposing",  label: "Repurposing",     href: "/dashboard/repurposing", icon: RefreshCw },
      { id: "calendario",   label: "Calendario",      href: "/dashboard/calendario",  icon: Calendar },
    ],
  },
  {
    id: "negocios",
    label: "Negocios",
    items: [
      { id: "propuestas", label: "Propuestas", href: "/dashboard/propuestas", icon: FileSignature },
    ],
  },
];

const seoChildren = [
  { label: "Dashboard GSC",  href: "/dashboard/seo-suite" },
  { label: "Keywords",       href: "/dashboard/seo-suite/keywords" },
  { label: "Position Tracker", href: "/dashboard/seo-suite/tracker" },
  { label: "Backlinks",      href: "/dashboard/seo-suite/backlinks" },
  { label: "Auditoría",      href: "/dashboard/seo-suite/auditoria" },
  { label: "Competidores",   href: "/dashboard/seo-suite/competidores" },
  { label: "Reportes",       href: "/dashboard/seo-suite/reportes" },
  { label: "Oportunidades IA", href: "/dashboard/seo-suite/oportunidades" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname  = usePathname();
  const router    = useRouter();
  const supabase  = createClient();

  const [collapsed, setCollapsed]       = useState(false);
  const [userEmail, setUserEmail]       = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [seoOpen, setSeoOpen]           = useState(pathname.startsWith("/dashboard/seo-suite"));
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ agentes: true });
  const [pinnedItems, setPinnedItems]   = useState<Set<string>>(new Set(["dashboard"]));
  const [search, setSearch]             = useState("");

  // Sync CSS variable so layout margin follows sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "72px" : "240px"
    );
  }, [collapsed]);

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

  function toggleSection(id: string) {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function togglePin(id: string) {
    setPinnedItems(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const initials = userEmail ? userEmail[0].toUpperCase() : "U";
  const username  = userEmail ? userEmail.split("@")[0] : "Usuario";

  // Filter nav items by search
  const allItems = navSections.flatMap(s => s.items);
  const filteredItems = search.trim()
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  const pinnedNavItems = allItems.filter(i => pinnedItems.has(i.id));

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40 border-r border-white/5 overflow-hidden"
      style={{
        width: collapsed ? "72px" : "240px",
        background: "#0A0A0A",
        transition: "width 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {/* ── Logo & Toggle ── */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-white/5 flex-shrink-0">
        <div
          className="flex items-center gap-3 overflow-hidden"
          style={{
            opacity: collapsed ? 0 : 1,
            width: collapsed ? 0 : "auto",
            transition: "opacity 0.2s, width 0.3s",
            whiteSpace: "nowrap",
          }}
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20 flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-[15px]">
            MDF<span className="text-brand-400">Tools</span>
          </span>
        </div>

        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/5 transition-all flex-shrink-0"
          style={{ marginLeft: collapsed ? "auto" : undefined, marginRight: collapsed ? "auto" : undefined }}
        >
          {collapsed
            ? <PanelLeft className="w-4 h-4" />
            : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Search ── */}
      <div
        className="border-b border-white/5 overflow-hidden flex-shrink-0"
        style={{
          maxHeight: collapsed ? 0 : "56px",
          opacity: collapsed ? 0 : 1,
          transition: "max-height 0.3s, opacity 0.2s",
          padding: collapsed ? "0 12px" : "8px 12px",
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white/90 placeholder:text-white/30 text-sm focus:outline-none focus:bg-white/[0.05] focus:border-white/10 transition-all"
          />
        </div>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 py-3 custom-scrollbar">

        {/* Search results */}
        {filteredItems && (
          <div className="mb-4">
            <p className="px-3 mb-2 text-[11px] font-medium text-white/40 uppercase tracking-wider">Resultados</p>
            <div className="space-y-1">
              {filteredItems.length === 0 ? (
                <p className="px-3 py-2 text-xs text-white/30">Sin resultados</p>
              ) : filteredItems.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={pathname === item.href}
                  collapsed={collapsed}
                  isPinned={pinnedItems.has(item.id)}
                  onTogglePin={() => togglePin(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Pinned */}
        {!filteredItems && !collapsed && pinnedNavItems.length > 0 && (
          <div className="mb-5">
            <p className="px-3 mb-2 text-[11px] font-medium text-white/40 uppercase tracking-wider">Fijados</p>
            <div className="space-y-1">
              {pinnedNavItems.map(item => (
                <NavItem
                  key={item.id}
                  item={item}
                  isActive={pathname === item.href}
                  collapsed={collapsed}
                  isPinned
                  onTogglePin={() => togglePin(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sections */}
        {!filteredItems && navSections.map(section => {
          const isCollapsible = section.collapsible;
          const isOpen = !isCollapsible || expandedSections[section.id];

          return (
            <div key={section.id} className="mb-5">
              {!collapsed && (
                <div className="px-3 mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">
                    {section.label}
                  </span>
                  {isCollapsible && (
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="text-white/30 hover:text-white/60 transition-colors"
                    >
                      <ChevronDown
                        className="w-3 h-3 transition-transform duration-200"
                        style={{ transform: isOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                      />
                    </button>
                  )}
                </div>
              )}

              <div
                className="space-y-1 overflow-hidden"
                style={{
                  maxHeight: isOpen || collapsed ? "9999px" : "0",
                  transition: "max-height 0.25s ease",
                }}
              >
                {section.items.map(item => (
                  <NavItem
                    key={item.id}
                    item={item}
                    isActive={pathname === item.href}
                    collapsed={collapsed}
                    isPinned={pinnedItems.has(item.id)}
                    onTogglePin={() => togglePin(item.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* SEO Suite */}
        {!filteredItems && (
          <div className="mb-5">
            {!collapsed && (
              <p className="px-3 mb-2 text-[11px] font-medium text-white/40 uppercase tracking-wider">SEO Suite</p>
            )}
            <button
              onClick={() => !collapsed && setSeoOpen(v => !v)}
              className={`w-full rounded-lg transition-all duration-200 relative group ${
                collapsed ? "h-12 flex items-center justify-center" : "px-3 py-2.5"
              } ${
                pathname.startsWith("/dashboard/seo-suite")
                  ? "bg-white/[0.08] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/[0.04]"
              }`}
            >
              {pathname.startsWith("/dashboard/seo-suite") && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-purple-400 to-violet-500 rounded-full" />
              )}
              <div className="flex items-center gap-3">
                <BarChart2 className="w-5 h-5 flex-shrink-0" />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-[13.5px] font-medium">SEO Suite</span>
                    <ChevronDown
                      className="w-4 h-4 transition-transform duration-200"
                      style={{ transform: seoOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
                    />
                  </>
                )}
              </div>
            </button>

            {!collapsed && seoOpen && (
              <div className="ml-4 mt-1 pl-4 border-l border-white/[0.06] space-y-0.5">
                {seoChildren.map(child => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={`block px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                      pathname === child.href
                        ? "text-purple-300 bg-purple-500/10"
                        : "text-white/40 hover:text-white hover:bg-white/[0.04]"
                    }`}
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </nav>

      {/* ── User ── */}
      <div className="p-3 border-t border-white/5 flex-shrink-0 relative">
        <button
          onClick={() => setUserMenuOpen(v => !v)}
          className={`w-full rounded-lg transition-all duration-200 hover:bg-white/[0.04] ${
            userMenuOpen ? "bg-white/[0.04]" : ""
          } ${collapsed ? "h-12 flex items-center justify-center" : "p-3"}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ring-2 ring-white/10">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-white/90 truncate">{username}</p>
                  <p className="text-xs text-white/40 truncate">{userEmail || "Cargando..."}</p>
                </div>
                <ChevronDown
                  className="w-4 h-4 text-white/40 flex-shrink-0 transition-transform duration-200"
                  style={{ transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                />
              </>
            )}
          </div>
        </button>

        {/* User dropdown */}
        {userMenuOpen && !collapsed && (
          <div className="absolute bottom-full left-3 right-3 mb-2 p-1 bg-[#131313] rounded-lg border border-white/10 shadow-2xl z-50">
            <Link
              href="/dashboard/perfil"
              onClick={() => setUserMenuOpen(false)}
              className="w-full px-3 py-2 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/[0.04] flex items-center gap-2 transition-colors"
            >
              <User className="w-4 h-4" /> Perfil
            </Link>
            <button className="w-full px-3 py-2 rounded-md text-sm text-white/70 hover:text-white hover:bg-white/[0.04] flex items-center gap-2 transition-colors">
              <Settings className="w-4 h-4" /> Configuración
            </button>
            <div className="h-px bg-white/5 my-1" />
            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 rounded-md text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── NavItem ──────────────────────────────────────────────────────────────────

function NavItem({
  item,
  isActive,
  collapsed,
  isPinned,
  onTogglePin,
}: {
  item: { id: string; label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  isActive: boolean;
  collapsed: boolean;
  isPinned?: boolean;
  onTogglePin?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`w-full rounded-lg transition-all duration-200 relative group flex ${
        collapsed ? "h-12 items-center justify-center" : "px-3 py-2.5 items-center"
      } ${
        isActive
          ? "bg-white/[0.08] text-white shadow-lg shadow-purple-500/5"
          : "text-white/60 hover:text-white hover:bg-white/[0.04]"
      }`}
      title={collapsed ? item.label : undefined}
    >
      {/* Active left indicator */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gradient-to-b from-purple-400 to-violet-500 rounded-full" />
      )}

      <div className="flex items-center gap-3 w-full">
        <Icon
          className={`w-5 h-5 flex-shrink-0 transition-all duration-200 ${
            isActive ? "drop-shadow-[0_0_8px_rgba(168,85,247,0.4)]" : ""
          }`}
        />

        {!collapsed && (
          <>
            <span className="flex-1 text-[13.5px] font-medium truncate">{item.label}</span>

            {hovered && onTogglePin && (
              <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); onTogglePin(); }}
                className={`p-1 rounded transition-colors flex-shrink-0 ${
                  isPinned ? "text-purple-400" : "text-white/30 hover:text-white/60"
                }`}
              >
                <Star className={`w-3 h-3 ${isPinned ? "fill-current" : ""}`} />
              </button>
            )}
          </>
        )}
      </div>

      {/* Active glow */}
      {isActive && (
        <span className="absolute inset-0 bg-gradient-to-r from-purple-500/[0.03] to-violet-500/[0.03] rounded-lg pointer-events-none" />
      )}
    </Link>
  );
}
