import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

// Carga .env.test.local para tests locales
dotenv.config({ path: path.resolve(__dirname, ".env.test.local") });

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // Los tests de auth comparten estado de sesión
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    // Proyecto especial: setup de autenticación (corre primero)
    {
      name: "setup",
      testMatch: /.*auth\.setup\.ts/,
    },
    // Tests del dashboard usando la sesión guardada
    {
      name: "chromium",
      testMatch: /.*dashboard\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    // Tests que NO requieren autenticación (auth flows)
    {
      name: "auth-flows",
      testMatch: /.*auth\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    // Setup que inyecta la API key de Gemini en brand_profiles del usuario de prueba
    {
      name: "chat-setup",
      testMatch: /.*chat\.setup\.ts/,
    },
    // Smoke test de streaming con API real (depende de auth + chat-setup)
    {
      name: "chat",
      testMatch: /.*chat\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup", "chat-setup"],
    },
  ],

  // Levanta el servidor de Next.js automáticamente para tests locales
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
    },
  },
});
