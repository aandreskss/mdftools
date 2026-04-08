import type { DesignProposalContent } from "@/lib/design-proposal-template";
import type { BrandConfig } from "./types";

function esc(s: string): string {
  if (!s) return "";
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function renderCorporateTemplate(
  c: DesignProposalContent,
  brand: BrandConfig,
  clientName: string,
  clientCompany?: string,
  proposalId?: string,
): string {
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });
  const clientLabel = clientCompany ? `${esc(clientName)} · ${esc(clientCompany)}` : esc(clientName);
  const p = brand.primaryColor || "#2563eb";
  const s = brand.secondaryColor || "#0ea5e9";
  const acceptUrl = proposalId ? `/api/proposals/accept?id=${proposalId}` : "#";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="logo" style="max-height:36px;max-width:130px;object-fit:contain;filter:brightness(0) invert(1);"/>`
    : `<div style="width:36px;height:36px;border-radius:8px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-weight:800;color:#fff;font-size:18px;">${esc(brand.agencyName?.[0] || "A")}</div>`;

  const retosHtml = (c.retosDetectados || []).map((r, i) => `
    <tr>
      <td style="padding:20px 24px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:36px;">
        <div style="width:28px;height:28px;border-radius:6px;background:${p}15;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:${p};">${i + 1}</div>
      </td>
      <td style="padding:20px 24px;border-bottom:1px solid #f1f5f9;vertical-align:top;">
        <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:6px;">${esc(r.titulo)}</div>
        <div style="font-size:14px;color:#64748b;line-height:1.6;">${esc(r.descripcion)}</div>
      </td>
    </tr>`).join("");

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map((pl, i) => `
    <div style="display:flex;align-items:flex-start;gap:14px;padding:20px;background:#f8fafc;border-radius:10px;border-left:3px solid ${i % 2 === 0 ? p : s};">
      <div style="font-size:20px;font-weight:800;color:${i % 2 === 0 ? p : s};opacity:0.4;min-width:28px;line-height:1;">${i + 1}</div>
      <div style="font-size:14px;font-weight:600;color:#334155;line-height:1.5;">${esc(pl)}</div>
    </div>`).join("");

  const entregablesHtml = (c.entregables || []).map((e, i) => `
    <tr>
      <td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:500;color:#94a3b8;width:40px;">${String(i + 1).padStart(2, "0")}</td>
      <td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${esc(e)}</td>
      <td style="padding:14px 20px;border-bottom:1px solid #f1f5f9;text-align:right;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8 3l5 5-5 5" stroke="${p}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </td>
    </tr>`).join("");

  const fasesHtml = (c.fases || []).map((f, i) => {
    const pct = Math.round(((i + 1) / (c.fases?.length || 1)) * 100);
    return `
    <div style="background:#fff;border-radius:14px;padding:28px 32px;box-shadow:0 1px 8px rgba(0,0,0,0.06);border:1px solid #e2e8f0;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;width:${pct}%;height:3px;background:linear-gradient(90deg,${p},${s});"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <div style="display:flex;align-items:center;gap:12px;">
          <div style="width:36px;height:36px;border-radius:8px;background:linear-gradient(135deg,${p},${s});display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:15px;">${f.numero}</div>
          <h4 style="font-size:16px;font-weight:700;color:#0f172a;margin:0;">${esc(f.titulo)}</h4>
        </div>
        ${f.duracion ? `<span style="font-size:12px;font-weight:600;color:${p};background:${p}12;padding:4px 12px;border-radius:100px;">${esc(f.duracion)}</span>` : ""}
      </div>
      <p style="font-size:14px;color:#64748b;line-height:1.7;margin:0;">${esc(f.descripcion)}</p>
    </div>`;
  }).join("");

  const kpisHtml = (c.resultadosEsperados || []).slice(0, 3).map((r, i) => {
    const parts = r.match(/^([+\-~]?\d[\d,.%xk]*(?:\/\w+)?|[+\-~]?\d+pp)\s*(.*)?$/i);
    const val = parts ? parts[1] : r.slice(0, 10);
    const desc = parts && parts[2] ? parts[2] : r;
    return `
    <div style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:14px;padding:32px;">
      <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.5);margin-bottom:12px;">Métrica ${i + 1}</div>
      <div style="font-size:44px;font-weight:800;color:#fff;letter-spacing:-0.02em;line-height:1;margin-bottom:10px;">${esc(val)}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.6);line-height:1.5;">${esc(desc)}</div>
    </div>`;
  }).join("");

  const incluyeHtml = (c.inversion?.incluye || []).map(it => `
    <tr>
      <td style="padding:12px 20px;border-bottom:1px solid #f1f5f9;vertical-align:top;width:28px;">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="${p}" stroke-width="1.5"/><path d="M5 8l2 2 4-4" stroke="${p}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </td>
      <td style="padding:12px 20px;border-bottom:1px solid #f1f5f9;font-size:14px;color:#334155;">${esc(it)}</td>
    </tr>`).join("");

  const pasosHtml = (c.proximosPasos || []).map((paso, i) => `
    <div style="display:grid;grid-template-columns:28px 1fr;gap:16px;align-items:start;padding:16px 0;border-bottom:1px solid #f1f5f9;">
      <div style="width:28px;height:28px;border-radius:6px;background:${p};color:#fff;font-weight:700;font-size:12px;display:flex;align-items:center;justify-content:center;">${i + 1}</div>
      <p style="font-size:14px;color:#334155;line-height:1.6;margin:0;padding-top:4px;">${esc(paso)}</p>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <div style="margin-top:40px;padding:28px;background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
      <h4 style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#94a3b8;margin:0 0 16px;">Términos y Condiciones</h4>
      <p style="font-size:13px;color:#64748b;line-height:1.9;white-space:pre-wrap;margin:0;">${esc(brand.termsConditions)}</p>
    </div>` : "";

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=1200"/>
<title>Propuesta — ${esc(clientName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  html{scroll-behavior:smooth;}
  body{font-family:'DM Sans',sans-serif;background:#f8fafc;color:#0f172a;line-height:1.6;min-width:1000px;}
  a{text-decoration:none;color:inherit;}
  ul,ol{list-style:none;}
  img{max-width:100%;}
  table{border-collapse:collapse;width:100%;}

  .layout{display:grid;grid-template-columns:260px 1fr;min-height:100vh;}

  /* SIDEBAR */
  .sidebar{background:linear-gradient(180deg,#0f172a 0%,#1e293b 100%);position:sticky;top:0;height:100vh;overflow-y:auto;padding:40px 0;display:flex;flex-direction:column;}
  .sidebar-top{padding:0 28px 32px;border-bottom:1px solid rgba(255,255,255,0.06);}
  .sidebar-agency{display:flex;align-items:center;gap:10px;margin-bottom:28px;}
  .sidebar-agency-name{font-size:14px;font-weight:700;color:#fff;}
  .sidebar-client{font-size:12px;color:rgba(255,255,255,0.5);line-height:1.6;}
  .sidebar-client strong{color:rgba(255,255,255,0.8);display:block;font-size:15px;font-weight:700;margin-bottom:4px;}
  .sidebar-date{font-size:11px;color:rgba(255,255,255,0.35);margin-top:8px;}
  .sidebar-nav{padding:24px 16px;flex:1;}
  .sidebar-nav-title{font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.25);padding:0 12px;margin-bottom:8px;}
  .nav-item{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.5);cursor:pointer;transition:background 0.2s,color 0.2s;margin-bottom:2px;}
  .nav-item:hover{background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.9);}
  .nav-item.active{background:${p}20;color:#fff;}
  .nav-dot{width:6px;height:6px;border-radius:50%;background:${p};flex-shrink:0;}
  .sidebar-bottom{padding:24px 28px;border-top:1px solid rgba(255,255,255,0.06);}
  .sidebar-badge{background:linear-gradient(135deg,${p},${s});border-radius:12px;padding:20px;color:#fff;}
  .sidebar-badge-label{font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;opacity:0.7;margin-bottom:8px;}
  .sidebar-badge-value{font-size:22px;font-weight:800;letter-spacing:-0.02em;}
  .sidebar-badge-type{font-size:12px;opacity:0.7;margin-top:4px;}

  /* MAIN */
  .main{overflow:hidden;}

  /* Top bar */
  .topbar{background:#fff;border-bottom:1px solid #e2e8f0;padding:16px 40px;display:flex;align-items:center;justify-between;position:sticky;top:0;z-index:10;}
  .topbar-crumbs{font-size:13px;color:#94a3b8;}
  .topbar-crumbs strong{color:#334155;font-weight:600;}
  .btn-accept{display:inline-flex;align-items:center;gap:6px;padding:10px 22px;border-radius:10px;font-size:13px;font-weight:700;color:#fff;background:linear-gradient(135deg,${p},${s});box-shadow:0 4px 12px ${p}40;transition:transform 0.2s;}
  .btn-accept:hover{transform:translateY(-1px);}

  /* Content area */
  .content{padding:40px;}

  /* Section blocks */
  .block{background:#fff;border-radius:16px;padding:32px;margin-bottom:24px;box-shadow:0 1px 8px rgba(0,0,0,0.05);border:1px solid #e2e8f0;}
  .block-header{display:flex;align-items:center;gap:14px;margin-bottom:28px;}
  .block-icon{width:40px;height:40px;border-radius:10px;background:${p}12;display:flex;align-items:center;justify-content:center;flex-shrink:0;}
  .block-title{font-size:17px;font-weight:700;color:#0f172a;}
  .block-tag{font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${p};margin-left:auto;background:${p}10;padding:4px 10px;border-radius:6px;}

  /* Grid helpers */
  .g2{display:grid;grid-template-columns:1fr 1fr;gap:20px;}
  .g3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}

  /* Dark panel */
  .dark-panel{background:linear-gradient(135deg,#0f172a,#1e293b);border-radius:16px;padding:40px;position:relative;overflow:hidden;margin-bottom:24px;}
  .dark-panel::before{content:"";position:absolute;top:-60px;right:-60px;width:240px;height:240px;border-radius:50%;background:radial-gradient(circle,${p}30,transparent 70%);}
  .dark-panel::after{content:"";position:absolute;bottom:-60px;left:-40px;width:180px;height:180px;border-radius:50%;background:radial-gradient(circle,${s}20,transparent 70%);}

  /* Footer */
  .page-footer{background:#0f172a;padding:32px 40px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;}
  .page-footer-text{font-size:13px;color:rgba(255,255,255,0.4);}
  .page-footer-text strong{color:rgba(255,255,255,0.7);}

  @media(max-width:900px){
    .layout{grid-template-columns:1fr;}
    .sidebar{display:none;}
    .topbar,.content,.page-footer{padding-left:24px;padding-right:24px;}
    .g2,.g3{grid-template-columns:1fr;}
  }
</style>
</head>
<body>
<div class="layout">

<!-- SIDEBAR -->
<aside class="sidebar">
  <div class="sidebar-top">
    <div class="sidebar-agency">
      ${logoHtml}
      <span class="sidebar-agency-name">${esc(brand.agencyName)}</span>
    </div>
    <div class="sidebar-client">
      <strong>${clientLabel}</strong>
      ${c.tipoProyecto ? `<span>${esc(c.tipoProyecto)}</span>` : ""}
    </div>
    <div class="sidebar-date">${fecha}</div>
  </div>

  <nav class="sidebar-nav">
    <div class="sidebar-nav-title">Contenido</div>
    <a href="#resumen" class="nav-item active"><span class="nav-dot"></span> Resumen Ejecutivo</a>
    <a href="#retos" class="nav-item"><span class="nav-dot"></span> Diagnóstico</a>
    <a href="#estrategia" class="nav-item"><span class="nav-dot"></span> Estrategia</a>
    <a href="#entregables" class="nav-item"><span class="nav-dot"></span> Entregables</a>
    <a href="#cronograma" class="nav-item"><span class="nav-dot"></span> Cronograma</a>
    <a href="#resultados" class="nav-item"><span class="nav-dot"></span> Resultados</a>
    <a href="#inversion" class="nav-item"><span class="nav-dot"></span> Inversión</a>
    <a href="#pasos" class="nav-item"><span class="nav-dot"></span> Próximos Pasos</a>
  </nav>

  <div class="sidebar-bottom">
    <div class="sidebar-badge">
      <div class="sidebar-badge-label">Inversión total</div>
      <div class="sidebar-badge-value">${esc(c.inversion?.total || "—")}</div>
      <div class="sidebar-badge-type">${esc(c.tipoProyecto || "")}</div>
    </div>
  </div>
</aside>

<!-- MAIN CONTENT -->
<div class="main">

  <!-- TOP BAR -->
  <div class="topbar">
    <div class="topbar-crumbs">
      Propuestas &rsaquo; <strong>${clientLabel}</strong>
    </div>
    <a href="${acceptUrl}" class="btn-accept" id="accept-btn">
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      Aceptar propuesta
    </a>
  </div>

  <div class="content">

    <!-- RESUMEN EJECUTIVO -->
    <div class="block" id="resumen">
      <div class="block-header">
        <div class="block-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 5h14M3 10h10M3 15h7" stroke="${p}" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="block-title">Resumen Ejecutivo</div>
        <div class="block-tag">${esc(c.tipoProyecto || "Propuesta")}</div>
      </div>
      <h1 style="font-size:22px;font-weight:800;color:#0f172a;line-height:1.3;letter-spacing:-0.01em;margin-bottom:12px;">${esc(c.tipoProyecto || "Propuesta Comercial")} — ${clientLabel}</h1>
      <p style="font-size:15px;color:#334155;line-height:1.7;max-width:640px;margin-bottom:12px;">${esc(c.resumenCreativo)}</p>
      <p style="font-size:14px;color:#64748b;line-height:1.7;max-width:640px;">${esc(c.entendimientoDelCliente)}</p>
    </div>

    <!-- RETOS -->
    ${(c.retosDetectados || []).length > 0 ? `
    <div class="block" id="retos">
      <div class="block-header">
        <div class="block-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="7" stroke="${p}" stroke-width="1.5"/><path d="M10 6v4.5M10 14h.01" stroke="${p}" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="block-title">Diagnóstico · Retos Identificados</div>
      </div>
      <table>
        <tbody>${retosHtml}</tbody>
      </table>
    </div>` : ""}

    <!-- ESTRATEGIA -->
    <div class="block" id="estrategia">
      <div class="block-header">
        <div class="block-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2l2.8 5.6L18 8.6l-4 3.9.9 5.5L10 15.4l-4.9 2.6.9-5.5-4-3.9 5.2-.8L10 2z" stroke="${p}" stroke-width="1.5" stroke-linejoin="round"/></svg>
        </div>
        <div class="block-title">Estrategia y Enfoque</div>
      </div>
      <p style="font-size:15px;color:#64748b;line-height:1.8;margin-bottom:28px;">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
      ${(c.enfoqueCreativo?.pilares || []).length > 0 ? `<div class="g2">${pilaresHtml}</div>` : ""}
    </div>

    <!-- ENTREGABLES -->
    ${(c.entregables || []).length > 0 ? `
    <div class="block" id="entregables">
      <div class="block-header">
        <div class="block-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h12v12H4V4z" stroke="${p}" stroke-width="1.5" stroke-linejoin="round"/><path d="M8 10l2 2 4-4" stroke="${p}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="block-title">Entregables del Proyecto</div>
      </div>
      <table>
        <tbody>${entregablesHtml}</tbody>
      </table>
    </div>` : ""}

    <!-- CRONOGRAMA -->
    ${(c.fases || []).length > 0 ? `
    <div id="cronograma">
      <h3 style="font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#94a3b8;margin-bottom:16px;">Cronograma de Fases</h3>
      <div style="display:flex;flex-direction:column;gap:16px;">${fasesHtml}</div>
    </div>
    <div style="height:24px;"></div>` : ""}

    <!-- RESULTADOS KPIs -->
    ${(c.resultadosEsperados || []).length > 0 ? `
    <div class="dark-panel" id="resultados">
      <div style="position:relative;z-index:1;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:14px;">Resultados Esperados</div>
        <h3 style="font-size:22px;font-weight:800;color:#fff;margin-bottom:32px;letter-spacing:-0.01em;">KPIs y métricas proyectadas</h3>
        <div class="g3">${kpisHtml}</div>
      </div>
    </div>` : ""}

    <!-- INVERSIÓN -->
    <div class="block" id="inversion">
      <div class="block-header">
        <div class="block-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="6" width="16" height="12" rx="2" stroke="${p}" stroke-width="1.5"/><path d="M2 10h16M6 2h8" stroke="${p}" stroke-width="1.5" stroke-linecap="round"/></svg>
        </div>
        <div class="block-title">Plan de Inversión</div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;align-items:start;">
        <div>
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:10px;">Inversión Total</div>
          <div style="font-size:42px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;line-height:1;margin-bottom:12px;">${esc(c.inversion?.total || "")}</div>
          ${c.inversion?.terminos ? `<p style="font-size:14px;color:#64748b;line-height:1.7;margin-bottom:24px;">${esc(c.inversion.terminos)}</p>` : ""}
          <a href="${acceptUrl}" class="btn-accept" style="margin-top:16px;display:inline-flex;">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-6" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Aceptar propuesta
          </a>
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;margin-bottom:12px;">Incluye</div>
          <table>
            <tbody>${incluyeHtml}</tbody>
          </table>
        </div>
      </div>
    </div>

    ${termsHtml}

    <!-- PRÓXIMOS PASOS -->
    ${(c.proximosPasos || []).length > 0 ? `
    <div class="block" id="pasos">
      <div class="block-header">
        <div class="block-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 10h12M12 5l5 5-5 5" stroke="${p}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div class="block-title">Próximos Pasos</div>
      </div>
      ${pasosHtml}
    </div>` : ""}

  </div><!-- /content -->

  <!-- FOOTER -->
  <footer class="page-footer">
    <div class="page-footer-text">
      © ${new Date().getFullYear()} <strong>${esc(brand.agencyName)}</strong> · Para ${clientLabel}
      ${brand.senderName ? ` · Presentado por <strong>${esc(brand.senderName)}</strong>` : ""} · ${fecha}
      <br/>Vigencia: 15 días hábiles
    </div>
    <a href="${acceptUrl}" class="btn-accept floating-cta">Aceptar y firmar propuesta →</a>
  </footer>

</div><!-- /main -->
</div><!-- /layout -->

</body>
</html>`;
}
