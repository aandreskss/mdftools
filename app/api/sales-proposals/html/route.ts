import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse, callAIJson } from "@/lib/user-settings";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noApiKeyResponse();

  let settings;
  try { settings = await getUserSettings(supabase, user.id); }
  catch { return noApiKeyResponse(); }

  const { markdown, clientName, clientCompany, proposalId } = await request.json();

  let agencyName = "Nuestra Empresa";
  const { data: profile } = await supabase.from("brand_profiles").select("brand_name").eq("user_id", user.id).maybeSingle();
  if (profile?.brand_name) agencyName = profile.brand_name;

  const prompt = `Convierte esta propuesta de ventas en HTML profesional completo, moderno y listo para enviar al cliente.

PROPUESTA:
${markdown}

AGENCIA: ${agencyName}
CLIENTE: ${clientName}${clientCompany ? ` (${clientCompany})` : ""}
PROPOSAL_ID: ${proposalId}

REQUISITOS DEL HTML:
1. HTML completo con <!DOCTYPE html>, <head> con estilos CSS inline y <body>
2. Diseño oscuro/premium (fondo #0f172a o similar, acentos amber #f59e0b para ventas)
3. Secciones: hero, diagnóstico, solución, metodología, entregables, inversión, próximos pasos
4. Un botón flotante class="floating-cta" con texto "Aceptar Propuesta"
5. Responsive, fuentes de Google Fonts
6. Completamente autónomo (sin dependencias externas excepto fonts)
7. NO incluyas bloques de código markdown, solo el HTML puro

RESPONDE ÚNICAMENTE CON EL HTML COMPLETO.`;

  try {
    const html = (await callAIJson(settings, settings.modelProposals, prompt, 16384)).trim();
    const cleanHtml = html.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "").trim();

    // Set expiry 24h
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    if (proposalId) {
      const supa = await createClient();
      await supa.from("proposals").update({ html_content: cleanHtml, html_expires_at: expiresAt, updated_at: new Date().toISOString() }).eq("id", proposalId);
    }

    return new Response(cleanHtml, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
  } catch (err) {
    return new Response(`<p style="padding:2rem;color:red;">Error: ${String(err)}</p>`, { headers: { "Content-Type": "text/plain" } });
  }
}
