import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse, callAIJson } from "@/lib/user-settings";
import { renderDesignProposalHtml, type DesignProposalContent } from "@/lib/design-proposal-template";

const JSON_SCHEMA = `{
  "tipoProyecto": "string",
  "resumenCreativo": "string",
  "entendimientoDelCliente": "string",
  "retosDetectados": [{ "titulo": "string", "descripcion": "string" }],
  "enfoqueCreativo": { "descripcion": "string", "pilares": ["string"] },
  "entregables": ["string"],
  "fases": [{ "numero": 1, "titulo": "string", "descripcion": "string", "duracion": "string" }],
  "resultadosEsperados": ["string"],
  "inversion": { "total": "string", "incluye": ["string"], "terminos": "string" },
  "porQueNosotros": [{ "titulo": "string", "descripcion": "string" }],
  "proximosPasos": ["string"]
}`;

export async function POST(request: Request) {
  const { markdown, clientName, clientCompany, price, structuredContent, proposalId } = await request.json();

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

  // If structured content already available, render directly
  if (structuredContent) {
    const html = renderDesignProposalHtml(structuredContent, agencyName, clientName, clientCompany, proposalId);
    return new Response(html, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Fallback: extract via AI
  let settings;
  try {
    settings = await getUserSettings(supabase, user.id);
  } catch {
    return noApiKeyResponse();
  }

  const prompt = `Extrae el contenido de esta propuesta de diseño y devuélvelo SOLO como JSON válido, sin markdown, sin explicaciones.

PROPUESTA:
${markdown}

DATOS ADICIONALES:
- Agencia: ${agencyName}
- Cliente: ${clientName}${clientCompany ? ` (${clientCompany})` : ""}
- Precio acordado: ${price}

El campo "inversion.total" debe usar el precio indicado (${price}).

${JSON_SCHEMA}

IMPORTANTE: Responde ÚNICAMENTE con el JSON. Sin texto antes ni después.`;

  let rawJson = "";
  try {
    rawJson = (await callAIJson(settings, settings.modelProposals, prompt, 16384)).trim();
    rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

    const content: DesignProposalContent = JSON.parse(rawJson);
    const html = renderDesignProposalHtml(content, agencyName, clientName, clientCompany, proposalId);

    return new Response(html, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (err) {
    console.error("design-proposal/html error:", err, "raw:", rawJson);
    return new Response(
      `<p style="font-family:sans-serif;padding:2rem;color:#dc2626;">
        Error al generar la propuesta. Por favor intenta de nuevo.<br>
        <small>${String(err)}</small>
      </p>`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
