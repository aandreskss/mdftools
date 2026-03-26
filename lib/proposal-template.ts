// ─── Data schema that Claude returns (JSON only, cheap) ──────────────────────

export interface ProposalContent {
  tipoServicio: string;
  resumenEjecutivo: string;
  problemasDetectados: { titulo: string; descripcion: string }[];
  solucion: { descripcion: string; puntosClave: string[] };
  entregables: string[];
  proceso: { numero: number; titulo: string; descripcion: string }[];
  resultadosEsperados: string[];
  inversion: { total: string; incluye: string[]; terminos: string };
  porQueNosotros: { titulo: string; descripcion: string }[];
  proximosPasos: string[];
}

// ─── Helper renderers ────────────────────────────────────────────────────────

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function badge(text: string): string {
  return `<span class="badge">${esc(text)}</span>`;
}

function checkList(items: string[]): string {
  return items.map(i => `
    <div class="check-item">
      <span class="check-icon">✓</span>
      <span>${esc(i)}</span>
    </div>`).join("");
}

function steps(items: { numero: number; titulo: string; descripcion: string }[]): string {
  return items.map(s => `
    <div class="step">
      <div class="step-num">${s.numero}</div>
      <div class="step-content">
        <div class="step-title">${esc(s.titulo)}</div>
        <div class="step-desc">${esc(s.descripcion)}</div>
      </div>
    </div>`).join("");
}

function cards(items: { titulo: string; descripcion: string }[]): string {
  return items.map(c => `
    <div class="card">
      <div class="card-title">${esc(c.titulo)}</div>
      <div class="card-desc">${esc(c.descripcion)}</div>
    </div>`).join("");
}

function bullets(items: string[]): string {
  return items.map(i => `
    <div class="bullet">
      <span class="bullet-dot"></span>
      <span>${esc(i)}</span>
    </div>`).join("");
}

function keyPoints(items: string[]): string {
  return items.map(i => `
    <div class="key-point">
      <span class="kp-dot">→</span>
      <span>${esc(i)}</span>
    </div>`).join("");
}

function problemCards(items: { titulo: string; descripcion: string }[]): string {
  return items.map(c => `
    <div class="problem-card">
      <div class="problem-icon">⚠</div>
      <div>
        <div class="problem-title">${esc(c.titulo)}</div>
        <div class="problem-desc">${esc(c.descripcion)}</div>
      </div>
    </div>`).join("");
}

// ─── Main renderer ────────────────────────────────────────────────────────────

export function renderProposalHtml(
  content: ProposalContent,
  agencyName: string,
  clientName: string,
  clientCompany?: string,
): string {
  const clientLabel = clientCompany ? `${esc(clientName)} · ${esc(clientCompany)}` : esc(clientName);
  const fecha = new Date().toLocaleDateString("es-ES", { year: "numeric", month: "long", day: "numeric" });

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Propuesta — ${esc(clientName)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    background: #F8FAFC;
    color: #111827;
    line-height: 1.65;
    font-size: 15px;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Header ── */
  .header {
    background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);
    padding: 48px 56px 40px;
    color: white;
  }
  .header-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
  }
  .agency-name {
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    opacity: 0.85;
  }
  .proposal-for {
    font-size: 13px;
    font-weight: 500;
    opacity: 0.75;
    text-align: right;
  }
  .header-title {
    font-size: 38px;
    font-weight: 800;
    line-height: 1.15;
    margin-bottom: 10px;
  }
  .header-subtitle {
    font-size: 16px;
    font-weight: 400;
    opacity: 0.80;
    margin-bottom: 24px;
  }
  .header-meta {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 100px;
    font-size: 12px;
    font-weight: 600;
    background: rgba(255,255,255,0.18);
    color: white;
  }

  /* ── Layout ── */
  .body {
    max-width: 860px;
    margin: 0 auto;
    padding: 48px 40px 80px;
  }

  /* ── Section ── */
  .section { margin-bottom: 40px; }
  .section-label {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: #4F46E5;
    margin-bottom: 8px;
  }
  .section-title {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 2px solid #E5E7EB;
  }
  .section-text {
    color: #374151;
    font-size: 15px;
    line-height: 1.7;
  }

  /* ── Box ── */
  .box {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 24px 28px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  }

  /* ── Problem cards ── */
  .problem-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 16px;
    margin-top: 16px;
  }
  .problem-card {
    background: #FFF7ED;
    border: 1px solid #FED7AA;
    border-radius: 10px;
    padding: 18px 20px;
    display: flex;
    gap: 14px;
    align-items: flex-start;
  }
  .problem-icon {
    font-size: 18px;
    flex-shrink: 0;
    margin-top: 2px;
  }
  .problem-title {
    font-weight: 600;
    font-size: 14px;
    color: #92400E;
    margin-bottom: 4px;
  }
  .problem-desc {
    font-size: 13px;
    color: #78350F;
    line-height: 1.55;
  }

  /* ── Key points (solución) ── */
  .key-points { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
  .key-point {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 14px;
    color: #374151;
  }
  .kp-dot {
    color: #4F46E5;
    font-weight: 700;
    flex-shrink: 0;
    margin-top: 1px;
  }

  /* ── Check list (entregables) ── */
  .check-list { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
  .check-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    font-size: 14px;
    color: #374151;
  }
  .check-icon {
    color: #10B981;
    font-weight: 700;
    font-size: 16px;
    flex-shrink: 0;
    margin-top: 0px;
  }

  /* ── Process steps ── */
  .steps { display: flex; flex-direction: column; gap: 0; margin-top: 8px; }
  .step {
    display: flex;
    gap: 20px;
    align-items: flex-start;
    padding: 16px 0;
    border-bottom: 1px solid #F3F4F6;
  }
  .step:last-child { border-bottom: none; }
  .step-num {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #EEF2FF;
    color: #4F46E5;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .step-title {
    font-weight: 600;
    font-size: 14px;
    color: #111827;
    margin-bottom: 4px;
  }
  .step-desc { font-size: 13px; color: #6B7280; line-height: 1.55; }

  /* ── Bullets (resultados, próximos pasos) ── */
  .bullets { display: flex; flex-direction: column; gap: 10px; margin-top: 4px; }
  .bullet {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    font-size: 14px;
    color: #374151;
  }
  .bullet-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #4F46E5;
    flex-shrink: 0;
    margin-top: 7px;
  }

  /* ── Investment block ── */
  .investment-block {
    background: linear-gradient(135deg, #1E1B4B 0%, #312E81 100%);
    border-radius: 16px;
    padding: 40px 48px;
    color: white;
    text-align: center;
    margin-bottom: 28px;
  }
  .investment-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.65;
    margin-bottom: 12px;
  }
  .investment-amount {
    font-size: 56px;
    font-weight: 800;
    color: #A5B4FC;
    line-height: 1;
    margin-bottom: 8px;
  }
  .investment-terms {
    font-size: 14px;
    opacity: 0.70;
    margin-bottom: 24px;
  }
  .investment-includes {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: center;
  }
  .inv-item {
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 500;
  }

  /* ── Cards (por qué nosotros) ── */
  .cards-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 14px;
    margin-top: 8px;
  }
  .card {
    background: white;
    border: 1px solid #E5E7EB;
    border-radius: 10px;
    padding: 18px 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }
  .card-title {
    font-weight: 600;
    font-size: 14px;
    color: #4F46E5;
    margin-bottom: 6px;
  }
  .card-desc { font-size: 13px; color: #6B7280; line-height: 1.55; }

  /* ── CTA / próximos pasos ── */
  .cta-box {
    background: #F0FDF4;
    border: 1px solid #BBF7D0;
    border-radius: 12px;
    padding: 28px 32px;
    margin-top: 8px;
  }

  /* ── Footer ── */
  .footer {
    background: #111827;
    color: #9CA3AF;
    text-align: center;
    padding: 28px 40px;
    font-size: 13px;
    line-height: 1.8;
  }
  .footer strong { color: white; }

  @media print {
    body { background: white; }
    .body { padding: 24px 24px 40px; }
    .header { padding: 32px 40px 28px; }
  }
</style>
</head>
<body>

<!-- ── HEADER ── -->
<div class="header">
  <div class="header-top">
    <div class="agency-name">${esc(agencyName)}</div>
    <div class="proposal-for">Propuesta para<br><strong>${clientLabel}</strong></div>
  </div>
  <div class="header-title">Propuesta Comercial</div>
  <div class="header-subtitle">${esc(content.tipoServicio)}</div>
  <div class="header-meta">
    ${badge(fecha)}
    ${badge("Propuesta Personalizada")}
  </div>
</div>

<!-- ── BODY ── -->
<div class="body">

  <!-- Resumen ejecutivo -->
  <div class="section">
    <div class="section-label">Resumen</div>
    <div class="section-title">Resumen Ejecutivo</div>
    <div class="box">
      <p class="section-text">${esc(content.resumenEjecutivo)}</p>
    </div>
  </div>

  <!-- Problemas detectados -->
  <div class="section">
    <div class="section-label">Diagnóstico</div>
    <div class="section-title">Problemas Detectados</div>
    <div class="problem-grid">
      ${problemCards(content.problemasDetectados)}
    </div>
  </div>

  <!-- Nuestra solución -->
  <div class="section">
    <div class="section-label">Propuesta</div>
    <div class="section-title">Nuestra Solución</div>
    <div class="box">
      <p class="section-text">${esc(content.solucion.descripcion)}</p>
      <div class="key-points">
        ${keyPoints(content.solucion.puntosClave)}
      </div>
    </div>
  </div>

  <!-- Entregables -->
  <div class="section">
    <div class="section-label">Alcance</div>
    <div class="section-title">Entregables</div>
    <div class="box">
      <div class="check-list">
        ${checkList(content.entregables)}
      </div>
    </div>
  </div>

  <!-- Proceso -->
  <div class="section">
    <div class="section-label">Metodología</div>
    <div class="section-title">Cómo Trabajamos</div>
    <div class="box">
      <div class="steps">
        ${steps(content.proceso)}
      </div>
    </div>
  </div>

  <!-- Resultados esperados -->
  <div class="section">
    <div class="section-label">Impacto</div>
    <div class="section-title">Resultados Esperados</div>
    <div class="box">
      <div class="bullets">
        ${bullets(content.resultadosEsperados)}
      </div>
    </div>
  </div>

  <!-- Inversión -->
  <div class="section">
    <div class="section-label">Inversión</div>
    <div class="section-title">Tu Inversión</div>
    <div class="investment-block">
      <div class="investment-label">Inversión Total</div>
      <div class="investment-amount">${esc(content.inversion.total)}</div>
      <div class="investment-terms">${esc(content.inversion.terminos)}</div>
      <div class="investment-includes">
        ${content.inversion.incluye.map(i => `<div class="inv-item">✓ ${esc(i)}</div>`).join("")}
      </div>
    </div>
  </div>

  <!-- Por qué nosotros -->
  <div class="section">
    <div class="section-label">Diferenciación</div>
    <div class="section-title">¿Por Qué ${esc(agencyName)}?</div>
    <div class="cards-grid">
      ${cards(content.porQueNosotros)}
    </div>
  </div>

  <!-- Próximos pasos -->
  <div class="section">
    <div class="section-label">Acción</div>
    <div class="section-title">Próximos Pasos</div>
    <div class="cta-box">
      <div class="bullets">
        ${bullets(content.proximosPasos)}
      </div>
    </div>
  </div>

</div>

<!-- ── FOOTER ── -->
<div class="footer">
  <strong>${esc(agencyName)}</strong><br>
  Propuesta preparada exclusivamente para ${clientLabel} · ${fecha}<br>
  Válida por 30 días a partir de la fecha de emisión
</div>

</body>
</html>`;
}
