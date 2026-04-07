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

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" style="max-height:36px;max-width:130px;object-fit:contain;margin-bottom:6px;" alt="logo" />`
    : "";

  const retosHtml = (c.retosDetectados || []).slice(0, 3).map(r => `
    <div style="background:#f4f6ff;padding:28px;border-radius:24px;transition:all .2s;cursor:default;">
      <div style="width:48px;height:48px;background:#fff;border-radius:14px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <span style="font-size:22px;">⚡</span>
      </div>
      <h3 style="font-size:17px;font-weight:700;color:#252f3d;margin-bottom:10px;">${esc(r.titulo)}</h3>
      <p style="font-size:13px;color:#525c6c;line-height:1.6;">${esc(r.descripcion)}</p>
    </div>`).join("");

  const pilaresHtml = (c.enfoqueCreativo?.pilares || []).map(p_ => `
    <span style="display:inline-block;padding:10px 20px;border-radius:100px;font-weight:700;font-size:13px;background:#ede9fe;color:${p};">${esc(p_)}</span>`).join("");

  const entregablesHtml = (c.entregables || []).slice(0, 6).map((e, i) => `
    <div style="background:${i === 0 ? `linear-gradient(135deg,#1a1a2e,#2d2b55)` : i % 3 === 0 ? p : "#fff"};padding:28px;border-radius:20px;${i === 0 ? "color:#fff;" : ""}"
      style="display:flex;flex-direction:column;justify-content:space-between;min-height:140px;">
      <div style="font-size:28px;margin-bottom:12px;">${["🚀","✨","📋","🔗","📊","🎯"][i] || "✦"}</div>
      <h3 style="font-size:15px;font-weight:700;${i === 0 || i % 3 === 0 ? "color:#fff;" : "color:#252f3d;"}">${esc(e)}</h3>
    </div>`).join("");

  const fasesHtml = (c.fases || []).map((f, i) => `
    <div style="position:relative;display:flex;flex-direction:${i % 2 === 0 ? "row" : "row-reverse"};align-items:center;gap:32px;margin-bottom:48px;">
      <div style="flex:1;text-align:${i % 2 === 0 ? "right" : "left"};">
        <h3 style="font-size:22px;font-weight:700;color:#252f3d;">${esc(f.titulo)}</h3>
        <p style="color:#525c6c;margin-top:8px;font-size:14px;">${esc(f.descripcion)}</p>
      </div>
      <div style="width:48px;height:48px;background:${i % 2 === 0 ? p : s};border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex-shrink:0;z-index:1;box-shadow:0 4px 16px rgba(110,58,201,0.3);">${f.numero}</div>
      <div style="flex:1;">
        <div style="background:#fff;border-radius:20px;padding:20px;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
          <div style="font-size:12px;font-weight:700;color:#a3aec0;font-style:italic;margin-bottom:4px;">${esc(f.duracion)}</div>
          <p style="font-size:13px;color:#525c6c;">${esc(f.descripcion)}</p>
        </div>
      </div>
    </div>`).join("");

  const incluyeHtml = (c.inversion?.incluye || []).map(item => `
    <li style="display:flex;align-items:center;gap:12px;font-size:14px;font-weight:500;color:#252f3d;">
      <span style="color:${p};font-size:18px;">✓</span> ${esc(item)}
    </li>`).join("");

  const porQueHtml = (c.porQueNosotros || []).map(q => `
    <div style="background:#fff;border-radius:20px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <div style="font-size:26px;margin-bottom:12px;">✦</div>
      <h4 style="font-size:15px;font-weight:700;color:#252f3d;margin-bottom:8px;">${esc(q.titulo)}</h4>
      <p style="font-size:13px;color:#525c6c;line-height:1.5;">${esc(q.descripcion)}</p>
    </div>`).join("");

  const pasosHtml = (c.proximosPasos || []).map((p_, i) => `
    <div style="display:flex;align-items:center;gap:16px;padding:16px 24px;background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
      <span style="width:28px;height:28px;border-radius:50%;background:${i === 0 ? p : "#f4f6ff"};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;color:${i === 0 ? "#fff" : "#525c6c"};flex-shrink:0;">${i + 1}</span>
      <span style="font-size:14px;font-weight:500;color:#252f3d;">${esc(p_)}</span>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section style="margin-bottom:40px;background:#f4f6ff;border-radius:24px;padding:40px;">
      <h2 style="font-size:22px;font-weight:800;color:#252f3d;margin-bottom:16px;">Términos y Condiciones</h2>
      <div style="font-size:13px;line-height:1.7;color:#525c6c;white-space:pre-wrap;">${esc(brand.termsConditions)}</div>
    </section>` : "";

  const senderHtml = brand.senderName
    ? `<p style="font-size:13px;color:#a3aec0;margin-top:8px;">Presentado por: <strong style="color:#6d7788;">${esc(brand.senderName)}</strong></p>` : "";

  const acceptBtn = proposalId
    ? `<a href="/api/proposals/accept?id=${proposalId}" style="display:inline-block;padding:18px 40px;background:linear-gradient(90deg,${p},${s});color:#fff;font-weight:700;border-radius:20px;text-decoration:none;font-size:15px;box-shadow:0 8px 24px rgba(110,58,201,0.3);">Aceptar y Firmar</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="es" style="scroll-behavior:smooth;">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Propuesta — ${esc(clientName)}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<style>
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;background:#f4f6ff;color:#252f3d;min-height:100vh;}
  aside{position:fixed;left:0;top:0;height:100vh;width:256px;background:#fff;box-shadow:0 20px 40px -12px rgba(110,58,201,0.08);display:flex;flex-direction:column;gap:24px;padding:24px;z-index:50;}
  main{margin-left:256px;min-height:100vh;padding:32px 40px 80px;}
  nav a{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:12px;font-size:14px;font-weight:500;color:#525c6c;text-decoration:none;transition:all .2s;}
  nav a:hover{background:#ede9fe;color:${p};}
  section{margin-bottom:48px;}
  @media(max-width:768px){aside{display:none;}main{margin-left:0;padding:24px 16px 60px;}}
</style>
</head>
<body>

<aside>
  <div>
    ${logoHtml}
    <div style="font-size:20px;font-weight:800;background:linear-gradient(135deg,${p},${s});-webkit-background-clip:text;-webkit-text-fill-color:transparent;">${esc(brand.agencyName)}</div>
    <div style="font-size:11px;color:#a3aec0;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;margin-top:2px;">Propuesta Creativa</div>
  </div>
  <nav style="display:flex;flex-direction:column;gap:4px;">
    <a href="#intro">Introducción</a>
    <a href="#retos">Retos</a>
    <a href="#enfoque">Enfoque</a>
    <a href="#cronograma">Cronograma</a>
    <a href="#inversion">Inversión</a>
  </nav>
  <div style="margin-top:auto;">${acceptBtn}</div>
</aside>

<main>
  <!-- Hero Gradient -->
  <section id="intro" style="position:relative;overflow:hidden;border-radius:28px;background:linear-gradient(135deg,${p},${s});min-height:500px;display:flex;flex-direction:column;justify-content:center;padding:56px 64px;margin-bottom:32px;">
    <div style="position:absolute;top:0;right:-10%;width:50%;height:100%;opacity:0.15;">
      <div style="width:100%;height:100%;background:radial-gradient(circle,#fff,transparent);"></div>
    </div>
    <div style="position:relative;z-index:1;max-width:600px;">
      <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.15);backdrop-filter:blur(8px);padding:6px 16px;border-radius:100px;margin-bottom:24px;">
        <span style="width:8px;height:8px;border-radius:50%;background:rgba(255,200,200,0.8);animation:pulse 2s infinite;"></span>
        <span style="font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#fff;">${esc(c.tipoProyecto)}</span>
      </div>
      <h1 style="font-size:52px;font-weight:900;letter-spacing:-2px;line-height:1.05;color:#fff;margin-bottom:28px;">${esc(c.resumenCreativo)}</h1>
      <div style="display:flex;gap:32px;color:rgba(255,255,255,0.8);">
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;opacity:0.6;margin-bottom:4px;">Para</div>
          <div style="font-weight:600;font-size:16px;color:#fff;">${clientLabel}</div>
        </div>
        <div style="width:1px;background:rgba(255,255,255,0.2);"></div>
        <div>
          <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:2px;opacity:0.6;margin-bottom:4px;">Fecha</div>
          <div style="font-weight:600;font-size:16px;color:#fff;">${fecha}</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Visión -->
  <section id="estrategia" style="display:grid;grid-template-columns:7fr 5fr;gap:24px;margin-bottom:32px;align-items:center;">
    <div style="background:#fff;border-radius:24px;padding:40px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:${p};margin-bottom:20px;">La Visión</div>
      <blockquote style="font-size:22px;font-weight:700;color:#252f3d;line-height:1.4;">"${esc(c.entendimientoDelCliente)}"</blockquote>
    </div>
    <div style="background:#f4f6ff;border-radius:24px;padding:32px;display:flex;flex-direction:column;gap:12px;">
      <div style="font-size:36px;font-weight:900;color:${p};">${esc(c.inversion?.total || "")}</div>
      <div style="font-size:13px;color:#525c6c;">${esc(c.inversion?.terminos || "")}</div>
    </div>
  </section>

  <!-- Retos -->
  <section id="retos" style="margin-bottom:32px;">
    <h2 style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#a3aec0;text-align:center;margin-bottom:32px;">Retos Identificados</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px;">${retosHtml}</div>
  </section>

  <!-- Enfoque creativo -->
  <section id="enfoque" style="background:#fff;border-radius:24px;padding:40px;margin-bottom:32px;box-shadow:0 2px 12px rgba(0,0,0,0.04);">
    <h2 style="font-size:26px;font-weight:800;color:#252f3d;margin-bottom:20px;">Nuestro Enfoque</h2>
    <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:32px;">${pilaresHtml}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;">
      <div>
        <h4 style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="display:inline-block;width:24px;height:2px;background:${p};"></span> Fase Uno: Inmersión
        </h4>
        <p style="font-size:14px;color:#525c6c;line-height:1.6;">${esc(c.entendimientoDelCliente)}</p>
      </div>
      <div>
        <h4 style="font-size:16px;font-weight:700;display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="display:inline-block;width:24px;height:2px;background:${s};"></span> Fase Dos: Ejecución
        </h4>
        <p style="font-size:14px;color:#525c6c;line-height:1.6;">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
      </div>
    </div>
  </section>

  <!-- Entregables -->
  <section style="margin-bottom:32px;">
    <h2 style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#a3aec0;margin-bottom:20px;">Entregables del Proyecto</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;">${entregablesHtml}</div>
  </section>

  <!-- Cronograma -->
  <section id="cronograma" style="margin-bottom:32px;">
    <h2 style="font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:3px;color:#a3aec0;text-align:center;margin-bottom:40px;">Cronograma de Implementación</h2>
    <div style="position:relative;">
      <div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:#e8edf8;transform:translateX(-50%);"></div>
      ${fasesHtml}
    </div>
  </section>

  <!-- Inversión -->
  <section id="inversion" style="margin-bottom:32px;">
    <div style="background:#f4f6ff;border-radius:28px;padding:48px 56px;position:relative;overflow:hidden;">
      <div style="position:absolute;top:0;left:0;width:100%;height:4px;background:linear-gradient(90deg,${p},${s},${p});"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">
        <div>
          <h2 style="font-size:32px;font-weight:900;letter-spacing:-1px;margin-bottom:20px;">Inversión Financiera</h2>
          <p style="color:#525c6c;line-height:1.7;margin-bottom:24px;">${esc(c.enfoqueCreativo?.descripcion || "Inversión estratégica en tu futuro digital.")}</p>
          <ul style="display:flex;flex-direction:column;gap:12px;list-style:none;">${incluyeHtml}</ul>
        </div>
        <div style="background:#fff;border-radius:24px;padding:36px;box-shadow:0 4px 24px rgba(110,58,201,0.08);display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2px;color:#a3aec0;margin-bottom:8px;">Paquete Total</div>
            <div style="font-size:52px;font-weight:900;letter-spacing:-2px;color:#252f3d;">${esc(c.inversion?.total || "")}</div>
            <div style="margin-top:24px;padding-top:20px;border-top:1px solid #f4f6ff;">
              <div style="font-size:13px;color:#525c6c;">${esc(c.inversion?.terminos || "")}</div>
            </div>
          </div>
          <a href="#" style="display:block;text-align:center;margin-top:24px;padding:16px;background:${p};color:#fff;font-weight:700;border-radius:16px;text-decoration:none;font-size:14px;">Confirmar Inversión</a>
        </div>
      </div>
    </div>
  </section>

  <!-- Por qué nosotros -->
  <section style="margin-bottom:32px;">
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px;">${porQueHtml}</div>
  </section>

  <!-- Próximos pasos & CTA -->
  <section style="text-align:center;padding:64px 40px;background:#f4f6ff;border-radius:24px;margin-bottom:32px;">
    <h2 style="font-size:32px;font-weight:900;letter-spacing:-1px;margin-bottom:16px;">¿Listos para empezar?</h2>
    <p style="color:#525c6c;font-size:16px;max-width:480px;margin:0 auto 40px;">Esta propuesta es válida por 15 días. Acepta para comenzar el proceso de onboarding.</p>
    <div style="display:flex;flex-direction:column;gap:10px;max-width:480px;margin:0 auto 40px;">${pasosHtml}</div>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap;">
      ${acceptBtn}
      <a href="#intro" style="display:inline-block;padding:18px 40px;background:#fff;color:#252f3d;font-weight:700;border-radius:20px;text-decoration:none;font-size:15px;border:2px solid #e8edf8;">Agendar Llamada</a>
    </div>
  </section>

  ${termsHtml}

  <!-- Footer -->
  <footer style="display:flex;justify-content:space-between;align-items:center;padding-top:32px;border-top:1px solid #e8edf8;flex-wrap:wrap;gap:12px;">
    <div>
      <div style="font-size:13px;font-weight:800;color:#a3aec0;text-transform:uppercase;letter-spacing:1.5px;">© ${new Date().getFullYear()} ${esc(brand.agencyName)} · Propuesta Confidencial</div>
      ${senderHtml}
    </div>
  </footer>
</main>
</body>
</html>`;
}
