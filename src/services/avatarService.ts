import { supabase } from "@/integrations/supabase/client";

const BUCKET = "avatars";
const AVATAR_URL_KEY = "avatar_cloud_url";

export async function uploadAvatar(userId: string | number, file: File): Promise<string> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/avatar.${ext}`;

  // Upload (upsert) to storage
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true, cacheControl: "0" });

  if (error) throw error;

  // Get public URL
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  // Add cache-bust param
  const url = `${data.publicUrl}?t=${Date.now()}`;

  // Persist URL locally as fallback
  localStorage.setItem(AVATAR_URL_KEY, url);

  return url;
}

export function getSavedAvatarUrl(): string | null {
  return localStorage.getItem(AVATAR_URL_KEY) || localStorage.getItem("avatar_base64") || null;
}
