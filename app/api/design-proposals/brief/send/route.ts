import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  // Verify ownership
  const { data: proposal } = await supabase
    .from("proposals")
    .select("id, brief_token, brief_status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) return NextResponse.json({ error: "Propuesta no encontrada" }, { status: 404 });

  // Reuse existing token if already sent/approved
  const token = proposal.brief_token ?? randomUUID();

  const { error } = await supabase
    .from("proposals")
    .update({
      brief_token: token,
      brief_status: proposal.brief_status === "approved" ? "approved" : "sent",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ token, ok: true });
}
