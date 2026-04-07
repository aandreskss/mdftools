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
  const p = brand.primaryColor || "#420093";
  const s = brand.secondaryColor || "#8127cf";
  const acceptUrl = proposalId ? `/api/proposals/accept?id=${proposalId}` : "#";

  const logoHtml = brand.logoUrl
    ? `<img src="${esc(brand.logoUrl)}" alt="logo" style="max-height:24px;max-width:100px;object-fit:contain;"/>`
    : `<span class="material-symbols-outlined" style="color:${p};">menu_book</span>`;

  // Deliverables — 4 gradient cards from entregables
  const deliverableGradients = [
    `linear-gradient(135deg,${p},${p}aa)`,
    `linear-gradient(135deg,${s},${s}aa)`,
    `linear-gradient(135deg,#910056,#910056aa)`,
    `linear-gradient(135deg,${p}88,${s}88)`,
  ];
  const deliverableIcons = ["🎨", "⚡", "📱", "📊"];
  const entregablesHtml = (c.entregables || []).slice(0, 4).map((e, i) => {
    const words = e.split(" ");
    const title = words.slice(0, 3).join(" ");
    const desc = words.slice(3).join(" ") || e;
    return `
    <div class="group relative aspect-square overflow-hidden rounded-[2rem]" style="background:${deliverableGradients[i]};">
      <div class="absolute inset-0 flex flex-col items-center justify-center opacity-20 group-hover:opacity-10 transition-opacity text-white text-7xl">${deliverableIcons[i]}</div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-8 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform">
        <p class="text-white font-bold text-lg">${esc(title)}</p>
        <p class="text-white/70 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity">${esc(desc)}</p>
      </div>
    </div>`;
  }).join("");

  // Impact metrics from resultadosEsperados
  const impactHtml = (c.resultadosEsperados || []).slice(0, 3).map((r) => {
    const match = r.match(/^([+\-~]?\d[\d,.%xkm]*(?:\/\w+)?(?:pp)?)\s*(.*)?$/i);
    const val = match ? match[1] : r.slice(0, 8);
    const label = match && match[2] ? match[2] : r;
    return `
    <div class="text-center group">
      <span class="text-6xl font-extrabold text-on-surface group-hover:text-primary transition-colors tracking-tighter">${esc(val)}</span>
      <p class="text-sm font-bold uppercase tracking-widest text-on-surface-variant mt-4">${esc(label.slice(0, 40))}</p>
      <div class="w-12 h-1 bg-outline-variant/30 mx-auto mt-6 group-hover:w-24 group-hover:bg-primary transition-all"></div>
    </div>`;
  }).join("");

  // Challenges (2 items)
  const challengeIcons = ["cloud", "speed"];
  const retosHtml = (c.retosDetectados || []).slice(0, 2).map((r, i) => `
    <div class="bg-surface-container-low p-8 rounded-[2rem] flex flex-col gap-4 hover:bg-surface-container-high transition-colors">
      <span class="material-symbols-outlined text-secondary text-3xl">${challengeIcons[i] || "warning"}</span>
      <div>
        <h4 class="font-bold text-on-surface">${esc(r.titulo)}</h4>
        <p class="text-sm text-on-surface-variant">${esc(r.descripcion)}</p>
      </div>
    </div>`).join("");

  // Pilares as tags
  const tagsHtml = (c.enfoqueCreativo?.pilares || []).map(pl =>
    `<span class="bg-surface-container-high px-4 py-2 rounded-full text-sm font-bold">${esc(pl)}</span>`
  ).join("");

  // Investment payment breakdown
  const incluyeHtml = (c.inversion?.incluye || []).map((it, i) => `
    <li class="flex items-center justify-between text-sm">
      <span class="text-on-surface-variant">${esc(it)}</span>
      <span class="font-bold">${["40%", "30%", "30%"][i] || "✓"}</span>
    </li>`).join("");

  // Next steps as numbered circles
  const pasosHtml = (c.proximosPasos || []).slice(0, 3).map((paso, i) => `
    <div class="bg-surface p-4 rounded-full border border-outline-variant/30 relative">
      <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold" style="${i === 0 ? `background:${p}22;color:${p};` : "background:#e7e8e9;color:#4a4453;"}">${i + 1}</div>
      <p class="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest">${esc(paso.slice(0, 18))}</p>
    </div>`).join("");

  const termsHtml = brand.termsConditions ? `
    <section class="mb-16 px-8">
      <h2 class="text-2xl font-bold text-on-surface mb-6">Términos y Condiciones</h2>
      <div class="bg-surface-container-low p-8 rounded-2xl text-sm text-on-surface-variant leading-relaxed whitespace-pre-wrap">${esc(brand.termsConditions)}</div>
    </section>` : "";

  // Split resumenCreativo for the big hero title
  const words = (c.resumenCreativo || "").split(" ");
  const half = Math.ceil(words.length / 2);
  const heroLine1 = words.slice(0, half).join(" ");
  const heroLine2 = words.slice(half).join(" ");

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
</style>
</head>
<body class="bg-surface text-on-surface selection:bg-primary-fixed selection:text-primary overflow-x-hidden">

<!-- Header -->
<header class="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-[0_10px_30px_-5px_rgba(66,0,147,0.08)] flex items-center justify-between px-6 py-4">
  <div class="flex items-center gap-3">
    ${logoHtml}
    <h1 class="text-lg font-extrabold text-slate-900 tracking-tight">${esc(brand.agencyName)}</h1>
  </div>
  <a href="${acceptUrl}" class="text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-90 active:scale-95 transition-all text-sm" style="background:linear-gradient(135deg,${p},${p}cc);">
    Aceptar Propuesta
  </a>
</header>

<!-- Sidebar -->
<aside class="fixed left-0 top-0 h-full w-64 z-40 bg-slate-50/10 backdrop-blur-2xl flex flex-col pt-24 space-y-8 px-4">
  <div class="px-4">
    <p class="text-sm font-medium uppercase tracking-widest text-slate-500 mb-6">Navegación</p>
    <nav class="flex flex-col space-y-4">
      <a class="flex items-center gap-3 py-2 border-l-[3px] font-bold pl-4 transition-all" style="border-color:${s};color:${p};" href="#vision">
        <span class="material-symbols-outlined">visibility</span>
        <span class="text-sm">Visión General</span>
      </a>
      <a class="flex items-center gap-3 py-2 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#cronograma">
        <span class="material-symbols-outlined">event</span>
        <span class="text-sm">Cronograma</span>
      </a>
      <a class="flex items-center gap-3 py-2 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#inversion">
        <span class="material-symbols-outlined">payments</span>
        <span class="text-sm">Inversión</span>
      </a>
      <a class="flex items-center gap-3 py-2 text-slate-500 pl-4 hover:text-violet-600 transition-all" href="#siguientes">
        <span class="material-symbols-outlined">arrow_forward</span>
        <span class="text-sm">Siguientes Pasos</span>
      </a>
    </nav>
  </div>
  <div class="mt-auto pb-10 px-4">
    <div class="bg-surface-container-high p-4 rounded-xl">
      <p class="text-xs font-bold text-on-surface-variant uppercase tracking-tighter mb-2">Estado del Documento</p>
      <div class="flex items-center gap-2">
        <div class="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
          <div class="h-full w-3/4 shadow-[0_0_8px_rgba(129,39,207,0.3)]" style="background:linear-gradient(135deg,${s},#910056);"></div>
        </div>
        <span class="text-[10px] font-bold" style="color:${p};">75%</span>
      </div>
    </div>
  </div>
</aside>

<!-- Main -->
<main class="ml-64 pt-24 pb-20 px-8 lg:px-16 max-w-7xl">

  <!-- Hero -->
  <section class="relative mb-24 min-h-[500px] flex flex-col justify-center" id="vision">
    <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px]" style="background:${p}1a;"></div>
    <div class="absolute top-40 -left-40 w-80 h-80 rounded-full blur-[100px]" style="background:#9100561a;"></div>
    <div class="relative z-10">
      <div class="flex items-center gap-4 mb-8">
        <span class="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase" style="background:${p}22;color:${p};">Propuesta ${new Date().getFullYear()}</span>
        <div class="h-px w-24 bg-outline-variant/30"></div>
        <span class="text-on-surface-variant font-medium text-sm">Para: ${clientLabel}</span>
      </div>
      <h1 class="text-6xl lg:text-8xl font-extrabold text-on-surface tracking-tight leading-[0.9] mb-8">
        ${esc(heroLine1)}<br/>
        <span class="italic" style="color:${p};">${esc(heroLine2)}</span>
      </h1>
      <p class="text-xl lg:text-2xl text-on-surface-variant max-w-2xl leading-relaxed mb-12">
        ${esc(c.entendimientoDelCliente)}
      </p>
      <div class="flex flex-wrap gap-12 border-t border-outline-variant/20 pt-10">
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Cliente</p>
          <p class="text-lg font-bold">${esc(clientName)}</p>
        </div>
        ${clientCompany ? `<div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Empresa</p>
          <p class="text-lg font-bold">${esc(clientCompany)}</p>
        </div>` : ""}
        ${brand.senderName ? `<div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Responsable</p>
          <p class="text-lg font-bold">${esc(brand.senderName)}</p>
        </div>` : ""}
        <div>
          <p class="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Fecha</p>
          <p class="text-lg font-bold">${fecha}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Quote Section -->
  <section class="mb-32">
    <div class="bg-surface-container-low p-12 lg:p-20 rounded-[2rem] relative overflow-hidden group">
      <div class="absolute top-0 right-0 w-64 h-64 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity" style="background:linear-gradient(135deg,${s},#910056);"></div>
      <span class="material-symbols-outlined text-6xl absolute top-8 left-8" style="color:${p}33;">format_quote</span>
      <div class="relative z-10 max-w-4xl mx-auto text-center">
        <p class="text-2xl lg:text-4xl font-medium text-on-surface italic leading-snug mb-8">
          "${esc(c.entendimientoDelCliente)}"
        </p>
        <div class="flex flex-col items-center">
          <div class="w-12 h-1 mb-4" style="background:${p};"></div>
          <p class="font-bold uppercase text-sm tracking-widest" style="color:${p};">Análisis de Necesidades · ${esc(brand.agencyName)}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Concepto Estratégico + Retos -->
  <section class="mb-32">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 bg-surface-container-lowest p-10 rounded-[2rem] shadow-sm border-t-4" style="border-color:${p};">
        <h2 class="text-sm font-bold uppercase tracking-widest mb-4" style="color:${p};">Concepto Estratégico</h2>
        <h3 class="text-4xl font-extrabold text-on-surface mb-6 tracking-tight">${esc(c.tipoProyecto || "Estrategia Digital")}</h3>
        <p class="text-on-surface-variant text-lg leading-relaxed mb-10 max-w-xl">${esc(c.enfoqueCreativo?.descripcion || "")}</p>
        <div class="flex flex-wrap gap-3">${tagsHtml}</div>
      </div>
      <div class="flex flex-col gap-6">${retosHtml}</div>
    </div>
  </section>

  <!-- Entregables -->
  <section class="mb-32">
    <div class="flex items-end justify-between mb-12">
      <div>
        <h2 class="text-sm font-bold uppercase tracking-widest mb-4" style="color:${p};">Entregables</h2>
        <h3 class="text-4xl font-extrabold text-on-surface tracking-tight">Ecosistema de Valor</h3>
      </div>
      <div class="hidden lg:block h-px flex-grow mx-12 bg-outline-variant/30"></div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">${entregablesHtml}</div>
  </section>

  <!-- Impacto Proyectado -->
  <section class="mb-32">
    <h2 class="text-sm font-bold uppercase tracking-widest mb-12 text-center" style="color:${p};">Impacto Proyectado</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-12">${impactHtml}</div>
  </section>

  <!-- Inversión -->
  <section class="mb-32" id="inversion">
    <div class="rounded-[2.5rem] p-1" style="background:linear-gradient(135deg,${p},${s});">
      <div class="bg-surface rounded-[2.3rem] p-12 lg:p-20">
        <div class="flex flex-col lg:flex-row justify-between items-start gap-12">
          <div class="max-w-md">
            <h2 class="text-5xl font-extrabold text-on-surface tracking-tight mb-6">Inversión<br/>Propuesta</h2>
            <p class="text-on-surface-variant leading-relaxed mb-8">${esc(c.enfoqueCreativo?.descripcion || "Esta propuesta incluye todos los ciclos de revisión e implementación técnica.")}</p>
            <div class="flex items-center gap-4">
              <span class="material-symbols-outlined" style="color:${p};">verified_user</span>
              <span class="text-sm font-bold text-on-surface-variant">Garantía de Satisfacción 30 días</span>
            </div>
          </div>
          <div class="w-full lg:w-96 bg-surface-container-low p-10 rounded-[2rem] border border-outline-variant/10 shadow-xl">
            <p class="text-sm font-bold uppercase tracking-widest mb-2" style="color:${p};">Total del Proyecto</p>
            <div class="flex items-baseline gap-2 mb-8">
              <span class="text-5xl font-extrabold text-on-surface tracking-tighter">${esc(c.inversion?.total || "")}</span>
            </div>
            <ul class="space-y-4 mb-10">${incluyeHtml || (c.inversion?.incluye || []).map(it => `<li class="flex items-center justify-between text-sm"><span class="text-on-surface-variant">${esc(it)}</span><span class="font-bold">✓</span></li>`).join("")}</ul>
            <a href="${acceptUrl}" class="block w-full text-white py-5 rounded-2xl font-extrabold text-center shadow-[0_10px_30px_-5px_rgba(129,39,207,0.4)] hover:scale-[1.02] active:scale-95 transition-all" style="background:linear-gradient(135deg,${s},#910056);">
              INICIAR PROYECTO
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Siguientes Pasos -->
  <section class="mb-20 text-center" id="siguientes">
    <h2 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">¿Qué sigue?</h2>
    <div class="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 relative">
      <div class="absolute top-1/2 left-0 w-full h-px bg-outline-variant/20 hidden md:block -z-10"></div>
      ${pasosHtml || `
      <div class="bg-surface p-4 rounded-full border border-outline-variant/30 relative">
        <div class="w-12 h-12 rounded-full flex items-center justify-center font-bold" style="background:${p}22;color:${p};">1</div>
        <p class="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest">Aprobación</p>
      </div>
      <div class="bg-surface p-4 rounded-full border border-outline-variant/30 relative">
        <div class="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">2</div>
        <p class="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest">Kick-off</p>
      </div>
      <div class="bg-surface p-4 rounded-full border border-outline-variant/30 relative">
        <div class="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center font-bold text-on-surface-variant">3</div>
        <p class="absolute top-full left-1/2 -translate-x-1/2 mt-4 whitespace-nowrap text-xs font-bold uppercase tracking-widest">Inmersión</p>
      </div>`}
    </div>
  </section>

  ${termsHtml}

</main>

<!-- Footer -->
<footer class="ml-64 bg-surface-container-lowest py-8 px-16 border-t border-outline-variant/10">
  <div class="flex flex-col md:flex-row justify-between items-center gap-6">
    <p class="text-sm text-on-surface-variant">© ${new Date().getFullYear()} ${esc(brand.agencyName)} · ${clientLabel}</p>
    <p class="text-sm text-on-surface-variant">Propuesta válida hasta: ${fecha}</p>
    <div class="flex gap-8">
      <a class="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors" href="#">TÉRMINOS</a>
      <a class="text-xs font-bold text-on-surface-variant hover:text-primary transition-colors" href="#">PRIVACIDAD</a>
    </div>
  </div>
</footer>
</body>
</html>`;
}
