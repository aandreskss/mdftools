import type { ProposalContent } from "./proposal-template";

// Reuses ProposalContent — same JSON schema, different renderer

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function slide(content: string, bg = "#0A0F1E", notes = ""): string {
  return `
  <section data-background-color="${bg}">
    ${content}
    ${notes ? `<aside class="notes">${esc(notes)}</aside>` : ""}
  </section>`;
}

function bulletFragments(items: string[]): string {
  return items.map(i => `<li class="fragment fade-in">${esc(i)}</li>`).join("\n        ");
}

function checkFragments(items: string[]): string {
  return items.map(i => `
      <div class="fragment fade-in check-row">
        <span class="check">✓</span>
        <span>${esc(i)}</span>
      </div>`).join("");
}

function stepFragments(items: { numero: number; titulo: string; descripcion: string }[]): string {
  return items.map(s => `
      <div class="fragment fade-in step-row">
        <div class="step-num">${s.numero}</div>
        <div>
          <div class="step-title">${esc(s.titulo)}</div>
          <div class="step-desc">${esc(s.descripcion)}</div>
        </div>
      </div>`).join("");
}

function cardFragments(items: { titulo: string; descripcion: string }[]): string {
  return items.map(c => `
      <div class="fragment fade-in diff-card">
        <div class="diff-title">${esc(c.titulo)}</div>
        <div class="diff-desc">${esc(c.descripcion)}</div>
      </div>`).join("");
}

function problemFragments(items: { titulo: string; descripcion: string }[]): string {
  return items.map(p => `
      <div class="fragment fade-in pain-row">
        <span class="pain-icon">⚠</span>
        <div>
          <div class="pain-title">${esc(p.titulo)}</div>
          <div class="pain-desc">${esc(p.descripcion)}</div>
        </div>
      </div>`).join("");
}

export function renderSlidesHtml(
  content: ProposalContent,
  agencyName: string,
  clientName: string,
  clientCompany?: string,
): string {
  const clientLabel = clientCompany ? `${esc(clientName)} · ${esc(clientCompany)}` : esc(clientName);
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long" });

  const slides = [

    // 1. PORTADA
    slide(`
      <div class="cover-wrap">
        <div class="cover-agency">${esc(agencyName)}</div>
        <h1 class="cover-title">${esc(content.tipoServicio)}</h1>
        <div class="cover-client">Propuesta para <strong>${clientLabel}</strong></div>
        <div class="cover-fecha">${fecha}</div>
      </div>`, "#0A0F1E"),

    // 2. EL PROBLEMA
    slide(`
      <h2 class="slide-title">El Problema</h2>
      <div class="pain-list">
        ${problemFragments(content.problemasDetectados)}
      </div>`, "#0D1117", "Detalla cada problema con impacto en el negocio"),

    // 3. NUESTRA SOLUCIÓN
    slide(`
      <h2 class="slide-title">Nuestra Solución</h2>
      <p class="slide-body fragment fade-in">${esc(content.solucion.descripcion)}</p>
      <ul class="kp-list">
        ${bulletFragments(content.solucion.puntosClave)}
      </ul>`, "#0A0F1E"),

    // 4. ENTREGABLES
    slide(`
      <h2 class="slide-title">Entregables</h2>
      <div class="check-list">
        ${checkFragments(content.entregables)}
      </div>`, "#0D1117"),

    // 5. PROCESO
    slide(`
      <h2 class="slide-title">Cómo Trabajamos</h2>
      <div class="steps-list">
        ${stepFragments(content.proceso)}
      </div>`, "#0A0F1E"),

    // 6. RESULTADOS ESPERADOS
    slide(`
      <h2 class="slide-title">Resultados Esperados</h2>
      <ul class="results-list">
        ${bulletFragments(content.resultadosEsperados)}
      </ul>`, "#0D1117"),

    // 7. INVERSIÓN
    slide(`
      <div class="inv-wrap">
        <div class="inv-label">Inversión Total</div>
        <div class="inv-amount">${esc(content.inversion.total)}</div>
        <div class="inv-terms fragment fade-in">${esc(content.inversion.terminos)}</div>
        <div class="inv-includes fragment fade-in">
          ${content.inversion.incluye.map(i => `<div class="inv-tag">✓ ${esc(i)}</div>`).join("")}
        </div>
      </div>`, "#0D1117", "Presentar el precio con confianza"),

    // 8. POR QUÉ NOSOTROS
    slide(`
      <h2 class="slide-title">¿Por qué ${esc(agencyName)}?</h2>
      <div class="diff-grid">
        ${cardFragments(content.porQueNosotros)}
      </div>`, "#0A0F1E"),

    // 9. PRÓXIMOS PASOS
    slide(`
      <h2 class="slide-title">Próximos Pasos</h2>
      <ul class="next-list">
        ${bulletFragments(content.proximosPasos)}
      </ul>
      <div class="fragment fade-in cta-box">
        ¿Arrancamos? <strong>${esc(agencyName)}</strong> está listo para comenzar.
      </div>`, "#0D1117", "Cierra la reunión con una acción concreta"),

  ].join("\n");

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(agencyName)} · Propuesta ${esc(clientName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.6.0/dist/reveal.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@4.6.0/dist/theme/black.css">
<style>
  :root {
    --indigo: #6366F1;
    --emerald: #10B981;
    --slate: #94A3B8;
    --bg: #0A0F1E;
  }
  .reveal { font-family: 'Inter', sans-serif !important; }
  .reveal .slides section {
    padding: 40px 60px;
    text-align: left;
  }
  /* Portada */
  .cover-wrap { text-align: center; }
  .cover-agency {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--indigo);
    margin-bottom: 20px;
  }
  .cover-title {
    font-size: 2.4rem !important;
    font-weight: 800 !important;
    color: #F1F5F9 !important;
    line-height: 1.15 !important;
    margin-bottom: 20px !important;
  }
  .cover-client {
    font-size: 1rem;
    color: var(--slate);
    margin-bottom: 32px;
  }
  .cover-client strong { color: #F1F5F9; }
  .cover-fecha {
    display: inline-block;
    padding: 4px 16px;
    border-radius: 100px;
    border: 1px solid rgba(99,102,241,0.4);
    font-size: 0.7rem;
    color: var(--indigo);
  }
  /* Slide titles */
  .slide-title {
    font-size: 1.5rem !important;
    font-weight: 700 !important;
    color: #F1F5F9 !important;
    margin-bottom: 28px !important;
    padding-bottom: 12px !important;
    border-bottom: 2px solid var(--indigo) !important;
  }
  .slide-body {
    font-size: 0.85rem !important;
    color: var(--slate) !important;
    margin-bottom: 20px !important;
    line-height: 1.65 !important;
  }
  /* Pain points */
  .pain-list { display: flex; flex-direction: column; gap: 14px; }
  .pain-row {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    background: rgba(239,68,68,0.07);
    border: 1px solid rgba(239,68,68,0.2);
    border-radius: 10px;
    padding: 14px 18px;
  }
  .pain-icon { font-size: 1.1rem; flex-shrink: 0; margin-top: 2px; }
  .pain-title { font-size: 0.85rem; font-weight: 600; color: #FCA5A5; margin-bottom: 3px; }
  .pain-desc { font-size: 0.72rem; color: #94A3B8; line-height: 1.5; }
  /* Key points */
  .kp-list { list-style: none; display: flex; flex-direction: column; gap: 10px; margin-top: 16px; }
  .kp-list li {
    font-size: 0.82rem;
    color: #CBD5E1;
    padding-left: 20px;
    position: relative;
  }
  .kp-list li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--indigo);
    font-weight: 700;
  }
  /* Check list */
  .check-list { display: flex; flex-direction: column; gap: 12px; }
  .check-row { display: flex; gap: 14px; align-items: center; font-size: 0.85rem; color: #CBD5E1; }
  .check {
    color: var(--emerald);
    font-weight: 700;
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  /* Steps */
  .steps-list { display: flex; flex-direction: column; gap: 12px; }
  .step-row { display: flex; gap: 16px; align-items: flex-start; }
  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(99,102,241,0.15);
    border: 1px solid var(--indigo);
    color: var(--indigo);
    font-weight: 700;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .step-title { font-size: 0.85rem; font-weight: 600; color: #F1F5F9; margin-bottom: 2px; }
  .step-desc { font-size: 0.72rem; color: var(--slate); }
  /* Results */
  .results-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
  .results-list li {
    font-size: 0.85rem;
    color: #CBD5E1;
    padding-left: 20px;
    position: relative;
  }
  .results-list li::before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--emerald);
  }
  /* Inversión */
  .inv-wrap { text-align: center; }
  .inv-label {
    font-size: 0.65rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.15em;
    color: var(--slate);
    margin-bottom: 12px;
  }
  .inv-amount {
    font-size: 4rem;
    font-weight: 800;
    color: #A5B4FC;
    line-height: 1;
    margin-bottom: 12px;
  }
  .inv-terms { font-size: 0.85rem; color: var(--slate); margin-bottom: 24px; }
  .inv-includes { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
  .inv-tag {
    padding: 5px 14px;
    border-radius: 100px;
    border: 1px solid rgba(99,102,241,0.35);
    font-size: 0.72rem;
    color: #A5B4FC;
  }
  /* Diferenciadores */
  .diff-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .diff-card {
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.2);
    border-radius: 10px;
    padding: 16px 18px;
  }
  .diff-title { font-size: 0.8rem; font-weight: 600; color: #A5B4FC; margin-bottom: 4px; }
  .diff-desc { font-size: 0.7rem; color: var(--slate); line-height: 1.5; }
  /* Próximos pasos */
  .next-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-bottom: 24px; }
  .next-list li {
    font-size: 0.85rem;
    color: #CBD5E1;
    padding-left: 22px;
    position: relative;
  }
  .next-list li::before {
    content: "→";
    position: absolute;
    left: 0;
    color: var(--emerald);
    font-weight: 700;
  }
  .cta-box {
    background: rgba(16,185,129,0.10);
    border: 1px solid rgba(16,185,129,0.25);
    border-radius: 10px;
    padding: 16px 20px;
    font-size: 0.85rem;
    color: #6EE7B7;
    text-align: center;
  }
  .cta-box strong { color: #34D399; }
</style>
</head>
<body>
<div class="reveal">
  <div class="slides">
    ${slides}
  </div>
</div>
<script src="https://cdn.jsdelivr.net/npm/reveal.js@4.6.0/dist/reveal.js"></script>
<script>
  Reveal.initialize({
    hash: true,
    transition: "fade",
    transitionSpeed: "fast",
    progress: true,
    controls: true,
    slideNumber: true,
    center: true,
  });
</script>
</body>
</html>`;
}
