import type { DesignProposalContent } from "@/lib/design-proposal-template";
import type { BrandConfig } from "./types";

function esc(s: string): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderElegantTemplate(
  c: DesignProposalContent,
  brand: BrandConfig,
  clientName: string,
  clientCompany?: string,
  proposalId?: string,
): string {
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const clientLabel = clientCompany ? `${esc(clientName)} · ${esc(clientCompany)}` : esc(clientName);
  const p = brand.primaryColor || "#6e3ac9";
  const s = brand.secondaryColor || "#b00d6a";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" class="sidebar-logo" alt="logo"/>` : "";

  const retosHtml = (c.retosDetectados || []).map((r, i) => `
    <div class="reto-card ${i === (c.retosDetectados || []).length - 1 ? "reto-full" : ""}">
      <div class="reto-icon-box" style="background:color-mix(in srgb,${p} 10%,transparent);">
        ${["⚡","🎯","🔗","📊"][i % 4]}
      </div>
      <h4 class="reto-title">${esc(r.titulo)}</h4>
      <p class="reto-desc">${esc(r.descripcion)}</p>
      <div class="reto-tag" style="color:${p};background:color-mix(in srgb,${p} 8%,transparent);">Identificado</div>
    </div>`).join("");

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map(p_ => `
    <div class="pilar-row">
      <span class="pilar-check" style="color:${p};">✓</span>
      <div>
        <div class="pilar-name">${esc(p_)}</div>
      </div>
    </div>`).join("");

  const entregablesHtml = (c.entregables || []).map(e => `
    <div class="entregable-row">
      <span class="entregable-dot" style="background:${p};"></span>
      <span class="entregable-name">${esc(e)}</span>
    </div>`).join("");

  const fasesHtml = (c.fases || []).map((f, i) => `
    <div class="fase-item${i < (c.fases || []).length - 1 ? " fase-connected" : ""}">
      <div class="fase-dot ${i === 0 ? "fase-dot-active" : ""}" style="${i === 0 ? `background:${p};border-color:${p};` : ""}"></div>
      <div class="fase-body">
        <h4 class="fase-title">${esc(f.titulo)}</h4>
        <div class="fase-dur" style="color:${p};">${esc(f.duracion)}</div>
        <p class="fase-desc">${esc(f.descripcion)}</p>
      </div>
    </div>`).join("");

  const invLinesHtml = (c.inversion?.incluye || []).map(item => `
    <div class="inv-line">
      <span class="inv-line-label">${esc(item)}</span>
      <span class="inv-line-val">Incluido</span>
    </div>`).join("");

  const pasosHtml = (c.proximosPasos || []).map((p_, i) => `
    <div class="paso-col">
      <div class="paso-num" style="background:color-mix(in srgb,${p} 10%,transparent);color:${p};">${i + 1}</div>
      <h5 class="paso-title">${esc(p_)}</h5>
    </div>`).join("");

  const porQueHtml = (c.porQueNosotros || []).map(q => `
    <div class="porq-col">
      <div class="porq-ring" style="background:linear-gradient(135deg,${p},${s});">
        <div class="porq-ring-inner">✦</div>
      </div>
      <h5 class="porq-title">${esc(q.titulo)}</h5>
      <p class="porq-desc">${esc(q.descripcion)}</p>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section class="padded section">
      <h2 class="content-title">Términos y Condiciones</h2>
      <div class="card" style="padding:28px;font-size:13px;line-height:1.8;color:#5a6278;white-space:pre-wrap;">${esc(brand.termsConditions)}</div>
    </section>` : "";

  const senderHtml = brand.senderName
    ? `<span class="footer-sender">Presentado por <strong>${esc(brand.senderName)}</strong></span>` : "";

  const acceptBtn = proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" class="accept-btn" style="background:linear-gradient(135deg,${p},${s});">Aceptar Propuesta</a>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Propuesta — ${esc(clientName)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>
  :root {
    --primary: ${p};
    --secondary: ${s};
    --bg: #f5f6fb;
    --card: #ffffff;
    --text: #1a1c2b;
    --muted: #5a6278;
    --border: #e3e6f0;
    --dark: #0c0d15;
    --sidebar-w: 240px;
    --radius: 20px;
    --content-max: 860px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed; left: 0; top: 0; height: 100vh; width: var(--sidebar-w);
    background: var(--dark); display: flex; flex-direction: column;
    padding: 28px 20px; z-index: 100; overflow-y: auto;
  }
  .sidebar-logo { max-height: 32px; max-width: 120px; object-fit: contain; margin-bottom: 10px; }
  .sidebar-name { font-size: 17px; font-weight: 800; background: linear-gradient(135deg,var(--primary),var(--secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .sidebar-tag { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #3a3c4e; margin-top: 3px; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 2px; margin-top: 28px; flex: 1; }
  .sidebar-nav a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; font-size: 13px; font-weight: 500; color: #5a5e78; text-decoration: none; transition: all .18s; }
  .sidebar-nav a:hover { background: rgba(255,255,255,.06); color: #fff; }
  .sidebar-bottom { padding-top: 20px; border-top: 1px solid rgba(255,255,255,.07); margin-top: 16px; }
  .accept-btn { display: block; text-align: center; padding: 13px; border-radius: 100px; font-weight: 700; font-size: 14px; color: #fff; text-decoration: none; transition: opacity .2s; }
  .accept-btn:hover { opacity: .88; }

  /* ── Mobile bar ── */
  .mobile-bar { display: none; position: sticky; top: 0; z-index: 200; background: var(--dark); padding: 14px 20px; align-items: center; justify-content: space-between; }
  .mobile-bar-name { font-size: 15px; font-weight: 800; background: linear-gradient(135deg,var(--primary),var(--secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }

  /* ── Main ── */
  .main { margin-left: var(--sidebar-w); }
  .section { margin-bottom: 56px; }
  .padded { padding: 0 48px; }
  .content-inner { max-width: var(--content-max); margin: 0 auto; }
  .content-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: var(--primary); margin-bottom: 12px; display: block; }
  .content-title { font-size: clamp(22px, 3vw, 32px); font-weight: 800; letter-spacing: -1px; line-height: 1.2; margin-bottom: 16px; }
  .content-body { font-size: 15px; color: var(--muted); line-height: 1.7; }
  .card { background: var(--card); border-radius: var(--radius); box-shadow: 0 2px 16px rgba(0,0,0,.06); }

  /* ── Hero (full-width, no sidebar indent) ── */
  .hero {
    min-height: 500px; display: flex; flex-direction: column; justify-content: flex-end;
    position: relative; overflow: hidden; margin-bottom: 64px;
  }
  .hero-bg { position: absolute; inset: 0; background: linear-gradient(135deg, color-mix(in srgb,${p} 88%,#000), color-mix(in srgb,${s} 82%,#000)); }
  .hero-noise { position: absolute; inset: 0; background-image: radial-gradient(rgba(255,255,255,.04) 1px, transparent 1px); background-size: 22px 22px; }
  .hero-content { position: relative; z-index: 2; padding: 48px 52px 52px; max-width: 720px; }
  .hero-tag { display: inline-block; padding: 5px 14px; border-radius: 100px; background: rgba(255,255,255,.12); backdrop-filter: blur(8px); font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #fff; margin-bottom: 20px; }
  .hero-title { font-size: clamp(28px, 4.5vw, 54px); font-weight: 900; letter-spacing: -2px; line-height: 1.05; color: #fff; margin-bottom: 28px; }
  .hero-meta { display: flex; gap: 32px; flex-wrap: wrap; }
  .hero-meta-item { }
  .hero-meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.4); margin-bottom: 4px; }
  .hero-meta-val { font-size: 14px; font-weight: 600; color: rgba(255,255,255,.9); }

  /* ── Cliente 2-col ── */
  .cliente-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
  .quote-box { padding: 32px; position: relative; border-radius: var(--radius); background: color-mix(in srgb,var(--primary) 5%,transparent); }
  .quote-mark { font-size: 56px; line-height: .9; color: var(--primary); opacity: .2; font-family: Georgia, serif; position: absolute; top: 12px; left: 18px; }
  .quote-text { font-size: 17px; font-style: italic; font-weight: 600; color: var(--primary); line-height: 1.5; position: relative; z-index: 1; }

  /* ── Retos bento ── */
  .retos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .reto-card { padding: 24px; border-radius: var(--radius); background: var(--card); box-shadow: 0 4px 20px rgba(0,0,0,.05); }
  .reto-full { grid-column: 1 / -1; }
  .reto-icon-box { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-bottom: 14px; }
  .reto-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .reto-desc { font-size: 13px; color: var(--muted); line-height: 1.55; margin-bottom: 14px; }
  .reto-tag { display: inline-block; padding: 3px 10px; border-radius: 100px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

  /* ── Solucion full card ── */
  .solucion-card { padding: 28px; border-radius: var(--radius); margin-top: 14px; }

  /* ── Enfoque ── */
  .enfoque-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: center; }
  .pilar-row { display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid var(--border); }
  .pilar-row:last-child { border-bottom: none; }
  .pilar-check { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .pilar-name { font-size: 15px; font-weight: 700; color: var(--text); }
  .entregables-list { display: flex; flex-direction: column; gap: 8px; }
  .entregable-row { display: flex; align-items: center; gap: 12px; padding: 14px 18px; background: var(--bg); border-radius: 12px; }
  .entregable-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
  .entregable-name { font-size: 14px; font-weight: 500; color: var(--text); }

  /* ── Cronograma timeline ── */
  .fases-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 40px; }
  .fases-list { display: flex; flex-direction: column; gap: 0; }
  .fase-item { display: flex; gap: 20px; position: relative; padding-bottom: 28px; padding-left: 32px; }
  .fase-connected { border-left: 2px solid color-mix(in srgb,var(--primary) 15%,transparent); margin-left: 7px; }
  .fase-dot { position: absolute; left: -9px; top: 3px; width: 16px; height: 16px; border-radius: 50%; background: var(--bg); border: 2px solid rgba(90,98,120,.2); }
  .fase-dot-active { width: 18px; height: 18px; left: -10px; }
  .fase-body { flex: 1; }
  .fase-title { font-size: 17px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
  .fase-dur { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .fase-desc { font-size: 13px; color: var(--muted); line-height: 1.55; }

  /* ── Inversión dark split ── */
  .inv-split { display: grid; grid-template-columns: 1fr 1fr; }
  .inv-dark { background: var(--dark); padding: 52px 48px; }
  .inv-dark-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 3px; color: var(--primary); margin-bottom: 12px; }
  .inv-dark-title { font-size: clamp(22px, 3vw, 30px); font-weight: 800; color: #fff; letter-spacing: -1px; margin-bottom: 32px; }
  .inv-lines { display: flex; flex-direction: column; gap: 0; }
  .inv-line { display: flex; justify-content: space-between; align-items: center; padding: 14px 0; border-bottom: 1px solid rgba(255,255,255,.07); }
  .inv-line-label { font-size: 14px; color: rgba(255,255,255,.5); }
  .inv-line-val { font-size: 14px; font-weight: 700; color: #fff; }
  .inv-total { display: flex; justify-content: space-between; align-items: center; padding: 20px 0 0; }
  .inv-total-label { font-size: 18px; font-weight: 800; color: #fff; }
  .inv-total-val { font-size: clamp(24px, 3.5vw, 36px); font-weight: 900; color: var(--primary); letter-spacing: -1px; }
  .inv-note { font-size: 11px; color: rgba(255,255,255,.25); font-style: italic; margin-top: 16px; }
  .inv-visual { position: relative; min-height: 380px; overflow: hidden; }
  .inv-visual-bg { position: absolute; inset: 0; background: linear-gradient(135deg, color-mix(in srgb,${p} 70%,transparent), color-mix(in srgb,${s} 60%,transparent)); }
  .inv-visual-card { position: absolute; bottom: 28px; left: 24px; right: 24px; background: rgba(255,255,255,.1); backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,.12); border-radius: 16px; padding: 22px; }
  .inv-visual-card-title { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
  .inv-visual-card-title-icon { font-size: 18px; }
  .inv-visual-card-title-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #fff; }
  .inv-visual-card-text { font-size: 13px; color: rgba(255,255,255,.75); line-height: 1.55; }

  /* ── Próximos pasos ── */
  .pasos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; text-align: center; }
  .paso-col { }
  .paso-num { width: 56px; height: 56px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 20px; font-weight: 800; font-style: italic; }
  .paso-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; }

  /* ── Por qué ── */
  .porq-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; text-align: center; }
  .porq-col { }
  .porq-ring { width: 72px; height: 72px; border-radius: 50%; padding: 2px; margin: 0 auto 16px; }
  .porq-ring-inner { width: 100%; height: 100%; border-radius: 50%; background: var(--card); display: flex; align-items: center; justify-content: center; font-size: 24px; }
  .porq-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .porq-desc { font-size: 13px; color: var(--muted); line-height: 1.55; }

  /* ── Footer ── */
  .footer-bar { padding: 32px 48px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
  .footer-name { font-size: 17px; font-weight: 800; background: linear-gradient(135deg,var(--primary),var(--secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .footer-copy { font-size: 12px; color: #aab0c4; margin-top: 2px; }
  .footer-sender { font-size: 13px; color: var(--muted); }
  .footer-date { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .mobile-bar { display: flex; }
    .main { margin-left: 0; }
    .padded { padding: 0 20px; }
    .hero-content { padding: 32px 24px 36px; }
    .cliente-grid { grid-template-columns: 1fr; gap: 20px; }
    .retos-grid { grid-template-columns: 1fr; }
    .reto-full { grid-column: auto; }
    .enfoque-grid { grid-template-columns: 1fr; gap: 24px; }
    .fases-grid { grid-template-columns: 1fr; gap: 24px; }
    .inv-split { grid-template-columns: 1fr; }
    .inv-dark { padding: 36px 24px; }
    .inv-visual { min-height: 220px; }
    .pasos-grid { grid-template-columns: 1fr; gap: 20px; text-align: left; }
    .paso-num { margin: 0 0 10px 0; }
    .porq-grid { grid-template-columns: 1fr; gap: 24px; text-align: left; }
    .porq-ring { margin: 0 0 12px 0; }
    .footer-bar { padding: 28px 20px; flex-direction: column; align-items: flex-start; }
    .section { margin-bottom: 40px; }
  }
  @media (max-width: 480px) {
    .hero-title { font-size: 28px; letter-spacing: -1px; }
    .hero-meta { gap: 16px; }
  }
</style>
</head>
<body>

<!-- Sidebar (desktop) -->
<aside class="sidebar">
  ${logoHtml}
  <div class="sidebar-name">${esc(brand.agencyName)}</div>
  <div class="sidebar-tag">Propuesta Premium</div>
  <nav class="sidebar-nav">
    <a href="#intro">Introducción</a>
    <a href="#cliente">Cliente</a>
    <a href="#estrategia">Estrategia</a>
    <a href="#cronograma">Cronograma</a>
    <a href="#inversion">Inversión</a>
  </nav>
  <div class="sidebar-bottom">${acceptBtn}</div>
</aside>

<!-- Mobile bar -->
<div class="mobile-bar">
  <span class="mobile-bar-name">${esc(brand.agencyName)}</span>
  ${acceptBtn}
</div>

<div class="main">

  <!-- Hero -->
  <section id="intro" style="margin-bottom:64px;">
    <div class="hero">
      <div class="hero-bg"></div>
      <div class="hero-noise"></div>
      <div class="hero-content">
        <span class="hero-tag">${esc(c.tipoProyecto)}</span>
        <h1 class="hero-title">${esc(c.resumenCreativo)}</h1>
        <div class="hero-meta">
          <div class="hero-meta-item">
            <div class="hero-meta-label">Para</div>
            <div class="hero-meta-val">${clientLabel}</div>
          </div>
          <div class="hero-meta-item">
            <div class="hero-meta-label">Fecha</div>
            <div class="hero-meta-val">${fecha}</div>
          </div>
          <div class="hero-meta-item">
            <div class="hero-meta-label">Tipo</div>
            <div class="hero-meta-val">${esc(c.tipoProyecto)}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Cliente -->
  <section class="section padded" id="cliente">
    <div class="content-inner">
      <span class="content-label">01. Comprensión del Cliente</span>
      <div class="cliente-grid">
        <div>
          <h2 class="content-title">Capturando la esencia de tu visión.</h2>
          <p class="content-body">${esc(c.entendimientoDelCliente)}</p>
        </div>
        <div class="quote-box">
          <div class="quote-mark">"</div>
          <p class="quote-text">"${esc(c.resumenCreativo)}"</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Retos -->
  <section class="section padded" id="estrategia">
    <div class="content-inner">
      <span class="content-label" style="text-align:center;display:block;margin-bottom:24px;">02. Retos Identificados</span>
      <div class="retos-grid">${retosHtml}</div>
      <div class="solucion-card" style="background:linear-gradient(135deg,${p},${s});">
        <h4 style="font-size:18px;font-weight:700;color:#fff;margin-bottom:10px;">Nuestra Solución Integral</h4>
        <p style="font-size:14px;color:rgba(255,255,255,.85);line-height:1.6;">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
      </div>
    </div>
  </section>

  <!-- Enfoque creativo -->
  <section class="section padded">
    <div class="content-inner">
      <span class="content-label">03. Enfoque Creativo</span>
      <div class="enfoque-grid">
        <div>
          <h2 class="content-title">El diseño como motor de resultados.</h2>
          <div>${pilaresHtml}</div>
        </div>
        <div>
          <div class="content-label" style="margin-bottom:14px;">Entregables</div>
          <div class="entregables-list">${entregablesHtml}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Cronograma -->
  <section class="section padded" id="cronograma">
    <div class="content-inner">
      <div class="fases-grid">
        <div>
          <span class="content-label">04. Cronograma</span>
          <h2 class="content-title">El camino a la excelencia.</h2>
          <p class="content-body">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
        </div>
        <div class="fases-list">${fasesHtml}</div>
      </div>
    </div>
  </section>

  <!-- Inversión -->
  <section class="section" id="inversion">
    <div class="inv-split">
      <div class="inv-dark">
        <div class="inv-dark-label">05. Inversión</div>
        <h2 class="inv-dark-title">Un plan diseñado para escalar.</h2>
        <div class="inv-lines">${invLinesHtml}</div>
        <div class="inv-total">
          <span class="inv-total-label">Total Estimado</span>
          <span class="inv-total-val">${esc(c.inversion?.total || "")}</span>
        </div>
        <p class="inv-note">* ${esc(c.inversion?.terminos || "Precios sujetos a ajustes según alcance final.")}</p>
      </div>
      <div class="inv-visual">
        <div class="inv-visual-bg"></div>
        <div class="inv-visual-card">
          <div class="inv-visual-card-title">
            <span class="inv-visual-card-title-icon">★</span>
            <span class="inv-visual-card-title-label">Retorno Esperado</span>
          </div>
          <p class="inv-visual-card-text">${(c.resultadosEsperados || []).slice(0, 2).map(esc).join(". ")}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Próximos pasos -->
  <section class="section padded" style="padding-top:8px;">
    <div class="content-inner">
      <span class="content-label" style="text-align:center;display:block;margin-bottom:12px;">Próximos Pasos</span>
      <h2 class="content-title" style="text-align:center;margin-bottom:40px;">¿Cómo empezamos?</h2>
      <div class="pasos-grid">${pasosHtml}</div>
    </div>
  </section>

  <!-- Por qué nosotros -->
  <section class="section padded" style="padding-top:16px;padding-bottom:48px;border-top:1px solid var(--border);">
    <div class="content-inner">
      <div class="porq-grid">${porQueHtml}</div>
    </div>
  </section>

  ${termsHtml}

  <!-- Footer -->
  <footer class="footer-bar">
    <div>
      <div class="footer-name">${esc(brand.agencyName)}</div>
      <div class="footer-copy">© ${new Date().getFullYear()} Todos los derechos reservados.</div>
      ${senderHtml}
    </div>
    <div class="footer-date">${fecha}</div>
  </footer>

</div><!-- /main -->
</body>
</html>`;
}
