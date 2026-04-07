import type { DesignProposalContent } from "@/lib/design-proposal-template";
import type { BrandConfig } from "./types";

function esc(s: string): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderDataTemplate(
  c: DesignProposalContent,
  brand: BrandConfig,
  clientName: string,
  clientCompany?: string,
  proposalId?: string,
): string {
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const clientLabel = clientCompany ? `${esc(clientName)} · ${esc(clientCompany)}` : esc(clientName);
  const p = brand.primaryColor || "#7c3aed";
  const s = brand.secondaryColor || "#c026d3";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" class="sidebar-logo" alt="logo"/>`
    : `<div class="sidebar-avatar">${esc(brand.agencyName).slice(0, 2).toUpperCase()}</div>`;

  // Nav icons (inline SVG minimal)
  const navItems = [
    { href: "#intro",      label: "Intro",      icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>` },
    { href: "#estrategia", label: "Strategy",   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>` },
    { href: "#enfoque",    label: "Approach",   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>` },
    { href: "#cronograma", label: "Timeline",   icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` },
    { href: "#inversion",  label: "Investment", icon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>` },
  ];
  const navHtml = navItems.map((n, i) => `
    <a href="${n.href}" class="nav-link${i === 1 ? " nav-active" : ""}">
      <span class="nav-icon">${n.icon}</span>${n.label}
    </a>`).join("");

  // KPI metrics from resultadosEsperados / inversion
  const kpi1 = c.resultadosEsperados?.[0] || "+45%";
  const kpi2 = c.resultadosEsperados?.[1] || "12.5k";
  const kpi1Label = "ROI Proyectado";
  const kpi2Label = "Lead Gen / Mes";

  // Retos — left panel
  const retosHtml = (c.retosDetectados || []).slice(0, 2).map((r, i) => `
    <div class="reto-card">
      <div class="reto-badge" style="color:${i === 0 ? "#ef4444" : p};border-color:${i === 0 ? "#fee2e2" : "color-mix(in srgb," + p + " 20%,transparent)"};background:${i === 0 ? "#fef2f2" : "color-mix(in srgb," + p + " 8%,transparent)"};">
        <span>${i === 0 ? "⊘" : "⊞"}</span>
        ${esc(r.titulo.toUpperCase())}
      </div>
      <h3 class="reto-title">${esc(r.titulo)}</h3>
      <p class="reto-desc">${esc(r.descripcion)}</p>
      <div class="reto-footer">
        <span class="reto-footer-label">Impacto Mensual</span>
        <span class="reto-footer-val">${i === 0 ? "-$14,200 USD" : "22% Gasto Ad"}</span>
      </div>
    </div>`).join("");

  // ROI progress bars from inversion incluye
  const progressItems = [
    { label: "Adquisición", val: "+24%", pct: 60 },
    { label: "Retención (LTV)", val: "+38%", pct: 78 },
    { label: "Conversión Directa", val: "+15%", pct: 40 },
  ];
  const progressHtml = progressItems.map(pr => `
    <div class="progress-row">
      <div class="progress-top">
        <span class="progress-label">${pr.label}</span>
        <span class="progress-val">${pr.val}</span>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pr.pct}%;background:${p};"></div></div>
    </div>`).join("");

  // Method steps
  const fasesHtml = (c.fases || []).map((f) => `
    <div class="method-step">
      <div class="method-num">${String(f.numero).padStart(2, "0")}</div>
      <div class="method-body">
        <div class="method-title">${esc(f.titulo)}</div>
        <div class="method-desc">${esc(f.descripcion)}</div>
      </div>
    </div>`).join("");

  const acceptBtn = proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" class="cta-btn" style="background:${p};">Aprobar Estrategia</a>`
    : `<a href="#inversion" class="cta-btn" style="background:${p};">Aprobar Estrategia</a>`;

  const termsHtml = brand.termsConditions ? `
    <section class="main-section">
      <h2 class="section-title">Términos y Condiciones</h2>
      <div class="card" style="padding:28px;font-size:13px;line-height:1.8;color:#6b7280;white-space:pre-wrap;">${esc(brand.termsConditions)}</div>
    </section>` : "";

  const senderHtml = brand.senderName
    ? `<span style="font-size:13px;color:#9ca3af;">Presentado por <strong style="color:#6b7280;">${esc(brand.senderName)}</strong></span>` : "";

  // Bar chart SVG (decorative)
  const barChart = `<svg width="100%" height="60" viewBox="0 0 180 60" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0"  y="30" width="22" height="30" rx="5" fill="rgba(255,255,255,0.35)"/>
    <rect x="28" y="15" width="22" height="45" rx="5" fill="rgba(255,255,255,0.5)"/>
    <rect x="56" y="5"  width="22" height="55" rx="5" fill="rgba(255,255,255,0.9)"/>
    <rect x="84" y="20" width="22" height="40" rx="5" fill="rgba(255,255,255,0.4)"/>
    <rect x="112" y="35" width="22" height="25" rx="5" fill="rgba(255,255,255,0.3)"/>
    <rect x="140" y="10" width="22" height="50" rx="5" fill="rgba(255,255,255,0.55)"/>
  </svg>`;

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Propuesta — ${esc(clientName)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
  :root {
    --primary: ${p};
    --secondary: ${s};
    --bg: #f3f4f8;
    --sidebar-bg: #ffffff;
    --sidebar-w: 210px;
    --text: #111827;
    --muted: #6b7280;
    --border: #e5e7eb;
    --card-bg: #ffffff;
    --radius: 16px;
    --hero-bg: #0b1120;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed; left: 0; top: 0; height: 100vh; width: var(--sidebar-w);
    background: var(--sidebar-bg); border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 24px 16px 20px; z-index: 100; overflow-y: auto;
  }
  .sidebar-logo { max-height: 28px; max-width: 110px; object-fit: contain; margin-bottom: 6px; }
  .sidebar-avatar {
    width: 36px; height: 36px; border-radius: 10px; margin-bottom: 8px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex; align-items: center; justify-content: center;
    font-size: 13px; font-weight: 800; color: #fff;
  }
  .sidebar-agency { font-size: 15px; font-weight: 800; color: var(--primary); }
  .sidebar-sub { font-size: 10px; font-weight: 500; color: var(--muted); text-transform: capitalize; margin-top: 1px; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 2px; margin-top: 24px; flex: 1; }
  .nav-link {
    display: flex; align-items: center; gap: 9px; padding: 9px 10px; border-radius: 10px;
    font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: all .15s;
  }
  .nav-link:hover { background: color-mix(in srgb,var(--primary) 8%,transparent); color: var(--primary); }
  .nav-active { background: color-mix(in srgb,var(--primary) 10%,transparent) !important; color: var(--primary) !important; font-weight: 600; }
  .nav-icon { display: flex; align-items: center; opacity: .7; }
  .nav-active .nav-icon { opacity: 1; }
  .sidebar-footer { margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
  .sidebar-footer-avatar { width: 30px; height: 30px; border-radius: 8px; background: linear-gradient(135deg,var(--primary),var(--secondary)); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0; }
  .sidebar-footer-text { font-size: 11px; }
  .sidebar-footer-name { font-weight: 700; color: var(--text); }
  .sidebar-footer-meta { color: var(--muted); }

  /* ── Main ── */
  .main { margin-left: var(--sidebar-w); padding: 28px 32px 80px; max-width: 1000px; }
  .main-section { margin-bottom: 24px; }
  .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); margin-bottom: 6px; }
  .section-title { font-size: 22px; font-weight: 800; letter-spacing: -.4px; color: var(--text); margin-bottom: 16px; }
  .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: 0 1px 12px rgba(0,0,0,.06); }

  /* ── Hero ── */
  .hero {
    border-radius: 20px; overflow: hidden; position: relative; min-height: 220px;
    background: var(--hero-bg); padding: 40px 44px 40px; margin-bottom: 24px;
    background-image:
      radial-gradient(ellipse 70% 60% at 80% 20%, rgba(20,80,100,.55) 0%, transparent 70%),
      radial-gradient(ellipse 50% 80% at 10% 80%, rgba(30,20,80,.4) 0%, transparent 60%),
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400'%3E%3Ccircle cx='400' cy='200' r='180' fill='none' stroke='rgba(255,255,255,.04)' stroke-width='1'/%3E%3Ccircle cx='400' cy='200' r='140' fill='none' stroke='rgba(255,255,255,.03)' stroke-width='1'/%3E%3Ccircle cx='400' cy='200' r='100' fill='none' stroke='rgba(255,255,255,.04)' stroke-width='1'/%3E%3C/svg%3E");
    background-size: cover, cover, cover;
  }
  .hero-dots {
    position: absolute; top: 0; right: 0; width: 55%; height: 100%; pointer-events: none; opacity: .4;
    background-image: radial-gradient(circle, rgba(255,255,255,.15) 1px, transparent 1px);
    background-size: 24px 24px;
    -webkit-mask-image: linear-gradient(to left, rgba(0,0,0,.8) 0%, transparent 100%);
    mask-image: linear-gradient(to left, rgba(0,0,0,.8) 0%, transparent 100%);
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--primary); color: #fff;
    font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    padding: 5px 14px; border-radius: 100px; margin-bottom: 20px;
  }
  .hero-title { font-size: clamp(28px, 4vw, 46px); font-weight: 900; letter-spacing: -1.5px; line-height: 1.08; color: #fff; margin-bottom: 18px; max-width: 560px; }
  .hero-sub { font-size: 14px; color: rgba(255,255,255,.65); max-width: 440px; line-height: 1.65; }

  /* ── KPI row ── */
  .kpi-row { display: grid; grid-template-columns: 1fr 1fr 1.6fr; gap: 14px; margin-bottom: 24px; }
  .kpi-card { padding: 22px 24px; border-radius: var(--radius); background: #1a1f35; color: #fff; }
  .kpi-icon { font-size: 18px; margin-bottom: 14px; }
  .kpi-val { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: #fff; }
  .kpi-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.45); margin-top: 4px; }
  .kpi-chart-card {
    padding: 20px 22px; border-radius: var(--radius);
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex; flex-direction: column;
  }
  .kpi-chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
  .kpi-chart-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.75); }
  .kpi-chart-icon { color: rgba(255,255,255,.75); font-size: 16px; }
  .kpi-chart-bars { flex: 1; display: flex; align-items: flex-end; }

  /* ── Diagnosis section ── */
  .diagnosis-grid { display: grid; grid-template-columns: 1fr 300px; gap: 20px; align-items: start; }
  .retos-list { display: flex; flex-direction: column; gap: 12px; }
  .reto-card { background: var(--card-bg); border-radius: var(--radius); padding: 22px 24px; box-shadow: 0 1px 10px rgba(0,0,0,.06); }
  .reto-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 9px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 100px; border: 1px solid; margin-bottom: 10px; }
  .reto-title { font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
  .reto-desc { font-size: 13px; color: var(--muted); line-height: 1.55; margin-bottom: 14px; }
  .reto-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid var(--border); }
  .reto-footer-label { font-size: 11px; color: var(--muted); }
  .reto-footer-val { font-size: 13px; font-weight: 700; color: var(--text); }

  /* ── ROI sidebar card ── */
  .roi-card { background: var(--card-bg); border-radius: var(--radius); padding: 24px; box-shadow: 0 1px 10px rgba(0,0,0,.06); }
  .roi-title { font-size: 16px; font-weight: 800; color: var(--text); margin-bottom: 18px; line-height: 1.3; }
  .progress-row { margin-bottom: 14px; }
  .progress-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
  .progress-label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: var(--muted); }
  .progress-val { font-size: 11px; font-weight: 700; color: var(--text); }
  .progress-track { height: 5px; background: #f0f1f5; border-radius: 100px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 100px; }
  .roi-growth { margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--border); }
  .roi-growth-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--primary); margin-bottom: 4px; }
  .roi-growth-val { font-size: 28px; font-weight: 900; letter-spacing: -1.5px; color: var(--text); }
  .roi-growth-sub { font-size: 11px; color: var(--muted); }
  .cta-btn { display: block; text-align: center; padding: 13px; border-radius: 12px; font-weight: 700; font-size: 13px; color: #fff; text-decoration: none; margin-top: 16px; transition: opacity .2s; }
  .cta-btn:hover { opacity: .88; }

  /* ── Method dark section ── */
  .method-section { background: #0b1120; border-radius: 20px; padding: 40px 44px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
  .method-title { font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -.5px; margin-bottom: 28px; }
  .method-steps { display: flex; flex-direction: column; gap: 22px; }
  .method-step { display: flex; gap: 16px; }
  .method-num { font-size: 20px; font-weight: 900; color: rgba(255,255,255,.2); flex-shrink: 0; width: 32px; }
  .method-body { border-left: 1px solid rgba(255,255,255,.1); padding-left: 16px; }
  .method-title-step { font-size: 15px; font-weight: 700; color: #fff; margin-bottom: 4px; }
  .method-desc { font-size: 13px; color: rgba(255,255,255,.5); line-height: 1.55; }
  .method-img { border-radius: 16px; background: linear-gradient(135deg, rgba(124,58,237,.3), rgba(192,38,211,.2)); height: 220px; display: flex; align-items: center; justify-content: center; }
  .method-img-inner { font-size: 48px; opacity: .4; }

  /* ── Investment ── */
  .inv-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .inv-card { padding: 28px; }
  .inv-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 6px; }
  .inv-price { font-size: clamp(26px, 3.5vw, 40px); font-weight: 900; letter-spacing: -1.5px; color: var(--text); margin-bottom: 16px; }
  .inv-terms { font-size: 13px; color: var(--muted); line-height: 1.6; margin-bottom: 16px; }
  .inv-incluye { list-style: none; display: flex; flex-direction: column; gap: 8px; }
  .inv-incluye li { font-size: 13px; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .inv-incluye li::before { content: "✓"; color: var(--primary); font-weight: 700; flex-shrink: 0; }
  .inv-cta { margin-top: 20px; }
  .inv-confirm { display: block; text-align: center; padding: 14px; border-radius: 12px; font-weight: 700; font-size: 14px; color: #fff; text-decoration: none; background: var(--primary); transition: opacity .2s; }
  .inv-confirm:hover { opacity: .88; }

  /* ── Footer ── */
  .footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-top: 24px; border-top: 1px solid var(--border); }
  .footer-left { font-size: 11px; color: var(--muted); }

  /* ── Mobile ── */
  .mobile-bar { display: none; position: sticky; top: 0; z-index: 200; background: rgba(255,255,255,.95); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 12px 20px; align-items: center; justify-content: space-between; }
  .mobile-bar-name { font-size: 14px; font-weight: 800; color: var(--primary); }
  .mobile-cta { padding: 8px 16px; border-radius: 10px; font-size: 12px; font-weight: 700; color: #fff; text-decoration: none; }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .mobile-bar { display: flex; }
    .main { margin-left: 0; padding: 20px 16px 60px; }
    .kpi-row { grid-template-columns: 1fr 1fr; }
    .kpi-chart-card { grid-column: span 2; }
    .diagnosis-grid { grid-template-columns: 1fr; }
    .method-section { grid-template-columns: 1fr; padding: 28px 24px; }
    .method-img { display: none; }
    .inv-grid { grid-template-columns: 1fr; }
    .hero { padding: 28px 24px; }
  }
  @media (max-width: 480px) {
    .kpi-row { grid-template-columns: 1fr; }
    .kpi-chart-card { grid-column: span 1; }
  }
</style>
</head>
<body>

<!-- Mobile bar -->
<div class="mobile-bar">
  <span class="mobile-bar-name">${esc(brand.agencyName)}</span>
  ${proposalId ? `<a href="/api/proposals/accept?id=${proposalId}" class="mobile-cta" style="background:${p};">Aprobar</a>` : ""}
</div>

<!-- Sidebar -->
<aside class="sidebar">
  ${logoHtml}
  <div class="sidebar-agency">${esc(brand.agencyName)}</div>
  <div class="sidebar-sub">Bespoke Proposal</div>
  <nav class="sidebar-nav">${navHtml}</nav>
  <div class="sidebar-footer">
    <div class="sidebar-footer-avatar">${esc(brand.agencyName).slice(0,2).toUpperCase()}</div>
    <div class="sidebar-footer-text">
      <div class="sidebar-footer-name">${proposalId ? `Propuesta #${proposalId.slice(0,4)}` : "Propuesta"}</div>
      <div class="sidebar-footer-meta">Ver. 2.1 Final</div>
    </div>
  </div>
</aside>

<div class="main">

  <!-- Hero -->
  <section class="main-section" id="intro">
    <div class="hero">
      <div class="hero-dots"></div>
      <div class="hero-badge">Estrategia Basada en Datos</div>
      <h1 class="hero-title">${esc(c.resumenCreativo)}</h1>
      <p class="hero-sub">${esc(c.entendimientoDelCliente)}</p>
    </div>
  </section>

  <!-- KPI Row -->
  <section class="main-section" id="estrategia">
    <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-icon">📈</div>
        <div class="kpi-val">${esc(kpi1)}</div>
        <div class="kpi-label">${kpi1Label}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-icon">👥</div>
        <div class="kpi-val">${esc(kpi2)}</div>
        <div class="kpi-label">${kpi2Label}</div>
      </div>
      <div class="kpi-chart-card">
        <div class="kpi-chart-header">
          <span class="kpi-chart-label">Eficacia de Canales</span>
          <span class="kpi-chart-icon">↗</span>
        </div>
        <div class="kpi-chart-bars">${barChart}</div>
      </div>
    </div>
  </section>

  <!-- Diagnóstico de Retos -->
  <section class="main-section">
    <div class="section-label">Diagnóstico de Retos</div>
    <h2 class="section-title">Puntos Críticos Detectados</h2>
    <div class="diagnosis-grid">
      <div class="retos-list">${retosHtml}</div>
      <div class="roi-card">
        <div class="roi-title">ROI Proyectado (Q3-Q4)</div>
        ${progressHtml}
        <div class="roi-growth">
          <div class="roi-growth-label">Net Growth Estimate</div>
          <div class="roi-growth-val">${esc(c.inversion?.total || "$284,500")}<span style="font-size:14px;font-weight:600;opacity:.6;">/yr</span></div>
          <div class="roi-growth-sub">${esc(c.inversion?.terminos || "Resultado estimado anualizado")}</div>
        </div>
        ${acceptBtn}
      </div>
    </div>
  </section>

  <!-- El Método -->
  <section class="main-section" id="enfoque">
    <div class="method-section">
      <div>
        <div class="method-title">El Método: ${esc(c.tipoProyecto || "Precision Labs")}™</div>
        <div class="method-steps">${fasesHtml}</div>
      </div>
      <div class="method-img">
        <div class="method-img-inner">🎯</div>
      </div>
    </div>
  </section>

  <!-- Inversión -->
  <section class="main-section" id="inversion">
    <div class="section-label">Value Structure</div>
    <h2 class="section-title">Desglose de Inversión</h2>
    <div class="card">
      <div class="inv-grid">
        <div class="inv-card">
          <div class="inv-label">Inversión Total</div>
          <div class="inv-price">${esc(c.inversion?.total || "")}</div>
          <p class="inv-terms">${esc(c.inversion?.terminos || "")}</p>
          <ul class="inv-incluye">
            ${(c.inversion?.incluye || []).map(item => `<li>${esc(item)}</li>`).join("")}
          </ul>
        </div>
        <div class="inv-card inv-cta" style="display:flex;flex-direction:column;justify-content:flex-end;">
          <p style="font-size:13px;color:var(--muted);line-height:1.6;margin-bottom:16px;">${esc(c.enfoqueCreativo?.descripcion || "Una inversión estratégica con retorno medible.")}</p>
          ${proposalId
            ? `<a href="/api/proposals/accept?id=${proposalId}" class="inv-confirm">Confirmar Inversión</a>`
            : `<a href="#" class="inv-confirm">Confirmar Inversión</a>`}
        </div>
      </div>
    </div>
  </section>

  ${termsHtml}

  <footer class="footer">
    <div class="footer-left">© ${new Date().getFullYear()} ${esc(brand.agencyName)} · ${clientLabel} · Confidencial</div>
    ${senderHtml}
    <div style="font-size:11px;color:#9ca3af;">${fecha}</div>
  </footer>

</div>
</body>
</html>`;
}
