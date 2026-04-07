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
  const p = brand.primaryColor || "#420093";
  const s = brand.secondaryColor || "#8127cf";
  const acceptUrl = proposalId ? `/api/proposals/accept?id=${proposalId}` : "#";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="logo" style="max-height:28px;max-width:110px;object-fit:contain;"/>`
    : `<span class="material-symbols-outlined" style="color:${p};">menu_book</span>`;

  // E-E-A-T pillars from enfoqueCreativo.pilares (4 items)
  const pillarIcons = ["psychology", "workspace_premium", "verified_user", "shield"];
  const pillarBgs = ["bg-primary-fixed", "bg-secondary-fixed", "bg-tertiary-fixed", "bg-primary-fixed/20"];
  const pillarColors = ["text-primary", "text-secondary", "text-tertiary", "text-on-primary-container"];
  const pillarHoverBgs = ["group-hover:bg-primary", "group-hover:bg-secondary", "group-hover:bg-tertiary", "group-hover:bg-on-primary-container"];
  const pillarHoverColors = ["group-hover:text-on-primary", "group-hover:text-on-secondary", "group-hover:text-on-tertiary", "group-hover:text-primary"];
  const defaultPillars = ["Experiencia", "Experticia", "Autoridad", "Confianza"];
  const pilaresHtml = (c.enfoqueCreativo?.pilares || defaultPillars).slice(0, 4).map((pl, i) => `
    <div class="group cursor-default">
      <div class="w-16 h-16 rounded-2xl ${pillarBgs[i]} flex items-center justify-center mb-6 ${pillarHoverBgs[i]} transition-colors">
        <span class="material-symbols-outlined ${pillarColors[i]} ${pillarHoverColors[i]}">${pillarIcons[i]}</span>
      </div>
      <h3 class="font-bold text-xl mb-3">${esc(pl)}</h3>
      <p class="text-sm text-on-surface-variant leading-relaxed">${i === 0 ? esc(c.enfoqueCreativo?.descripcion?.split(".")[0] || "") : (c.porQueNosotros?.[i] ? esc(c.porQueNosotros[i].descripcion) : "")}</p>
    </div>`).join("");

  // Fases
  const fasesHtml = (c.fases || []).slice(0, 3).map((f, i) => {
    const hoverColors = ["group-hover:text-primary", "group-hover:text-secondary", "group-hover:text-tertiary-container"];
    const entregablesSlice = (c.entregables || []).slice(i * 2, i * 2 + 2);
    const bullets = entregablesSlice.length
      ? entregablesSlice.map(e => `
          <li class="flex items-center gap-3">
            <span class="material-symbols-outlined text-xs">check_circle</span>
            ${esc(e)}
          </li>`).join("")
      : `<li class="flex items-center gap-3"><span class="material-symbols-outlined text-xs">check_circle</span>${esc(f.descripcion)}</li>`;
    return `
    <div class="flex gap-8 group">
      <div class="text-5xl font-black text-outline-variant/40 ${hoverColors[i] || "group-hover:text-primary"} transition-colors">${String(f.numero).padStart(2, "0")}</div>
      <div class="pt-2">
        <h4 class="text-2xl font-bold mb-4">${esc(f.titulo)}</h4>
        ${f.duracion ? `<p class="text-xs font-bold text-secondary uppercase tracking-widest mb-3">${esc(f.duracion)}</p>` : ""}
        <ul class="space-y-4 text-on-surface-variant">${bullets}</ul>
      </div>
    </div>`;
  }).join("");

  // KPI glass cards from resultadosEsperados
  const kpiLabels = ["Resultado Clave", "Impacto Proyectado", "Métrica Principal"];
  const kpiHtml = (c.resultadosEsperados || []).slice(0, 3).map((r, i) => {
    const parts = r.match(/^([+\-~]?\d[\d,.%xk]*(?:\/\w+)?|[+\-~]?\d+pp)\s*(.*)?$/i);
    const val = parts ? parts[1] : r.slice(0, 12);
    const desc = parts && parts[2] ? parts[2] : r;
    return `
    <div class="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
      <div class="flex items-center gap-2 mb-4">
        <span class="material-symbols-outlined text-tertiary-fixed" style="font-variation-settings:'FILL' 1;">star</span>
        <span class="text-xs font-bold uppercase tracking-widest">${kpiLabels[i]}</span>
      </div>
      <p class="text-5xl font-black mb-2">${esc(val)}</p>
      <p class="text-sm opacity-70">${esc(desc)}</p>
    </div>`;
  }).join("");

  // Retos for bento small cards
  const reto0 = c.retosDetectados?.[0];
  const reto1 = c.retosDetectados?.[1];

  // Investment: 3 column adapted
  const incluye = c.inversion?.incluye || [];
  const col1 = incluye.slice(0, Math.ceil(incluye.length / 2));
  const col2 = incluye.slice(Math.ceil(incluye.length / 2));
  const inv1Html = col1.map(it => `<li class="flex gap-3"><span class="material-symbols-outlined text-primary text-lg">done</span>${esc(it)}</li>`).join("");
  const inv2Html = col2.map(it => `<li class="flex gap-3"><span class="material-symbols-outlined text-primary text-lg">done</span>${esc(it)}</li>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section class="mb-16">
      <h2 class="text-2xl font-bold text-on-surface mb-6">Términos y Condiciones</h2>
      <div class="bg-surface-container-low p-8 rounded-2xl text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">${esc(brand.termsConditions)}</div>
    </section>` : "";

  return `<!DOCTYPE html>
<html class="light" lang="es">
<head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Propuesta — ${esc(clientName)}</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
<script>
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          'tertiary-fixed-dim': '#ffb0cd',
          'on-secondary-container': '#fffbff',
          'surface-tint': '#713dcc',
          'on-primary-fixed': '#250059',
          'tertiary-container': '#910056',
          'surface-dim': '#d9dadb',
          'primary-container': '${p}cc',
          'primary-fixed': '#ebddff',
          'secondary-fixed': '#f0dbff',
          'on-error': '#ffffff',
          'outline': '#7b7485',
          'surface-bright': '#f8f9fa',
          'inverse-surface': '#2e3132',
          'on-primary-fixed-variant': '#581db3',
          'on-tertiary-container': '#ff9ac2',
          'on-primary': '#ffffff',
          'on-tertiary-fixed-variant': '#8c0053',
          'on-primary-container': '#c7aaff',
          'surface-container': '#edeeef',
          'surface-variant': '#e1e3e4',
          'on-surface-variant': '#4a4453',
          'on-secondary-fixed': '#2c0051',
          'error-container': '#ffdad6',
          'tertiary-fixed': '#ffd9e4',
          'surface-container-lowest': '#ffffff',
          'surface-container-high': '#e7e8e9',
          'surface-container-low': '#f3f4f5',
          'on-secondary-fixed-variant': '#6900b3',
          'tertiary': '#68003c',
          'inverse-on-surface': '#f0f1f2',
          'on-error-container': '#93000a',
          'error': '#ba1a1a',
          'primary-fixed-dim': '#d3bbff',
          'inverse-primary': '#d3bbff',
          'primary': '${p}',
          'secondary-fixed-dim': '#ddb7ff',
          'on-surface': '#191c1d',
          'on-background': '#191c1d',
          'surface-container-highest': '#e1e3e4',
          'on-tertiary': '#ffffff',
          'surface': '#f8f9fa',
          'secondary-container': '#9c48ea',
          'on-tertiary-fixed': '#3e0022',
          'outline-variant': '#ccc3d6',
          'secondary': '${s}',
          'on-secondary': '#ffffff',
          'background': '#f8f9fa'
        },
        borderRadius: { DEFAULT: '0.125rem', lg: '0.25rem', xl: '0.5rem', full: '0.75rem' },
        fontFamily: { headline: ['Inter'], body: ['Inter'], label: ['Inter'] }
      }
    }
  }
</script>
<style>
  body { font-family: 'Inter', sans-serif; }
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #ccc3d6; border-radius: 10px; }
</style>
</head>
<body class="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">

<!-- TopAppBar -->
<header class="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-[0_10px_30px_-5px_rgba(66,0,147,0.08)] flex items-center justify-between px-6 py-4">
  <div class="flex items-center gap-3">
    ${logoHtml}
    <span class="text-lg font-extrabold text-slate-900 tracking-tight">${esc(brand.agencyName)}</span>
  </div>
  <div class="flex items-center gap-6">
    <nav class="hidden md:flex gap-8">
      <a class="font-bold transition-colors" style="color:${p};" href="#vision">Visión General</a>
      <a class="text-slate-500 hover:text-slate-800 transition-colors px-2 rounded-lg" href="#contexto">Estrategia</a>
      <a class="text-slate-500 hover:text-slate-800 transition-colors px-2 rounded-lg" href="#inversion">Inversión</a>
    </nav>
    <a href="${acceptUrl}" class="text-white px-6 py-2.5 rounded-full font-bold shadow-lg transition-transform active:scale-95" style="background:linear-gradient(135deg,${p},${s});">
      Aceptar Propuesta
    </a>
  </div>
</header>

<!-- Sidebar -->
<aside class="fixed left-0 top-0 h-full w-64 z-40 bg-slate-50/10 backdrop-blur-2xl flex flex-col pt-24 space-y-8 px-4">
  <div class="px-4">
    <p class="text-sm font-medium uppercase tracking-widest text-slate-900 mb-8">Navegación</p>
    <nav class="space-y-6">
      <a class="flex items-center gap-3 border-l-[3px] font-bold pl-4 transition-all" style="border-color:${s};color:${p};" href="#vision">
        <span class="material-symbols-outlined">visibility</span>
        <span class="text-sm">Visión General</span>
      </a>
      <a class="flex items-center gap-3 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#contexto">
        <span class="material-symbols-outlined">analytics</span>
        <span class="text-sm">Contexto</span>
      </a>
      <a class="flex items-center gap-3 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#cronograma">
        <span class="material-symbols-outlined">event</span>
        <span class="text-sm">Cronograma</span>
      </a>
      <a class="flex items-center gap-3 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#inversion">
        <span class="material-symbols-outlined">payments</span>
        <span class="text-sm">Inversión</span>
      </a>
      <a class="flex items-center gap-3 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#pasos">
        <span class="material-symbols-outlined">arrow_forward</span>
        <span class="text-sm">Siguientes Pasos</span>
      </a>
    </nav>
  </div>
  <div class="mt-auto pb-10 px-4">
    <div class="p-4 rounded-xl bg-primary-fixed/30 border border-outline-variant/20">
      <p class="text-xs font-bold mb-2" style="color:${p};">PROPUESTA</p>
      <div class="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
        <div class="h-full w-1/3 shadow-[0_0_8px_rgba(129,39,207,0.4)]" style="background:linear-gradient(to right,${p},${s});"></div>
      </div>
      <p class="text-[10px] text-on-surface-variant mt-2 uppercase tracking-tighter">${clientLabel} · ${fecha}</p>
    </div>
  </div>
</aside>

<!-- Main -->
<main class="ml-64 pt-24 pb-20 px-12 min-h-screen">

  <!-- Hero -->
  <section class="mb-24" id="vision">
    <div class="relative overflow-hidden rounded-[2rem] bg-surface-container-low min-h-[500px] flex items-center p-16">
      <div class="relative z-10 max-w-2xl">
        <span class="inline-block px-4 py-1 rounded-full text-on-primary-fixed text-xs font-bold tracking-widest uppercase mb-6" style="background:${p}22;color:${p};">${esc(c.tipoProyecto)}</span>
        <h1 class="text-6xl font-extrabold text-on-surface tracking-tight leading-[1.1] mb-8">
          ${esc(c.resumenCreativo).replace(/(\w[\w\s]{0,30})(.+)/, (_, a, b) =>
            `${a}<span class="text-transparent bg-clip-text" style="background-image:linear-gradient(135deg,${p},${s});-webkit-background-clip:text;">${b}</span>`
          )}
        </h1>
        <p class="text-lg text-on-surface-variant leading-relaxed mb-10 max-w-lg">${esc(c.entendimientoDelCliente)}</p>
        <div class="flex gap-4">
          <a href="#contexto" class="text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl transition-all" style="background:${p};">Explorar Estrategia</a>
          <a href="${acceptUrl}" class="bg-surface-container-high text-on-surface px-8 py-4 rounded-xl font-bold hover:bg-surface-container-highest transition-all">Aceptar Propuesta</a>
        </div>
      </div>
      <div class="absolute right-0 top-0 h-full w-1/2 overflow-hidden pointer-events-none">
        <div class="h-full w-full opacity-30" style="background:radial-gradient(ellipse 80% 70% at 70% 30%,${p}40 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 30% 80%,${s}30 0%,transparent 55%);"></div>
        <div class="absolute inset-0" style="background:linear-gradient(to left,transparent,${p}08 100%);"></div>
      </div>
    </div>
  </section>

  <!-- Contexto / KPIs -->
  <section class="mb-32" id="contexto">
    <div class="mb-12">
      <h2 class="text-3xl font-bold text-on-surface tracking-tight mb-2">Entendimiento del Contexto</h2>
      <div class="h-1 w-20 rounded-full" style="background:${s};"></div>
    </div>
    <div class="grid grid-cols-12 gap-6">
      <!-- Main KPI Card -->
      <div class="col-span-8 bg-surface-container-lowest p-10 rounded-[2rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border-t-4" style="border-color:${p}33;">
        <div class="flex justify-between items-start mb-12">
          <div>
            <h3 class="text-2xl font-bold text-on-surface mb-2">Diagnóstico de Rendimiento</h3>
            <p class="text-on-surface-variant">Estado actual y oportunidades de mejora identificadas.</p>
          </div>
          <span class="material-symbols-outlined scale-150" style="color:${p};">trending_up</span>
        </div>
        <div class="grid grid-cols-3 gap-12">
          ${(c.retosDetectados || []).slice(0, 3).map((r, i) => `
          <div class="space-y-2">
            <p class="text-xs font-bold text-slate-400 uppercase tracking-widest">${esc(r.titulo)}</p>
            <p class="text-2xl font-extrabold text-on-surface">${["⚠️", "🎯", "📈"][i]}</p>
            <div class="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div class="h-full rounded-full" style="width:${[75, 55, 35][i]}%;background:${[p, s, "#910056"][i]};"></div>
            </div>
            <p class="text-xs text-on-surface-variant leading-snug">${esc(r.descripcion.slice(0, 80))}${r.descripcion.length > 80 ? "…" : ""}</p>
          </div>`).join("")}
        </div>
      </div>
      <!-- Small challenge cards -->
      <div class="col-span-4 space-y-6">
        ${reto0 ? `
        <div class="text-on-tertiary-container p-8 rounded-[2rem] relative overflow-hidden group" style="background:#910056;">
          <span class="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12 transition-transform group-hover:rotate-0">warning</span>
          <h4 class="text-xl font-bold mb-4 text-white">${esc(reto0.titulo)}</h4>
          <p class="text-sm opacity-80 leading-relaxed text-white">${esc(reto0.descripcion)}</p>
        </div>` : ""}
        ${reto1 ? `
        <div class="bg-surface-container-high p-8 rounded-[2rem]">
          <h4 class="text-xl font-bold text-on-surface mb-4">${esc(reto1.titulo)}</h4>
          <p class="text-sm text-on-surface-variant leading-relaxed">${esc(reto1.descripcion)}</p>
        </div>` : ""}
      </div>
    </div>
  </section>

  <!-- E-E-A-T / Pilares -->
  <section class="mb-32">
    <div class="flex items-end justify-between mb-16">
      <div class="max-w-xl">
        <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-4">${esc(c.enfoqueCreativo?.descripcion?.split(".")[0] || "Enfoque Estratégico")}</h2>
        <p class="text-on-surface-variant text-lg">${esc((c.enfoqueCreativo?.descripcion?.split(".").slice(1).join(".").trim()) || "Nuestra metodología se basa en pilares de calidad probados.")}</p>
      </div>
      <div class="hidden lg:block text-right">
        <p class="text-5xl font-black text-outline-variant/30">02. STRATEGY</p>
      </div>
    </div>
    <div class="grid grid-cols-4 gap-8">${pilaresHtml}</div>
  </section>

  <!-- Fases -->
  <section class="mb-32" id="cronograma">
    <div class="flex gap-20">
      <div class="w-1/3 sticky top-32 h-fit">
        <h2 class="text-4xl font-extrabold text-on-surface tracking-tight mb-6">Fases del Proyecto</h2>
        <p class="text-on-surface-variant mb-12">Un despliegue estratégico diseñado para revertir la tendencia negativa y sentar las bases del crecimiento.</p>
        ${c.fases?.[0] ? `
        <div class="p-6 bg-surface-container-high rounded-2xl border-l-4" style="border-color:${s};">
          <p class="text-xs font-bold uppercase tracking-widest mb-2" style="color:${s};">Hito Crítico</p>
          <p class="text-sm font-semibold">${esc(c.fases[Math.floor(c.fases.length / 2)]?.titulo || c.fases[0].titulo)}: ${esc(c.fases[Math.floor(c.fases.length / 2)]?.descripcion?.slice(0, 100) || "")}${(c.fases[Math.floor(c.fases.length / 2)]?.descripcion?.length || 0) > 100 ? "…" : ""}</p>
        </div>` : ""}
      </div>
      <div class="w-2/3 space-y-12">${fasesHtml}</div>
    </div>
  </section>

  <!-- KPIs Proyectados -->
  <section class="mb-32">
    <div class="p-16 rounded-[3rem] shadow-2xl relative overflow-hidden" style="background:linear-gradient(135deg,${p},${p}cc);">
      <div class="absolute top-0 right-0 p-12 opacity-10">
        <span class="material-symbols-outlined" style="font-size:20rem;">auto_graph</span>
      </div>
      <div class="relative z-10 text-white">
        <h2 class="text-4xl font-extrabold mb-12">KPIs y Resultados Proyectados</h2>
        <div class="grid grid-cols-3 gap-8">${kpiHtml}</div>
      </div>
    </div>
  </section>

  <!-- Inversión -->
  <section class="mb-32" id="inversion">
    <div class="text-center mb-16">
      <h2 class="text-4xl font-extrabold text-on-surface mb-4">Plan de Inversión</h2>
      <p class="text-on-surface-variant max-w-2xl mx-auto">Estructura de costos transparente diseñada para maximizar el ROI.</p>
    </div>
    <div class="grid grid-cols-3 gap-8">
      <!-- Alcance -->
      <div class="bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant/30 flex flex-col">
        <div class="mb-8">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Alcance del Proyecto</p>
          <h4 class="text-3xl font-bold mb-2">${esc(c.tipoProyecto || "Estrategia Digital")}</h4>
        </div>
        <ul class="space-y-4 mb-12 flex-grow text-sm text-on-surface-variant">${inv1Html}</ul>
        <a href="#inversion" class="w-full py-4 rounded-xl font-bold bg-surface-container-high hover:bg-surface-container-highest transition-all text-center block">Ver Detalles</a>
      </div>
      <!-- Plan Recomendado -->
      <div class="bg-surface-container-lowest p-10 rounded-[2.5rem] shadow-2xl border-2 relative flex flex-col scale-105 z-10" style="border-color:${p};">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 text-white text-[10px] font-black uppercase px-4 py-1 rounded-full tracking-widest" style="background:${p};">Recomendado</div>
        <div class="mb-8">
          <p class="text-xs font-bold uppercase tracking-widest mb-2" style="color:${p};">Propuesta Completa</p>
          <h4 class="text-3xl font-bold mb-2">Proyecto</h4>
          <div class="flex items-baseline gap-1">
            <span class="text-4xl font-extrabold">${esc(c.inversion?.total || "")}</span>
          </div>
        </div>
        <ul class="space-y-4 mb-12 flex-grow text-sm text-on-surface-variant">${inv2Html || inv1Html}</ul>
        <a href="${acceptUrl}" class="w-full py-4 rounded-xl font-bold text-white shadow-lg text-center block" style="background:${p};">Aceptar Propuesta</a>
      </div>
      <!-- Condiciones -->
      <div class="bg-surface-container-low p-10 rounded-[2.5rem] border border-outline-variant/30 flex flex-col">
        <div class="mb-8">
          <p class="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Condiciones</p>
          <h4 class="text-3xl font-bold mb-2">Términos</h4>
        </div>
        <p class="text-sm text-on-surface-variant leading-relaxed mb-12 flex-grow">${esc(c.inversion?.terminos || "Consultar condiciones de pago y plazos de entrega con el equipo comercial.")}</p>
        <a href="#pasos" class="w-full py-4 rounded-xl font-bold bg-surface-container-high hover:bg-surface-container-highest transition-all text-center block">Siguientes Pasos</a>
      </div>
    </div>
  </section>

  ${termsHtml}

  <!-- Footer CTA -->
  <footer class="flex items-center justify-between py-12 border-t border-outline-variant/20" id="pasos">
    <div>
      <p class="text-sm text-on-surface-variant">Vigencia de la propuesta: 15 días hábiles.</p>
      <p class="text-xs text-outline font-medium mt-1">© ${new Date().getFullYear()} ${esc(brand.agencyName)} · ${clientLabel}</p>
      ${brand.senderName ? `<p class="text-xs text-outline mt-1">Presentado por <strong>${esc(brand.senderName)}</strong></p>` : ""}
    </div>
    <div class="flex gap-4">
      <a href="${acceptUrl}" class="text-white px-12 py-4 rounded-xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all" style="background:linear-gradient(135deg,${s},#910056);">Aceptar y Firmar Propuesta</a>
    </div>
  </footer>

</main>
</body>
</html>`;
}
