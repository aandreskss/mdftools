import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET — ver un brief con sus respuestas (admin)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { data, error } = await supabase
    .from("client_briefs")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) return NextResponse.json({ error: "Brief no encontrado" }, { status: 404 });
  return NextResponse.json(data);
}

// PATCH — vincular a una propuesta o actualizar
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const allowed: Record<string, unknown> = {};
  if (body.proposal_id !== undefined) allowed.proposal_id = body.proposal_id;
  if (body.status      !== undefined) allowed.status      = body.status;

  const { error } = await supabase
    .from("client_briefs")
    .update({ ...allowed, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
