import type { DesignProposalContent } from "@/lib/design-proposal-template";
import type { BrandConfig } from "./types";

function esc(s: string): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderBoldTemplate(
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
  const emojis = ["🚀","✨","📋","🔗","📊","🎯","💡","🎨"];

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" class="sidebar-logo" alt="logo"/>` : "";

  const retosHtml = (c.retosDetectados || []).slice(0, 3).map(r => `
    <div class="reto-card">
      <div class="reto-icon-wrap">⚡</div>
      <h3 class="reto-title">${esc(r.titulo)}</h3>
      <p class="reto-desc">${esc(r.descripcion)}</p>
    </div>`).join("");

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map(p_ => `
    <span class="pillar-tag" style="background:color-mix(in srgb,${p} 12%,transparent);color:${p};">${esc(p_)}</span>`).join("");

  const entregablesHtml = (c.entregables || []).slice(0, 6).map((e, i) => `
    <div class="entregable-card" style="${i === 0 ? `background:linear-gradient(135deg,#14142b,#2a2660);color:#fff;` : `background:#fff;`}">
      <span class="entregable-emoji">${emojis[i] || "✦"}</span>
      <span class="entregable-name" style="${i === 0 ? "color:#fff;" : "color:#1e2235;"}">${esc(e)}</span>
    </div>`).join("");

  const fasesHtml = (c.fases || []).map((f, i) => `
    <div class="fase-item">
      <div class="fase-bubble" style="background:${i % 2 === 0 ? p : s};">${f.numero}</div>
      <div class="fase-body">
        <div class="fase-dur">${esc(f.duracion)}</div>
        <h3 class="fase-title">${esc(f.titulo)}</h3>
        <p class="fase-desc">${esc(f.descripcion)}</p>
      </div>
    </div>`).join("");

  const incluyeHtml = (c.inversion?.incluye || []).map(item => `
    <li class="incluye-item"><span style="color:${p};margin-right:10px;">✓</span>${esc(item)}</li>`).join("");

  const porQueHtml = (c.porQueNosotros || []).map(q => `
    <div class="porq-card">
      <div class="porq-num" style="color:${p};">✦</div>
      <h4 class="porq-title">${esc(q.titulo)}</h4>
      <p class="porq-desc">${esc(q.descripcion)}</p>
    </div>`).join("");

  const pasosHtml = (c.proximosPasos || []).map((p_, i) => `
    <div class="paso-row">
      <span class="paso-num" style="${i === 0 ? `background:${p};color:#fff;` : `background:#f0f2fb;color:#5a6278;`}">${i + 1}</span>
      <span class="paso-text">${esc(p_)}</span>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section class="section">
      <h2 class="section-title">Términos y Condiciones</h2>
      <div class="card" style="padding:28px;font-size:13px;line-height:1.8;color:#5a6278;white-space:pre-wrap;">${esc(brand.termsConditions)}</div>
    </section>` : "";

  const senderHtml = brand.senderName
    ? `<p class="footer-sender">Presentado por <strong>${esc(brand.senderName)}</strong></p>` : "";

  const acceptBtn = proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" class="accept-btn" style="background:linear-gradient(135deg,${p},${s});">Aceptar Propuesta</a>` : "";

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
    --bg: #f0f2fb;
    --card: #ffffff;
    --text: #1e2235;
    --muted: #5a6278;
    --border: #e4e8f4;
    --sidebar-w: 240px;
    --radius: 20px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed; left: 0; top: 0; height: 100vh; width: var(--sidebar-w);
    background: #fff; border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 28px 20px; z-index: 100; overflow-y: auto;
  }
  .sidebar-logo { max-height: 32px; max-width: 120px; object-fit: contain; margin-bottom: 10px; }
  .sidebar-name { font-size: 17px; font-weight: 800; background: linear-gradient(135deg,var(--primary),var(--secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
  .sidebar-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.8px; color: #aab0c4; margin-top: 3px; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 2px; margin-top: 28px; flex: 1; }
  .sidebar-nav a { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 10px; font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: all .18s; }
  .sidebar-nav a:hover { background: color-mix(in srgb,var(--primary) 10%,transparent); color: var(--primary); }
  .sidebar-bottom { margin-top: 24px; }
  .accept-btn { display: block; text-align: center; padding: 13px; border-radius: 14px; font-weight: 700; font-size: 14px; color: #fff; text-decoration: none; transition: opacity .2s; }
  .accept-btn:hover { opacity: .88; }

  /* ── Mobile top bar ── */
  .mobile-bar { display: none; position: sticky; top: 0; z-index: 200; background: rgba(255,255,255,.93); backdrop-filter: blur(12px); border-bottom: 1px solid var(--border); padding: 14px 20px; align-items: center; justify-content: space-between; }
  .mobile-bar-name { font-size: 15px; font-weight: 800; background: linear-gradient(135deg,var(--primary),var(--secondary)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }

  /* ── Main ── */
  .main { margin-left: var(--sidebar-w); padding: 32px 36px 80px; max-width: 960px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 20px; font-weight: 800; margin-bottom: 18px; letter-spacing: -.3px; }
  .section-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #aab0c4; text-align: center; margin-bottom: 24px; }
  .card { background: var(--card); border-radius: var(--radius); box-shadow: 0 2px 14px rgba(0,0,0,.05); }

  /* ── Hero gradient ── */
  .hero { background: linear-gradient(135deg, var(--primary), var(--secondary)); border-radius: 24px; padding: 52px 52px 48px; position: relative; overflow: hidden; margin-bottom: 28px; }
  .hero-overlay { position: absolute; top: 0; right: -15%; width: 55%; height: 100%; background: radial-gradient(circle at center,rgba(255,255,255,.12),transparent 70%); pointer-events: none; }
  .hero-pulse { display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,.15); backdrop-filter: blur(8px); padding: 6px 16px; border-radius: 100px; margin-bottom: 22px; }
  .hero-pulse-dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,180,180,.9); }
  .hero-pulse-label { font-size: 11px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #fff; }
  .hero-title { font-size: clamp(26px, 4vw, 46px); font-weight: 900; letter-spacing: -1.5px; line-height: 1.08; color: #fff; margin-bottom: 28px; }
  .hero-meta { display: flex; gap: 28px; flex-wrap: wrap; align-items: center; }
  .hero-divider { width: 1px; height: 32px; background: rgba(255,255,255,.2); }
  .hero-meta-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.5); margin-bottom: 3px; }
  .hero-meta-val { font-size: 14px; font-weight: 600; color: #fff; }

  /* ── Vision / quote ── */
  .vision-grid { display: grid; grid-template-columns: 7fr 5fr; gap: 20px; align-items: center; }
  .vision-card { padding: 36px; }
  .vision-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); margin-bottom: 16px; }
  .vision-quote { font-size: clamp(16px, 2vw, 20px); font-weight: 700; line-height: 1.45; color: var(--text); }
  .vision-stat { padding: 28px; }
  .vision-stat-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 8px; }
  .vision-stat-val { font-size: clamp(22px, 3vw, 34px); font-weight: 900; color: var(--primary); letter-spacing: -1px; }
  .vision-stat-sub { font-size: 12px; color: var(--muted); margin-top: 6px; line-height: 1.4; }

  /* ── Retos ── */
  .retos-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
  .reto-card { padding: 28px; border-radius: var(--radius); background: var(--bg); }
  .reto-icon-wrap { width: 44px; height: 44px; background: #fff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,.06); }
  .reto-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .reto-desc { font-size: 13px; color: var(--muted); line-height: 1.55; }

  /* ── Enfoque ── */
  .enfoque-card { padding: 36px; }
  .pillar-tag { display: inline-block; padding: 8px 18px; border-radius: 100px; font-size: 13px; font-weight: 700; margin: 4px; }
  .enfoque-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin-top: 28px; }
  .enfoque-col-title { font-size: 15px; font-weight: 700; display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .enfoque-col-line { display: inline-block; width: 24px; height: 2px; }
  .enfoque-col-text { font-size: 14px; color: var(--muted); line-height: 1.65; }

  /* ── Entregables ── */
  .entregables-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 12px; }
  .entregable-card { padding: 22px; border-radius: 16px; display: flex; flex-direction: column; gap: 10px; min-height: 110px; justify-content: space-between; }
  .entregable-emoji { font-size: 24px; }
  .entregable-name { font-size: 13px; font-weight: 700; line-height: 1.3; }

  /* ── Timeline fases ── */
  .fases-list { display: flex; flex-direction: column; gap: 24px; }
  .fase-item { display: flex; gap: 20px; align-items: flex-start; }
  .fase-bubble { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 16px; flex-shrink: 0; box-shadow: 0 4px 14px rgba(0,0,0,.18); }
  .fase-body { flex: 1; background: var(--card); border-radius: 16px; padding: 20px 22px; box-shadow: 0 2px 10px rgba(0,0,0,.05); }
  .fase-dur { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); font-style: italic; margin-bottom: 4px; }
  .fase-title { font-size: 16px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
  .fase-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* ── Inversión ── */
  .inv-split { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; align-items: start; }
  .inv-left { padding: 36px; }
  .inv-title { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 16px; }
  .inv-intro { font-size: 14px; color: var(--muted); line-height: 1.65; margin-bottom: 24px; }
  .incluye-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
  .incluye-item { font-size: 14px; font-weight: 500; display: flex; align-items: center; }
  .inv-right-card { padding: 32px; }
  .inv-package { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); margin-bottom: 8px; }
  .inv-price { font-size: clamp(28px, 4vw, 48px); font-weight: 900; letter-spacing: -2px; color: var(--text); margin-bottom: 20px; }
  .inv-lines { border-top: 1px solid var(--border); padding-top: 16px; display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; }
  .inv-line { display: flex; justify-content: space-between; font-size: 13px; }
  .inv-line-label { color: var(--muted); }
  .inv-line-val { font-weight: 700; }
  .inv-confirm { display: block; text-align: center; padding: 14px; background: var(--primary); color: #fff; font-weight: 700; border-radius: 14px; text-decoration: none; font-size: 14px; transition: opacity .2s; }
  .inv-confirm:hover { opacity: .88; }

  /* ── Por qué / Why ── */
  .porq-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
  .porq-card { padding: 24px; border-radius: var(--radius); background: var(--card); box-shadow: 0 2px 10px rgba(0,0,0,.05); }
  .porq-num { font-size: 28px; margin-bottom: 10px; }
  .porq-title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
  .porq-desc { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* ── Pasos CTA ── */
  .cta-section { text-align: center; padding: 52px 40px; background: var(--bg); border-radius: 24px; }
  .cta-title { font-size: clamp(22px, 3vw, 34px); font-weight: 900; letter-spacing: -1px; margin-bottom: 12px; }
  .cta-sub { font-size: 15px; color: var(--muted); max-width: 440px; margin: 0 auto 32px; line-height: 1.55; }
  .pasos-list { display: flex; flex-direction: column; gap: 10px; max-width: 440px; margin: 0 auto 36px; }
  .paso-row { display: flex; align-items: center; gap: 14px; padding: 14px 18px; background: var(--card); border-radius: 12px; text-align: left; }
  .paso-num { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; flex-shrink: 0; }
  .paso-text { font-size: 14px; font-weight: 500; }
  .cta-btns { display: flex; gap: 14px; justify-content: center; flex-wrap: wrap; }
  .cta-btn-primary { padding: 16px 36px; border-radius: 18px; font-weight: 700; font-size: 15px; color: #fff; text-decoration: none; transition: opacity .2s; }
  .cta-btn-primary:hover { opacity: .88; }
  .cta-btn-secondary { padding: 16px 36px; background: var(--card); color: var(--text); font-weight: 700; border-radius: 18px; font-size: 15px; border: 2px solid var(--border); text-decoration: none; transition: background .2s; }
  .cta-btn-secondary:hover { background: var(--bg); }

  /* ── Footer ── */
  .footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-top: 32px; border-top: 1px solid var(--border); }
  .footer-left { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #aab0c4; }
  .footer-sender { font-size: 13px; color: var(--muted); margin-top: 4px; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .sidebar { display: none; }
    .mobile-bar { display: flex; }
    .main { margin-left: 0; padding: 20px 16px 60px; max-width: 100%; }
    .hero { padding: 32px 24px 28px; border-radius: 18px; }
    .hero-meta { gap: 16px; }
    .hero-divider { display: none; }
    .vision-grid { grid-template-columns: 1fr; }
    .retos-grid { grid-template-columns: 1fr; }
    .inv-split { grid-template-columns: 1fr; }
    .enfoque-grid { grid-template-columns: 1fr; }
    .cta-section { padding: 36px 20px; }
    .footer { flex-direction: column; align-items: flex-start; }
  }
  @media (max-width: 480px) {
    .entregables-grid { grid-template-columns: 1fr 1fr; }
  }
</style>
</head>
<body>

<!-- Sidebar (desktop) -->
<aside class="sidebar">
  ${logoHtml}
  <div class="sidebar-name">${esc(brand.agencyName)}</div>
  <div class="sidebar-tag">Propuesta Creativa</div>
  <nav class="sidebar-nav">
    <a href="#intro">Introducción</a>
    <a href="#retos">Retos</a>
    <a href="#enfoque">Enfoque</a>
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
  <section class="section" id="intro">
    <div class="hero">
      <div class="hero-overlay"></div>
      <div class="hero-pulse">
        <span class="hero-pulse-dot"></span>
        <span class="hero-pulse-label">${esc(c.tipoProyecto)}</span>
      </div>
      <h1 class="hero-title">${esc(c.resumenCreativo)}</h1>
      <div class="hero-meta">
        <div>
          <div class="hero-meta-label">Para</div>
          <div class="hero-meta-val">${clientLabel}</div>
        </div>
        <div class="hero-divider"></div>
        <div>
          <div class="hero-meta-label">Fecha</div>
          <div class="hero-meta-val">${fecha}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Visión -->
  <section class="section">
    <div class="vision-grid">
      <div class="card vision-card">
        <div class="vision-label">La Visión</div>
        <blockquote class="vision-quote">"${esc(c.entendimientoDelCliente)}"</blockquote>
      </div>
      <div class="card vision-stat">
        <div class="vision-stat-label">Inversión Total</div>
        <div class="vision-stat-val">${esc(c.inversion?.total || "")}</div>
        <div class="vision-stat-sub">${esc(c.inversion?.terminos || "")}</div>
      </div>
    </div>
  </section>

  <!-- Retos -->
  <section class="section" id="retos">
    <div class="section-label">Retos Identificados</div>
    <div class="retos-grid">${retosHtml}</div>
  </section>

  <!-- Enfoque -->
  <section class="section" id="enfoque">
    <div class="card enfoque-card">
      <h2 class="section-title">Nuestro Enfoque</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:4px;">${pilaresHtml}</div>
      <div class="enfoque-grid">
        <div>
          <div class="enfoque-col-title">
            <span class="enfoque-col-line" style="background:${p};"></span>Fase Uno: Inmersión
          </div>
          <p class="enfoque-col-text">${esc(c.entendimientoDelCliente)}</p>
        </div>
        <div>
          <div class="enfoque-col-title">
            <span class="enfoque-col-line" style="background:${s};"></span>Fase Dos: Ejecución
          </div>
          <p class="enfoque-col-text">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Entregables -->
  <section class="section">
    <div class="section-label">Entregables del Proyecto</div>
    <div class="entregables-grid">${entregablesHtml}</div>
  </section>

  <!-- Cronograma -->
  <section class="section" id="cronograma">
    <div class="section-label">Cronograma de Implementación</div>
    <div class="fases-list">${fasesHtml}</div>
  </section>

  <!-- Inversión -->
  <section class="section" id="inversion">
    <div class="card">
      <div class="inv-split">
        <div class="inv-left">
          <h2 class="inv-title">Inversión Financiera</h2>
          <p class="inv-intro">${esc(c.enfoqueCreativo?.descripcion || "Inversión estratégica en tu futuro digital con retorno medible.")}</p>
          <ul class="incluye-list">${incluyeHtml}</ul>
        </div>
        <div class="inv-right-card">
          <div class="inv-package">Paquete Total</div>
          <div class="inv-price">${esc(c.inversion?.total || "")}</div>
          <div class="inv-lines">
            ${(c.inversion?.incluye || []).slice(0, 3).map(item => `
            <div class="inv-line">
              <span class="inv-line-label">${esc(item)}</span>
              <span class="inv-line-val">Incluido</span>
            </div>`).join("")}
          </div>
          <a href="#" class="inv-confirm" style="background:${p};">Confirmar Inversión</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Por qué nosotros -->
  <section class="section">
    <div class="section-label">Por qué elegirnos</div>
    <div class="porq-grid">${porQueHtml}</div>
  </section>

  <!-- CTA final -->
  <section class="section cta-section">
    <h2 class="cta-title">¿Listos para empezar?</h2>
    <p class="cta-sub">Esta propuesta es válida por 15 días. Acepta para comenzar el proceso de onboarding.</p>
    <div class="pasos-list">${pasosHtml}</div>
    <div class="cta-btns">
      ${proposalId ? `<a href="/api/proposals/accept?id=${proposalId}" class="cta-btn-primary" style="background:linear-gradient(135deg,${p},${s});">Aceptar &amp; Firmar</a>` : ""}
      <a href="#intro" class="cta-btn-secondary">Agendar Llamada</a>
    </div>
  </section>

  ${termsHtml}

  <footer class="footer">
    <div>
      <div class="footer-left">© ${new Date().getFullYear()} ${esc(brand.agencyName)} · Confidencial</div>
      ${senderHtml}
    </div>
    <div style="font-size:12px;color:#aab0c4;">${fecha}</div>
  </footer>

</div><!-- /main -->
</body>
</html>`;
}
