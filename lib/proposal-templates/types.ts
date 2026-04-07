export interface BrandConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  senderName: string;
  termsConditions: string;
  agencyName: string;
}

export type TemplateId = "dark" | "data" | "bold" | "elegant";

export const TEMPLATE_META: Record<TemplateId, { name: string; description: string }> = {
  dark:    { name: "Clásico Oscuro",    description: "Diseño oscuro premium con acentos violeta" },
  data:    { name: "Data Analítico",    description: "Estilo corporativo con sidebar y métricas" },
  bold:    { name: "Creativo Bold",     description: "Hero con degradado, dinámico y moderno" },
  elegant: { name: "Elegante Premium",  description: "Hero fotográfico de alto impacto visual" },
};
