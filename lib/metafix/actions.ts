"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { MetafixArea, MetafixStatus } from "@/types";

export async function createCase(title: string, area?: MetafixArea) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { data, error } = await supabase
    .from("cases")
    .insert({ user_id: user.id, title, area: area ?? null })
    .select()
    .single();

  if (error) throw error;
  revalidatePath("/dashboard/metafix");
  return data;
}

export async function updateCaseStatus(caseId: string, status: MetafixStatus) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("cases")
    .update({ status })
    .eq("id", caseId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/dashboard/metafix");
  revalidatePath(`/dashboard/metafix/${caseId}`);
}

export async function updateCaseTitle(caseId: string, title: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("cases")
    .update({ title })
    .eq("id", caseId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath(`/dashboard/metafix/${caseId}`);
}

export async function deleteCase(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const { error } = await supabase
    .from("cases")
    .delete()
    .eq("id", caseId)
    .eq("user_id", user.id);

  if (error) throw error;
  revalidatePath("/dashboard/metafix");
}

export async function saveMessage(caseId: string, role: "user" | "assistant", content: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Update case status to in_progress on first user message
  if (role === "user") {
    await supabase
      .from("cases")
      .update({ status: "in_progress" })
      .eq("id", caseId)
      .eq("user_id", user.id)
      .eq("status", "open");
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ case_id: caseId, user_id: user.id, role, content })
    .select()
    .single();

  if (error) throw error;
  return data;
}
