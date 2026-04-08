import type { DesignProposalContent } from "@/lib/design-proposal-template";
import type { BrandConfig } from "./types";

function esc(s: string): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderModernTemplate(
  c: DesignProposalContent,
  brand: BrandConfig,
  clientName: string,
  clientCompany?: string,
  proposalId?: string,
): string {
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const clientLabel = clientCompany ? `${esc(clientName)} · ${esc(clientCompany)}` : esc(clientName);
  const p = brand.primaryColor || "#6366F1";
  const s = brand.secondaryColor || "#F43F5E";
  const acceptUrl = proposalId ? `/api/proposals/accept?id=${proposalId}` : "#";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="logo" style="max-height:32px;max-width:120px;object-fit:contain;"/>`
    : `<div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,${p},${s});"></div>`;

  const retosHtml = (c.retosDetectados || []).map((r, i) => `
    <div style="background:#fff;border-radius:16px;padding:28px;box-shadow:0 2px 16px rgba(0,0,0,0.06);border-top:3px solid ${i === 0 ? p : s};">
      <div style="width:36px;height:36px;border-radius:10px;background:${i === 0 ? p : s}18;display:flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:18px;">${["⚡","🎯","📊","🔍"][i % 4]}</span>
      </div>
      <h4 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 8px;">${esc(r.titulo)}</h4>
      <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0;">${esc(r.descripcion)}</p>
    </div>`).join("");

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map((pl, i) => {
    const colors = [p, s, "#10b981", "#f59e0b"];
    return `
    <div style="display:flex;align-items:flex-start;gap:16px;padding:24px;background:#fff;border-radius:16px;box-shadow:0 2px 12px rgba(0,0,0,0.05);">
      <div style="width:44px;height:44px;border-radius:12px;background:${colors[i % 4]}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-weight:700;font-size:16px;color:${colors[i % 4]};">${i + 1}</span>
      </div>
      <div>
        <h4 style="font-size:15px;font-weight:700;color:#0f172a;margin:0 0 6px;">${esc(pl)}</h4>
        <p style="font-size:13px;color:#64748b;line-height:1.5;margin:0;">${esc(c.porQueNosotros?.[i]?.descripcion || "")}</p>
      </div>
    </div>`;
  }).join("");

  const entregablesHtml = (c.entregables || []).map(e => `
    <li style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:1px solid #f1f5f9;">
      <span style="width:20px;height:20px;border-radius:50%;background:${p}18;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="${p}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </span>
      <span style="font-size:14px;color:#334155;">${esc(e)}</span>
    </li>`).join("");

  const fasesHtml = (c.fases || []).map((f, i) => `
    <div style="display:flex;gap:24px;position:relative;">
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,${p},${s});display:flex;align-items:center;justify-content:center;flex-shrink:0;">
          <span style="color:#fff;font-weight:800;font-size:16px;">${f.numero}</span>
        </div>
        ${i < (c.fases || []).length - 1 ? `<div style="width:2px;flex:1;background:linear-gradient(${p},${s}22);margin:8px 0;min-height:40px;"></div>` : ""}
      </div>
      <div style="padding-top:8px;padding-bottom:32px;flex:1;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          <h4 style="font-size:17px;font-weight:700;color:#0f172a;margin:0;">${esc(f.titulo)}</h4>
          ${f.duracion ? `<span style="font-size:12px;font-weight:600;color:${p};background:${p}12;padding:3px 10px;border-radius:20px;">${esc(f.duracion)}</span>` : ""}
        </div>
        <p style="font-size:14px;color:#64748b;line-height:1.6;margin:0;">${esc(f.descripcion)}</p>
      </div>
    </div>`).join("");

  const kpisHtml = (c.resultadosEsperados || []).slice(0, 3).map((r, _i) => {
    const numMatch = r.match(/([+\-~]?\d[\d,.]*\s*%|[+\-~]?\d[\d,.]*\s*x|[+\-~]?\d[\d,.]*\s*k|[+\-~]?\d+\s*pp|[+\-~]?\d[\d,.]+)/i);
    const val = numMatch ? numMatch[0].replace(/\s+/g, "") : "✓";
    const hasNum = !!numMatch;
    return `
    <div style="text-align:center;padding:32px 24px;background:#fff;border-radius:20px;box-shadow:0 4px 20px rgba(0,0,0,0.07);">
      <div style="font-size:${hasNum ? "36px" : "28px"};font-weight:800;background:linear-gradient(135deg,${p},${s});-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:10px;line-height:1;">${esc(val)}</div>
      <p style="font-size:13px;color:#64748b;line-height:1.6;margin:0;">${esc(r)}</p>
    </div>`;
  }).join("");

  const incluyeHtml = (c.inversion?.incluye || []).map(it => `
    <li style="display:flex;align-items:center;gap:10px;padding:8px 0;">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="8" fill="${p}18"/><path d="M5 8l2 2 4-4" stroke="${p}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span style="font-size:14px;color:#334155;">${esc(it)}</span>
    </li>`).join("");

  const pasosHtml = (c.proximosPasos || []).map((paso, i) => `
    <div style="display:flex;gap:16px;align-items:flex-start;">
      <div style="width:28px;height:28px;border-radius:8px;background:${p};color:#fff;font-weight:700;font-size:13px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
      <p style="font-size:14px;color:#334155;line-height:1.5;margin:0;padding-top:4px;">${esc(paso)}</p>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section style="margin-bottom:60px;">
      <h2 style="font-size:22px;font-weight:700;color:#0f172a;margin:0 0 20px;">Términos y Condiciones</h2>
      <div style="background:#f8fafc;border-radius:16px;padding:28px;font-size:13px;color:#64748b;line-height:1.8;white-space:pre-wrap;">${esc(brand.termsConditions)}</div>
    </section>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=1200"/>
<title>Propuesta — ${esc(clientName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{font-family:'Plus Jakarta Sans',sans-serif;background:#f8fafc;color:#0f172a;line-height:1.6;min-width:960px;}
  a{text-decoration:none;color:inherit;}
  ul,ol{list-style:none;}
  img{max-width:100%;}

  .container{max-width:1120px;margin:0 auto;padding:0 24px;}

  /* Navbar */
  .navbar{position:sticky;top:0;z-index:100;background:rgba(255,255,255,0.9);backdrop-filter:blur(12px);border-bottom:1px solid #e2e8f0;}
  .navbar-inner{display:flex;align-items:center;justify-content:space-between;height:68px;}
  .navbar-brand{display:flex;align-items:center;gap:12px;}
  .navbar-name{font-size:16px;font-weight:700;color:#0f172a;}
  .navbar-nav{display:flex;gap:32px;}
  .navbar-nav a{font-size:14px;font-weight:500;color:#64748b;transition:color 0.2s;}
  .navbar-nav a:hover{color:#0f172a;}
  .btn-primary{display:inline-flex;align-items:center;padding:10px 24px;border-radius:12px;font-size:14px;font-weight:700;color:#fff;background:linear-gradient(135deg,${p},${s});box-shadow:0 4px 14px ${p}40;transition:transform 0.2s,box-shadow 0.2s;border:none;cursor:pointer;}
  .btn-primary:hover{transform:translateY(-1px);box-shadow:0 8px 20px ${p}50;}
  .btn-secondary{display:inline-flex;align-items:center;padding:10px 24px;border-radius:12px;font-size:14px;font-weight:600;color:#0f172a;background:#fff;border:1px solid #e2e8f0;transition:background 0.2s;}
  .btn-secondary:hover{background:#f1f5f9;}

  /* Hero */
  .hero{padding:80px 0 60px;}
  .hero-badge{display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:100px;background:${p}12;color:${p};font-size:13px;font-weight:600;margin-bottom:28px;}
  .hero-badge-dot{width:6px;height:6px;border-radius:50%;background:${p};animation:pulse 2s infinite;}
  @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
  .hero-title{font-size:28px;font-weight:800;line-height:1.2;color:#0f172a;margin-bottom:16px;letter-spacing:-0.01em;}
  .hero-subtitle{font-size:15px;color:#64748b;line-height:1.7;max-width:600px;margin-bottom:40px;}
  .hero-actions{display:flex;gap:16px;flex-wrap:wrap;}
  .hero-meta{display:flex;align-items:center;gap:20px;margin-top:48px;padding-top:40px;border-top:1px solid #e2e8f0;flex-wrap:wrap;}
  .hero-meta-item{font-size:13px;color:#94a3b8;}
  .hero-meta-item strong{color:#475569;font-weight:600;}
  .hero-card{background:linear-gradient(135deg,${p}08,${s}08);border:1px solid ${p}20;border-radius:24px;padding:40px;position:relative;overflow:hidden;}
  .hero-card::before{content:"";position:absolute;top:-60px;right:-60px;width:200px;height:200px;border-radius:50%;background:radial-gradient(circle,${p}20,transparent 70%);}

  /* Section base */
  section{padding:80px 0;}
  .section-label{font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${p};margin-bottom:12px;}
  .section-title{font-size:22px;font-weight:800;color:#0f172a;line-height:1.2;letter-spacing:-0.01em;margin-bottom:16px;}
  .section-desc{font-size:16px;color:#64748b;max-width:560px;line-height:1.7;}
  .section-divider{width:48px;height:4px;border-radius:4px;background:linear-gradient(90deg,${p},${s});margin-bottom:48px;}

  /* Grid */
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px;}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;}
  .grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:20px;}

  /* Investment */
  .invest-card{background:#fff;border-radius:24px;padding:40px;box-shadow:0 4px 24px rgba(0,0,0,0.08);border:2px solid transparent;position:relative;}
  .invest-card.featured{border-color:${p};box-shadow:0 8px 40px ${p}25;}
  .invest-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,${p},${s});color:#fff;font-size:11px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;padding:5px 14px;border-radius:100px;}
  .invest-price{font-size:38px;font-weight:800;color:#0f172a;margin:16px 0 8px;}

  /* Dark strip */
  .dark-strip{background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:28px;padding:56px;color:#fff;position:relative;overflow:hidden;}
  .dark-strip::before{content:"";position:absolute;top:-80px;right:-80px;width:320px;height:320px;border-radius:50%;background:radial-gradient(circle,${p}30,transparent 70%);}
  .dark-strip::after{content:"";position:absolute;bottom:-80px;left:-40px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,${s}20,transparent 70%);}

  /* Footer */
  .footer{background:#0f172a;color:#94a3b8;padding:48px 0;}
  .footer-inner{display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap;}
  .footer-brand{font-weight:700;color:#fff;}
  .footer-copy{font-size:13px;}
  .accept-btn{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;border-radius:14px;font-size:15px;font-weight:700;color:#fff;background:linear-gradient(135deg,${p},${s});box-shadow:0 4px 20px ${p}50;transition:transform 0.2s;}
  .accept-btn:hover{transform:scale(1.03);}

  @media(max-width:768px){
    .navbar-nav{display:none;}
    .grid-2,.grid-3,.grid-4{grid-template-columns:1fr;}
    .hero{padding:48px 0 40px;}
    .dark-strip{padding:36px 24px;}
    .footer-inner{flex-direction:column;text-align:center;}
  }
</style>
</head>
<body>

<!-- NAVBAR -->
<nav class="navbar">
  <div class="container navbar-inner">
    <div class="navbar-brand">
      ${logoHtml}
      <span class="navbar-name">${esc(brand.agencyName)}</span>
    </div>
    <div class="navbar-nav">
      <a href="#contexto">Contexto</a>
      <a href="#estrategia">Estrategia</a>
      <a href="#cronograma">Cronograma</a>
      <a href="#inversion">Inversión</a>
    </div>
    <a href="${acceptUrl}" class="btn-primary" id="accept-btn">Aceptar propuesta</a>
  </div>
</nav>

<!-- HERO -->
<main>
<div class="container">
  <section class="hero">
    <div class="hero-card">
      <div class="hero-badge">
        <span class="hero-badge-dot"></span>
        ${esc(c.tipoProyecto || "Propuesta Comercial")}
      </div>
      <h1 class="hero-title">${esc(c.tipoProyecto || "Propuesta Comercial")} para ${clientLabel}</h1>
      <p class="hero-subtitle">${esc(c.resumenCreativo)}</p>
      <div class="hero-actions">
        <a href="#estrategia" class="btn-primary">Ver estrategia completa</a>
        <a href="${acceptUrl}" class="btn-secondary">Aceptar propuesta</a>
      </div>
      <div class="hero-meta">
        <div class="hero-meta-item">Para <strong>${clientLabel}</strong></div>
        <div class="hero-meta-item">·</div>
        <div class="hero-meta-item"><strong>${esc(brand.agencyName)}</strong></div>
        <div class="hero-meta-item">·</div>
        <div class="hero-meta-item">${fecha}</div>
      </div>
    </div>
  </section>
</div>

<!-- CONTEXTO / RETOS -->
<section id="contexto" style="background:#fff;padding:80px 0;">
  <div class="container">
    <div class="section-label">Diagnóstico</div>
    <h2 class="section-title">Retos detectados</h2>
    <p class="section-desc">${esc(c.entendimientoDelCliente?.split(".")[0] || "Identificamos los puntos clave a resolver.")}</p>
    <div class="section-divider"></div>
    <div class="grid-${Math.min((c.retosDetectados || []).length, 3) || 2}" style="margin-top:0;">
      ${retosHtml}
    </div>
  </div>
</section>

<!-- ESTRATEGIA / PILARES -->
<section id="estrategia">
  <div class="container">
    <div class="section-label">Enfoque</div>
    <h2 class="section-title">Estrategia propuesta</h2>
    <p class="section-desc">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
    <div class="section-divider"></div>
    ${(c.enfoqueCreativo?.pilares || []).length > 0 ? `<div class="grid-2">${pilaresHtml}</div>` : ""}
  </div>
</section>

<!-- ENTREGABLES -->
${(c.entregables || []).length > 0 ? `
<section style="background:#fff;padding:80px 0;">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start;">
      <div>
        <div class="section-label">Alcance</div>
        <h2 class="section-title">Entregables del proyecto</h2>
        <p class="section-desc">Todo lo que recibirás al finalizar el proyecto, documentado y acordado desde el inicio.</p>
      </div>
      <div>
        <ul>${entregablesHtml}</ul>
      </div>
    </div>
  </div>
</section>` : ""}

<!-- FASES -->
<section id="cronograma">
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 2fr;gap:80px;align-items:start;">
      <div style="position:sticky;top:100px;">
        <div class="section-label">Cronograma</div>
        <h2 class="section-title">Fases del proyecto</h2>
        <p class="section-desc">Un proceso estructurado para garantizar resultados medibles en cada etapa.</p>
      </div>
      <div>
        ${fasesHtml}
      </div>
    </div>
  </div>
</section>

<!-- RESULTADOS / KPIs -->
${(c.resultadosEsperados || []).length > 0 ? `
<section>
  <div class="container">
    <div class="dark-strip">
      <div style="position:relative;z-index:1;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:${p === '#fff' ? s : p};margin-bottom:12px;">Resultados Proyectados</div>
        <h2 style="font-size:clamp(24px,3vw,36px);font-weight:800;color:#fff;margin-bottom:48px;letter-spacing:-0.02em;">KPIs esperados al finalizar</h2>
        <div class="grid-3">
          ${kpisHtml}
        </div>
      </div>
    </div>
  </div>
</section>` : ""}

<!-- INVERSIÓN -->
<section id="inversion" style="background:#fff;padding:80px 0;">
  <div class="container">
    <div style="text-align:center;margin-bottom:56px;">
      <div class="section-label">Inversión</div>
      <h2 class="section-title" style="margin:0 auto 12px;">Plan de inversión</h2>
      <p style="font-size:16px;color:#64748b;">Estructura de costos clara y transparente.</p>
    </div>
    <div style="max-width:560px;margin:0 auto;">
      <div class="invest-card featured">
        <span class="invest-badge">Propuesta recomendada</span>
        <div style="font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-top:8px;">${esc(c.tipoProyecto || "Proyecto completo")}</div>
        <div class="invest-price">${esc(c.inversion?.total || "")}</div>
        <p style="font-size:14px;color:#64748b;margin-bottom:28px;">${esc(c.inversion?.terminos || "")}</p>
        <ul style="margin-bottom:36px;">${incluyeHtml}</ul>
        <a href="${acceptUrl}" class="accept-btn" style="width:100%;justify-content:center;">Aceptar propuesta →</a>
      </div>
    </div>
  </div>
</section>

${termsHtml ? `<div class="container">${termsHtml}</div>` : ""}

<!-- PRÓXIMOS PASOS -->
${(c.proximosPasos || []).length > 0 ? `
<section>
  <div class="container">
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:start;">
      <div>
        <div class="section-label">Siguientes pasos</div>
        <h2 class="section-title">¿Cómo empezamos?</h2>
        <p class="section-desc">El proceso para iniciar es simple y rápido.</p>
        <a href="${acceptUrl}" class="btn-primary" style="margin-top:32px;display:inline-flex;">Acepta esta propuesta →</a>
      </div>
      <div style="display:flex;flex-direction:column;gap:20px;padding-top:8px;">
        ${pasosHtml}
      </div>
    </div>
  </div>
</section>` : ""}

</main>

<!-- FOOTER -->
<footer class="footer">
  <div class="container footer-inner">
    <div>
      <div class="footer-brand">${esc(brand.agencyName)}</div>
      <div class="footer-copy" style="margin-top:4px;">Propuesta para ${clientLabel} · ${fecha}</div>
      ${brand.senderName ? `<div class="footer-copy" style="margin-top:4px;">Presentado por <strong style="color:#cbd5e1;">${esc(brand.senderName)}</strong></div>` : ""}
      <div class="footer-copy" style="margin-top:4px;color:#475569;">Vigencia: 15 días hábiles desde la fecha de emisión.</div>
    </div>
    <a href="${acceptUrl}" class="accept-btn floating-cta">Aceptar propuesta</a>
  </div>
</footer>

</body>
</html>`;
}
