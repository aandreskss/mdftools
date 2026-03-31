import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("proposals")
    .select("html_content, client_name")
    .eq("id", params.id)
    .single();

  if (!data?.html_content) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Propuesta no encontrada</title>
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f0f0f;color:#888;}
      .box{text-align:center;}.box h1{color:#fff;font-size:1.25rem;margin-bottom:.5rem;}
      </style></head><body><div class="box"><h1>Propuesta no disponible</h1><p>Este enlace no tiene contenido generado todavía.</p></div></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  return new NextResponse(data.html_content, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
