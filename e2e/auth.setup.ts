import { test as setup, expect } from "@playwright/test";
import path from "path";

const authFile = path.join(__dirname, ".auth/user.json");

/**
 * Este setup corre una vez antes de todos los tests que usan storageState.
 * Hace login con el usuario de prueba y guarda las cookies/tokens
 * para que los demás tests no necesiten hacer login cada vez.
 */
setup("autenticar usuario de prueba", async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "TEST_USER_EMAIL y TEST_USER_PASSWORD son requeridos. " +
        "Configúralos en .env.test.local o como secrets de GitHub Actions."
    );
  }

  await page.goto("/login");
  await page.getByPlaceholder("tu@email.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: /entrar/i }).click();

  // Espera a que el login sea exitoso y redirija al dashboard
  await page.waitForURL("/dashboard", { timeout: 15000 });
  await expect(page).toHaveURL("/dashboard");

  // Guarda el estado de autenticación para reutilizar en los demás tests
  await page.context().storageState({ path: authFile });
});
