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

export async function sendCaseToKB(caseId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  // Fetch case + messages
  const [caseRes, msgsRes] = await Promise.all([
    supabase.from("cases").select("title, area, status").eq("id", caseId).eq("user_id", user.id).single(),
    supabase.from("messages").select("role, content").eq("case_id", caseId).order("created_at", { ascending: true }),
  ]);

  if (caseRes.error || !caseRes.data) throw new Error("Caso no encontrado");
  if (caseRes.data.status !== "resolved") throw new Error("El caso debe estar resuelto primero");

  const msgs = msgsRes.data ?? [];
  const conversation = msgs
    .map((m) => `${m.role === "user" ? "Usuario" : "MetaFix"}: ${m.content}`)
    .join("\n\n");

  const content = `Caso resuelto: ${caseRes.data.title}\n\n${conversation}`;

  // Check if already saved to KB
  const { data: existing } = await supabase
    .from("metafix_docs")
    .select("id")
    .eq("user_id", user.id)
    .eq("is_global", false)
    .ilike("title", `%${caseRes.data.title}%`)
    .maybeSingle();

  if (existing) return { alreadySaved: true };

  const { error } = await supabase.from("metafix_docs").insert({
    user_id: user.id,
    title: caseRes.data.title,
    content,
    area: caseRes.data.area,
    is_global: false,
    source: "Caso resuelto",
  });

  if (error) throw error;
  return { alreadySaved: false };
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
