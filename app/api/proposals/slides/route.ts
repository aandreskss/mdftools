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

  const prompt = `Genera una presentación completa en Reveal.js basada en esta propuesta comercial.

PROPUESTA:
${markdown}

DATOS:
- Agencia: ${agencyName}
- Cliente: ${clientName}${clientCompany ? ` · ${clientCompany}` : ""}
- Inversión: ${price}

REQUISITOS TÉCNICOS:
- Documento HTML completo y autónomo (<!DOCTYPE html>)
- Usa Reveal.js 4.6.0 desde CDN: https://cdn.jsdelivr.net/npm/reveal.js@4.6.0/dist/
- Google Fonts: Inter (weights 300, 400, 600, 700, 800)
- SOLO devuelve el HTML, sin explicaciones, sin markdown wrappers

DISEÑO:
- Fondo oscuro: #0A0F1E (casi negro azulado)
- Acento principal: #6366F1 (indigo)
- Acento secundario: #10B981 (verde esmeralda)
- Texto: #F1F5F9
- Texto secundario: #94A3B8
- Fuente: Inter
- Estilo: premium, moderno, minimalista

SLIDES A GENERAR (8-10 slides):
1. PORTADA — Título grande con nombre del cliente, subtítulo con tipo de servicio, logo/nombre de la agencia abajo, fecha
2. EL PROBLEMA — Diagnóstico visual: problemas detectados presentados como pain points con íconos o bullets impactantes
3. NUESTRA SOLUCIÓN — Qué ofrecemos, enfoque y metodología en puntos clave
4. ENTREGABLES — Lista visual de qué recibirá el cliente, con checkmarks verdes
5. PROCESO / CÓMO TRABAJAMOS — Pasos del proceso (si hay metodología en la propuesta)
6. RESULTADOS ESPERADOS — Qué logrará el cliente, métricas o beneficios
7. INVERSIÓN — Slide de precio: número grande y destacado, términos de pago, qué incluye
8. POR QUÉ NOSOTROS — Diferenciadores y fortalezas en formato visual
9. PRÓXIMOS PASOS — Call to action claro con pasos concretos para cerrar

CSS REQUERIDO (embed en <style>):
- .reveal .slides section { padding: 40px 60px; }
- Slide de portada con gradiente de fondo especial
- Slide de inversión con el precio en fuente grande (4-5rem) color acento
- Bullets con animación fragment (appear)
- Números/stats grandes y llamativos
- Cards con border-radius y sutil border
- Transición: fade entre slides
- Progress bar visible

IMPORTANTE:
- Usa <section data-background-color> para variar el fondo sutilmente en slides clave
- La slide de inversión debe tener data-background-color="#0D1117" con el precio muy grande
- Agrega speaker notes con <aside class="notes"> donde aplique
- Devuelve SOLO el HTML completo empezando con <!DOCTYPE html>`;

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: 4096,
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
