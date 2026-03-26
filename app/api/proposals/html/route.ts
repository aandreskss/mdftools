import { anthropic, MODEL } from "@/lib/anthropic";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const { markdown, clientName, clientCompany, price } = await request.json();

  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let agencyName = "Nuestra Agencia";
  if (user) {
    const { data } = await supabase
      .from("brand_profiles")
      .select("brand_name")
      .eq("user_id", user.id)
      .maybeSingle();
    if (data?.brand_name) agencyName = data.brand_name;
  }

  const prompt = `Convierte esta propuesta comercial en un documento HTML completo, autónomo y visualmente impresionante para presentar al cliente.

PROPUESTA A CONVERTIR:
${markdown}

REQUISITOS DEL HTML:
- Documento completo con <!DOCTYPE html>, <head> y <body>
- CSS completamente embebido (sin dependencias externas excepto Google Fonts)
- Usa Google Fonts: @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap')
- Diseño premium y moderno con fondo blanco y acentos en #4F46E5 (indigo)
- Header con el nombre de la agencia "${agencyName}" a la izquierda y "Propuesta para ${clientName}${clientCompany ? ` · ${clientCompany}` : ""}" a la derecha
- Cada sección con su propio card/bloque visual bien separado
- La sección de inversión (precio ${price}) destacada visualmente con un box grande y llamativo
- Lista de entregables con íconos de check (✓) en verde
- Tipografía limpia y legible, espaciado generoso
- Footer con nombre de la agencia y fecha de generación
- Responsive (funciona bien en móvil)
- Colores: fondo #FFFFFF, texto principal #111827, secundario #6B7280, acento #4F46E5, éxito #10B981
- Sombras suaves (box-shadow) en los cards
- IMPORTANTE: Devuelve SOLO el código HTML completo, sin explicaciones, sin markdown, sin bloques de código. Empieza directamente con <!DOCTYPE html>`;

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
