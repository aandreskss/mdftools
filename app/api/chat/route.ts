import Anthropic from "@anthropic-ai/sdk";
import { MODEL, MAX_TOKENS } from "@/lib/anthropic";
import { getAnthropicForUser, noApiKeyResponse } from "@/lib/get-anthropic";
import { getSystemPrompt } from "@/lib/prompts";
import { createClient } from "@/lib/supabase/server";
import type { Message } from "@/types";

export async function POST(request: Request) {
  const supabase = createClient();
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

  // Get Anthropic client using the user's own API key
  let anthropic: Anthropic;
  try {
    anthropic = await getAnthropicForUser(supabase, user.id);
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

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
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
