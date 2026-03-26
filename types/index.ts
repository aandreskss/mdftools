export interface BrandProfile {
  nombre: string;
  descripcion: string;
  industria: string;
  tono: string;
  publicoObjetivo: string;
  webUrl?: string;
  redesSociales?: string;
  diferenciadores?: string;
  updatedAt?: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}

export type AgentId =
  | "social"
  | "guiones"
  | "blog"
  | "seo"
  | "anuncios"
  | "competencia"
  | "emails"
  | "hooks"
  | "repurposing"
  | "calendario"
  | "propuestas"
  | "seo-suite";
