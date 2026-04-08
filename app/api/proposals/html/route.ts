import { createClient } from "@/lib/supabase/server";
import { getUserSettings, noApiKeyResponse, callAIJson } from "@/lib/user-settings";
import { renderProposalHtml, type ProposalContent } from "@/lib/proposal-template";
import { renderModernTemplate } from "@/lib/proposal-templates/template-modern";
import { renderMinimalTemplate } from "@/lib/proposal-templates/template-minimal";
import { renderCorporateTemplate } from "@/lib/proposal-templates/template-corporate";
import type { BrandConfig, TemplateId } from "@/lib/proposal-templates/types";
import type { DesignProposalContent } from "@/lib/design-proposal-template";

const JSON_SCHEMA_MARKETING = `{
  "tipoServicio": "string — tipo de servicio (ej: Gestión de redes sociales)",
  "resumenEjecutivo": "string — 2-3 oraciones que resumen la propuesta",
  "problemasDetectados": [
    { "titulo": "string", "descripcion": "string — 1-2 oraciones" }
  ],
  "solucion": {
    "descripcion": "string — párrafo explicando la solución",
    "puntosClave": ["string", "..."]
  },
  "entregables": ["string", "..."],
  "proceso": [
    { "numero": 1, "titulo": "string", "descripcion": "string" }
  ],
  "resultadosEsperados": ["string", "..."],
  "inversion": {
    "total": "string — ej: USD 2,500 / mes",
    "incluye": ["string", "..."],
    "terminos": "string — condiciones de pago"
  },
  "porQueNosotros": [
    { "titulo": "string", "descripcion": "string" }
  ],
  "proximosPasos": ["string", "..."]
}`;

const JSON_SCHEMA_DESIGN = `{
  "tipoProyecto": "string",
  "resumenCreativo": "string",
  "entendimientoDelCliente": "string",
  "retosDetectados": [{ "titulo": "string", "descripcion": "string" }],
  "enfoqueCreativo": { "descripcion": "string", "pilares": ["string"] },
  "entregables": ["string"],
  "fases": [{ "numero": 1, "titulo": "string", "descripcion": "string", "duracion": "string" }],
  "resultadosEsperados": ["string"],
  "inversion": { "total": "string", "incluye": ["string"], "terminos": "string" },
  "porQueNosotros": [{ "titulo": "string", "descripcion": "string" }],
  "proximosPasos": ["string"]
}`;

/** Map ProposalContent → DesignProposalContent for new templates */
function mapToDesignContent(c: ProposalContent): DesignProposalContent {
  return {
    tipoProyecto: c.tipoServicio,
    resumenCreativo: c.resumenEjecutivo,
    entendimientoDelCliente: c.solucion?.descripcion || c.resumenEjecutivo,
    retosDetectados: c.problemasDetectados || [],
    enfoqueCreativo: {
      descripcion: c.solucion?.descripcion || "",
      pilares: c.solucion?.puntosClave || [],
    },
    entregables: c.entregables || [],
    fases: (c.proceso || []).map(p => ({
      numero: p.numero,
      titulo: p.titulo,
      descripcion: p.descripcion,
      duracion: "",
    })),
    resultadosEsperados: c.resultadosEsperados || [],
    inversion: c.inversion,
    porQueNosotros: c.porQueNosotros || [],
    proximosPasos: c.proximosPasos || [],
  };
}

export async function POST(request: Request) {
  const { markdown, clientName, clientCompany, price, structuredContent, proposalId, templateId } = await request.json();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return noApiKeyResponse();

  let agencyName = "Nuestra Agencia";
  const { data: profile } = await supabase
    .from("brand_profiles")
    .select("brand_name, logo_url, brand_primary_color, brand_secondary_color, proposal_sender_name, terms_conditions")
    .eq("user_id", user.id)
    .maybeSingle();

  if (profile?.brand_name) agencyName = profile.brand_name;

  const brandConfig: BrandConfig = {
    agencyName,
    primaryColor:    profile?.brand_primary_color   || "#6366F1",
    secondaryColor:  profile?.brand_secondary_color  || "#F43F5E",
    logoUrl:         profile?.logo_url               || "",
    senderName:      profile?.proposal_sender_name   || "",
    termsConditions: profile?.terms_conditions        || "",
  };

  const tid = (templateId as TemplateId) || "dark";
  const isNewTemplate = tid !== "dark"; // dark uses legacy renderProposalHtml

  function renderNewTemplate(content: DesignProposalContent): string {
    switch (tid) {
      case "modern":    return renderModernTemplate(content, brandConfig, clientName, clientCompany, proposalId);
      case "minimal":   return renderMinimalTemplate(content, brandConfig, clientName, clientCompany, proposalId);
      case "corporate": return renderCorporateTemplate(content, brandConfig, clientName, clientCompany, proposalId);
      default:          return renderProposalHtml(content as unknown as ProposalContent, agencyName, clientName, clientCompany, proposalId, brandConfig);
    }
  }

  // If structured content already available, render directly
  if (structuredContent) {
    let html: string;
    if (isNewTemplate) {
      // structuredContent may be ProposalContent (marketing) or DesignProposalContent
      const dc = structuredContent.tipoProyecto
        ? (structuredContent as DesignProposalContent)
        : mapToDesignContent(structuredContent as ProposalContent);
      html = renderNewTemplate(dc);
    } else {
      html = renderProposalHtml(structuredContent, agencyName, clientName, clientCompany, proposalId, brandConfig);
    }
    return new Response(html, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // Fallback: extract via AI
  let settings;
  try {
    settings = await getUserSettings(supabase, user.id);
  } catch {
    return noApiKeyResponse();
  }

  let rawJson = "";
  try {
    if (isNewTemplate) {
      // Extract as DesignProposalContent
      const prompt = `Extrae el contenido de esta propuesta comercial y devuélvelo SOLO como JSON válido, sin markdown, sin explicaciones.

PROPUESTA:
${markdown}

DATOS ADICIONALES:
- Agencia: ${agencyName}
- Cliente: ${clientName}${clientCompany ? ` (${clientCompany})` : ""}
- Precio acordado: ${price}

El campo "inversion.total" debe usar el precio indicado (${price}).

${JSON_SCHEMA_DESIGN}

IMPORTANTE: Responde ÚNICAMENTE con el JSON. Sin texto antes ni después.`;

      rawJson = (await callAIJson(settings, settings.modelProposals, prompt, 16384)).trim();
      rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      const content: DesignProposalContent = JSON.parse(rawJson);
      const html = renderNewTemplate(content);

      return new Response(html, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    } else {
      // Original marketing extraction
      const prompt = `Extrae el contenido de esta propuesta comercial y devuélvelo SOLO como JSON válido, sin markdown, sin explicaciones.

PROPUESTA:
${markdown}

DATOS ADICIONALES:
- Agencia: ${agencyName}
- Cliente: ${clientName}${clientCompany ? ` (${clientCompany})` : ""}
- Precio acordado: ${price}

Devuelve exactamente este schema JSON con los datos de la propuesta. El campo "inversion.total" debe usar el precio indicado (${price}).

${JSON_SCHEMA_MARKETING}

IMPORTANTE: Responde ÚNICAMENTE con el JSON. Sin texto antes ni después. Sin bloques de código.`;

      rawJson = (await callAIJson(settings, settings.modelProposals, prompt, 16384)).trim();
      rawJson = rawJson.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      const content: ProposalContent = JSON.parse(rawJson);
      const html = renderProposalHtml(content, agencyName, clientName, clientCompany, proposalId, brandConfig);

      return new Response(html, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
  } catch (err) {
    console.error("proposal/html error:", err, "raw:", rawJson);
    return new Response(
      `<p style="font-family:sans-serif;padding:2rem;color:#dc2626;">
        Error al generar la propuesta. Por favor intenta de nuevo.<br>
        <small>${String(err)}</small>
      </p>`,
      { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
  }
}
