import { describe, it, expect, vi, afterEach } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  isGemini,
  noApiKeyResponse,
  getUserSettings,
  callAIJson,
  DEFAULT_MODEL_AGENTS,
  DEFAULT_MODEL_SEO,
  DEFAULT_MODEL_PROPOSALS,
  DEFAULT_MODEL_WORKFLOWS,
} from "./user-settings";
import type { UserSettings } from "./user-settings";

// Mock Anthropic SDK: new Anthropic() devuelve un objeto vacío (clase, no función)
vi.mock("@anthropic-ai/sdk", () => ({
  default: class MockAnthropic {
    constructor(_opts: unknown) {}
  },
}));

// Helper: construye un mock de SupabaseClient que devuelve `data` en el query chain
function mockSupabase(data: Record<string, unknown> | null) {
  return {
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data }),
        }),
      }),
    }),
  } as unknown as SupabaseClient;
}

// ─── isGemini ────────────────────────────────────────────────────────────────

describe("isGemini", () => {
  it("returns true for gemini models", () => {
    expect(isGemini("gemini-2.5-flash")).toBe(true);
    expect(isGemini("gemini-2.5-pro")).toBe(true);
    expect(isGemini("gemini-1.5-pro")).toBe(true);
    expect(isGemini("gemini-pro")).toBe(true);
  });

  it("returns false for claude models", () => {
    expect(isGemini("claude-sonnet-4-6")).toBe(false);
    expect(isGemini("claude-haiku-4-5-20251001")).toBe(false);
    expect(isGemini("claude-opus-4-6")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isGemini("")).toBe(false);
  });
});

// ─── noApiKeyResponse ─────────────────────────────────────────────────────────

describe("noApiKeyResponse", () => {
  it("returns status 402", () => {
    expect(noApiKeyResponse().status).toBe(402);
  });

  it("returns application/json content-type", () => {
    expect(noApiKeyResponse().headers.get("Content-Type")).toBe("application/json");
  });

  it("body has error NO_API_KEY and a message", async () => {
    const body = await noApiKeyResponse().json();
    expect(body.error).toBe("NO_API_KEY");
    expect(typeof body.message).toBe("string");
    expect(body.message.length).toBeGreaterThan(0);
  });
});

// ─── getUserSettings ──────────────────────────────────────────────────────────

describe("getUserSettings", () => {
  it("throws NO_API_KEY when both keys are empty strings", async () => {
    const supabase = mockSupabase({ anthropic_api_key: "", gemini_api_key: "" });
    await expect(getUserSettings(supabase, "user-1")).rejects.toThrow("NO_API_KEY");
  });

  it("throws NO_API_KEY when profile row is null", async () => {
    const supabase = mockSupabase(null);
    await expect(getUserSettings(supabase, "user-1")).rejects.toThrow("NO_API_KEY");
  });

  it("throws NO_API_KEY when keys are whitespace-only", async () => {
    const supabase = mockSupabase({ anthropic_api_key: "   ", gemini_api_key: "  " });
    await expect(getUserSettings(supabase, "user-1")).rejects.toThrow("NO_API_KEY");
  });

  it("returns geminiApiKey when only Gemini key exists", async () => {
    const supabase = mockSupabase({ gemini_api_key: "gkey", anthropic_api_key: "" });
    const s = await getUserSettings(supabase, "user-1");
    expect(s.geminiApiKey).toBe("gkey");
    expect(s.anthropic).toBeUndefined();
  });

  it("returns anthropic client when only Anthropic key exists", async () => {
    const supabase = mockSupabase({ anthropic_api_key: "sk-ant-test", gemini_api_key: "" });
    const s = await getUserSettings(supabase, "user-1");
    expect(s.anthropic).toBeDefined();
    expect(s.geminiApiKey).toBeUndefined();
  });

  it("trims whitespace from API keys", async () => {
    const supabase = mockSupabase({ gemini_api_key: "  trimmed  ", anthropic_api_key: "" });
    const s = await getUserSettings(supabase, "user-1");
    expect(s.geminiApiKey).toBe("trimmed");
  });

  it("falls back to DEFAULT_MODEL_* when database values are null", async () => {
    const supabase = mockSupabase({
      gemini_api_key: "key",
      model_agents: null,
      model_seo: null,
      model_proposals: null,
      model_workflows: null,
    });
    const s = await getUserSettings(supabase, "user-1");
    expect(s.modelAgents).toBe(DEFAULT_MODEL_AGENTS);
    expect(s.modelSeo).toBe(DEFAULT_MODEL_SEO);
    expect(s.modelProposals).toBe(DEFAULT_MODEL_PROPOSALS);
    expect(s.modelWorkflows).toBe(DEFAULT_MODEL_WORKFLOWS);
  });

  it("uses database model values when provided", async () => {
    const supabase = mockSupabase({
      gemini_api_key: "key",
      model_agents: "gemini-2.5-flash",
      model_seo: "gemini-2.5-pro",
      model_proposals: "gemini-2.5-flash",
      model_workflows: "gemini-2.5-pro",
    });
    const s = await getUserSettings(supabase, "user-1");
    expect(s.modelAgents).toBe("gemini-2.5-flash");
    expect(s.modelSeo).toBe("gemini-2.5-pro");
    expect(s.modelProposals).toBe("gemini-2.5-flash");
    expect(s.modelWorkflows).toBe("gemini-2.5-pro");
  });
});

// ─── callAIJson ───────────────────────────────────────────────────────────────

describe("callAIJson", () => {
  const baseGeminiSettings: UserSettings = {
    geminiApiKey: "test-gemini-key",
    modelAgents: "gemini-2.5-flash",
    modelSeo: "gemini-2.5-flash",
    modelProposals: "gemini-2.5-flash",
    modelWorkflows: "gemini-2.5-flash",
  };

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("throws NO_GEMINI_KEY when gemini model but no key in settings", async () => {
    const settings: UserSettings = { ...baseGeminiSettings, geminiApiKey: undefined };
    await expect(callAIJson(settings, "gemini-2.5-flash", "test", 100)).rejects.toThrow("NO_GEMINI_KEY");
  });

  it("throws NO_ANTHROPIC_KEY when claude model but no anthropic client", async () => {
    const settings: UserSettings = {
      modelAgents: "claude-sonnet-4-6",
      modelSeo: "claude-sonnet-4-6",
      modelProposals: "claude-haiku-4-5-20251001",
      modelWorkflows: "claude-sonnet-4-6",
    };
    await expect(callAIJson(settings, "claude-sonnet-4-6", "test", 100)).rejects.toThrow("NO_ANTHROPIC_KEY");
  });

  it("calls Gemini API and returns the text response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve({
            candidates: [{ content: { parts: [{ text: "Hola desde Gemini" }] } }],
          }),
      })
    );

    const result = await callAIJson(baseGeminiSettings, "gemini-2.5-flash", "Saluda", 100);
    expect(result).toBe("Hola desde Gemini");
  });

  it("uses v1beta endpoint for gemini-2.5 models", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          candidates: [{ content: { parts: [{ text: "ok" }] } }],
        }),
    });
    vi.stubGlobal("fetch", fetchMock);

    await callAIJson(baseGeminiSettings, "gemini-2.5-flash", "test", 100);
    expect((fetchMock.mock.calls[0] as [string])[0]).toContain("v1beta");
  });

  it("throws on Gemini API error response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        text: () => Promise.resolve("Rate limit"),
      })
    );

    await expect(callAIJson(baseGeminiSettings, "gemini-2.5-flash", "test", 100)).rejects.toThrow(
      "Gemini API error 429"
    );
  });

  it("calls Anthropic SDK and returns the text response", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "Hola desde Claude" }],
    });
    const settings: UserSettings = {
      anthropic: { messages: { create: mockCreate } } as unknown as UserSettings["anthropic"],
      modelAgents: "claude-sonnet-4-6",
      modelSeo: "claude-sonnet-4-6",
      modelProposals: "claude-haiku-4-5-20251001",
      modelWorkflows: "claude-sonnet-4-6",
    };

    const result = await callAIJson(settings, "claude-sonnet-4-6", "Saluda", 100);
    expect(result).toBe("Hola desde Claude");
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it("passes temperature to Anthropic when provided", async () => {
    const mockCreate = vi.fn().mockResolvedValue({
      content: [{ type: "text", text: "ok" }],
    });
    const settings: UserSettings = {
      anthropic: { messages: { create: mockCreate } } as unknown as UserSettings["anthropic"],
      modelAgents: "claude-sonnet-4-6",
      modelSeo: "claude-sonnet-4-6",
      modelProposals: "claude-haiku-4-5-20251001",
      modelWorkflows: "claude-sonnet-4-6",
    };

    await callAIJson(settings, "claude-sonnet-4-6", "test", 100, 0.5);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ temperature: 0.5 })
    );
  });
});
