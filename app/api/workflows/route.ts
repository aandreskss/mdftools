import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json([]);
  const { data } = await supabase
    .from("workflows")
    .select("id, name, description, nodes, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const body = await request.json();
  const { data, error } = await supabase
    .from("workflows")
    .insert({ user_id: user.id, name: body.name ?? "Nuevo Workflow", description: body.description ?? "", nodes: body.nodes ?? [] })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
