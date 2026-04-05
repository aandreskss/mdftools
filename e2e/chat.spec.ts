import { test, expect } from "@playwright/test";

/**
 * Smoke test de streaming del agente de chat.
 * Usa Gemini 2.5 Flash con API key real inyectada por chat.setup.ts.
 * Requiere sesión guardada por auth.setup.ts (storageState).
 */
test.describe("Chat — Smoke test de streaming", () => {
  test("la interfaz de chat carga con textarea visible", async ({ page }) => {
    await page.goto("/dashboard/blog");
    await expect(page.locator("textarea")).toBeVisible({ timeout: 10000 });
  });

  test("envía un mensaje y recibe respuesta del agente", async ({ page }) => {
    await page.goto("/dashboard/blog");

    const textarea = page.locator("textarea");
    await expect(textarea).toBeVisible({ timeout: 10000 });

    await textarea.fill("Responde solo con: OK");
    await textarea.press("Enter");

    // .rounded-tl-sm es exclusivo del bubble de respuesta del asistente
    // (el bubble del usuario usa .rounded-tr-sm)
    const assistantBubble = page.locator(".rounded-tl-sm").last();
    await expect(assistantBubble).toContainText(/\S/, { timeout: 30000 });
  });
});
