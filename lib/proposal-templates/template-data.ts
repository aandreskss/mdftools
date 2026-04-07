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
    ? `<img src="${esc(brand.logoUrl)}" style="max-height:36px;max-width:130px;object-fit:contain;margin-bottom:6px;" alt="logo" />`
    : "";

  const retosHtml = (c.retosDetectados || []).slice(0, 4).map((r) => `
    <div style="background:#fff;border-radius:16px;padding:20px 24px;display:flex;gap:16px;align-items:flex-start;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
      <span style="color:#dc2626;font-size:22px;margin-top:2px;">⚡</span>
      <div>
        <div style="font-weight:700;font-size:15px;color:#1a1a2e;margin-bottom:4px;">${esc(r.titulo)}</div>
        <div style="font-size:13px;color:#525c6c;line-height:1.5;">${esc(r.descripcion)}</div>
      </div>
    </div>`).join("");

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map((p_, i) => `
    <div style="display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-bottom:1px solid #f0f0f0;">
      <div style="width:32px;height:32px;border-radius:50%;background:${p};display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="color:#fff;font-weight:700;font-size:13px;">${String(i + 1).padStart(2, "0")}</span>
      </div>
      <div style="font-size:14px;color:#252f3d;line-height:1.5;padding-top:6px;">${esc(p_)}</div>
    </div>`).join("");

  const fasesHtml = (c.fases || []).map((f) => `
    <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:${p};margin-bottom:12px;">${esc(f.duracion)}</div>
      <div style="font-weight:700;font-size:16px;color:#1a1a2e;margin-bottom:8px;">${esc(f.titulo)}</div>
      <ul style="list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px;">
        <li style="font-size:12px;color:#525c6c;">• ${esc(f.descripcion)}</li>
      </ul>
    </div>`).join("");

  const invHtml = (c.inversion?.incluye || []).map(item => `
    <tr style="border-bottom:1px solid #f0f4ff;">
      <td style="padding:16px 0;font-size:14px;color:#252f3d;">${esc(item)}</td>
      <td style="padding:16px 0;text-align:right;font-size:12px;color:#525c6c;">Incluido</td>
    </tr>`).join("");

  const porQueHtml = (c.porQueNosotros || []).slice(0, 3).map(q => `
    <div style="background:#fff;border-radius:16px;padding:24px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
      <div style="font-size:28px;margin-bottom:12px;">✦</div>
      <div style="font-weight:700;font-size:15px;color:#1a1a2e;margin-bottom:8px;">${esc(q.titulo)}</div>
      <div style="font-size:13px;color:#525c6c;line-height:1.5;">${esc(q.descripcion)}</div>
    </div>`).join("");

  const pasosHtml = (c.proximosPasos || []).map(p_ => `
    <label style="display:flex;align-items:center;gap:16px;padding:16px 20px;background:#fff;border-radius:16px;cursor:pointer;">
      <input type="checkbox" style="width:20px;height:20px;accent-color:${p};flex-shrink:0;" />
      <span style="font-size:14px;font-weight:500;color:#252f3d;">${esc(p_)}</span>
    </label>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section style="margin-bottom:40px;">
      <h2 style="font-size:22px;font-weight:800;color:#252f3d;margin-bottom:16px;">Términos y Condiciones</h2>
      <div style="background:#fff;border-radius:20px;padding:32px;font-size:13px;line-height:1.7;color:#525c6c;box-shadow:0 1px 8px rgba(0,0,0,0.04);white-space:pre-wrap;">${esc(brand.termsConditions)}</div>
    </section>` : "";

  const senderHtml = brand.senderName
    ? `<div style="margin-top:8px;font-size:13px;color:#a3aec0;">Presentado por: <strong style="color:#6d7788;">${esc(brand.senderName)}</strong></div>` : "";

  const acceptBtn = proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" style="display:inline-block;padding:16px 32px;background:linear-gradient(90deg,${p},${s});color:#fff;font-weight:700;border-radius:16px;text-decoration:none;font-size:14px;">Aceptar Propuesta</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="es" style="scroll-behavior:smooth;">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Propuesta — ${esc(clientName)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:#f4f6ff;color:#252f3d;min-height:100vh;}
  aside{position:fixed;left:0;top:0;height:100vh;width:256px;background:#fff;box-shadow:0 20px 40px -12px rgba(110,58,201,0.08);display:flex;flex-direction:column;gap:24px;padding:24px;z-index:50;}
  main{margin-left:256px;min-height:100vh;padding:32px 40px 80px;}
  nav a{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;font-size:14px;font-weight:500;color:#525c6c;text-decoration:none;transition:all .2s;}
  nav a:hover,nav a.active{background:#ede9fe;color:${p};}
  section{margin-bottom:48px;}
  @media(max-width:768px){aside{display:none;}main{margin-left:0;padding:24px 16px 60px;}}
</style>
</head>
<body>
<aside>
  <div>
    ${logoHtml}
    <div style="font-size:20px;font-weight:800;background:linear-gradient(135deg,${p},${s});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${esc(brand.agencyName)}</div>
    <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#a3aec0;margin-top:2px;">Propuesta Profesional</div>
  </div>
  <nav style="display:flex;flex-direction:column;gap:4px;">
    <a href="#intro" class="active">Introducción</a>
    <a href="#estrategia">Estrategia</a>
    <a href="#enfoque">Enfoque</a>
    <a href="#cronograma">Cronograma</a>
    <a href="#inversion">Inversión</a>
  </nav>
  <div style="margin-top:auto;">${acceptBtn}</div>
</aside>

<main>
  <!-- Hero -->
  <section id="intro" style="position:relative;min-height:480px;display:flex;flex-direction:column;justify-content:center;overflow:hidden;border-radius:32px;background:#0a0a18;padding:56px 64px;margin-bottom:32px;">
    <div style="position:absolute;top:-20%;right:-5%;width:400px;height:360px;background:${p};opacity:0.12;filter:blur(80px);border-radius:50%;pointer-events:none;"></div>
    <div style="position:relative;z-index:1;max-width:640px;">
      <span style="display:inline-block;padding:6px 16px;border-radius:100px;background:rgba(167,139,250,0.15);border:1px solid rgba(167,139,250,0.3);font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${p};margin-bottom:24px;">${esc(c.tipoProyecto)}</span>
      <h1 style="font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1;color:#fff;margin-bottom:24px;">${esc(c.resumenCreativo)}</h1>
      <div style="display:flex;gap:32px;align-items:center;">
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.4);">Preparado para</div>
          <div style="font-weight:700;font-size:16px;color:#fff;margin-top:2px;">${clientLabel}</div>
        </div>
        <div style="width:1px;height:40px;background:rgba(255,255,255,0.15);"></div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:rgba(255,255,255,0.4);">Fecha</div>
          <div style="font-weight:700;font-size:16px;color:#fff;margin-top:2px;">${fecha}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Strategy -->
  <section id="estrategia" style="display:grid;grid-template-columns:2fr 1fr;gap:24px;margin-bottom:32px;">
    <div style="background:#fff;border-radius:24px;padding:40px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
      <span style="font-size:40px;color:${p};display:block;margin-bottom:16px;">"</span>
      <p style="font-size:20px;font-weight:700;color:#252f3d;line-height:1.4;margin-bottom:16px;">${esc(c.entendimientoDelCliente)}</p>
    </div>
    <div style="background:${p};border-radius:24px;padding:32px;display:flex;flex-direction:column;justify-content:center;color:#fff;overflow:hidden;position:relative;">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;opacity:0.7;margin-bottom:16px;">Inversión Total</div>
      <div style="font-size:48px;font-weight:900;letter-spacing:-2px;">${esc(c.inversion?.total || "")}</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.7);margin-top:8px;">${esc(c.inversion?.terminos || "")}</div>
    </div>
  </section>

  <!-- Retos -->
  <section style="background:#fff;border-radius:24px;padding:40px;margin-bottom:32px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
    <h2 style="font-size:24px;font-weight:800;color:#252f3d;margin-bottom:24px;">Retos Identificados</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;">${retosHtml}</div>
  </section>

  <!-- Enfoque -->
  <section id="enfoque" style="background:#fff;border-radius:24px;padding:40px;margin-bottom:32px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
    <h2 style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#252f3d;margin-bottom:8px;">Estrategia Técnica</h2>
    <p style="color:#525c6c;margin-bottom:32px;">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
    ${pilaresHtml}
  </section>

  <!-- Cronograma -->
  <section id="cronograma" style="margin-bottom:32px;">
    <div style="display:grid;grid-template-columns:1fr 3fr;gap:16px;align-items:start;">
      <div style="background:${s};border-radius:24px;padding:32px;color:#fff;">
        <h2 style="font-size:28px;font-weight:900;line-height:1.1;">Cronograma del Proyecto</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:16px;">${fasesHtml}</div>
    </div>
  </section>

  <!-- Inversión -->
  <section id="inversion" style="background:#fff;border-radius:24px;padding:40px;margin-bottom:32px;box-shadow:0 1px 8px rgba(0,0,0,0.04);">
    <h2 style="font-size:28px;font-weight:900;letter-spacing:-1px;color:#252f3d;margin-bottom:32px;">Inversión Detallada</h2>
    <table style="width:100%;border-collapse:collapse;">
      <thead>
        <tr style="border-bottom:2px solid #f0f4ff;">
          <th style="padding:12px 0;text-align:left;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#a3aec0;">Servicio</th>
          <th style="padding:12px 0;text-align:right;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:#a3aec0;">Detalle</th>
        </tr>
      </thead>
      <tbody>${invHtml}</tbody>
      <tfoot>
        <tr style="background:#f4f6ff;">
          <td style="padding:20px 16px;font-weight:800;font-size:18px;border-radius:12px 0 0 12px;">Total del Proyecto</td>
          <td style="padding:20px 16px;text-align:right;font-weight:900;font-size:24px;color:${p};border-radius:0 12px 12px 0;">${esc(c.inversion?.total || "")}</td>
        </tr>
      </tfoot>
    </table>
  </section>

  <!-- Por qué nosotros -->
  <section style="margin-bottom:32px;">
    <h2 style="font-size:22px;font-weight:800;color:#252f3d;margin-bottom:20px;text-align:center;">Por qué elegirnos</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">${porQueHtml}</div>
  </section>

  <!-- Próximos pasos -->
  <section style="background:#f4f6ff;border-radius:24px;padding:40px;margin-bottom:32px;">
    <h2 style="font-size:22px;font-weight:800;color:#252f3d;margin-bottom:20px;">Próximos Pasos</h2>
    <div style="display:flex;flex-direction:column;gap:10px;">${pasosHtml}</div>
  </section>

  ${termsHtml}

  <!-- Footer -->
  <footer style="text-align:center;padding-top:40px;border-top:1px solid #e8edf8;">
    <div style="font-size:13px;font-weight:700;color:#a3aec0;text-transform:uppercase;letter-spacing:1.5px;">${esc(brand.agencyName)} · Propuesta Confidencial · ${fecha}</div>
    ${senderHtml}
  </footer>
</main>
</body>
</html>`;
}
