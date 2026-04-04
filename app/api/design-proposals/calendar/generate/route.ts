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

  const { proposal, brief, projectDuration } = await request.json();
  if (!proposal || !brief) return NextResponse.json({ error: "Propuesta y brief requeridos" }, { status: 400 });

  const duration = projectDuration ?? 30;

  const prompt = `Eres un experto en planificación de proyectos de diseño.

PROPUESTA:
${JSON.stringify(proposal, null, 2)}

BRIEF:
${JSON.stringify(brief, null, 2)}

DURACIÓN DEL PROYECTO: ${duration} días
FECHA DE INICIO SUGERIDA: ${new Date().toISOString().split("T")[0]}

Genera un calendario de proyecto realista con:

1. MILESTONES CLAVE (4-6 hitos)
   - Nombres descriptivos
   - Fechas calculadas proporcionalmente desde hoy
   - Entregables específicos por milestone
   - Status inicial: "pending"

2. RONDAS DE REVISIÓN (2-3 rondas típicamente)
   - Espaciadas estratégicamente
   - Duración realista (2-5 días por ronda)
   - Después de milestones importantes

3. ENTREGABLES FINALES
   - Lista completa de archivos/formatos que se entregarán

REGLAS:
- Primera ronda de revisión: 30% del timeline
- Segunda ronda: 60-70% del timeline
- Dejar buffer de 10-15% antes de entrega final
- Milestones distribuidos proporcionalmente

Responde SOLO con JSON válido:
{
  "projectStartDate": "YYYY-MM-DD",
  "projectEndDate": "YYYY-MM-DD",
  "milestones": [
    {
      "name": "string",
      "description": "string",
      "date": "YYYY-MM-DD",
      "deliverables": ["string"],
      "status": "pending"
    }
  ],
  "revisionRounds": [
    {
      "roundNumber": 1,
      "date": "YYYY-MM-DD",
      "durationDays": 3,
      "status": "pending"
    }
  ],
  "finalDeliveryDate": "YYYY-MM-DD",
  "finalDeliverables": ["string"]
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
