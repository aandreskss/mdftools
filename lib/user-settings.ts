import Anthropic from "@anthropic-ai/sdk";
import { SupabaseClient } from "@supabase/supabase-js";

// ─── Available models ─────────────────────────────────────────────────────────

export const CLAUDE_MODELS = [
  {
    id: "claude-haiku-4-5-20251001",
    label: "Haiku 4.5",
    description: "Más rápido y económico",
    badge: "Económico",
    color: "green",
  },
  {
    id: "claude-sonnet-4-6",
    label: "Sonnet 4.6",
    description: "Equilibrio entre calidad y costo",
    badge: "Recomendado",
    color: "indigo",
  },
  {
    id: "claude-opus-4-6",
    label: "Opus 4.6",
    description: "Máxima calidad y razonamiento",
    badge: "Premium",
    color: "purple",
  },
] as const;

export const DEFAULT_MODEL_AGENTS    = "claude-sonnet-4-6";
export const DEFAULT_MODEL_SEO       = "claude-sonnet-4-6";
export const DEFAULT_MODEL_PROPOSALS = "claude-haiku-4-5-20251001";

// ─── Settings interface ───────────────────────────────────────────────────────

export interface UserSettings {
  anthropic: Anthropic;
  modelAgents: string;
  modelSeo: string;
  modelProposals: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export async function getUserSettings(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserSettings> {
  const { data } = await supabase
    .from("brand_profiles")
    .select("anthropic_api_key, model_agents, model_seo, model_proposals")
    .eq("user_id", userId)
    .maybeSingle();

  const apiKey = data?.anthropic_api_key?.trim();
  if (!apiKey) throw new Error("NO_API_KEY");

  return {
    anthropic: new Anthropic({ apiKey }),
    modelAgents:    data?.model_agents    || DEFAULT_MODEL_AGENTS,
    modelSeo:       data?.model_seo       || DEFAULT_MODEL_SEO,
    modelProposals: data?.model_proposals || DEFAULT_MODEL_PROPOSALS,
  };
}

// ─── Shared error response ────────────────────────────────────────────────────

export function noApiKeyResponse() {
  return new Response(
    JSON.stringify({
      error: "NO_API_KEY",
      message: "Configura tu API key de Anthropic en Perfil de Marca para usar esta función.",
    }),
    { status: 402, headers: { "Content-Type": "application/json" } },
  );
}
