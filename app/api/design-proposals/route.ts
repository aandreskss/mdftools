import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Design proposals are stored in the same `proposals` table,
// identified by form_data->>'proposalType' = 'design'

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);

  const archived = new URL(request.url).searchParams.get("archived") === "true";

  let query = supabase
    .from("proposals")
    .select("id, client_name, industry, status, created_at, generated_content, html_content, form_data, html_expires_at")
    .eq("user_id", user.id)
    .filter("form_data->>proposalType", "eq", "design")
    .order("created_at", { ascending: false });

  query = archived
    ? query.eq("status", "archived")
    : query.neq("status", "archived");

  const { data } = await query;
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();

  const { data, error } = await supabase
    .from("proposals")
    .insert({
      user_id: user.id,
      client_name: body.clientName ?? "",
      industry: body.clientIndustry ?? "",
      form_data: { ...(body.formData ?? {}), proposalType: "design" },
      generated_content: body.generatedContent ?? "",
      html_content: body.htmlContent ?? "",
      status: body.status ?? "draft",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ id: data.id });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { id, ...fields } = body;

  const allowed: Record<string, unknown> = {};
  if ("html_content"      in fields) allowed.html_content      = fields.html_content;
  if ("generated_content" in fields) allowed.generated_content = fields.generated_content;
  if ("status"            in fields) allowed.status            = fields.status;
  if ("client_name"       in fields) allowed.client_name       = fields.client_name;
  if ("industry"          in fields) allowed.industry          = fields.industry;
  if ("form_data"         in fields) allowed.form_data         = { ...fields.form_data, proposalType: "design" };
  if ("html_expires_at"   in fields) allowed.html_expires_at   = fields.html_expires_at;

  if (Object.keys(allowed).length === 0)
    return NextResponse.json({ error: "Nada que actualizar" }, { status: 400 });

  const { error } = await supabase
    .from("proposals")
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await request.json();
  await supabase.from("proposals").delete().eq("id", id).eq("user_id", user.id);

  return NextResponse.json({ ok: true });
}
