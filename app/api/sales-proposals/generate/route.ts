import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse, callAIJson } from "@/lib/user-settings";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noApiKeyResponse();

  let settings;
  try { settings = await getUserSettings(supabase, user.id); }
  catch { return noApiKeyResponse(); }

  const body = await request.json();
  const { form } = body;

  let agencyName = "Nuestra Empresa";
  const { data: profile } = await supabase.from("brand_profiles").select("brand_name").eq("user_id", user.id).maybeSingle();
  if (profile?.brand_name) agencyName = profile.brand_name;

  const JSON_SCHEMA = `{
  "tipoSolucion": "string — Título de la propuesta de ventas",
  "resumenEjecutivo": "string — 3-4 oraciones sobre el valor que entregas",
  "diagnostico": [
    { "titulo": "string — Problema identificado", "descripcion": "string — Impacto del problema" }
  ],
  "solucion": {
    "descripcion": "string — Cómo resuelves el problema de ventas",
    "puntosClave": ["string — Beneficio clave 1", "..."]
  },
  "metodologia": [
    { "numero": 1, "titulo": "string — Fase", "descripcion": "string — Qué incluye" }
  ],
  "entregables": ["string — Entregable específico", "..."],
  "kpis": ["string — Métrica que mejoraremos", "..."],
  "roi": {
    "proyeccion": "string — Proyección de ROI (si aplica)",
    "supuestos": ["string — Supuesto 1", "..."]
  },
  "inversion": {
    "total": "string — Precio con moneda",
    "incluye": ["string — Qué incluye", "..."],
    "terminos": "string — Condiciones de pago"
  },
  "porQueNosotros": [
    { "titulo": "string — Diferenciador", "descripcion": "string" }
  ],
  "proximosPasos": ["string — Acción 1", "..."]
}`;

  const prompt = `Eres un experto en estrategia comercial y ventas B2B. Genera una propuesta de solución de ventas altamente persuasiva en JSON.

CLIENTE:
- Nombre: ${form.clientName}
- Empresa: ${form.clientCompany}
- Industria: ${form.clientIndustry}

DIAGNÓSTICO DE VENTAS:
- Tipo de solución: ${form.salesSolutionType}
- Herramientas actuales: ${form.currentTools}
- Equipo de ventas: ${form.salesTeamSize} personas
- Volumen mensual: ${form.monthlyVolume}
- Métricas actuales: ${form.currentMetrics}
- Principales problemas: ${form.painPoints}
- Urgencia de implementación: ${form.implementationUrgency}

PROPUESTA:
- Entregables: ${form.deliverables}
- Inversión: ${form.currency} ${form.price}
- Términos: ${form.paymentTerms}
- Incluir proyección de ROI: ${form.includeProjections ? "Sí" : "No"}

INSTRUCCIONES:
1. Usa los datos del diagnóstico para personalizar cada sección.
2. Si includeProjections=true, calcula un ROI realista basado en el equipo y volumen.
3. Los problemas en 'diagnostico' deben resonar con los pain_points del cliente.
4. Tono: consultivo, orientado a resultados, profesional.
5. Textos listos para enviar, sin placeholders.

AGENCIA: ${agencyName}

RESPONDE SOLO JSON:
${JSON_SCHEMA}`;

  try {
    const aiText = (await callAIJson(settings, settings.modelProposals, prompt, 8192, 0.7)).trim();
    if (!aiText) throw new Error("Respuesta vacía de la IA");
    const rawJson = aiText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    JSON.parse(rawJson);
    return new Response(rawJson, { headers: { "Content-Type": "application/json; charset=utf-8" } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
