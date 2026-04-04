"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, User, Share2, Video, FileText, Search,
  Megaphone, Eye, FileSignature, Mail, Zap, RefreshCw,
  Calendar, BarChart2, ChevronDown, LogOut, Sparkles,
  PanelLeftClose, PanelLeft, Settings, Plus, Palette, Kanban, ShoppingBag,
} from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// ─── Nav data ──────────────────────────────────────────────────────────────────

const coreItems = [
  { id: "dashboard",  label: "Dashboard",       href: "/dashboard",        icon: LayoutDashboard },
  { id: "perfil",     label: "Perfil de Marca",  href: "/dashboard/perfil", icon: User },
];

const toolItems = [
  { id: "social",      label: "Social Media",     href: "/dashboard/social",      icon: Share2 },
  { id: "guiones",     label: "Guiones",           href: "/dashboard/guiones",     icon: Video },
  { id: "blog",        label: "Blog",              href: "/dashboard/blog",        icon: FileText },
  { id: "seo",         label: "SEO Rápido",        href: "/dashboard/seo",         icon: Search },
  { id: "anuncios",    label: "Anuncios",           href: "/dashboard/anuncios",    icon: Megaphone },
  { id: "competencia", label: "Spy Competencia",   href: "/dashboard/competencia", icon: Eye },
  { id: "emails",      label: "Email Marketing",   href: "/dashboard/emails",      icon: Mail },
  { id: "hooks",       label: "Hooks",             href: "/dashboard/hooks",       icon: Zap },
  { id: "repurposing", label: "Repurposing",        href: "/dashboard/repurposing", icon: RefreshCw },
  { id: "calendario",  label: "Calendario",         href: "/dashboard/calendario",  icon: Calendar },
];

const ecosystemItems: { id: string; label: string; href: string; icon: React.ComponentType<{ className?: string }> }[] = [];

const propuestasChildren = [
  { label: "Marketing",     href: "/dashboard/propuestas",          icon: FileSignature },
  { label: "Diseño",        href: "/dashboard/propuestas/diseno",   icon: Palette },
  { label: "Ventas",        href: "/dashboard/propuestas/ventas",   icon: ShoppingBag },
  { label: "CRM Pipeline",  href: "/dashboard/crm-propuestas",     icon: Kanban },
];

const seoSuiteChildren = [
  { label: "Dashboard GSC",    href: "/dashboard/seo-suite" },
  { label: "Keywords",         href: "/dashboard/seo-suite/keywords" },
  { label: "Position Tracker", href: "/dashboard/seo-suite/tracker" },
  { label: "Backlinks",        href: "/dashboard/seo-suite/backlinks" },
  { label: "Auditoría",        href: "/dashboard/seo-suite/auditoria" },
  { label: "Competidores",     href: "/dashboard/seo-suite/competidores" },
  { label: "Reportes",         href: "/dashboard/seo-suite/reportes" },
  { label: "Oportunidades IA", href: "/dashboard/seo-suite/oportunidades" },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const supabase = createClient();

  const [collapsed, setCollapsed]         = useState(false);
  const [userEmail, setUserEmail]         = useState("");
  const [toolsOpen, setToolsOpen]         = useState(true);
  const [propuestasOpen, setPropuestasOpen] = useState(pathname.startsWith("/dashboard/propuestas") || pathname.startsWith("/dashboard/crm-propuestas"));
  const [seoOpen, setSeoOpen]             = useState(pathname.startsWith("/dashboard/seo-suite"));

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      collapsed ? "72px" : "256px"
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

  const initials = userEmail ? userEmail[0].toUpperCase() : "U";
  const username  = userEmail ? userEmail.split("@")[0] : "Usuario";

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col z-40 overflow-hidden"
      style={{
        width: collapsed ? "72px" : "256px",
        background: "rgba(19,19,19,0.97)",
        borderRight: "1px solid rgba(202,196,213,0.12)",
        backdropFilter: "blur(20px)",
        transition: "width 0.3s cubic-bezier(0.23, 1, 0.32, 1)",
      }}
    >
      {/* ── Brand + Toggle ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5 flex-shrink-0">
        <div
          className="flex items-center gap-3 overflow-hidden"
          style={{
            opacity: collapsed ? 0 : 1,
            width: collapsed ? 0 : "auto",
            transition: "opacity 0.2s, width 0.3s",
            whiteSpace: "nowrap",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "linear-gradient(132deg, #cbbeff 0%, #9d85ff 100%)" }}
          >
            <Sparkles className="w-4 h-4 text-[#1e0061]" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-[#cbbeff] text-[15px] tracking-tight">MDF Tools</span>
            <span className="text-[9px] uppercase tracking-[2px] text-[#938e9e]">Marketing Suite</span>
          </div>
        </div>

        <button
          onClick={() => setCollapsed(v => !v)}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all flex-shrink-0"
          style={{
            color: "rgba(202,196,213,0.5)",
            marginLeft: collapsed ? "auto" : undefined,
            marginRight: collapsed ? "auto" : undefined,
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#cac4d5")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(202,196,213,0.5)")}
        >
          {collapsed ? <PanelLeft className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Nav ── */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 custom-scrollbar space-y-5">

        {/* Core */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#938e9e]">Core</p>
          )}
          {coreItems.map(item => (
            <NavItem key={item.id} item={item} isActive={pathname === item.href} collapsed={collapsed} />
          ))}
        </div>

        {/* Herramientas IA */}
        <div className="space-y-0.5">
          {!collapsed && (
            <button
              onClick={() => setToolsOpen(v => !v)}
              className="w-full px-3 mb-2 flex items-center justify-between"
            >
              <span className="text-[10px] font-bold uppercase tracking-[1px] text-[#938e9e]">Herramientas IA</span>
              <ChevronDown
                className="w-3 h-3 text-[#938e9e] transition-transform duration-200"
                style={{ transform: toolsOpen ? "rotate(0deg)" : "rotate(-90deg)" }}
              />
            </button>
          )}
          <div
            className="space-y-0.5 overflow-hidden"
            style={{
              maxHeight: toolsOpen || collapsed ? "9999px" : "0",
              transition: "max-height 0.25s ease",
            }}
          >
            {toolItems.map(item => (
              <NavItem key={item.id} item={item} isActive={pathname === item.href} collapsed={collapsed} />
            ))}
          </div>
        </div>

        {/* Ecosystem */}
        <div className="space-y-0.5">
          {!collapsed && (
            <p className="px-3 mb-2 text-[10px] font-bold uppercase tracking-[1px] text-[#938e9e]">Ecosystem</p>
          )}

          {/* Propuestas expandable */}
          <ExpandableSection
            label="Propuestas"
            icon={FileSignature}
            isActive={pathname.startsWith("/dashboard/propuestas") || pathname.startsWith("/dashboard/crm-propuestas")}
            open={propuestasOpen}
            collapsed={collapsed}
            onToggle={() => !collapsed && setPropuestasOpen(v => !v)}
          >
            {propuestasChildren.map(child => {
              const Icon = child.icon;
              return (
                <Link
                  key={child.href}
                  href={child.href}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all"
                  style={{
                    color: pathname === child.href ? "#cbbeff" : "rgba(202,196,213,0.5)",
                    background: pathname === child.href ? "rgba(203,190,255,0.08)" : "transparent",
                  }}
                  onMouseEnter={e => {
                    if (pathname !== child.href) {
                      (e.currentTarget as HTMLElement).style.color = "#cac4d5";
                      (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (pathname !== child.href) {
                      (e.currentTarget as HTMLElement).style.color = "rgba(202,196,213,0.5)";
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                    }
                  }}
                >
                  <Icon className="w-3 h-3 flex-shrink-0" />
                  {child.label}
                </Link>
              );
            })}
          </ExpandableSection>

          {/* SEO Suite expandable */}
          <ExpandableSection
            label="SEO Suite"
            icon={BarChart2}
            isActive={pathname.startsWith("/dashboard/seo-suite")}
            open={seoOpen}
            collapsed={collapsed}
            onToggle={() => !collapsed && setSeoOpen(v => !v)}
          >
            {seoSuiteChildren.map(child => (
              <Link
                key={child.href}
                href={child.href}
                className="block px-3 py-1.5 rounded-lg text-[12.5px] font-medium transition-all"
                style={{
                  color: pathname === child.href ? "#cbbeff" : "rgba(202,196,213,0.5)",
                  background: pathname === child.href ? "rgba(203,190,255,0.08)" : "transparent",
                }}
                onMouseEnter={e => {
                  if (pathname !== child.href) {
                    (e.currentTarget as HTMLElement).style.color = "#cac4d5";
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                  }
                }}
                onMouseLeave={e => {
                  if (pathname !== child.href) {
                    (e.currentTarget as HTMLElement).style.color = "rgba(202,196,213,0.5)";
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }
                }}
              >
                {child.label}
              </Link>
            ))}
          </ExpandableSection>
        </div>
      </nav>

      {/* ── Footer ── */}
      <div className="flex-shrink-0 px-3 pb-5 pt-2 space-y-3" style={{ borderTop: "1px solid rgba(202,196,213,0.08)" }}>
        {/* Nueva Campaña CTA */}
        {!collapsed && (
          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-[13px] text-[#1e0061] transition-all"
            style={{
              background: "linear-gradient(90deg, #cbbeff 0%, #9d85ff 100%)",
              boxShadow: "0 0 20px rgba(157,133,255,0.2)",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <Plus className="w-3.5 h-3.5" />
            Nueva Campaña
          </button>
        )}

        {/* Settings + Logout */}
        <div className="space-y-0.5">
          <Link
            href="/dashboard/perfil"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all"
            style={{ color: "rgba(202,196,213,0.7)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#cac4d5";
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(202,196,213,0.7)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Configuración</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13.5px] font-medium transition-all"
            style={{ color: "#ffb4ab" }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "rgba(255,180,171,0.08)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>

        {/* User profile */}
        {!collapsed && (
          <div
            className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "#1c1b1b" }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
              style={{
                background: "linear-gradient(132deg, #cbbeff 0%, #9d85ff 100%)",
                color: "#1e0061",
                border: "1px solid rgba(72,69,83,0.6)",
              }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-[#e5e2e1] truncate">{username}</p>
              <p className="text-[10px] text-[#938e9e] truncate">{userEmail || "Cargando..."}</p>
            </div>
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
}: {
  item: { id: string; label: string; href: string; icon: React.ComponentType<{ className?: string }> };
  isActive: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className="flex items-center rounded-lg transition-all duration-200 relative"
      style={{
        padding: collapsed ? undefined : "7px 12px",
        height: collapsed ? "40px" : undefined,
        justifyContent: collapsed ? "center" : undefined,
        gap: collapsed ? undefined : "12px",
        color: isActive ? "#cbbeff" : "rgba(202,196,213,0.7)",
        background: isActive ? "rgba(203,190,255,0.1)" : "transparent",
        boxShadow: isActive ? "0 0 8px rgba(203,190,255,0.15)" : "none",
      }}
      onMouseEnter={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.color = "#cac4d5";
          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          (e.currentTarget as HTMLElement).style.color = "rgba(202,196,213,0.7)";
          (e.currentTarget as HTMLElement).style.background = "transparent";
        }
      }}
    >
      {isActive && (
        <span
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ background: "#cbbeff" }}
        />
      )}
      <Icon className="w-[15px] h-[15px] flex-shrink-0" />
      {!collapsed && (
        <span className="text-[13.5px] font-medium tracking-[-0.2px]">{item.label}</span>
      )}
    </Link>
  );
}

// ─── ExpandableSection ────────────────────────────────────────────────────────

function ExpandableSection({
  label, icon: Icon, isActive, open, collapsed, onToggle, children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  open: boolean;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      <button
        onClick={onToggle}
        className="w-full rounded-lg transition-all duration-200 relative"
        style={{
          padding: collapsed ? undefined : "6px 12px",
          height: collapsed ? "40px" : undefined,
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : undefined,
          color: isActive ? "#cbbeff" : "rgba(202,196,213,0.7)",
          background: isActive ? "rgba(203,190,255,0.08)" : "transparent",
        }}
        onMouseEnter={e => {
          if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.03)";
        }}
        onMouseLeave={e => {
          if (!isActive) e.currentTarget.style.background = "transparent";
        }}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full" style={{ background: "#cbbeff" }} />
        )}
        <div className="flex items-center gap-3 w-full">
          <Icon className="w-4 h-4 flex-shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left text-[13.5px] font-medium">{label}</span>
              <ChevronDown
                className="w-3 h-3 transition-transform duration-200"
                style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
              />
            </>
          )}
        </div>
      </button>

      {!collapsed && open && (
        <div className="ml-4 mt-1 pl-4 space-y-0.5" style={{ borderLeft: "1px solid rgba(203,190,255,0.12)" }}>
          {children}
        </div>
      )}
    </>
  );
}
