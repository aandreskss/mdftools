import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse, callAIJson } from "@/lib/user-settings";
import { NextResponse } from "next/server";

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

  const { proposal } = await request.json();
  if (!proposal) return NextResponse.json({ error: "Propuesta requerida" }, { status: 400 });

  const prompt = `Eres un experto en diseño y gestión de proyectos creativos.

PROPUESTA ACEPTADA:
${JSON.stringify(proposal, null, 2)}

Genera un brief de kickoff estructurado con:

1. RESUMEN EJECUTIVO (2-3 párrafos)
   - Qué se va a diseñar
   - Para quién
   - Propósito principal

2. OBJETIVOS PRINCIPALES (3-5 objetivos)
   - Específicos y medibles
   - Alineados con la propuesta

3. MÉTRICAS DE ÉXITO (2-4 métricas)
   - KPIs claros
   - Cómo se medirá el éxito

4. AUDIENCIA OBJETIVO
   - Descripción demográfica
   - Comportamientos clave
   - Preferencias de diseño

5. KEYWORDS DE ESTILO (5-8 palabras)
   - Adjetivos que describen el estilo visual esperado

6. ASSETS REQUERIDOS DEL CLIENTE
   - Lista de lo que el cliente debe proveer
   - Formatos esperados
   - Fechas sugeridas (relativas a hoy: ${new Date().toISOString().split("T")[0]})

Responde SOLO con JSON válido:
{
  "projectSummary": "string",
  "mainObjectives": ["string"],
  "successMetrics": ["string"],
  "targetAudience": "string",
  "styleKeywords": ["string"],
  "requiredAssets": [
    {
      "name": "string",
      "description": "string",
      "format": "string",
      "deadline": "YYYY-MM-DD"
    }
  ]
}`;

  try {
    let raw = (await callAIJson(settings, settings.modelProposals, prompt, 4096, 0.7)).trim();
    raw = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
