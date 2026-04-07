import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET público — cliente obtiene las preguntas del brief
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("client_briefs")
    .select("id, client_name, project_name, questions, status")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Brief no encontrado o enlace inválido" }, { status: 404 });
  }

  return NextResponse.json(data);
}
