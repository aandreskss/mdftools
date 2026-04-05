import { test as setup } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

/**
 * Inyecta la API key de Gemini en brand_profiles del usuario de prueba.
 * Corre antes de los tests de chat (proyecto "chat-setup" en playwright.config.ts).
 */
setup("configurar API key de Gemini para usuario de prueba", async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;
  const geminiKey = process.env.TEST_GEMINI_API_KEY;

  if (!supabaseUrl || !supabaseAnonKey || !email || !password || !geminiKey) {
    throw new Error(
      "Faltan variables de entorno: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, " +
        "TEST_USER_EMAIL, TEST_USER_PASSWORD, TEST_GEMINI_API_KEY"
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) throw new Error(`Login fallido: ${signInError.message}`);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No se pudo obtener el usuario autenticado");

  const { error: upsertError } = await supabase
    .from("brand_profiles")
    .upsert(
      {
        user_id: user.id,
        gemini_api_key: geminiKey,
        model_agents: "gemini-2.5-flash",
      },
      { onConflict: "user_id" }
    );

  if (upsertError) throw new Error(`Error al guardar API key: ${upsertError.message}`);
});
