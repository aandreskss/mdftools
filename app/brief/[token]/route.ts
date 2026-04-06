import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("proposals")
    .select("id, client_name, industry, brief_data, calendar_data, brief_status, brief_token, form_data")
    .eq("brief_token", params.token)
    .single();

  if (!data?.brief_data) {
    return new NextResponse(notFoundHtml(), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const html = renderBriefHtml(data, params.token);
  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

// ─── HTML renderer ────────────────────────────────────────────────────────────

function notFoundHtml() {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Brief no encontrado</title>
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f0f0f;color:#888;}
  .box{text-align:center;}.box h1{color:#fff;font-size:1.25rem;margin-bottom:.5rem;}</style>
  </head><body><div class="box"><h1>Brief no disponible</h1><p>Este enlace no existe o aún no tiene contenido.</p></div></body></html>`;
}

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

function renderBriefHtml(data: any, token: string) {
  const brief    = data.brief_data    ?? {};
  const calendar = data.calendar_data ?? null;
  const approved = data.brief_status === "approved";
  const client   = data.client_name ?? "";
  const company  = data.form_data?.clientCompany ?? "";

  const milestones = (calendar?.milestones ?? []).map((m: any, i: number) => `
    <div class="milestone">
      <div class="ms-dot">${i + 1}</div>
      <div class="ms-body">
        <div class="ms-title">${m.name}</div>
        <div class="ms-desc">${m.description ?? ""}</div>
        <div class="ms-date">${fmtDate(m.date)}</div>
        ${(m.deliverables ?? []).length ? `<ul class="ms-dels">${(m.deliverables as string[]).map(d => `<li>${d}</li>`).join("")}</ul>` : ""}
      </div>
    </div>`).join("");

  const revisions = (calendar?.revisionRounds ?? []).map((r: any) => `
    <div class="revision-chip">
      <span class="rev-num">Ronda ${r.roundNumber}</span>
      <span class="rev-date">${fmtDate(r.date)}</span>
      <span class="rev-days">${r.durationDays} días</span>
    </div>`).join("");

  const assets = (brief.requiredAssets ?? []).map((a: any) => `
    <div class="asset-card">
      <div class="asset-name">${a.name}</div>
      <div class="asset-desc">${a.description ?? ""}</div>
      <div class="asset-meta">
        ${a.format ? `<span class="tag">${a.format}</span>` : ""}
        ${a.deadline ? `<span class="tag tag-date">Fecha límite: ${fmtDate(a.deadline)}</span>` : ""}
      </div>
    </div>`).join("");

  const keywords = (brief.styleKeywords ?? []).map((k: string) => `<span class="keyword">${k}</span>`).join("");
  const objectives = (brief.mainObjectives ?? []).map((o: string) => `<li>${o}</li>`).join("");
  const metrics    = (brief.successMetrics ?? []).map((m: string) => `<li>${m}</li>`).join("");
  const finalDels  = (calendar?.finalDeliverables ?? []).map((d: string) => `<li>${d}</li>`).join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Brief de Proyecto — ${client}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #0d0d0d;
      --surface: #161616;
      --card: #1e1e1e;
      --border: rgba(255,255,255,0.07);
      --violet: #a78bfa;
      --violet-dim: rgba(167,139,250,0.12);
      --green: #34d399;
      --text: #e2e8f0;
      --muted: #94a3b8;
      --subtle: #64748b;
    }
    body { background: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; min-height: 100vh; }

    /* Header */
    .header { background: var(--surface); border-bottom: 1px solid var(--border); padding: 20px 32px; display: flex; align-items: center; justify-content: space-between; }
    .header-brand { font-size: 13px; font-weight: 700; color: var(--violet); letter-spacing: 1px; text-transform: uppercase; }
    .header-status { display: flex; align-items: center; gap: 8px; }
    .status-badge { font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 999px; }
    .status-badge.approved { background: rgba(52,211,153,0.12); color: var(--green); border: 1px solid rgba(52,211,153,0.25); }
    .status-badge.pending  { background: rgba(167,139,250,0.12); color: var(--violet); border: 1px solid rgba(167,139,250,0.25); }

    /* Hero */
    .hero { padding: 48px 32px 32px; max-width: 900px; margin: 0 auto; }
    .hero-eyebrow { font-size: 11px; font-weight: 700; color: var(--violet); letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; }
    .hero-title { font-size: clamp(28px,4vw,40px); font-weight: 800; color: #fff; line-height: 1.2; margin-bottom: 8px; }
    .hero-subtitle { font-size: 15px; color: var(--muted); margin-bottom: 32px; }
    .hero-summary { font-size: 15px; color: var(--muted); line-height: 1.8; background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }

    /* Sections */
    .container { max-width: 900px; margin: 0 auto; padding: 0 32px 80px; }
    .section { margin-top: 40px; }
    .section-title { font-size: 11px; font-weight: 700; color: var(--violet); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 16px; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 24px; }

    /* Lists */
    .check-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .check-list li { font-size: 14px; color: var(--text); padding-left: 24px; position: relative; line-height: 1.6; }
    .check-list li::before { content: "✓"; position: absolute; left: 0; color: var(--violet); font-weight: 700; }

    /* Keywords */
    .keywords { display: flex; flex-wrap: wrap; gap: 8px; }
    .keyword { background: var(--violet-dim); color: var(--violet); font-size: 13px; font-weight: 600; padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(167,139,250,0.2); }

    /* Assets */
    .assets-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap: 14px; }
    .asset-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; }
    .asset-name { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .asset-desc { font-size: 13px; color: var(--muted); line-height: 1.5; margin-bottom: 10px; }
    .asset-meta { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 999px; background: rgba(255,255,255,0.06); color: var(--subtle); border: 1px solid rgba(255,255,255,0.06); }
    .tag-date { background: rgba(251,146,60,0.1); color: #fb923c; border-color: rgba(251,146,60,0.2); }

    /* Milestones */
    .milestones { display: flex; flex-direction: column; gap: 0; }
    .milestone { display: flex; gap: 16px; position: relative; padding-bottom: 24px; }
    .milestone:last-child { padding-bottom: 0; }
    .milestone:not(:last-child) .ms-dot::after { content: ""; position: absolute; top: 28px; left: 50%; transform: translateX(-50%); width: 2px; height: calc(100% - 28px); background: var(--border); }
    .ms-dot { width: 28px; height: 28px; border-radius: 50%; background: var(--violet-dim); border: 2px solid rgba(167,139,250,0.3); flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: var(--violet); position: relative; }
    .ms-body { flex: 1; padding-top: 2px; }
    .ms-title { font-size: 14px; font-weight: 700; color: #fff; margin-bottom: 4px; }
    .ms-desc { font-size: 13px; color: var(--muted); margin-bottom: 6px; line-height: 1.5; }
    .ms-date { font-size: 12px; font-weight: 600; color: var(--violet); margin-bottom: 8px; }
    .ms-dels { list-style: none; display: flex; flex-wrap: wrap; gap: 6px; }
    .ms-dels li { font-size: 11px; color: var(--subtle); background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 6px; padding: 3px 8px; }

    /* Revision chips */
    .revisions { display: flex; flex-wrap: wrap; gap: 10px; }
    .revision-chip { display: flex; align-items: center; gap: 10px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 12px 16px; }
    .rev-num { font-size: 13px; font-weight: 700; color: #fff; }
    .rev-date { font-size: 12px; color: var(--violet); }
    .rev-days { font-size: 11px; color: var(--subtle); }
    .rev-sep { width: 1px; height: 12px; background: var(--border); }

    /* Final delivery */
    .delivery-banner { background: linear-gradient(135deg, rgba(52,211,153,0.08), rgba(167,139,250,0.06)); border: 1px solid rgba(52,211,153,0.15); border-radius: 16px; padding: 24px; display: flex; align-items: center; gap: 16px; }
    .delivery-icon { font-size: 32px; }
    .delivery-date { font-size: 22px; font-weight: 800; color: #fff; }
    .delivery-label { font-size: 12px; color: var(--subtle); text-transform: uppercase; letter-spacing: 1px; }

    /* Two columns */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    @media(max-width: 640px) { .two-col { grid-template-columns: 1fr; } .hero, .container { padding-left: 16px; padding-right: 16px; } }

    /* CTA */
    .cta-section { position: fixed; bottom: 0; left: 0; right: 0; background: var(--surface); border-top: 1px solid var(--border); padding: 16px 32px; display: flex; align-items: center; justify-content: space-between; z-index: 100; }
    .cta-text { font-size: 13px; color: var(--muted); }
    .cta-btn { padding: 12px 28px; border-radius: 12px; border: none; font-size: 14px; font-weight: 700; cursor: pointer; transition: all .2s; }
    .cta-btn-approve { background: linear-gradient(135deg, #a78bfa, #7c3aed); color: #fff; box-shadow: 0 4px 20px rgba(124,58,237,0.35); }
    .cta-btn-approve:hover { transform: translateY(-1px); box-shadow: 0 8px 28px rgba(124,58,237,0.45); }
    .cta-btn-approved { background: rgba(52,211,153,0.15); color: var(--green); border: 1px solid rgba(52,211,153,0.3); cursor: default; }

    /* Divider */
    .divider { height: 1px; background: var(--border); margin: 8px 0; }
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="header-brand">Brief de Proyecto</div>
    <div class="header-status">
      <div class="status-badge ${approved ? "approved" : "pending"}" id="status-badge">
        ${approved ? "✓ Aprobado" : "Pendiente de aprobación"}
      </div>
    </div>
  </div>

  <!-- Hero -->
  <div class="hero">
    <div class="hero-eyebrow">Brief de Kickoff</div>
    <div class="hero-title">${client}${company ? ` · ${company}` : ""}</div>
    <div class="hero-subtitle">${data.industry ?? ""}</div>
    ${brief.projectSummary ? `<div class="hero-summary">${brief.projectSummary}</div>` : ""}
  </div>

  <div class="container">

    <!-- Objetivos + Métricas -->
    <div class="section two-col">
      <div>
        <div class="section-title">Objetivos principales</div>
        <div class="card">
          <ul class="check-list">${objectives}</ul>
        </div>
      </div>
      <div>
        <div class="section-title">Métricas de éxito</div>
        <div class="card">
          <ul class="check-list">${metrics}</ul>
        </div>
      </div>
    </div>

    <!-- Audiencia -->
    ${brief.targetAudience ? `
    <div class="section">
      <div class="section-title">Audiencia objetivo</div>
      <div class="card" style="font-size:14px;line-height:1.8;color:var(--muted);">${brief.targetAudience}</div>
    </div>` : ""}

    <!-- Keywords -->
    ${(brief.styleKeywords ?? []).length ? `
    <div class="section">
      <div class="section-title">Estilo visual</div>
      <div class="keywords">${keywords}</div>
    </div>` : ""}

    <!-- Assets requeridos -->
    ${(brief.requiredAssets ?? []).length ? `
    <div class="section">
      <div class="section-title">Assets que necesitamos de ti</div>
      <div class="assets-grid">${assets}</div>
    </div>` : ""}

    <!-- Calendario -->
    ${calendar ? `
    <div class="section">
      <div class="section-title">Calendario del proyecto</div>

      ${(calendar.milestones ?? []).length ? `
      <div class="card" style="margin-bottom:16px;">
        <div class="milestones">${milestones}</div>
      </div>` : ""}

      ${(calendar.revisionRounds ?? []).length ? `
      <div style="margin-bottom:16px;">
        <div style="font-size:12px;font-weight:600;color:var(--subtle);text-transform:uppercase;letter-spacing:1px;margin-bottom:10px;">Rondas de revisión</div>
        <div class="revisions">${revisions}</div>
      </div>` : ""}

      ${calendar.finalDeliveryDate ? `
      <div class="delivery-banner">
        <div class="delivery-icon">🎯</div>
        <div>
          <div class="delivery-label">Entrega final</div>
          <div class="delivery-date">${fmtDate(calendar.finalDeliveryDate)}</div>
          ${(calendar.finalDeliverables ?? []).length ? `<ul class="check-list" style="margin-top:10px;">${finalDels}</ul>` : ""}
        </div>
      </div>` : ""}
    </div>` : ""}

    <!-- Spacer for CTA -->
    <div style="height:80px;"></div>
  </div>

  <!-- CTA fija -->
  <div class="cta-section">
    <div class="cta-text">
      ${approved ? "Has aprobado este brief. ¡El proyecto puede comenzar!" : "Revisa el brief y apruébalo para que podamos empezar."}
    </div>
    ${approved
      ? `<button class="cta-btn cta-btn-approved" disabled>✓ Brief Aprobado</button>`
      : `<button class="cta-btn cta-btn-approve" id="approve-btn" onclick="approveBrief()">Aprobar Brief y Calendario</button>`
    }
  </div>

  <script>
    async function approveBrief() {
      var btn = document.getElementById('approve-btn');
      if (!btn || btn.disabled) return;
      btn.disabled = true;
      btn.textContent = 'Procesando...';
      btn.style.opacity = '0.7';
      try {
        var res = await fetch('/api/design-proposals/brief/approve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: '${token}' })
        });
        if (res.ok) {
          btn.textContent = '✓ ¡Aprobado!';
          btn.className = 'cta-btn cta-btn-approved';
          btn.style.opacity = '1';
          document.getElementById('status-badge').textContent = '✓ Aprobado';
          document.getElementById('status-badge').className = 'status-badge approved';
          document.querySelector('.cta-text').textContent = 'Has aprobado este brief. ¡El proyecto puede comenzar!';
        } else {
          btn.disabled = false;
          btn.textContent = 'Aprobar Brief y Calendario';
          btn.style.opacity = '1';
        }
      } catch(e) {
        btn.disabled = false;
        btn.textContent = 'Aprobar Brief y Calendario';
        btn.style.opacity = '1';
      }
    }
  </script>
</body>
</html>`;
}
