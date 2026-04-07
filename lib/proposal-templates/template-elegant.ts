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
    ? `<img src="${esc(brand.logoUrl)}" style="max-height:36px;max-width:130px;object-fit:contain;margin-bottom:8px;" alt="logo" />`
    : "";

  const retosHtml = (c.retosDetectados || []).map(r => `
    <div style="background:#fff;border-radius:24px;padding:28px;box-shadow:0 20px 40px -12px rgba(110,58,201,0.06);cursor:default;">
      <div style="width:44px;height:44px;border-radius:14px;background:#f0ebff;display:flex;align-items:center;justify-content:center;margin-bottom:20px;">
        <span style="font-size:20px;">⚡</span>
      </div>
      <h4 style="font-size:18px;font-weight:700;margin-bottom:12px;color:#1a1a2e;">${esc(r.titulo)}</h4>
      <p style="font-size:13px;color:#525c6c;line-height:1.6;">${esc(r.descripcion)}</p>
      <div style="margin-top:16px;padding-top:14px;border-top:1px solid #f8f8fc;display:flex;gap:6px;">
        <span style="padding:4px 10px;background:#f4f6ff;border-radius:100px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:${p};">Crítico</span>
      </div>
    </div>`).join("");

  const solucionCard = `
    <div style="background:linear-gradient(135deg,${p},${s});border-radius:24px;padding:28px;color:#fff;">
      <h4 style="font-size:18px;font-weight:700;margin-bottom:12px;">Nuestra Solución</h4>
      <p style="font-size:14px;line-height:1.6;opacity:0.9;">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
    </div>`;

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map(p_ => `
    <div style="display:flex;gap:16px;align-items:flex-start;padding:16px 0;">
      <span style="color:${p};font-size:20px;flex-shrink:0;margin-top:2px;">✓</span>
      <div>
        <h5 style="font-size:16px;font-weight:700;color:#1a1a2e;margin-bottom:4px;">${esc(p_)}</h5>
      </div>
    </div>`).join("");

  const entregablesHtml = (c.entregables || []).map(e => `
    <div style="background:#fff;padding:20px 24px;border-radius:16px;display:flex;align-items:center;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
      <span style="color:${p};font-size:18px;">✦</span>
      <span style="font-size:14px;font-weight:500;color:#252f3d;">${esc(e)}</span>
    </div>`).join("");

  const fasesHtml = (c.fases || []).map((f, i) => `
    <div style="display:flex;gap:24px;position:relative;padding-bottom:${i < (c.fases || []).length - 1 ? "32px" : "0"};${i < (c.fases || []).length - 1 ? "border-left:2px solid rgba(110,58,201,0.1);margin-left:8px;padding-left:32px;" : "margin-left:8px;padding-left:32px;"}">
      <div style="position:absolute;left:-11px;top:0;width:20px;height:20px;border-radius:50%;background:${i === 0 ? p : "#f0f4ff"};border:2px solid ${i === 0 ? p : "rgba(110,58,201,0.2)"};"></div>
      <div>
        <h4 style="font-size:18px;font-weight:700;color:#1a1a2e;">${esc(f.titulo)}</h4>
        <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${p};margin:6px 0;">${esc(f.duracion)}</div>
        <p style="font-size:14px;color:#525c6c;line-height:1.6;">${esc(f.descripcion)}</p>
      </div>
    </div>`).join("");

  const invHtml = (c.inversion?.incluye || []).map(item => `
    <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
      <span style="color:rgba(255,255,255,0.6);font-size:14px;">${esc(item)}</span>
      <span style="font-weight:700;color:#fff;font-size:14px;">Incluido</span>
    </div>`).join("");

  const pasosHtml = (c.proximosPasos || []).map((p_, i) => `
    <div style="text-align:center;padding:0 16px;">
      <div style="width:56px;height:56px;border-radius:50%;background:rgba(110,58,201,0.1);display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:20px;font-weight:700;font-style:italic;color:${p};">${i + 1}</div>
      <h5 style="font-weight:700;font-size:15px;margin-bottom:8px;color:#1a1a2e;">${esc(p_)}</h5>
    </div>`).join("");

  const porQueHtml = (c.porQueNosotros || []).map(q => `
    <div style="display:flex;flex-direction:column;align-items:center;text-align:center;">
      <div style="width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,${p},${s});padding:2px;margin-bottom:20px;">
        <div style="width:100%;height:100%;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;">✦</div>
      </div>
      <h5 style="font-size:17px;font-weight:700;margin-bottom:10px;color:#1a1a2e;">${esc(q.titulo)}</h5>
      <p style="font-size:13px;color:#525c6c;line-height:1.5;">${esc(q.descripcion)}</p>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section style="margin-bottom:40px;padding:0 48px;">
      <h2 style="font-size:22px;font-weight:800;color:#1a1a2e;margin-bottom:16px;">Términos y Condiciones</h2>
      <div style="background:#fff;border-radius:24px;padding:32px;font-size:13px;line-height:1.7;color:#525c6c;box-shadow:0 20px 40px -12px rgba(110,58,201,0.06);white-space:pre-wrap;">${esc(brand.termsConditions)}</div>
    </section>` : "";

  const senderHtml = brand.senderName
    ? `<span style="font-size:13px;color:rgba(255,255,255,0.5);">Presentado por: <strong style="color:rgba(255,255,255,0.7);">${esc(brand.senderName)}</strong></span>` : "";

  const acceptBtn = proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" style="display:inline-block;padding:18px 40px;background:${p};color:#fff;font-weight:700;border-radius:100px;text-decoration:none;font-size:14px;letter-spacing:0.5px;">Aceptar Propuesta</a>`
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
  aside{position:fixed;left:0;top:0;height:100vh;width:256px;background:#0c0c0e;display:flex;flex-direction:column;gap:24px;padding:24px;z-index:50;}
  main{margin-left:256px;min-height:100vh;padding-bottom:80px;}
  nav a{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;font-size:14px;font-weight:500;color:#666;text-decoration:none;transition:all .2s;}
  nav a:hover{background:rgba(110,58,201,0.15);color:${p};}
  section.padded{padding:0 48px;margin-bottom:64px;}
  @media(max-width:768px){aside{display:none;}main{margin-left:0;}}
  .padded-inner{max-width:900px;margin:0 auto;}
</style>
</head>
<body>

<aside>
  <div>
    ${logoHtml}
    <div style="font-size:18px;font-weight:800;background:linear-gradient(135deg,${p},${s});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${esc(brand.agencyName)}</div>
    <div style="font-size:11px;color:#444;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px;">Propuesta Premium</div>
  </div>
  <nav style="display:flex;flex-direction:column;gap:4px;flex:1;overflow-y:auto;">
    <a href="#intro">Introducción</a>
    <a href="#cliente">Cliente</a>
    <a href="#estrategia">Estrategia</a>
    <a href="#cronograma">Cronograma</a>
    <a href="#inversion">Inversión</a>
  </nav>
  <div style="padding-top:20px;border-top:1px solid #1a1a1e;">${acceptBtn}</div>
</aside>

<main>
  <!-- Hero -->
  <section id="intro" style="position:relative;min-height:560px;display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;margin-bottom:64px;">
    <div style="position:absolute;inset:0;background:linear-gradient(135deg,${p}ee,${s}cc);z-index:1;"></div>
    <div style="position:relative;z-index:2;padding:48px 56px;max-width:800px;">
      <p style="display:inline-block;padding:6px 16px;border-radius:100px;background:rgba(255,255,255,0.2);backdrop-filter:blur(8px);font-size:11px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#fff;margin-bottom:24px;">${esc(c.tipoProyecto)} · ${clientLabel}</p>
      <h1 style="font-size:64px;font-weight:900;letter-spacing:-3px;line-height:0.95;color:#fff;margin-bottom:28px;">${esc(c.resumenCreativo)}</h1>
      <div style="display:flex;gap:40px;color:rgba(255,255,255,0.7);">
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;opacity:0.6;margin-bottom:4px;">Fecha</div>
          <div style="font-weight:600;color:#fff;">${fecha}</div>
        </div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;opacity:0.6;margin-bottom:4px;">Tipo</div>
          <div style="font-weight:600;color:#fff;">${esc(c.tipoProyecto)}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Cliente -->
  <section id="cliente" class="padded" style="margin-bottom:64px;">
    <div class="padded-inner" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:start;">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${p};margin-bottom:16px;">01. Comprensión del Cliente</div>
        <h2 style="font-size:34px;font-weight:800;letter-spacing:-1px;line-height:1.2;margin-bottom:20px;color:#1a1a2e;">Capturando la esencia de tu visión.</h2>
        <p style="font-size:16px;color:#525c6c;line-height:1.7;">${esc(c.entendimientoDelCliente)}</p>
      </div>
      <div style="background:#f0ebff;border-radius:28px;padding:36px;position:relative;">
        <span style="font-size:64px;color:${p};opacity:0.15;position:absolute;top:16px;left:20px;line-height:1;">"</span>
        <p style="font-size:18px;font-style:italic;font-weight:500;color:${p};line-height:1.5;position:relative;z-index:1;">"${esc(c.resumenCreativo)}"</p>
      </div>
    </div>
  </section>

  <!-- Retos -->
  <section id="estrategia" class="padded" style="margin-bottom:64px;">
    <div class="padded-inner">
      <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${p};margin-bottom:32px;text-align:center;">02. Retos Identificados</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px;margin-bottom:16px;">${retosHtml}</div>
      ${solucionCard}
    </div>
  </section>

  <!-- Enfoque creativo -->
  <section class="padded" style="margin-bottom:64px;">
    <div class="padded-inner" style="display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center;">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${p};margin-bottom:16px;">03. Enfoque Creativo</div>
        <h2 style="font-size:34px;font-weight:800;letter-spacing:-1px;line-height:1.2;margin-bottom:24px;color:#1a1a2e;">El diseño como motor de conversión.</h2>
        <div style="border-top:1px solid #f0f0f0;">${pilaresHtml}</div>
      </div>
      <div style="background:#f4f6ff;border-radius:24px;overflow:hidden;min-height:320px;display:flex;flex-direction:column;justify-content:center;padding:36px;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${p};margin-bottom:16px;">Entregables</div>
        <div style="display:flex;flex-direction:column;gap:10px;">${entregablesHtml}</div>
      </div>
    </div>
  </section>

  <!-- Cronograma -->
  <section id="cronograma" class="padded" style="margin-bottom:64px;">
    <div class="padded-inner" style="display:grid;grid-template-columns:1fr 2fr;gap:48px;">
      <div>
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${p};margin-bottom:16px;">04. Cronograma</div>
        <h2 style="font-size:34px;font-weight:800;letter-spacing:-1px;line-height:1.2;margin-bottom:16px;color:#1a1a2e;">El camino a la excelencia.</h2>
        <p style="font-size:14px;color:#525c6c;line-height:1.6;">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:32px;">${fasesHtml}</div>
    </div>
  </section>

  <!-- Inversión -->
  <section id="inversion" style="margin-bottom:64px;">
    <div style="background:#0c0c0e;overflow:hidden;display:grid;grid-template-columns:1fr 1fr;">
      <div style="padding:56px 48px;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${p};margin-bottom:16px;">05. Inversión</div>
        <h2 style="font-size:32px;font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:32px;">Un plan diseñado para escalar.</h2>
        <div style="display:flex;flex-direction:column;">${invHtml}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;padding:20px 0;margin-top:8px;">
          <span style="font-size:18px;font-weight:800;color:#fff;">Inversión Total Estimada</span>
          <span style="font-size:32px;font-weight:900;color:${p};">${esc(c.inversion?.total || "")}</span>
        </div>
        <p style="font-size:12px;color:rgba(255,255,255,0.3);font-style:italic;margin-top:12px;">* ${esc(c.inversion?.terminos || "Precios sujetos a ajustes según alcance final.")}</p>
      </div>
      <div style="background:linear-gradient(135deg,${p}cc,${s}cc);min-height:400px;position:relative;display:flex;flex-direction:column;justify-content:flex-end;padding:36px;">
        <div style="background:rgba(255,255,255,0.1);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:24px;">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
            <span style="color:#fff;font-size:20px;">★</span>
            <span style="font-weight:700;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:2px;">Retorno Esperado</span>
          </div>
          <p style="color:rgba(255,255,255,0.8);font-size:14px;line-height:1.5;">${(c.resultadosEsperados || []).slice(0, 2).map(esc).join(". ")}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Próximos pasos -->
  <section class="padded" style="margin-bottom:64px;">
    <div class="padded-inner">
      <div style="text-align:center;margin-bottom:48px;">
        <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:3px;color:${p};margin-bottom:12px;">Próximos Pasos</div>
        <h2 style="font-size:34px;font-weight:800;letter-spacing:-1px;color:#1a1a2e;">¿Cómo empezamos?</h2>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:24px;">${pasosHtml}</div>
    </div>
  </section>

  <!-- Por qué nosotros -->
  <section class="padded" style="margin-bottom:64px;padding-top:48px;border-top:1px solid #e8edf8;">
    <div class="padded-inner">
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:40px;">${porQueHtml}</div>
    </div>
  </section>

  ${termsHtml}

  <!-- Footer -->
  <footer style="margin-top:48px;padding:48px 56px;border-top:1px solid #e8edf8;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:16px;">
    <div>
      <div style="font-size:18px;font-weight:800;background:linear-gradient(135deg,${p},${s});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${esc(brand.agencyName)}</div>
      <div style="font-size:12px;color:#a3aec0;margin-top:2px;">© ${new Date().getFullYear()} Todos los derechos reservados.</div>
    </div>
    <div>
      ${senderHtml}
    </div>
    <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${p};">${fecha}</div>
  </footer>
</main>
</body>
</html>`;
}
