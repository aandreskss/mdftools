import { test, expect } from "@playwright/test";

/**
 * Tests de flujos de autenticación.
 * Estos tests NO usan storageState — prueban el flujo de login/logout
 * desde cero, como lo haría un usuario real.
 */

test.describe("Login", () => {
  test("redirige al dashboard con credenciales válidas", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("tu@email.com").fill(process.env.TEST_USER_EMAIL!);
    await page.getByPlaceholder("••••••••").fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: /entrar/i }).click();

    await page.waitForURL("/dashboard", { timeout: 15000 });
    await expect(page).toHaveURL("/dashboard");
  });

  test("muestra error con credenciales inválidas", async ({ page }) => {
    await page.goto("/login");

    await page.getByPlaceholder("tu@email.com").fill("noexiste@test.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: /entrar/i }).click();

    await expect(
      page.getByText(/email o contraseña incorrectos/i)
    ).toBeVisible({ timeout: 5000 });
    await expect(page).toHaveURL("/login");
  });

  test("usuario autenticado en /login redirige al dashboard", async ({ page }) => {
    // Primero autenticamos
    await page.goto("/login");
    await page.getByPlaceholder("tu@email.com").fill(process.env.TEST_USER_EMAIL!);
    await page.getByPlaceholder("••••••••").fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: /entrar/i }).click();
    await page.waitForURL("/dashboard", { timeout: 15000 });

    // Intentar ir a /login estando autenticado debe redirigir al dashboard
    await page.goto("/login");
    await expect(page).toHaveURL("/dashboard");
  });
});

test.describe("Protección de rutas", () => {
  test("usuario no autenticado en /dashboard redirige a /login", async ({ page }) => {
    // Sin storageState = sin sesión
    await page.goto("/dashboard");
    await page.waitForURL("/login", { timeout: 10000 });
    await expect(page).toHaveURL("/login");
  });
});

test.describe("Registro", () => {
  test("valida que las contraseñas coincidan", async ({ page }) => {
    await page.goto("/register");

    await page.getByPlaceholder("tu@email.com").fill("nuevo@test.com");
    await page.getByPlaceholder("Mínimo 6 caracteres").fill("password123");
    await page.getByPlaceholder("••••••••").fill("diferente456");

    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(
      page.getByText(/las contraseñas no coinciden/i)
    ).toBeVisible({ timeout: 3000 });
  });

  test("valida contraseña mínimo 6 caracteres", async ({ page }) => {
    await page.goto("/register");

    await page.getByPlaceholder("tu@email.com").fill("nuevo@test.com");
    await page.getByPlaceholder("Mínimo 6 caracteres").fill("123");
    await page.getByPlaceholder("••••••••").fill("123");

    await page.getByRole("button", { name: /crear cuenta/i }).click();

    await expect(
      page.getByText(/al menos 6 caracteres/i)
    ).toBeVisible({ timeout: 3000 });
  });
});
