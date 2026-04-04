import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const userAgent = request.headers.get("user-agent") ?? "";
  const forwarded = request.headers.get("x-forwarded-for") ?? "";
  const ip = forwarded.split(",")[0].trim();

  // Simple hash for privacy
  const ipHash = ip ? Buffer.from(ip).toString("base64").slice(0, 12) : "";

  // Detect device type
  const device = /mobile|android|iphone|ipad/i.test(userAgent) ? "mobile" : "desktop";

  await supabase.from("proposal_views").insert({
    proposal_id: params.id,
    ip_hash: ipHash,
    device,
    user_agent: userAgent.slice(0, 200),
  });

  return NextResponse.json({ ok: true });
}
