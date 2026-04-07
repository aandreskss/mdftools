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
  const p = brand.primaryColor || "#420093";
  const s = brand.secondaryColor || "#8127cf";
  const acceptUrl = proposalId ? `/api/proposals/accept?id=${proposalId}` : "#";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="logo" style="max-height:24px;max-width:100px;object-fit:contain;"/>`
    : `<span class="material-symbols-outlined" style="color:${p};">diamond</span>`;

  // Hero title — split resumenCreativo: first line plain, second line gradient
  const heroWords = (c.resumenCreativo || "").split(" ");
  const split = Math.ceil(heroWords.length / 2);
  const heroLine1 = heroWords.slice(0, split).join(" ");
  const heroLine2 = heroWords.slice(split).join(" ");

  // Challenge cards (2 items)
  const challengeIcons = ["report_problem", "speed"];
  const challengesHtml = (c.retosDetectados || []).slice(0, 2).map((r, i) => `
    <div class="bg-surface-container-lowest p-8 rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] ${i === 0 ? "border-t-4" : ""}" style="${i === 0 ? `border-color:${p};` : ""}">
      <span class="material-symbols-outlined mb-4 text-4xl" style="color:${s};">${challengeIcons[i] || "warning"}</span>
      <h4 class="text-xl font-bold mb-2">${esc(r.titulo)}</h4>
      <p class="text-sm text-on-surface-variant leading-relaxed">${esc(r.descripcion)}</p>
    </div>`).join("");

  // Approach tags
  const tagsHtml = (c.enfoqueCreativo?.pilares || []).map(pl =>
    `<span class="px-4 py-1.5 rounded-full bg-surface-container-high text-sm font-semibold" style="color:${p};">#${esc(pl.replace(/\s+/g, ""))}</span>`
  ).join("");

  // Deliverable cards — 3 tall gradient cards
  const delivGradients = [
    `linear-gradient(135deg,${p},${p}aa)`,
    `linear-gradient(135deg,${s},${s}aa)`,
    `linear-gradient(135deg,#910056,#910056aa)`,
  ];
  const delivIcons = ["🎨", "👥", "📊"];
  const delivHtml = (c.entregables || []).slice(0, 3).map((e, i) => `
    <div class="group relative overflow-hidden rounded-xl bg-surface-container-low aspect-[4/5]" style="background:${delivGradients[i]};">
      <div class="absolute inset-0 flex items-center justify-center text-8xl opacity-10 group-hover:opacity-5 transition-opacity">${delivIcons[i]}</div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-8 text-white">
        <h5 class="text-2xl font-bold">${esc(e.split(" ").slice(0, 3).join(" "))}</h5>
        <p class="text-sm opacity-80 mt-2">${esc(e)}</p>
      </div>
    </div>`).join("");

  // Timeline phases
  const fasesHtml = (c.fases || []).map((f) => `
    <div class="flex items-start gap-8 group">
      <div class="flex-none w-24 pt-2">
        <span class="text-sm font-bold uppercase tracking-tighter" style="color:${s};">Fase ${String(f.numero).padStart(2, "0")}</span>
        ${f.duracion ? `<p class="text-xs text-on-surface-variant font-medium">${esc(f.duracion)}</p>` : ""}
      </div>
      <div class="relative pl-8 border-l-2 border-outline-variant group-hover:border-primary transition-colors" style="--hover-color:${p};">
        <div class="absolute -left-[9px] top-2 w-4 h-4 rounded-full bg-surface-container-lowest border-2 border-outline-variant group-hover:bg-primary transition-all" style=""></div>
        <h4 class="text-2xl font-bold text-on-surface">${esc(f.titulo)}</h4>
        <p class="text-on-surface-variant mt-2 leading-relaxed">${esc(f.descripcion)}</p>
      </div>
    </div>`).join("");

  // Investment includes
  const invIncludeHtml = (c.inversion?.incluye || []).map(it => `
    <li class="flex items-center gap-3">
      <span class="material-symbols-outlined" style="color:${p};font-variation-settings:'FILL' 1;">check_circle</span>
      <span class="font-medium">${esc(it)}</span>
    </li>`).join("");

  // Next steps (4 items)
  const defaultSteps = [
    { n: "01", title: "Aceptación Online", desc: `Haga clic en "Aceptar Propuesta" en la parte superior.` },
    { n: "02", title: "Facturación Inicial", desc: "Recibirá el comprobante para el pago inicial." },
    { n: "03", title: "Kick-off Meeting", desc: "Sesión estratégica con el equipo creativo." },
    { n: "04", title: "Inicio Fase 01", desc: "Comenzamos la auditoría de activos digitales." },
  ];
  const steps = c.proximosPasos && c.proximosPasos.length >= 4
    ? c.proximosPasos.slice(0, 4).map((paso, i) => ({ n: String(i + 1).padStart(2, "0"), title: paso.split(":")[0] || paso.slice(0, 30), desc: paso.split(":").slice(1).join(":").trim() || paso }))
    : defaultSteps;
  const stepsHtml = steps.map(st => `
    <div class="space-y-4">
      <div class="w-12 h-12 rounded-lg flex items-center justify-center font-bold" style="background:${p}22;color:${p};">${st.n}</div>
      <h5 class="font-bold">${esc(st.title)}</h5>
      <p class="text-sm text-on-surface-variant">${esc(st.desc)}</p>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section class="px-12 lg:px-24 py-16">
      <h3 class="text-2xl font-bold text-on-surface mb-6">Términos y Condiciones</h3>
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
  body { font-family: 'Inter', sans-serif; scroll-behavior: smooth; }
  .material-symbols-outlined { font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24; }
</style>
</head>
<body class="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">

<!-- Progress bar -->
<div class="fixed top-0 left-0 w-full h-1 z-[60] bg-surface-container-highest">
  <div class="h-full shadow-[0_0_10px_rgba(129,39,207,0.3)]" style="width:35%;background:linear-gradient(to right,${s},#910056);"></div>
</div>

<!-- Header -->
<header class="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-[0_10px_30px_-5px_rgba(66,0,147,0.08)] flex items-center justify-between px-6 py-4">
  <div class="flex items-center gap-3">
    ${logoHtml}
    <h1 class="text-lg font-extrabold text-slate-900 tracking-tight">${esc(brand.agencyName)}</h1>
  </div>
  <a href="${acceptUrl}" class="text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:scale-105 active:scale-95 transition-all" style="background:linear-gradient(135deg,${p},${p}cc);">
    Aceptar Propuesta
  </a>
</header>

<!-- Sidebar -->
<aside class="fixed left-0 top-0 h-full w-64 z-40 bg-slate-50/10 backdrop-blur-2xl border-none">
  <nav class="flex flex-col pt-24 space-y-8 px-4">
    <div class="px-4 mb-4">
      <span class="text-sm font-medium uppercase tracking-widest text-slate-900">Navegación</span>
    </div>
    <a class="group flex items-center gap-4 py-2 border-l-[3px] font-bold pl-4 transition-all" style="border-color:${s};color:${p};" href="#vision">
      <span class="material-symbols-outlined">visibility</span>
      <span class="text-sm">Visión General</span>
    </a>
    <a class="group flex items-center gap-4 py-2 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#cronograma">
      <span class="material-symbols-outlined">event</span>
      <span class="text-sm">Cronograma</span>
    </a>
    <a class="group flex items-center gap-4 py-2 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#inversion">
      <span class="material-symbols-outlined">payments</span>
      <span class="text-sm">Inversión</span>
    </a>
    <a class="group flex items-center gap-4 py-2 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#siguientes">
      <span class="material-symbols-outlined">arrow_forward</span>
      <span class="text-sm">Siguientes Pasos</span>
    </a>
  </nav>
</aside>

<!-- Main -->
<main class="ml-64 pt-20 pb-32">

  <!-- Hero -->
  <section class="min-h-screen flex flex-col justify-center px-12 lg:px-24 bg-surface" id="vision">
    <div class="max-w-4xl space-y-8">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-on-primary-fixed text-xs font-bold tracking-widest uppercase" style="background:${p}22;color:${p};">
        Propuesta Exclusiva · ${new Date().getFullYear()}
      </div>
      <h2 class="text-7xl font-extrabold text-on-surface tracking-tight leading-[1.1]">
        ${esc(heroLine1)}<br/>
        <span class="text-transparent bg-clip-text" style="background-image:linear-gradient(135deg,${p},${s});-webkit-background-clip:text;">${esc(heroLine2)}</span>
      </h2>
      <p class="text-xl text-on-surface-variant leading-relaxed max-w-2xl">
        ${esc(c.enfoqueCreativo?.descripcion || c.entendimientoDelCliente || "")}
      </p>
      <div class="pt-8 flex gap-4">
        <div class="h-16 w-16 rounded-full bg-surface-container-high flex items-center justify-center">
          <span class="material-symbols-outlined text-3xl" style="color:${p};">auto_awesome</span>
        </div>
        <div>
          <p class="text-sm font-bold text-on-surface">Preparado para:</p>
          <p class="text-lg text-on-surface-variant">${clientLabel}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Visión y Desafíos -->
  <section class="px-12 lg:px-24 py-24 bg-surface-container-low">
    <div class="grid grid-cols-12 gap-8">
      <div class="col-span-12 lg:col-span-5 space-y-6">
        <h3 class="text-4xl font-bold text-on-surface tracking-tight">Visión y Desafíos</h3>
        <p class="text-lg text-on-surface-variant leading-relaxed">${esc(c.entendimientoDelCliente)}</p>
      </div>
      <div class="col-span-12 lg:col-span-7 grid grid-cols-2 gap-6">${challengesHtml}</div>
    </div>
  </section>

  <!-- Enfoque Creativo + Entregables -->
  <section class="px-12 lg:px-24 py-32 space-y-16">
    <div class="text-center max-w-3xl mx-auto space-y-4">
      <h3 class="text-4xl font-bold text-on-surface">Nuestro Enfoque Creativo</h3>
      <div class="flex flex-wrap justify-center gap-3">${tagsHtml}</div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8">${delivHtml}</div>
  </section>

  <!-- Cronograma -->
  <section class="px-12 lg:px-24 py-32 bg-surface-container-low/50" id="cronograma">
    <h3 class="text-4xl font-bold mb-16 text-on-surface">Cronograma de Ejecución</h3>
    <div class="space-y-12">${fasesHtml}</div>
  </section>

  <!-- Inversión -->
  <section class="px-12 lg:px-24 py-32" id="inversion">
    <div class="bg-surface-container-lowest rounded-[2rem] p-12 shadow-[0_20px_50px_-20px_rgba(66,0,147,0.15)] flex flex-col lg:flex-row items-center gap-16 overflow-hidden relative">
      <div class="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32" style="background:${p}0d;"></div>
      <div class="flex-1 space-y-6 z-10">
        <h3 class="text-5xl font-bold text-on-surface tracking-tight">Inversión del Proyecto</h3>
        <p class="text-lg text-on-surface-variant">${esc(c.enfoqueCreativo?.descripcion?.split(".")[0] || "Un valor integral que cubre consultoría, diseño creativo y ejecución técnica.")}</p>
        <ul class="space-y-4">${invIncludeHtml}</ul>
      </div>
      <div class="w-full lg:w-80 p-8 rounded-2xl text-white text-center shadow-xl" style="background:linear-gradient(135deg,${p},${p}cc);">
        <p class="text-sm font-bold uppercase tracking-widest opacity-80 mb-2">Total Inversión</p>
        <p class="text-5xl font-extrabold mb-6">${esc(c.inversion?.total || "")}</p>
        <div class="h-px bg-white/20 mb-6"></div>
        <p class="text-xs opacity-80 leading-relaxed mb-8">${esc(c.inversion?.terminos || "Consultar condiciones y plazos de pago.")}</p>
        <a href="${acceptUrl}" class="block w-full py-4 bg-white font-bold rounded-xl hover:bg-opacity-90 transition-all" style="color:${p};">Aprobar Inversión</a>
      </div>
    </div>
  </section>

  <!-- Próximos Pasos -->
  <section class="px-12 lg:px-24 py-32 space-y-12" id="siguientes">
    <h3 class="text-4xl font-bold text-on-surface">Próximos Pasos</h3>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-8">${stepsHtml}</div>
    <div class="pt-12 flex justify-center">
      <div class="inline-flex items-center gap-8 p-6 bg-surface-container-high rounded-full px-12">
        <p class="text-on-surface-variant font-medium italic">¿Preguntas sobre la propuesta?</p>
        <a href="#" class="flex items-center gap-2 font-bold hover:gap-3 transition-all" style="color:${p};">
          Hablar con un consultor
          <span class="material-symbols-outlined">east</span>
        </a>
      </div>
    </div>
  </section>

  ${termsHtml}

</main>

<!-- Footer -->
<footer class="ml-64 bg-surface-container-highest py-12 px-12 lg:px-24">
  <div class="flex flex-col md:flex-row justify-between items-center gap-8">
    <div class="flex items-center gap-3">
      ${logoHtml}
      <span class="font-bold text-on-surface tracking-tight">${esc(brand.agencyName)}</span>
    </div>
    <div class="text-on-surface-variant text-sm font-medium">${clientLabel} · ${fecha}</div>
    <div class="flex gap-6">
      <a class="text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Privacidad</a>
      <a class="text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">Términos</a>
    </div>
  </div>
</footer>
</body>
</html>`;
}
