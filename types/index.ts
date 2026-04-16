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
  // Proposal branding
  logoUrl?: string;
  brandPrimaryColor?: string;
  brandSecondaryColor?: string;
  proposalSenderName?: string;
  termsConditions?: string;
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

// ─── MetaFix ──────────────────────────────────────────────────────────────────

export type MetafixArea =
  | "waba"
  | "meta_ads"
  | "catalogs"
  | "business_manager"
  | "pixel"
  | "other";

export type MetafixStatus = "open" | "in_progress" | "resolved";

export interface MetafixCase {
  id: string;
  user_id: string;
  title: string;
  area: MetafixArea | null;
  status: MetafixStatus;
  summary: string | null;
  created_at: string;
  updated_at: string;
}

export interface MetafixMessage {
  id: string;
  case_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  area: MetafixArea | "general";
  error_codes: string[];
  tags: string[];
  problem: string;
  cause: string;
  solution: string;
  prevention: string | null;
  difficulty: "easy" | "medium" | "hard";
  is_published: boolean;
  view_count: number;
  created_at: string;
}

export interface MetafixDoc {
  id: string;
  user_id: string | null;
  title: string;
  content: string;
  source: string | null;
  area: MetafixArea | "general" | null;
  is_global: boolean;
  created_at: string;
}

export interface TutorialFolder {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  area: MetafixArea | "general" | null;
  is_published: boolean;
  created_at: string;
}

export interface TutorialImage {
  id: string;
  folder_id: string;
  file_path: string;
  public_url: string;
  caption: string | null;
  step_number: number;
  created_at: string;
}

export type MetafixContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; url: string };

export interface MetafixClientMessage {
  role: "user" | "assistant";
  content: string | MetafixContentBlock[];
  imageUrl?: string;
}
