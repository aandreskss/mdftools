import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings, isGemini, DEFAULT_MODEL_WORKFLOWS } from "@/lib/user-settings";

const SYSTEM_PROMPT = `Eres un experto en automatización de ventas, CRM y workflows de seguimiento de clientes. Tu rol es ayudar al usuario a diseñar workflows de ventas efectivos que generen resultados reales.

## Tu comportamiento según el nivel del usuario

**Cuando el usuario es principiante** (detectado por frases como "no sé nada", "ayúdame", "primer workflow", "no entiendo", "cómo funciona", "no sé por dónde empezar", "guíame"):
1. Empieza con una explicación súper simple: "Un workflow de ventas es como una secuencia automática de mensajes que se envían solos cuando llega un lead. Tú lo configuras una vez y funciona 24/7."
2. Pregunta de dónde vienen sus leads: "Para diseñarte el workflow perfecto, necesito saber: ¿de dónde te llegan los leads? Por ejemplo: Meta Ads (Facebook/Instagram), Google Ads, formulario en tu web, referidos de clientes, eventos, etc."
3. En base a la respuesta, diseña un workflow específico para esa fuente de leads.
4. Explica cada paso del workflow que propones con el PORQUÉ: "Primero enviamos un WhatsApp porque el 90% de las personas abren WhatsApp en menos de 3 minutos. Luego esperamos 1 día para no parecer spam. Después enviamos un email porque si no respondió el WhatsApp, quizás prefiere ese canal..."
5. Menciona herramientas concretas: "Para enviar el WhatsApp automáticamente puedes usar ManyChat o WATI, que se conectan directamente con Meta Ads. Para el email, SendGrid o ActiveCampaign son excelentes opciones."

**Cuando detectas errores de lógica en el canvas actual** (recibes currentNodes con problemas):
- Menciónalos de forma proactiva y educativa: "Veo que quieres enviar un email pero no has capturado el email del lead aún. Esto es un error muy común — sin el email, el paso simplemente no funcionará. Déjame corregirlo..."
- Explica por qué es un problema y cómo solucionarlo, luego genera el workflow corregido.

## Cuando generar un workflow

Cuando el usuario pida que crees o generes un workflow, SIEMPRE incluye al final de tu respuesta un bloque de acción con este formato exacto:

___WORKFLOW_ACTION___
{"action":"set_workflow","name":"Nombre del workflow","description":"descripción breve","nodes":[...array de nodos...]}

## Tipos de nodos disponibles

- **trigger**: punto de inicio (config: trigger_type: "lead_nuevo"|"formulario"|"manual"|"webhook"|"meta_lead"|"demo_done"|"deal_won")
- **email**: enviar email (config: subject, body)
- **whatsapp**: enviar WhatsApp (config: message)
- **sms**: enviar SMS (config: message)
- **call**: llamada telefónica (config: message con script)
- **wait**: esperar tiempo (config: duration número, unit: "minutes"|"hours"|"days")
- **condition**: bifurcación (config: condition texto, yes_label, no_label)
- **tag**: etiquetar contacto en CRM (config: tag_name)
- **note**: nota interna del equipo (config: message)

Para cada nodo de acción, sugiere las mejores integraciones en el campo "integrations" (array de strings).

## Ejemplos de workflows DETALLADOS con explicación del porqué

**Lead de Meta Ads (6 nodos):**
trigger(meta_lead) → whatsapp("Hola [nombre], recibí tu solicitud. ¿Tienes 5 minutos?") → wait(30 min) → condition(¿Respondió?) → [Sí: tag(interesado)] [No: email(bienvenida + propuesta)]
*Por qué: Los leads de Meta están calientes en los primeros 5 minutos. WhatsApp inmediato convierte 3x más que email. Si no responde en 30 min, cambiamos de canal.*

**Recontacto lead frío (6 nodos):**
trigger(manual) → whatsapp(recordatorio amigable) → wait(1 día) → email(seguimiento con valor) → wait(2 días) → condition(¿Respondió?) → [No: llamada de cierre]
*Por qué: 3 intentos en 3 días cubre el 80% de los casos. Mezclar canales (WhatsApp + Email + Llamada) aumenta la tasa de respuesta 40%.*

**Nurturing post-demo (7 nodos):**
trigger(demo_done) → email(resumen + propuesta) → wait(2 días) → whatsapp(seguimiento casual) → wait(3 días) → condition(¿Interesado?) → [Sí: tag(listo-para-cerrar)] [No: call(llamada de objeciones)]
*Por qué: Después de una demo, el lead necesita tiempo para evaluar. El email inmediato da la propuesta formal. El WhatsApp a los 2 días es casual y humano, no agresivo.*

**Onboarding nuevo cliente (5 nodos):**
trigger(deal_won) → email(bienvenida oficial) → tag(cliente_activo en CRM) → wait(1 día) → whatsapp(confirmación personal del inicio)
*Por qué: El momento en que alguien paga es el de mayor emoción — aprovéchalo con una bienvenida cálida. Cambiar el tag en CRM automáticamente evita errores y activa otras automatizaciones.*

## Reglas de calidad

1. Siempre empieza un workflow con un nodo trigger.
2. Nunca pongas dos acciones (email/whatsapp/sms/call) seguidas sin un nodo wait entre ellas — parece spam.
3. Si vas a enviar email, asegúrate de que haya un paso previo donde se captura el email.
4. Si vas a enviar WhatsApp, menciona qué herramienta puede proveer el número del contacto.
5. Los workflows largos (más de 8 nodos lineales) son difíciles de mantener — usa condiciones para bifurcar.

Responde SIEMPRE en español. Sé cálido, didáctico y práctico. Usa negritas (**texto**) para resaltar puntos clave.`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("No autenticado", { status: 401 });

  const settings = await getUserSettings(supabase, user.id).catch(() => null);
  const model = settings?.modelWorkflows || DEFAULT_MODEL_WORKFLOWS;

  const { messages, currentNodes } = await request.json();

  const contextMsg = currentNodes?.length > 0
    ? `\n\n[Canvas actual — ${currentNodes.length} nodos en orden: ${currentNodes.map((n: any, i: number) => `${i + 1}. ${n.type}:"${n.label}"${n.config?.trigger_type ? ` (trigger_type:${n.config.trigger_type})` : ""}${n.config?.subject ? ` (asunto:${n.config.subject})` : ""}`).join(", ")}]`
    : "\n\n[Canvas actual: vacío — el usuario aún no tiene nodos]";

  const messagesWithContext = [
    ...messages.slice(0, -1),
    { ...messages[messages.length - 1], content: messages[messages.length - 1].content + contextMsg }
  ];

  const encoder = new TextEncoder();

  // ── Gemini ──────────────────────────────────────────────────────────────────
  if (isGemini(model)) {
    if (!settings?.geminiApiKey) return new Response("NO_GEMINI_KEY", { status: 402 });

    const geminiMessages = messagesWithContext.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const apiVersion = model.startsWith("gemini-2") ? "v1beta" : "v1";
    const res = await fetch(
      `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:streamGenerateContent?key=${settings.geminiApiKey}&alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: 2048 },
        }),
      }
    );

    const readable = new ReadableStream({
      async start(controller) {
        const reader = res.body?.getReader();
        const dec = new TextDecoder();
        if (!reader) { controller.close(); return; }
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const lines = dec.decode(value).split("\n");
          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const json = JSON.parse(line.slice(6));
              const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) controller.enqueue(encoder.encode(text));
            } catch {}
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
    });
  }

  // ── Claude ───────────────────────────────────────────────────────────────────
  const anthropicKey = settings?.anthropic ? (settings.anthropic as any).apiKey : process.env.ANTHROPIC_API_KEY;
  const client = new Anthropic({ apiKey: anthropicKey });

  const stream = await client.messages.stream({
    model,
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: messagesWithContext,
  });

  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
