import type { DesignProposalContent } from "@/lib/design-proposal-template";
import type { BrandConfig } from "./types";

function esc(s: string): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderMinimalTemplate(
  c: DesignProposalContent,
  brand: BrandConfig,
  clientName: string,
  clientCompany?: string,
  proposalId?: string,
): string {
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const clientLabel = clientCompany ? `${esc(clientName)} · ${esc(clientCompany)}` : esc(clientName);
  const p = brand.primaryColor || "#1a1a2e";
  const s = brand.secondaryColor || "#e94560";
  const acceptUrl = proposalId ? `/api/proposals/accept?id=${proposalId}` : "#";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="logo" style="max-height:28px;max-width:100px;object-fit:contain;"/>`
    : "";

  const retosHtml = (c.retosDetectados || []).map((r, i) => `
    <div style="padding:32px 0;border-bottom:1px solid #f0f0f0;display:grid;grid-template-columns:80px 1fr;gap:24px;align-items:start;">
      <div style="font-size:48px;font-weight:900;color:#f0f0f0;line-height:1;font-family:'Playfair Display',serif;">${String(i + 1).padStart(2, "0")}</div>
      <div>
        <h4 style="font-size:17px;font-weight:700;color:#111;margin:0 0 10px;letter-spacing:-0.01em;">${esc(r.titulo)}</h4>
        <p style="font-size:15px;color:#666;line-height:1.7;margin:0;">${esc(r.descripcion)}</p>
      </div>
    </div>`).join("");

  const fasesHtml = (c.fases || []).map((f, _i) => `
    <div style="padding:36px 0;border-bottom:1px solid #f0f0f0;display:grid;grid-template-columns:80px 1fr;gap:24px;align-items:start;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${p};padding-top:4px;">Fase ${esc(String(f.numero))}</div>
      <div>
        <div style="display:flex;align-items:baseline;gap:16px;margin-bottom:12px;flex-wrap:wrap;">
          <h4 style="font-size:19px;font-weight:700;color:#111;margin:0;letter-spacing:-0.01em;">${esc(f.titulo)}</h4>
          ${f.duracion ? `<span style="font-size:12px;color:#999;">${esc(f.duracion)}</span>` : ""}
        </div>
        <p style="font-size:15px;color:#555;line-height:1.7;margin:0;">${esc(f.descripcion)}</p>
      </div>
    </div>`).join("");

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map((pl, i) => `
    <div style="padding:24px 0;border-bottom:1px solid #f0f0f0;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${s};margin-bottom:8px;">${String(i + 1).padStart(2, "0")}</div>
      <p style="font-size:16px;font-weight:600;color:#111;margin:0;">${esc(pl)}</p>
    </div>`).join("");

  const entregablesHtml = (c.entregables || []).map((e, _i) => `
    <div style="display:flex;align-items:center;gap:16px;padding:16px 0;border-bottom:1px solid #f8f8f8;">
      <span style="width:6px;height:6px;border-radius:50%;background:${p};flex-shrink:0;"></span>
      <span style="font-size:15px;color:#333;">${esc(e)}</span>
    </div>`).join("");

  const kpisHtml = (c.resultadosEsperados || []).slice(0, 3).map((r) => {
    const parts = r.match(/^([+\-~]?\d[\d,.%xk]*(?:\/\w+)?|[+\-~]?\d+pp)\s*(.*)?$/i);
    const val = parts ? parts[1] : r.slice(0, 8);
    const desc = parts && parts[2] ? parts[2] : r;
    return `
    <div style="padding:40px 0;border-right:1px solid #f0f0f0;padding-right:40px;padding-left:0;">
      <div style="font-size:52px;font-weight:900;color:#111;letter-spacing:-0.03em;margin-bottom:8px;">${esc(val)}</div>
      <div style="font-size:14px;color:#888;line-height:1.5;">${esc(desc)}</div>
    </div>`;
  }).join("");

  const incluyeHtml = (c.inversion?.incluye || []).map(it => `
    <li style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;font-size:15px;color:#333;">
      <span style="color:${p};margin-top:2px;font-size:18px;line-height:1;">·</span>
      ${esc(it)}
    </li>`).join("");

  const pasosHtml = (c.proximosPasos || []).map((paso, i) => `
    <div style="display:flex;gap:20px;align-items:flex-start;padding:20px 0;border-bottom:1px solid #f0f0f0;">
      <div style="font-size:11px;font-weight:700;color:${s};letter-spacing:0.1em;text-transform:uppercase;padding-top:2px;min-width:32px;">0${i + 1}</div>
      <p style="font-size:15px;color:#333;line-height:1.6;margin:0;">${esc(paso)}</p>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <div style="padding:60px 0;border-top:1px solid #e8e8e8;">
      <h3 style="font-size:14px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#999;margin-bottom:24px;">Términos y Condiciones</h3>
      <p style="font-size:14px;color:#666;line-height:1.9;white-space:pre-wrap;">${esc(brand.termsConditions)}</p>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Propuesta — ${esc(clientName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{font-family:'Inter',sans-serif;background:#ffffff;color:#111;line-height:1.6;}
  a{text-decoration:none;color:inherit;}
  ul,ol{list-style:none;}
  img{max-width:100%;}

  .wrap{max-width:760px;margin:0 auto;padding:0 32px;}

  /* Header */
  .site-header{border-bottom:1px solid #e8e8e8;padding:20px 0;}
  .header-inner{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;}
  .header-agency{font-size:15px;font-weight:700;color:#111;display:flex;align-items:center;gap:10px;}
  .header-meta{font-size:13px;color:#999;}
  .accept-link{font-size:13px;font-weight:600;color:${p};border:1px solid ${p};padding:8px 20px;border-radius:6px;transition:background 0.2s,color 0.2s;}
  .accept-link:hover{background:${p};color:#fff;}

  /* Hero */
  .hero{padding:80px 0 60px;}
  .hero-type{font-size:12px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:${s};margin-bottom:24px;}
  .hero-title{font-family:'Playfair Display',serif;font-size:clamp(34px,5vw,60px);font-weight:900;color:#0a0a0a;line-height:1.1;letter-spacing:-0.02em;margin-bottom:32px;}
  .hero-desc{font-size:18px;color:#555;line-height:1.8;max-width:600px;margin-bottom:40px;}
  .hero-divider{width:64px;height:3px;background:${p};margin-bottom:40px;}
  .hero-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:#0a0a0a;color:#fff;border-radius:6px;font-size:15px;font-weight:600;letter-spacing:0.01em;transition:transform 0.2s;}
  .hero-cta:hover{transform:translateX(4px);}
  .hero-cta-arrow{font-size:18px;}

  /* Sections */
  .sec{padding:64px 0;border-top:1px solid #e8e8e8;}
  .sec-tag{font-size:11px;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;color:#bbb;margin-bottom:16px;}
  .sec-title{font-family:'Playfair Display',serif;font-size:clamp(28px,4vw,42px);font-weight:800;color:#0a0a0a;line-height:1.15;letter-spacing:-0.02em;margin-bottom:32px;}
  .sec-lead{font-size:16px;color:#666;line-height:1.7;max-width:540px;margin-bottom:40px;}

  /* KPIs strip */
  .kpi-strip{background:#0a0a0a;color:#fff;padding:64px 0;margin:64px 0;}
  .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);}
  .kpi-label{font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#666;margin-bottom:20px;}

  /* Investment */
  .invest-box{border:2px solid #0a0a0a;border-radius:12px;padding:48px;margin-top:40px;}
  .invest-price{font-family:'Playfair Display',serif;font-size:52px;font-weight:900;color:#0a0a0a;margin:16px 0 8px;letter-spacing:-0.03em;}
  .invest-cta{display:inline-flex;align-items:center;gap:8px;padding:14px 32px;background:#0a0a0a;color:#fff;border-radius:6px;font-size:15px;font-weight:600;margin-top:32px;transition:background 0.2s;}
  .invest-cta:hover{background:${p};}

  /* Footer */
  .site-footer{padding:48px 0;border-top:2px solid #0a0a0a;margin-top:80px;}
  .footer-inner{display:flex;align-items:flex-end;justify-content:space-between;gap:24px;flex-wrap:wrap;}
  .footer-left{font-size:13px;color:#999;line-height:2;}
  .footer-left strong{color:#111;}

  @media(max-width:600px){
    .wrap{padding:0 20px;}
    .kpi-grid{grid-template-columns:1fr;}
    .footer-inner{flex-direction:column;}
  }
</style>
</head>
<body>

<!-- HEADER -->
<header class="site-header">
  <div class="wrap header-inner">
    <div class="header-agency">
      ${logoHtml}
      ${esc(brand.agencyName)}
    </div>
    <div style="display:flex;align-items:center;gap:20px;">
      <span class="header-meta">${fecha}</span>
      <a href="${acceptUrl}" class="accept-link" id="accept-btn">Aceptar →</a>
    </div>
  </div>
</header>

<!-- HERO -->
<main>
<div class="wrap">
  <section class="hero">
    <div class="hero-type">${esc(c.tipoProyecto || "Propuesta Comercial")}</div>
    <h1 class="hero-title">${esc(c.resumenCreativo)}</h1>
    <div class="hero-divider"></div>
    <p class="hero-desc">${esc(c.entendimientoDelCliente)}</p>
    <a href="${acceptUrl}" class="hero-cta">Aceptar esta propuesta <span class="hero-cta-arrow">→</span></a>
    <div style="margin-top:48px;padding-top:40px;border-top:1px solid #f0f0f0;font-size:13px;color:#aaa;">
      Para <strong style="color:#555;">${clientLabel}</strong> · Presentado por <strong style="color:#555;">${esc(brand.agencyName)}</strong>
      ${brand.senderName ? ` · <strong style="color:#555;">${esc(brand.senderName)}</strong>` : ""}
    </div>
  </section>
</div>

<!-- RETOS -->
${(c.retosDetectados || []).length > 0 ? `
<div class="wrap">
  <section class="sec">
    <div class="sec-tag">Diagnóstico</div>
    <h2 class="sec-title">Retos detectados</h2>
    ${retosHtml}
  </section>
</div>` : ""}

<!-- ENFOQUE -->
<div class="wrap">
  <section class="sec">
    <div class="sec-tag">Estrategia</div>
    <h2 class="sec-title">Enfoque creativo</h2>
    <p class="sec-lead">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
    ${(c.enfoqueCreativo?.pilares || []).length > 0 ? `<div style="column-count:2;column-gap:48px;">${pilaresHtml}</div>` : ""}
  </section>
</div>

<!-- ENTREGABLES -->
${(c.entregables || []).length > 0 ? `
<div class="wrap">
  <section class="sec">
    <div class="sec-tag">Alcance</div>
    <h2 class="sec-title">Entregables</h2>
    ${entregablesHtml}
  </section>
</div>` : ""}

<!-- FASES -->
${(c.fases || []).length > 0 ? `
<div class="wrap">
  <section class="sec" id="cronograma">
    <div class="sec-tag">Cronograma</div>
    <h2 class="sec-title">Fases del proyecto</h2>
    ${fasesHtml}
  </section>
</div>` : ""}

<!-- KPIS -->
${(c.resultadosEsperados || []).length > 0 ? `
<div class="kpi-strip">
  <div class="wrap">
    <div class="kpi-label">Resultados esperados</div>
    <div class="kpi-grid">
      ${kpisHtml}
    </div>
  </div>
</div>` : ""}

<!-- INVERSIÓN -->
<div class="wrap">
  <section class="sec" id="inversion">
    <div class="sec-tag">Inversión</div>
    <h2 class="sec-title">Inversión requerida</h2>
    <div class="invest-box">
      <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#999;">${esc(c.tipoProyecto || "Proyecto")}</div>
      <div class="invest-price">${esc(c.inversion?.total || "")}</div>
      ${c.inversion?.terminos ? `<p style="font-size:14px;color:#666;line-height:1.7;margin-bottom:28px;">${esc(c.inversion.terminos)}</p>` : ""}
      <ul style="border-top:1px solid #e8e8e8;">${incluyeHtml}</ul>
      <a href="${acceptUrl}" class="invest-cta">Confirmar y aceptar →</a>
    </div>
  </section>
</div>

<!-- PRÓXIMOS PASOS -->
${(c.proximosPasos || []).length > 0 ? `
<div class="wrap">
  <section class="sec" id="pasos">
    <div class="sec-tag">Siguientes pasos</div>
    <h2 class="sec-title">¿Cómo empezamos?</h2>
    ${pasosHtml}
  </section>
</div>` : ""}

${termsHtml ? `<div class="wrap">${termsHtml}</div>` : ""}

</main>

<!-- FOOTER -->
<footer class="site-footer">
  <div class="wrap footer-inner">
    <div class="footer-left">
      <strong>${esc(brand.agencyName)}</strong><br/>
      Propuesta para ${clientLabel}<br/>
      ${brand.senderName ? `Presentado por ${esc(brand.senderName)}<br/>` : ""}
      Vigencia: 15 días hábiles · ${fecha}
    </div>
    <a href="${acceptUrl}" style="display:inline-flex;align-items:center;gap:8px;padding:14px 28px;border:2px solid #0a0a0a;border-radius:6px;font-size:14px;font-weight:700;color:#0a0a0a;transition:background 0.2s,color 0.2s;" class="floating-cta"
       onmouseover="this.style.background='#0a0a0a';this.style.color='#fff';"
       onmouseout="this.style.background='transparent';this.style.color='#0a0a0a';">
      Aceptar propuesta →
    </a>
  </div>
</footer>

</body>
</html>`;
}
