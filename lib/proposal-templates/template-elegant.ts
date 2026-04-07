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
  const p = brand.primaryColor || "#7c3aed";
  const s = brand.secondaryColor || "#c026d3";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" class="sidebar-logo" alt="logo"/>`
    : `<div class="sidebar-icon">🚀</div>`;

  const navItems = [
    { href: "#intro",      label: "Intro" },
    { href: "#estrategia", label: "Strategy" },
    { href: "#enfoque",    label: "Approach" },
    { href: "#cronograma", label: "Timeline" },
    { href: "#inversion",  label: "Investment" },
  ];
  const navHtml = navItems.map((n, i) => `
    <a href="${n.href}" class="nav-link${i === 0 ? " nav-active" : ""}">${n.label}</a>`).join("");

  const acceptBtn = proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" class="accept-btn" style="background:${p};">Aceptar Propuesta →</a>`
    : `<a href="#inversion" class="accept-btn" style="background:${p};">Aceptar Propuesta →</a>`;

  // Philosophy cards — left big white card + right purple card

  // Timeline — horizontal steps
  const fasesHtml = (c.fases || []).map((f, i) => `
    <div class="timeline-step">
      <div class="timeline-bubble${i === 1 ? " timeline-active" : ""}" style="${i === 1 ? `background:${p};color:#fff;border-color:${p};` : ""}">
        ${String(f.numero).padStart(2, "0")}
      </div>
      <div class="timeline-content">
        <div class="timeline-title">${esc(f.titulo)}</div>
        <div class="timeline-desc">${esc(f.descripcion)}</div>
        ${f.duracion ? `<div class="timeline-dur" style="color:${p};">${esc(f.duracion)}</div>` : ""}
      </div>
    </div>`).join("");

  // Investment packages — split incluye into 3 groups
  const incluye = c.inversion?.incluye || [];
  const third = Math.ceil(incluye.length / 3);
  const pkg1 = incluye.slice(0, third);
  const pkg2 = incluye.slice(third, third * 2);
  const pkg3 = incluye.slice(third * 2);

  const pkgTitle = (items: string[], idx: number) => {
    const defaults = ["Identidad Visual", "Experiencia Digital", "Content Strategy"];
    return items[0] ? items[0].split(":")[0] : defaults[idx];
  };

  const invPackagesHtml = [pkg1, pkg2, pkg3].map((items, i) => `
    <div class="inv-pkg ${i === 1 ? "inv-pkg-highlight" : ""}">
      <div class="inv-pkg-icon" style="${i === 1 ? "background:rgba(255,255,255,.15);" : `background:color-mix(in srgb,${p} 10%,transparent);`}">
        ${["🎨","💻","📝"][i]}
      </div>
      <div class="inv-pkg-title" style="${i === 1 ? "color:#fff;" : `color:${p};`}">${pkgTitle(items, i)}</div>
      <ul class="inv-pkg-list">
        ${items.map(item => `<li style="${i === 1 ? "color:rgba(255,255,255,.8);" : "color:var(--muted);"}">${esc(item)}</li>`).join("")}
      </ul>
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
    --bg: #f5f5fb;
    --sidebar-w: 210px;
    --text: #111827;
    --muted: #6b7280;
    --border: #e5e7eb;
    --card-bg: #ffffff;
    --radius: 18px;
  }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); -webkit-font-smoothing: antialiased; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed; left: 0; top: 0; height: 100vh; width: var(--sidebar-w);
    background: #fff; border-right: 1px solid var(--border);
    display: flex; flex-direction: column; padding: 24px 18px 20px; z-index: 100; overflow-y: auto;
  }
  .sidebar-logo { max-height: 28px; max-width: 110px; object-fit: contain; margin-bottom: 8px; }
  .sidebar-icon { font-size: 26px; margin-bottom: 8px; }
  .sidebar-agency { font-size: 15px; font-weight: 800; color: var(--primary); }
  .sidebar-sub { font-size: 10px; color: var(--muted); margin-top: 1px; }
  .sidebar-nav { display: flex; flex-direction: column; gap: 2px; margin-top: 22px; flex: 1; }
  .nav-link {
    display: block; padding: 9px 12px; border-radius: 10px;
    font-size: 13px; font-weight: 500; color: var(--muted); text-decoration: none; transition: all .15s;
  }
  .nav-link:hover { background: color-mix(in srgb,var(--primary) 8%,transparent); color: var(--primary); }
  .nav-active { background: color-mix(in srgb,var(--primary) 10%,transparent) !important; color: var(--primary) !important; font-weight: 600; }
  .sidebar-bottom { margin-top: 20px; }
  .accept-btn {
    display: block; text-align: center; padding: 12px; border-radius: 14px;
    font-size: 13px; font-weight: 700; color: #fff; text-decoration: none; transition: opacity .2s;
  }
  .accept-btn:hover { opacity: .88; }

  /* ── Bottom bar (fixed, mobile) ── */
  .bottom-bar {
    display: none; position: fixed; bottom: 0; left: 0; right: 0; z-index: 200;
    padding: 14px 20px; background: rgba(255,255,255,.96); backdrop-filter: blur(12px);
    border-top: 1px solid var(--border); align-items: center; justify-content: space-between; gap: 12px;
  }
  .bottom-bar-name { font-size: 14px; font-weight: 800; color: var(--primary); }

  /* ── Main ── */
  .main { margin-left: var(--sidebar-w); padding: 0 0 100px; }
  .main-inner { padding: 28px 36px; max-width: 960px; }
  .main-section { margin-bottom: 32px; }
  .section-overline { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: var(--primary); margin-bottom: 8px; }
  .section-title { font-size: 24px; font-weight: 900; letter-spacing: -.5px; color: var(--text); margin-bottom: 20px; }
  .card { background: var(--card-bg); border-radius: var(--radius); box-shadow: 0 2px 16px rgba(0,0,0,.06); }

  /* ── Hero ── */
  .hero-wrap { position: relative; min-height: 260px; overflow: hidden; border-radius: 0 0 0 0; margin-bottom: 0; }
  .hero-image {
    width: 100%; min-height: 260px;
    background:
      radial-gradient(ellipse 80% 60% at 70% 30%, color-mix(in srgb, ${s} 60%, transparent) 0%, transparent 60%),
      radial-gradient(ellipse 60% 80% at 30% 70%, color-mix(in srgb, ${p} 50%, transparent) 0%, transparent 55%),
      linear-gradient(135deg, #e8e0ff 0%, #f0d4f8 50%, #fce4e4 100%);
    display: flex; align-items: center; justify-content: center; font-size: 80px;
    padding: 40px;
  }
  .hero-content { padding: 32px 36px 28px; background: var(--card-bg); }
  .hero-badge {
    display: inline-block; background: var(--primary); color: #fff;
    font-size: 10px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase;
    padding: 5px 14px; border-radius: 100px; margin-bottom: 16px;
  }
  .hero-title { font-size: clamp(26px, 4vw, 42px); font-weight: 900; letter-spacing: -1.2px; line-height: 1.1; color: var(--text); margin-bottom: 12px; }
  .hero-title-accent { color: var(--primary); }
  .hero-sub { font-size: 14px; color: var(--muted); max-width: 520px; line-height: 1.65; }
  .hero-client { margin-top: 14px; font-size: 13px; color: var(--muted); }
  .hero-client strong { color: var(--text); }

  /* ── Philosophy ── */
  .philosophy-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; }
  .philo-left { padding: 28px; display: flex; flex-direction: column; }
  .philo-icon { font-size: 22px; margin-bottom: 16px; }
  .philo-title { font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 10px; }
  .philo-desc { font-size: 13px; color: var(--muted); line-height: 1.65; flex: 1; }
  .philo-metrics { display: flex; gap: 20px; margin-top: 24px; padding-top: 20px; border-top: 1px solid var(--border); }
  .philo-metric-val { font-size: 22px; font-weight: 900; letter-spacing: -1px; color: var(--primary); }
  .philo-metric-label { font-size: 10px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; margin-top: 2px; }
  .philo-right {
    border-radius: var(--radius); padding: 28px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    display: flex; flex-direction: column; justify-content: center; gap: 14px;
  }
  .philo-right-icon { width: 52px; height: 52px; background: rgba(255,255,255,.18); border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 22px; }
  .philo-right-title { font-size: 20px; font-weight: 800; color: #fff; line-height: 1.2; }
  .philo-right-desc { font-size: 13px; color: rgba(255,255,255,.75); line-height: 1.6; }

  /* ── Timeline ── */
  .timeline-wrap { background: #fff; border-radius: var(--radius); padding: 32px; box-shadow: 0 2px 16px rgba(0,0,0,.06); }
  .timeline-row { display: flex; gap: 0; position: relative; }
  .timeline-row::before {
    content: ""; position: absolute; top: 20px; left: 20px; right: 20px; height: 1px;
    background: var(--border); z-index: 0;
  }
  .timeline-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; z-index: 1; }
  .timeline-bubble {
    width: 40px; height: 40px; border-radius: 50%; background: #fff; border: 2px solid var(--border);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; color: var(--muted); margin-bottom: 14px;
    box-shadow: 0 0 0 4px var(--bg);
  }
  .timeline-active { font-weight: 900; }
  .timeline-content { padding: 0 8px; }
  .timeline-title { font-size: 13px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
  .timeline-desc { font-size: 12px; color: var(--muted); line-height: 1.45; }
  .timeline-dur { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 6px; }

  /* ── Investment ── */
  .inv-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 20px; flex-wrap: wrap; gap: 10px; }
  .inv-total-badge { background: #fff; border-radius: 12px; padding: 12px 20px; box-shadow: 0 2px 12px rgba(0,0,0,.08); text-align: right; }
  .inv-total-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: var(--muted); }
  .inv-total-val { font-size: 22px; font-weight: 900; letter-spacing: -1px; color: var(--text); }
  .inv-packages { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
  .inv-pkg { padding: 22px; border-radius: var(--radius); background: #fff; box-shadow: 0 2px 12px rgba(0,0,0,.05); display: flex; flex-direction: column; gap: 10px; }
  .inv-pkg-highlight { background: linear-gradient(135deg, var(--primary), var(--secondary)); }
  .inv-pkg-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .inv-pkg-title { font-size: 14px; font-weight: 700; color: var(--text); }
  .inv-pkg-highlight .inv-pkg-title { color: #fff; }
  .inv-pkg-list { list-style: none; display: flex; flex-direction: column; gap: 6px; }
  .inv-pkg-list li { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 6px; }
  .inv-pkg-list li::before { content: "◎"; font-size: 8px; flex-shrink: 0; color: var(--primary); }
  .inv-pkg-highlight .inv-pkg-list li::before { color: rgba(255,255,255,.7); }

  /* ── CTA ── */
  .cta-section { text-align: center; padding: 52px 40px; }
  .cta-title { font-size: clamp(20px, 3vw, 28px); font-weight: 900; letter-spacing: -.5px; color: var(--text); margin-bottom: 10px; }
  .cta-sub { font-size: 14px; color: var(--muted); max-width: 380px; margin: 0 auto 28px; line-height: 1.55; }
  .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
  .cta-btn-primary { padding: 15px 34px; border-radius: 16px; font-weight: 700; font-size: 14px; color: #fff; text-decoration: none; transition: opacity .2s; }
  .cta-btn-primary:hover { opacity: .88; }
  .cta-btn-secondary { padding: 15px 34px; border-radius: 16px; font-size: 14px; font-weight: 600; color: var(--primary); text-decoration: none; transition: color .2s; }
  .cta-btn-secondary:hover { color: var(--secondary); }

  /* ── Footer ── */
  .footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; padding: 24px 36px; border-top: 1px solid var(--border); }
  .footer-left { font-size: 11px; color: var(--muted); }

  @media (max-width: 768px) {
    .sidebar { display: none; }
    .bottom-bar { display: flex; }
    .main { margin-left: 0; }
    .main-inner { padding: 20px 16px; }
    .philosophy-grid { grid-template-columns: 1fr; }
    .inv-packages { grid-template-columns: 1fr; }
    .timeline-row { flex-direction: column; gap: 20px; }
    .timeline-row::before { display: none; }
    .timeline-step { flex-direction: row; text-align: left; gap: 16px; }
    .timeline-bubble { margin-bottom: 0; flex-shrink: 0; }
  }
</style>
</head>
<body>

<!-- Bottom bar (shows on mobile / overlaps desktop accept) -->
<div class="bottom-bar">
  <span class="bottom-bar-name">${esc(brand.agencyName)}</span>
  ${acceptBtn}
</div>

<!-- Sidebar -->
<aside class="sidebar">
  ${logoHtml}
  <div class="sidebar-agency">${esc(brand.agencyName)}</div>
  <div class="sidebar-sub">Bespoke Proposal</div>
  <nav class="sidebar-nav">${navHtml}</nav>
  <div class="sidebar-bottom">${acceptBtn}</div>
</aside>

<div class="main">

  <!-- Hero -->
  <section id="intro">
    <div class="hero-image">🎨</div>
    <div class="hero-content">
      <div class="hero-badge">Proposal ${new Date().getFullYear()}</div>
      <h1 class="hero-title">${esc(c.resumenCreativo).replace(/(\w+)\s*$/, '<span class="hero-title-accent">$1</span>')}</h1>
      <p class="hero-sub">${esc(c.entendimientoDelCliente)}</p>
      <p class="hero-client">Preparado para <strong>${clientLabel}</strong></p>
    </div>
  </section>

  <div class="main-inner">

    <!-- Philosophy -->
    <section class="main-section" id="estrategia">
      <div class="section-overline">Our Philosophy</div>
      <h2 class="section-title">Estrategia &amp; Visión</h2>
      <div class="philosophy-grid">
        <div class="card philo-left">
          <div class="philo-icon">📈</div>
          <div class="philo-title">${esc(c.enfoqueCreativo?.pilares?.[0] || "Análisis del Ecosistema")}</div>
          <p class="philo-desc">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
          <div class="philo-metrics">
            <div>
              <div class="philo-metric-val">92%</div>
              <div class="philo-metric-label">Retención Visual</div>
            </div>
            <div>
              <div class="philo-metric-val">4.5x</div>
              <div class="philo-metric-label">Engagement</div>
            </div>
            <div>
              <div class="philo-metric-val">100%</div>
              <div class="philo-metric-label">Bespoke Quality</div>
            </div>
          </div>
        </div>
        <div class="philo-right">
          <div class="philo-right-icon">✦</div>
          <div class="philo-right-title">${esc(c.enfoqueCreativo?.pilares?.[1] || "Innovación sin Límites")}</div>
          <p class="philo-right-desc">${esc(c.enfoqueCreativo?.pilares?.[2] || "Fusionamos tecnología de vanguardia con instinto artístico para crear soluciones que inspiren.")}</p>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="main-section" id="cronograma">
      <div class="section-overline">Process Flow</div>
      <h2 class="section-title">Timeline de Ejecución</h2>
      <div class="timeline-wrap">
        <div class="timeline-row">${fasesHtml}</div>
      </div>
    </section>

    <!-- Investment -->
    <section class="main-section" id="inversion">
      <div class="section-overline">Value Structure</div>
      <div class="inv-header">
        <h2 class="section-title" style="margin-bottom:0;">Desglose de Inversión</h2>
        <div class="inv-total-badge">
          <div class="inv-total-label">Total Estipulado</div>
          <div class="inv-total-val">${esc(c.inversion?.total || "")} <span style="font-size:13px;font-weight:600;color:var(--muted);">USD</span></div>
        </div>
      </div>
      <div class="inv-packages">${invPackagesHtml}</div>
    </section>

    <!-- CTA -->
    <section class="main-section">
      <div class="cta-section">
        <h2 class="cta-title">¿Preparados para dar el siguiente paso?</h2>
        <p class="cta-sub">Esta propuesta es válida por los próximos 15 días. Haga clic en el botón de abajo para formalizar la colaboración.</p>
        <div class="cta-btns">
          ${proposalId
            ? `<a href="/api/proposals/accept?id=${proposalId}" class="cta-btn-primary" style="background:linear-gradient(135deg,${p},${s});">Aceptar Propuesta</a>`
            : `<a href="#" class="cta-btn-primary" style="background:linear-gradient(135deg,${p},${s});">Aceptar Propuesta</a>`}
          <a href="#" class="cta-btn-secondary">Descargar PDF</a>
        </div>
      </div>
    </section>

    ${termsHtml}

  </div>

  <footer class="footer">
    <div class="footer-left">© ${new Date().getFullYear()} ${esc(brand.agencyName)} · Confidencial · ${fecha}</div>
    ${senderHtml}
  </footer>

</div>
</body>
</html>`;
}
