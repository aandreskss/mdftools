import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const { data } = await supabase
    .from("proposals")
    .select("id, client_name, industry, status, created_at, generated_content")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      user_id: user.id,
      client_name: body.clientName ?? "",
      industry: body.clientIndustry ?? "",
      form_data: body.formData ?? {},
      generated_content: body.generatedContent ?? "",
      status: "draft",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await request.json();

  await supabase.from("proposals").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
