import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const { data } = await supabase
    .from("proposals")
    .select("id, client_name, industry, status, created_at, generated_content, form_data, html_expires_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const proposals = (data ?? []).map(p => ({
    ...p,
    module: p.form_data?.proposalType === "design" ? "Diseño" : "Marketing",
  }));

  return NextResponse.json(proposals);
}

export async function PATCH(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id, status } = await request.json();
  if (!id || !status) return NextResponse.json({ error: "Faltan campos" }, { status: 400 });

  const { error } = await supabase
    .from("proposals")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
