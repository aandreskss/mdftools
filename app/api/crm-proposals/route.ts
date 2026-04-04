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

  const ids = (data ?? []).map(p => p.id);
  let viewsMap: Record<string, { total: number; lastViewed: string | null }> = {};

  if (ids.length > 0) {
    const { data: views } = await supabase
      .from("proposal_views")
      .select("proposal_id, viewed_at")
      .in("proposal_id", ids)
      .order("viewed_at", { ascending: false });

    for (const v of views ?? []) {
      if (!viewsMap[v.proposal_id]) viewsMap[v.proposal_id] = { total: 0, lastViewed: null };
      viewsMap[v.proposal_id].total++;
      if (!viewsMap[v.proposal_id].lastViewed) viewsMap[v.proposal_id].lastViewed = v.viewed_at;
    }
  }

  const proposals = (data ?? []).map(p => ({
    ...p,
    module: p.form_data?.proposalType === "design" ? "Diseño"
          : p.form_data?.proposalType === "sales"  ? "Ventas"
          : "Marketing",
    views: viewsMap[p.id] ?? { total: 0, lastViewed: null },
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
