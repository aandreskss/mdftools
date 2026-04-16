import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { METAFIX_SYSTEM_PROMPT } from "@/lib/metafix/anthropic";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("No autenticado", { status: 401 });

  const { messages, caseId } = await request.json() as {
    messages: Array<{ role: "user" | "assistant"; content: string | Array<{ type: string; [k: string]: unknown }> }>;
    caseId: string;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response("API key no configurada", { status: 500 });

  // ── Fetch global context in parallel ────────────────────────────────────────
  const [kbRes, docsRes, tutorialsRes, resolvedRes, personalDocsRes] = await Promise.all([
    // Global KB articles
    supabase
      .from("knowledge_base")
      .select("title, area, error_codes, problem, cause, solution")
      .eq("is_published", true)
      .order("view_count", { ascending: false })
      .limit(20),

    // Global docs
    supabase
      .from("metafix_docs")
      .select("title, content, source, area")
      .eq("is_global", true)
      .order("created_at", { ascending: false })
      .limit(10),

    // Published tutorial folders
    supabase
      .from("tutorial_folders")
      .select("slug, title, description, area")
      .eq("is_published", true)
      .order("created_at", { ascending: false }),

    // User's own resolved cases (last 10)
    supabase
      .from("cases")
      .select("title, area, summary")
      .eq("user_id", user.id)
      .eq("status", "resolved")
      .not("summary", "is", null)
      .order("updated_at", { ascending: false })
      .limit(10),

    // User's personal KB docs (from resolved cases they saved)
    supabase
      .from("metafix_docs")
      .select("title, content, area")
      .eq("user_id", user.id)
      .eq("is_global", false)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const kbArticles    = kbRes.data ?? [];
  const globalDocs    = docsRes.data ?? [];
  const tutorials     = tutorialsRes.data ?? [];
  const resolvedCases = resolvedRes.data ?? [];
  const personalDocs  = personalDocsRes.data ?? [];

  // ── Build enriched system prompt ────────────────────────────────────────────
  let systemPrompt = METAFIX_SYSTEM_PROMPT;

  // KB articles context
  if (kbArticles.length > 0) {
    const kbContext = kbArticles.map((a) => {
      const codes = a.error_codes?.length ? ` [${a.error_codes.join(", ")}]` : "";
      return `### ${a.title}${codes}\n**Área:** ${a.area}\n**Problema:** ${a.problem}\n**Causa:** ${a.cause}\n**Solución:** ${a.solution}`;
    }).join("\n\n");
    systemPrompt += `\n\n## BASE DE CONOCIMIENTO GLOBAL\nUsa estos artículos como referencia para diagnosticar y resolver problemas:\n\n${kbContext}`;
  }

  // Global docs context
  if (globalDocs.length > 0) {
    const docsContext = globalDocs.map((d) => {
      const src = d.source ? ` (Fuente: ${d.source})` : "";
      return `### ${d.title}${src}\n${d.content}`;
    }).join("\n\n---\n\n");
    systemPrompt += `\n\n## DOCUMENTACIÓN DE META\n${docsContext}`;
  }

  // Tutorial library
  if (tutorials.length > 0) {
    const tutorialList = tutorials.map((t) =>
      `- **${t.title}** → slug: \`${t.slug}\`${t.description ? ` — ${t.description}` : ""}`
    ).join("\n");
    systemPrompt += `\n\n## TUTORIALES VISUALES DISPONIBLES\nCuando necesites mostrar un paso a paso visual, incluí en tu respuesta exactamente este tag en su propia línea:\n\`[[TUTORIAL:slug-del-tutorial]]\`\n\nTutoriales disponibles:\n${tutorialList}`;
  }

  // User's personal KB docs (casos guardados)
  if (personalDocs.length > 0) {
    const personalContext = personalDocs.map((d) => `### ${d.title}\n${d.content}`).join("\n\n---\n\n");
    systemPrompt += `\n\n## BASE DE CONOCIMIENTO PERSONAL DEL USUARIO\nEstos son casos que este usuario resolvió y guardó como referencia propia:\n\n${personalContext}`;
  }

  // User's resolved cases
  if (resolvedCases.length > 0) {
    const casesContext = resolvedCases
      .filter((c) => c.summary)
      .map((c) => `- **${c.title}**${c.area ? ` (${c.area})` : ""}: ${c.summary}`)
      .join("\n");
    if (casesContext) {
      systemPrompt += `\n\n## HISTORIAL DE CASOS RESUELTOS DEL USUARIO\nEste usuario ya resolvió estos problemas anteriormente — tomalo en cuenta para el contexto:\n${casesContext}`;
    }
  }

  // ── Build API messages ───────────────────────────────────────────────────────
  const apiMessages: Anthropic.MessageParam[] = messages.map((m) => {
    if (typeof m.content === "string") {
      return { role: m.role, content: m.content };
    }
    // Vision content (image + text blocks)
    const blocks: Anthropic.ContentBlockParam[] = m.content.map((block) => {
      if (block.type === "image_url") {
        return {
          type: "image" as const,
          source: { type: "url" as const, url: block.url as string },
        };
      }
      return { type: "text" as const, text: block.text as string };
    });
    return { role: m.role, content: blocks };
  });

  // ── Stream ───────────────────────────────────────────────────────────────────
  const anthropic = new Anthropic({ apiKey });
  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: systemPrompt,
    messages: apiMessages,
  });

  let fullResponse = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            fullResponse += chunk.delta.text;
            controller.enqueue(new TextEncoder().encode(chunk.delta.text));
          }
        }
        controller.close();

        // Persist assistant message
        if (fullResponse && caseId) {
          await supabase
            .from("messages")
            .insert({ case_id: caseId, user_id: user.id, role: "assistant", content: fullResponse });
        }
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readableStream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
