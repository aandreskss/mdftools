import type { BrandConfig } from "./proposal-templates/types";

// ─── Data schema that Claude returns (JSON only) ──────────────────────────────

export interface DesignProposalContent {
  tipoProyecto: string;
  resumenCreativo: string;
  entendimientoDelCliente: string;
  retosDetectados: { titulo: string; descripcion: string }[];
  enfoqueCreativo: { descripcion: string; pilares: string[] };
  entregables: string[];
  fases: { numero: number; titulo: string; descripcion: string; duracion: string }[];
  resultadosEsperados: string[];
  inversion: { total: string; incluye: string[]; terminos: string };
  porQueNosotros: { titulo: string; descripcion: string }[];
  proximosPasos: string[];
}

// ─── Helper renderers ─────────────────────────────────────────────────────────

function esc(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function challengeCards(items: { titulo: string; descripcion: string }[]): string {
  return items.map(c => `
    <div class="challenge-item">
      <div class="challenge-dot"></div>
      <div class="challenge-content">
        <div class="challenge-title">${esc(c.titulo)}</div>
        <div class="challenge-desc">${esc(c.descripcion)}</div>
      </div>
    </div>`).join("");
}

function pillarList(items: string[]): string {
  return items.map(i => `
    <div class="pillar-item">
      <div class="pillar-icon">✦</div>
      <span>${esc(i)}</span>
    </div>`).join("");
}

function deliverableList(items: string[]): string {
  return items.map(i => `
    <div class="deliverable-item">
      <div class="deliverable-check">
        <svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
      </div>
      <span>${esc(i)}</span>
    </div>`).join("");
}

function phaseCards(items: { numero: number; titulo: string; descripcion: string; duracion: string }[]): string {
  return items.map(p => `
    <div class="phase-card">
      <div class="phase-number">${p.numero}</div>
      <div class="phase-content">
        <div class="phase-header">
          <div class="phase-title">${esc(p.titulo)}</div>
          <div class="phase-duration">${esc(p.duracion)}</div>
        </div>
        <div class="phase-desc">${esc(p.descripcion)}</div>
      </div>
    </div>`).join("");
}

function differentiatorCards(items: { titulo: string; descripcion: string }[]): string {
  return items.map(c => `
    <div class="diff-card">
      <div class="diff-title">${esc(c.titulo)}</div>
      <div class="diff-desc">${esc(c.descripcion)}</div>
    </div>`).join("");
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function renderDesignProposalHtml(
  content: DesignProposalContent,
  agencyName: string,
  clientName: string,
  clientCompany?: string,
  proposalId?: string,
  brandConfig?: BrandConfig,
): string {
  const clientLabel = clientCompany ? `${esc(clientName)} · ${esc(clientCompany)}` : esc(clientName);
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const primaryColor = brandConfig?.primaryColor || "#7C3AED";
  const accentColor  = brandConfig?.secondaryColor || "#EC4899";
  const senderName   = brandConfig?.senderName || "";
  const termsText    = brandConfig?.termsConditions || "";
  const logoUrl      = brandConfig?.logoUrl || "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Propuesta de Diseño — ${esc(clientName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --primary: ${primaryColor};
    --primary-light: #EDE9FE;
    --primary-dark: #5B21B6;
    --accent: ${accentColor};
    --accent-light: #FCE7F3;
    --text-main: #1E1B4B;
    --text-muted: #6B7280;
    --bg-main: #FAFAFA;
    --bg-card: #FFFFFF;
    --border: #E5E7EB;
    --radius-lg: 24px;
    --radius-md: 14px;
    --shadow: 0 4px 24px rgba(124,58,237,0.06), 0 1px 3px rgba(0,0,0,0.04);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg-main);
    color: var(--text-main);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    font-family: 'Sora', sans-serif;
    line-height: 1.2;
  }

  /* ── Layout ── */
  .main-container {
    display: grid;
    grid-template-columns: 260px 1fr;
    max-width: 1200px;
    margin: 40px auto;
    gap: 32px;
    padding: 0 24px;
  }

  @media (max-width: 1024px) {
    .main-container { grid-template-columns: 1fr; margin: 0; padding: 0; gap: 0; }
    .sidebar { display: none; }
  }

  /* ── Sidebar ── */
  .sidebar {
    position: sticky;
    top: 40px;
    height: fit-content;
  }

  .sidebar-inner {
    padding: 28px;
    background: white;
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }

  .nav-logo {
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    font-size: 16px;
    color: var(--primary);
    margin-bottom: 28px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-divider {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--text-muted);
    margin: 16px 0 8px;
    padding: 0 12px;
    opacity: 0.5;
  }

  .nav-menu { list-style: none; }
  .nav-item { margin-bottom: 4px; }
  .nav-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: var(--text-muted);
    font-size: 13px;
    font-weight: 500;
    transition: all 0.15s;
  }
  .nav-link:hover { background: var(--primary-light); color: var(--primary); }
  .nav-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.4;
    flex-shrink: 0;
  }

  .sidebar-badge {
    margin-top: 24px;
    padding: 16px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%);
    border-radius: 12px;
    color: white;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    line-height: 1.5;
  }

  /* ── Content ── */
  .content-area {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  /* ── Hero ── */
  .hero {
    background: linear-gradient(135deg, #1E1B4B 0%, #312E81 40%, #4C1D95 100%);
    padding: 72px 56px;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .hero-glow-1 {
    position: absolute;
    top: -80px;
    right: -80px;
    width: 360px;
    height: 360px;
    background: radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 70%);
    border-radius: 50%;
  }

  .hero-glow-2 {
    position: absolute;
    bottom: -120px;
    left: 20%;
    width: 280px;
    height: 280px;
    background: radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%);
    border-radius: 50%;
  }

  .hero-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: rgba(255,255,255,0.8);
    margin-bottom: 20px;
  }

  .hero-agency {
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: #C4B5FD;
    margin-bottom: 12px;
  }

  .hero-title {
    font-family: 'Sora', sans-serif;
    font-size: 46px;
    font-weight: 800;
    color: white;
    margin-bottom: 20px;
    max-width: 560px;
    line-height: 1.1;
    background: linear-gradient(135deg, #fff 0%, #DDD6FE 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-subtitle {
    font-size: 16px;
    color: rgba(255,255,255,0.6);
    max-width: 480px;
    line-height: 1.7;
    margin-bottom: 40px;
  }

  .hero-meta {
    display: flex;
    gap: 0;
    align-items: stretch;
    margin-top: 36px;
    padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.1);
    flex-wrap: wrap;
    gap: 24px;
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .meta-label {
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: rgba(255,255,255,0.4);
    font-weight: 700;
  }

  .meta-value {
    font-size: 14px;
    font-weight: 600;
    color: white;
    font-family: 'Sora', sans-serif;
  }

  /* ── Sections ── */
  .section {
    padding: 56px;
    border-bottom: 1px solid var(--border);
  }
  .section:last-child { border-bottom: none; }

  .section-eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    background: linear-gradient(135deg, var(--primary-light), var(--accent-light));
    border-radius: 100px;
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--primary);
    margin-bottom: 16px;
  }

  .section-title {
    font-size: 28px;
    font-weight: 800;
    color: var(--text-main);
    margin-bottom: 10px;
    font-family: 'Sora', sans-serif;
  }

  .section-desc {
    font-size: 15px;
    color: var(--text-muted);
    max-width: 640px;
    line-height: 1.7;
    margin-bottom: 32px;
  }

  /* ── Understanding card ── */
  .understanding-card {
    padding: 28px 32px;
    background: linear-gradient(135deg, #F5F3FF 0%, #FDF2F8 100%);
    border: 1px solid #DDD6FE;
    border-radius: var(--radius-md);
    font-size: 15px;
    line-height: 1.8;
    color: #3730A3;
    font-style: italic;
  }

  /* ── Challenge items ── */
  .challenges-list { display: grid; gap: 20px; }
  .challenge-item {
    display: flex;
    gap: 16px;
    padding: 22px 24px;
    background: #FFF7F7;
    border: 1px solid #FECDD3;
    border-radius: var(--radius-md);
  }
  .challenge-dot {
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 50%;
    margin-top: 9px;
    flex-shrink: 0;
  }
  .challenge-title { font-weight: 700; font-size: 15px; color: #9F1239; margin-bottom: 4px; font-family: 'Sora', sans-serif; }
  .challenge-desc { font-size: 13px; color: #BE123C; line-height: 1.6; }

  /* ── Creative approach ── */
  .approach-card {
    padding: 32px;
    background: linear-gradient(135deg, #1E1B4B 0%, #4C1D95 100%);
    border-radius: var(--radius-lg);
    color: white;
    margin-bottom: 24px;
  }
  .approach-desc { font-size: 15px; line-height: 1.8; opacity: 0.85; margin-bottom: 24px; }
  .pillars-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
  .pillar-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
  }
  .pillar-icon { color: #C4B5FD; font-size: 12px; flex-shrink: 0; }

  /* ── Deliverables ── */
  .deliverables-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }
  .deliverable-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px 18px;
    background: var(--bg-main);
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
    transition: border-color 0.2s;
  }
  .deliverable-item:hover { border-color: var(--primary); }
  .deliverable-check {
    width: 22px;
    height: 22px;
    min-width: 22px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    color: white;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .deliverable-check svg { width: 13px; height: 13px; }

  /* ── Phases ── */
  .phases-list { display: grid; gap: 16px; }
  .phase-card {
    display: flex;
    gap: 20px;
    padding: 24px;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition: all 0.2s;
  }
  .phase-card:hover { border-color: var(--primary); box-shadow: 0 4px 20px rgba(124,58,237,0.08); }
  .phase-number {
    width: 40px;
    height: 40px;
    min-width: 40px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    color: white;
    border-radius: 12px;
    font-weight: 800;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: 'Sora', sans-serif;
  }
  .phase-content { flex: 1; }
  .phase-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
  .phase-title { font-weight: 700; font-size: 16px; font-family: 'Sora', sans-serif; }
  .phase-duration {
    font-size: 12px;
    font-weight: 700;
    color: var(--primary);
    background: var(--primary-light);
    padding: 3px 10px;
    border-radius: 100px;
  }
  .phase-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

  /* ── Results ── */
  .results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
  }
  .result-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 16px;
    border-radius: var(--radius-md);
    background: linear-gradient(135deg, #F5F3FF, #FDF2F8);
    border: 1px solid #DDD6FE;
    font-size: 14px;
    font-weight: 500;
    color: var(--primary-dark);
  }

  /* ── Investment ── */
  .inv-hero {
    background: linear-gradient(135deg, #1E1B4B 0%, #4C1D95 60%, #831843 100%);
    border-radius: var(--radius-lg);
    padding: 56px;
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
    margin-bottom: 32px;
  }
  .inv-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  }
  .inv-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.15em; color: #C4B5FD; margin-bottom: 12px; }
  .inv-amount { font-family: 'Sora', sans-serif; font-size: 60px; font-weight: 800; margin-bottom: 12px; letter-spacing: -0.03em; }
  .inv-terms { font-size: 14px; opacity: 0.55; margin-bottom: 36px; max-width: 360px; margin-left: auto; margin-right: auto; }
  .inv-tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  .inv-tag {
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.12);
    padding: 8px 18px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
  }

  .next-steps-card {
    padding: 28px 32px;
    border: 1.5px dashed #DDD6FE;
    border-radius: var(--radius-md);
    background: #FAFAFA;
  }
  .next-steps-title {
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 16px;
    color: var(--primary);
    margin-bottom: 16px;
  }
  .next-step-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    font-size: 14px;
    color: var(--text-muted);
    margin-bottom: 10px;
  }
  .next-step-item:last-child { margin-bottom: 0; }
  .step-arrow { color: var(--primary); font-weight: 700; margin-top: 1px; }

  /* ── Differentiators ── */
  .diff-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 640px) { .diff-grid { grid-template-columns: 1fr; } }
  .diff-card {
    padding: 24px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition: all 0.2s;
  }
  .diff-card:hover { border-color: var(--primary); box-shadow: 0 4px 20px rgba(124,58,237,0.06); }
  .diff-title { font-weight: 800; font-size: 17px; margin-bottom: 10px; color: var(--primary); font-family: 'Sora', sans-serif; }
  .diff-desc { font-size: 14px; color: var(--text-muted); line-height: 1.6; }

  /* ── Floating CTA ── */
  .floating-cta {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    color: white;
    padding: 16px 28px;
    border-radius: 100px;
    font-family: 'Sora', sans-serif;
    font-weight: 700;
    font-size: 14px;
    text-decoration: none;
    border: none;
    cursor: pointer;
    box-shadow: 0 8px 32px rgba(124, 58, 237, 0.35);
    z-index: 100;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .floating-cta:hover { transform: scale(1.04); box-shadow: 0 12px 40px rgba(124,58,237,0.5); }

  /* ── Footer ── */
  .footer {
    padding: 48px 56px;
    background: #F9FAFB;
    text-align: center;
    font-size: 13px;
    color: var(--text-muted);
    border-top: 1px solid var(--border);
  }
  .footer-logo {
    font-family: 'Sora', sans-serif;
    font-weight: 800;
    font-size: 18px;
    background: linear-gradient(135deg, var(--primary), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  @media print {
    .main-container { display: block; margin: 0; padding: 0; }
    .sidebar, .floating-cta { display: none; }
    .content-area { border: none; box-shadow: none; border-radius: 0; }
    .hero { padding: 40px; }
    .section { padding: 40px; page-break-inside: avoid; }
    .hero-glow-1, .hero-glow-2 { display: none; }
  }
</style>
</head>
<body>

  <div class="main-container">
    <!-- Navegación lateral -->
    <aside class="sidebar">
      <div class="sidebar-inner">
        <div class="nav-logo">
          ${logoUrl ? `<img src="${esc(logoUrl)}" style="max-height:40px;max-width:150px;object-fit:contain;display:block;margin-bottom:6px;" alt="${esc(agencyName)}" />` : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`}
          ${esc(agencyName)}
        </div>
        <p class="nav-divider">Contenido</p>
        <nav>
          <ul class="nav-menu">
            <li class="nav-item"><a href="#comprension" class="nav-link"><div class="nav-dot"></div> Comprensión del Cliente</a></li>
            <li class="nav-item"><a href="#retos" class="nav-link"><div class="nav-dot"></div> Retos Detectados</a></li>
            <li class="nav-item"><a href="#enfoque" class="nav-link"><div class="nav-dot"></div> Enfoque Creativo</a></li>
            <li class="nav-item"><a href="#entregables" class="nav-link"><div class="nav-dot"></div> Entregables</a></li>
            <li class="nav-item"><a href="#fases" class="nav-link"><div class="nav-dot"></div> Fases del Proyecto</a></li>
            <li class="nav-item"><a href="#inversion" class="nav-link"><div class="nav-dot"></div> Inversión</a></li>
            <li class="nav-item"><a href="#nosotros" class="nav-link"><div class="nav-dot"></div> Por Qué Nosotros</a></li>
          </ul>
        </nav>
        <div class="sidebar-badge">
          ✦ Propuesta de Diseño<br>
          <span style="font-weight:400;opacity:0.8;">Preparada especialmente<br>para ${esc(clientName)}</span>
        </div>
      </div>
    </aside>

    <!-- Contenido principal -->
    <main class="content-area">

      <!-- HERO -->
      <header class="hero">
        <div class="hero-glow-1"></div>
        <div class="hero-glow-2"></div>
        <div style="position:relative;z-index:1;">
          <div class="hero-tag">✦ Propuesta de Diseño</div>
          <div class="hero-agency">${esc(agencyName)}</div>
          <h1 class="hero-title">${esc(content.tipoProyecto)}</h1>
          <p class="hero-subtitle">${esc(content.resumenCreativo)}</p>
          <div class="hero-meta">
            <div class="meta-item">
              <span class="meta-label">Preparada para</span>
              <span class="meta-value">${clientLabel}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">Fecha</span>
              <span class="meta-value">${fecha}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- COMPRENSIÓN DEL CLIENTE -->
      <section id="comprension" class="section">
        <span class="section-eyebrow">✦ Entendemos tu Visión</span>
        <h2 class="section-title">Comprensión del Cliente</h2>
        <p class="section-desc">Antes de diseñar, escuchamos. Esto es lo que entendemos de tu proyecto:</p>
        <div class="understanding-card">"${esc(content.entendimientoDelCliente)}"</div>
      </section>

      <!-- RETOS DETECTADOS -->
      <section id="retos" class="section">
        <span class="section-eyebrow">⚡ Análisis</span>
        <h2 class="section-title">Retos Detectados</h2>
        <p class="section-desc">Identificamos los desafíos que tu diseño actual necesita superar para destacar.</p>
        <div class="challenges-list">
          ${challengeCards(content.retosDetectados)}
        </div>
      </section>

      <!-- ENFOQUE CREATIVO -->
      <section id="enfoque" class="section">
        <span class="section-eyebrow">✦ Estrategia Creativa</span>
        <h2 class="section-title">Nuestro Enfoque Creativo</h2>
        <p class="section-desc">La dirección visual y conceptual que guiará todo el proyecto.</p>
        <div class="approach-card">
          <p class="approach-desc">${esc(content.enfoqueCreativo.descripcion)}</p>
          <div class="pillars-grid">
            ${pillarList(content.enfoqueCreativo.pilares)}
          </div>
        </div>
      </section>

      <!-- ENTREGABLES -->
      <section id="entregables" class="section">
        <span class="section-eyebrow">📦 Alcance</span>
        <h2 class="section-title">Entregables del Proyecto</h2>
        <p class="section-desc">Todo lo que recibirás al finalizar el proyecto, listo para usar.</p>
        <div class="deliverables-grid">
          ${deliverableList(content.entregables)}
        </div>
      </section>

      <!-- FASES -->
      <section id="fases" class="section">
        <span class="section-eyebrow">🗓 Metodología</span>
        <h2 class="section-title">Fases del Proyecto</h2>
        <p class="section-desc">Nuestro proceso garantiza resultados de calidad en cada etapa del diseño.</p>
        <div class="phases-list">
          ${phaseCards(content.fases)}
        </div>

        ${content.resultadosEsperados?.length ? `
        <div style="margin-top:32px;">
          <h3 style="font-family:'Sora',sans-serif;font-size:18px;font-weight:700;margin-bottom:16px;color:var(--text-main);">Resultados Esperados</h3>
          <div class="results-grid">
            ${content.resultadosEsperados.map(r => `
              <div class="result-item">
                <span style="color:var(--primary);font-size:16px;margin-top:1px;">✦</span>
                <span>${esc(r)}</span>
              </div>`).join("")}
          </div>
        </div>` : ""}
      </section>

      <!-- INVERSIÓN -->
      <section id="inversion" class="section">
        <span class="section-eyebrow">💰 Presupuesto</span>
        <h2 class="section-title">Inversión del Proyecto</h2>
        <div class="inv-hero">
          <div style="position:relative;z-index:1;">
            <div class="inv-label">Inversión Total</div>
            <div class="inv-amount">${esc(content.inversion.total)}</div>
            <div class="inv-terms">${esc(content.inversion.terminos)}</div>
            <div class="inv-tags">
              ${content.inversion.incluye.map(i => `<div class="inv-tag">✓ ${esc(i)}</div>`).join("")}
            </div>
          </div>
        </div>
        <div class="next-steps-card">
          <div class="next-steps-title">Próximos Pasos</div>
          ${content.proximosPasos.map(s => `
            <div class="next-step-item">
              <span class="step-arrow">→</span>
              <span>${esc(s)}</span>
            </div>`).join("")}
        </div>
      </section>

      <!-- POR QUÉ NOSOTROS -->
      <section id="nosotros" class="section">
        <span class="section-eyebrow">⭐ Confianza</span>
        <h2 class="section-title">¿Por Qué Elegir a ${esc(agencyName)}?</h2>
        <p class="section-desc">Lo que nos hace diferentes y el valor que aportamos a cada proyecto.</p>
        <div class="diff-grid">
          ${differentiatorCards(content.porQueNosotros)}
        </div>
      </section>

      ${termsText ? `
      <section style="padding:48px 60px;border-top:1px solid rgba(255,255,255,0.08);background:#0e0e0e;">
        <div style="max-width:700px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--primary);margin-bottom:12px;">Términos y Condiciones</div>
          <p style="font-size:13px;color:#9ca3af;line-height:1.7;white-space:pre-wrap;">${esc(termsText)}</p>
        </div>
      </section>` : ""}
      <footer class="footer">
        ${logoUrl ? `<img src="${esc(logoUrl)}" alt="${esc(agencyName)}" style="max-height:40px;max-width:150px;object-fit:contain;margin:0 auto 12px;display:block;"/>` : `<div class="footer-logo">${esc(agencyName)}</div>`}
        <p>Propuesta preparada por <strong>${esc(agencyName)}</strong> para <strong>${clientLabel}</strong></p>
        ${senderName ? `<p style="margin-top:6px;font-size:13px;font-weight:600;">Presentado por: ${esc(senderName)}</p>` : ""}
        <p style="margin-top:6px;font-size:12px;opacity:0.5;">Válida por 30 días naturales. Reservados todos los derechos.</p>
      </footer>

    </main>
  </div>

  ${proposalId ? `
  <button class="floating-cta" id="accept-btn" onclick="acceptProposal('${proposalId}')">
    ✦ Aceptar Propuesta
  </button>

  <script>
    async function acceptProposal(id) {
      var btn = document.getElementById('accept-btn');
      if (!btn || btn.disabled) return;
      btn.disabled = true;
      btn.textContent = 'Procesando...';
      btn.style.opacity = '0.7';
      try {
        var res = await fetch('/api/design-proposals/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id })
        });
        if (res.ok) {
          btn.textContent = '✓ ¡Propuesta Aceptada!';
          btn.style.background = '#059669';
          btn.style.opacity = '1';
          btn.style.boxShadow = '0 10px 15px -3px rgba(5,150,105,0.4)';
          var toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;bottom:100px;right:32px;background:#065F46;color:white;padding:16px 24px;border-radius:12px;font-weight:600;font-size:14px;z-index:200;box-shadow:0 4px 20px rgba(0,0,0,0.25);';
          toast.textContent = '\\uD83C\\uDF89 \\u00A1Gracias! Nos pondremos en contacto pronto.';
          document.body.appendChild(toast);
        } else {
          btn.textContent = '✦ Aceptar Propuesta';
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      } catch(e) {
        btn.textContent = '✦ Aceptar Propuesta';
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    }
  </script>
  ` : ""}

</body>
</html>`;
}
