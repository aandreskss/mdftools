import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse, callAIJson } from "@/lib/user-settings";

const JSON_SCHEMA = `{
  "tipoProyecto": "string — Título creativo del proyecto (ej: Identidad Visual para Marca de Lujo)",
  "resumenCreativo": "string — 2-3 oraciones que capturan la esencia del proyecto y su impacto esperado",
  "entendimientoDelCliente": "string — Párrafo en primera persona plural que demuestra comprensión del negocio y visión del cliente",
  "retosDetectados": [
    { "titulo": "string — Reto o problema de diseño detectado", "descripcion": "string — Impacto concreto del problema y por qué debe resolverse" }
  ],
  "enfoqueCreativo": {
    "descripcion": "string — Párrafo que describe la dirección visual, conceptual y estratégica del proyecto",
    "pilares": ["string — Pilar creativo o principio de diseño", "..."]
  },
  "entregables": ["string — Entregable específico y concreto", "..."],
  "fases": [
    { "numero": 1, "titulo": "string — Nombre de la fase", "descripcion": "string — Qué se realiza en esta fase", "duracion": "string — Duración estimada" }
  ],
  "resultadosEsperados": ["string — Resultado o impacto esperado concreto", "..."],
  "inversion": {
    "total": "string — Precio total con moneda (ej: USD 3,500)",
    "incluye": ["string — Qué incluye este pago", "..."],
    "terminos": "string — Condiciones y forma de pago"
  },
  "porQueNosotros": [
    { "titulo": "string — Diferenciador clave", "descripcion": "string — Por qué esto importa para este cliente" }
  ],
  "proximosPasos": ["string — Acción inmediata para iniciar el proyecto", "..."]
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

  const designTypes = Array.isArray(form.designType) ? form.designType.join(", ") : (form.designType || "Diseño");

  const prompt = `Actúa como un director creativo senior con 15 años de experiencia en diseño de marca. Genera una propuesta de diseño profesional y altamente persuasiva en formato JSON.

DATOS DEL CLIENTE:
- Nombre: ${form.clientName}
- Empresa: ${form.clientCompany || "N/A"}
- Industria: ${form.clientIndustry}
- Descripción del negocio: ${form.briefDescription || "N/A"}

TIPO DE PROYECTO:
- Servicios: ${designTypes}
- Aplicaciones / Dónde se usará: ${form.applications || "N/A"}

BRIEF CREATIVO:
- Estilo preferido: ${form.stylePreference || "N/A"}
- Paleta de colores: ${form.colorPalette || "N/A"}
- Tipografía: ${form.typographyPreference || "N/A"}
- Referencias visuales: ${form.visualReferences || "N/A"}
- Competidores: ${form.competidores || "N/A"}

ALCANCE DEL PROYECTO:
- Entregables: ${form.deliverables}
- Rondas de revisión: ${form.revisions || "3"}
- Archivos fuente: ${form.sourceFiles ? "Sí, se entregan" : "No incluidos"}
- Derechos de uso: ${form.usageRights || "Digital e Impreso"}
- Duración estimada: ${form.timeline}
- Inversión: ${form.currency} ${form.price}
- Términos: ${form.paymentTerms}

INSTRUCCIONES DE REDACCIÓN:
1. Usa un lenguaje profesional pero cercano, orientado a la creatividad y los resultados de negocio.
2. El resumen creativo debe ser inspirador y mostrar que entiendes la visión del cliente.
3. En 'entendimientoDelCliente', escribe como si ya conocieras profundamente su marca.
4. En 'retosDetectados', identifica problemas reales de diseño basados en su industria y descripción.
5. El 'enfoqueCreativo' debe sentirse como una dirección de arte única y personalizada.
6. Las 'fases' deben reflejar un proceso de diseño profesional (discovery, concepto, diseño, refinamiento, entrega).
7. Los textos deben estar listos para enviar al cliente, sin marcadores de posición.

RESPONDE ÚNICAMENTE CON UN OBJETO JSON SIGUIENDO ESTE SCHEMA:
${JSON_SCHEMA}

IMPORTANTE: Solo el JSON puro. Sin texto antes ni después. Sin bloques de código markdown.`;

  try {
    const aiText = (await callAIJson(settings, settings.modelProposals, prompt, 8192, 0.75)).trim();

    if (!aiText) throw new Error("La IA devolvió una respuesta vacía.");

    let rawJson = aiText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    JSON.parse(rawJson); // validate

    return new Response(rawJson, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Error generating design proposal JSON:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
