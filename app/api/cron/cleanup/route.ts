import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // Vercel envía este header automáticamente con el valor de CRON_SECRET
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();

  const { error, count } = await supabase
    .from("proposals")
    .update({ html_content: null, html_expires_at: null })
    .lt("html_expires_at", new Date().toISOString())
    .not("html_content", "is", null);

  if (error) {
    console.error("[cron/cleanup] Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`[cron/cleanup] HTML limpiado en ${count ?? 0} propuestas`);
  return NextResponse.json({ ok: true, cleaned: count ?? 0 });
}
