import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

// GET — listar todos los briefs del usuario
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const archived = new URL(request.url).searchParams.get("archived") === "true";

  let briefQuery = supabase
    .from("client_briefs")
    .select("id, client_name, client_email, project_name, token, status, submitted_at, proposal_id, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  briefQuery = archived
    ? briefQuery.eq("status", "archived")
    : briefQuery.neq("status", "archived");

  const { data, error } = await briefQuery;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST — crear nuevo brief de exploración
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { client_name, client_email, project_name, questions } = body;

  if (!client_name?.trim()) {
    return NextResponse.json({ error: "Nombre del cliente requerido" }, { status: 400 });
  }
  if (!questions?.length) {
    return NextResponse.json({ error: "Debes seleccionar al menos una pregunta" }, { status: 400 });
  }

  const token = randomUUID();

  const { data, error } = await supabase
    .from("client_briefs")
    .insert({
      user_id: user.id,
      client_name: client_name.trim(),
      client_email: client_email?.trim() ?? "",
      project_name: project_name?.trim() ?? "",
      token,
      questions,
      status: "pending",
    })
    .select("id, token")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id, token: data.token, ok: true });
}
