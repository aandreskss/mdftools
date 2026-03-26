import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

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
  });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();

  const { error } = await supabase.from("brand_profiles").upsert(
    {
      user_id: user.id,
      brand_name: body.nombre ?? "",
      products_services: body.descripcion ?? "",
      industry: body.industria ?? "",
      tone_of_voice: body.tono ?? "",
      target_audience: body.publicoObjetivo ?? "",
      differentiators: body.diferenciadores ?? "",
      web_url: body.webUrl ?? "",
      social_media: body.redesSociales ?? "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
