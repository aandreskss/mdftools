import Anthropic from "@anthropic-ai/sdk";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Returns an Anthropic client using the user's own API key.
 * Throws "NO_API_KEY" if the user has not configured one.
 */
export async function getAnthropicForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<Anthropic> {
  const { data } = await supabase
    .from("brand_profiles")
    .select("anthropic_api_key")
    .eq("user_id", userId)
    .maybeSingle();

  const apiKey = data?.anthropic_api_key?.trim();
  if (!apiKey) throw new Error("NO_API_KEY");

  return new Anthropic({ apiKey });
}

export function noApiKeyResponse() {
  return new Response(
    JSON.stringify({ error: "NO_API_KEY", message: "Configura tu API key de Anthropic en Perfil de Marca para usar esta función." }),
    { status: 402, headers: { "Content-Type": "application/json" } }
  );
}
