import { describe, it, expect } from "vitest";
import { getSystemPrompt } from "./prompts";
import type { BrandProfile } from "@/types";

const mockProfile: BrandProfile = {
  nombre: "Acme Corp",
  descripcion: "Empresa de software B2B",
  industria: "Tecnología",
  tono: "Profesional y cercano",
  publicoObjetivo: "Startups en crecimiento",
};

const ALL_AGENT_IDS = [
  "social",
  "guiones",
  "blog",
  "seo",
  "anuncios",
  "competencia",
  "emails",
  "hooks",
  "repurposing",
  "calendario",
  "propuestas",
  "seo-suite",
];

describe("getSystemPrompt", () => {
  it("returns a non-empty string for every valid agentId", () => {
    for (const agentId of ALL_AGENT_IDS) {
      expect(getSystemPrompt(agentId, null).length, `agentId: ${agentId}`).toBeGreaterThan(0);
    }
  });

  it("returns the base prompt for an unknown agentId", () => {
    const prompt = getSystemPrompt("unknown-agent", null);
    expect(prompt).toContain("asistente experto en marketing digital");
  });

  it("all prompts include the base marketing assistant text", () => {
    for (const agentId of ALL_AGENT_IDS) {
      expect(getSystemPrompt(agentId, null), `agentId: ${agentId}`).toContain(
        "asistente experto en marketing digital"
      );
    }
  });

  it("each agent has a distinct prompt", () => {
    const prompts = ALL_AGENT_IDS.map((id) => getSystemPrompt(id, null));
    const unique = new Set(prompts);
    expect(unique.size).toBe(ALL_AGENT_IDS.length);
  });

  it("includes brand context when profile is provided", () => {
    const prompt = getSystemPrompt("blog", mockProfile);
    expect(prompt).toContain("Acme Corp");
    expect(prompt).toContain("Empresa de software B2B");
    expect(prompt).toContain("Tecnología");
    expect(prompt).toContain("Profesional y cercano");
    expect(prompt).toContain("Startups en crecimiento");
  });

  it("does not include brand context section when profile is null", () => {
    const prompt = getSystemPrompt("blog", null);
    expect(prompt).not.toContain("Contexto de marca");
  });

  it("does not include brand context when profile.nombre is empty", () => {
    const prompt = getSystemPrompt("blog", { ...mockProfile, nombre: "" });
    expect(prompt).not.toContain("Contexto de marca");
  });

  it("includes optional webUrl when present", () => {
    const prompt = getSystemPrompt("social", { ...mockProfile, webUrl: "https://acme.com" });
    expect(prompt).toContain("https://acme.com");
  });

  it("includes optional diferenciadores when present", () => {
    const prompt = getSystemPrompt("social", { ...mockProfile, diferenciadores: "Único en el mercado" });
    expect(prompt).toContain("Único en el mercado");
  });

  it("omits optional fields when not provided", () => {
    // mockProfile has no webUrl, redesSociales, or diferenciadores
    const prompt = getSystemPrompt("social", mockProfile);
    expect(prompt).not.toContain("**Web:**");
    expect(prompt).not.toContain("**Redes sociales:**");
    expect(prompt).not.toContain("**Diferenciadores clave:**");
  });

  it("brand context appears in prompt for all agents when profile is provided", () => {
    for (const agentId of ALL_AGENT_IDS) {
      const prompt = getSystemPrompt(agentId, mockProfile);
      expect(prompt, `agentId: ${agentId}`).toContain("Acme Corp");
    }
  });
});
