import { createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createServiceClient();

  const { data } = await supabase
    .from("proposals")
    .select("html_content, client_name, html_expires_at")
    .eq("id", params.id)
    .single();

  const expiredHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Propuesta expirada</title>
    <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f0f0f;color:#888;}
    .box{text-align:center;max-width:360px;}.box h1{color:#fff;font-size:1.25rem;margin-bottom:.75rem;}
    .box p{line-height:1.6;font-size:.9rem;}.badge{display:inline-block;margin-bottom:1.5rem;padding:.35rem .9rem;background:#f59e0b22;color:#f59e0b;border-radius:999px;font-size:.75rem;font-weight:600;}
    </style></head><body><div class="box"><div class="badge">⏱ Enlace expirado</div>
    <h1>Esta propuesta ya no está disponible</h1>
    <p>El enlace de vista previa tiene una vigencia de 24 horas.<br>Pide al remitente que genere un nuevo enlace.</p>
    </div></body></html>`;

  if (!data?.html_content) {
    return new NextResponse(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Propuesta no encontrada</title>
      <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#0f0f0f;color:#888;}
      .box{text-align:center;}.box h1{color:#fff;font-size:1.25rem;margin-bottom:.5rem;}
      </style></head><body><div class="box"><h1>Propuesta no disponible</h1><p>Este enlace no tiene contenido generado todavía.</p></div></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } }
    );
  }

  if (data.html_expires_at && new Date(data.html_expires_at) < new Date()) {
    return new NextResponse(expiredHtml, {
      status: 410,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  return new NextResponse(data.html_content, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
