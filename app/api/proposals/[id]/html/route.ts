import { createClient } from "@/lib/supabase/server";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("No autenticado", { status: 401 });

  const { data } = await supabase
    .from("proposals")
    .select("html_content")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!data?.html_content) return new Response("No encontrado", { status: 404 });

  return new Response(data.html_content as string, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
