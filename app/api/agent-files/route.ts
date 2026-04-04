import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const agentType = searchParams.get("agentId");

  const { data } = await supabase
    .from("agent_files")
    .select("id, file_name, file_size, created_at")
    .eq("user_id", user.id)
    .eq("agent_type", agentType)
    .order("created_at", { ascending: false });

  return Response.json({ files: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const agentId = formData.get("agentId") as string;

  if (!file || !agentId) return new Response("Missing file or agentId", { status: 400 });

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  if (file.size > MAX_SIZE) return new Response("File too large (max 5MB)", { status: 413 });

  // Extract text from supported formats
  let extractedText = "";
  const type = file.type;
  if (type === "text/plain" || type === "text/markdown" || file.name.endsWith(".txt") || file.name.endsWith(".md")) {
    extractedText = await file.text();
  } else if (type === "application/json") {
    extractedText = await file.text();
  }
  // For PDFs: would need pdf-parse — shows filename only for now

  // Upload to Supabase Storage
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${user.id}/${agentId}/${Date.now()}_${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from("agent-files")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) return new Response("Upload failed: " + uploadError.message, { status: 500 });

  // Save metadata
  const { data, error } = await supabase.from("agent_files").insert({
    user_id: user.id,
    agent_type: agentId,
    file_name: file.name,
    file_path: filePath,
    file_size: file.size,
    extracted_text: extractedText,
  }).select("id, file_name, file_size, created_at").single();

  if (error) return new Response("DB error: " + error.message, { status: 500 });

  return Response.json({ file: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("id");

  // Get the file path first
  const { data: fileData } = await supabase
    .from("agent_files")
    .select("file_path")
    .eq("id", fileId)
    .eq("user_id", user.id)
    .single();

  if (!fileData) return new Response("Not found", { status: 404 });

  // Delete from storage
  await supabase.storage.from("agent-files").remove([fileData.file_path]);

  // Delete from DB
  await supabase.from("agent_files").delete().eq("id", fileId).eq("user_id", user.id);

  return Response.json({ ok: true });
}
