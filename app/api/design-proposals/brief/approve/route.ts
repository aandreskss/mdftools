import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// Public endpoint — called from the client's brief approval page
export async function POST(request: Request) {
  const { token } = await request.json();
  if (!token) return NextResponse.json({ error: "Token requerido" }, { status: 400 });

  const supabase = createServiceClient();

  const { error } = await supabase
    .from("proposals")
    .update({ brief_status: "approved", updated_at: new Date().toISOString() })
    .eq("brief_token", token);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
