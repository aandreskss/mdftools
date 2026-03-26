import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const agentType = searchParams.get("agentId");

  const { data } = await supabase
    .from("agent_contexts")
    .select("context_text")
    .eq("user_id", user.id)
    .eq("agent_type", agentType)
    .maybeSingle();

  return Response.json({ context: data?.context_text ?? "" });
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { agentId, contextText } = await request.json();

  await supabase.from("agent_contexts").upsert(
    { user_id: user.id, agent_type: agentId, context_text: contextText, updated_at: new Date().toISOString() },
    { onConflict: "user_id,agent_type" }
  );

  return Response.json({ ok: true });
}
