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
  const p = brand.primaryColor || "#6e3ac9";
  const s = brand.secondaryColor || "#b00d6a";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" class="sidebar-logo" alt="logo"/>`
    : "";

  const retosHtml = (c.retosDetectados || []).map((r) => `
    <div class="card reto-card">
      <div class="reto-icon">⚡</div>
      <div>
        <div class="reto-title">${esc(r.titulo)}</div>
        <div class="reto-desc">${esc(r.descripcion)}</div>
      </div>
    </div>`).join("");

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map((p_, i) => `
    <div class="pilar-row">
      <div class="pilar-num" style="background:${p};">${String(i + 1).padStart(2, "0")}</div>
      <div class="pilar-text">${esc(p_)}</div>
    </div>`).join("");

  const fasesHtml = (c.fases || []).map((f) => `
    <div class="fase-card">
      <div class="fase-dur" style="color:${p};">${esc(f.duracion)}</div>
      <div class="fase-title">${esc(f.titulo)}</div>
      <div class="fase-desc">${esc(f.descripcion)}</div>
    </div>`).join("");

  const invHtml = (c.inversion?.incluye || []).map(item => `
    <tr>
      <td class="inv-td">${esc(item)}</td>
      <td class="inv-td inv-right">Incluido ✓</td>
    </tr>`).join("");

  const porQueHtml = (c.porQueNosotros || []).map(q => `
    <div class="card porq-card">
      <div class="porq-icon">✦</div>
      <div class="porq-title">${esc(q.titulo)}</div>
      <div class="porq-desc">${esc(q.descripcion)}</div>
    </div>`).join("");

  const pasosHtml = (c.proximosPasos || []).map(p_ => `
    <label class="paso-row">
      <input type="checkbox" style="accent-color:${p};width:18px;height:18px;flex-shrink:0;"/>
      <span class="paso-text">${esc(p_)}</span>
    </label>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section class="section">
      <h2 class="section-title">Términos y Condiciones</h2>
      <div class="card" style="font-size:13px;line-height:1.8;color:#525c6c;white-space:pre-wrap;padding:28px;">${esc(brand.termsConditions)}</div>
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
    --bg: #f0f2fb;
    --card: #ffffff;
    --text: #1e2235;
    --muted: #5a6278;
    --border: #e4e8f4;
    --sidebar-w: 240px;
    --radius: 18px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; -webkit-font-smoothing: antialiased; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed; left: 0; top: 0; height: 100vh; width: var(--sidebar-w);
    background: #fff; border-right: 1px solid var(--border);
    display: flex; flex-direction: column; gap: 0; padding: 28px 20px; z-index: 100;
    overflow-y: auto;
  }
  .sidebar-logo { max-height: 32px; max-width: 120px; object-fit: contain; margin-bottom: 10px; }
  .sidebar-name {
    font-size: 17px; font-weight: 800;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
  }
  .sidebar-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.8px; color: #aab0c4; margin-top: 3px; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 2px; margin-top: 28px; flex: 1; }
  .sidebar-nav a {
    display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px;
    font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: all .18s;
  }
  .sidebar-nav a:hover, .sidebar-nav a.active { background: color-mix(in srgb, var(--primary) 10%, transparent); color: var(--primary); }
  .sidebar-nav a::before { content: attr(data-dot); font-size: 6px; width: 6px; height: 6px; border-radius: 50%; background: currentColor; opacity: .5; flex-shrink: 0; }
  .sidebar-bottom { margin-top: 28px; }
  .accept-btn {
    display: block; text-align: center; padding: 13px 20px;
    border-radius: 12px; font-weight: 700; font-size: 14px; color: #fff;
    text-decoration: none; transition: opacity .2s;
  }
  .accept-btn:hover { opacity: .9; }

  /* ── Mobile top bar ── */
  .mobile-bar {
    display: none; position: sticky; top: 0; z-index: 200;
    background: rgba(255,255,255,.92); backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 14px 20px; align-items: center; justify-content: space-between;
  }
  .mobile-bar-name { font-size: 15px; font-weight: 800; background: linear-gradient(135deg,var(--primary),var(--secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }

  /* ── Main ── */
  .main { margin-left: var(--sidebar-w); padding: 32px 36px 80px; max-width: 960px; }

  /* ── Cards ── */
  .card { background: var(--card); border-radius: var(--radius); box-shadow: 0 2px 16px rgba(0,0,0,.05); }
  .section { margin-bottom: 32px; }
  .section-title { font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 20px; letter-spacing: -.4px; }
  .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); margin-bottom: 12px; }

  /* ── Hero ── */
  .hero {
    background: #0d0e1a; border-radius: 24px; padding: 52px 52px 48px;
    position: relative; overflow: hidden; margin-bottom: 28px;
  }
  .hero-glow {
    position: absolute; width: 380px; height: 320px; border-radius: 50%;
    background: var(--primary); opacity: .1; filter: blur(72px);
    top: -40px; right: -60px; pointer-events: none;
  }
  .hero-glow2 {
    position: absolute; width: 260px; height: 220px; border-radius: 50%;
    background: var(--secondary); opacity: .08; filter: blur(60px);
    bottom: -30px; left: 30px; pointer-events: none;
  }
  .hero-inner { position: relative; z-index: 1; }
  .hero-tag {
    display: inline-block; padding: 5px 14px; border-radius: 100px;
    background: rgba(167,139,250,.12); border: 1px solid rgba(167,139,250,.25);
    font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--primary); margin-bottom: 20px;
  }
  .hero-title { font-size: clamp(26px, 4vw, 44px); font-weight: 900; letter-spacing: -1.5px; line-height: 1.08; color: #fff; margin-bottom: 28px; }
  .hero-meta { display: flex; gap: 0; flex-wrap: wrap; }
  .hero-meta-item { padding-right: 28px; margin-right: 28px; border-right: 1px solid rgba(255,255,255,.12); }
  .hero-meta-item:last-child { border-right: none; padding-right: 0; margin-right: 0; }
  .hero-meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.4); margin-bottom: 4px; }
  .hero-meta-val { font-size: 14px; font-weight: 600; color: #fff; }

  /* ── 2-col ── */
  .grid2 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
  .grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .grid-auto { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }

  /* ── Quote card ── */
  .quote-card { padding: 36px; }
  .quote-mark { font-size: 48px; line-height: 1; color: var(--primary); margin-bottom: 10px; font-family: Georgia, serif; }
  .quote-text { font-size: 17px; font-weight: 600; line-height: 1.5; color: var(--text); }

  /* ── Stat card ── */
  .stat-card { padding: 32px 28px; display: flex; flex-direction: column; justify-content: flex-end; }
  .stat-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; opacity: .7; margin-bottom: 14px; }
  .stat-value { font-size: clamp(28px, 4vw, 40px); font-weight: 900; letter-spacing: -1.5px; }
  .stat-sub { font-size: 12px; margin-top: 8px; opacity: .7; line-height: 1.4; }

  /* ── Reto ── */
  .reto-card { padding: 20px 22px; display: flex; gap: 14px; align-items: flex-start; }
  .reto-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
  .reto-title { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
  .reto-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* ── Pilares ── */
  .pilar-row { display: flex; gap: 14px; align-items: flex-start; padding: 14px 0; border-bottom: 1px solid var(--border); }
  .pilar-row:last-child { border-bottom: none; }
  .pilar-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 11px; font-weight: 800; color: #fff; }
  .pilar-text { font-size: 14px; color: var(--text); line-height: 1.5; padding-top: 4px; }

  /* ── Fases ── */
  .fase-card { padding: 22px; }
  .fase-dur { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
  .fase-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .fase-desc { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* ── Inversión tabla ── */
  .inv-table { width: 100%; border-collapse: collapse; }
  .inv-th { padding: 10px 0; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #aab0c4; border-bottom: 2px solid var(--border); }
  .inv-th.right { text-align: right; }
  .inv-td { padding: 14px 0; font-size: 14px; color: var(--text); border-bottom: 1px solid var(--border); }
  .inv-right { text-align: right; font-size: 12px; color: var(--muted); }
  .inv-total-row td { padding: 18px 16px; background: color-mix(in srgb, var(--primary) 6%, transparent); font-weight: 800; font-size: 16px; }
  .inv-total-amount { text-align: right; font-size: 24px; font-weight: 900; color: var(--primary); }

  /* ── Por qué ── */
  .porq-card { padding: 24px; }
  .porq-icon { font-size: 24px; margin-bottom: 10px; }
  .porq-title { font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 7px; }
  .porq-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* ── Pasos ── */
  .paso-row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: var(--card); border-radius: 12px; cursor: pointer; }
  .paso-text { font-size: 14px; font-weight: 500; color: var(--text); }

  /* ── Footer ── */
  .footer { text-align: center; padding-top: 36px; border-top: 1px solid var(--border); margin-top: 8px; }
  .footer-agency { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #aab0c4; }
  .footer-sender { display: block; margin-top: 6px; font-size: 13px; color: #aab0c4; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .mobile-bar { display: flex; }
    .main { margin-left: 0; padding: 20px 16px 60px; max-width: 100%; }
    .hero { padding: 36px 24px 32px; border-radius: 18px; margin-bottom: 20px; }
    .grid2 { grid-template-columns: 1fr; }
    .grid3 { grid-template-columns: 1fr; }
    .hero-meta { flex-direction: column; gap: 12px; }
    .hero-meta-item { border-right: none; padding-right: 0; margin-right: 0; }
    .stat-card { padding: 24px; }
  }
  @media (max-width: 480px) {
    .grid-auto { grid-template-columns: 1fr; }
    .hero-title { font-size: 26px; }
  }
</style>
</head>
<body>

<!-- Sidebar (desktop) -->
<aside class="sidebar">
  ${logoHtml}
  <div class="sidebar-name">${esc(brand.agencyName)}</div>
  <div class="sidebar-tag">Propuesta Profesional</div>
  <nav class="sidebar-nav">
    <a href="#intro" class="active" data-dot="">Introducción</a>
    <a href="#estrategia" data-dot="">Estrategia</a>
    <a href="#enfoque" data-dot="">Enfoque</a>
    <a href="#cronograma" data-dot="">Cronograma</a>
    <a href="#inversion" data-dot="">Inversión</a>
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
  <section class="section" id="intro">
    <div class="hero">
      <div class="hero-glow"></div>
      <div class="hero-glow2"></div>
      <div class="hero-inner">
        <span class="hero-tag">${esc(c.tipoProyecto)}</span>
        <h1 class="hero-title">${esc(c.resumenCreativo)}</h1>
        <div class="hero-meta">
          <div class="hero-meta-item">
            <div class="hero-meta-label">Preparado para</div>
            <div class="hero-meta-val">${clientLabel}</div>
          </div>
          <div class="hero-meta-item">
            <div class="hero-meta-label">Fecha</div>
            <div class="hero-meta-val">${fecha}</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Estrategia -->
  <section class="section" id="estrategia">
    <div class="grid2">
      <div class="card quote-card">
        <div class="quote-mark">"</div>
        <div class="quote-text">${esc(c.entendimientoDelCliente)}</div>
      </div>
      <div class="card stat-card" style="background:${p};color:#fff;">
        <div class="stat-label">Inversión Total</div>
        <div class="stat-value">${esc(c.inversion?.total || "")}</div>
        <div class="stat-sub">${esc(c.inversion?.terminos || "")}</div>
      </div>
    </div>
  </section>

  <!-- Retos -->
  <section class="section">
    <div class="section-label">Retos Identificados</div>
    <div class="grid-auto">${retosHtml}</div>
  </section>

  <!-- Enfoque -->
  <section class="section" id="enfoque">
    <div class="card" style="padding:36px;">
      <h2 class="section-title">Estrategia &amp; Enfoque</h2>
      <p style="font-size:14px;color:var(--muted);line-height:1.7;margin-bottom:28px;">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
      ${pilaresHtml}
    </div>
  </section>

  <!-- Cronograma -->
  <section class="section" id="cronograma">
    <div class="section-label">Cronograma del Proyecto</div>
    <div class="grid-auto">${fasesHtml}</div>
  </section>

  <!-- Inversión -->
  <section class="section" id="inversion">
    <div class="card" style="padding:36px;">
      <h2 class="section-title">Detalle de Inversión</h2>
      <table class="inv-table">
        <thead>
          <tr>
            <th class="inv-th">Servicio</th>
            <th class="inv-th right">Estado</th>
          </tr>
        </thead>
        <tbody>${invHtml}</tbody>
        <tfoot>
          <tr class="inv-total-row">
            <td style="border-radius:10px 0 0 10px;">Total del Proyecto</td>
            <td class="inv-total-amount" style="border-radius:0 10px 10px 0;">${esc(c.inversion?.total || "")}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </section>

  <!-- Por qué nosotros -->
  <section class="section">
    <div class="section-label" style="text-align:center;display:block;">Por qué elegirnos</div>
    <div class="grid3">${porQueHtml}</div>
  </section>

  <!-- Próximos pasos -->
  <section class="section" style="background:color-mix(in srgb,var(--primary) 5%,transparent);border-radius:var(--radius);padding:32px;">
    <h2 class="section-title">Próximos Pasos</h2>
    <div style="display:flex;flex-direction:column;gap:10px;">${pasosHtml}</div>
  </section>

  ${termsHtml}

  <footer class="footer">
    <div class="footer-agency">${esc(brand.agencyName)} · Propuesta Confidencial · ${fecha}</div>
    ${senderHtml}
  </footer>

</div><!-- /main -->
</body>
</html>`;
}
