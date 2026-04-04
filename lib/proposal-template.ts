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
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function _badge(text: string): string {
  return `<span class="badge">${esc(text)}</span>`;
}

function checkList(items: string[]): string {
  return items.map(i => `
    <div class="check-item">
      <div class="check-icon-wrapper">
        <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
      </div>
      <span>${esc(i)}</span>
    </div>`).join("");
}

function steps(items: { numero: number; titulo: string; descripcion: string }[]): string {
  return items.map(s => `
    <div class="step-card">
      <div class="step-header">
        <div class="step-number">${s.numero}</div>
        <div class="step-title">${esc(s.titulo)}</div>
      </div>
      <div class="step-description">${esc(s.descripcion)}</div>
    </div>`).join("");
}

function whyUsCards(items: { titulo: string; descripcion: string }[]): string {
  return items.map(c => `
    <div class="why-card">
      <div class="why-card-title">${esc(c.titulo)}</div>
      <div class="why-card-desc">${esc(c.descripcion)}</div>
    </div>`).join("");
}

function problemCards(items: { titulo: string; descripcion: string }[]): string {
  return items.map(c => `
    <div class="problem-item">
      <div class="problem-dot"></div>
      <div class="problem-content">
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
  proposalId?: string,
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
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --primary: #6366F1;
    --primary-light: #EEF2FF;
    --primary-dark: #4F46E5;
    --accent: #F43F5E;
    --text-main: #1E293B;
    --text-muted: #64748B;
    --bg-main: #F8FAFC;
    --bg-card: #FFFFFF;
    --border: #E2E8F0;
    --radius-lg: 20px;
    --radius-md: 12px;
    --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    font-family: 'Inter', sans-serif;
    background: var(--bg-main);
    color: var(--text-main);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }

  h1, h2, h3, h4 {
    font-family: 'Plus Jakarta Sans', sans-serif;
    color: #0F172A;
    line-height: 1.2;
  }

  /* ── Layout ── */
  .main-container {
    display: grid;
    grid-template-columns: 280px 1fr;
    max-width: 1240px;
    margin: 40px auto;
    gap: 40px;
    padding: 0 20px;
  }

  @media (max-width: 1024px) {
    .main-container { grid-template-columns: 1fr; margin: 0; padding: 0; gap: 0; }
    .sidebar { display: none; }
  }

  /* ── Sidebar Navigation ── */
  .sidebar {
    position: sticky;
    top: 40px;
    height: fit-content;
    padding: 32px;
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }

  .nav-logo {
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-weight: 800;
    font-size: 18px;
    color: var(--primary);
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .nav-menu { list-style: none; }
  .nav-item { margin-bottom: 8px; }
  .nav-link {
    display: block;
    padding: 10px 14px;
    border-radius: var(--radius-md);
    text-decoration: none;
    color: var(--text-muted);
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }
  .nav-link:hover {
    background: var(--primary-light);
    color: var(--primary);
  }

  /* ── Content Area ── */
  .content-area {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    overflow: hidden;
  }

  /* ── Hero Header ── */
  .hero {
    background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);
    padding: 80px 60px;
    color: white;
    position: relative;
    overflow: hidden;
  }

  .hero::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: var(--primary);
    filter: blur(120px);
    opacity: 0.15;
    border-radius: 50%;
  }

  .hero-agency {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    color: var(--primary);
    margin-bottom: 16px;
  }

  .hero-title {
    font-size: 48px;
    font-weight: 800;
    color: white;
    margin-bottom: 24px;
    max-width: 600px;
  }

  .hero-meta {
    display: flex;
    gap: 20px;
    align-items: center;
    margin-top: 40px;
    padding-top: 32px;
    border-top: 1px solid rgba(255,255,255,0.1);
  }

  .meta-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .meta-label { font-size: 11px; text-transform: uppercase; opacity: 0.5; font-weight: 600; }
  .meta-value { font-size: 14px; font-weight: 600; color: white; }

  /* ── Sections ── */
  .section {
    padding: 60px;
    border-bottom: 1px solid var(--border);
  }
  .section:last-child { border-bottom: none; }

  .section-tag {
    display: inline-block;
    padding: 4px 12px;
    background: var(--primary-light);
    color: var(--primary);
    border-radius: 100px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .section-header { margin-bottom: 32px; }
  .section-title { font-size: 28px; font-weight: 800; margin-bottom: 12px; }
  .section-desc { font-size: 16px; color: var(--text-muted); max-width: 700px; }

  /* ── Component: Problem List ── */
  .problem-list { display: grid; gap: 24px; }
  .problem-item {
    display: flex;
    gap: 20px;
    padding: 24px;
    background: #FFF7F7;
    border: 1px solid #FEE2E2;
    border-radius: var(--radius-md);
  }
  .problem-dot {
    width: 8px;
    height: 8px;
    background: var(--accent);
    border-radius: 50%;
    margin-top: 8px;
    flex-shrink: 0;
  }
  .problem-title { font-weight: 700; font-size: 16px; color: #991B1B; margin-bottom: 4px; }
  .problem-desc { font-size: 14px; color: #B91C1C; opacity: 0.8; }

  /* ── Component: Check List ── */
  .check-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .check-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    background: var(--bg-main);
    border-radius: var(--radius-md);
    font-size: 14px;
    font-weight: 500;
  }
  .check-icon-wrapper {
    width: 20px;
    height: 20px;
    background: #D1FAE5;
    color: #059669;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .check-icon { width: 12px; height: 12px; }

  /* ── Component: Process Steps ── */
  .steps-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 24px;
  }
  .step-card {
    padding: 24px;
    background: white;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
    transition: transform 0.2s;
  }
  .step-card:hover { transform: translateY(-4px); border-color: var(--primary); }
  .step-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
  .step-number {
    width: 32px;
    height: 32px;
    background: var(--primary);
    color: white;
    border-radius: 8px;
    font-weight: 800;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .step-title { font-weight: 700; font-size: 15px; }
  .step-description { font-size: 13px; color: var(--text-muted); line-height: 1.5; }

  /* ── Component: Investment ── */
  .investment-card {
    background: #0F172A;
    border-radius: var(--radius-lg);
    padding: 60px;
    color: white;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .investment-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(45deg, transparent 0%, rgba(99,102,241,0.05) 100%);
  }
  .inv-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--primary); margin-bottom: 16px; }
  .inv-amount { font-size: 64px; font-weight: 800; margin-bottom: 16px; letter-spacing: -0.02em; }
  .inv-terms { font-size: 15px; opacity: 0.6; margin-bottom: 40px; max-width: 400px; margin-left: auto; margin-right: auto; }
  .inv-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 12px;
  }
  .inv-badge {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    padding: 8px 16px;
    border-radius: 100px;
    font-size: 13px;
    font-weight: 500;
  }

  /* ── Component: Why Us ── */
  .why-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .why-card {
    padding: 28px;
    border: 1px solid var(--border);
    border-radius: var(--radius-md);
  }
  .why-card-title { font-weight: 800; font-size: 18px; margin-bottom: 12px; color: var(--primary); }
  .why-card-desc { font-size: 14px; color: var(--text-muted); }

  /* ── Floating Contact ── */
  .floating-cta {
    position: fixed;
    bottom: 32px;
    right: 32px;
    background: var(--primary);
    color: white;
    padding: 16px 28px;
    border-radius: 100px;
    font-weight: 700;
    font-size: 15px;
    text-decoration: none;
    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.4);
    z-index: 100;
    transition: transform 0.2s;
  }
  .floating-cta:hover { transform: scale(1.05); }

  /* ── Footer ── */
  .footer {
    padding: 60px;
    text-align: center;
    background: #F1F5F9;
    font-size: 14px;
    color: var(--text-muted);
  }
  .footer b { color: var(--text-main); }

  @media print {
    .main-container { display: block; margin: 0; padding: 0; }
    .sidebar, .floating-cta { display: none; }
    .content-area { border: none; box-shadow: none; }
    .hero { padding: 40px; }
    .section { padding: 40px; page-break-inside: avoid; }
  }
</style>
</head>
<body>

  <div class="main-container">
    <!-- Navegación lateral -->
    <aside class="sidebar">
      <div class="nav-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        ${esc(agencyName)}
      </div>
      <nav>
        <ul class="nav-menu">
          <li class="nav-item"><a href="#resumen" class="nav-link">Resumen Ejecutivo</a></li>
          <li class="nav-item"><a href="#diagnostico" class="nav-link">Diagnóstico</a></li>
          <li class="nav-item"><a href="#propuesta" class="nav-link">Nuestra Solución</a></li>
          <li class="nav-item"><a href="#alcance" class="nav-link">Alcance y Entregables</a></li>
          <li class="nav-item"><a href="#proceso" class="nav-link">Metodología</a></li>
          <li class="nav-item"><a href="#inversion" class="nav-link">Inversión</a></li>
          <li class="nav-item"><a href="#nosotros" class="nav-link">¿Por qué nosotros?</a></li>
        </ul>
      </nav>
    </aside>

    <!-- Contenido principal -->
    <main class="content-area">
      
      <header class="hero">
        <div class="hero-agency">${esc(agencyName)}</div>
        <h1 class="hero-title">Propuesta Comercial Personalizada</h1>
        <div class="hero-meta">
          <div class="meta-item">
            <span class="meta-label">Preparada para</span>
            <span class="meta-value">${clientLabel}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Servicio</span>
            <span class="meta-value">${esc(content.tipoServicio)}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Fecha</span>
            <span class="meta-value">${fecha}</span>
          </div>
        </div>
      </header>

      <!-- Resumen -->
      <section id="resumen" class="section">
        <span class="section-tag">Introducción</span>
        <div class="section-header">
          <h2 class="section-title">Resumen Ejecutivo</h2>
          <p class="section-desc">Entendemos tus objetivos y hemos diseñado una estrategia enfocada en resultados medibles.</p>
        </div>
        <p style="font-size: 16px; color: var(--text-main); line-height: 1.8;">${esc(content.resumenEjecutivo)}</p>
      </section>

      <!-- Diagnóstico -->
      <section id="diagnostico" class="section">
        <span class="section-tag">Análisis</span>
        <div class="section-header">
          <h2 class="section-title">Problemas Detectados</h2>
          <p class="section-desc">Puntos críticos que están limitando tu crecimiento actual y requieren atención inmediata.</p>
        </div>
        <div class="problem-list">
          ${problemCards(content.problemasDetectados)}
        </div>
      </section>

      <!-- Propuesta -->
      <section id="propuesta" class="section">
        <span class="section-tag">Estrategia</span>
        <div class="section-header">
          <h2 class="section-title">Nuestra Solución</h2>
          <p class="section-desc">Un enfoque integral diseñado para transformar tus desafíos en ventajas competitivas.</p>
        </div>
        <div style="background: var(--bg-main); padding: 32px; border-radius: var(--radius-md); margin-bottom: 24px;">
          <p style="font-weight: 500; font-size: 16px; margin-bottom: 20px;">${esc(content.solucion.descripcion)}</p>
          <div class="check-grid">
            ${content.solucion.puntosClave.map(k => `
              <div style="display: flex; gap: 10px; font-size: 14px; font-weight: 500;">
                <span style="color: var(--primary);">→</span> ${esc(k)}
              </div>
            `).join("")}
          </div>
        </div>
      </section>

      <!-- Entregables -->
      <section id="alcance" class="section">
        <span class="section-tag">Alcance</span>
        <div class="section-header">
          <h2 class="section-title">Entregables y Compromisos</h2>
          <p class="section-desc">Lo que recibirás de nuestra parte de manera tangible durante la ejecución del proyecto.</p>
        </div>
        <div class="check-grid">
          ${checkList(content.entregables)}
        </div>
      </section>

      <!-- Proceso -->
      <section id="proceso" class="section">
        <span class="section-tag">Metodología</span>
        <div class="section-header">
          <h2 class="section-title">Cómo Vamos a Trabajar</h2>
          <p class="section-desc">Nuestras fases de implementación para asegurar una ejecución impecable.</p>
        </div>
        <div class="steps-container">
          ${steps(content.proceso)}
        </div>
      </section>

      <!-- Inversión -->
      <section id="inversion" class="section">
        <span class="section-tag">Inversión</span>
        <div class="section-header">
          <h2 class="section-title">Presupuesto y Condiciones</h2>
        </div>
        <div class="investment-card">
          <div class="inv-label">Inversión del Proyecto</div>
          <div class="inv-amount">${esc(content.inversion.total)}</div>
          <div class="inv-terms">${esc(content.inversion.terminos)}</div>
          <div class="inv-grid">
            ${content.inversion.incluye.map(i => `<div class="inv-badge">✓ ${esc(i)}</div>`).join("")}
          </div>
        </div>
        
        <div style="margin-top: 40px; padding: 24px; border: 1px dashed var(--border); border-radius: var(--radius-md);">
          <h4 style="font-size: 16px; margin-bottom: 8px;">Próximos Pasos</h4>
          <ul style="list-style: none; font-size: 14px; color: var(--text-muted);">
            ${content.proximosPasos.map(s => `<li style="margin-bottom: 6px;">→ ${esc(s)}</li>`).join("")}
          </ul>
        </div>
      </section>

      <!-- Nosotros -->
      <section id="nosotros" class="section">
        <span class="section-tag">Confianza</span>
        <div class="section-header">
          <h2 class="section-title">¿Por Qué Elegir a ${esc(agencyName)}?</h2>
          <p class="section-desc">Nuestros diferenciadores y el valor único que aportamos a tu negocio.</p>
        </div>
        <div class="why-grid">
          ${whyUsCards(content.porQueNosotros)}
        </div>
      </section>

      <footer class="footer">
        <p>Propuesta preparada por <b>${esc(agencyName)}</b> para <b>${clientLabel}</b></p>
        <p style="margin-top: 8px; font-size: 12px; opacity: 0.6;">Válida por 30 días naturales. Reservados todos los derechos.</p>
      </footer>

    </main>
  </div>

  ${proposalId ? `
  <button class="floating-cta" id="accept-btn" onclick="acceptProposal('${proposalId}')">
    ✓ Aceptar Propuesta
  </button>

  <script>
    async function acceptProposal(id) {
      var btn = document.getElementById('accept-btn');
      if (!btn || btn.disabled) return;
      btn.disabled = true;
      btn.textContent = 'Procesando...';
      btn.style.opacity = '0.7';
      try {
        var res = await fetch('/api/proposals/accept', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: id })
        });
        if (res.ok) {
          btn.textContent = '✓ ¡Propuesta Aceptada!';
          btn.style.background = '#059669';
          btn.style.opacity = '1';
          btn.style.boxShadow = '0 10px 15px -3px rgba(5,150,105,0.4)';
          var toast = document.createElement('div');
          toast.style.cssText = 'position:fixed;bottom:100px;right:32px;background:#065F46;color:white;padding:16px 24px;border-radius:12px;font-weight:600;font-size:14px;z-index:200;box-shadow:0 4px 20px rgba(0,0,0,0.25);animation:fadeIn 0.3s ease;';
          toast.textContent = '🎉 ¡Gracias! Nos pondremos en contacto pronto.';
          document.body.appendChild(toast);
        } else {
          btn.textContent = '✓ Aceptar Propuesta';
          btn.disabled = false;
          btn.style.opacity = '1';
        }
      } catch(e) {
        btn.textContent = '✓ Aceptar Propuesta';
        btn.disabled = false;
        btn.style.opacity = '1';
      }
    }
  </script>
  ` : ''}

</body>
</html>`;
}
