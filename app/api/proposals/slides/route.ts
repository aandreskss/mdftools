import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse } from "@/lib/user-settings";
import { renderSlidesHtml } from "@/lib/slides-template";
import type { ProposalContent } from "@/lib/proposal-template";

const JSON_SCHEMA = `{
  "tipoServicio": "string",
  "resumenEjecutivo": "string",
  "problemasDetectados": [{ "titulo": "string", "descripcion": "string" }],
  "solucion": { "descripcion": "string", "puntosClave": ["string"] },
  "entregables": ["string"],
  "proceso": [{ "numero": 1, "titulo": "string", "descripcion": "string" }],
  "resultadosEsperados": ["string"],
  "inversion": { "total": "string", "incluye": ["string"], "terminos": "string" },
  "porQueNosotros": [{ "titulo": "string", "descripcion": "string" }],
  "proximosPasos": ["string"]
}`;

export async function POST(request: Request) {
  const { markdown, clientName, clientCompany, price, structuredContent } = await request.json();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noApiKeyResponse();

  let agencyName = "Nuestra Agencia";
  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("brand_name")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.brand_name) agencyName = profile.brand_name;

  // Si ya recibimos el contenido estructurado, renderizamos directamente
  if (structuredContent) {
    const html = renderSlidesHtml(structuredContent, agencyName, clientName, clientCompany);
    return new Response(html, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Si no, procedemos con la extracción vía IA (retrocompatibilidad)
  let settings;
  try {
    settings = await getUserSettings(supabase, user.id);
  } catch {
    return noApiKeyResponse();
  }

  const prompt = `Extrae el contenido de esta propuesta comercial y devuélvelo SOLO como JSON válido.

PROPUESTA:
${markdown}

DATOS:
- Agencia: ${agencyName}
- Cliente: ${clientName}${clientCompany ? ` (${clientCompany})` : ""}
- Precio: ${price}

El campo "inversion.total" debe usar el precio indicado (${price}).
Mantén los textos breves y directos (para slides de presentación).

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
    const html = renderSlidesHtml(content, agencyName, clientName, clientCompany);

    return new Response(html, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("proposals/slides error:", err, "raw:", rawJson);
    return new Response(
      `<p style="font-family:sans-serif;padding:2rem;color:#dc2626;">
        Error al generar la presentación. Por favor intenta de nuevo.<br>
        <small>${String(err)}</small>
      </p>`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
