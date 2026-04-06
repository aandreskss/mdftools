import { test, expect } from "@playwright/test";

/**
 * Tests del dashboard.
 * Usan storageState (sesión guardada por auth.setup.ts),
 * así no necesitan hacer login en cada test.
 */

test.describe("Dashboard", () => {
  test("carga la página principal sin errores", async ({ page }) => {
    await page.goto("/dashboard");

    await expect(page).toHaveURL("/dashboard");
    // El sidebar debe estar visible
    await expect(page.locator("nav, aside, [data-testid='sidebar']").first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("no muestra errores de JavaScript en consola", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    expect(errors).toHaveLength(0);
  });

  test("rutas del dashboard cargan sin errores 500", async ({ page }) => {
    const routes = [
      "/dashboard",
      "/dashboard/blog",
      "/dashboard/propuestas",
    ];

    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status(), `Ruta ${route} falló`).toBeLessThan(500);
    }
  });
});
