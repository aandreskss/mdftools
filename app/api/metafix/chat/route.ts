import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { METAFIX_SYSTEM_PROMPT } from "@/lib/metafix/anthropic";
import type { Message } from "@/types";

const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 4096;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("No autenticado", { status: 401 });

  const { messages, caseId } = await request.json() as {
    messages: Message[];
    caseId: string;
  };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response("API key no configurada", { status: 500 });

  const anthropic = new Anthropic({ apiKey });

  const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const stream = anthropic.messages.stream({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: METAFIX_SYSTEM_PROMPT,
    messages: apiMessages,
  });

  let fullResponse = "";

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            const text = chunk.delta.text;
            fullResponse += text;
            controller.enqueue(new TextEncoder().encode(text));
          }
        }
        controller.close();

        // Persist assistant message to Supabase after streaming completes
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
