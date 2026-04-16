"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isAdminEmail } from "./admin";
import type { MetafixArea } from "@/types";

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) throw new Error("No autorizado");
  return { supabase, user };
}

// ─── Knowledge Base ────────────────────────────────────────────────────────────

export async function createKBArticle(data: {
  slug: string;
  title: string;
  area: MetafixArea | "general";
  error_codes: string[];
  tags: string[];
  problem: string;
  cause: string;
  solution: string;
  prevention?: string;
  difficulty: "easy" | "medium" | "hard";
}) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("knowledge_base").insert({ ...data, is_published: false });
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}

export async function toggleKBPublished(id: string, is_published: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("knowledge_base").update({ is_published }).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
  revalidatePath("/dashboard/metafix/knowledge");
}

export async function deleteKBArticle(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}

// ─── Docs ──────────────────────────────────────────────────────────────────────

export async function createGlobalDoc(data: {
  title: string;
  content: string;
  source?: string;
  area?: MetafixArea | "general";
}) {
  const { supabase, user } = await requireAdmin();
  const { error } = await supabase.from("metafix_docs").insert({
    ...data,
    user_id: user.id,
    is_global: true,
  });
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}

export async function deleteDoc(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("metafix_docs").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}

// ─── Tutorials ─────────────────────────────────────────────────────────────────

export async function createTutorialFolder(data: {
  slug: string;
  title: string;
  description?: string;
  area?: MetafixArea | "general";
}) {
  const { supabase } = await requireAdmin();
  const { data: folder, error } = await supabase
    .from("tutorial_folders")
    .insert({ ...data, is_published: false })
    .select()
    .single();
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
  return folder;
}

export async function toggleTutorialPublished(id: string, is_published: boolean) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tutorial_folders").update({ is_published }).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}

export async function deleteTutorialFolder(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tutorial_folders").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}

export async function addTutorialImage(data: {
  folder_id: string;
  file_path: string;
  public_url: string;
  caption?: string;
  step_number: number;
}) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tutorial_images").insert(data);
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}

export async function deleteTutorialImage(id: string) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tutorial_images").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}

export async function reorderTutorialImage(id: string, step_number: number) {
  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("tutorial_images").update({ step_number }).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/metafix/admin");
}
