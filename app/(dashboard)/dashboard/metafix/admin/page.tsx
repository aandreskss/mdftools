import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/metafix/admin";
import AdminPanel from "@/components/metafix/AdminPanel";
import type { KnowledgeArticle, MetafixDoc, TutorialFolder, TutorialImage } from "@/types";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) redirect("/dashboard/metafix");

  const [kbRes, docsRes, foldersRes] = await Promise.all([
    supabase.from("knowledge_base").select("*").order("created_at", { ascending: false }),
    supabase.from("metafix_docs").select("*").eq("is_global", true).order("created_at", { ascending: false }),
    supabase.from("tutorial_folders").select("*, tutorial_images(*)").order("created_at", { ascending: false }),
  ]);

  const articles = (kbRes.data ?? []) as KnowledgeArticle[];
  const docs     = (docsRes.data ?? []) as MetafixDoc[];
  const folders  = (foldersRes.data ?? []) as (TutorialFolder & { tutorial_images: TutorialImage[] })[];

  return (
    <AdminPanel
      initialArticles={articles}
      initialDocs={docs}
      initialFolders={folders}
    />
  );
}
