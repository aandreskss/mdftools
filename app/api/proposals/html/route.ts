import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse } from "@/lib/user-settings";
import { renderProposalHtml, type ProposalContent } from "@/lib/proposal-template";

const JSON_SCHEMA = `{
  "tipoServicio": "string — tipo de servicio (ej: Gestión de redes sociales)",
  "resumenEjecutivo": "string — 2-3 oraciones que resumen la propuesta",
  "problemasDetectados": [
    { "titulo": "string", "descripcion": "string — 1-2 oraciones" }
  ],
  "solucion": {
    "descripcion": "string — párrafo explicando la solución",
    "puntosClave": ["string", "..."]
  },
  "entregables": ["string", "..."],
  "proceso": [
    { "numero": 1, "titulo": "string", "descripcion": "string" }
  ],
  "resultadosEsperados": ["string", "..."],
  "inversion": {
    "total": "string — ej: USD 2,500 / mes",
    "incluye": ["string", "..."],
    "terminos": "string — condiciones de pago"
  },
  "porQueNosotros": [
    { "titulo": "string", "descripcion": "string" }
  ],
  "proximosPasos": ["string", "..."]
}`;

export async function POST(request: Request) {
  const { markdown, clientName, clientCompany, price } = await request.json();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noApiKeyResponse();

  let settings;
  try {
    settings = await getUserSettings(supabase, user.id);
  } catch {
    return noApiKeyResponse();
  }

  let agencyName = "Nuestra Agencia";
  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("brand_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.brand_name) agencyName = profile.brand_name;

  const prompt = `Extrae el contenido de esta propuesta comercial y devuélvelo SOLO como JSON válido, sin markdown, sin explicaciones.

PROPUESTA:
${markdown}

DATOS ADICIONALES:
- Agencia: ${agencyName}
- Cliente: ${clientName}${clientCompany ? ` (${clientCompany})` : ""}
- Precio acordado: ${price}

Devuelve exactamente este schema JSON con los datos de la propuesta. El campo "inversion.total" debe usar el precio indicado (${price}).

${JSON_SCHEMA}

IMPORTANTE: Responde ÚNICAMENTE con el JSON. Sin texto antes ni después. Sin bloques de código.`;

  let rawJson = "";
  try {
    const msg = await settings.anthropic.messages.create({
      model: settings.modelProposals,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    rawJson = (msg.content[0] as { type: string; text: string }).text.trim();
    rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const content: ProposalContent = JSON.parse(rawJson);
    const html = renderProposalHtml(content, agencyName, clientName, clientCompany);

    return new Response(html, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("proposal/html error:", err, "raw:", rawJson);
    return new Response(
      `<p style="font-family:sans-serif;padding:2rem;color:#dc2626;">
        Error al generar la propuesta. Por favor intenta de nuevo.<br>
        <small>${String(err)}</small>
      </p>`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
