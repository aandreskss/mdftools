import Anthropic from "@anthropic-ai/sdk";
import { getUserSettings, noApiKeyResponse, isGemini } from "@/lib/user-settings";
import { getSystemPrompt } from "@/lib/prompts";
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/types";

const MAX_TOKENS_DEFAULT  = 2048;
const MAX_TOKENS_PROPOSALS = 14000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { messages, agentId, agentContext } = await request.json() as {
    messages: Message[];
    agentId: string;
    agentContext?: string;
  };

  let brandProfile = null;
  let brainContext = "";
  let filesContext = "";
  let adLibraryContext = "";
  let adImageUrls: string[] = [];

  if (!user) return noApiKeyResponse();

  // Get user settings (Anthropic client + preferred models)
  let settings: Awaited<ReturnType<typeof getUserSettings>>;
  try {
    settings = await getUserSettings(supabase, user.id);
  } catch {
    return noApiKeyResponse();
  }
  if (user) {
    const baseQueries = Promise.all([
      supabase.from("brand_profiles").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("agent_contexts").select("context_text").eq("user_id", user.id).eq("agent_type", agentId).maybeSingle(),
      supabase.from("agent_files").select("file_name, extracted_text").eq("user_id", user.id).eq("agent_type", agentId),
    ]);

    // For anuncios: load full ad library (metadata + image URLs for vision)
    const adQuery = agentId === "anuncios"
      ? supabase.from("ad_library").select("platform, tags, notes, file_type, file_path").eq("user_id", user.id).order("created_at", { ascending: false }).limit(100)
      : Promise.resolve({ data: null });

    const [[profileRes, contextRes, filesRes], adRes] = await Promise.all([baseQueries, adQuery]);

    if (profileRes.data) {
      brandProfile = {
        nombre: profileRes.data.brand_name,
        descripcion: profileRes.data.products_services,
        industria: profileRes.data.industry,
        tono: profileRes.data.tone_of_voice,
        publicoObjetivo: profileRes.data.target_audience,
        diferenciadores: profileRes.data.differentiators,
        webUrl: profileRes.data.web_url,
        redesSociales: profileRes.data.social_media,
      };
    }

    if (contextRes.data?.context_text) {
      brainContext = contextRes.data.context_text;
    }

    if (filesRes.data?.length) {
      const withContent = filesRes.data.filter((f: { extracted_text?: string }) => f.extracted_text?.trim());
      if (withContent.length > 0) {
        filesContext = withContent
          .map((f: { file_name: string; extracted_text: string }) => `### Documento: ${f.file_name}\n${f.extracted_text}`)
          .join("\n\n---\n\n");
      }
    }

    if (adRes.data?.length) {
      type AdRow = { platform: string; tags: string[]; notes: string; file_type: string; file_path: string };
      const ads = adRes.data as AdRow[];

      // Text summary for system prompt (all ads, including videos)
      const lines = ads.map((a) => {
        const parts = [`[${a.file_type === "image" ? "Imagen" : "Video"}] ${a.platform}`];
        if (a.tags?.length) parts.push(`tags: ${a.tags.join(", ")}`);
        if (a.notes?.trim()) parts.push(`nota: "${a.notes.trim()}"`);
        return `- ${parts.join(" | ")}`;
      });
      adLibraryContext = `## Biblioteca de anuncios del usuario\nEl usuario tiene ${ads.length} anuncios guardados como referencia:\n${lines.join("\n")}\n\nCuando generes copy o estrategias, alinéate con los patrones de plataforma, estilo y categoría que el usuario ya ha identificado como referencias.`;

      // Vision: get signed URLs for images (max 12 most recent) — only on first message
      if (messages.length === 1) {
        const imageAds = ads.filter((a) => a.file_type === "image").slice(0, 12);
        if (imageAds.length > 0) {
          const signed = await Promise.all(
            imageAds.map(async (ad) => {
              const { data } = await supabase.storage.from("ad-library").createSignedUrl(ad.file_path, 3600);
              return data?.signedUrl ?? null;
            })
          );
          adImageUrls = signed.filter((u): u is string => u !== null);
        }
      }
    }
  }

  // Build system prompt
  let systemPrompt = getSystemPrompt(agentId, brandProfile);

  if (brainContext.trim()) {
    systemPrompt += `\n\n## Instrucciones permanentes para este agente\n${brainContext}`;
  }
  if (filesContext) {
    systemPrompt += `\n\n## Base de conocimiento (documentos del usuario)\n${filesContext}`;
  }
  if (adLibraryContext) {
    systemPrompt += `\n\n${adLibraryContext}`;
  }
  if (agentContext?.trim()) {
    systemPrompt += `\n\n## Configuración de esta sesión\n${agentContext}`;
  }

  // Build final messages array — inject ad images visually on conversation start
  let apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  if (adImageUrls.length > 0) {
    // Prepend a synthetic vision context as the first exchange
    const imageBlocks: Anthropic.ImageBlockParam[] = adImageUrls.map((url) => ({
      type: "image",
      source: { type: "url", url },
    }));

    apiMessages = [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Esta es mi biblioteca de anuncios de referencia (${adImageUrls.length} imágenes). Analízalos visualmente — estilos de diseño, estructura del copy, formatos, recursos visuales, tonos — para entender qué tipo de creatividades prefiero:`,
          },
          ...imageBlocks,
        ],
      },
      {
        role: "assistant",
        content: `He analizado los ${adImageUrls.length} anuncios de tu biblioteca. Puedo ver claramente los estilos visuales, formatos, estructuras de copy y tipos de creatividades que usas como referencia. Aplicaré estos patrones para que mis recomendaciones estén alineadas con lo que ya sabes que funciona en tu contexto.`,
      },
      ...apiMessages,
    ];
  }

  const model     = agentId === "seo" || agentId === "seo-suite"
    ? settings.modelSeo
    : settings.modelAgents;
  const maxTokens = agentId === "propuestas"
    ? MAX_TOKENS_PROPOSALS
    : MAX_TOKENS_DEFAULT;

  // ── Gemini streaming ──────────────────────────────────────────────────────
  if (isGemini(model)) {
    if (!settings.geminiApiKey) return noApiKeyResponse();

    // Convert Anthropic message format → Gemini format (text-only, skip image blocks)
    const geminiMessages = apiMessages
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{
          text: typeof m.content === "string"
            ? m.content
            : (m.content as Anthropic.ContentBlockParam[])
                .filter((b): b is Anthropic.TextBlockParam => b.type === "text")
                .map((b) => b.text)
                .join("\n"),
        }],
      }))
      .filter((m) => m.parts[0].text.trim());

    const chatApiVersion = model.startsWith("gemini-2") ? "v1beta" : "v1";
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/${chatApiVersion}/models/${model}:streamGenerateContent?key=${settings.geminiApiKey}&alt=sse`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: geminiMessages,
          generationConfig: { maxOutputTokens: maxTokens },
        }),
      }
    );

    if (!geminiRes.ok || !geminiRes.body) return noApiKeyResponse();

    const readableStream = new ReadableStream({
      async start(controller) {
        const reader = geminiRes.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n");
            buffer = lines.pop() ?? "";
            for (const line of lines) {
              if (!line.startsWith("data: ")) continue;
              const raw = line.slice(6).trim();
              if (!raw || raw === "[DONE]") continue;
              try {
                const chunk = JSON.parse(raw);
                const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text) controller.enqueue(new TextEncoder().encode(text));
              } catch { /* skip malformed SSE chunk */ }
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

  // ── Anthropic streaming ───────────────────────────────────────────────────
  if (!settings.anthropic) return noApiKeyResponse();
  const anthropic = settings.anthropic;

  const stream = anthropic.messages.stream({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: apiMessages,
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
