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
  const p = brand.primaryColor || "#7c3aed";
  const s = brand.secondaryColor || "#c026d3";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" class="sidebar-logo" alt="logo"/>`
    : `<div class="sidebar-icon">✦</div>`;

  const navItems = [
    { href: "#intro",      label: "Intro" },
    { href: "#retos",      label: "Strategy" },
    { href: "#enfoque",    label: "Approach" },
    { href: "#cronograma", label: "Timeline" },
    { href: "#inversion",  label: "Investment" },
  ];
  const navHtml = navItems.map((n, i) => `
    <a href="${n.href}" class="nav-link${i === 0 ? " nav-active" : ""}">${n.label}</a>`).join("");

  const acceptBtnSidebar = proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" class="sidebar-accept-btn" style="background:linear-gradient(135deg,${p},${s});">Aceptar Propuesta</a>`
    : `<a href="#inversion" class="sidebar-accept-btn" style="background:linear-gradient(135deg,${p},${s});">Aceptar Propuesta</a>`;

  // Retos — 2x2 mixed grid
  const retos = c.retosDetectados || [];
  const cardStyles = [
    { bg: "#fff",       color: "#111827", img: true,  accent: p },
    { bg: "#dbeafe",    color: "#1e40af", img: false, accent: "#3b82f6" },
    { bg: `color-mix(in srgb,${p} 15%,#f3e8ff)`, color: p, img: false, accent: p },
    { bg: "#fff",       color: "#111827", img: true,  accent: s },
  ];
  const retoIcons = ["👁️‍🗨️","🔁","📱","⚡"];
  const retosHtml = retos.slice(0, 4).map((r, i) => {
    const st = cardStyles[i] || cardStyles[0];
    const hasImage = st.img;
    return `
    <div class="reto-card" style="background:${st.bg};">
      <div class="reto-icon-row">
        <span class="reto-icon" style="background:color-mix(in srgb,${st.accent} 15%,transparent);color:${st.accent};">${retoIcons[i] || "⬡"}</span>
      </div>
      <div class="reto-title" style="color:${st.color};">${esc(r.titulo)}</div>
      <div class="reto-desc" style="color:${i === 1 ? "#3b82f6" : i === 2 ? p : "#6b7280"};">${esc(r.descripcion)}</div>
      ${hasImage ? `<div class="reto-img-placeholder" style="background:linear-gradient(135deg,color-mix(in srgb,${st.accent} 30%,#000) 0%,color-mix(in srgb,${st.accent} 10%,#1a1a2e) 100%);"></div>` : ""}
    </div>`;
  }).join("");

  // Enfoque — left dark card + right pillars
  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map((pi, i) => `
    <div class="pillar-row">
      <div class="pillar-icon" style="background:color-mix(in srgb,${i === 0 ? p : s} 12%,transparent);color:${i === 0 ? p : s};">
        ${i === 0 ? "🎯" : "❤️"}
      </div>
      <div>
        <div class="pillar-name">${esc(pi)}</div>
        <div class="pillar-desc">${i === 0 ? esc(c.enfoqueCreativo?.descripcion?.split(".")[0] || "") : esc(c.entendimientoDelCliente?.split(".")[0] || "")}</div>
      </div>
    </div>`).join("");

  // Cronograma — dark card with rows
  const fasesHtml = (c.fases || []).map(f => `
    <div class="fase-row">
      <div class="fase-num">${String(f.numero).padStart(2, "0")}</div>
      <div class="fase-body">
        <div class="fase-title">${esc(f.titulo)}</div>
        <div class="fase-desc">${esc(f.descripcion)}</div>
      </div>
      ${f.duracion ? `<div class="fase-dur">${esc(f.duracion)}</div>` : ""}
    </div>`).join("");

  // Investment
  const incluyeHtml = (c.inversion?.incluye || []).map(item => `
    <div class="inv-item">
      <span class="inv-check" style="color:${p};">✓</span>
      ${esc(item)}
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section class="main-section">
      <h2 style="font-size:18px;font-weight:800;margin-bottom:14px;">Términos y Condiciones</h2>
      <div class="card" style="padding:28px;font-size:13px;line-height:1.8;color:var(--muted);white-space:pre-wrap;">${esc(brand.termsConditions)}</div>
    </section>` : "";

  const senderHtml = brand.senderName
    ? `<span style="font-size:13px;color:var(--muted);">Presentado por <strong>${esc(brand.senderName)}</strong></span>` : "";

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
    --bg: #f0f0fa;
    --sidebar-bg: linear-gradient(180deg, color-mix(in srgb,${p} 12%,#f5f3ff) 0%, color-mix(in srgb,${s} 8%,#fdf4ff) 100%);
    --sidebar-w: 210px;
    --text: #111827;
    --muted: #6b7280;
    --border: #e5e7eb;
    --card-bg: #ffffff;
    --radius: 18px;
    --dark-bg: #0f1623;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed; left: 0; top: 0; height: 100vh; width: var(--sidebar-w);
    background: var(--sidebar-bg);
    border-right: 1px solid color-mix(in srgb,var(--primary) 15%,transparent);
    display: flex; flex-direction: column; padding: 24px 18px 20px; z-index: 100; overflow-y: auto;
  }
  .sidebar-logo { max-height: 28px; max-width: 110px; object-fit: contain; margin-bottom: 8px; }
  .sidebar-icon { font-size: 24px; margin-bottom: 8px; }
  .sidebar-agency { font-size: 15px; font-weight: 800; color: var(--primary); }
  .sidebar-sub { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); margin-top: 2px; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 2px; margin-top: 24px; flex: 1; }
  .nav-link {
    display: flex; align-items: center; padding: 9px 12px; border-radius: 10px;
    font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: all .15s;
  }
  .nav-link:hover { background: rgba(255,255,255,.6); color: var(--primary); }
  .nav-active { background: rgba(255,255,255,.8) !important; color: var(--primary) !important; font-weight: 600; }
  .sidebar-bottom { margin-top: 20px; }
  .sidebar-accept-btn {
    display: block; text-align: center; padding: 12px; border-radius: 14px;
    font-size: 13px; font-weight: 700; color: #fff; text-decoration: none; transition: opacity .2s;
  }
  .sidebar-accept-btn:hover { opacity: .88; }

  /* ── Bottom bar (fixed) ── */
  .bottom-bar {
    display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
    padding: 14px 20px; background: rgba(255,255,255,.96); backdrop-filter: blur(12px);
    border-top: 1px solid var(--border); align-items: center; justify-content: space-between; gap: 12px;
  }
  .bottom-bar-name { font-size: 14px; font-weight: 800; color: var(--primary); }
  .bottom-bar-btn {
    padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; color: #fff;
    text-decoration: none; transition: opacity .2s;
  }

  /* ── Main ── */
  .main { margin-left: var(--sidebar-w); padding: 28px 36px 100px; max-width: 960px; }
  .main-section { margin-bottom: 28px; }
  .section-title { font-size: 22px; font-weight: 900; letter-spacing: -.5px; color: var(--text); margin-bottom: 16px; }
  .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: 0 2px 14px rgba(0,0,0,.06); }

  /* ── Hero ── */
  .hero {
    border-radius: 20px; padding: 44px 44px 36px;
    background: linear-gradient(145deg, #ece8ff 0%, #f3ecff 40%, #e8eeff 100%);
    margin-bottom: 28px; position: relative; overflow: hidden;
  }
  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: var(--primary); color: #fff;
    font-size: 10px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;
    padding: 5px 14px; border-radius: 100px; margin-bottom: 18px;
  }
  .hero-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,.7); }
  .hero-title { font-size: clamp(28px, 4.5vw, 48px); font-weight: 900; letter-spacing: -1.5px; line-height: 1.08; color: var(--text); margin-bottom: 14px; }
  .hero-title-accent { color: var(--primary); }
  .hero-sub { font-size: 14px; color: var(--muted); max-width: 500px; line-height: 1.65; margin-bottom: 20px; }
  .hero-meta { display: flex; gap: 32px; }
  .hero-meta-item {}
  .hero-meta-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); margin-bottom: 3px; }
  .hero-meta-val { font-size: 13px; font-weight: 700; color: var(--text); }

  /* ── Retos 2x2 grid ── */
  .retos-title { font-size: 22px; font-weight: 900; color: var(--text); margin-bottom: 6px; }
  .retos-sub { font-size: 13px; color: var(--muted); margin-bottom: 18px; line-height: 1.5; }
  .retos-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .reto-card { border-radius: var(--radius); padding: 20px; min-height: 160px; display: flex; flex-direction: column; gap: 10px; overflow: hidden; position: relative; }
  .reto-icon-row {}
  .reto-icon { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 10px; font-size: 16px; }
  .reto-title { font-size: 15px; font-weight: 800; line-height: 1.25; }
  .reto-desc { font-size: 13px; line-height: 1.5; flex: 1; }
  .reto-img-placeholder { height: 80px; border-radius: 10px; margin-top: auto; }

  /* ── Enfoque split ── */
  .enfoque-grid { display: grid; grid-template-columns: 1fr 1.2fr; gap: 18px; align-items: center; }
  .enfoque-left { background: var(--dark-bg); border-radius: var(--radius); padding: 32px; min-height: 220px; display: flex; flex-direction: column; justify-content: space-between; }
  .enfoque-left-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2.5px; color: rgba(255,255,255,.35); }
  .enfoque-left-word1 { font-size: 28px; font-weight: 900; letter-spacing: -1px; color: rgba(255,255,255,.9); }
  .enfoque-left-word2 { font-size: 28px; font-weight: 400; letter-spacing: -1px; color: rgba(255,255,255,.4); }
  .enfoque-quote { margin-top: 20px; border-top: 1px solid rgba(255,255,255,.1); padding-top: 16px; }
  .enfoque-quote-text { font-size: 13px; font-style: italic; color: var(--primary); font-weight: 600; line-height: 1.5; }
  .enfoque-quote-author { font-size: 10px; color: rgba(255,255,255,.35); margin-top: 6px; letter-spacing: 1px; }
  .enfoque-right {}
  .enfoque-right-title { font-size: 22px; font-weight: 900; color: var(--text); line-height: 1.2; margin-bottom: 10px; }
  .enfoque-right-accent { color: var(--primary); }
  .enfoque-right-desc { font-size: 13px; color: var(--muted); line-height: 1.65; margin-bottom: 20px; }
  .pillar-row { display: flex; gap: 12px; align-items: flex-start; margin-bottom: 14px; }
  .pillar-icon { width: 36px; height: 36px; border-radius: 10px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .pillar-name { font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
  .pillar-desc { font-size: 12px; color: var(--muted); line-height: 1.45; }

  /* ── Cronograma dark ── */
  .cronograma-dark { background: var(--dark-bg); border-radius: 20px; padding: 36px 40px; }
  .cronograma-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .cronograma-title { font-size: 20px; font-weight: 900; color: #fff; }
  .cronograma-sub { font-size: 12px; color: rgba(255,255,255,.4); margin-top: 4px; max-width: 280px; line-height: 1.5; }
  .cronograma-icon { font-size: 28px; opacity: .4; }
  .fase-row { display: flex; align-items: flex-start; gap: 16px; padding: 16px 0; border-top: 1px solid rgba(255,255,255,.08); }
  .fase-row:first-child { border-top: none; }
  .fase-num { font-size: 13px; font-weight: 800; color: rgba(255,255,255,.3); flex-shrink: 0; width: 24px; }
  .fase-body { flex: 1; }
  .fase-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 3px; }
  .fase-desc { font-size: 12px; color: rgba(255,255,255,.45); line-height: 1.5; }
  .fase-dur { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: rgba(255,255,255,.3); flex-shrink: 0; padding-top: 2px; }

  /* ── Inversión ── */
  .inv-section { text-align: center; padding: 20px 0 0; }
  .inv-eyebrow { font-size: 28px; font-weight: 900; letter-spacing: -1px; margin-bottom: 6px; }
  .inv-eyebrow-accent { color: var(--primary); }
  .inv-sub { font-size: 13px; color: var(--muted); margin-bottom: 28px; }
  .inv-card-center { background: #fff; border-radius: 20px; padding: 36px; box-shadow: 0 4px 24px rgba(0,0,0,.08); max-width: 480px; margin: 0 auto; text-align: center; }
  .inv-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--muted); margin-bottom: 6px; }
  .inv-price { font-size: clamp(40px, 8vw, 64px); font-weight: 900; letter-spacing: -3px; color: var(--text); margin-bottom: 20px; }
  .inv-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; text-align: left; }
  .inv-item { display: flex; align-items: center; gap: 10px; font-size: 13px; color: var(--muted); }
  .inv-check { font-weight: 700; flex-shrink: 0; }
  .inv-cta-btn {
    display: block; text-align: center; padding: 16px; border-radius: 16px;
    font-size: 15px; font-weight: 700; color: #fff; text-decoration: none; transition: opacity .2s;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
  }
  .inv-cta-btn:hover { opacity: .88; }

  /* ── Footer ── */
  .footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding-top: 24px; border-top: 1px solid var(--border); margin-top: 28px; }
  .footer-left { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .bottom-bar { display: flex; }
    .main { margin-left: 0; padding: 20px 16px 100px; }
    .hero { padding: 28px 20px; border-radius: 16px; }
    .retos-grid { grid-template-columns: 1fr; }
    .enfoque-grid { grid-template-columns: 1fr; }
    .cronograma-dark { padding: 24px 20px; }
    .cronograma-header { flex-direction: column; gap: 8px; }
  }
</style>
</head>
<body>

<!-- Bottom bar -->
<div class="bottom-bar">
  <span class="bottom-bar-name">${esc(brand.agencyName)}</span>
  ${proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" class="bottom-bar-btn" style="background:linear-gradient(135deg,${p},${s});">Aceptar Propuesta</a>`
    : `<a href="#inversion" class="bottom-bar-btn" style="background:linear-gradient(135deg,${p},${s});">Aceptar Propuesta</a>`}
</div>

<!-- Sidebar -->
<aside class="sidebar">
  ${logoHtml}
  <div class="sidebar-agency">${esc(brand.agencyName)}</div>
  <div class="sidebar-sub">Bespoke Proposal</div>
  <nav class="sidebar-nav">${navHtml}</nav>
  <div class="sidebar-bottom">${acceptBtnSidebar}</div>
</aside>

<div class="main">

  <!-- Hero -->
  <section class="main-section" id="intro">
    <div class="hero">
      <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        Propuesta Estratégica ${new Date().getFullYear()}
      </div>
      <h1 class="hero-title">
        ${esc(c.resumenCreativo).replace(/(\w[\w\s]*)$/, (match) => {
          const words = match.trim().split(" ");
          if (words.length >= 2) {
            const last2 = words.slice(-2).join(" ");
            const rest = words.slice(0, -2).join(" ");
            return (rest ? rest + " " : "") + `<span class="hero-title-accent">${last2}</span>`;
          }
          return `<span class="hero-title-accent">${match}</span>`;
        })}
      </h1>
      <p class="hero-sub">${esc(c.entendimientoDelCliente)}</p>
      <div class="hero-meta">
        <div class="hero-meta-item">
          <div class="hero-meta-label">Preparado para</div>
          <div class="hero-meta-val">${clientLabel}</div>
        </div>
        <div class="hero-meta-item">
          <div class="hero-meta-label">Fecha de entrega</div>
          <div class="hero-meta-val">${fecha}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Retos -->
  <section class="main-section" id="retos">
    <h2 class="retos-title">Los Retos Actuales</h2>
    <p class="retos-sub">Identificamos los puntos críticos que están frenando el crecimiento de su identidad digital actual.</p>
    <div class="retos-grid">${retosHtml}</div>
  </section>

  <!-- Enfoque -->
  <section class="main-section" id="enfoque">
    <div class="enfoque-grid">
      <div class="enfoque-left">
        <div>
          <div class="enfoque-left-label">Creative</div>
          <div class="enfoque-left-word1">APPROACH</div>
          <div class="enfoque-left-word2">${esc(c.tipoProyecto || "your brand")}</div>
        </div>
        <div class="enfoque-quote">
          <div class="enfoque-quote-text">"El diseño no es lo que parece, es cómo funciona."</div>
          <div class="enfoque-quote-author">— Steve Jobs</div>
        </div>
      </div>
      <div class="enfoque-right">
        <h2 class="enfoque-right-title">Nuestro Enfoque:<br/><span class="enfoque-right-accent">Estrategia Curada</span></h2>
        <p class="enfoque-right-desc">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
        ${pilaresHtml}
      </div>
    </div>
  </section>

  <!-- Cronograma -->
  <section class="main-section" id="cronograma">
    <div class="cronograma-dark">
      <div class="cronograma-header">
        <div>
          <div class="cronograma-title">Cronograma &amp; Entregables</div>
          <div class="cronograma-sub">Un camino claro hacia la excelencia, dividido en fases críticas de ejecución.</div>
        </div>
        <div class="cronograma-icon">✦</div>
      </div>
      ${fasesHtml}
    </div>
  </section>

  <!-- Inversión -->
  <section class="main-section" id="inversion">
    <div class="inv-section">
      <h2 class="inv-eyebrow">Tu Inversión en <span class="inv-eyebrow-accent">Impacto</span></h2>
      <p class="inv-sub">Sin tarifas ocultas, solo resultados medibles para su negocio.</p>
      <div class="inv-card-center">
        <div class="inv-label">Total de la Propuesta</div>
        <div class="inv-price">${esc(c.inversion?.total || "")}</div>
        <div class="inv-items">${incluyeHtml}</div>
        ${proposalId
          ? `<a href="/api/proposals/accept?id=${proposalId}" class="inv-cta-btn">Iniciar Proyecto Hoy</a>`
          : `<a href="#" class="inv-cta-btn">Iniciar Proyecto Hoy</a>`}
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
