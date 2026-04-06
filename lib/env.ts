import { z } from "zod";

/**
 * Valida las variables de entorno requeridas al iniciar la aplicación.
 * Si falta alguna variable crítica, el proceso falla inmediatamente con
 * un mensaje claro en lugar de fallar silenciosamente en runtime.
 *
 * Importar este módulo en next.config.js garantiza que el build falle
 * antes de que llegue a producción con configuración incompleta.
 */

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL debe ser una URL válida"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY es requerida"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY es requerida")
    .optional(), // Opcional en entornos de test donde no se usan rutas públicas
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const missing = parsed.error.issues
    .map((e) => `  - ${e.path.join(".")}: ${e.message}`)
    .join("\n");

  throw new Error(
    `\n\n❌ Variables de entorno faltantes o inválidas:\n${missing}\n\n` +
      `Crea un archivo .env.local con las variables requeridas.\n` +
      `Ver README.md para referencia completa.\n`
  );
}

export const env = parsed.data;
