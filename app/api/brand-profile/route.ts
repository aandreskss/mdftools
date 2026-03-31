import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { DEFAULT_MODEL_AGENTS, DEFAULT_MODEL_SEO, DEFAULT_MODEL_PROPOSALS } from "@/lib/user-settings";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json(null);

  const { data } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return NextResponse.json(null);

  return NextResponse.json({
    nombre: data.brand_name,
    descripcion: data.products_services,
    industria: data.industry,
    tono: data.tone_of_voice,
    publicoObjetivo: data.target_audience,
    diferenciadores: data.differentiators,
    webUrl: data.web_url,
    redesSociales: data.social_media,
    updatedAt: data.updated_at,
    // API keys — never expose the actual values, only booleans
    hasApiKey:    !!(data.anthropic_api_key?.trim()),
    hasGeminiKey: !!(data.gemini_api_key?.trim()),
    // Model preferences
    modelAgents:    data.model_agents    || DEFAULT_MODEL_AGENTS,
    modelSeo:       data.model_seo       || DEFAULT_MODEL_SEO,
    modelProposals: data.model_proposals || DEFAULT_MODEL_PROPOSALS,
  });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();

  const upsertData: Record<string, unknown> = {
    user_id: user.id,
    brand_name:        body.nombre          ?? "",
    products_services: body.descripcion     ?? "",
    industry:          body.industria       ?? "",
    tone_of_voice:     body.tono            ?? "",
    target_audience:   body.publicoObjetivo ?? "",
    differentiators:   body.diferenciadores ?? "",
    web_url:           body.webUrl          ?? "",
    social_media:      body.redesSociales   ?? "",
    updated_at:        new Date().toISOString(),
  };

  // Only update API keys if user explicitly sent new ones
  if (body.anthropicApiKey?.trim()) upsertData.anthropic_api_key = body.anthropicApiKey.trim();
  if (body.geminiApiKey?.trim())    upsertData.gemini_api_key    = body.geminiApiKey.trim();

  // Model preferences — only update if provided
  if (body.modelAgents)    upsertData.model_agents    = body.modelAgents;
  if (body.modelSeo)       upsertData.model_seo       = body.modelSeo;
  if (body.modelProposals) upsertData.model_proposals = body.modelProposals;

  const { error } = await supabase.from("brand_profiles").upsert(
    upsertData,
    { onConflict: "user_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
