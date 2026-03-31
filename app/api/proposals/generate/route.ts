import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse, callAIJson } from "@/lib/user-settings";

const JSON_SCHEMA = `{
  "tipoServicio": "string — Título profesional de la propuesta",
  "resumenEjecutivo": "string — Párrafo persuasivo de 3-4 oraciones que resuma el valor",
  "problemasDetectados": [
    { "titulo": "string — Título corto del problema", "descripcion": "string — Explicación detallada del impacto negativo" }
  ],
  "solucion": {
    "descripcion": "string — Párrafo que describe nuestra metodología y solución",
    "puntosClave": ["string — Beneficio clave 1", "string — Beneficio clave 2", "..."]
  },
  "entregables": ["string — Entregable específico", "..."],
  "proceso": [
    { "numero": 1, "titulo": "string — Nombre de la fase", "descripcion": "string — Qué se hace en esta fase" }
  ],
  "resultadosEsperados": ["string — KPI o resultado concreto esperado", "..."],
  "inversion": {
    "total": "string — El precio final con moneda (ej: USD 1,500/mes)",
    "incluye": ["string — Lo que incluye este pago", "..."],
    "terminos": "string — Condiciones y plazos de pago"
  },
  "porQueNosotros": [
    { "titulo": "string — Diferenciador", "descripcion": "string — Por qué nos hace mejores" }
  ],
  "proximosPasos": ["string — Acción inmediata 1", "string — Acción inmediata 2"]
}`;

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noApiKeyResponse();

  let settings;
  try {
    settings = await getUserSettings(supabase, user.id);
  } catch {
    return noApiKeyResponse();
  }

  const body = await request.json();
  const { form } = body;

  let agencyName = "Nuestra Agencia";
  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("brand_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.brand_name) agencyName = profile.brand_name;

  // Construcción de contexto para el prompt
  const scopeLabels = (form.serviceScope ?? []).join(", ") || form.serviceType || "Marketing digital";
  const diagnostico = [
    form.problemasDetectados,
    form.problemaRedesSociales,
    form.problemaWebLanding,
    form.debilidadesDetectadas
  ].filter(Boolean).join(". ");

  const prompt = `Actúa como un experto en ventas y copywriting. Genera una propuesta comercial profesional y altamente persuasiva en formato JSON.

DATOS DEL CLIENTE:
- Nombre: ${form.clientName}
- Empresa: ${form.clientCompany}
- Industria: ${form.clientIndustry}
- Objetivos: ${form.clientGoals}
- Situación Actual: ${form.currentSituation}

DETALLES DEL SERVICIO:
- Alcance: ${scopeLabels}
- Descripción: ${form.serviceDescription}
- Entregables: ${form.deliverables}
- Duración: ${form.duration}
- Inversión: ${form.currency} ${form.price}
- Términos: ${form.paymentTerms}

CONTEXTO ADICIONAL:
- Diagnóstico: ${diagnostico}
- Buyer Persona: ${form.buyerPersona}
- Dolores: ${form.doloresFuncionales}, ${form.doloresEmocionales}

INSTRUCCIONES DE REDACCIÓN:
1. El tono debe ser profesional, empático y orientado a resultados.
2. Personaliza cada sección mencionando los objetivos específicos del cliente.
3. En 'problemasDetectados', usa el diagnóstico para resaltar la urgencia.
4. En 'solucion', explica CÓMO resolverás sus dolores específicos.
5. Los textos deben ser listos para enviar, sin marcadores de posición.

RESPONDE ÚNICAMENTE CON UN OBJETO JSON QUE SIGA ESTE ESQUEMA:
${JSON_SCHEMA}

IMPORTANTE: No incluyas explicaciones, ni bloques de código markdown, solo el objeto JSON puro.`;

  try {
    const aiText = (await callAIJson(settings, settings.modelProposals, prompt, 4000, 0.7)).trim();

    if (!aiText) throw new Error("La IA devolvió una respuesta vacía. Puede ser un filtro de seguridad o cuota agotada.");

    let rawJson = aiText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    JSON.parse(rawJson); // valida que sea JSON válido

    return new Response(rawJson, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error generating proposal JSON:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
