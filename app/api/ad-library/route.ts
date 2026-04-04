import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);

  // Lightweight count for button badge
  if (searchParams.get("count") === "true") {
    const { count } = await supabase
      .from("ad_library")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);
    return Response.json({ count: count ?? 0 });
  }

  const { data: ads } = await supabase
    .from("ad_library")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!ads?.length) return Response.json({ ads: [] });

  // Generate signed URLs (1h expiry — enough for a session)
  const adsWithUrls = await Promise.all(
    ads.map(async (ad) => {
      const { data: signed } = await supabase.storage
        .from("ad-library")
        .createSignedUrl(ad.file_path, 3600);
      return { ...ad, url: signed?.signedUrl ?? "" };
    })
  );

  return Response.json({ ads: adsWithUrls });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  const platform = (formData.get("platform") as string) ?? "Otro";
  const tags = JSON.parse((formData.get("tags") as string) ?? "[]") as string[];
  const notes = (formData.get("notes") as string) ?? "";

  if (!file) return new Response("Missing file", { status: 400 });

  const MAX_SIZE = 100 * 1024 * 1024; // 100MB for videos
  if (file.size > MAX_SIZE) return new Response("File too large (max 100MB)", { status: 413 });

  const fileType = file.type.startsWith("image/") ? "image" : "video";
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${user.id}/${Date.now()}_${sanitizedName}`;

  const { error: uploadError } = await supabase.storage
    .from("ad-library")
    .upload(filePath, file, { contentType: file.type, upsert: false });

  if (uploadError) return new Response("Upload failed: " + uploadError.message, { status: 500 });

  const { data: signed } = await supabase.storage
    .from("ad-library")
    .createSignedUrl(filePath, 3600);

  const { data, error } = await supabase
    .from("ad_library")
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_type: fileType,
      file_size: file.size,
      platform,
      tags,
      notes,
    })
    .select("*")
    .single();

  if (error) return new Response("DB error: " + error.message, { status: 500 });

  return Response.json({ ad: { ...data, url: signed?.signedUrl ?? "" } });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const adId = searchParams.get("id");

  const { data: adData } = await supabase
    .from("ad_library")
    .select("file_path")
    .eq("id", adId)
    .eq("user_id", user.id)
    .single();

  if (!adData) return new Response("Not found", { status: 404 });

  await supabase.storage.from("ad-library").remove([adData.file_path]);
  await supabase.from("ad_library").delete().eq("id", adId).eq("user_id", user.id);

  return Response.json({ ok: true });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { searchParams } = new URL(request.url);
  const adId = searchParams.get("id");
  const body = await request.json();

  const { data, error } = await supabase
    .from("ad_library")
    .update({ tags: body.tags, notes: body.notes, platform: body.platform })
    .eq("id", adId)
    .eq("user_id", user.id)
    .select("*")
    .single();

  if (error) return new Response("DB error: " + error.message, { status: 500 });

  return Response.json({ ad: data });
}
