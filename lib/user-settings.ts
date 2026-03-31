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
    provider: "anthropic" as const,
  },
  {
    id: "claude-sonnet-4-6",
    label: "Sonnet 4.6",
    description: "Equilibrio calidad-costo",
    badge: "Recomendado",
    color: "indigo",
    provider: "anthropic" as const,
  },
  {
    id: "claude-opus-4-6",
    label: "Opus 4.6",
    description: "Máxima calidad",
    badge: "Premium",
    color: "purple",
    provider: "anthropic" as const,
  },
] as const;

export const GEMINI_MODELS = [
  {
    id: "gemini-2.0-flash-lite",
    label: "Flash Lite",
    description: "Ultra económico y rápido",
    badge: "Más barato",
    color: "teal",
    provider: "gemini" as const,
  },
  {
    id: "gemini-2.0-flash",
    label: "Flash 2.0",
    description: "Rápido, económico y capaz",
    badge: "Económico",
    color: "blue",
    provider: "gemini" as const,
  },
  {
    id: "gemini-2.5-pro",
    label: "Pro 2.5",
    description: "Máxima calidad de Google",
    badge: "Premium",
    color: "orange",
    provider: "gemini" as const,
  },
] as const;

export const DEFAULT_MODEL_AGENTS    = "claude-sonnet-4-6";
export const DEFAULT_MODEL_SEO       = "claude-sonnet-4-6";
export const DEFAULT_MODEL_PROPOSALS = "claude-haiku-4-5-20251001";

// ─── Settings interface ───────────────────────────────────────────────────────

export interface UserSettings {
  anthropic?: Anthropic;
  geminiApiKey?: string;
  modelAgents: string;
  modelSeo: string;
  modelProposals: string;
}

// ─── Provider detection ───────────────────────────────────────────────────────

export function isGemini(model: string): boolean {
  return model.startsWith("gemini");
}

// ─── Unified non-streaming AI call ───────────────────────────────────────────
// Used by proposals/generate, proposals/html, proposals/slides

export async function callAIJson(
  settings: UserSettings,
  model: string,
  prompt: string,
  maxTokens: number,
  temperature?: number,
): Promise<string> {
  if (isGemini(model)) {
    if (!settings.geminiApiKey) throw new Error("NO_GEMINI_KEY");

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${settings.geminiApiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            ...(temperature !== undefined ? { temperature } : {}),
          },
        }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  }

  // Anthropic
  if (!settings.anthropic) throw new Error("NO_ANTHROPIC_KEY");
  const msg = await settings.anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    ...(temperature !== undefined ? { temperature } : {}),
    messages: [{ role: "user", content: prompt }],
  });
  return (msg.content[0] as { type: string; text: string }).text;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export async function getUserSettings(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserSettings> {
  const { data } = await supabase
    .from("brand_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const anthropicKey = data?.anthropic_api_key?.trim();
  const geminiKey    = data?.gemini_api_key?.trim();

  if (!anthropicKey && !geminiKey) throw new Error("NO_API_KEY");

  return {
    anthropic:    anthropicKey ? new Anthropic({ apiKey: anthropicKey }) : undefined,
    geminiApiKey: geminiKey    || undefined,
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
      message: "Configura tu API key de Anthropic o Google Gemini en Perfil de Marca para usar esta función.",
    }),
    { status: 402, headers: { "Content-Type": "application/json" } },
  );
}
