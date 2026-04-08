import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST público — cliente envía sus respuestas
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = createServiceClient();

  // Verificar que el brief existe y aún está pendiente
  const { data: brief, error: fetchErr } = await supabase
    .from("client_briefs")
    .select("id, status")
    .eq("token", token)
    .single();

  if (fetchErr || !brief) {
    return NextResponse.json({ error: "Brief no encontrado" }, { status: 404 });
  }

  if (brief.status === "submitted") {
    return NextResponse.json({ error: "Este brief ya fue enviado anteriormente" }, { status: 409 });
  }

  const body = await request.json();
  const { responses, files } = body;

  if (!responses || typeof responses !== "object") {
    return NextResponse.json({ error: "Respuestas inválidas" }, { status: 400 });
  }

  const { error } = await supabase
    .from("client_briefs")
    .update({
      responses,
      files: files ?? [],
      status: "submitted",
      submitted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", brief.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
