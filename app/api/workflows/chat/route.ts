import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getUserSettings, isGemini, DEFAULT_MODEL_WORKFLOWS } from "@/lib/user-settings";

const SYSTEM_PROMPT = `Eres un experto en automatización de ventas, CRM y workflows de seguimiento de clientes. Tu rol es ayudar al usuario a diseñar workflows de ventas efectivos.

Puedes hacer dos cosas:
1. Dar recomendaciones y explicaciones sobre cómo estructurar un workflow
2. Generar automáticamente un workflow agregando nodos al canvas

Cuando el usuario pida que crees o generes un workflow, SIEMPRE incluye al final de tu respuesta un bloque de acción con este formato exacto:

___WORKFLOW_ACTION___
{"action":"set_workflow","name":"Nombre","description":"descripción breve","nodes":[...array de nodos...]}

Tipos de nodos disponibles:
- trigger: punto de inicio (label: "Lead nuevo", "Formulario enviado", "Manual", etc.)
- email: enviar email (config: subject, body)
- whatsapp: enviar WhatsApp (config: message)
- sms: enviar SMS (config: message)
- call: llamada telefónica (config: message con script)
- wait: esperar tiempo (config: duration, unit: "hours"|"days"|"minutes")
- condition: bifurcación con condición (config: condition, yes_label, no_label)
- tag: etiquetar contacto (config: tag_name)
- note: nota interna (config: message)

Para cada nodo de acción, sugiere las mejores integraciones en el campo "integrations" (array de strings con nombres de herramientas como "SendGrid", "Mailchimp", "Twilio", "ManyChat", "HubSpot", etc.)

Ejemplos de workflows comunes:
- Recontacto 3 días: trigger → email bienvenida → wait 1 día → whatsapp → wait 2 días → condition (respondió?) → email seguimiento o llamada
- Nurturing post-demo: trigger → email propuesta → wait 2 días → whatsapp → wait 3 días → condición → cierre o discard
- Onboarding nuevo cliente: trigger → email bienvenida → tag cliente → wait 1 día → whatsapp confirmación → email recursos

Responde SIEMPRE en español. Sé conciso y práctico.`;

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("No autenticado", { status: 401 });

  const settings = await getUserSettings(supabase, user.id).catch(() => null);
  const model = settings?.modelWorkflows || DEFAULT_MODEL_WORKFLOWS;

  const { messages, currentNodes } = await request.json();

  const contextMsg = currentNodes?.length > 0
    ? `\n\n[Canvas actual: ${currentNodes.length} nodos: ${currentNodes.map((n: any) => n.type + ":" + n.label).join(", ")}]`
    : "\n\n[Canvas actual: vacío]";

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
