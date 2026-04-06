import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ views: [], total: 0 });

  // Verify proposal belongs to user
  const { data: proposal } = await supabase
    .from("proposals")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!proposal) return NextResponse.json({ views: [], total: 0 });

  const { data: views } = await supabase
    .from("proposal_views")
    .select("viewed_at, device, ip_hash")
    .eq("proposal_id", id)
    .order("viewed_at", { ascending: false })
    .limit(20);

  return NextResponse.json({
    views: views ?? [],
    total: views?.length ?? 0,
    lastViewed: views?.[0]?.viewed_at ?? null,
  });
}
