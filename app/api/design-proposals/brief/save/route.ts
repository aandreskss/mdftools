import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const body = await request.json();
  const { id, brief_data, calendar_data, brief_status } = body;
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (brief_data   !== undefined) update.brief_data    = brief_data;
  if (calendar_data !== undefined) update.calendar_data = calendar_data;
  if (brief_status  !== undefined) update.brief_status  = brief_status;

  const { error } = await supabase
    .from("proposals")
    .update(update)
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
