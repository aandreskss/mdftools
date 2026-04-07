import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// POST público — cliente sube un archivo relacionado a una pregunta
export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  // Verificar que el brief existe
  const { data: brief } = await supabase
    .from("client_briefs")
    .select("id, status")
    .eq("token", token)
    .single();

  if (!brief) return NextResponse.json({ error: "Brief no encontrado" }, { status: 404 });
  if (brief.status === "submitted") {
    return NextResponse.json({ error: "Este brief ya fue enviado" }, { status: 409 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const questionId = formData.get("questionId") as string | null;

  if (!file || !questionId) {
    return NextResponse.json({ error: "Archivo y questionId requeridos" }, { status: 400 });
  }

  // Límite de 10 MB por archivo
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "El archivo excede el límite de 10 MB" }, { status: 413 });
  }

  const ext = file.name.split(".").pop() ?? "bin";
  const path = `${brief.id}/${questionId}/${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("client-brief-files")
    .upload(path, file, { upsert: false });

  if (uploadErr) return NextResponse.json({ error: uploadErr.message }, { status: 500 });

  const { data: urlData } = supabase.storage
    .from("client-brief-files")
    .getPublicUrl(path);

  return NextResponse.json({
    url: urlData.publicUrl,
    name: file.name,
    size: file.size,
    questionId,
    ok: true,
  });
}
