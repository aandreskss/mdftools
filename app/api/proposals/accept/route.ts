import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Public endpoint — no auth required (called from client's browser via proposal link)
export async function POST(request: Request) {
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("proposals")
    .update({ status: "closed_won" })
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
