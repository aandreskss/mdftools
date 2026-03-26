// Re-export from user-settings for backwards compatibility
export { noApiKeyResponse } from "./user-settings";

import Anthropic from "@anthropic-ai/sdk";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getAnthropicForUser(
  supabase: SupabaseClient,
  userId: string,
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
