export interface BrandConfig {
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  senderName: string;
  termsConditions: string;
  agencyName: string;
}

export type TemplateId = "dark" | "modern" | "minimal" | "corporate";

export const TEMPLATE_META: Record<TemplateId, { name: string; description: string }> = {
  dark:      { name: "Clásico Oscuro",  description: "Sidebar oscuro premium con acentos de marca" },
  modern:    { name: "Luminary",        description: "Moderno y limpio, hero con cards flotantes" },
  minimal:   { name: "Slate Minimal",   description: "Tipografía editorial, espaciado amplio y refinado" },
  corporate: { name: "Corporate Pro",   description: "Ejecutivo con sidebar, tablas y métricas" },
};
